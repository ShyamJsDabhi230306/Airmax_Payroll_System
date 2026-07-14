// ======================================================
// SAVED SALARY
// ======================================================
async function fetchSavedSalary() {
    const request = buildFilter("saved");

    if (!request.salaryMonth) return showToast("warning", "Please select salary month.");
    if (!request.idCompany) return showToast("warning", "Please select company.");
    if (!request.idLocation) return showToast("warning", "Please select location.");
    if (!request.idDivision) return showToast("warning", "Please select division.");

    const body = document.getElementById("tblSavedSalaryBody");
    const componentBody = document.getElementById("tblSavedComponentsBody");

    if (!body) return;

    body.innerHTML = `
        <tr>
            <td colspan="10" class="text-center py-4">Loading...</td>
        </tr>
    `;

    if (componentBody) {
        componentBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">Select saved salary row.</td>
            </tr>
        `;
    }

    try {
        savedSalaryRows = await postJson("/api/transaction/salary/saved", request);
        renderSavedSalaryRows(savedSalaryRows);
    } catch (err) {
        body.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-danger py-4">${err.message}</td>
            </tr>
        `;
    }
}

function renderSavedSalaryRows(rows) {
    const body = document.getElementById("tblSavedSalaryBody");
    if (!body) return;

    if (!rows || !rows.length) {
        body.innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-muted py-4">No saved salary found.</td>
            </tr>
        `;
        return;
    }

    body.innerHTML = rows.map(r => `
        <tr>
            <td>
                <button type="button"
                        class="btn btn-primary btn-sm"
                        onclick="fetchSavedComponents(${getVal(r, "idSalaryProcess")})">
                    View
                </button>
            </td>
            <td>${getVal(r, "employeeCode") || ""} - ${getVal(r, "employeeName") || ""}</td>
            <td>${getVal(r, "divisionName") || getVal(r, "departmentName") || "-"}</td>
            <td>${getVal(r, "employeeGroupName") || "-"}</td>
            <td>${fmtMoney(getVal(r, "grossSalary"))}</td>
            <td>${fmtMoney(getVal(r, "totalDeduction"))}</td>
            <td class="fw-bold text-success">${fmtMoney(getVal(r, "netSalary"))}</td>
            <td>${getVal(r, "salaryStatus") || "-"}</td>
            <td>${yesNo(getVal(r, "isFinalized"))}</td>
            <td>${yesNo(getVal(r, "isPaid"))}</td>
        </tr>
    `).join("");
}

function filterSavedSalaryRows() {
    const search = (document.getElementById("savedSearch")?.value || "").trim().toLowerCase();

    if (!search) {
        renderSavedSalaryRows(savedSalaryRows || []);
        return;
    }

    const filteredRows = (savedSalaryRows || []).filter(r => {
        const searchableText = [
            getVal(r, "employeeCode"),
            getVal(r, "employeeName"),
            getVal(r, "divisionName"),
            getVal(r, "departmentName"),
            getVal(r, "employeeGroupName"),
            getVal(r, "grossSalary"),
            getVal(r, "totalDeduction"),
            getVal(r, "netSalary"),
            getVal(r, "salaryStatus"),
            getVal(r, "isFinalized"),
            getVal(r, "isPaid")
        ].join(" ").toLowerCase();

        return searchableText.includes(search);
    });

    renderSavedSalaryRows(filteredRows);
}

async function fetchSavedComponents(idSalaryProcess) {
    const body = document.getElementById("tblSavedComponentsBody");
    if (!body) return;

    if (!idSalaryProcess) {
        body.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">Invalid saved salary id.</td>
            </tr>
        `;
        return;
    }

    body.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4">Loading...</td>
        </tr>
    `;

    try {
        const response = await fetch(`/api/transaction/salary/saved-components/${idSalaryProcess}`);
        const result = await readJsonResponse(response);

        if (!response.ok || !(result.success ?? result.Success ?? true)) {
            throw new Error(result.message || result.Message || "Failed to load components.");
        }

        const data = result.data || result.Data || [];

        body.innerHTML = data.length
            ? data.map(x => `
                <tr>
                    <td>${getVal(x, "componentName") || "-"}</td>
                    <td>${getVal(x, "componentType") || "-"}</td>
                    <td>${getVal(x, "sourceType") || "-"}</td>
                    <td class="font-monospace">${getVal(x, "formula") || "-"}</td>
                    <td class="text-end fw-bold">${fmtMoney(getVal(x, "amount"))}</td>
                </tr>
            `).join("")
            : `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">No components found.</td>
                </tr>
            `;
    } catch (err) {
        body.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">${err.message}</td>
            </tr>
        `;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const search = document.getElementById("savedSearch");

    if (search) {
        search.addEventListener("input", filterSavedSalaryRows);
    }
});

window.fetchSavedSalary = fetchSavedSalary;
window.fetchSavedComponents = fetchSavedComponents;
window.filterSavedSalaryRows = filterSavedSalaryRows;