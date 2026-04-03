// ======================================================
// CONFIG
// ======================================================
const API = "/api/transaction/kharchi";
let entryModal = null;

// ======================================================
// SAFE JSON
// ======================================================
async function safeJson(res) {
    if (!res.ok) return null;
    try { return await res.json(); }
    catch { return null; }
}

// ======================================================
// DOM
// ======================================================
const DOM = {
    id: () => document.getElementById("IDEmployeeKharchi"),
    kharchiNo: () => document.getElementById("KharchiNo"),
    kharchiDate: () => document.getElementById("KharchiDate"),
    date: () => document.getElementById("Date"),
    department: () => document.getElementById("IDDepartment"),

    grid: () => document.getElementById("tblEmployeeBody"),
    tbody: () => document.getElementById("tblBody"),

    modal: () => document.getElementById("addModal"),
    save: () => document.getElementById("btnSave"),



    // 🔥 ADD THIS
    employeeDropdown: () => document.getElementById("ddlEmployee")
};

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    if (!DOM.tbody()) return;

    await loadDepartment();
    await bindTable();

    $('#kharchiList').DataTable({
        searching: true,
        pageLength: 10,
        ordering: false,
        destroy: true,
        language: {
            paginate: {
                next: '<i class="fa fa-angle-double-right"></i>',
                previous: '<i class="fa fa-angle-double-left"></i>'
            }
        }
    });

    entryModal = new bootstrap.Modal(DOM.modal(), { backdrop: "static" });

    DOM.modal().addEventListener("hidden.bs.modal", clearForm);
    DOM.modal().addEventListener("shown.bs.modal", onModalOpen);

    //DOM.department().addEventListener("change", loadEmployees);
    DOM.department().addEventListener("change", async () => {
        await loadEmployees();
    });
    DOM.date().addEventListener("change", autoSetMonthYear);
    DOM.save().addEventListener("click", saveData);
});

// ======================================================
// MODAL INIT
// ======================================================
function onModalOpen() {
    clearForm();
    generateKharchiNo();
    setCurrentDate();
}


function addNewEntry() {
    clearForm();
    generateKharchiNo();
    setCurrentDate();
    entryModal.show();
}
// ======================================================
// AUTO KHARCHI NO
// ======================================================
// UPDATE THIS FUNCTION
async function generateKharchiNo() {
    try {
        // This calls the API we saw in your controller earlier
        const res = await apiFetch(`${API}/generate-no`);
        const json = await res.json();
        if (json.success) {
            DOM.kharchiNo().value = json.data; // Server returns KH-001...
        }
    } catch (e) {
        // Fallback if API fails
        DOM.kharchiNo().value = "KH-" + Math.floor(Math.random() * 1000);
    }
}

function onModalOpen() {
    const currentId = parseInt(DOM.id().value) || 0;
    if (currentId === 0) {
        clearForm();
        generateKharchiNo(); // This calls the API to get "001"
        setCurrentDate();
    } else {
        // During an EDIT, the Kharchi No should NOT change
        // It stays as whatever was returned from your Edit API
    }
}
// 🔥 DELETE BOTH OLD 'onModalOpen' FUNCTIONS AND REPLACE WITH THIS ONE:
function onModalOpen() {
    const currentId = parseInt(DOM.id().value) || 0;
    const currentNo = (DOM.kharchiNo().value || "").trim();

    // 1. If it's a NEW record (ID is 0) AND no number is assigned yet
    if (currentId === 0 && currentNo === "") {
        generateKharchiNo(); // Fetch 001, 002 etc. from server
        setCurrentDate();
    }
    // 2. If it's an EDIT, do nothing (keep the server's number)
}

// ======================================================
// LOAD DEPARTMENT
// ======================================================
async function loadDepartment() {
    const res = await apiFetch(`/api/master/department/get-all`);
    const json = await safeJson(res);
    if (!json || !json.success) return;

    DOM.department().innerHTML =
        `<option value="">Select Department</option>` +
        json.data.map(d =>
            `<option value="${d.idDepartment}">${d.departmentName}</option>`
        ).join("");

    // 🔥 ADD THIS LINE
    if (typeof $ !== 'undefined' && $.fn.selectpicker) {
        $(DOM.department()).selectpicker('refresh');
    }
}



async function loadEmployees() {
    const idDepartment = DOM.department().value;
    const ddl = DOM.employeeDropdown();

    ddl.innerHTML = '<option value="">Loading...</option>';
    if (typeof $ !== 'undefined' && $.fn.selectpicker) $(ddl).selectpicker('refresh'); // Clear UI

    if (!idDepartment) return;

    const res = await fetch(`/api/master/employee/by-department/${idDepartment}`);
    const json = await res.json();

    ddl.innerHTML = '<option value="">Select Employee</option>';
    const employees = json.data || [];

    if (employees.length === 0) {
        ddl.innerHTML = '<option value="">No Employees Found</option>';
        if (typeof $ !== 'undefined' && $.fn.selectpicker) $(ddl).selectpicker('refresh');
        return;
    }

    employees.forEach(emp => {
        const opt = document.createElement("option");
        opt.value = emp.idEmployee; // Ensure this matches your API casing (idEmployee)
        opt.textContent = emp.employeeName;
        opt.setAttribute("data-code", emp.employeeCode);
        ddl.appendChild(opt);
    });

    // 🔥 ADD THIS LINE AT THE END
    if (typeof $ !== 'undefined' && $.fn.selectpicker) {
        $(ddl).selectpicker('refresh');
    }
}
// ======================================================
// ADD EMPLOYEE TO GRID
// ======================================================
function addEmployeeRow() {
    const ddl = DOM.employeeDropdown();
    const selected = ddl.options[ddl.selectedIndex];

    // If "Select Employee" or empty is chosen, do nothing
    if (!ddl.value) return;

    const id = ddl.value;
    const name = selected.text;
    const code = selected.getAttribute("data-code") || ""; // Safety check for code

    const tbody = DOM.grid();

    // Prevent duplicates
    if (tbody.querySelector(`tr[data-id="${id}"]`)) {
        showToast("warning", "Employee already added", "Kharchi");
        ddl.value = "";
        if ($.fn.selectpicker) $(ddl).selectpicker('refresh');
        return;
    }

    const tr = document.createElement("tr");
    tr.setAttribute("data-id", id);
    tr.innerHTML = `
        <td class="sr"></td>
        <td class="emp-code">${code}</td>
        <td>${name}</td>
        <td>
            <input type="number" 
                   class="form-control amount" 
                   data-id="${id}" 
                   value="0" />
        </td>
        <td class="text-center">
            <input type="checkbox" class="allowCalc" checked />
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm remove">X</button>
        </td>
    `;

    tbody.appendChild(tr);

    // Bind remove event
    tr.querySelector(".remove").onclick = () => {
        tr.remove();
        updateSrNo();
    };

    // Update Serial Numbers
    updateSrNo();

    // Reset dropdown for next selection
    ddl.value = "";
    if (typeof $ !== 'undefined' && $.fn.selectpicker) {
        $(ddl).selectpicker('refresh');
    }

    // 🔥 FOCUS ON AMOUNT FIELD AUTOMATICALLY
    tr.querySelector(".amount").focus();
    tr.querySelector(".amount").select();
}

// ======================================================
// Serial Number calculation (REQUIRED)
// ======================================================
function updateSrNo() {
    const rows = document.querySelectorAll("#tblEmployeeBody tr");
    rows.forEach((row, index) => {
        const srCell = row.querySelector(".sr");
        if (srCell) srCell.innerText = index + 1;
    });
}

// ======================================================
// LOAD EMPLOYEES
// ======================================================
//async function loadEmployees() {

//    const idDepartment = DOM.department().value;

//    if (!idDepartment) {
//        DOM.grid().innerHTML = "";
//        return;
//    }

//    const res = await apiFetch(`/api/master/employee/by-department/${idDepartment}`);
//    const json = await safeJson(res);

//    if (!json || !json.success) return;

//    DOM.grid().innerHTML = "";

//    json.data.forEach((emp, index) => {

//        const tr = document.createElement("tr");

//        tr.innerHTML = `
//            <td>${index + 1}</td>
//            <td class="emp-code">${emp.employeeCode}</td>
//            <td>${emp.employeeName}</td>
//            <td>
//                <input type="number"
//                       class="form-control amount"
//                       data-id="${emp.idEmployee}"
//                       value="0" />
//            </td>
//            <td class="text-center">
//                <input type="checkbox" class="allowCalc" checked />
//            </td>
//        `;

//        DOM.grid().appendChild(tr);
//    });
//}

// ======================================================
// BIND TABLE
// ======================================================



async function bindTable() {

    const res = await apiFetch(`${API}/get-all`);
    const json = await safeJson(res);

    if (!json || !json.success) return;

    const tbody = DOM.tbody();
    tbody.innerHTML = "";

    json.data.forEach((d, index) => {
        // 🔥 CHANGE THIS: Instead of d.kharchiMonth, use d.kharchiDate and format it
        const monthDisplay = d.kharchiDate
            ? new Date(d.kharchiDate).toLocaleString('default', { month: 'long', year: 'numeric' })
            : "";
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(d.employeeName || "")}</td>
            <td>${escapeHtml(d.departmentName || "")}</td>
            <td>${monthDisplay}</td>
            <td>${escapeHtml(String(d.amount || ""))}</td>

            <td class="text-center">
                <div class="d-flex justify-content-center">
                    <a onclick="editEntry(${d.idEmployeeKharchi})"
                       class="btn btn-primary btn-xs sharp me-1">
                       <i class="fa fa-pencil"></i>
                    </a>
                    <a onclick="deleteEntry(${d.idEmployeeKharchi})"
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
// UPDATED EDIT BLOCK
// ======================================================
async function editEntry(id) {
    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await safeJson(res);

    if (!json || !json.success || !json.data) {
        showToast("error", "Data not found", "Kharchi");
        return;
    }

    const master = json.data;

    // 1. Fill Header Fields
    clearForm();
    DOM.id().value = master.idEmployeeKharchi || id;
    DOM.kharchiNo().value = master.kharchiNo || "";
    DOM.kharchiDate().value = master.kharchiDate ? master.kharchiDate.split('T')[0].substring(0, 7) : "";
    DOM.date().value = master.date ? master.date.split('T')[0] : "";

    // 2. Set Department
    await loadDepartment();
    DOM.department().value = master.idDepartment;
    if ($.fn.selectpicker) $(DOM.department()).selectpicker('refresh');

    // 3. Clear & Populate the Employee Grid
    const tbody = DOM.grid();
    tbody.innerHTML = "";

    // 🔥 Check the 'details' array we added to the backend
    if (master.details && master.details.length > 0) {
        master.details.forEach((item, index) => {
            const tr = document.createElement("tr");
            tr.setAttribute("data-id", item.idEmployee);

            tr.innerHTML = `
                <td class="sr">${index + 1}</td>
                <td class="emp-code">${item.employeeCode || ""}</td>
                <td>${item.employeeName || ""}</td>
                <td>
                    <input type="number" 
                           class="form-control amount" 
                           data-id="${item.idEmployee}" 
                           value="${item.amount || 0}" />
                </td>
                <td class="text-center">
                    <input type="checkbox" class="allowCalc" ${item.allowForCalculate ? "checked" : ""} />
                </td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm remove">X</button>
                </td>
            `;
            tbody.appendChild(tr);

            // Bind remove button
            tr.querySelector(".remove").onclick = () => {
                tr.remove();
                updateSrNo();
            };
        });
    }

    updateSrNo();
    entryModal.show();
}

// Helper to load blank grid for a department
async function loadEmployeesForGrid(deptId) {
    const res = await fetch(`/api/master/employee/by-department/${deptId}`);
    const json = await res.json();
    if (!json.success) return;

    const tbody = DOM.grid();
    json.data.forEach((emp, index) => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", emp.idEmployee);
        tr.innerHTML = `
            <td class="sr">${index + 1}</td>
            <td class="emp-code">${emp.employeeCode}</td>
            <td>${emp.employeeName}</td>
            <td><input type="number" class="form-control amount" data-id="${emp.idEmployee}" value="0" /></td>
            <td class="text-center"><input type="checkbox" class="allowCalc" checked /></td>
            <td><button type="button" class="btn btn-danger btn-sm remove">X</button></td>
        `;
        tbody.appendChild(tr);
    });
}





// ======================================================
// DELETE
// ======================================================
async function deleteEntry(id) {

    const ok = await confirmDelete("Delete this record?");
    if (!ok) return;

    const res = await apiFetch(`${API}/delete/${id}`, {
        method: "DELETE"
    });

    const json = await safeJson(res);

    if (!json || !json.success) return;

    showToast("success", json.message, "Kharchi");
    bindTable();
}

// ======================================================
// DATE FUNCTIONS
// ======================================================
function setCurrentDate() {

    const today = new Date();

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    DOM.date().value = `${yyyy}-${mm}-${dd}`;
}

function formatMonthToDate(monthVal) {
    if (!monthVal) return null;
    return monthVal + "-01";
}

function autoSetMonthYear() {

    const dateVal = DOM.date().value;
    if (!dateVal) return;

    const dt = new Date(dateVal);
    console.log("Month:", dt.getMonth() + 1, "Year:", dt.getFullYear());
}

// ======================================================
// SAVE (UNCHANGED)
// ======================================================
//async function saveData() {

//    if (!DOM.department().value) {
//        showToast("danger", "Select Department", "Kharchi");
//        return;
//    }

//    if (!DOM.date().value) {
//        showToast("danger", "Select Entry Date", "Kharchi");
//        return;
//    }

//    if (!DOM.kharchiDate().value) {
//        showToast("danger", "Select Kharchi Month", "Kharchi");
//        return;
//    }

//    const details = [];

//    document.querySelectorAll("#tblEmployeeBody tr").forEach(row => {

//        const amount = parseFloat(row.querySelector(".amount").value || 0);

//        if (amount > 0) {
//            details.push({
//                employeeCode: row.querySelector(".emp-code").innerText,
//                idEmployee: row.querySelector(".amount").dataset.id,
//                amount: amount,
//                allowForCalculate: row.querySelector(".allowCalc").checked
//            });
//        }

//    });

//    if (details.length === 0) {
//        showToast("danger", "Enter amount", "Kharchi");
//        return;
//    }

//    const dto = {

//        kharchiNo: DOM.kharchiNo().value,
//        kharchiDate: formatMonthToDate(DOM.kharchiDate().value),
//        date: DOM.date().value,
//        idDepartment: Number(DOM.department().value),

//        details: details.map(d => ({
//            employeeCode: d.employeeCode,
//            IDEmployee: Number(d.idEmployee),
//            amount: d.amount,
//            allowForCalculate: d.allowForCalculate
//        }))
//    };

//    DOM.save().disabled = true;

//    try {

//        const res = await apiFetch(`${API}/save`, {
//            method: "POST",
//            headers: { "Content-Type": "application/json" },
//            body: JSON.stringify(dto)
//        });

//        const json = await res.json();

//        if (!json.success)
//            throw new Error(json.message);

//        showToast("success", json.message, "Kharchi");

//        entryModal.hide();
//        bindTable();

//    }
//    catch (err) {
//        showToast("danger", err.message, "Kharchi");
//    }
//    finally {
//        DOM.save().disabled = false;
//    }
//}

// ======================================================
// CLEAR FORM
// ======================================================



async function saveData() {
    // 1. Validation
    if (!DOM.department().value) {
        showToast("danger", "Please select a department.");
        return;
    }
    if (!DOM.kharchiDate().value) {
        showToast("danger", "Please select Kharchi Month.");
        return;
    }

    // 2. Build Details JSON
    const details = [];
    document.querySelectorAll("#tblEmployeeBody tr").forEach(row => {
        const amtInput = row.querySelector(".amount");
        const amount = parseFloat(amtInput.value || 0);

        if (amount > 0) {
            details.push({
                // 🔥 These MUST match your C# Detail DTO exactly
                EmployeeCode: (row.querySelector(".emp-code").innerText || "").trim(),
                IDEmployee: parseInt(amtInput.dataset.id) || 0,
                Amount: amount,
                AllowForCalculate: row.querySelector(".allowCalc").checked
            });
        }
    });

    if (details.length === 0) {
        showToast("danger", "Please add at least one employee with an amount.");
        return;
    }

    // 3. Build the DTO object
    const dto = {
        // 🔥 Ensure names match your C# class exactly (PascalCase)
        IDEmployeeKharchi: parseInt(DOM.id().value) || 0,
        KharchiNo: DOM.kharchiNo().value,
        KharchiDate: formatMonthToDate(DOM.kharchiDate().value),
        Date: DOM.date().value || new Date().toISOString().split('T')[0], // Fallback to today
        IDDepartment: parseInt(DOM.department().value) || 0,
        Details: details
    };

    console.log("FINAL SAVE PAYLOAD:", dto);

    DOM.save().disabled = true;
    try {
        const res = await apiFetch(`${API}/save`, {
            method: "POST",
            body: JSON.stringify(dto)
        });

        // 4. Handle Errors Correctly
        if (res.status === 400) {
            const errJson = await res.json();
            console.error("400 VALIDATION ERRORS:", errJson);
            throw new Error("Validation Error: Please check required fields (Date/ID).");
        }

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast("success", json.message);
        entryModal.hide();
        bindTable();
    } catch (err) {
        showToast("danger", err.message);
    } finally {
        DOM.save().disabled = false;
    }
}

function clearForm() {

    DOM.id().value = 0;
    DOM.kharchiNo().value = "";
    DOM.kharchiDate().value = "";
    DOM.date().value = "";
    DOM.department().value = "";
    DOM.grid().innerHTML = "";
}