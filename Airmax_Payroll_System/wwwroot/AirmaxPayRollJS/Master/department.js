

// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/department";
let entryModal = null;


// ======================================================
// DOM
// ======================================================
const DOM = {

    id: () => document.getElementById("IDDepartment"),
    location: () => document.getElementById("IDLocation"),
    name: () => document.getElementById("DepartmentName"),

    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal"),
    save: () => document.getElementById("btnSave")
};


// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    await loadLocation();
    await bindTable();

    $('#departmentList').DataTable({
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

    entryModal = new bootstrap.Modal(DOM.modal(), { backdrop: "static" });

    DOM.modal().addEventListener("hidden.bs.modal", clearForm);

    DOM.save().addEventListener("click", saveData);

});


// ======================================================
// LOAD LOCATION
// ======================================================
async function loadLocation() {

    const res = await apiFetch(`/api/master/location/get-all`);
    if (!res) return;  // null = 401 or 403, already handled
    const json = await res.json();

    if (!json.success) return;

    const ddl = DOM.location();
    ddl.innerHTML = `<option value="">Select Location</option>`;

    json.data.forEach(l => {

        const opt = document.createElement("option");
        opt.value = l.idLocation;
        opt.text = l.locationName;

        ddl.appendChild(opt);

    });

}


// ======================================================
// BIND TABLE
// ======================================================
async function bindTable() {

    const res = await apiFetch(`${API}/get-all`);
    if (!res) return;  // null = 401 or 403, already handled
    const json = await res.json();

    if (!json.success) return;

    const tbody = DOM.tbody();
    tbody.innerHTML = "";

    json.data.forEach(d => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(d.locationName ?? "")}</td>
            <td>${escapeHtml(d.departmentName ?? "")}</td>
            <td class="text-center">
                <div class="d-flex">
                    <a onclick="editEntry(${d.idDepartment})"
                       class="btn btn-primary btn-xs sharp me-1">
                       <i class="fa fa-pencil"></i>
                    </a>

                    <a onclick="deleteEntry(${d.idDepartment})"
                       class="btn btn-danger btn-xs sharp">
                       <i class="fa fa-trash"></i>
                    </a>
                </div>
            </td>
        `;

        tbody.appendChild(tr);

    });

}


// ======================================================
// EDIT
// ======================================================
async function editEntry(id) {

    const res = await apiFetch(`${API}/get-by-id/${id}`);
    if (!res) return;  // null = 401 or 403, already handled
    const json = await res.json();

    if (!json.success) return;

    const d = json.data;

    DOM.id().value = d.idDepartment;
    DOM.location().value = d.idLocation;
    DOM.name().value = d.departmentName;

    entryModal.show();

}


// ======================================================
// DELETE
// ======================================================
async function deleteEntry(id) {

    const ok = await confirmDelete("This record will be deleted permanently!");

    if (!ok) return;

    const res = await apiFetch(`${API}/delete/${id}`, {
        method: "DELETE"
    });

    // If null, apiFetch already handled 401 (redirect to login)
    if (!res) return;

    // If 403, apiFetch already showed "Access Denied" toast
    if (res.status === 403) return;

    const json = await res.json();

    if (!json.success) {
        showToast("danger", json.message, "Department Master");
        return;
    }

    showToast("success", json.message, "Department Master");

    bindTable();

}


// ======================================================
// SAVE
// ======================================================
async function saveData() {

    if (!DOM.name().value.trim()) {

        showToast("danger", "Department required", "Department Master");
        return;

    }

    const dto = {

        idDepartment: Number(DOM.id().value || 0),
        idLocation: DOM.location().value || null,
        departmentName: DOM.name().value.trim()

    };

    DOM.save().disabled = true;

    try {

        const res = await apiFetch(`${API}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        if (!res) return;  // null = 401 or 403, already handled
        const json = await res.json();

        if (!json.success)
            throw new Error(json.message);

        showToast("success", json.message, "Department Master");

        entryModal.hide();
        clearForm();
        bindTable();

    }
    catch (err) {

        showToast("danger", err.message, "Department Master");

    }
    finally {

        DOM.save().disabled = false;

    }

}


// ======================================================
// CLEAR FORM
// ======================================================
function clearForm() {

    DOM.id().value = 0;
    DOM.location().value = "";
    DOM.name().value = "";

}