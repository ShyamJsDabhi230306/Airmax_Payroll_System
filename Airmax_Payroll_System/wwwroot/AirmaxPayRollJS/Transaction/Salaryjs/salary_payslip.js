// ======================================================
// SALARY PAYSLIP
// ======================================================
function bindPayslipHierarchy() {
    if (window.__payslipHierarchyBound) return;
    window.__payslipHierarchyBound = true;

    const company = document.getElementById("payslipCompany");
    const location = document.getElementById("payslipLocation");
    const division = document.getElementById("payslipDivision");
    const group = document.getElementById("payslipEmployeeGroup");

    if (!company || !location || !division || !group) return;

    company.addEventListener("change", fillPayslipLocation);
    location.addEventListener("change", fillPayslipDivision);
    division.addEventListener("change", fillPayslipGroup);
    group.addEventListener("change", fillPayslipEmployee);
}

function fillPayslipLocation() {
    const companyId = val("payslipCompany");

    fillSelect(document.getElementById("payslipLocation"), [], "idLocation", "locationName", "Select Location");
    fillSelect(document.getElementById("payslipDivision"), [], "idDivision", "divisionName", "Select Division");
    fillSelect(document.getElementById("payslipEmployeeGroup"), [], "idEmployeeGroup", "employeeGroupName", "Select Group");
    fillSelect(document.getElementById("payslipEmployee"), [], "idEmployee", "employeeName", "Select Employee", "employeeCode");

    if (!companyId) return;

    const locations = (salaryLocations || []).filter(x =>
        sameId(getValAny(x, "idCompany", "companyId", "IDCompany"), companyId)
    );

    fillSelect(document.getElementById("payslipLocation"), locations, "idLocation", "locationName", "Select Location");
}

function fillPayslipDivision() {
    const locationId = val("payslipLocation");

    fillSelect(document.getElementById("payslipDivision"), [], "idDivision", "divisionName", "Select Division");
    fillSelect(document.getElementById("payslipEmployeeGroup"), [], "idEmployeeGroup", "employeeGroupName", "Select Group");
    fillSelect(document.getElementById("payslipEmployee"), [], "idEmployee", "employeeName", "Select Employee", "employeeCode");

    if (!locationId) return;

    const divisions = (salaryDivisions || []).filter(x =>
        sameId(getValAny(x, "idLocation", "locationId", "IDLocation"), locationId)
    );

    fillSelect(document.getElementById("payslipDivision"), divisions, "idDivision", "divisionName", "Select Division");
}

function fillPayslipGroup() {
    const companyId = val("payslipCompany");
    const locationId = val("payslipLocation");
    const divisionId = val("payslipDivision");

    fillSelect(document.getElementById("payslipEmployeeGroup"), [], "idEmployeeGroup", "employeeGroupName", "Select Group");
    fillSelect(document.getElementById("payslipEmployee"), [], "idEmployee", "employeeName", "Select Employee", "employeeCode");

    if (!companyId || !locationId || !divisionId) return;

    const employees = (salaryEmployees || []).filter(x =>
        sameId(getValAny(x, "idCompany", "companyId", "IDCompany"), companyId) &&
        sameId(getValAny(x, "idLocation", "locationId", "IDLocation"), locationId) &&
        sameId(getValAny(x, "idDivision", "divisionId", "IDDivision"), divisionId)
    );

    const groupIds = [...new Set(
        employees
            .map(x => String(getValAny(x, "idEmployeeGroup", "employeeGroupId", "IDEmployeeGroup") || ""))
            .filter(Boolean)
    )];

    const groups = (salaryEmployeeGroups || []).filter(x =>
        groupIds.includes(String(getValAny(x, "idEmployeeGroup", "employeeGroupId", "IDEmployeeGroup") || ""))
    );

    fillSelect(document.getElementById("payslipEmployeeGroup"), groups, "idEmployeeGroup", "employeeGroupName", "Select Group");
}

function fillPayslipEmployee() {
    const companyId = val("payslipCompany");
    const locationId = val("payslipLocation");
    const divisionId = val("payslipDivision");
    const groupId = val("payslipEmployeeGroup");

    fillSelect(document.getElementById("payslipEmployee"), [], "idEmployee", "employeeName", "Select Employee", "employeeCode");

    if (!companyId || !locationId || !divisionId || !groupId) return;

    const employees = (salaryEmployees || []).filter(x =>
        sameId(getValAny(x, "idCompany", "companyId", "IDCompany"), companyId) &&
        sameId(getValAny(x, "idLocation", "locationId", "IDLocation"), locationId) &&
        sameId(getValAny(x, "idDivision", "divisionId", "IDDivision"), divisionId) &&
        sameId(getValAny(x, "idEmployeeGroup", "employeeGroupId", "IDEmployeeGroup"), groupId)
    );

    fillSelect(document.getElementById("payslipEmployee"), employees, "idEmployee", "employeeName", "Select Employee", "employeeCode");
}

function getPayslipFilter() {
    const month = val("payslipSalaryMonth");

    return {
        salaryMonth: month ? `${month}-01` : "",
        idCompany: val("payslipCompany"),
        idLocation: val("payslipLocation"),
        idDivision: val("payslipDivision"),
        idEmployeeGroup: val("payslipEmployeeGroup"),
        idEmployee: val("payslipEmployee")
    };
}

function validatePayslipFilter(request, requireEmployee) {
    if (!request.salaryMonth) {
        showToast("warning", "Please select salary month.");
        return false;
    }

    if (!request.idCompany) {
        showToast("warning", "Please select company.");
        return false;
    }

    if (!request.idLocation) {
        showToast("warning", "Please select location.");
        return false;
    }

    if (!request.idDivision) {
        showToast("warning", "Please select division.");
        return false;
    }

    if (!request.idEmployeeGroup) {
        showToast("warning", "Please select employee group.");
        return false;
    }

    if (requireEmployee && !request.idEmployee) {
        showToast("warning", "Please select employee.");
        return false;
    }

    return true;
}

async function fetchEmployeePayslip() {
    const request = getPayslipFilter();

    if (!validatePayslipFilter(request, true)) return;

    const resultBox = document.getElementById("payslipResult");
    if (!resultBox) return;

    resultBox.innerHTML = `
        <div class="text-center py-4">
            <i class="fas fa-spinner fa-spin me-2"></i>Loading salary slip...
        </div>
    `;

    try {
        const query = new URLSearchParams({
            salaryMonth: request.salaryMonth,
            idCompany: request.idCompany,
            idEmployee: request.idEmployee
        });

        const response = await fetch(`/api/transaction/salary/payslip?${query.toString()}`);
        const result = await readJsonResponse(response);

        if (!response.ok || !(result?.success ?? result?.Success ?? false)) {
            throw new Error(result?.message || result?.Message || "Failed to load payslip.");
        }

        const data = result.data || result.Data;
        renderSalaryPayslips([data]);
    } catch (err) {
        resultBox.innerHTML = `<div class="text-danger py-4">${err.message}</div>`;
    }
}

async function fetchDivisionPayslips() {
    const request = getPayslipFilter();

    if (!validatePayslipFilter(request, false)) return;

    const resultBox = document.getElementById("payslipResult");
    if (!resultBox) return;

    resultBox.innerHTML = `
        <div class="text-center py-4">
            <i class="fas fa-spinner fa-spin me-2"></i>Loading division salary slips...
        </div>
    `;

    try {
        const query = new URLSearchParams({
            salaryMonth: request.salaryMonth,
            idCompany: request.idCompany,
            idLocation: request.idLocation,
            idDivision: request.idDivision,
            idEmployeeGroup: request.idEmployeeGroup
        });

        const response = await fetch(`/api/transaction/salary/payslips?${query.toString()}`);
        const result = await readJsonResponse(response);

        if (!response.ok || !(result?.success ?? result?.Success ?? false)) {
            throw new Error(result?.message || result?.Message || "Failed to load division payslips.");
        }

        const data = result.data || result.Data || [];
        renderSalaryPayslips(data);
    } catch (err) {
        resultBox.innerHTML = `<div class="text-danger py-4">${err.message}</div>`;
    }
}

function renderSalaryPayslips(items) {
    const resultBox = document.getElementById("payslipResult");
    if (!resultBox) return;

    const slips = (items || []).filter(Boolean);

    if (!slips.length) {
        resultBox.innerHTML = `<div class="text-muted py-4">No salary slip found.</div>`;
        return;
    }

    resultBox.innerHTML = `
        <div id="salarySlipPrintArea" class="row justify-content-center g-3">
            ${slips.map(renderSalaryPayslipCard).join("")}
        </div>
    `;
}

function renderSalaryPayslipCard(data) {
    const header = getVal(data, "header") || {};
    const earnings = getVal(data, "earnings") || [];
    const deductions = getVal(data, "deductions") || [];
    const totals = getVal(data, "totals") || {};

    const maxRows = Math.max(earnings.length, deductions.length);
    let rows = "";

    for (let i = 0; i < maxRows; i++) {
        const earning = earnings[i];
        const deduction = deductions[i];

        rows += `
            <tr>
                <td>${earning ? escapeHtml(getVal(earning, "componentName") || "") : ""}</td>
                <td class="text-end">${earning ? fmtMoney(getVal(earning, "amount")) : ""}</td>
                <td>${deduction ? escapeHtml(getVal(deduction, "componentName") || "") : ""}</td>
                <td class="text-end">${deduction ? fmtMoney(getVal(deduction, "amount")) : ""}</td>
            </tr>
        `;
    }

    return `
        <div class="col-12 col-lg-6 col-xl-4">
            <div class="card border shadow-sm salary-slip-card">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="fw-bold">${escapeHtml(getVal(header, "companyName") || "-")}</div>
                            <div class="small text-muted">${escapeHtml(getVal(header, "cityName") || "")}</div>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold small">SALARY SLIP</div>
                            <div class="small text-muted">${formatMonthYear(getVal(header, "salaryMonth"))}</div>
                        </div>
                    </div>

                    <hr class="border-dark opacity-100">

                    <div class="row small mb-3">
                        <div class="col-6">
                            <div>Employee <span class="fw-bold">${escapeHtml(getVal(header, "employeeName") || "-")}</span></div>
                            <div>Department <span class="fw-bold">${escapeHtml(getVal(header, "departmentName") || "-")}</span></div>
                            <div>Working days <span class="fw-bold">${fmtDec(getVal(header, "workingDays"))}</span></div>
                        </div>
                        <div class="col-6">
                            <div>Code <span class="fw-bold">${escapeHtml(getVal(header, "employeeCode") || "-")}</span></div>
                            <div>Type <span class="fw-bold">${escapeHtml(getVal(header, "employeeGroupName") || "-")}</span></div>
                            <div>Present days <span class="fw-bold">${fmtDec(getVal(header, "presentDays"))}</span></div>
                        </div>
                    </div>

                    <table class="table table-sm small mb-0 align-middle">
                        <thead class="table-light text-uppercase">
                            <tr>
                                <th>Earnings</th>
                                <th class="text-end">Amount</th>
                                <th>Deductions</th>
                                <th class="text-end">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                            <tr class="table-light fw-bold">
                                <td>Gross Total</td>
                                <td class="text-end">${fmtMoney(getVal(totals, "grossSalary"))}</td>
                                <td>Total Deductions</td>
                                <td class="text-end">${fmtMoney(getVal(totals, "totalDeduction"))}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="bg-dark text-white rounded mt-3 p-3 d-flex justify-content-between align-items-center">
                        <span class="fw-bold">Net Salary</span>
                        <span class="fs-4 fw-bold">${fmtMoney(getVal(totals, "netSalary"))}</span>
                    </div>

                    <div class="text-center text-muted small mt-3">
                        Computer generated payslip. No signature required.
                    </div>
                </div>
            </div>
        </div>
    `;
}

function printSalaryPayslip() {
    const area = document.getElementById("salarySlipPrintArea");

    if (!area) {
        showToast("warning", "Please fetch salary slip first.");
        return;
    }

    const originalBody = document.body.innerHTML;
    document.body.innerHTML = `<div class="container py-4">${area.outerHTML}</div>`;
    window.print();
    document.body.innerHTML = originalBody;
    window.location.reload();
}

function formatMonthYear(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });
}

document.addEventListener("DOMContentLoaded", bindPayslipHierarchy);

window.fetchEmployeePayslip = fetchEmployeePayslip;
window.fetchDivisionPayslips = fetchDivisionPayslips;
window.printSalaryPayslip = printSalaryPayslip;