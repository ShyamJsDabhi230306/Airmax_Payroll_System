// ======================================================
// SALARY PROCESS - COMMON CORE
// ======================================================
window.__salaryProcessVersion = "split-core-2026-07-09";
console.log("salary_process.js loaded:", window.__salaryProcessVersion);

const SALARY_MASTER_API = {
    company: "/api/master/company/get-all",
    location: "/api/master/location/get-all",
    division: "/api/master/division/get-all",
    department: "/api/master/department/get-all",
    employeeGroup: "/api/master/employeegroup/get-all",
    employee: "/api/master/employee/get-all"
};

let salaryConfigurations = [];
let salaryConfigurationComponents = [];
let salaryConfigurationSlabs = [];

let attendanceMonthlyMetrics = [];
let dailyAttendanceRows = [];
let salaryPreviewRows = [];
let savedSalaryRows = [];

let salaryCompanies = [];
let salaryLocations = [];
let salaryDivisions = [];
let salaryDepartments = [];
let salaryEmployeeGroups = [];
let salaryEmployees = [];

let liveBreakdownHeader = null;
let liveBreakdownLines = [];
let liveBreakdownManualLines = [];

// ======================================================
// DOM CACHE
// ======================================================
const SalaryDOM = {
    companies: () => getElements(".salary-company, #configCompany, #metricsCompany, #dailyCompany, #breakdownCompany, #previewCompany, #savedCompany, #payslipCompany"),
    locations: () => getElements(".salary-location, #metricsLocation, #dailyLocation, #breakdownLocation, #previewLocation, #savedLocation, #payslipLocation"),
    divisions: () => getElements(".salary-division, #metricsDivision, #dailyDivision, #breakdownDivision, #previewDivision, #savedDivision, #payslipDivision"),
    departments: () => getElements(".salary-department, #metricsDepartment, #dailyDepartment, #breakdownDepartment, #previewDepartment, #savedDepartment, #payslipDepartment"),
    groups: () => getElements(".salary-group, #configEmployeeGroup, #metricsEmployeeGroup, #dailyEmployeeGroup, #breakdownEmployeeGroup, #previewEmployeeGroup, #savedEmployeeGroup, #payslipEmployeeGroup"),
    employees: () => getElements(".salary-employee, #dailyEmployee, #breakdownEmployee, #previewEmployee, #savedEmployee, #payslipEmployee")
};

// ======================================================
// INIT
// ======================================================
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSalaryPage);
} else {
    initializeSalaryPage();
}

async function initializeSalaryPage() {
    bindSalaryHierarchy();
    await loadSalaryDropdowns();
}

// ======================================================
// MASTER DROPDOWNS
// ======================================================
async function loadSalaryDropdowns() {
    await Promise.all([
        loadCompanies(),
        loadLocations(),
        loadDivisions(),
        loadDepartments(),
        loadEmployeeGroups(),
        loadEmployees()
    ]);

    resetSalaryHierarchyDropdowns();
    applySalaryHierarchyValues();
}

async function loadCompanies() {
    salaryCompanies = await getApiData(SALARY_MASTER_API.company);
    SalaryDOM.companies().forEach(x =>
        fillSelect(x, salaryCompanies, "idCompany", "companyName", "Select Company")
    );
}

async function loadLocations() {
    salaryLocations = await getApiData(SALARY_MASTER_API.location);
}

async function loadDivisions() {
    salaryDivisions = await getApiData(SALARY_MASTER_API.division);
}

async function loadDepartments() {
    salaryDepartments = await getApiData(SALARY_MASTER_API.department);
}

async function loadEmployeeGroups() {
    salaryEmployeeGroups = await getApiData(SALARY_MASTER_API.employeeGroup);
    SalaryDOM.groups().forEach(x =>
        fillSelect(x, salaryEmployeeGroups, "idEmployeeGroup", "employeeGroupName", "All Groups")
    );
}

async function loadEmployees() {
    salaryEmployees = await getApiData(SALARY_MASTER_API.employee);
}

function resetSalaryHierarchyDropdowns() {
    SalaryDOM.locations().forEach(x =>
        fillSelect(x, [], "idLocation", "locationName", "All Locations")
    );

    SalaryDOM.divisions().forEach(x =>
        fillSelect(x, [], "idDivision", "divisionName", "All Divisions")
    );

    SalaryDOM.departments().forEach(x =>
        fillSelect(x, [], "idDepartment", "departmentName", "All Departments")
    );

    SalaryDOM.employees().forEach(x =>
        fillSelect(x, [], "idEmployee", "employeeName", "Select Employee", "employeeCode")
    );
}

function applySalaryHierarchyValues() {
    SalaryDOM.companies().forEach(x => {
        if (x.value) bindCompanyChange(x);
    });

    SalaryDOM.locations().forEach(x => {
        if (x.value) bindLocationChange(x);
    });

    SalaryDOM.divisions().forEach(x => {
        if (x.value) bindDivisionChange(x);
    });

    SalaryDOM.departments().forEach(x => {
        if (x.value) bindEmployeeDropdownByElement(x);
    });

    SalaryDOM.groups().forEach(x => {
        if (x.value) bindEmployeeDropdownByElement(x);
    });
}

// ======================================================
// DROPDOWN HIERARCHY
// ======================================================
function bindSalaryHierarchy() {
    if (window.__salaryHierarchyBound) return;
    window.__salaryHierarchyBound = true;

    document.addEventListener("change", function (e) {
        const select = e.target;
        if (!select || !select.matches) return;

        if (select.matches(".salary-company, #configCompany, #metricsCompany, #dailyCompany, #breakdownCompany, #previewCompany, #savedCompany, #payslipCompany")) {
            bindCompanyChange(select);
            return;
        }

        if (select.matches(".salary-location, #metricsLocation, #dailyLocation, #breakdownLocation, #previewLocation, #savedLocation, #payslipLocation")) {
            bindLocationChange(select);
            return;
        }

        if (select.matches(".salary-division, #metricsDivision, #dailyDivision, #breakdownDivision, #previewDivision, #savedDivision, #payslipDivision")) {
            bindDivisionChange(select);
            return;
        }

        if (select.matches(".salary-department, #metricsDepartment, #dailyDepartment, #breakdownDepartment, #previewDepartment, #savedDepartment, #payslipDepartment")) {
            bindEmployeeDropdownByElement(select);
            return;
        }

        if (select.matches(".salary-group, #configEmployeeGroup, #metricsEmployeeGroup, #dailyEmployeeGroup, #breakdownEmployeeGroup, #previewEmployeeGroup, #savedEmployeeGroup, #payslipEmployeeGroup")) {
            bindEmployeeDropdownByElement(select);
        }
    });
}

function bindCompanyChange(companySelect) {
    const companyId = companySelect.value;

    const locationSelect = getRelatedSelect(companySelect, "Location", ".salary-location");
    const divisionSelect = getRelatedSelect(companySelect, "Division", ".salary-division");
    const departmentSelect = getRelatedSelect(companySelect, "Department", ".salary-department");
    const employeeSelect = getRelatedSelect(companySelect, "Employee", ".salary-employee");

    if (locationSelect) {
        const locations = salaryLocations.filter(x =>
            sameId(getValAny(x, "idCompany", "companyId", "IDCompany"), companyId)
        );

        fillSelect(locationSelect, locations, "idLocation", "locationName", "All Locations");
    }

    if (divisionSelect) {
        fillSelect(divisionSelect, [], "idDivision", "divisionName", "All Divisions");
    }

    if (departmentSelect) {
        fillSelect(departmentSelect, [], "idDepartment", "departmentName", "All Departments");
    }

    if (employeeSelect) {
        fillSelect(employeeSelect, [], "idEmployee", "employeeName", "Select Employee", "employeeCode");
    }
}

function bindLocationChange(locationSelect) {
    const locationId = locationSelect.value;

    const divisionSelect = getRelatedSelect(locationSelect, "Division", ".salary-division");
    const departmentSelect = getRelatedSelect(locationSelect, "Department", ".salary-department");
    const employeeSelect = getRelatedSelect(locationSelect, "Employee", ".salary-employee");

    if (divisionSelect) {
        const divisions = salaryDivisions.filter(x =>
            sameId(getValAny(x, "idLocation", "locationId", "IDLocation"), locationId)
        );

        fillSelect(divisionSelect, divisions, "idDivision", "divisionName", "All Divisions");
    }

    if (departmentSelect) {
        const departments = salaryDepartments.filter(x =>
            sameId(getValAny(x, "idLocation", "locationId", "IDLocation"), locationId)
        );

        fillSelect(departmentSelect, departments, "idDepartment", "departmentName", "All Departments");
    }

    if (employeeSelect) {
        fillSelect(employeeSelect, [], "idEmployee", "employeeName", "Select Employee", "employeeCode");
    }
}

function bindDivisionChange(divisionSelect) {
    bindEmployeeDropdown(getSalaryScope(divisionSelect), getSalaryPrefix(divisionSelect));
}

function bindEmployeeDropdownByElement(element) {
    bindEmployeeDropdown(getSalaryScope(element), getSalaryPrefix(element));
}

function bindEmployeeDropdown(scope, prefix) {
    const employeeSelect = prefix
        ? document.getElementById(`${prefix}Employee`)
        : getRelatedSelectFromScope(scope, "Employee", ".salary-employee");

    if (!employeeSelect) return;

    const companySelect = prefix ? document.getElementById(`${prefix}Company`) : getRelatedSelect(employeeSelect, "Company", ".salary-company");
    const locationSelect = prefix ? document.getElementById(`${prefix}Location`) : getRelatedSelect(employeeSelect, "Location", ".salary-location");
    const divisionSelect = prefix ? document.getElementById(`${prefix}Division`) : getRelatedSelect(employeeSelect, "Division", ".salary-division");
    const departmentSelect = prefix ? document.getElementById(`${prefix}Department`) : getRelatedSelect(employeeSelect, "Department", ".salary-department");
    const groupSelect = prefix ? document.getElementById(`${prefix}EmployeeGroup`) : getRelatedSelect(employeeSelect, "EmployeeGroup", ".salary-group");

    const companyId = companySelect ? companySelect.value : "";
    const locationId = locationSelect ? locationSelect.value : "";
    const divisionId = divisionSelect ? divisionSelect.value : "";
    const departmentId = departmentSelect ? departmentSelect.value : "";
    const groupId = groupSelect ? groupSelect.value : "";

    fillSelect(employeeSelect, [], "idEmployee", "employeeName", "Select Employee", "employeeCode");

    if (!companyId) return;
    if (locationSelect && !locationId) return;
    if (divisionSelect && !divisionId) return;

    let employees = (salaryEmployees || []).filter(x =>
        sameId(getValAny(x, "idCompany", "companyId", "IDCompany"), companyId)
    );

    if (locationId) {
        employees = employees.filter(x =>
            sameId(getValAny(x, "idLocation", "locationId", "IDLocation"), locationId)
        );
    }

    if (divisionId) {
        employees = employees.filter(x =>
            sameId(getValAny(x, "idDivision", "divisionId", "IDDivision"), divisionId)
        );
    }

    if (departmentId) {
        employees = employees.filter(x =>
            sameId(getValAny(x, "idDepartment", "departmentId", "IDDepartment"), departmentId)
        );
    }

    if (groupId) {
        employees = employees.filter(x =>
            sameId(getValAny(x, "idEmployeeGroup", "employeeGroupId", "IDEmployeeGroup"), groupId)
        );
    }

    fillSelect(employeeSelect, employees, "idEmployee", "employeeName", "Select Employee", "employeeCode");
}

// ======================================================
// COMMON API HELPERS
// ======================================================
async function readJsonResponse(response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : null;
    } catch {
        throw new Error(text || "Server returned invalid response.");
    }
}

async function getApiData(url) {
    try {
        const response = typeof apiFetch === "function"
            ? await apiFetch(url)
            : await fetch(url);

        const result = await response.json();

        if (Array.isArray(result)) return result;

        if (result.success === false || result.Success === false) {
            throw new Error(result.message || result.Message || "Request failed.");
        }

        const data =
            result.data ||
            result.Data ||
            result.result ||
            result.Result ||
            result.items ||
            result.Items ||
            result.records ||
            result.Records ||
            [];

        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Dropdown API error:", url, err);
        return [];
    }
}

async function getJson(url) {
    const response = await fetch(url);
    const result = await readJsonResponse(response);

    if (!response.ok) {
        throw new Error(getApiErrorMessage(result) || "Request failed.");
    }

    return result;
}

async function postJson(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await readJsonResponse(response);

    if (!response.ok) {
        throw new Error(getApiErrorMessage(result) || "Request failed.");
    }

    const isSuccess = result?.success ?? result?.Success ?? true;

    if (isSuccess === false) {
        throw new Error(getApiErrorMessage(result) || "Request failed.");
    }

    return result?.data || result?.Data || result;
}

function fillSelect(select, data, idKey, textKey, firstText, prefixKey) {
    if (!select) return;

    const selectedValue = select.value;

    select.disabled = false;
    select.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = firstText;
    select.appendChild(firstOption);

    (data || []).forEach(item => {
        const id = getValAny(item, idKey);
        const text = getValAny(item, textKey);
        const prefix = prefixKey ? `${getValAny(item, prefixKey) || ""} - ` : "";

        const option = document.createElement("option");
        option.value = id ?? "";
        option.textContent = `${prefix}${text || id || ""}`;
        select.appendChild(option);
    });

    if (selectedValue && Array.from(select.options).some(x => sameId(x.value, selectedValue))) {
        select.value = selectedValue;
    }

    refreshSelect(select);
}

function refreshSelect(select) {
    if (!select || typeof window.jQuery !== "function") return;

    const $select = window.jQuery(select);
    const isSalarySelect = select.matches(".salary-company, .salary-location, .salary-division, .salary-department, .salary-group, .salary-employee");

    if (typeof $select.selectpicker === "function") {
        if (isSalarySelect) {
            select.classList.add("selectpicker");
            select.setAttribute("data-live-search", "true");
            select.setAttribute("data-container", "body");
            select.setAttribute("data-width", "100%");
            select.setAttribute("data-style", "btn-light border");

            if ($select.data("selectpicker")) {
                $select.selectpicker("destroy");
            }

            $select.selectpicker();
            $select.selectpicker("refresh");
            return;
        }

        $select.selectpicker("refresh");
    }

    if ($select.data("select2")) {
        $select.trigger("change.select2");
    }
}

function buildFilter(prefix) {
    const month = val(`${prefix}SalaryMonth`);

    return {
        salaryMonth: month ? `${month}-01` : null,
        idCompany: numberOrNull(`${prefix}Company`),
        idLocation: numberOrNull(`${prefix}Location`),
        idDivision: numberOrNull(`${prefix}Division`),
        idDepartment: numberOrNull(`${prefix}Department`),
        idEmployeeGroup: numberOrNull(`${prefix}EmployeeGroup`),
        idEmployee: numberOrNull(`${prefix}Employee`),
        search: val(`${prefix}Search`)
    };
}

// ======================================================
// HELPERS
// ======================================================
function getSalaryScope(element) {
    return element.closest("form") ||
        element.closest(".tab-pane") ||
        element.closest(".card") ||
        element.closest("section") ||
        element.closest(".row") ||
        document;
}

function getElements(selector) {
    return Array.from(document.querySelectorAll(selector));
}

function getRelatedSelect(element, suffix, classSelector) {
    const currentPrefix = getSalaryPrefix(element);

    if (currentPrefix) {
        const direct = document.getElementById(`${currentPrefix}${suffix}`);
        if (direct) return direct;
    }

    return getRelatedSelectFromScope(getSalaryScope(element), suffix, classSelector);
}

function getSalaryPrefix(element) {
    const id = element && element.id ? element.id : "";
    const knownPrefixes = ["config", "metrics", "daily", "breakdown", "preview", "saved", "payslip"];
    return knownPrefixes.find(prefix => id.startsWith(prefix)) || "";
}

function getRelatedSelectFromScope(scope, suffix, classSelector) {
    const knownPrefixes = ["config", "metrics", "daily", "breakdown", "preview", "saved", "payslip"];

    if (scope) {
        const classElement = scope.querySelector(classSelector);
        if (classElement) return classElement;

        for (const prefix of knownPrefixes) {
            const byId = scope.querySelector(`#${prefix}${suffix}`);
            if (byId) return byId;
        }
    }

    for (const prefix of knownPrefixes) {
        const byId = document.getElementById(`${prefix}${suffix}`);
        if (byId) return byId;
    }

    return null;
}

function getVal(obj, key) {
    if (!obj || !key) return null;

    return obj[key] ??
        obj[key.charAt(0).toUpperCase() + key.slice(1)] ??
        obj[key.charAt(0).toLowerCase() + key.slice(1)] ??
        null;
}

function getValAny(obj, ...keys) {
    for (const key of keys) {
        const value = getVal(obj, key);
        if (value !== null && value !== undefined && value !== "") return value;
    }

    return null;
}

function sameId(a, b) {
    if (a === null || a === undefined || b === null || b === undefined) return false;
    return String(a).trim() === String(b).trim();
}

function val(id) {
    return document.getElementById(id)?.value?.trim() || "";
}

function numberOrNull(id) {
    const value = val(id);
    return value ? Number(value) : null;
}

function normalizeSalaryMonth(value) {
    if (!value) return "";
    return value.length === 7 ? `${value}-01` : value;
}

function getApiErrorMessage(result) {
    return result?.message ||
        result?.Message ||
        result?.error ||
        result?.Error ||
        result?.title ||
        result?.Title ||
        "";
}

function getGroupNameByConfigId(idPayrollConfiguration) {
    const config = salaryConfigurations.find(x =>
        sameId(getVal(x, "idPayrollConfiguration"), idPayrollConfiguration)
    );

    return getVal(config, "employeeGroupName") || "-";
}

function configRow(label, value) {
    return `
        <div class="d-flex justify-content-between border-bottom py-1">
            <span class="text-muted">${label}</span>
            <span class="fw-semibold">${value ?? "-"}</span>
        </div>
    `;
}

function yesNo(value) {
    return value === true || value === 1 || value === "1" || String(value).toLowerCase() === "true"
        ? "Yes"
        : "No";
}

function formatTime(value) {
    if (!value) return "-";

    const text = String(value);

    if (text.includes("T")) {
        const date = new Date(text);
        if (!isNaN(date)) {
            return date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
            });
        }
    }

    return text.substring(0, 5);
}

function fmtDec(value) {
    const number = Number(value || 0);
    return number.toFixed(2);
}

function fmtHM(hour, minute) {
    const h = Number(hour || 0);
    const m = Number(minute || 0);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function fmtMoney(value) {
    const number = Number(value || 0);

    return number.toLocaleString("en-IN", {
        maximumFractionDigits: 0
    });
}

function fmtDate(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (isNaN(date)) return value;

    return date.toLocaleDateString("en-IN");
}

function fmtDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (isNaN(date)) return value;

    return date.toLocaleString("en-IN");
}

function getStatusBadge(status) {
    const text = status || "-";
    const lower = String(text).toLowerCase();

    let cls = "bg-secondary";

    if (lower.includes("present")) cls = "bg-success";
    else if (lower.includes("late")) cls = "bg-warning text-dark";
    else if (lower.includes("absent")) cls = "bg-danger";
    else if (lower.includes("half")) cls = "bg-info text-dark";

    return `<span class="badge ${cls}">${text}</span>`;
}

function formatHourMinute(hour, minute) {
    return fmtHM(hour, minute);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
    return escapeHtml(value);
}