/**
 * 📄 EMPLOYEE KHARCHI LIST - DETAILED VERSION
 */
const API = "/api/transaction/kharchi";

document.addEventListener("DOMContentLoaded", async () => {
    await bindTable();
});

async function bindTable() {
    if ($.fn.DataTable.isDataTable('#kharchiList')) {
        $('#kharchiList').DataTable().destroy();
    }

    const res = await apiFetch(`${API}/get-all`);
    const json = await res.json();

    document.getElementById("tblBody").innerHTML = (json.data || []).map((d, index) => {
        const monthDisplay = d.kharchiDate
            ? new Date(d.kharchiDate).toLocaleString('default', { month: 'long', year: 'numeric' })
            : "";

        return `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${d.employeeCode || ""}</td>
                <td class="fw-bold">${d.employeeName || ""}</td>
                <td>${d.departmentName || ""}</td>
                <td class="text-center text-nowrap">${monthDisplay}</td>
                <td class="text-end fw-bold">₹ ${parseFloat(d.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td class="small text-muted">${d.remarks || "---"}</td>
                <td class="text-center">
                    <div class="d-flex justify-content-center">
                        <a href="/Transaction/EmployeeKharchiEntry?id=${d.idEmployeeKharchi}"
                           class="btn btn-primary btn-xs sharp me-1">
                           <i class="fa fa-pencil"></i>
                        </a>
                        <button onclick="deleteEntry(${d.idEmployeeKharchi})"
                           class="btn btn-danger btn-xs sharp">
                           <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join("");

    $('#kharchiList').DataTable({
        pageLength: 25,
        ordering: false,
        responsive: true,
        language: {
            paginate: {
                next: '<i class="fa fa-chevron-right"></i>',
                previous: '<i class="fa fa-chevron-left"></i>'
            }
        }
    });
}

async function deleteEntry(id) {
    if (!await confirmDelete("Delete this employee kharchi record?")) return;
    const res = await apiFetch(`${API}/delete/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
        showToast("success", "Deleted Successfully");
        bindTable();
    }
}
