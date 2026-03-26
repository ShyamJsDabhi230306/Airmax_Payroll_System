// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/employeegroupbonusdetails";
let entryModal = null;


// ======================================================
// DOM
// ======================================================
const DOM = {

    id: () => document.getElementById("IDEmployeeGroupBonus"),
    group: () => document.getElementById("IDEmployeeGroup"),
    minYear: () => document.getElementById("MinYear"),
    maxYear: () => document.getElementById("MaxYear"),
    bonus: () => document.getElementById("Bonus"),

    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal"),
    save: () => document.getElementById("btnSave")
};


// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    await loadEmployeeGroup();
    await bindTable();

    $('#bonusList').DataTable({
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
// LOAD EMPLOYEE GROUP
// ======================================================
async function loadEmployeeGroup() {

    const res = await apiFetch("/api/master/employeegroup/get-all");
    const json = await res.json();

    if (!json.success) return;

    const ddl = DOM.group();

    ddl.innerHTML = `<option value="">Select Employee Group</option>`;

    json.data.forEach(g => {

        const opt = document.createElement("option");

        opt.value = g.idEmployeeGroup;
        opt.textContent = g.employeeGroupName;

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
    console.log(json.data);
    const tbody = DOM.tbody();
    tbody.innerHTML = "";

    json.data.forEach(d => {

        const tr = document.createElement("tr");
        
        tr.innerHTML = `
            <td>${escapeHtml(d.employeeGroupName || "")}</td>
            <td>${escapeHtml(String(d.minYear || ""))}</td>
            <td>${escapeHtml(String(d.maxYear || ""))}</td>
            <td>${escapeHtml(String(d.bonus || ""))}</td>
            <td class="text-center">
                <div class="d-flex">
                    <a onclick="editEntry(${d.idEmployeeGroupBonus})"
                       class="btn btn-primary btn-xs sharp me-1">
                       <i class="fa fa-pencil"></i>
                    </a>

                    <a onclick="deleteEntry(${d.idEmployeeGroupBonus})"
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

    DOM.id().value = d.idEmployeeGroupBonus;
    DOM.group().value = d.idEmployeeGroup;
    DOM.minYear().value = d.minYear;
    DOM.maxYear().value = d.maxYear;
    DOM.bonus().value = d.bonus;

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

    showToast("success", json.message, "Bonus Details");

    bindTable();

}


// ======================================================
// SAVE
// ======================================================
async function saveData() {

    if (!DOM.group().value) {
        showToast("danger", "Employee Group required", "Bonus Details");
        return;
    }

    const dto = {

        idEmployeeGroupBonus: Number(DOM.id().value || 0),
        idEmployeeGroup: Number(DOM.group().value || 0),
        minYear: Number(DOM.minYear().value || 0),
        maxYear: Number(DOM.maxYear().value || 0),
        bonus: Number(DOM.bonus().value || 0)

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

        showToast("success", json.message, "Bonus Details");

        entryModal.hide();
        clearForm();
        bindTable();

    }
    catch (err) {

        showToast("danger", err.message, "Bonus Details");

    }
    finally {

        DOM.save().disabled = false;

    }

}


// ======================================================
// CLEAR
// ======================================================
function clearForm() {

    DOM.id().value = 0;
    DOM.group().value = "";
    DOM.minYear().value = "";
    DOM.maxYear().value = "";
    DOM.bonus().value = "";

}