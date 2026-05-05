const API = "/api/master/payroll-configuration";

document.addEventListener("DOMContentLoaded", async () => {
    await bindTable();
});

async function bindTable() {
    if ($.fn.DataTable.isDataTable('#payrollConfigList')) {
        $('#payrollConfigList').DataTable().destroy();
    }

    const res = await apiFetch(`${API}/get-all`);
    const json = await res.json();

    const tbody = document.getElementById("tblBody");

    if (!json || !json.success || !json.data || json.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted">No records found</td></tr>`;
        return;
    }

    tbody.innerHTML = json.data.map((d, index) => `
        <tr>
            <td class="text-center">${index + 1}</td>
            <td class="fw-bold">${d.companyName || d.CompanyName || d.idCompany || d.IDCompany}</td>
            <td>${d.employeeGroupName || d.EmployeeGroupName || d.idEmployeeGroup || d.IDEmployeeGroup}</td>
            <td>
                <span class="badge bg-light text-dark border">
                    ${formatTime(d.shiftInTime || d.ShiftInTime)} - ${formatTime(d.shiftOutTime || d.ShiftOutTime)}
                </span>
            </td>
            <td>${d.shiftType || d.ShiftType || ""}</td>
            <td>${d.weeklyOff || d.WeeklyOff || ""}</td>
            <td>
                <span class="badge ${(d.otApplicable || d.OTApplicable) ? 'bg-success' : 'bg-secondary'}">
                    ${(d.otApplicable || d.OTApplicable) ? 'Yes' : 'No'}
                </span>
            </td>
            <td class="text-center">
                <div class="d-flex">
                    <a href="/Master/PayrollConfigurationEntry?id=${d.idPayrollConfiguration || d.IDPayrollConfiguration}" 
                       class="btn btn-primary btn-xs sharp me-1">
                        <i class="fa fa-pencil"></i>
                    </a>
                    <button onclick="deleteEntry(${d.idPayrollConfiguration || d.IDPayrollConfiguration})" 
                            class="btn btn-danger btn-xs sharp">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    $('#payrollConfigList').DataTable({
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

function formatTime(value) {
    if (!value) return "";
    return value.toString().substring(0, 5);
}

window.deleteEntry = async function (id) {
    if (!await confirmDelete("Delete this payroll configuration?")) return;

    const res = await apiFetch(`${API}/delete/${id}`, { method: "DELETE" });
    const json = await res.json();

    if (json.success) {
        showToast("success", "Deleted successfully");
        bindTable();
    } else {
        showToast("error", json.message || "Delete failed");
    }
};