// ======================================================
// SALARY CONFIGURATION
// ======================================================
async function fetchSalaryConfiguration() {
    const companyId = val("configCompany");
    const groupId = val("configEmployeeGroup");

    if (!companyId) {
        clearSalaryConfigurationView();
        return showToast("warning", "Please select company.");
    }

    if (!groupId) {
        clearSalaryConfigurationView();
        return showToast("warning", "Please select employee group.");
    }

    const info = document.getElementById("configInfo");
    if (info) {
        info.innerText = "Loading configuration...";
    }

    try {
        const url = `/api/transaction/salary/configuration?idCompany=${companyId}&idEmployeeGroup=${groupId}`;

        const response = await fetch(url);
        const result = await readJsonResponse(response);

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to load configuration.");
        }

        const data = result.data || result.Data || {};

        salaryConfigurations = data.configurations || data.Configurations || [];
        salaryConfigurationComponents = data.components || data.Components || [];
        salaryConfigurationSlabs = data.slabs || data.Slabs || [];

        renderConfigurationCards();
        renderSalaryComponents();
        renderSalarySlabs();

        if (info) {
            info.innerText = `${salaryConfigurations.length} configuration record(s) loaded.`;
        }
    } catch (err) {
        clearSalaryConfigurationView();
        showToast("danger", err.message);
        console.error(err);
    }
}

function clearSalaryConfigurationView() {
    salaryConfigurations = [];
    salaryConfigurationComponents = [];
    salaryConfigurationSlabs = [];

    const info = document.getElementById("configInfo");
    const cards = document.getElementById("configurationCards");
    const componentsBody = document.getElementById("tblSalaryComponentsBody");
    const slabsBody = document.getElementById("tblSalarySlabsBody");

    if (info) {
        info.innerText = "Select company and employee group to load configuration.";
    }

    if (cards) {
        cards.innerHTML = `
            <div class="col-12">
                <div class="text-center text-muted py-4">No configuration loaded.</div>
            </div>
        `;
    }

    if (componentsBody) {
        componentsBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">No components loaded.</td>
            </tr>
        `;
    }

    if (slabsBody) {
        slabsBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">No slabs loaded.</td>
            </tr>
        `;
    }
}

function renderConfigurationCards() {
    const cards = document.getElementById("configurationCards");
    if (!cards) return;

    if (!salaryConfigurations.length) {
        cards.innerHTML = `
            <div class="col-12">
                <div class="text-center text-muted py-4">No configuration found.</div>
            </div>
        `;
        return;
    }

    cards.innerHTML = salaryConfigurations.map(c => `
        <div class="col-xl-4 col-lg-6 col-md-12">
            <div class="card border shadow-sm h-100">
                <div class="card-header bg-light fw-bold">
                    ${getVal(c, "employeeGroupName") || "Group"}
                </div>
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
    if (!body) return;

    if (!salaryConfigurationComponents.length) {
        body.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">No components found.</td>
            </tr>
        `;
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
    if (!body) return;

    if (!salaryConfigurationSlabs.length) {
        body.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">No slabs found.</td>
            </tr>
        `;
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

window.fetchSalaryConfiguration = fetchSalaryConfiguration;