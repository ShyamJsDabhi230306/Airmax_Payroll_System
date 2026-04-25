const API = "/api/transaction/employee-loan";

document.addEventListener("DOMContentLoaded", async () => {
    await loadDivisions();
    loadDashboard();
});

// Replace the loadDivisions function in employee_loan_dashboard.js with this:
async function loadDivisions() {
    const res = await apiFetch("/api/transaction/kharchi/get-divisions-with-count");
    const json = await res.json();
    if (json.success) {
        // We check for both d.idDivision (small) and d.IDDivision (capital)
        document.getElementById("filterDiv").innerHTML = `<option value="0">All Divisions</option>` +
            json.data.map(d => {
                const id = d.idDivision || d.IDDivision;
                const name = d.divisionName || d.DivisionName;
                return `<option value="${id}">${name}</option>`;
            }).join("");
    }
}


async function loadDashboard() {
    const divId = document.getElementById("filterDiv").value;
    const status = document.getElementById("filterStatus").value;
    const search = document.getElementById("searchEmp").value;

    const res = await apiFetch(`${API}/get-dashboard?idDivision=${divId}&status=${status}`);
    const json = await res.json();

    if (json.success) {
        renderStats(json.stats);
        renderCards(json.data, search);
    }
}

function renderStats(s) {
    if (!s) return;
    const active = s.ActiveLoans || s.activeLoans || 0;
    const disbursed = s.TotalDisbursed || s.totalDisbursed || 0;
    const outstanding = s.TotalOutstanding || s.totalOutstanding || 0;
    const recovered = s.TotalRecovered || s.totalRecovered || 0;

    document.getElementById("statsContainer").innerHTML = `
        <div class="col-md-3">
            <div class="card border-0 shadow-sm p-3">
                <small class="text-muted fw-bold x-small text-uppercase">Active Loans</small>
                <h3 class="fw-bold mb-0">${active}</h3>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm p-3">
                <small class="text-muted fw-bold x-small text-uppercase">Total Disbursed</small>
                <h3 class="fw-bold mb-0">₹${Number(disbursed).toLocaleString()}</h3>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm p-3 text-danger">
                <small class="text-muted fw-bold x-small text-uppercase">Outstanding</small>
                <h3 class="fw-bold mb-0">₹${Number(outstanding).toLocaleString()}</h3>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm p-3 text-success">
                <small class="text-muted fw-bold x-small text-uppercase">Recovered</small>
                <h3 class="fw-bold mb-0">₹${Number(recovered).toLocaleString()}</h3>
            </div>
        </div>`;
}

function renderCards(data, searchTerm = "") {
    const container = document.getElementById("loanCards");
    const filtered = data.filter(d =>
        (d.EmployeeName || d.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.LoanNo || d.loanNo || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) {
        container.innerHTML = '<div class="text-center py-5 text-muted">No records found.</div>';
        return;
    }

    container.innerHTML = filtered.map(loan => {
        const name = loan.EmployeeName || loan.employeeName || "Unknown";
        const loanNo = loan.LoanNo || loan.loanNo || "N/A";
        const progress = loan.Progress || loan.progress || 0;
        const eBy = loan.E_By || loan.eBy || "System";
        const eDate = loan.E_Date ? new Date(loan.E_Date).toLocaleDateString() : "N/A";

        return `
        <div class="card border-0 shadow-sm mb-3">
            <div class="card-body p-3">
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <div class="d-flex align-items-center gap-2">
                            <div class="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center" style="width:40px; height:40px">${name[0]}</div>
                            <div>
                                <h6 class="fw-bold mb-0">${name}</h6>
                                <small class="text-muted">${loan.DivisionName || loan.divisionName} | ${loan.DepartmentName || loan.departmentName}</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2 text-center">
                        <span class="badge ${loan.IsClose == 1 ? 'bg-danger' : 'bg-success'} rounded-pill px-3">${loan.IsClose == 1 ? 'Closed' : 'Active'}</span>
                        <div class="x-small mt-1 fw-bold">${loanNo}</div>
                    </div>
                    <div class="col-md-6 text-end">
                        <div class="progress d-inline-flex" style="height:6px; width:100px"><div class="progress-bar bg-primary" style="width:${progress}%"></div></div>
                        <span class="ms-1 x-small">${progress}%</span>
                        <a href="/Transaction/EmployeeLoanEntry?id=${loan.IDEmployeeLoan || loan.idEmployeeLoan}" class="btn btn-sm btn-outline-dark rounded-pill ms-3">Details</a>
                    </div>
                </div>
                <hr class="my-2 opacity-5">
                <div class="x-small text-muted">
                    <i class="fa fa-user-plus me-1"></i> <b>Created By:</b> ${eBy} on ${eDate}
                    ${loan.U_By ? `<span class="ms-3"><i class="fa fa-edit me-1"></i> <b>Updated By:</b> ${loan.U_By}</span>` : ''}
                </div>
            </div>
        </div>`;
    }).join("");
}
