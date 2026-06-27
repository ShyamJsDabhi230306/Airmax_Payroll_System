// ======================================================
// CONFIG
// ======================================================
window.__salaryProcessVersion = "clean-2026-06-27-1848";
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

// ======================================================
// DOM CACHE
// ======================================================
const SalaryDOM = {
    companies: () => getElements(".salary-company, #configCompany, #metricsCompany, #dailyCompany, #breakdownCompany, #previewCompany, #savedCompany"),
    locations: () => getElements(".salary-location, #metricsLocation, #dailyLocation, #breakdownLocation, #previewLocation, #savedLocation"),
    divisions: () => getElements(".salary-division, #metricsDivision, #dailyDivision, #breakdownDivision, #previewDivision, #savedDivision"),
    departments: () => getElements(".salary-department, #metricsDepartment, #dailyDepartment, #breakdownDepartment, #previewDepartment, #savedDepartment"),
    groups: () => getElements(".salary-group, #configEmployeeGroup, #metricsEmployeeGroup, #dailyEmployeeGroup, #breakdownEmployeeGroup, #previewEmployeeGroup, #savedEmployeeGroup"),
    employees: () => getElements(".salary-employee, #dailyEmployee, #breakdownEmployee, #previewEmployee, #savedEmployee")
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
    console.log("salary companies loaded:", salaryCompanies.length, salaryCompanies.slice(0, 3));
    SalaryDOM.companies().forEach(x => fillSelect(x, salaryCompanies, "idCompany", "companyName", "Select Company"));
}

async function loadLocations() {
    salaryLocations = await getApiData(SALARY_MASTER_API.location);
    console.log("salary locations loaded:", salaryLocations.length, salaryLocations.slice(0, 3));
}

async function loadDivisions() {
    salaryDivisions = await getApiData(SALARY_MASTER_API.division);
    console.log("salary divisions loaded:", salaryDivisions.length, salaryDivisions.slice(0, 3));
}

async function loadDepartments() {
    salaryDepartments = await getApiData(SALARY_MASTER_API.department);
}

async function loadEmployeeGroups() {
    salaryEmployeeGroups = await getApiData(SALARY_MASTER_API.employeeGroup);
    SalaryDOM.groups().forEach(x => fillSelect(x, salaryEmployeeGroups, "idEmployeeGroup", "employeeGroupName", "All Groups"));
}

async function loadEmployees() {
    salaryEmployees = await getApiData(SALARY_MASTER_API.employee);
    console.log("salary employees loaded:", salaryEmployees.length, salaryEmployees.slice(0, 3));
}

function resetSalaryHierarchyDropdowns() {
    SalaryDOM.locations().forEach(x => fillSelect(x, [], "idLocation", "locationName", "All Locations"));
    SalaryDOM.divisions().forEach(x => fillSelect(x, [], "idDivision", "divisionName", "All Divisions"));
    SalaryDOM.departments().forEach(x => fillSelect(x, [], "idDepartment", "departmentName", "All Departments"));
    SalaryDOM.employees().forEach(x => fillSelect(x, [], "idEmployee", "employeeName", "Select Employee", "employeeCode"));
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

        if (select.matches(".salary-company, #configCompany, #metricsCompany, #dailyCompany, #breakdownCompany, #previewCompany, #savedCompany")) {
            bindCompanyChange(select);
            return;
        }

        if (select.matches(".salary-location, #metricsLocation, #dailyLocation, #breakdownLocation, #previewLocation, #savedLocation")) {
            bindLocationChange(select);
            return;
        }

        if (select.matches(".salary-division, #metricsDivision, #dailyDivision, #breakdownDivision, #previewDivision, #savedDivision")) {
            bindDivisionChange(select);
            return;
        }

        if (select.matches(".salary-department, #metricsDepartment, #dailyDepartment, #breakdownDepartment, #previewDepartment, #savedDepartment")) {
            bindEmployeeDropdownByElement(select);
            return;
        }

        if (select.matches(".salary-group, #configEmployeeGroup, #metricsEmployeeGroup, #dailyEmployeeGroup, #breakdownEmployeeGroup, #previewEmployeeGroup, #savedEmployeeGroup")) {
            bindEmployeeDropdownByElement(select);
        }
    });
}

function bindCompanyChange(companySelect) {
    const scope = getSalaryScope(companySelect);
    const prefix = getSalaryPrefix(companySelect);
    const companyId = companySelect.value;
    const locationSelect = getRelatedSelect(companySelect, "Location", ".salary-location");
    const divisionSelect = getRelatedSelect(companySelect, "Division", ".salary-division");
    const departmentSelect = getRelatedSelect(companySelect, "Department", ".salary-department");
    const employeeSelect = getRelatedSelect(companySelect, "Employee", ".salary-employee");

    if (locationSelect) {
        const locations = salaryLocations.filter(x => sameId(getValAny(x, "idCompany", "companyId"), companyId));
        console.log("company -> locations:", {
            companyId,
            totalLocations: salaryLocations.length,
            matchedLocations: locations.length,
            sampleLocations: salaryLocations.slice(0, 5).map(x => ({
                idLocation: getValAny(x, "idLocation", "locationId"),
                locationName: getValAny(x, "locationName"),
                idCompany: getValAny(x, "idCompany", "companyId")
            }))
        });
        fillSelect(locationSelect, locations, "idLocation", "locationName", "All Locations");
    }

    if (divisionSelect) fillSelect(divisionSelect, [], "idDivision", "divisionName", "All Divisions");
    if (departmentSelect) fillSelect(departmentSelect, [], "idDepartment", "departmentName", "All Departments");
    if (employeeSelect) bindEmployeeDropdown(scope, prefix);

    if (!locationSelect && companyId) {
        bindEmployeeDropdown(scope, prefix);
    }
}

function bindLocationChange(locationSelect) {
    const scope = getSalaryScope(locationSelect);
    const prefix = getSalaryPrefix(locationSelect);
    const companySelect = getRelatedSelect(locationSelect, "Company", ".salary-company");
    const locationId = locationSelect.value;
    const divisionSelect = getRelatedSelect(locationSelect, "Division", ".salary-division");
    const departmentSelect = getRelatedSelect(locationSelect, "Department", ".salary-department");
    const employeeSelect = getRelatedSelect(locationSelect, "Employee", ".salary-employee");

    if (divisionSelect) {
        const divisions = salaryDivisions.filter(x =>
            sameId(getValAny(x, "idLocation", "locationId"), locationId)
        );

        fillSelect(divisionSelect, divisions, "idDivision", "divisionName", "All Divisions");
    }

    if (departmentSelect) {
        const departments = salaryDepartments.filter(x =>
            sameId(getValAny(x, "idLocation", "locationId"), locationId)
        );

        fillSelect(departmentSelect, departments, "idDepartment", "departmentName", "All Departments");
    }

    if (employeeSelect) bindEmployeeDropdown(scope, prefix);
}

function bindDivisionChange(divisionSelect) {
    const scope = getSalaryScope(divisionSelect);
    bindEmployeeDropdown(scope, getSalaryPrefix(divisionSelect));
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

    if (companySelect && !companyId) {
        fillSelect(employeeSelect, [], "idEmployee", "employeeName", "Select Employee", "employeeCode");
        return;
    }

    let employees = salaryEmployees.slice();

    if (companyId) {
        const byCompany = employees.filter(x => sameId(getValAny(x, "idCompany", "companyId"), companyId));
        if (byCompany.length > 0) employees = byCompany;
    }

    if (locationId) {
        const byLocation = employees.filter(x => sameId(getValAny(x, "idLocation", "locationId"), locationId));
        if (byLocation.length > 0) employees = byLocation;
    }

    if (divisionId) {
        const byDivision = employees.filter(x => sameId(getValAny(x, "idDivision", "divisionId"), divisionId));
        if (byDivision.length > 0) employees = byDivision;
    }

    if (departmentId) {
        const byDepartment = employees.filter(x => sameId(getValAny(x, "idDepartment", "departmentId"), departmentId));
        if (byDepartment.length > 0) employees = byDepartment;
    }

    if (groupId) {
        const byGroup = employees.filter(x => sameId(getValAny(x, "idEmployeeGroup", "employeeGroupId"), groupId));
        if (byGroup.length > 0) employees = byGroup;
    }

    console.log("employee dropdown filter:", {
        prefix,
        employeeId: employeeSelect.id,
        companyId,
        locationId,
        divisionId,
        departmentId,
        groupId,
        totalEmployees: salaryEmployees.length,
        matchedEmployees: employees.length,
        sampleEmployees: salaryEmployees.slice(0, 5).map(x => ({
            idEmployee: getValAny(x, "idEmployee", "employeeId"),
            employeeCode: getValAny(x, "employeeCode"),
            employeeName: getValAny(x, "employeeName"),
            idCompany: getValAny(x, "idCompany", "companyId"),
            idLocation: getValAny(x, "idLocation", "locationId"),
            idDivision: getValAny(x, "idDivision", "divisionId"),
            idDepartment: getValAny(x, "idDepartment", "departmentId")
        }))
    });

    fillSelect(employeeSelect, employees, "idEmployee", "employeeName", "Select Employee", "employeeCode");
}

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
    const id = element.id || "";
    const currentPrefix = getSalaryPrefix(element);

    if (currentPrefix) {
        const direct = document.getElementById(`${currentPrefix}${suffix}`);
        if (direct) return direct;
    }

    return getRelatedSelectFromScope(getSalaryScope(element), suffix, classSelector);
}

function getSalaryPrefix(element) {
    const id = element && element.id ? element.id : "";
    const knownPrefixes = ["config", "metrics", "daily", "breakdown", "preview", "saved"];
    return knownPrefixes.find(prefix => id.startsWith(prefix)) || "";
}

function getRelatedSelectFromScope(scope, suffix, classSelector) {
    const knownPrefixes = ["config", "metrics", "daily", "breakdown", "preview", "saved"];

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
            : await fetch(url, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("auth_token") || ""}`
                }
            });

        const result = await response.json();

        if (Array.isArray(result)) {
            return result;
        }

        if (result.success === false || result.Success === false) {
            throw new Error(result.message || result.Message || "Request failed.");
        }

        const data = result.data ||
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
    const text = await response.text();
    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        throw new Error(text || "Invalid JSON response from server.");
    }

    if (!response.ok) {
        throw new Error(result.message || result.Message || "Request failed.");
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

    const text = await response.text();
    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        throw new Error(text || "Invalid JSON response from server.");
    }

    if (!response.ok) {
        throw new Error(result.message || result.Message || "Request failed.");
    }

    const isSuccess = result.success ?? result.Success ?? true;

    if (isSuccess === false) {
        throw new Error(result.message || result.Message || "Request failed.");
    }

    return result.data || result.Data || result;
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
// SALARY CONFIGURATION
// ======================================================
async function fetchSalaryConfiguration() {
    const companyId = val("configCompany");
    const groupId = val("configEmployeeGroup");

    if (!companyId) return showToast("warning", "Please select company.");

    document.getElementById("configInfo").innerText = "Loading configuration...";

    try {
        let url = `/api/transaction/salary/configuration?idCompany=${companyId}`;
        if (groupId) url += `&idEmployeeGroup=${groupId}`;

        const response = await fetch(url);
        const result = await readJsonResponse(response);

        if (!response.ok || !result.success) throw new Error(result.message || "Failed to load configuration.");

        const data = result.data || result.Data || {};
        salaryConfigurations = data.configurations || data.Configurations || [];
        salaryConfigurationComponents = data.components || data.Components || [];
        salaryConfigurationSlabs = data.slabs || data.Slabs || [];

        renderConfigurationCards();
        renderSalaryComponents();
        renderSalarySlabs();

        document.getElementById("configInfo").innerText = `${salaryConfigurations.length} configuration record(s) loaded.`;
    } catch (err) {
        showToast("danger", err.message);
        console.error(err);
    }
}

function renderConfigurationCards() {
    const cards = document.getElementById("configurationCards");

    if (!salaryConfigurations.length) {
        cards.innerHTML = `<div class="col-12"><div class="text-center text-muted py-4">No configuration found.</div></div>`;
        return;
    }

    cards.innerHTML = salaryConfigurations.map(c => `
        <div class="col-xl-4 col-lg-6 col-md-12">
            <div class="card border shadow-sm h-100">
                <div class="card-header bg-light fw-bold">${getVal(c, "employeeGroupName") || "Group"}</div>
                <div class="card-body small">
                    ${configRow("Shift", `${formatTime(getVal(c, "shiftInTime"))} - ${formatTime(getVal(c, "shiftOutTime"))}`)}
                    ${configRow("Grace", formatTime(getVal(c, "gracePeriods")))}
                    ${configRow("Working Hour", getVal(c, "workingHour"))}
                    ${configRow("Weekly Off", getVal(c, "weeklyOff"))}
                    ${configRow("Allowed Late", getVal(c, "allowedLateCount"))}
                    ${configRow("Late Ded / Min", getVal(c, "fixedDeductionPerMinute"))}
                    ${configRow("OT Start", formatTime(getVal(c, "otStartAfterTime")))}
                    ${configRow("OT Applicable", yesNo(getVal(c, "otApplicable")))}
                    ${configRow("PF Deduction", yesNo(getVal(c, "isPFDeduction")))}
                </div>
            </div>
        </div>
    `).join("");
}

function renderSalaryComponents() {
    const body = document.getElementById("tblSalaryComponentsBody");
    if (!salaryConfigurationComponents.length) {
        body.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No components found.</td></tr>`;
        return;
    }

    body.innerHTML = salaryConfigurationComponents.map(x => `
        <tr>
            <td>${getGroupNameByConfigId(getVal(x, "idPayrollConfiguration"))}</td>
            <td>${getVal(x, "componentName") || "-"}</td>
            <td class="font-monospace">${getVal(x, "formula") || "-"}</td>
            <td>${yesNo(getVal(x, "isTaxable"))}</td>
            <td>${yesNo(getVal(x, "showOnPayslip"))}</td>
            <td>${getVal(x, "sortOrder") ?? "-"}</td>
        </tr>
    `).join("");
}

function renderSalarySlabs() {
    const body = document.getElementById("tblSalarySlabsBody");
    if (!salaryConfigurationSlabs.length) {
        body.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No slabs found.</td></tr>`;
        return;
    }

    body.innerHTML = salaryConfigurationSlabs.map(x => `
        <tr>
            <td>${getGroupNameByConfigId(getVal(x, "idPayrollConfiguration"))}</td>
            <td>${getVal(x, "slabType") || "-"}</td>
            <td>${formatTime(getVal(x, "fromTime"))}</td>
            <td>${formatTime(getVal(x, "toTime"))}</td>
            <td>${getVal(x, "deductionType") || "-"}</td>
            <td>${getVal(x, "deductionValue") ?? "-"}</td>
            <td>${getVal(x, "otHours") ?? "-"}</td>
            <td>${getVal(x, "rateMultiplier") ?? "-"}</td>
        </tr>
    `).join("");
}

// ======================================================
// MONTHLY METRICS
// ======================================================
async function fetchAttendanceMonthlyMetrics() {
    const salaryMonth = normalizeSalaryMonth(val("metricsSalaryMonth"));
    const idCompany = numberOrNull("metricsCompany");
    const idLocation = numberOrNull("metricsLocation");
    const idDivision = numberOrNull("metricsDivision");
    const idDepartment = numberOrNull("metricsDepartment");
    const idEmployeeGroup = numberOrNull("metricsEmployeeGroup");
    const idEmployee = numberOrNull("metricsEmployee");
    const search = val("metricsSearch");

    const tableBody = document.getElementById("tblMonthlyMetricsBody");
    const info = document.getElementById("metricsInfo");

    if (!salaryMonth) {
        showToast("warning", "Please select salary month.");
        return;
    }

    if (!idCompany) {
        showToast("warning", "Please select company.");
        return;
    }

    const request = {
        salaryMonth: salaryMonth,
        idCompany: idCompany,
        idLocation: idLocation,
        idDivision: idDivision,
        idDepartment: idDepartment,
        idEmployeeGroup: idEmployeeGroup,
        idEmployee: idEmployee,
        search: search
    };

    tableBody.innerHTML = `
        <tr>
            <td colspan="11" class="text-center py-4">
                <i class="fas fa-spinner fa-spin me-2"></i>Loading monthly metrics...
            </td>
        </tr>
    `;

    if (info) {
        info.innerText = "";
    }

    try {
        const response = await fetch("/api/transaction/salary/attendance-monthly-metrics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("auth_token") || ""}`
            },
            body: JSON.stringify(request)
        });

        const text = await response.text();
        let result = null;

        try {
            result = text ? JSON.parse(text) : null;
        } catch {
            throw new Error(`Status ${response.status}: ${text}`);
        }

        if (!response.ok) {
            throw new Error(getApiErrorMessage(result, text, response.status));
        }

        if (result?.success === false || result?.Success === false) {
            throw new Error(getApiErrorMessage(result, text, response.status));
        }

        const rows = result?.data || result?.Data || [];
        attendanceMonthlyMetrics = rows;

        renderMonthlyMetrics(rows);

        if (info) {
            info.innerText = `${rows.length} employee row(s) loaded.`;
        }

    } catch (err) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-danger py-4">
                    Failed to fetch metrics. Reason: ${err.message}
                </td>
            </tr>
        `;

        console.error("Monthly metrics error:", err);
    }
}

function fetchMonthlyMetrics() {
    return fetchAttendanceMonthlyMetrics();
}

function renderMonthlyMetrics(rows) {
    const tableBody = document.getElementById("tblMonthlyMetricsBody");

    if (!rows || rows.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    No metrics found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = rows.map(row => {
        const employeeCode = row.employeeCode || row.EmployeeCode || "-";
        const employeeName = row.employeeName || row.EmployeeName || "-";
        const departmentName = row.departmentName || row.DepartmentName || "-";
        const employeeGroupName = row.employeeGroupName || row.EmployeeGroupName || "-";

        const workingDays = row.workingDays || row.WorkingDays || 0;
        const presentDays = row.presentDays || row.PresentDays || 0;
        const extraWorkingDays = row.extraWorkingDays || row.ExtraWorkingDays || 0;
        const absentDays = row.absentDays || row.AbsentDays || 0;

        const totalWorking = formatHourMinute(
            row.totalWorkingHour || row.TotalWorkingHour || 0,
            row.totalWorkingMinute || row.TotalWorkingMinute || 0
        );

        const late = formatHourMinute(
            row.lateHour || row.LateHour || 0,
            row.lateMinute || row.LateMinute || 0
        );

        const ot = formatHourMinute(
            row.otHour || row.OTHour || row.oTHour || 0,
            row.otMinute || row.OTMinute || row.oTMinute || 0
        );

        return `
            <tr>
                <td><strong>${employeeCode}</strong></td>
                <td>${employeeName}</td>
                <td>${departmentName}</td>
                <td>${employeeGroupName}</td>
                <td>${workingDays}</td>
                <td>${presentDays}</td>
                <td>${extraWorkingDays}</td>
                <td>${absentDays}</td>
                <td>${totalWorking}</td>
                <td>${late}</td>
                <td>${ot}</td>
            </tr>
        `;
    }).join("");
}

// ======================================================
// DAILY ATTENDANCE
// ======================================================
async function fetchEmployeeDailyAttendance() {
    const month = val("dailySalaryMonth");
    const companyId = val("dailyCompany");
    const employeeId = val("dailyEmployee");

    if (!month) return showToast("warning", "Please select month.");
    if (!companyId) return showToast("warning", "Please select company.");
    if (!employeeId) return showToast("warning", "Please select employee.");

    const body = document.getElementById("tblDailyAttendanceBody");
    body.innerHTML = `<tr><td colspan="9" class="text-center py-4"><i class="fas fa-spinner fa-spin me-2"></i>Loading...</td></tr>`;

    try {
        const response = await fetch(`/api/transaction/salary/employee-daily-attendance?salaryMonth=${month}-01&idCompany=${companyId}&idEmployee=${employeeId}`);
        const result = await readJsonResponse(response);
        if (!response.ok || !result.success) throw new Error(result.message || "Failed to load daily attendance.");
        dailyAttendanceRows = result.data || result.Data || [];
        renderDailyAttendance();
    } catch (err) {
        body.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">${err.message}</td></tr>`;
    }
}

function renderDailyAttendance() {
    const body = document.getElementById("tblDailyAttendanceBody");
    if (!dailyAttendanceRows.length) {
        body.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">No daily rows found.</td></tr>`;
        return;
    }

    body.innerHTML = dailyAttendanceRows.map(r => `
        <tr>
            <td>${fmtDate(getVal(r, "attendenceDate"))}</td>
            <td>${fmtDateTime(getVal(r, "inTime"))}</td>
            <td>${fmtDateTime(getVal(r, "outTime"))}</td>
            <td>${fmtHM(getVal(r, "totalWorkingHour"), getVal(r, "totalWorkingMinute"))}</td>
            <td>${fmtHM(getVal(r, "lateHour"), getVal(r, "lateMinute"))}</td>
            <td>${fmtHM(getVal(r, "otHour"), getVal(r, "otMinute"))}</td>
            <td>${getStatusBadge(getVal(r, "attendenceStatus"))}</td>
            <td>${yesNo(getVal(r, "isManualEntry"))}</td>
            <td>${getVal(r, "manualReason") || "-"}</td>
        </tr>
    `).join("");
}

function openManualAttendanceModal() {
    const employeeId = val("dailyEmployee");
    if (!employeeId) return showToast("warning", "Please select employee first.");

    const empText = document.getElementById("dailyEmployee").selectedOptions[0].text;
    document.getElementById("manualEmployeeText").value = empText;
    document.getElementById("manualAttendenceDate").value = "";
    document.getElementById("manualReason").value = "";

    new bootstrap.Modal(document.getElementById("manualAttendanceModal")).show();
}

async function saveManualAttendance() {
    const employeeId = numberOrNull("dailyEmployee");
    const empOption = document.getElementById("dailyEmployee").selectedOptions[0];
    const employeeCode = empOption ? empOption.text.split(" - ")[0] : "";

    const request = {
        idEmployee: employeeId,
        employeeCode: employeeCode,
        attendenceDate: val("manualAttendenceDate"),
        attendenceStatus: val("manualStatus"),
        totalWorkingHour: numberOrNull("manualWorkingHour") || 0,
        totalWorkingMinute: numberOrNull("manualWorkingMinute") || 0,
        lateHour: numberOrNull("manualLateHour") || 0,
        lateMinute: numberOrNull("manualLateMinute") || 0,
        otHour: 0,
        otMinute: 0,
        manualEntryType: val("manualEntryType"),
        manualReason: val("manualReason"),
        approvedBy: val("manualApprovedBy"),
        approvalReference: val("manualApprovalReference")
    };

    if (!request.attendenceDate) return showToast("warning", "Please select date.");

    try {
        await postJson("/api/transaction/salary/manual-attendance-save", request);
        showToast("success", "Manual attendance saved.");
        bootstrap.Modal.getInstance(document.getElementById("manualAttendanceModal")).hide();
        await fetchEmployeeDailyAttendance();
    } catch (err) {
        showToast("danger", err.message);
    }
}

// ======================================================
// LIVE BREAKDOWN
// ======================================================
async function fetchLiveBreakdown() {
    const month = val("breakdownSalaryMonth");
    const companyId = val("breakdownCompany");
    const employeeId = val("breakdownEmployee");

    if (!month || !companyId || !employeeId) return showToast("warning", "Please select month, company and employee.");

    const body = document.getElementById("tblBreakdownBody");
    body.innerHTML = `<tr><td colspan="4" class="text-center py-4">Loading...</td></tr>`;

    try {
        const response = await fetch(`/api/transaction/salary/live-breakdown?salaryMonth=${month}-01&idCompany=${companyId}&idEmployee=${employeeId}`);
        const result = await readJsonResponse(response);
        if (!response.ok || !result.success) throw new Error(result.message || "Failed to load breakdown.");

        const data = result.data || result.Data || {};
        const header = data.header || data.Header;
        const lines = data.lines || data.Lines || [];

        document.getElementById("breakdownHeader").innerHTML = header
            ? `<div class="alert alert-light border mb-0"><strong>${getVal(header, "employeeCode")} - ${getVal(header, "employeeName")}</strong> | Net Salary: <strong>${fmtMoney(getVal(header, "netSalary"))}</strong></div>`
            : "";

        body.innerHTML = lines.length
            ? lines.map(x => `<tr><td>${getVal(x, "lineItem")}</td><td class="font-monospace">${getVal(x, "formulaText")}</td><td>${getVal(x, "sourceType")}</td><td class="text-end fw-bold">${fmtMoney(getVal(x, "amount"))}</td></tr>`).join("")
            : `<tr><td colspan="4" class="text-center text-muted py-4">No breakdown found.</td></tr>`;
    } catch (err) {
        body.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">${err.message}</td></tr>`;
    }
}

// ======================================================
// SALARY PROCESS
// ======================================================
async function fetchSalaryPreview() {
    const request = buildFilter("preview");
    if (!request.salaryMonth) return showToast("warning", "Please select month.");
    if (!request.idCompany) return showToast("warning", "Please select company.");

    const body = document.getElementById("tblPreviewBody");
    body.innerHTML = `<tr><td colspan="17" class="text-center py-4">Loading...</td></tr>`;

    try {
        salaryPreviewRows = await postJson("/api/transaction/salary/preview", request);
        body.innerHTML = salaryPreviewRows.length
            ? salaryPreviewRows.map(r => `
                <tr>
                    <td>${getVal(r, "employeeCode")} - ${getVal(r, "employeeName")}</td>
                    <td>${getVal(r, "employeeGroupName") || "-"}</td>
                    <td>${fmtDec(getVal(r, "presentDays"))}</td>
                    <td>${fmtHM(getVal(r, "lateHour"), getVal(r, "lateMinute"))}</td>
                    <td>${fmtMoney(getVal(r, "monthlySalary"))}</td>
                    <td>${fmtMoney(getVal(r, "salaryAmount"))}</td>
                    <td>${fmtMoney(getVal(r, "bonusAmount"))}</td>
                    <td>${fmtMoney(getVal(r, "leaveAmount"))}</td>
                    <td>${fmtMoney(getVal(r, "otAmount"))}</td>
                    <td>${fmtMoney(getVal(r, "grossSalary"))}</td>
                    <td>${fmtMoney(getVal(r, "pfAmount"))}</td>
                    <td>${fmtMoney(getVal(r, "esicAmount"))}</td>
                    <td>${fmtMoney(getVal(r, "ptAmount"))}</td>
                    <td>${fmtMoney(getVal(r, "lateDeductionAmount"))}</td>
                    <td>${fmtMoney(getVal(r, "loanAmount"))}</td>
                    <td>${fmtMoney(getVal(r, "kharchiAmount"))}</td>
                    <td class="fw-bold text-success">${fmtMoney(getVal(r, "netSalary"))}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="17" class="text-center text-muted py-4">No preview found.</td></tr>`;
    } catch (err) {
        body.innerHTML = `<tr><td colspan="17" class="text-center text-danger py-4">${err.message}</td></tr>`;
    }
}

async function saveSalaryProcess() {
    const request = buildFilter("preview");
    if (!request.salaryMonth || !request.idCompany) return showToast("warning", "Please select month and company.");

    try {
        await postJson("/api/transaction/salary/save", request);
        showToast("success", "Salary saved successfully.");
    } catch (err) {
        showToast("danger", err.message);
    }
}

async function fetchSavedSalary() {
    const request = buildFilter("saved");
    if (!request.salaryMonth || !request.idCompany) return showToast("warning", "Please select month and company.");

    const body = document.getElementById("tblSavedSalaryBody");
    body.innerHTML = `<tr><td colspan="10" class="text-center py-4">Loading...</td></tr>`;

    try {
        savedSalaryRows = await postJson("/api/transaction/salary/saved", request);
        body.innerHTML = savedSalaryRows.length
            ? savedSalaryRows.map(r => `
                <tr>
                    <td><button class="btn btn-primary btn-sm" onclick="fetchSavedComponents(${getVal(r, "idSalaryProcess")})">View</button></td>
                    <td>${getVal(r, "employeeCode")} - ${getVal(r, "employeeName")}</td>
                    <td>${getVal(r, "departmentName") || "-"}</td>
                    <td>${getVal(r, "employeeGroupName") || "-"}</td>
                    <td>${fmtMoney(getVal(r, "grossSalary"))}</td>
                    <td>${fmtMoney(getVal(r, "totalDeduction"))}</td>
                    <td class="fw-bold text-success">${fmtMoney(getVal(r, "netSalary"))}</td>
                    <td>${getVal(r, "salaryStatus") || "-"}</td>
                    <td>${yesNo(getVal(r, "isFinalized"))}</td>
                    <td>${yesNo(getVal(r, "isPaid"))}</td>
                </tr>
            `).join("")
            : `<tr><td colspan="10" class="text-center text-muted py-4">No saved salary found.</td></tr>`;
    } catch (err) {
        body.innerHTML = `<tr><td colspan="10" class="text-center text-danger py-4">${err.message}</td></tr>`;
    }
}

async function fetchSavedComponents(idSalaryProcess) {
    const body = document.getElementById("tblSavedComponentsBody");
    body.innerHTML = `<tr><td colspan="5" class="text-center py-4">Loading...</td></tr>`;

    try {
        const response = await fetch(`/api/transaction/salary/saved-components/${idSalaryProcess}`);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Failed to load components.");

        const data = result.data || result.Data || [];
        body.innerHTML = data.length
            ? data.map(x => `<tr><td>${getVal(x, "componentName")}</td><td>${getVal(x, "componentType")}</td><td>${getVal(x, "sourceType")}</td><td class="font-monospace">${getVal(x, "formula") || "-"}</td><td class="text-end fw-bold">${fmtMoney(getVal(x, "amount"))}</td></tr>`).join("")
            : `<tr><td colspan="5" class="text-center text-muted py-4">No components found.</td></tr>`;
    } catch (err) {
        body.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${err.message}</td></tr>`;
    }
}

// ======================================================
// HELPERS
// ======================================================
function getVal(obj, key) {
    if (!obj) return null;
    const pascal = key.charAt(0).toUpperCase() + key.slice(1);
    return obj[key] ?? obj[pascal];
}

function getValAny(obj, ...keys) {
    if (!obj) return null;

    for (const key of keys) {
        const pascal = key.charAt(0).toUpperCase() + key.slice(1);
        const upperId = key.replace(/^id/, "ID");
        const upperID = key.replace(/Id$/, "ID");
        const value = obj[key] ?? obj[pascal] ?? obj[upperId] ?? obj[upperID];

        if (value !== undefined && value !== null) {
            return value;
        }
    }

    return null;
}

function sameId(left, right) {
    return String(left || "") === String(right || "");
}

function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function numberOrNull(id) {
    const value = val(id);
    return value ? parseInt(value, 10) : null;
}

function normalizeSalaryMonth(value) {
    if (!value) return null;

    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return text;
    }

    if (/^\d{4}-\d{2}$/.test(text)) {
        return `${text}-01`;
    }

    const monthMatch = text.match(/^([A-Za-z]+),?\s+(\d{4})$/);
    if (monthMatch) {
        const monthNames = {
            january: "01",
            february: "02",
            march: "03",
            april: "04",
            may: "05",
            june: "06",
            july: "07",
            august: "08",
            september: "09",
            october: "10",
            november: "11",
            december: "12"
        };

        const month = monthNames[monthMatch[1].toLowerCase()];
        if (month) return `${monthMatch[2]}-${month}-01`;
    }

    const parsed = new Date(text);
    if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}-01`;
    }

    return null;
}

function getApiErrorMessage(result, rawText, status) {
    if (result?.errors || result?.Errors) {
        const errors = result.errors || result.Errors;
        const messages = [];

        Object.keys(errors).forEach(key => {
            const value = errors[key];
            if (Array.isArray(value)) {
                value.forEach(message => messages.push(`${key}: ${message}`));
            } else if (value) {
                messages.push(`${key}: ${value}`);
            }
        });

        if (messages.length) return messages.join(" | ");
    }

    return result?.message ||
        result?.Message ||
        result?.title ||
        result?.Title ||
        rawText ||
        `Request failed with status ${status}.`;
}

function getGroupNameByConfigId(id) {
    const c = salaryConfigurations.find(x => String(getVal(x, "idPayrollConfiguration")) === String(id));
    return c ? getVal(c, "employeeGroupName") : "-";
}

function configRow(label, value) {
    return `<div class="d-flex justify-content-between border-bottom py-1"><span class="text-muted">${label}</span><span class="fw-semibold">${value || "-"}</span></div>`;
}

function yesNo(value) {
    return value ? "Yes" : "No";
}

function formatTime(value) {
    if (!value) return "-";
    const text = String(value);
    return text.includes(".") ? text.split(".")[0] : text;
}

function fmtDec(value) {
    return Number(value || 0).toFixed(2);
}

function fmtHM(hour, minute) {
    return `${String(hour || 0).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}`;
}

function fmtMoney(value) {
    return Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(value) {
    if (!value) return "-";
    return String(value).split("T")[0];
}

function fmtDateTime(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("en-IN");
}

function getStatusBadge(status) {
    const value = String(status || "");
    if (value.toLowerCase().includes("absent")) return `<span class="badge bg-danger">${value}</span>`;
    if (value.toLowerCase().includes("late")) return `<span class="badge bg-warning text-dark">${value}</span>`;
    return `<span class="badge bg-success">${value || "-"}</span>`;
}

function formatHourMinute(hour, minute) {
    hour = Number(hour || 0);
    minute = Number(minute || 0);

    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, x => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[x]));
}

function escapeAttr(value) {
    return escapeHtml(value);
}

// ======================================================
// WINDOW EXPORTS
// ======================================================
window.fetchSalaryConfiguration = fetchSalaryConfiguration;
window.fetchAttendanceMonthlyMetrics = fetchAttendanceMonthlyMetrics;
window.fetchMonthlyMetrics = fetchMonthlyMetrics;
window.fetchEmployeeDailyAttendance = fetchEmployeeDailyAttendance;
window.openManualAttendanceModal = openManualAttendanceModal;
window.saveManualAttendance = saveManualAttendance;
window.fetchLiveBreakdown = fetchLiveBreakdown;
window.fetchSalaryPreview = fetchSalaryPreview;
window.saveSalaryProcess = saveSalaryProcess;
window.fetchSavedSalary = fetchSavedSalary;
window.fetchSavedComponents = fetchSavedComponents;
