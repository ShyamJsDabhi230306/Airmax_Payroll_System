
const API = "/api/transaction/employee-loan";
let companyLoanLimit = 0;
let myCompanyName = "";
const DOM = {
    id: () => document.getElementById("IDEmployeeLoan"),
    loanNo: () => document.getElementById("LoanNo"),
    date: () => document.getElementById("Date"),
    division: () => document.getElementById("IDDivision"),
    department: () => document.getElementById("IDDepartment"),
    employee: () => document.getElementById("IDEmployee"),
    guarantors: () => document.getElementById("IDGuarantors"),
    loanAmount: () => document.getElementById("LoanAmount"),
    totalInstallments: () => document.getElementById("TotalInstallments"),
    installmentAmount: () => document.getElementById("InstallmentAmount"),
    startingDate: () => document.getElementById("InstallmentStartingDate"),
    grid: () => document.getElementById("tblLoanBody"),
    totalLabel: () => document.getElementById("lblTotalAmount"),
    save: () => document.getElementById("btnSave")
};

document.addEventListener("DOMContentLoaded", async () => {
    await loadDivisions();

    // Check if we are in EDIT mode (URL has ?id=X)
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id && id > 0) {
        await loadExistingData(id);
    } else {
        // NEW MODE: Generate a new Loan Number and set default date
        DOM.date().value = new Date().toISOString().split('T')[0];
        await generateLoanNo();
    }
    // Fetch the company's loan limit on load
    const limitRes = await apiFetch("/api/master/configuration/get-my-company-limit");
    const limitJson = await limitRes.json();
    if (limitJson.success) {
        companyLoanLimit = parseFloat(limitJson.limit);
        myCompanyName = limitJson.companyName;
    }
    
    // for select date only from today or future
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("InstallmentStartingDate").setAttribute("min", today);
});
// update updateInstallmentAmount  function so this is work like this way 
window.updateInstallmentAmount = function () {
    const loanAmount = parseFloat(DOM.loanAmount().value) || 0;
    const installments = parseInt(DOM.totalInstallments().value) || 0;
    if (loanAmount > 0 && installments > 0) {
        const baseInstallment = Math.floor((loanAmount / installments) * 100) / 100;
        DOM.installmentAmount().value = baseInstallment.toFixed(2);
    } else {
        DOM.installmentAmount().value = "0.00";
    }
};



// ✅ ADD THIS AT THE VERY BOTTOM OF THE FILE
window.onLoanAmountChange = function () {
    const amount = parseFloat(DOM.loanAmount().value) || 0;
    if (companyLoanLimit > 0 && amount > companyLoanLimit) {
        Swal.fire({
            icon: 'warning',
            title: 'Limit Exceeded',
            text: `${myCompanyName} only allows loans up to ₹ ${companyLoanLimit.toLocaleString('en-IN')}.`,
            confirmButtonColor: '#3085d6'
        });
        DOM.loanAmount().value = "";
    }
    updateInstallmentAmount();
};
// loadExistingData function which is used in the edit and so many where 
async function loadExistingData(id) {
    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await res.json();
    if (!json.success) return;

    const m = json.data;
    DOM.id().value = m.idEmployeeLoan;
    DOM.loanNo().value = m.loanNo;
    DOM.date().value = m.date ? m.date.split('T')[0] : "";
    DOM.loanAmount().value = m.loanAmount;
    DOM.totalInstallments().value = m.totalInstallments;
    DOM.installmentAmount().value = m.installmentAmount || (m.loanAmount / m.totalInstallments).toFixed(2);
    DOM.startingDate().value = m.installmentStartingDate ? m.installmentStartingDate.split('T')[0] : "";

    DOM.division().value = m.idDivision || "";
    $(DOM.division()).selectpicker('refresh');
    await loadDepartments();
    DOM.department().value = m.idDepartment;
    $(DOM.department()).selectpicker('refresh');
    await loadEmployees();
    DOM.employee().value = m.idEmployee;
    $(DOM.employee()).selectpicker('refresh');

    // this is the select employeee using checkbox 
    const selectedGuarantors = [];
    if (m.idGuarantor1 && m.idGuarantor1 > 0) selectedGuarantors.push(m.idGuarantor1);
    if (m.idGuarantor2 && m.idGuarantor2 > 0) selectedGuarantors.push(m.idGuarantor2);
    if (m.idGuarantor3 && m.idGuarantor3 > 0) selectedGuarantors.push(m.idGuarantor3);

    $(DOM.guarantors()).selectpicker('val', selectedGuarantors);
    

    const btnReschedule = document.getElementById('btnReschedule');
    if (btnReschedule) {
        btnReschedule.classList.remove('d-none'); // show it
    }
    // 🔥 Updated Installments Grid with Status, IsExtended and Skip Logic
    if (m.details) {
        // ✅ Check if skip limit already used (any Extended row exists = limit reached)
        const skipLimitReached = m.details.some(d => d.isExtended === true || d.isExtended === 1 || d.status === 'Extended' || d.status === 'Skipped');

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        DOM.grid().innerHTML = m.details.map((item, index) => {
            // Determine badge color based on status
            let badgeClass = "bg-warning text-dark"; // Pending
            if (item.status === 'Paid')      badgeClass = "bg-success";
            if (item.status === 'Skipped')   badgeClass = "bg-secondary";
            if (item.status === 'Extended')  badgeClass = "bg-info";

            // Check BOTH isExtended flag (DB column) AND status — double protection
            const isExtendedRow = item.isExtended === true || item.isExtended === 1 || item.status === 'Extended';

            // Input is editable only for original Pending rows (not extended)
            const isInputDisabled = item.status !== 'Pending' || isExtendedRow;

            // Determine action column content
            let actionHtml = '';
            if (item.status === 'Pending' && !isExtendedRow) {
                if (skipLimitReached) {
                    // ✅ Skip limit already used — show disabled button with tooltip
                    actionHtml = `<button type="button" class="btn btn-secondary btn-xs px-2" disabled title="Skip limit exceeded. Only 1 skip allowed per loan.">
                                    <i class="fa fa-ban"></i> Skip Limit Over
                                  </button>`;
                } else {
                    // ✅ Original Pending and no skip used yet — show Skip button
                    actionHtml = `<button type="button" class="btn btn-danger btn-xs px-2" 
                                    onclick="skipMonth(${item.IDEmployeeLoanDetails})" title="Skip Month">
                                    <i class="fa fa-fast-forward"></i> Skip  
                                  </button>`;
                }
            } else if (isExtendedRow) {
                // Extended month — show Extended badge only, NO skip
                actionHtml = `<span class="badge bg-info text-white px-2 py-1">Extended</span>`;
            } else {
                // Paid or Skipped — show Locked
                actionHtml = `<small class="text-muted">Locked</small>`;
            }

            // Convert numeric month to name
            const mName = (item.month >= 1 && item.month <= 12) ? monthNames[item.month - 1] : item.month;

            return `
            <tr class="align-middle">
                <td class="text-center">${index + 1}</td>
                <td class="text-center fw-bold" data-month="${item.month}">${mName}</td>
                <td class="text-center fw-bold">${item.year}</td>
                <td>
                    <input type="number" class="form-control text-end inst-amt" 
                           value="${item.installmentAmount}" 
                           onchange="calculateTotal()" 
                           ${isInputDisabled ? 'disabled' : ''} />
                </td>
                <td class="text-center">
                    <span class="badge ${badgeClass}">${item.status || 'Pending'}</span>
                </td>
                <td class="text-center">
                    ${actionHtml}
                </td>
            </tr>`;
        }).join("");
    }
    calculateTotal();
}
// it is generate loan number in small code 
async function generateLoanNo() {
    const res = await apiFetch(`${API}/generate-no`);
    const json = await res.json();
    if (json.success) DOM.loanNo().value = json.data;
}
// loading division from api
async function loadDivisions() {
    const res = await apiFetch("/api/transaction/kharchi/get-divisions-with-count");
    const json = await res.json();
    if (json.success) {
        DOM.division().innerHTML = `<option value="">Select Division</option>` +
            json.data.map(d => `<option value="${d.idDivision || d.IDDivision}">${d.divisionName || d.DivisionName}</option>`).join("");
        $(DOM.division()).selectpicker('refresh');
    }
}



// loading the deparment perfectly 
window.loadDepartments = async function () {
    const divId = DOM.division().value;
    const ddl = DOM.department();

    // Clear everything when division changes
    ddl.innerHTML = '<option value="">Select Department</option>';
    DOM.employee().innerHTML = '<option value="">Select Employee</option>';
    DOM.guarantors().innerHTML = '';
    if (!divId) {
        $(ddl).selectpicker('refresh');
        $(DOM.employee()).selectpicker('refresh');
        $(DOM.guarantors()).selectpicker('refresh');
        return;
    }
    // A. Load Departments normally
    const resDept = await apiFetch(`/api/transaction/kharchi/get-departments/${divId}?month=0&year=0`);
    const jsonDept = await resDept.json();
    if (jsonDept.success) {
        ddl.innerHTML += jsonDept.data.map(d => `<option value="${d.idDepartment || d.IDDepartment}">${d.departmentName || d.DepartmentName}</option>`).join("");
        $(ddl).selectpicker('refresh');
    }
    // B. Load Guarantors (Location-wise)
    const resEmp = await apiFetch(`/api/master/employee/get-all`);
    const jsonEmp = await resEmp.json();

    if (jsonEmp.success) {
        const sampleEmp = jsonEmp.data.find(e => (e.idDivision || e.IDDivision) == divId);
        let html = '';
        if (sampleEmp) {
            const locId = sampleEmp.idLocation || sampleEmp.IDLocation;
            // Grab everyone in this Location
            const locationEmps = jsonEmp.data.filter(e => (e.idLocation || e.IDLocation) == locId);

            html += locationEmps.map(emp => {
                const name = emp.employeeName || emp.EmployeeName;
                const code = emp.employeeCode || emp.EmployeeCode;
                const id = emp.idEmployee || emp.IDEmployee;
                const content = `<div class='row m-0 align-items-center' style='min-width: 320px;'>
                                    <div class='col-8 text-start fw-bold text-truncate px-1'>${name}</div>
                                    <div class='col-4 text-end px-1'><span class='badge bg-light text-dark border'>${code}</span></div>
                                 </div>`;
                return `<option value="${id}" title="${name}" data-content="${content}">${name}</option>`;
            }).join("");
        }
        DOM.guarantors().innerHTML = html;
        $(DOM.guarantors()).selectpicker('refresh');
    }
}
// load employee  division and deparment wiswe 
window.loadEmployees = async function () {
    const deptId = DOM.department().value;
    const divId = DOM.division().value || 0;
    const ddl = DOM.employee();
    let html = '<option value="">Select Employee</option>';
    if (!deptId) {
        ddl.innerHTML = html;
        $(ddl).selectpicker('refresh');
        return;
    }
    // Calls your exact API that strictly filters by Division AND Department
    const res = await apiFetch(`/api/master/employee/by-department/${deptId}?divId=${divId}`);
    const json = await res.json();
    if (json.success) {
        html += json.data.map(emp => {
            const content = `<div class='row m-0 align-items-center' style='min-width: 320px;'>
                                <div class='col-8 text-start fw-bold text-truncate px-1'>${emp.employeeName}</div>
                                <div class='col-4 text-end px-1'><span class='badge bg-light text-dark border'>${emp.employeeCode}</span></div>
                             </div>`;

            return `<option value="${emp.idEmployee}" title="${emp.employeeName}" data-content="${content}">${emp.employeeName}</option>`;
        }).join("");
        ddl.innerHTML = html;
        $(ddl).selectpicker('refresh');
    }
}
// ✅ 2. On Employee Change Function (Must be outside!)
window.onEmployeeChange = async function () {
    try {
        const loanId = parseInt(DOM.id().value) || 0;
        if (loanId > 0) return; // Edit mode — skip check

        const empId = parseInt(DOM.employee().value);
        if (!empId) return;

        const res = await apiFetch(`${API}/check-active/${empId}`);
        const json = await res.json();

        if (!json.success) {
            // Warn user immediately on selection
            Swal.fire({
                icon: 'warning',
                title: 'Active Loan Exists',
                text: json.message,
                confirmButtonColor: '#d33'
            });

            // 👉 Properly reset the Bootstrap Selectpicker!
            $(DOM.employee()).val('');
            $(DOM.employee()).selectpicker('refresh');
        }
    } catch (e) {
        console.error(e);
    }
}



// generate installment using function 
window.generateInstallments = function () {
    const totalAmount = parseFloat(DOM.loanAmount().value) || 0;
    const installmentCount = parseInt(DOM.totalInstallments().value) || 0;
    const startValue = DOM.startingDate().value;

    if (totalAmount <= 0 || installmentCount <= 0 || !startValue) {
        showToast("warning", "Please enter Amount, Total Installments, and Starting Date");
        return;
    }

    const baseInstallment = Math.floor((totalAmount / installmentCount) * 100) / 100;
    const totalAllocated = baseInstallment * (installmentCount - 1);
    const lastInstallment = (totalAmount - totalAllocated).toFixed(2);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const startDate = new Date(startValue);
    let currentMonth = startDate.getMonth(); // 0-11
    let currentYear = startDate.getFullYear();

    let html = "";
    for (let i = 0; i < installmentCount; i++) {
        const displayAmt = (i === installmentCount - 1) ? lastInstallment : baseInstallment.toFixed(2);
        const mName = monthNames[currentMonth];

        html += `
            <tr>
                <td>${i + 1}</td>
                <td class="text-center" data-month="${currentMonth + 1}">${mName}</td>
                <td class="text-center">${currentYear}</td>
                <td><input type="number" class="form-control text-end inst-amt" value="${displayAmt}" onchange="calculateTotal()" /></td>
                <td class="text-center"><button type="button" class="btn btn-danger btn-xs" onclick="this.closest('tr').remove(); calculateTotal();">X</button></td>
            </tr>
        `;

        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    }
    DOM.grid().innerHTML = html;
    calculateTotal();
}
// calculation  which is use in the intallment 
window.calculateTotal = function () {
    let total = 0;
    document.querySelectorAll(".inst-amt").forEach(input => total += parseFloat(input.value) || 0);
    DOM.totalLabel().innerText = total.toFixed(2);
}
// save data function  which is save the all loan 
window.saveData = async function () {
    const loanAmount = parseFloat(document.getElementById("LoanAmount").value) || 0;
    if (companyLoanLimit === 0) {
        const limitRes = await apiFetch("/api/master/configuration/get-my-company-limit");
        const limitJson = await limitRes.json();
        if (limitJson.success) {
            companyLoanLimit = parseFloat(limitJson.limit);
            myCompanyName = limitJson.companyName;
        }
    }
    // ✅ Now check — limit is guaranteed to be loaded
    if (companyLoanLimit > 0 && loanAmount > companyLoanLimit) {
        Swal.fire({
            icon: 'warning',
            title: 'Limit Exceeded',
            text: `${myCompanyName} only allows loans up to ₹ ${companyLoanLimit.toLocaleString('en-IN')}.`,
            confirmButtonColor: '#3085d6'
        });
        return;  // ✅ stops here — SP never called
    }

    const details = [];
    document.querySelectorAll("#tblLoanBody tr").forEach(row => {
        const monthCell = row.cells[1];
        const month = parseInt(monthCell.getAttribute("data-month")) || parseInt(monthCell.innerText);
        const year = parseInt(row.cells[2].innerText);
        details.push({
            Month: month,
            Year: year,
            Date: `${year}-${String(month).padStart(2, '0')}-01`,
            InstallmentAmount: parseFloat(row.querySelector(".inst-amt").value) || 0,
            Status: "Pending"
        });
    });

    if (details.length === 0) { showToast("warning", "Generate installments first!"); return; }
    const gList = $(DOM.guarantors()).val() || [];
    const dto = {
        IDEmployeeLoan: parseInt(DOM.id().value) || 0,
        LoanNo: DOM.loanNo().value,
        Date: DOM.date().value,
        IDEmployee: parseInt(DOM.employee().value),
        IDDepartment: parseInt(DOM.department().value),
        IDDivision: parseInt(DOM.division().value),
        LoanAmount: parseFloat(DOM.loanAmount().value),
        TotalInstallments: parseInt(DOM.totalInstallments().value),
        InstallmentAmount: parseFloat(DOM.installmentAmount().value) || 0,
        InstallmentStartingDate: DOM.startingDate().value,

        // this is for select employee for granteen employee 
        IDGuarantor1: gList.length > 0 ? parseInt(gList[0]) : null,
        IDGuarantor2: gList.length > 1 ? parseInt(gList[1]) : null,
        IDGuarantor3: gList.length > 2 ? parseInt(gList[2]) : null,
        Details: details
    };

    DOM.save().disabled = true;
    try {
        const res = await apiFetch(`${API}/save`, { method: "POST", body: JSON.stringify(dto) });
        const json = await res.json();
        if (json.success) {
            showToast("success", "Loan saved successfully");
            window.location.href = "/Transaction/EmployeeLoanList";
        } else { showToast("error", json.message); }
    } catch (e) { showToast("error", "Save failed"); } finally { DOM.save().disabled = false; }
};

// 1. Skip Month Function
window.skipMonth = async function (idDetail) {
    const result = await Swal.fire({
        title: 'Skip Month?',
        text: "This month will be marked as Skipped and the loan will be extended by 1 month.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Skip it!'
    });

    if (result.isConfirmed) {
        const res = await apiFetch(`${API}/skip-month`, {
            method: "POST",
            body: JSON.stringify({ IDEmployeeLoanDetails: idDetail })
        });
        const json = await res.json();
        if (json.success) {
            Swal.fire('Success', json.message, 'success').then(() => location.reload());
        } else {
            Swal.fire('Error', json.message, 'error');
        }
    }
}

// 2. Reschedule Loan (EMI Increase / Early Closure)
// Reschedule Loan — employee wants to close loan in fewer months
window.rescheduleLoan = async function () {
    const loanId = parseInt(DOM.id().value);
    if (!loanId || loanId === 0) {
        showToast("warning", "Please save the loan first before rescheduling!");
        return;
    }

    const { value: months } = await Swal.fire({
        title: 'Reschedule Loan',
        input: 'number',
        inputLabel: 'Enter number of remaining months to clear loan',
        inputPlaceholder: 'Example: 4',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value || value <= 0) {
                return 'Please enter a valid number of months!'
            }
        }
    });

    if (months) {
        const res = await apiFetch(`${API}/reschedule`, {
            method: "POST",
            body: JSON.stringify({
                IDEmployeeLoan: loanId,
                NewRemainingMonths: parseInt(months)
            })
        });
        const json = await res.json();
        if (json.success) {
            Swal.fire('Rescheduled!', json.message, 'success')
                .then(() => location.reload());
        } else {
            Swal.fire('Failed', json.message, 'error');
        }
    }
}

// search for is it have other loan or not so this is the way it is work 
window.onGuarantorChange = async function () {
    const applicantId = DOM.employee().value;
    const guarantors = $(DOM.guarantors()).val() || [];

    // 1. Cannot be their own guarantor
    if (applicantId && guarantors.includes(applicantId)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Guarantor',
            text: 'An employee cannot be a guarantor for their own loan!',
            confirmButtonColor: '#d33'
        });
        const fixedGuarantors = guarantors.filter(id => id !== applicantId);
        $(DOM.guarantors()).selectpicker('val', fixedGuarantors);
        return;
    }

    // 2. Check Database Eligibility (Checks BOTH rules via the SP)
    for (const gId of guarantors) {
        const res = await apiFetch(`${API}/check-guarantor-eligibility/${gId}`);
        const json = await res.json();

        if (!json.success) {
            Swal.fire({
                icon: 'error',
                title: 'Guarantor Not Eligible',
                text: json.message, // Shows the exact message from your SQL SP!
                confirmButtonColor: '#d33'
            });

            // Instantly uncheck this invalid person
            const fixedGuarantors = guarantors.filter(id => id !== gId);
            $(DOM.guarantors()).selectpicker('val', fixedGuarantors);
            return;
        }
    }
}
 
