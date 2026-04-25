///**
// * MASTER CONFIGURATION JS - MODAL VERSION
// */
//const API = "/api/master/configuration";
//let configModal = null;

//const DOM = {
//    id: () => document.getElementById("IDConfiguration"),
//    company: () => document.getElementById("IDCompany"),
//    loanLimit: () => document.getElementById("LoanLimit"),
//    tbody: () => document.getElementById("tblBody"),
//    modal: () => document.getElementById("addModal"),
//    modalTitle: () => document.getElementById("modalTitle"),
//    save: () => document.getElementById("btnSave")
//};

//document.addEventListener("DOMContentLoaded", async () => {
//    // 1. Init Modal
//    configModal = new bootstrap.Modal(DOM.modal(), { backdrop: 'static' });

//    // 2. Load Initial Data
//    await loadCompanies();
//    await bindTable();

//    // 3. Event Listeners
//    DOM.save().addEventListener("click", saveData);
//    DOM.modal().addEventListener('hidden.bs.modal', clearForm);
//});

//function openModal() {
//    clearForm();
//    DOM.modalTitle().innerText = "Add Configuration";
//    configModal.show();
//}

//async function loadCompanies() {
//    const res = await apiFetch("/api/master/company/get-all");
//    const json = await res.json();
//    if (json.success) {
//        DOM.company().innerHTML = `<option value="">Select Company</option>` +
//            json.data.map(c => `<option value="${c.idCompany}">${c.companyName}</option>`).join("");
//    }
//}

//async function bindTable() {
//    const res = await apiFetch(`${API}/get-all`);
//    const json = await res.json();
//    if (!json.success) return;

//    // 🔥 DESTROY existing DataTable before clearing table
//    if ($.fn.DataTable.isDataTable('#configList')) {
//        $('#configList').DataTable().destroy();
//    }

//    const tbody = DOM.tbody();
//    tbody.innerHTML = json.data.map(d => `
//        <tr class="align-middle">
//            <td class="fw-bold text-dark">${d.companyName}</td>
//            <td class="text-end fw-bold text-success pe-4">₹ ${Number(d.loanLimit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
//            <td class="text-center">
//                <button onclick="editEntry(${d.idConfiguration})" class="btn btn-primary btn-xs sharp me-1 shadow-sm"><i class="fa fa-pencil"></i></button>
//                <button onclick="deleteEntry(${d.idConfiguration})" class="btn btn-danger btn-xs sharp shadow-sm"><i class="fa fa-trash"></i></button>
//            </td>
//        </tr>
//    `).join("");

//    // 🔥 RE-INITIALIZE DataTable AFTER data is bound
//    $('#configList').DataTable({
//        searching: true,
//        pageLength: 10,
//        ordering: false,
//        language: {
//            paginate: {
//                next: '<i class="fa fa-angle-double-right"></i>',
//                previous: '<i class="fa fa-angle-double-left"></i>'
//            }
//        }
//    });
//}

//async function editEntry(id) {
//    const res = await apiFetch(`${API}/get-by-id/${id}`);
//    const json = await res.json();
//    if (json.success) {
//        const d = json.data;
//        DOM.id().value = d.idConfiguration;
//        DOM.company().value = d.idCompany;
//        DOM.loanLimit().value = d.loanLimit;

//        DOM.modalTitle().innerText = "Update Configuration";
//        DOM.save().innerHTML = '<i class="fa fa-save me-1"></i> Update Data';
//        configModal.show();
//    }
//}

//async function deleteEntry(id) {
//    const ok = await confirmDelete("Configuration will be removed!");
//    if (!ok) return;

//    const res = await apiFetch(`${API}/delete/${id}`, { method: "DELETE" });
//    const json = await res.json();

//    if (json.success) {
//        showToast("success", json.message, "Configuration");
//        bindTable();
//    } else {
//        showToast("danger", json.message, "Configuration");
//    }
//}

//async function saveData() {
//    const companyId = DOM.company().value;
//    const limit = parseFloat(DOM.loanLimit().value);

//    if (!companyId) return showToast("warning", "Please select a company");
//    if (!limit || limit <= 0) return showToast("warning", "Loan limit must be greater than 0");

//    const dto = {
//        idConfiguration: parseInt(DOM.id().value || 0),
//        idCompany: parseInt(companyId),
//        loanLimit: limit
//    };

//    DOM.save().disabled = true;
//    try {
//        const res = await apiFetch(`${API}/save`, {
//            method: "POST",
//            body: JSON.stringify(dto)
//        });
//        const json = await res.json();

//        if (json.success) {
//            showToast("success", json.message, "Configuration");
//            configModal.hide();
//            bindTable();
//        } else {
//            showToast(json.type == 2 ? "warning" : "danger", json.message, "Configuration");
//        }
//    } catch (err) {
//        showToast("danger", "Failed to save configuration");
//    } finally {
//        DOM.save().disabled = false;
//    }
//}

//function clearForm() {
//    DOM.id().value = 0;
//    DOM.company().value = "";
//    DOM.loanLimit().value = "";
//    DOM.save().innerHTML = '<i class="fa fa-save me-1"></i> Save Data';
//}






/**
 * MASTER CONFIGURATION JS - FINAL UI FIXES
 */
const API = "/api/master/configuration";
let configModal = null;


const DOM = {
    id: () => document.getElementById("IDConfiguration"),
    company: () => document.getElementById("IDCompany"),
    loanLimit: () => document.getElementById("LoanLimit"),
    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal"),
    modalTitle: () => document.getElementById("modalTitle"),
    save: () => document.getElementById("btnSave")
};

document.addEventListener("DOMContentLoaded", async () => {
    configModal = new bootstrap.Modal(DOM.modal(), { backdrop: 'static' });
    await loadCompanies();
    await bindTable();
    DOM.save().addEventListener("click", saveData);
    DOM.modal().addEventListener('hidden.bs.modal', clearForm);
});

// Helper: Only allow numbers and one decimal point in text input
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 46) {
        if (evt.target.value.indexOf('.') === -1) return true;
        else return false;
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
}

async function bindTable() {
    const res = await apiFetch(`${API}/get-all`);
    const json = await res.json();
    if (!json.success) return;

    if ($.fn.DataTable.isDataTable('#configList')) {
        $('#configList').DataTable().destroy();
    }

    const tbody = DOM.tbody();
    tbody.innerHTML = json.data.map(d => `
        <tr class="align-middle">
            <td class="fw-bold text-dark">${d.companyName}</td>
            <td class="text-end fw-bold text-success pe-4">₹ ${Number(d.loanLimit).toLocaleString('en-IN')}</td>
            <td class="text-center">
                <!-- 🔥 Flexbox container ensures buttons stay centered under 'Action' -->
                <div class="d-flex justify-content-center align-items-center">
                    <button onclick="editEntry(${d.idConfiguration})" class="btn btn-primary btn-xs sharp me-1 shadow-sm"><i class="fa fa-pencil"></i></button>
                    <button onclick="deleteEntry(${d.idConfiguration})" class="btn btn-danger btn-xs sharp shadow-sm"><i class="fa fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join("");

    $('#configList').DataTable({
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
}

function openModal() {
    clearForm();
    DOM.modalTitle().innerText = "Add Configuration";
    configModal.show();
}

async function loadCompanies() {
    const res = await apiFetch("/api/master/company/get-all");
    const json = await res.json();
    if (json.success) {
        DOM.company().innerHTML = `<option value="">Select Company</option>` +
            json.data.map(c => `<option value="${c.idCompany}">${c.companyName}</option>`).join("");
    }
}

async function editEntry(id) {
    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await res.json();
    if (json.success) {
        const d = json.data;
        DOM.id().value = d.idConfiguration;
        DOM.company().value = d.idCompany;
        DOM.loanLimit().value = d.loanLimit;

        DOM.modalTitle().innerText = "Update Configuration";
        DOM.save().innerHTML = '<i class="fa fa-save me-1"></i> Update Data';
        configModal.show();
    }
}

async function deleteEntry(id) {
    const ok = await confirmDelete("Configuration will be removed!");
    if (!ok) return;

    const res = await apiFetch(`${API}/delete/${id}`, { method: "DELETE" });
    const json = await res.json();

    if (json.success) {
        showToast("success", json.message, "Configuration");
        bindTable();
    } else {
        showToast("danger", json.message, "Configuration");
    }
}

async function saveData() {
    const companyId = DOM.company().value;
    const limit = parseFloat(DOM.loanLimit().value);

    if (!companyId) return showToast("warning", "Please select a company");
    if (isNaN(limit) || limit <= 0) return showToast("warning", "Loan limit must be greater than 0");

    const dto = {
        idConfiguration: parseInt(DOM.id().value || 0),
        idCompany: parseInt(companyId),
        loanLimit: limit
    };

    DOM.save().disabled = true;
    try {
        const res = await apiFetch(`${API}/save`, {
            method: "POST",
            body: JSON.stringify(dto)
        });
        const json = await res.json();

        if (json.success) {
            showToast("success", json.message, "Configuration");
            configModal.hide();
            bindTable();
        } else {
            showToast(json.type == 2 ? "warning" : "danger", json.message, "Configuration");
        }
    } catch (err) {
        showToast("danger", "Failed to save configuration");
    } finally {
        DOM.save().disabled = false;
    }
}

function clearForm() {
    DOM.id().value = 0;
    DOM.company().value = "";
    DOM.loanLimit().value = "";
    DOM.save().innerHTML = '<i class="fa fa-save me-1"></i> Save Data';
}
