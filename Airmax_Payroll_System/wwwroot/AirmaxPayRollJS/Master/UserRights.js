const API_URL = "/api/master/userrights";

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
    await loadCompanies();

    DOM.company().addEventListener("change", async function () {
        resetFilters(["location", "department", "user"]);
        if (this.value > 0) await loadLocations(this.value);
    });

    DOM.location().addEventListener("change", async function () {
        resetFilters(["department", "user"]);
        if (this.value > 0) await loadDepartments(this.value);
    });

    DOM.department().addEventListener("change", async function () {
        resetFilters(["user"]);
        if (this.value > 0) await loadUsers(this.value);
    });

    DOM.user().addEventListener("change", async function () {
        if (this.value > 0) {
            DOM.gridWrapper().style.display = "block";
            DOM.noUserState().style.display = "none";
            await loadPermissions(this.value);
        } else {
            DOM.gridWrapper().style.display = "none";
            DOM.noUserState().style.display = "block";
        }
    });

    DOM.btnSave().addEventListener("click", saveRights);
    setupSelectAll();
});

async function loadPermissions(userId) {
    const res = await apiFetch(`${API_URL}/get-permissions/${userId}`);
    const json = await res.json();
    if (!json.success) return;

    // Use exact classes from CSS to maintain alignment
    DOM.tbody().innerHTML = json.data.map(p => `
        <tr data-page-id="${p.pageId}">
            <td class="col-name"><strong>${p.pageName}</strong></td>
            <td class="col-check"><input type="checkbox" class="chk-premium chk-view" ${p.canView ? 'checked' : ''} /></td>
            <td class="col-check"><input type="checkbox" class="chk-premium chk-create" ${p.canCreate ? 'checked' : ''} /></td>
            <td class="col-check"><input type="checkbox" class="chk-premium chk-edit" ${p.canEdit ? 'checked' : ''} /></td>
            <td class="col-check"><input type="checkbox" class="chk-premium chk-delete" ${p.canDelete ? 'checked' : ''} /></td>
        </tr>`).join("");
}

function setupSelectAll() {
    ["View", "Create", "Edit", "Delete"].forEach(type => {
        const id = `selectAll${type}`;
        const selector = `.chk-${type.toLowerCase()}`;
        document.getElementById(id).addEventListener("change", function () {
            document.querySelectorAll(selector).forEach(c => c.checked = this.checked);
        });
    });
}

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
        if (json.success) showToast("success", "Rights Updated Successfully!");
    } catch (e) { showToast("danger", "Error saving"); }
}
