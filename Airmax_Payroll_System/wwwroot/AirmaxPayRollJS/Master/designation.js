// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/designation";
let entryModal = null;


// ======================================================
// DOM
// ======================================================
const DOM = {

    id: () => document.getElementById("IDDesignation"),
    name: () => document.getElementById("Designation"),

    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal"),
    save: () => document.getElementById("btnSave")
};



// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    await bindTable();

    $('#designationList').DataTable({
        searching: true,
        pageLength: 10,
        ordering: false,
        language: {
            paginate: {
                next: '<i class="fa fa-angle-double-right" aria-hidden="true"></i>',
                previous: '<i class="fa fa-angle-double-left" aria-hidden="true"></i>'
            }
        }
    });

    entryModal = new bootstrap.Modal(DOM.modal(), { backdrop: "static" });

    DOM.modal().addEventListener("hidden.bs.modal", clearForm);

    DOM.save().addEventListener("click", saveData);

});



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
            <td>${escapeHtml(d.designetion)}</td>
            <td class="text-center">
                <div class="d-flex">
                    <a onclick="editEntry(${d.idDesignation})"
                       class="btn btn-primary btn-xs sharp me-1">
                       <i class="fa fa-pencil"></i>
                    </a>

                    <a onclick="deleteEntry(${d.idDesignation})"
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

    DOM.id().value = d.idDesignation;
    DOM.name().value = d.designetion;

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

    showToast("success", json.message, "Designation Master");

    bindTable();

}



// ======================================================
// SAVE
// ======================================================
async function saveData() {

    if (!DOM.name().value.trim()) {

        showToast("danger", "Designation required", "Designation Master");
        return;

    }

    const dto = {

        idDesignation: Number(DOM.id().value || 0),
        designetion: DOM.name().value.trim()

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

        showToast("success", json.message, "Designation Master");

        entryModal.hide();
        clearForm();
        bindTable();

    }
    catch (err) {

        showToast("danger", err.message, "Designation Master");

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
    DOM.name().value = "";

}