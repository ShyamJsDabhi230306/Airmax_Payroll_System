// Path: wwwroot/AirmaxPayRollJS/Transaction/employee_loan_list.js

const API = "/api/transaction/employee-loan";

document.addEventListener("DOMContentLoaded", async () => {
    await bindTable();
});

async function bindTable() {
    if ($.fn.DataTable.isDataTable('#loanList')) {
        $('#loanList').DataTable().destroy();
    }

    const res = await apiFetch(`${API}/get-all`);
    const json = await res.json();
    if (!json || !json.success) return;

    const tbody = document.getElementById("tblBody");
    tbody.innerHTML = json.data.map((d, index) => `
        <tr>
            <td class="text-center">${index + 1}</td>
            <td class="text-center fw-bold text-primary">${d.loanNo}</td>
            <td>${d.employeeName}</td>
            <td class="text-center fw-bold">${d.loanAmount.toFixed(2)}</td>
            <td class="text-center">${d.totalInstallments}</td>
            <td class="text-center">
                <span class="badge ${d.isClose ? 'bg-danger' : 'bg-success'}">
                    ${d.isClose ? 'Closed' : 'Active'}
                </span>
            </td>
            <td class="text-center">
                <div class="d-flex justify-content-center">
                    <a href="/Transaction/EmployeeLoanEntry?id=${d.idEmployeeLoan}" class="btn btn-primary btn-xs sharp me-1 btn-edit">
                        <i class="fa fa-pencil"></i>
                    </a>
                    <button onclick="deleteEntry(${d.idEmployeeLoan})" class="btn btn-danger btn-xs sharp btn-delete">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    $('#loanList').DataTable({
        searching: true,
        pageLength: 10,
        ordering: true,
        language: {
            paginate: {
                next: '<i class="fa fa-angle-double-right"></i>',
                previous: '<i class="fa fa-angle-double-left"></i>'
            }
        }
    });
}

window.deleteEntry = async function (id) {
    if (!await confirmDelete("Delete this loan?")) return;
    const res = await apiFetch(`${API}/delete/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
        showToast("success", "Deleted successfully");
        bindTable();
    }
};
