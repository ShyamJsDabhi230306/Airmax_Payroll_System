//// ======================================================
//// CONFIG
//// ======================================================
//const API_URL = "/api/master/userrights";



//// Example of how your global apiFetch should look to handle Authorization:
//async function apiFetch(url, options = {}) {
//    const token = localStorage.getItem("auth_token");

//    options.headers = {
//        ...options.headers,
//        "Authorization": "Bearer " + token // 🛡️ Adds the token automatically
//    };

//    return await fetch(url, options);
//}

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
//// SAFE FETCH HELPER
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
//// INIT
//// ======================================================
////document.addEventListener("DOMContentLoaded", async () => {

////    // 1. Initial Load
////    await loadCompanies();

////    // 2. Event Listeners (Cascading)
////    DOM.company().addEventListener("change", async function () {
////        const id = this.value;
////        resetFilters(["location", "department", "user"]);
////        if (id > 0) await loadLocations(id);
////    });

////    DOM.location().addEventListener("change", async function () {
////        const id = this.value;
////        resetFilters(["department", "user"]);
////        if (id > 0) await loadDepartments(id);
////    });

////    DOM.department().addEventListener("change", async function () {
////        const id = this.value;
////        resetFilters(["user"]);
////        if (id > 0) await loadUsers(id);
////    });

////    DOM.user().addEventListener("change", async function () {
////        const id = this.value;
////        if (id > 0) {
////            DOM.gridWrapper().style.display = "block";
////            DOM.noUserState().style.display = "none";
////            await loadPermissions(id);
////        } else {
////            DOM.gridWrapper().style.display = "none";
////            DOM.noUserState().style.display = "block";
////        }
////    });

////    DOM.btnSave().addEventListener("click", saveRights);
////});

//// ======================================================
//// DATA LOADING
//// ======================================================
//document.addEventListener("DOMContentLoaded", async function () {
//    const userData = localStorage.getItem("UserData");
//    const token = localStorage.getItem("auth_token");

//    if (!userData || !token) return;

//    const user = JSON.parse(userData);

//    // 🛡️ 1. Correct Role Check (Use roleName)
//    const currentRole = (user.roleName || user.RoleName || "").toLowerCase();
//    if (currentRole === "admin") return;

//    try {
//        // 🛡️ 2. Correct ID Check (Try both IDUser and idUser)
//        const userId = user.IDUser || user.idUser;

//        const response = await fetch(`/api/master/userrights/get-permissions/${userId}`, {
//            headers: {
//                "Authorization": "Bearer " + token,
//                "Content-Type": "application/json"
//            }
//        });

//        if (!response.ok) {
//            console.error("API Error:", response.status);
//            return;
//        }

//        const res = await response.json();

//        if (res.success && res.data) {
//            // Find pages where CanView is FALSE
//            const restrictedPages = res.data
//                .filter(p => p.canView === false)
//                .map(p => p.pageName.trim().toLowerCase());

//            // 🛡️ 3. Hide Restricted Menus from Sidebar
//            document.querySelectorAll("[data-menu]").forEach(li => {
//                const menuName = li.getAttribute("data-menu").trim().toLowerCase();

//                if (restrictedPages.includes(menuName)) {
//                    li.style.display = "none"; // 🧥 Hide Restricted!
//                }
//            });

//            // 🛡️ 4. Handle Page Action Buttons (Edit/Delete)
//            const currentPath = window.location.pathname.toLowerCase();
//            const myRights = res.data.find(p => currentPath.includes(p.pageName.split(' ')[0].toLowerCase()));

//            if (myRights) {
//                if (!myRights.canCreate) document.querySelectorAll(".btn-add, #btnAdd").forEach(e => e.remove());
//                if (!myRights.canEdit) document.querySelectorAll(".btn-edit, #btnSave").forEach(e => e.remove());
//                if (!myRights.canDelete) document.querySelectorAll(".btn-delete, .sharp.btn-danger").forEach(e => e.remove());
//            }
//        }
//    } catch (e) {
//        console.error("Rights Handler System Error:", e);
//    }
//});

//async function loadCompanies() {
//    const res = await apiFetch("/api/master/company/get-all");
//    const json = await safeJson(res);
//    if (!json || !json.success) return;

//    DOM.company().innerHTML = `<option value="0">Select Company</option>` +
//        json.data.map(x => `<option value="${x.idCompany}">${x.companyName}</option>`).join("");

//    if ($.fn.selectpicker) $(DOM.company()).selectpicker('refresh');
//}

//async function loadLocations(companyId) {
//    const res = await apiFetch(`${API_URL}/get-locations/${companyId}`);
//    const data = await safeJson(res); // Use your safeJson helper

//    if (data) {
//        DOM.location().innerHTML = `<option value="0">Select Location</option>` +
//            data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

//        DOM.location().disabled = false;
//        $(DOM.location()).selectpicker('refresh');
//    }
//}
//// 🏢 2. Load Departments (Added Auth support)
//async function loadDepartments(locationId) {
//    const res = await apiFetch(`${API_URL}/get-departments/${locationId}`);
//    const data = await safeJson(res);

//    if (data) {
//        DOM.department().innerHTML = `<option value="0">Select Department</option>` +
//            data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

//        DOM.department().disabled = false;
//        $(DOM.department()).selectpicker('refresh');
//    }
//}

//// 👤 3. Load Users (Added Auth support)
//async function loadUsers(deptId) {
//    const res = await apiFetch(`${API_URL}/get-users/${deptId}`);
//    const data = await safeJson(res);

//    if (data) {
//        DOM.user().innerHTML = `<option value="0">Select User</option>` +
//            data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

//        DOM.user().disabled = false;
//        $(DOM.user()).selectpicker('refresh');
//    }
//}

//async function loadPermissions(userId) {
//    const res = await apiFetch(`${API_URL}/get-permissions/${userId}`);
//    const json = await safeJson(res);
//    if (!json || !json.success) return;

//    DOM.tbody().innerHTML = json.data.map(p => `
//        <tr data-page-id="${p.pageId}">
//            <td><strong>${p.pageName}</strong></td>
//            <td class="text-center"><input type="checkbox" class="chk-view" ${p.canView ? 'checked' : ''} /></td>
//            <td class="text-center"><input type="checkbox" class="chk-create" ${p.canCreate ? 'checked' : ''} /></td>
//            <td class="text-center"><input type="checkbox" class="chk-edit" ${p.canEdit ? 'checked' : ''} /></td>
//            <td class="text-center"><input type="checkbox" class="chk-delete" ${p.canDelete ? 'checked' : ''} /></td>
//        </tr>
//    `).join("");
//}

//// ======================================================
//// SAVE DATA
//// ======================================================
//async function saveRights() {
//    const userId = DOM.user().value;
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

//        const json = await safeJson(res);
//        if (!json || !json.success) throw new Error(json?.message || "Save failed");

//        showToast("success", json.message, "User Access Rights");
//    } catch (err) {
//        showToast("danger", err.message, "User Access Rights");
//    } finally {
//        DOM.btnSave().disabled = false;
//    }
//}

//function resetFilters(list) {
//    list.forEach(item => {
//        const el = DOM[item]();
//        el.innerHTML = `<option value="0">Select ${item.charAt(0).toUpperCase() + item.slice(1)}</option>`;
//        el.disabled = true;
//        if ($.fn.selectpicker) $(el).selectpicker('refresh');
//    });
//}



// ======================================================
// CONFIG
// ======================================================
const API_URL = "api/master/userrights";

// ======================================================
// DOM
// ======================================================
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

// ======================================================
// SAFE JSON HELPER
// ======================================================
async function safeJson(res) {
    if (!res || !res.ok) {
        console.error("HTTP Error:", res?.status);
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
// INIT — runs when page loads
// ======================================================
document.addEventListener("DOMContentLoaded", async function () {

    // 1. Load Companies on page load
    await loadCompanies();

    // 2. Company changed → load Locations
    DOM.company().addEventListener("change", async function () {
        const id = this.value;
        resetFilters(["location", "department", "user"]);
        hideGrid();
        if (id > 0) await loadLocations(id);
    });

    // 3. Location changed → load Departments
    DOM.location().addEventListener("change", async function () {
        const id = this.value;
        resetFilters(["department", "user"]);
        hideGrid();
        if (id > 0) await loadDepartments(id);
    });

    // 4. Department changed → load Users
    DOM.department().addEventListener("change", async function () {
        const id = this.value;
        resetFilters(["user"]);
        hideGrid();
        if (id > 0) await loadUsers(id);
    });

    // 5. User changed → load Permissions Grid
    DOM.user().addEventListener("change", async function () {
        const id = this.value;
        if (id > 0) {
            DOM.gridWrapper().style.display = "block";
            DOM.noUserState().style.display = "none";
            await loadPermissions(id);
        } else {
            hideGrid();
        }
    });

    // 6. Save button
    DOM.btnSave().addEventListener("click", saveRights);
});

// ======================================================
// HIDE GRID HELPER
// ======================================================
function hideGrid() {
    DOM.gridWrapper().style.display = "none";
    DOM.noUserState().style.display = "block";
}

// ======================================================
// LOAD COMPANIES
// ======================================================
async function loadCompanies() {
    const res = await apiFetch("/api/master/company/get-all");
    if (!res) return;   // null = 401 or 403
    const json = await safeJson(res);
    if (!json || !json.success) return;

    DOM.company().innerHTML =
        `<option value="0">Select Company</option>` +
        json.data.map(x => `<option value="${x.idCompany}">${x.companyName}</option>`).join("");

    if ($.fn.selectpicker) $(DOM.company()).selectpicker('refresh');
}

// ======================================================
// LOAD LOCATIONS
// ======================================================
async function loadLocations(companyId) {
    const res = await apiFetch(`${API_URL}/get-locations/${companyId}`);
    if (!res) return;   // null = 401 or 403
    const data = await safeJson(res);
    if (!data) return;

    DOM.location().innerHTML =
        `<option value="0">Select Location</option>` +
        data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

    DOM.location().disabled = false;
    if ($.fn.selectpicker) $(DOM.location()).selectpicker('refresh');
}

// ======================================================
// LOAD DEPARTMENTS
// ======================================================
async function loadDepartments(locationId) {
    const res = await apiFetch(`${API_URL}/get-departments/${locationId}`);
    if (!res) return;   // null = 401 or 403
    const data = await safeJson(res);
    if (!data) return;

    DOM.department().innerHTML =
        `<option value="0">Select Department</option>` +
        data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

    DOM.department().disabled = false;
    if ($.fn.selectpicker) $(DOM.department()).selectpicker('refresh');
}

// ======================================================
// LOAD USERS
// ======================================================
async function loadUsers(deptId) {
    const res = await apiFetch(`${API_URL}/get-users/${deptId}`);
    if (!res) return;   // null = 401 or 403
    const data = await safeJson(res);
    if (!data) return;

    DOM.user().innerHTML =
        `<option value="0">Select User</option>` +
        data.map(x => `<option value="${x.id}">${x.name}</option>`).join("");

    DOM.user().disabled = false;
    if ($.fn.selectpicker) $(DOM.user()).selectpicker('refresh');
}

// ======================================================
// LOAD PERMISSIONS GRID
// ======================================================
async function loadPermissions(userId) {
    const res = await apiFetch(`${API_URL}/get-permissions/${userId}`);
    if (!res) return;   // null = 401 or 403
    const json = await safeJson(res);
    if (!json || !json.success) return;

    DOM.tbody().innerHTML = json.data.map(p => `
        <tr data-page-id="${p.pageId}">
            <td><strong>${p.pageName}</strong></td>
            <td class="text-center"><input type="checkbox" class="chk-view"   ${p.canView ? 'checked' : ''} /></td>
            <td class="text-center"><input type="checkbox" class="chk-create" ${p.canCreate ? 'checked' : ''} /></td>
            <td class="text-center"><input type="checkbox" class="chk-edit"   ${p.canEdit ? 'checked' : ''} /></td>
            <td class="text-center"><input type="checkbox" class="chk-delete" ${p.canDelete ? 'checked' : ''} /></td>
        </tr>
    `).join("");
}

// ======================================================
// SAVE
// ======================================================
async function saveRights() {
    const userId = DOM.user().value;

    if (!userId || userId == "0") {
        showToast("danger", "Please select a user first.", "User Access Rights");
        return;
    }

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

    const dto = { userId: Number(userId), permissions: permissions };

    DOM.btnSave().disabled = true;
    try {
        const res = await apiFetch(`${API_URL}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        if (!res) return;   // null = 401 or 403

        const json = await safeJson(res);
        if (!json || !json.success) throw new Error(json?.message || "Save failed");

        showToast("success", json.message, "User Access Rights");

    } catch (err) {
        showToast("danger", err.message, "User Access Rights");
    } finally {
        DOM.btnSave().disabled = false;
    }
}

// ======================================================
// RESET FILTERS HELPER
// ======================================================
function resetFilters(list) {
    list.forEach(item => {
        const el = DOM[item]();
        el.innerHTML = `<option value="0">Select ${item.charAt(0).toUpperCase() + item.slice(1)}</option>`;
        el.disabled = true;
        if ($.fn.selectpicker) $(el).selectpicker('refresh');
    });
}
