// Path: wwwroot/AirmaxPayRollJS/Transaction/employee_loan_schedule.js

document.addEventListener("DOMContentLoaded", async () => {
    await loadSchedDivisions();
});

// 1. Load Divisions
async function loadSchedDivisions() {
    const res = await apiFetch("/api/transaction/kharchi/get-divisions-with-count");
    const json = await res.json();
    if (json.success) {
        document.getElementById("schedDiv").innerHTML = `<option value="">-- Select Division --</option>` +
            json.data.map(d => `<option value="${d.idDivision || d.IDDivision}">${d.divisionName || d.DivisionName}</option>`).join("");
    }
}

// 2. Load Departments when Division changes
async function onSchedDivChange() {
    const divId = document.getElementById("schedDiv").value;
    const deptDdl = document.getElementById("schedDept");
    deptDdl.innerHTML = '<option value="">-- Select Department --</option>';

    if (!divId) return;

    // Use your existing department fetcher (pass 0 for IDLocation if not needed)
    const res = await apiFetch(`/api/master/department/get-all?idCompany=0&idLocation=0&idDepartment=0`);
    const json = await res.json();
    if (json.success) {
        // Filter departments by selected division if your API supports it, otherwise load all
        deptDdl.innerHTML += json.data.map(d => `<option value="${d.idDepartment || d.IDDepartment}">${d.departmentName || d.DepartmentName}</option>`).join("");
    }
}

// 3. Load Employees when Department changes
async function onSchedDeptChange() {
    const deptId = document.getElementById("schedDept").value;
    const empDdl = document.getElementById("schedEmp");
    empDdl.innerHTML = '<option value="">-- Select Employee --</option>';

    if (!deptId) return;

    const res = await apiFetch(`/api/master/employee/by-department/${deptId}`);
    const json = await res.json();
    if (json.success) {
        empDdl.innerHTML += json.data.map(e => `<option value="${e.idEmployee || e.IDEmployee}">${e.employeeName || e.EmployeeName}</option>`).join("");
    }
}

// 4. Load Loans when Employee changes
async function onSchedEmpChange() {
    const empId = document.getElementById("schedEmp").value;
    const loanDdl = document.getElementById("schedLoan");
    loanDdl.innerHTML = '<option value="">-- Select Loan --</option>';

    if (!empId) return;

    const res = await apiFetch(`/api/transaction/employee-loan/by-employee/${empId}`);
    const json = await res.json();
    if (json.success) {
        loanDdl.innerHTML += json.data.map(l => `<option value="${l.idEmployeeLoan || l.IDEmployeeLoan}">${l.loanNo || l.LoanNo}</option>`).join("");
    }
}

// 5. Fetch and Render Schedule
async function showSchedule() {
    const loanId = document.getElementById("schedLoan").value;
    if (!loanId) {
        showToast("warning", "Please select a Loan Number first.");
        return;
    }

    const res = await apiFetch(`/api/transaction/employee-loan/get-schedule/${loanId}`);
    const json = await res.json();

    if (json.success) {
        renderScheduleGrid(json.header, json.details);
    }
}

function renderScheduleGrid(h, list) {
    // Show the header info
    document.getElementById("schedInfoBox").classList.remove("d-none");
    document.getElementById("lblLoanNo").innerText = h.LoanNo || h.loanNo;
    document.getElementById("lblPrincipal").innerText = "₹" + Number(h.LoanAmount || h.loanAmount).toLocaleString();
    document.getElementById("lblPaid").innerText = `${h.EmisPaid || h.emisPaid}/${h.TotalInstallments || h.totalInstallments} Paid`;
    document.getElementById("lblOutstanding").innerText = "₹" + Number(h.OutstandingAmount || h.outstandingAmount).toLocaleString();

    // Render Table
    const tbody = document.getElementById("schedTableBody");
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No schedule details found.</td></tr>';
        return;
    }

    tbody.innerHTML = list.map((item, index) => {
        const date = item.Date || item.date;
        const amount = item.InstallmentAmount || item.installmentAmount;
        const status = item.Status || item.status;
        const ref = item.DeductionRef || item.deductionRef || "-";

        return `
        <tr>
            <td class="text-center">${index + 1}</td>
            <td class="fw-bold">${new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', day: '2-digit' })}</td>
            <td class="fw-bold text-primary">₹${Number(amount).toLocaleString()}</td>
            <td>
                <span class="badge ${status === 'Paid' ? 'bg-success-light text-success' : 'bg-light text-dark'} rounded-pill px-3">
                    ${status}
                </span>
            </td>
            <td class="text-muted small">${ref}</td>
        </tr>`;
    }).join("");
}
