//// ======================================================
//// CONFIG
//// ======================================================
//const API_URL = "api/master/userrights";

//// ======================================================
//// DOM
//// ======================================================
//const DOM = {
//    company: () => document.getElementById("ddlCompany"),
//    location: () => document.getElementById("ddlLocation"),
//    department: () => document.getElementById("ddlDepartment"),
//    user: () => document.getElementById("ddlUser"),

//    gridWrapper: () => document.getElementById("permissionsGridWrapper"),
//    noUserState: () => document.getElementById("noUserSelectedState"),
//    tbody: () => document.querySelector("#tblPermissions tbody"),
//    btnSave: () => document.getElementById("btnSaveRights")
//};

//// ======================================================
//// SAFE JSON HELPER
//// ======================================================
//async function safeJson(res) {
//    if (!res || !res.ok) {
//        console.error("HTTP Error:", res?.status);
//        return null;
//    }
//    try {
//        return await res.json();
//    } catch (err) {
//        console.error("Invalid JSON:", err);
//        return null;
//    }
//}

//// ======================================================
//// INIT — runs when page loads
//// ======================================================
//document.addEventListener("DOMContentLoaded", async function () {

//    // 1. Load Companies on page load
//    await loadCompanies();

//    // 2. Company changed → load Locations
//    DOM.company().addEventListener("change", async function () {
//        const id = this.value;
//        resetFilters(["location", "department", "user"]);
//        hideGrid();
//        if (id > 0) await loadLocations(id);
//    });

//    // 3. Location changed → load Departments
//    DOM.location().addEventListener("change", async function () {
//        const id = this.value;
//        resetFilters(["department", "user"]);
//        hideGrid();
//        if (id > 0) await loadDepartments(id);
//    });

//    // 4. Department changed → load Users
//    DOM.department().addEventListener("change", async function () {
//        const id = this.value;
//        resetFilters(["user"]);
//        hideGrid();
//        if (id > 0) await loadUsers(id);
//    });

//    // 5. User changed → load Permissions Grid
//    DOM.user().addEventListener("change", async function () {
//        const id = this.value;
//        if (id > 0) {
//            DOM.gridWrapper().style.display = "block";
//            DOM.noUserState().style.display = "none";
//            await loadPermissions(id);
//        } else {
//            hideGrid();
//        }
//    });

//    // 6. Save button
//    DOM.btnSave().addEventListener("click", saveRights);
//});

//// ======================================================
//// HIDE GRID HELPER
//// ======================================================
//function hideGrid() {
//    DOM.gridWrapper().style.display = "none";
//    DOM.noUserState().style.display = "block";
//}

//// ======================================================
//// LOAD COMPANIES
//// ======================================================
//async function loadCompanies() {
//    const res = await apiFetch("/api/master/company/get-all");
//    if (!res) return;   // null = 401 or 403
//    const json = await safeJson(res);
//    if (!json || !json.success) return;

//    DOM.company().innerHTML =
//        `<option value="0">Select Company</option>` +
//        json.data.map(x => `<option value="${x.idCompany}">${x.companyName}</option>`).join("");

//    if ($.fn.selectpicker) $(DOM.company()).selectpicker('refresh');
//}

//// ======================================================
//// LOAD LOCATIONS
//// ======================================================
//async function loadLocations(companyId) {
//    const res = await apiFetch(`${API_URL}/get-locations/${companyId}`);
//    if (!res) return;   // null = 401 or 403
//    const data = await safeJson(res);
//    if (!data) return;

//    DOM.location().innerHTML =
//        `<option value="0">Select Location</option>` +
//        data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

//    DOM.location().disabled = false;
//    if ($.fn.selectpicker) $(DOM.location()).selectpicker('refresh');
//}

//// ======================================================
//// LOAD DEPARTMENTS
//// ======================================================
//async function loadDepartments(locationId) {
//    const res = await apiFetch(`${API_URL}/get-departments/${locationId}`);
//    if (!res) return;   // null = 401 or 403
//    const data = await safeJson(res);
//    if (!data) return;

//    DOM.department().innerHTML =
//        `<option value="0">Select Department</option>` +
//        data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

//    DOM.department().disabled = false;
//    if ($.fn.selectpicker) $(DOM.department()).selectpicker('refresh');
//}

//// ======================================================
//// LOAD USERS
//// ======================================================
//async function loadUsers(deptId) {
//    const res = await apiFetch(`${API_URL}/get-users/${deptId}`);
//    if (!res) return;   // null = 401 or 403
//    const data = await safeJson(res);
//    if (!data) return;

//    DOM.user().innerHTML =
//        `<option value="0">Select User</option>` +
//        data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

//    DOM.user().disabled = false;
//    if ($.fn.selectpicker) $(DOM.user()).selectpicker('refresh');
//}

//// ======================================================
//// LOAD PERMISSIONS GRID
//// ======================================================
//async function loadPermissions(userId) {
//    const res = await apiFetch(`${API_URL}/get-permissions/${userId}`);
//    if (!res) return;   // null = 401 or 403
//    const json = await safeJson(res);
//    if (!json || !json.success) return;
//    DOM.tbody().innerHTML = json.data.map(p => `
//    <tr data-page-id="${p.pageId}">
//        <td style="width: 40%; vertical-align: middle; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
//            <strong>${p.pageName}</strong>
//        </td>
//        <td style="width: 15%; text-align: center; vertical-align: middle;">
//            <div class="form-check d-flex justify-content-center m-0 p-0">
//                <input type="checkbox" class="form-check-input chk-view m-0" ${p.canView ? 'checked' : ''} />
//            </div>
//        </td>
//        <td style="width: 15%; text-align: center; vertical-align: middle;">
//            <div class="form-check d-flex justify-content-center m-0 p-0">
//                <input type="checkbox" class="form-check-input chk-create m-0" ${p.canCreate ? 'checked' : ''} />
//            </div>
//        </td>
//        <td style="width: 15%; text-align: center; vertical-align: middle;">
//            <div class="form-check d-flex justify-content-center m-0 p-0">
//                <input type="checkbox" class="form-check-input chk-edit m-0" ${p.canEdit ? 'checked' : ''} />
//            </div>
//        </td>
//        <td style="width: 15%; text-align: center; vertical-align: middle;">
//            <div class="form-check d-flex justify-content-center m-0 p-0">
//                <input type="checkbox" class="form-check-input chk-delete m-0" ${p.canDelete ? 'checked' : ''} />
//            </div>
//        </td>
//    </tr>
//`).join("");




//}

//// ======================================================
//// SAVE
//// ======================================================
//async function saveRights() {
//    const userId = DOM.user().value;

//    if (!userId || userId == "0") {
//        showToast("danger", "Please select a user first.", "User Access Rights");
//        return;
//    }

//    const permissions = [];
//    DOM.tbody().querySelectorAll("tr").forEach(tr => {
//        permissions.push({
//            pageId: parseInt(tr.getAttribute("data-page-id")),
//            canView: tr.querySelector(".chk-view").checked,
//            canCreate: tr.querySelector(".chk-create").checked,
//            canEdit: tr.querySelector(".chk-edit").checked,
//            canDelete: tr.querySelector(".chk-delete").checked
//        });
//    });

//    const dto = { userId: Number(userId), permissions: permissions };

//    DOM.btnSave().disabled = true;
//    try {
//        const res = await apiFetch(`${API_URL}/save`, {
//            method: "POST",
//            headers: { "Content-Type": "application/json" },
//            body: JSON.stringify(dto)
//        });

//        if (!res) return;   // null = 401 or 403

//        const json = await safeJson(res);
//        if (!json || !json.success) throw new Error(json?.message || "Save failed");

//        showToast("success", json.message, "User Access Rights");

//    } catch (err) {
//        showToast("danger", err.message, "User Access Rights");
//    } finally {
//        DOM.btnSave().disabled = false;
//    }
//}

//// ======================================================
//// RESET FILTERS HELPER
//// ======================================================
//function resetFilters(list) {
//    list.forEach(item => {
//        const el = DOM[item]();
//        el.innerHTML = `<option value="0">Select ${item.charAt(0).toUpperCase() + item.slice(1)}</option>`;
//        el.disabled = true;
//        if ($.fn.selectpicker) $(el).selectpicker('refresh');
//    });
//}



const API_URL = "api/master/userrights";

const DOM = {
    company: () => document.getElementById("ddlCompany"),
    location: () => document.getElementById("ddlLocation"),
    department: () => document.getElementById("ddlDepartment"),
    user: () => document.getElementById("ddlUser"),
    gridWrapper: () => document.getElementById("permissionsGridWrapper"),
    noUserState: () => document.getElementById("noUserSelectedState"),
    tbody: () => document.querySelector("#tblPermissions tbody"),
    btnSave: () => document.getElementById("btnSaveRights")
};

document.addEventListener("DOMContentLoaded", async function () {
    // 1. Initial Load Companies
    await loadCompanies();

    // 2. Event Listeners with Persistence
    DOM.company().addEventListener("change", async function () {
        localStorage.setItem("ur_comp", this.value);
        resetFilters(["location", "department", "user"]);
        if (this.value > 0) await loadLocations(this.value);
    });

    DOM.location().addEventListener("change", async function () {
        localStorage.setItem("ur_loc", this.value);
        resetFilters(["department", "user"]);
        if (this.value > 0) await loadDepartments(this.value);
    });

    DOM.department().addEventListener("change", async function () {
        localStorage.setItem("ur_dept", this.value);
        resetFilters(["user"]);
        if (this.value > 0) await loadUsers(this.value);
    });

    DOM.user().addEventListener("change", async function () {
        localStorage.setItem("ur_user", this.value);
        if (this.value > 0) {
            DOM.gridWrapper().style.display = "block";
            DOM.noUserState().style.display = "none";
            await loadPermissions(this.value);
        } else {
            hideGrid();
        }
    });

    DOM.btnSave().addEventListener("click", saveRights);
    setupSelectAll();

    // 🕒 AUTO-RELOAD SAVED SELECTIONS
    await autoReloadSelections();
});

async function autoReloadSelections() {
    const comp = localStorage.getItem("ur_comp");
    const loc = localStorage.getItem("ur_loc");
    const dept = localStorage.getItem("ur_dept");
    const user = localStorage.getItem("ur_user");

    if (comp && comp > 0) {
        DOM.company().value = comp; $(DOM.company()).selectpicker('refresh');
        await loadLocations(comp);
        if (loc && loc > 0) {
            DOM.location().value = loc; $(DOM.location()).selectpicker('refresh');
            await loadDepartments(loc);
            if (dept && dept > 0) {
                DOM.department().value = dept; $(DOM.department()).selectpicker('refresh');
                await loadUsers(dept);
                if (user && user > 0) {
                    DOM.user().value = user; $(DOM.user()).selectpicker('refresh');
                    DOM.gridWrapper().style.display = "block";
                    DOM.noUserState().style.display = "none";
                    await loadPermissions(user);
                }
            }
        }
    }
}

async function loadPermissions(userId) {
    const res = await apiFetch(`${API_URL}/get-permissions/${userId}`);
    const json = await res.json();
    if (!json.success) return;

    DOM.tbody().innerHTML = json.data.map(p => `
        <tr data-page-id="${p.pageId}">
            <td class="col-page" style="vertical-align:middle;"><strong>${p.pageName}</strong></td>
            <td class="col-check text-center"><div class="form-check d-flex justify-content-center"><input type="checkbox" class="form-check-input chk-view" ${p.canView ? 'checked' : ''} /></div></td>
            <td class="col-check text-center"><div class="form-check d-flex justify-content-center"><input type="checkbox" class="form-check-input chk-create" ${p.canCreate ? 'checked' : ''} /></div></td>
            <td class="col-check text-center"><div class="form-check d-flex justify-content-center"><input type="checkbox" class="form-check-input chk-edit" ${p.canEdit ? 'checked' : ''} /></div></td>
            <td class="col-check text-center"><div class="form-check d-flex justify-content-center"><input type="checkbox" class="form-check-input chk-delete" ${p.canDelete ? 'checked' : ''} /></div></td>
        </tr>`).join("");
}

function setupSelectAll() {
    ["View", "Create", "Edit", "Delete"].forEach(type => {
        document.getElementById(`selectAll${type}`).addEventListener("change", function () {
            document.querySelectorAll(`.chk-${type.toLowerCase()}`).forEach(c => c.checked = this.checked);
        });
    });
}

// ... rest of your filter loading functions (loadCompanies, loadLocations, etc.) ...
async function loadCompanies() {
    const res = await apiFetch("/api/master/company/get-all");
    const json = await res.json();
    DOM.company().innerHTML = `<option value="0">Select Company...</option>` +
        json.data.map(x => `<option value="${x.idCompany}">${x.companyName}</option>`).join("");
    $(DOM.company()).selectpicker('refresh');
}

async function loadLocations(id) {
    const res = await apiFetch(`${API_URL}/get-locations/${id}`);
    const data = await res.json();
    DOM.location().innerHTML = `<option value="0">Select Location...</option>` + data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");
    DOM.location().disabled = false; $(DOM.location()).selectpicker('refresh');
}

async function loadDepartments(id) {
    const res = await apiFetch(`${API_URL}/get-departments/${id}`);
    const data = await res.json();
    DOM.department().innerHTML = `<option value="0">Select Department...</option>` + data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");
    DOM.department().disabled = false; $(DOM.department()).selectpicker('refresh');
}

async function loadUsers(id) {
    const res = await apiFetch(`${API_URL}/get-users/${id}`);
    const data = await res.json();
    DOM.user().innerHTML = `<option value="0">Select User...</option>` + data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");
    DOM.user().disabled = false; $(DOM.user()).selectpicker('refresh');
}

function resetFilters(list) {
    list.forEach(i => {
        DOM[i]().innerHTML = `<option value="0">Select...</option>`;
        DOM[i]().disabled = true; $(DOM[i]()).selectpicker('refresh');
    });
}

function hideGrid() { DOM.gridWrapper().style.display = "none"; DOM.noUserState().style.display = "block"; }

async function saveRights() {
    const userId = DOM.user().value;
    const permissions = [];
    DOM.tbody().querySelectorAll("tr").forEach(tr => {
        permissions.push({
            pageId: parseInt(tr.getAttribute("data-page-id")),
            canView: tr.querySelector(".chk-view").checked,
            canCreate: tr.querySelector(".chk-create").checked,
            canEdit: tr.querySelector(".chk-edit").checked,
            canDelete: tr.querySelector(".chk-delete").checked
        });
    });
    try {
        const res = await apiFetch(`${API_URL}/save`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: Number(userId), permissions }) });
        const json = await res.json();
        if (json.success) showToast("success", "User Rights are Updated Successfully!");
    } catch (e) { showToast("danger", "Error saving"); }
}
