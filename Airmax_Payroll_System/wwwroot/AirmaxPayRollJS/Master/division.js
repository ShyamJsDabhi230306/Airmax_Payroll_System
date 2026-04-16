// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/division";
let entryModal = null;


// ======================================================
// DOM
// ======================================================
const DOM = {
    id: () => document.getElementById("IDDivision"),
    location: () => document.getElementById("IDLocation"),
    name: () => document.getElementById("DivisionName"),
    remarks: () => document.getElementById("Remarks"),

    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal"),
    save: () => document.getElementById("btnSave"),
    btnAdd: () => document.getElementById("btnAdd")
};


// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    await loadLocation();
    await bindTable();

    $('#divisionList').DataTable({
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
    if (!res) return;
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
    if (!res) return;
    const json = await res.json();

    if (!json.success) return;

    const tbody = DOM.tbody();
    tbody.innerHTML = "";

    json.data.forEach(d => {

        const tr = document.createElement("tr");

        // Using standard sharp/me-1 and onclick patterns for security shield
        tr.innerHTML = `
            <td>${escapeHtml(d.locationName ?? "")}</td>
            <td>${escapeHtml(d.divisionName ?? "")}</td>
            <td>${escapeHtml(d.remarks ?? "")}</td>
            <td class="text-center">
                <div class="d-flex">
                    <a onclick="editEntry(${d.idDivision})"
                       class="btn btn-primary btn-xs sharp me-1 btn-edit">
                       <i class="fa fa-pencil"></i>
                    </a>

                    <a onclick="deleteEntry(${d.idDivision})"
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
// EDIT
// ======================================================
async function editEntry(id) {

    const res = await apiFetch(`${API}/get-by-id/${id}`);
    if (!res) return;
    const json = await res.json();

    if (!json.success) return;

    const d = json.data;

    DOM.id().value = d.idDivision;
    DOM.location().value = d.idLocation;
    DOM.name().value = d.divisionName;
    DOM.remarks().value = d.remarks ?? "";

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

    if (!res) return;
    const json = await res.json();

    if (!json.success) {
        showToast("danger", json.message, "Division Master");
        return;
    }

    showToast("success", json.message, "Division Master");
    bindTable();

}


// ======================================================
// SAVE
// ======================================================
async function saveData() {

    if (!DOM.location().value) {
        showToast("danger", "Location required", "Division Master");
        return;
    }

    if (!DOM.name().value.trim()) {
        showToast("danger", "Division Name required", "Division Master");
        return;
    }

    const dto = {
        idDivision: Number(DOM.id().value || 0),
        idLocation: Number(DOM.location().value),
        divisionName: DOM.name().value.trim(),
        remarks: DOM.remarks().value.trim()
    };

    DOM.save().disabled = true;

    try {

        const res = await apiFetch(`${API}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        if (!res) return;
        const json = await res.json();

        if (!json.success) {
            showToast("danger", json.message, "Division Master");
            return;
        }

        showToast("success", json.message, "Division Master");

        entryModal.hide();
        clearForm();
        bindTable();

    }
    catch (err) {
        showToast("danger", err.message, "Division Master");
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
    DOM.remarks().value = "";
}
