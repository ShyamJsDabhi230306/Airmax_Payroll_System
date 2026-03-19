// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/location";
let entryModal = null;


// ======================================================
// DOM
// ======================================================
const DOM = {

    id: () => document.getElementById("IDLocation"),
    company: () => document.getElementById("IDCompany"),
    name: () => document.getElementById("LocationName"),

    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal"),
    save: () => document.getElementById("btnSave")
};


// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    await loadCompany();
    await bindTable();

    $('#locationList').DataTable({
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
// LOAD COMPANY DROPDOWN
// ======================================================
async function loadCompany() {

    const res = await apiFetch("/api/master/company/get-all");
    const json = await res.json();

    if (!json.success) return;

    const ddl = DOM.company();

    ddl.innerHTML = `<option value="">Select Company</option>`;

    json.data.forEach(c => {

        const opt = document.createElement("option");

        opt.value = c.idCompany;
        opt.textContent = c.companyName;

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
            <td>${escapeHtml(d.companyName || "")}</td>
            <td>${escapeHtml(d.locationName || "")}</td>
            <td class="text-center">
                <div class="d-flex">
                    <a onclick="editEntry(${d.idLocation})"
                       class="btn btn-primary btn-xs sharp me-1">
                       <i class="fa fa-pencil"></i>
                    </a>

                    <a onclick="deleteEntry(${d.idLocation})"
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

    DOM.id().value = d.idLocation;
    DOM.company().value = d.idCompany;
    DOM.name().value = d.locationName;

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

    showToast("success", json.message, "Location Master");

    bindTable();

}


// ======================================================
// SAVE
// ======================================================
async function saveData() {

    if (!DOM.name().value.trim()) {

        showToast("danger", "Location name required", "Location Master");
        return;

    }

    const dto = {

        idLocation: Number(DOM.id().value || 0),
        idCompany: Number(DOM.company().value || 0),
        locationName: DOM.name().value.trim()

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

        showToast("success", json.message, "Location Master");

        entryModal.hide();
        clearForm();
        bindTable();

    }
    catch (err) {

        showToast("danger", err.message, "Location Master");

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
    DOM.company().value = "";
    DOM.name().value = "";

}