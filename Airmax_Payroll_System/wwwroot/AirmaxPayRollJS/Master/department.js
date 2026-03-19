//// ======================================================
//// CONFIG
//// ======================================================
//const API = "/api/master/department";
//let entryModal = null;


//// ======================================================
//// DOM HELPERS (SAFE)
//// ======================================================
//const DOM = {
//    id: () => document.getElementById("IDDepartment"),
//    location: () => document.getElementById("IDLocation"),
//    name: () => document.getElementById("DepartmentName"),
//    tbody: () => document.getElementById("tblBody"),
//    modal: () => document.getElementById("addModal"),
//    save: () => document.getElementById("btnSave")
//};


//// ======================================================
//// INIT
//// ======================================================
//document.addEventListener("DOMContentLoaded", async () => {

//    await loadLocation();
//    const modalEl = DOM.modal();
//    const saveBtn = DOM.save();

//    if (modalEl) {
//        entryModal = new bootstrap.Modal(modalEl);
//        modalEl.addEventListener("hidden.bs.modal", clearForm);
//    }

//    if (saveBtn) {
//        saveBtn.addEventListener("click", saveData);
//    }

//    await bindTable();

//});


//// ======================================================
//// LOAD LOCATION
//// ======================================================
//async function loadLocation() {

//    const ddl = DOM.location();
//    if (!ddl) return;

//    const res = await fetch("/api/master/location/get-all");
//    const json = await res.json();

//    if (!json.success) return;

//    ddl.innerHTML = '<option value="">Select Location</option>';

//    json.data.forEach(l => {

//        const opt = document.createElement("option");
//        opt.value = l.idLocation;
//        opt.text = l.locationName;

//        ddl.appendChild(opt);

//    });

//}


//// ======================================================
//// BIND TABLE
//// ======================================================
//async function bindTable() {

//    const tbody = DOM.tbody();
//    if (!tbody) return;

//    const res = await fetch(`${API}/get-all`);
//    const json = await res.json();

//    if (!json.success) return;

//    tbody.innerHTML = "";

//    json.data.forEach(d => {

//        const tr = document.createElement("tr");

//        tr.innerHTML = `
//            <td>${d.locationName ?? ""}</td>
//            <td>${d.departmentName ?? ""}</td>
//            <td>
//                <button class="btn btn-primary btn-sm me-1"
//                        onclick="editEntry(${d.idDepartment})">
//                    Edit
//                </button>

//                <button class="btn btn-danger btn-sm"
//                        onclick="deleteEntry(${d.idDepartment})">
//                    Delete
//                </button>
//            </td>
//        `;

//        tbody.appendChild(tr);

//    });

//}


//// ======================================================
//// EDIT
//// ======================================================
//async function editEntry(id) {

//    const res = await fetch(`${API}/get-by-id/${id}`);
//    const json = await res.json();

//    if (!json.success) return;

//    const d = json.data;

//    const idInput = DOM.id();
//    const locInput = DOM.location();
//    const nameInput = DOM.name();

//    if (idInput) idInput.value = d.idDepartment;
//    if (locInput) locInput.value = d.idLocation;
//    if (nameInput) nameInput.value = d.departmentName;

//    if (entryModal) entryModal.show();

//}


//// ======================================================
//// DELETE
//// ======================================================
//async function deleteEntry(id) {

//    if (!confirm("Are you sure you want to delete this record?"))
//        return;

//    const res = await fetch(`${API}/delete/${id}`, {
//        method: "DELETE"
//    });

//    const json = await res.json();

//    alert(json.message);

//    bindTable();

//}


//// ======================================================
//// SAVE
//// ======================================================
//async function saveData() {

//    const idInput = DOM.id();
//    const locInput = DOM.location();
//    const nameInput = DOM.name();
//    const saveBtn = DOM.save();

//    if (!nameInput || !nameInput.value.trim()) {
//        showToast("danger", "Department name required", "Department Master");
//        return;
//    }

//    const dto = {
//        idDepartment: Number(idInput?.value || 0),
//        idLocation: locInput?.value || null,
//        departmentName: nameInput.value.trim()
//    };

//    if (saveBtn) saveBtn.disabled = true;

//    try {

//        const res = await apiFetch(`${API}/save`, {
//            method: "POST",
//            headers: { "Content-Type": "application/json" },
//            body: JSON.stringify(dto)
//        });

//        const json = await res.json();

//        if (!json.success)
//            throw new Error(json.message);

//        showToast("success", json.message, "Department Master");

//        if (entryModal) entryModal.hide();

//        clearForm();
//        bindTable();

//    }
//    catch (err) {

//        showToast("danger", err.message, "Department Master");

//    }
//    finally {

//        if (saveBtn) saveBtn.disabled = false;

//    }

//}


//// ======================================================
//// CLEAR FORM
//// ======================================================
//function clearForm() {

//    const idInput = DOM.id();
//    const locInput = DOM.location();
//    const nameInput = DOM.name();

//    if (idInput) idInput.value = 0;
//    if (locInput) locInput.value = "";
//    if (nameInput) nameInput.value = "";

//}



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

    const json = await res.json();

    if (!json.success) return;

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