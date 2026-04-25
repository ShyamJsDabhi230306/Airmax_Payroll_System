// Path: wwwroot/AirmaxPayRollJS/Transaction/employee_loan_schedule.js

$(document).ready(function () {
    loadDivisions();
    loadEmployeesWithLoans(); // Loads everyone immediately
});

// 1. Load the Divisions
async function loadDivisions() {
    try {
        const res = await apiFetch("/api/transaction/kharchi/get-divisions-with-count");
        const json = await res.json();
        if (json.success) {
            let html = `<option value="0">All Divisions</option>`;
            json.data.forEach(d => {
                html += `<option value="${d.idDivision || d.IDDivision}">${d.divisionName || d.DivisionName}</option>`;
            });
            $("#IDDivision").html(html);
        }
    } catch (e) { console.error(e); }
}

// 2. Load the Employees (Only those with loans)
async function loadEmployeesWithLoans() {
    const divId = $("#IDDivision").val() || 0;
    const search = $("#txtSearch").val() || "";
    const empDdl = $("#IDEmployeeLoan");

    empDdl.html('<option value="">Searching...</option>');

    try {
        // We call the API with id=0 to get the searchable list
        const res = await apiFetch(`/api/transaction/employee-loan/by-employee/0?idDivision=${divId}&search=${search}`);
        const json = await res.json();

        if (json.success && json.data && json.data.length > 0) {
            let html = '<option value="">-- Select Employee Record --</option>';
            json.data.forEach(l => {
                html += `<option value="${l.idEmployeeLoan || l.IDEmployeeLoan}">${l.loanNo || l.LoanNo}</option>`;
            });
            empDdl.html(html);
        } else {
            empDdl.html('<option value="">No loan records found</option>');
        }
    } catch (e) {
        empDdl.html('<option value="">Error loading data</option>');
    }
}

// 3. Show the Schedule Table
async function showSchedule() {
    const loanId = $("#IDEmployeeLoan").val();
    if (!loanId || loanId == "") {
        showToast("warning", "Please select an employee record from the list.");
        return;
    }

    try {
        const res = await apiFetch(`/api/transaction/employee-loan/get-schedule/${loanId}`);
        const json = await res.json();
        if (json.success && json.header) {
            renderGrid(json.header, json.details);
        } else {
            showToast("error", "Loan details not found.");
        }
    } catch (e) { showToast("error", "Server error."); }
}

function renderGrid(h, list) {
    $("#schedArea").removeClass("d-none");

    // Support both Capital/Small casing from DB
    $("#lblLoanNo").text(h.LoanNo || h.loanNo || "--");
    $("#lblPrincipal").text("₹" + Number(h.LoanAmount || h.loanAmount || 0).toLocaleString());
    $("#lblPaid").text(`${h.EmisPaid || h.emisPaid || 0}/${h.TotalInstallments || h.totalInstallments || 0} Paid`);
    $("#lblOutstanding").text("₹" + Number(h.OutstandingAmount || h.outstandingAmount || 0).toLocaleString());

    let html = "";
    if (!list || list.length === 0) {
        html = '<tr><td colspan="5" class="text-center py-4">No installments found.</td></tr>';
    } else {
        list.forEach((item, index) => {
            const date = item.Date || item.date;
            const amt = item.InstallmentAmount || item.installmentAmount;
            const status = item.Status || item.status;
            const ref = item.DeductionRef || item.deductionRef || "-";

            html += `<tr>
                <td class="text-center fw-bold text-muted">${index + 1}</td>
                <td class="fw-bold">${new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                <td class="fw-bold text-primary">₹${Number(amt).toLocaleString()}</td>
                <td><span class="badge ${status === 'Paid' ? 'bg-success' : 'bg-light text-dark'} px-3 rounded-pill">${status}</span></td>
                <td class="text-muted small">${ref}</td>
            </tr>`;
        });
    }
    $("#schedTableBody").html(html);
}
