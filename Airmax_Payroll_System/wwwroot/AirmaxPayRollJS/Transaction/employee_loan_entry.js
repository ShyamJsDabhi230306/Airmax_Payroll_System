// Path: wwwroot/AirmaxPayRollJS/Transaction/employee_loan_entry.js

const API = "/api/transaction/employee-loan";

const DOM = {
    id: () => document.getElementById("IDEmployeeLoan"),
    loanNo: () => document.getElementById("LoanNo"),
    date: () => document.getElementById("Date"),
    department: () => document.getElementById("IDDepartment"),
    employee: () => document.getElementById("IDEmployee"),
    loanAmount: () => document.getElementById("LoanAmount"),
    totalInstallments: () => document.getElementById("TotalInstallments"),
    startingDate: () => document.getElementById("InstallmentStartingDate"),
    grid: () => document.getElementById("tblLoanBody"),
    totalLabel: () => document.getElementById("lblTotalAmount"),
    save: () => document.getElementById("btnSave")
};

document.addEventListener("DOMContentLoaded", async () => {
    await loadDepartments();

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
});

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
    DOM.startingDate().value = m.installmentStartingDate ? m.installmentStartingDate.split('T')[0] : "";

    DOM.department().value = m.idDepartment;
    await loadEmployees(); // Load employees for this department
    DOM.employee().value = m.idEmployee;

    // Load Installments Grid
    if (m.details) {
        DOM.grid().innerHTML = m.details.map((item, index) => `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${item.month}</td>
                <td class="text-center">${item.year}</td>
                <td><input type="number" class="form-control text-end inst-amt" value="${item.installmentAmount}" onchange="calculateTotal()" /></td>
                <td class="text-center"><button type="button" class="btn btn-danger btn-xs" onclick="this.closest('tr').remove(); calculateTotal();">X</button></td>
            </tr>
        `).join("");
    }
    calculateTotal();
}

async function generateLoanNo() {
    const res = await apiFetch(`${API}/generate-no`);
    const json = await res.json();
    if (json.success) DOM.loanNo().value = json.data;
}

window.loadEmployees = async function () {
    const deptId = DOM.department().value;
    const ddl = DOM.employee();
    ddl.innerHTML = '<option value="">Select Employee</option>';
    if (!deptId) return;

    const res = await apiFetch(`/api/master/employee/by-department/${deptId}`);
    const json = await res.json();
    if (json.success) {
        ddl.innerHTML += json.data.map(emp => `<option value="${emp.idEmployee}">${emp.employeeName}</option>`).join("");
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
        LoanAmount: parseFloat(DOM.loanAmount().value),
        TotalInstallments: parseInt(DOM.totalInstallments().value),
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
}

async function loadDepartments() {
    const res = await apiFetch("/api/master/department/get-all");
    const json = await res.json();
    if (json.success) {
        DOM.department().innerHTML = `<option value="">Select Department</option>` +
            json.data.map(d => `<option value="${d.idDepartment}">${d.departmentName}</option>`).join("");
    }
}
