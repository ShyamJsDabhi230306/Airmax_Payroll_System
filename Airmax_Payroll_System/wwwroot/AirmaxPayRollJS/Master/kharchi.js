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
    save: () => document.getElementById("btnSave")
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

    DOM.department().addEventListener("change", loadEmployees);
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

// ======================================================
// AUTO KHARCHI NO
// ======================================================
function generateKharchiNo() {
    const random = Math.floor(Math.random() * 10000);
    DOM.kharchiNo().value = "KH-" + random;
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
}

// ======================================================
// LOAD EMPLOYEES
// ======================================================
async function loadEmployees() {

    const idDepartment = DOM.department().value;

    if (!idDepartment) {
        DOM.grid().innerHTML = "";
        return;
    }

    const res = await apiFetch(`/api/master/employee/by-department/${idDepartment}`);
    const json = await safeJson(res);

    if (!json || !json.success) return;

    DOM.grid().innerHTML = "";

    json.data.forEach((emp, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td class="emp-code">${emp.employeeCode}</td>
            <td>${emp.employeeName}</td>
            <td>
                <input type="number"
                       class="form-control amount"
                       data-id="${emp.idEmployee}"
                       value="0" />
            </td>
            <td class="text-center">
                <input type="checkbox" class="allowCalc" checked />
            </td>
        `;

        DOM.grid().appendChild(tr);
    });
}

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

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(d.employeeName || "")}</td>
            <td>${escapeHtml(d.departmentName || "")}</td>
            <td>${escapeHtml(d.kharchiMonth || "")}</td>
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

 ======================================================
 EDIT ENTRY (KHARCHI)
 ======================================================
async function editEntry(id) {

    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await safeJson(res);

    if (!json || !json.success) return;

    const d = json.data;

    // ==================================================
    // 🔹 BASIC
    // ==================================================
    DOM.id().value = d.idEmployeeKharchi || 0;
    DOM.kharchiNo().value = d.kharchiNo || "";

    DOM.kharchiDate().value = d.kharchiDate
        ? d.kharchiDate.split('T')[0].substring(0, 7) // yyyy-MM
        : "";

    DOM.date().value = d.date
        ? d.date.split('T')[0]
        : "";

    // ==================================================
    // 🔹 DEPARTMENT
    // ==================================================
    await loadDepartment();
    DOM.department().value = d.idDepartment || "";

    // ==================================================
    // 🔹 LOAD EMPLOYEES GRID
    // ==================================================
    await loadEmployees();

    // ==================================================
    // 🔹 SET DETAILS (IMPORTANT 🔥)
    // ==================================================
    if (d.details && d.details.length > 0) {

        d.details.forEach(item => {

            const row = document.querySelector(
                `input[data-id="${item.idEmployee}"]`
            );

            if (row) {

                // amount
                row.value = item.amount || 0;

                // checkbox
                const chk = row.closest("tr").querySelector(".allowCalc");
                if (chk) {
                    chk.checked = item.allowForCalculate || false;
                }
            }

        });
    }

    // ==================================================
    // 🔹 SHOW MODAL
    // ==================================================
    entryModal.show();
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
async function saveData() {

    if (!DOM.department().value) {
        showToast("danger", "Select Department", "Kharchi");
        return;
    }

    if (!DOM.date().value) {
        showToast("danger", "Select Entry Date", "Kharchi");
        return;
    }

    if (!DOM.kharchiDate().value) {
        showToast("danger", "Select Kharchi Month", "Kharchi");
        return;
    }

    const details = [];

    document.querySelectorAll("#tblEmployeeBody tr").forEach(row => {

        const amount = parseFloat(row.querySelector(".amount").value || 0);

        if (amount > 0) {
            details.push({
                employeeCode: row.querySelector(".emp-code").innerText,
                idEmployee: row.querySelector(".amount").dataset.id,
                amount: amount,
                allowForCalculate: row.querySelector(".allowCalc").checked
            });
        }

    });

    if (details.length === 0) {
        showToast("danger", "Enter amount", "Kharchi");
        return;
    }

    const dto = {

        kharchiNo: DOM.kharchiNo().value,
        kharchiDate: formatMonthToDate(DOM.kharchiDate().value),
        date: DOM.date().value,
        idDepartment: Number(DOM.department().value),

        details: details.map(d => ({
            employeeCode: d.employeeCode,
            IDEmployee: Number(d.idEmployee),
            amount: d.amount,
            allowForCalculate: d.allowForCalculate
        }))
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

        showToast("success", json.message, "Kharchi");

        entryModal.hide();
        bindTable();

    }
    catch (err) {
        showToast("danger", err.message, "Kharchi");
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
    DOM.kharchiNo().value = "";
    DOM.kharchiDate().value = "";
    DOM.date().value = "";
    DOM.department().value = "";
    DOM.grid().innerHTML = "";
}