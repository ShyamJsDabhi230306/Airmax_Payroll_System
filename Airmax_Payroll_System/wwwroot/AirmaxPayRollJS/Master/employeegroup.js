// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/employeegroup";
let entryModal = null;

// ======================================================
// DOM
// ======================================================
const DOM = {
    id: () => document.getElementById("IDEmployeeGroup"),
    name: () => document.getElementById("EmployeeGroupName"),
    dept: () => document.getElementById("IDDepartment"),
    isActive: () => document.getElementById("IsActive"),

    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal"),
    save: () => document.getElementById("btnSave")
};

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    await loadDepartment();
    await bindTable();
    $('#groupList').DataTable({
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

    await loadDepartment();

    DOM.save().addEventListener("click", saveData);
});

// ======================================================
// LOAD DEPARTMENT
// ======================================================
//async function loadDepartment() {



//    //const res = await fetch("/api/master/department/get-all");
//    //const json = await res.json();
//    // 1. Get the token you saved during login
//    const token = localStorage.getItem("auth_token");
//    // 2. Add the headers to your fetch call
//    const response = await fetch("/api/master/department/get-all", {
//        method: "GET",
//        headers: {
//            "Authorization": "Bearer " + token, // 👈 THIS IS THE FIX
//            "Content-Type": "application/json"
//        }
//    });

//    if (!response.success) return;

//    DOM.dept().innerHTML =
//        `<option value="">-- Select Department --</option>` +
//        json.data.map(d =>
//            `<option value="${d.idDepartment}">${d.departmentName}</option>`
//        ).join("");

//    $(DOM.dept()).selectpicker('refresh');
//}


async function loadDepartment() {

    // We use your global apiFetch which automatically handles the token
    const res = await apiFetch("/api/master/department/get-all");
    if (!res) return;

    const json = await res.json();
    if (!json.success) return;

    DOM.dept().innerHTML =
        `<option value="">-- Select Department --</option>` +
        json.data.map(d =>
            `<option value="${d.idDepartment}">${d.departmentName}</option>`
        ).join("");

    if ($.fn.selectpicker) $(DOM.dept()).selectpicker('refresh');
}


// ======================================================
// BIND TABLE
// ======================================================
async function bindTable() {

    //const res = await fetch(`${API}/get-all`);
    //const json = await res.json();

    const res = await apiFetch(`${API}/get-all`);
    if (!res) return;
    const json = await res.json();

    if (!json.success) return;

    const tbody = DOM.tbody();
    tbody.innerHTML = "";

    json.data.forEach(d => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(d.employeeGroupName || "")}</td>
             <td>${escapeHtml(d.departmentName || "")}</td>
          

            <td class="text-center">
                <div class="d-flex justify-content-center">
                    <a onclick="editEntry(${d.idEmployeeGroup})"
                       class="btn btn-primary btn-xs sharp me-1">
                        <i class="fa fa-pencil"></i>
                    </a>

                    <a onclick="deleteEntry(${d.idEmployeeGroup})"
                       class="btn btn-danger btn-xs sharp">
                        <i class="fa fa-trash"></i>
                    </a>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    //if ($.fn.DataTable.isDataTable('#groupList')) {
    //    $('#groupList').DataTable().destroy();
    //}

    
}

// ======================================================
// EDIT
// ======================================================
async function editEntry(id) {

    //const res = await fetch(`${API}/get-by-id/${id}`);
    //const json = await res.json();
    const res = await apiFetch(`${API}/get-by-id/${id}`);
    if (!res) return;
    const json = await res.json();

    if (!json.success) return;

    const d = json.data;
    DOM.id().value = d.idEmployeeGroup;
    DOM.name().value = d.employeeGroupName || "";
    DOM.isActive().checked = d.isActive || false;
    // Properly sets the dropdown value so it becomes visible on screen
    if (d.idDepartment) {
        $(DOM.dept()).val(d.idDepartment);
    } else {
        $(DOM.dept()).val("");
    }

    $(DOM.dept()).selectpicker('refresh');

    entryModal.show();
}

// ======================================================
// DELETE
// ======================================================
async function deleteEntry(id) {
    const ok = await confirmDelete("This record will be deleted permanently!");

    if (!ok) return;

    const res = await apiFetch(`${API}/delete/${id}`, { method: "DELETE" });

    // If null, apiFetch already handled 401 (redirect to login)
    if (!res) return;

    // If 403, apiFetch already showed "Access Denied" toast
    if (res.status === 403) return;

    const json = await res.json();

    if (!json.success) {
        showToast("danger", json.message, "Employee Group");
        return;
    }

    showToast("success", json.message, "Employee Group");
    bindTable();
}

// ======================================================
// SAVE
// ======================================================
async function saveData() {

    if (!DOM.name().value.trim()) {
        alert("Group name required");
        return;
    }

    if (!DOM.dept().value) {
        alert("Department required");
        return;
    }

    const dto = {

        idEmployeeGroup: Number(DOM.id().value || 0),
        employeeGroupName: DOM.name().value.trim(),
        idDepartment: Number(DOM.dept().value),
        isActive: DOM.isActive().checked,

        e_By: "Admin" // 🔥 you can replace with session
    };

    DOM.save().disabled = true;

    try {

        const res = await fetch(`${API}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        const json = await res.json();

        if (!json.success)
            throw new Error(json.message);

        alert(json.message);

        entryModal.hide();
        clearForm();
        bindTable();

    } catch (err) {
        alert(err.message);
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
    DOM.name().value = "";
    DOM.dept().value = "";
    DOM.isActive().checked = true;

    $(DOM.dept()).selectpicker('refresh');
}