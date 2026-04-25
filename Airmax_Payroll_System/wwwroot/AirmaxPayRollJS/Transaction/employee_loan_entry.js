// Path: wwwroot/AirmaxPayRollJS/Transaction/employee_loan_entry.js

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
});

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



    const btnReschedule = document.getElementById('btnReschedule');
    if (btnReschedule) {
        btnReschedule.classList.remove('d-none'); // show it
    }
    // 🔥 Updated Installments Grid with Status, IsExtended and Skip Logic
    if (m.details) {
        // ✅ Check if skip limit already used (any Extended row exists = limit reached)
        const skipLimitReached = m.details.some(d => d.isExtended === true || d.isExtended === 1 || d.status === 'Extended' || d.status === 'Skipped');

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
                                    onclick="skipMonth(${item.idEmployeeLoanDetails})" title="Skip Month">
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

            return `
            <tr class="align-middle">
                <td class="text-center">${index + 1}</td>
                <td class="text-center fw-bold">${item.month}</td>
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

async function generateLoanNo() {
    const res = await apiFetch(`${API}/generate-no`);
    const json = await res.json();
    if (json.success) DOM.loanNo().value = json.data;
}

async function loadDivisions() {
    const res = await apiFetch("/api/transaction/kharchi/get-divisions-with-count");
    const json = await res.json();
    if (json.success) {
        DOM.division().innerHTML = `<option value="">Select Division</option>` +
            json.data.map(d => `<option value="${d.idDivision || d.IDDivision}">${d.divisionName || d.DivisionName}</option>`).join("");
        $(DOM.division()).selectpicker('refresh');
    }
}

window.loadDepartments = async function () {
    const divId = DOM.division().value;
    const ddl = DOM.department();
    ddl.innerHTML = '<option value="">Select Department</option>';
    DOM.employee().innerHTML = '<option value="">Select Employee</option>';
    if (!divId) return;

    const res = await apiFetch(`/api/transaction/kharchi/get-departments/${divId}?month=0&year=0`);
    const json = await res.json();
    if (json.success) {
        ddl.innerHTML += json.data.map(d => `<option value="${d.idDepartment || d.IDDepartment}">${d.departmentName || d.DepartmentName}</option>`).join("");
        $(DOM.department()).selectpicker('refresh');

    }
}

window.loadEmployees = async function () {
    const deptId = DOM.department().value;
    const ddl = DOM.employee();
    ddl.innerHTML = '<option value="">Select Employee</option>';
    if (!deptId) return;


    // ✅ Called when employee dropdown changes — checks for existing active loan
    window.onEmployeeChange = async function () {
        const loanId = parseInt(DOM.id().value) || 0;
        if (loanId > 0) return; // Edit mode — skip check

        const empId = parseInt(DOM.employee().value);
        if (!empId) return;

        const res = await apiFetch(`${API}/check-active/${empId}`);
        const json = await res.json();

        if (!json.success) {
            // ✅ Warn user immediately on selection
            Swal.fire({
                icon: 'warning',
                title: 'Active Loan Exists',
                text: json.message,
                confirmButtonColor: '#d33'
            });
            DOM.employee().value = ""; // reset selection
        }
    }
// get the employee deparment wise 
    const res = await apiFetch(`/api/master/employee/by-department/${deptId}`);
    const json = await res.json();
    if (json.success) {
        ddl.innerHTML += json.data.map(emp => `<option value="${emp.idEmployee}">${emp.employeeName}</option>`).join("");
        $(DOM.employee()).selectpicker('refresh');
    }
}

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

    const startDate = new Date(startValue);
    let currentMonth = startDate.getMonth();
    let currentYear = startDate.getFullYear();

    let html = "";
    for (let i = 0; i < installmentCount; i++) {
        const displayAmt = (i === installmentCount - 1) ? lastInstallment : baseInstallment.toFixed(2);
        html += `
            <tr>
                <td>${i + 1}</td>
                <td class="text-center">${currentMonth + 1}</td>
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

window.calculateTotal = function () {
    let total = 0;
    document.querySelectorAll(".inst-amt").forEach(input => total += parseFloat(input.value) || 0);
    DOM.totalLabel().innerText = total.toFixed(2);
}

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
        const month = parseInt(row.cells[1].innerText);
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
