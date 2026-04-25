// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/employee";

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
    // this is new add division 
    division: () => document.getElementById("IDDivision"),
    department: () => document.getElementById("IDDepartment"),
    shift: () => document.getElementById("IDShift"),
    designation: () => document.getElementById("IDDesignation"),
    group: () => document.getElementById("IDEmployeeGroup"),

    save: () => document.getElementById("btnSave")
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

    // ✅ LOAD DROPDOWNS (same as your old JS)
    await loadCompany();
    await loadLocation();
    await loadDivision();
    await loadDepartment();
    await loadShift();
    await loadDesignation();
    await loadGroup();

    // ==================================================
    // CHAINING (same as your JS)
    // ==================================================

    DOM.company().addEventListener("change", () => {

        const id = DOM.company().value;

        DOM.location().innerHTML = `<option value="">Select Location</option>`;
        DOM.division().innerHTML = `<option value="">Select division</option>`;

        loadLocation(id);
    });

    DOM.location().addEventListener("change", () => {

        const id = DOM.location().value;

        DOM.division().innerHTML = `<option value="">Select Division</option>`;
        loadDivision(id);
      
    });  

    // ==================================================
    // EDIT MODE
    // ==================================================
    const id = new URLSearchParams(window.location.search).get("id");

    if (id) {
        await editEntry(id);
    }

    // SAVE
    DOM.save().addEventListener("click", saveData);
});


// ======================================================
// LOAD EMPLOYEE (same as your editEntry without modal)
// ======================================================
// ======================================================
// EDIT ENTRY (FULL VERSION - NO MODAL)
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


    await loadDivision(d.idLocation); // Load divisions based on location
    $('#IDDivision').val(String(d.idDivision || "")).selectpicker('refresh');

    
    $('#IDDepartment').val(String(d.idDepartment || "")).selectpicker('refresh');
   // await loadGroup();
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
}


// ======================================================
// DROPDOWNS (FULL COPY FROM YOUR ORIGINAL JS)
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



async function loadDivision(locationId) {
    const res = await apiFetch("/api/master/division/get-all");
    const json = await safeJson(res);
    if (!json || !json.success) return;
    // Filter divisions by the selected Location
    const filtered = json.data.filter(d => d.idLocation == locationId);
    document.getElementById("IDDivision").innerHTML =
        `<option value="">Select Division</option>` +
        filtered.map(d =>
            `<option value="${d.idDivision}">${d.divisionName}</option>`
        ).join("");
    $(DOM.division()).selectpicker('refresh');
}

async function loadDepartment() { // 1. Remove the parameter
    const res = await apiFetch("/api/master/department/get-all");
    const json = await safeJson(res);
    if (!json || !json.success) return;
    // 2. Remove the filter line completely
    DOM.department().innerHTML =
        `<option value="">Select Department</option>` +
        json.data.map(d => // 3. Use 'json.data' directly
            `<option value="${d.idDepartment}">${d.departmentName}</option>`
        ).join("");
    $(DOM.department()).selectpicker('refresh');
}


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

    DOM.designation().innerHTML =
        `<option value="">Select Designation</option>` +
        json.data.map(d =>
            `<option value="${d.idDesignation}">${d.designetion}</option>`
        ).join("");

    $(DOM.designation()).selectpicker('refresh');
}

async function loadGroup() {
    // Added leading / and /get-all suffix
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


//this is the load group for sefty
//async function loadGroup() {
//    try {
//        const res = await apiFetch("/api/master/employeegroup/get-all");
//        const json = await safeJson(res);
//        if (!json || !json.success) return;
//        // Populate options, checking for both camelCase and PascalCase
//        DOM.group().innerHTML =
//            `<option value="">Select Employee Group</option>` +
//            json.data.map(g => {
//                const id = g.idEmployeeGroup || g.IDEmployeeGroup;
//                const name = g.employeeGroupName || g.EmployeeGroupName;
//                return `<option value="${id}">${name}</option>`;
//            }).join("");
//        // Explicitly initialize and refresh selectpicker
//        if ($.fn.selectpicker) {
//            $(DOM.group()).selectpicker('destroy').selectpicker();
//            $(DOM.group()).selectpicker('refresh');
//        }
//    } catch (err) {
//        console.error("Error loading employee groups:", err);
//    }
//}


// ======================================================
// SAVE (same logic, only removed modal)
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
        idDivision: DOM.division().value ? Number(DOM.division().value) : null, 
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

        window.location.href = "/Master/Employee";
        clearForm();
        bindTable();

    } catch (err) {
        showToast("danger", err.message, "Employee Master");
    }
    finally {
        DOM.save().disabled = false;
    }
}