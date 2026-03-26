// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/employee";
let entryModal = null;

// ======================================================
// DOM
// ======================================================
const DOM = {
    id: () => document.getElementById("IDEmployee"),

    employeeCode: () => document.getElementById("EmployeeCode"),
    name: () => document.getElementById("EmployeeName"),
    contact: () => document.getElementById("Emp_ContactNo"),
    email: () => document.getElementById("EmailID"),
    joiningDate: () => document.getElementById("JoiningDate"),

    company: () => document.getElementById("IDCompany"),
    location: () => document.getElementById("IDLocation"),
    department: () => document.getElementById("IDDepartment"),
    shift: () => document.getElementById("IDShift"),
    designation: () => document.getElementById("IDDesignation"),
    group: () => document.getElementById("IDEmployeeGroup"),

    save: () => document.getElementById("btnSave"),
    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal")
};

// ======================================================
// SAFE JSON
// ======================================================
async function safeJson(res) {
    if (!res.ok) return null;
    try { return await res.json(); }
    catch { return null; }
}

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    await bindTable();
    await loadCompany();

    // 🔥 LOAD INDEPENDENT DROPDOWNS
    await loadShift();
    await loadDesignation();
    await loadGroup();

    $('#employeeList').DataTable({
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

    // ==================================================
    // 🔥 CHAINING (ONLY 2 LEVEL)
    // ==================================================

    // COMPANY → LOCATION
    DOM.company().addEventListener("change", () => {

        const id = DOM.company().value;

        DOM.location().innerHTML = `<option value="">Select Location</option>`;
        DOM.department().innerHTML = `<option value="">Select Department</option>`;

        loadLocation(id);
    });

    // LOCATION → DEPARTMENT
    DOM.location().addEventListener("change", () => {

        const id = DOM.location().value;

        DOM.department().innerHTML = `<option value="">Select Department</option>`;

        loadDepartment(id);
    });

    entryModal = new bootstrap.Modal(DOM.modal(), { backdrop: "static" });

    DOM.modal().addEventListener("hidden.bs.modal", clearForm);
    DOM.save().addEventListener("click", saveData);
});

// ======================================================
// TABLE
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
            <td>${escapeHtml(d.employeeName)}</td>
            <td>${escapeHtml(d.emp_ContactNo || "")}</td>
            <td>${escapeHtml(d.emailID || "")}</td>
            <td>${escapeHtml(d.companyName || "")}</td>
            <td>${escapeHtml(String(d.salary || ""))}</td>
            <td class="text-center">
                <div class="d-flex">
                    <a onclick="editEntry(${d.idEmployee})"
                       class="btn btn-primary btn-xs sharp me-1">
                       <i class="fa fa-pencil"></i>
                    </a>
                    <a onclick="deleteEntry(${d.idEmployee})"
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
    const json = await safeJson(res);

    if (!json || !json.success) return;

    const d = json.data;

    // 🔹 BASIC
    DOM.id().value = d.idEmployee || 0;
    DOM.employeeCode().value = d.employeeCode || "";
    DOM.name().value = d.employeeName || "";
    document.getElementById("Emp_Address").value = d.emp_Address || "";
    DOM.contact().value = d.emp_ContactNo || "";
    DOM.email().value = d.emailID || "";
    DOM.joiningDate().value = d.joiningDate
        ? d.joiningDate.split('T')[0]
        : "";
    document.getElementById("BloodGroup").value = d.bloodGroup || "";

    // 🔹 DROPDOWNS
    await loadCompany();
    $('#IDCompany').val(String(d.idCompany || "")).selectpicker('refresh');

    await loadLocation(d.idCompany);
    $('#IDLocation').val(String(d.idLocation || "")).selectpicker('refresh');

    await loadDepartment(d.idLocation);
    $('#IDDepartment').val(String(d.idDepartment || "")).selectpicker('refresh');

    // 🔥 INDEPENDENT
    $('#IDShift').val(String(d.idShift || "")).selectpicker('refresh');
    $('#IDDesignation').val(String(d.idDesignation || "")).selectpicker('refresh');
    $('#IDEmployeeGroup').val(String(d.idEmployeeGroup || "")).selectpicker('refresh');

    // 🔹 SALARY
    document.getElementById("Salary").value = d.salary ?? "";
    document.getElementById("SecondSalary").value = d.secondSalary ?? "";
    document.getElementById("BonusPercentage").value = d.bonusPercentage ?? "";
    document.getElementById("LeavePercentage").value = d.leavePercentage ?? "";
    document.getElementById("TeaCoffeeAmt").value = d.teaCoffeeAmt ?? "";
    document.getElementById("DAPercentage").value = d.daPercentage ?? "";
    document.getElementById("DefaultLateHrs").value = d.defaultLateHrs ?? "";

    // 🔹 BANK
    document.getElementById("AadharNo").value = d.aadharNo || "";
    document.getElementById("PanNo").value = d.panNo || "";
    document.getElementById("BankName").value = d.bankName || "";
    document.getElementById("BankACNo").value = d.bankACNo || "";
    document.getElementById("IFSCCode").value = d.ifscCode || "";

    // 🔹 PF / OTHER
    document.getElementById("UAN").value = d.uan || "";
    document.getElementById("PFNo").value = d.pfNo || "";

    document.getElementById("CalculatePF").checked = d.calculatePF || false;
    document.getElementById("CalculateDA").checked = d.calculateDA || false;
    document.getElementById("ApplyPFBonus").checked = d.applyPFBonus || false;
    document.getElementById("HasDifferentBankAC").checked = d.hasDifferentBankAC || false;

    // 🔹 LOGIN
    document.getElementById("UserName").value = d.userName || "";
    document.getElementById("Password").value = d.password || "";

    // 🔹 LEAVE
    document.getElementById("IsLeave").checked = d.isLeave || false;
    document.getElementById("LeaveDate").value = d.leaveDate || "";


    entryModal.show();
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

    const res = await apiFetch("/api/master/location/get-all");
    const json = await safeJson(res);

    if (!json || !json.success) return;

    const filtered = json.data.filter(l => l.idCompany == companyId);

    DOM.location().innerHTML =
        `<option value="">Select Location</option>` +
        filtered.map(l =>
            `<option value="${l.idLocation}">${l.locationName}</option>`
        ).join("");

    $(DOM.location()).selectpicker('refresh');
}

async function loadDepartment(locationId) {

    const res = await apiFetch("/api/master/department/get-all");
    const json = await safeJson(res);

    if (!json || !json.success) return;

    const filtered = json.data.filter(d => d.idLocation == locationId);

    DOM.department().innerHTML =
        `<option value="">Select Department</option>` +
        filtered.map(d =>
            `<option value="${d.idDepartment}">${d.departmentName}</option>`
        ).join("");

    $(DOM.department()).selectpicker('refresh');
}

// 🔥 INDEPENDENT DROPDOWNS
async function loadShift() {

    const res = await apiFetch("/api/master/shift/get-all");
    const json = await safeJson(res);

    if (!json || !json.success) return;

    DOM.shift().innerHTML =
        `<option value="">Select Shift</option>` +
        json.data.map(s =>
            `<option value="${s.idShift}">${s.shiftDesc}</option>`
        ).join("");

    $(DOM.shift()).selectpicker('refresh');
}

async function loadDesignation() {

    const res = await apiFetch("/api/master/designation/get-all");
    const json = await safeJson(res);

    if (!json || !json.success) return;
    console.log(json.data);
    DOM.designation().innerHTML =
        `<option value="">Select Designation</option>` +
        json.data.map(d =>
            `<option value="${d.idDesignation}">${d.designetion }</option>`
        ).join("");

    $(DOM.designation()).selectpicker('refresh');
}

async function loadGroup() {

    const res = await apiFetch("/api/master/employeegroup/get-all");
    const json = await safeJson(res);

    if (!json || !json.success) return;

    DOM.group().innerHTML =
        `<option value="">Select Employee Group</option>` +
        json.data.map(g =>
            `<option value="${g.idEmployeeGroup}">${g.employeeGroupName}</option>`
        ).join("");

    $(DOM.group()).selectpicker('refresh');
}

// ======================================================
// SAVE
// ======================================================
async function saveData() {

    if (!DOM.name().value.trim()) {
        showToast("danger", "Employee name required", "Employee Master");
        return;
    }

    const dto = {

        idEmployee: Number(DOM.id().value || 0),

        // 🔹 BASIC
        employeeCode: DOM.employeeCode().value || "",
        employeeName: DOM.name().value || "",
        emp_Address: document.getElementById("Emp_Address")?.value || "",
        emp_ContactNo: DOM.contact().value || "",
        emailID: DOM.email().value || "",
        joiningDate: DOM.joiningDate().value || null,
        bloodGroup: document.getElementById("BloodGroup")?.value || null,

        // 🔹 DROPDOWNS
        idCompany: DOM.company().value ? Number(DOM.company().value) : null,
        idLocation: DOM.location().value ? Number(DOM.location().value) : null,
        idDepartment: DOM.department().value ? Number(DOM.department().value) : null,
        idShift: DOM.shift().value ? Number(DOM.shift().value) : null,
        idDesignation: DOM.designation().value ? Number(DOM.designation().value) : null,
        idEmployeeGroup: DOM.group().value ? Number(DOM.group().value) : null,

        // 🔹 SALARY
        salary: document.getElementById("Salary")?.value
            ? Number(document.getElementById("Salary").value)
            : null,
        secondSalary: document.getElementById("SecondSalary")?.value
            ? Number(document.getElementById("SecondSalary").value)
            : null,

        bonusPercentage: document.getElementById("BonusPercentage")?.value
            ? Number(document.getElementById("BonusPercentage").value)
            : null,

        leavePercentage: document.getElementById("LeavePercentage")?.value
            ? Number(document.getElementById("LeavePercentage").value)
            : null,

        teaCoffeeAmt: document.getElementById("TeaCoffeeAmt")?.value
            ? Number(document.getElementById("TeaCoffeeAmt").value)
            : null,

        daPercentage: document.getElementById("DAPercentage")?.value
            ? Number(document.getElementById("DAPercentage").value)
            : null,

        defaultLateHrs: document.getElementById("DefaultLateHrs")?.value
            ? Number(document.getElementById("DefaultLateHrs").value)
            : null,

        // 🔹 BANK
        aadharNo: document.getElementById("AadharNo")?.value || "",
        panNo: document.getElementById("PanNo")?.value || "",
        bankName: document.getElementById("BankName")?.value || "",
        bankACNo: document.getElementById("BankACNo")?.value || "",
        ifscCode: document.getElementById("IFSCCode")?.value || "",

        // 🔹 PF / OTHER
        uan: document.getElementById("UAN")?.value || "",
        pfNo: document.getElementById("PFNo")?.value || "",

        calculatePF: document.getElementById("CalculatePF")?.checked || false,
        calculateDA: document.getElementById("CalculateDA")?.checked || false,
        applyPFBonus: document.getElementById("ApplyPFBonus")?.checked || false,
        hasDifferentBankAC: document.getElementById("HasDifferentBankAC")?.checked || false,

        // 🔹 LOGIN
        userName: document.getElementById("UserName")?.value || "",
        password: document.getElementById("Password")?.value || "",

        // 🔹 LEAVE
        isLeave: document.getElementById("IsLeave")?.checked || false,
        leaveDate: document.getElementById("LeaveDate")?.value || null,

        // 🔹 REMARK
        remark: document.getElementById("Remark")?.value || ""
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

        showToast("success", json.message, "Employee Master");

        entryModal.hide();
        clearForm();
        bindTable();

    } catch (err) {
        showToast("danger", err.message, "Employee Master");
    }
    finally {
        DOM.save().disabled = false;
    }
}
// ======================================================
// DELETE
// ======================================================
async function deleteEntry(id) {

    const ok = await confirmDelete("Delete this employee?");
    if (!ok) return;

    const res = await apiFetch(`${API}/delete/${id}`, {
        method: "DELETE"
    });

    const json = await safeJson(res);

    if (!json || !json.success) return;

    showToast("success", json.message, "Employee Master");
    bindTable();
}

// ======================================================
// CLEAR
// ======================================================
function clearForm() {

    DOM.id().value = 0;

    document.querySelectorAll("#entryForm input")
        .forEach(x => x.value = "");

    DOM.company().value = "";
    DOM.location().value = "";
    DOM.department().value = "";
    DOM.shift().value = "";
    DOM.designation().value = "";
    DOM.group().value = "";

    $('#IDCompany').selectpicker('refresh');
    $('#IDLocation').selectpicker('refresh');
    $('#IDDepartment').selectpicker('refresh');
    $('#IDShift').selectpicker('refresh');
    $('#IDDesignation').selectpicker('refresh');
    $('#IDEmployeeGroup').selectpicker('refresh');
}