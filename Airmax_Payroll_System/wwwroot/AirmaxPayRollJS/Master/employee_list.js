// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/employee";

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    if (!document.getElementById("tblBody")) return;

    await bindTable();

    $('#employeeList').DataTable({
        searching: true,
        pageLength: 10,
        ordering: false,
        language: {
            paginate: {
                next: '<i class="fa fa-angle-double-right"></i>',
                previous: '<i class="fa fa-angle-double-left"></i>'
            }
        }
    });
});

// ======================================================
// TABLE
// ======================================================
async function bindTable() {

    const res = await apiFetch(`${API}/get-all`);
    const json = await res.json();

    if (!json || !json.success) return;

    const tbody = document.getElementById("tblBody");
    tbody.innerHTML = "";

    json.data.forEach(d => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(d.employeeName)}</td>
            <td>${escapeHtml(d.emp_ContactNo || "")}</td>
            <td>${escapeHtml(d.emailID || "")}</td>
            <td>${escapeHtml(d.companyName || "")}</td>
            <td>${escapeHtml(String(d.salary || ""))}</td>
            <td class="text-center">
                <div class="d-flex">
                    <a onclick="editEntry(${d.idEmployee})"
                       class="btn btn-primary btn-xs sharp me-1  btn-edit">
                       <i class="fa fa-pencil"></i>
                    </a>
                    <a onclick="deleteEntry(${d.idEmployee})"
                       class="btn btn-danger btn-xs sharp btn-delete">
                       <i class="fa fa-trash"></i>
                    </a>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ======================================================
// EDIT → REDIRECT
// ======================================================
function editEntry(id) {
    window.location.href = "/Master/EmployeeEntry?id=" + id;
}

// ======================================================
// DELETE
// ======================================================
async function deleteEntry(id) {

    const ok = await confirmDelete("Delete this employee?");
    if (!ok) return;

    const res = await apiFetch(`${API}/delete/${id}`, {
        method: "DELETE"
    });

    const json = await res.json();

    if (!json || !json.success) return;

    showToast("success", json.message, "Employee Master");
    bindTable();
}