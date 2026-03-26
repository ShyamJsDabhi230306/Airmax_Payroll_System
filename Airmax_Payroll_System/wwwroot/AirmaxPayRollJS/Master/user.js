// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/user";
let entryModal = null;


// ======================================================
// DOM
// ======================================================
const DOM = {
    id: () => document.getElementById("IDUser"),

    userName: () => document.getElementById("UserName"),
    password: () => document.getElementById("Password"),
    fullName: () => document.getElementById("FullName"),
    email: () => document.getElementById("Email"),
    mobile: () => document.getElementById("Mobile"),
    role: () => document.getElementById("RoleName"),

    company: () => document.getElementById("IDCompany"),
    location: () => document.getElementById("IDLocation"),
    department: () => document.getElementById("IDDepartment"),

    save: () => document.getElementById("btnSave"),
    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal")
};


// ======================================================
// SAFE FETCH HELPER (VERY IMPORTANT)
// ======================================================
async function safeJson(res) {
    if (!res.ok) {
        console.error("HTTP Error:", res.status);
        return null;
    }

    try {
        return await res.json();
    } catch (err) {
        console.error("Invalid JSON:", err);
        return null;
    }
}


// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    await bindTable();

    $('#userList').DataTable({
        pageLength: 10,
        ordering: false,
        language: {
            paginate: {
                next: '<i class="fa fa-angle-double-right"></i>',
                previous: '<i class="fa fa-angle-double-left"></i>'
            }
        }
    });

    await loadCompany();

    // ✅ Proper chaining
    DOM.company().addEventListener("change", () => {
        const id = DOM.company().value;
        loadLocation(id);

        // reset dependent dropdowns
        DOM.location().innerHTML = `<option value="">Select Location</option>`;
        DOM.department().innerHTML = `<option value="">Select Department</option>`;
    });

    DOM.location().addEventListener("change", () => {
        const id = DOM.location().value;
        loadDepartment(id);

        DOM.department().innerHTML = `<option value="">Select Department</option>`;
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
    const json = await safeJson(res);

    if (!json || !json.success) return;

    const tbody = DOM.tbody();
    tbody.innerHTML = "";

    json.data.forEach(d => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(d.userName)}</td>
            <td>${escapeHtml(d.fullName)}</td>
            <td>${escapeHtml(d.email || "")}</td>
            <td>${escapeHtml(d.mobile || "")}</td>
            <td>${escapeHtml(d.roleName)}</td>
            <td>${escapeHtml(d.password)}</td>
            <td>
                <div class="d-flex">
                    <a onclick="editEntry(${d.idUser})"
                       class="btn btn-primary btn-xs sharp me-1">
                       <i class="fa fa-pencil"></i>
                    </a>

                    <a onclick="deleteEntry(${d.idUser})"
                       class="btn btn-danger btn-xs sharp">
                       <i class="fa fa-trash"></i>
                    </a>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}



async function editEntry(id) {

    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await safeJson(res);

    if (!json || !json.success) return;

    const d = json.data;

    // BASIC FIELDS
    DOM.id().value = d.idUser;
    DOM.userName().value = d.userName || "";
    DOM.password().value = d.password || "";
    DOM.fullName().value = d.fullName || "";
    DOM.email().value = d.email || "";
    DOM.mobile().value = d.mobile || "";
    DOM.role().value = d.roleName || "";
    DOM.password().value = d.password || "";
    // =========================
    // 🔥 STEP 1: LOAD COMPANY FIRST
    // =========================
    await loadCompany();   // ❗ THIS WAS MISSING

    $('#IDCompany')
        .val(String(d.idCompany))
        .selectpicker('refresh');

    // =========================
    // 🔥 STEP 2: LOAD LOCATION
    // =========================
    await loadLocation(d.idCompany);

    $('#IDLocation')
        .val(String(d.idLocation))
        .selectpicker('refresh');

    // =========================
    // 🔥 STEP 3: LOAD DEPARTMENT
    // =========================
    await loadDepartment(d.idLocation);

    $('#IDDepartment')
        .val(String(d.idDepartment))
        .selectpicker('refresh');

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

    const json = await safeJson(res);
    if (!json || !json.success) return;

    showToast("success", json.message, "User Master");
    bindTable();
}


// ======================================================
// DROPDOWNS
// ======================================================
async function loadCompany() {

    const res = await apiFetch("/api/master/company/get-all");
    const json = await safeJson(res);

    if (!json || !json.success) return;

    DOM.company().innerHTML =
        `<option value="">Select Company</option>` +
        json.data.map(c =>
            `<option value="${c.idCompany}">${c.companyName}</option>`
        ).join("");

    $(DOM.company()).selectpicker('refresh');
}


async function loadLocation(companyId) {

    const res = await apiFetch(`/api/master/location/get-all`);
    const json = await safeJson(res);

    if (!json || !json.success) return;

    // 🔥 FILTER HERE
    const filtered = json.data.filter(l => l.idCompany == companyId);

    DOM.location().innerHTML =
        `<option value="">Select Location</option>` +
        filtered.map(l =>
            `<option value="${l.idLocation}">${l.locationName}</option>`
        ).join("");

    $(DOM.location()).selectpicker('refresh');
}

async function loadDepartment(locationId) {

    const res = await apiFetch(`/api/master/department/get-all`);
    const json = await safeJson(res);

    if (!json || !json.success) return;

    // 🔥 FILTER HERE
    const filtered = json.data.filter(d => d.idLocation == locationId);

    DOM.department().innerHTML =
        `<option value="">Select Department</option>` +
        filtered.map(d =>
            `<option value="${d.idDepartment}">${d.departmentName}</option>`
        ).join("");

    $(DOM.department()).selectpicker('refresh');
}

// ======================================================
// SAVE
// ======================================================
async function saveData() {

    if (!DOM.userName().value.trim()) {
        showToast("danger", "User name required", "User Master");
        return;
    }

    const dto = {
        IDUser: Number(DOM.id().value || 0),

        UserName: DOM.userName().value.trim(),
        Password: DOM.password().value.trim(),
        FullName: DOM.fullName().value.trim(),
        Email: DOM.email().value.trim(),
        Mobile: DOM.mobile().value.trim(),
        RoleName: DOM.role().value,

        IDCompany: DOM.company().value || null,
        IDLocation: DOM.location().value || null,
        IDDepartment: DOM.department().value || null
    };

    DOM.save().disabled = true;

    try {

        const res = await apiFetch(`${API}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        const json = await safeJson(res);

        if (!json || !json.success)
            throw new Error(json?.message || "Save failed");

        showToast("success", json.message, "User Master");

        entryModal.hide();
        clearForm();
        bindTable();

    } catch (err) {
        showToast("danger", err.message, "User Master");
    } finally {
        DOM.save().disabled = false;
    }
}


// ======================================================
// CLEAR
// ======================================================
function clearForm() {

    DOM.id().value = 0;
    DOM.userName().value = "";
    DOM.password().value = "";
    DOM.fullName().value = "";
    DOM.mobile().value = "";
    DOM.email().value = "";
    DOM.role().value = "";
    // Reset dropdowns
    DOM.company().value = "";
    DOM.location().value = "";
    DOM.department().value = "";

    DOM.password().type = "password";

    const eyeBtn = document.getElementById("btnTogglePassword");
    if (eyeBtn) {
        eyeBtn.innerHTML = '<i class="fa fa-eye"></i>';
    }

    // Refresh all selectpickers
    $('#ddlCompany').selectpicker('refresh');
    $('#ddlLocation').selectpicker('refresh');
    $('#ddlDepartment').selectpicker('refresh');
    $('#ddlRole').selectpicker('refresh');
}