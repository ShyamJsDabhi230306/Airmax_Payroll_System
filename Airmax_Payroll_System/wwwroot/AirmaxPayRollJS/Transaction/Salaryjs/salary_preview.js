// ======================================================
// SALARY PREVIEW / SAVE
// ======================================================
async function fetchSalaryPreview() {
    const request = buildFilter("preview");

    if (!request.salaryMonth) return showToast("warning", "Please select month.");
    if (!request.idCompany) return showToast("warning", "Please select company.");
    if (!request.idLocation) return showToast("warning", "Please select location.");
    if (!request.idDivision) return showToast("warning", "Please select division.");

    const body = document.getElementById("tblPreviewBody");
    if (!body) return;

    body.innerHTML = `
        <tr>
            <td colspan="36" class="text-center py-4">Loading...</td>
        </tr>
    `;

    try {
        salaryPreviewRows = await postJson("/api/transaction/salary/preview", request);
        renderSalaryPreviewRows(salaryPreviewRows);
    } catch (err) {
        body.innerHTML = `
            <tr>
                <td colspan="36" class="text-center text-danger py-4">${err.message}</td>
            </tr>
        `;
    }
}

function fmtPercent(value) {
    const n = Number(value || 0);
    return n ? `${fmtDec(n)}%` : "0%";
}

function renderSalaryPreviewRows(rows) {
    const body = document.getElementById("tblPreviewBody");
    if (!body) return;

    if (!rows || !rows.length) {
        body.innerHTML = `
            <tr>
                <td colspan="36" class="text-center text-muted py-4">No preview found.</td>
            </tr>
        `;
        return;
    }

    body.innerHTML = rows.map((r, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${getVal(r, "employeeCode") || ""}</td>
            <td>${getVal(r, "employeeName") || ""}</td>
            <td>${getVal(r, "employeeGroupName") || ""}</td>
            <td>${fmtDec(getVal(r, "workingDays"))}</td>
            <td>${fmtDec(getVal(r, "presentDays"))}</td>
            <td>${fmtDec(getVal(r, "extraWorkingDays"))}</td>
            <td>${fmtHM(getVal(r, "otHour"), getVal(r, "otMinute"))}</td>
            <td>${fmtDec(getVal(r, "trDays"))}</td>
            <td>${fmtDec(getVal(r, "otDays"))}</td>
            <td>${fmtDec(getVal(r, "paidHolidayDays"))}</td>
            <td>${fmtHM(getVal(r, "lateHour"), getVal(r, "lateMinute"))}</td>
            <td>${fmtHM(getVal(r, "earlyHour"), getVal(r, "earlyMinute"))}</td>
            <td>${fmtDec(getVal(r, "lateDays"))}</td>
            <td>${fmtDec(getVal(r, "totalAttendance"))}</td>
            <td>${fmtMoney(getVal(r, "salaryRate"))}</td>
            <td>${fmtMoney(getVal(r, "salaryAmount"))}</td>
            <td>${fmtDate(getVal(r, "joiningDate"))}</td>
            <td>${fmtDec(getVal(r, "totalDays"))}</td>
            <td>${fmtPercent(getVal(r, "bonusPercentage"))}</td>
            <td>${fmtMoney(getVal(r, "bonusAmount"))}</td>
            <td>${fmtMoney(getVal(r, "leaveAmount"))}</td>
            <td>${fmtMoney(getVal(r, "otAmount"))}</td>
            <td>${fmtMoney(getVal(r, "teaAmount"))}</td>
            <td>${fmtMoney(getVal(r, "extraEarnAmount"))}</td>
            <td>${fmtMoney(getVal(r, "grossSalary"))}</td>
            <td>${fmtMoney(getVal(r, "chqAmount"))}</td>
            <td>${fmtMoney(getVal(r, "pfAmount"))}</td>
            <td>${fmtMoney(getVal(r, "esicAmount"))}</td>
            <td>${fmtMoney(getVal(r, "ptAmount"))}</td>
            <td>${fmtMoney(getVal(r, "loanAmount"))}</td>
            <td>${fmtMoney(getVal(r, "kharchiAmount"))}</td>
            <td>${fmtMoney(getVal(r, "advanceAmount"))}</td>
            <td>${fmtMoney(getVal(r, "lateDeductionAmount"))}</td>
            <td>${fmtMoney(getVal(r, "extraDeductionAmount"))}</td>
            <td class="fw-bold text-success">${fmtMoney(getVal(r, "netSalary"))}</td>
        </tr>
    `).join("");
}

function filterSalaryPreviewRows() {
    const search = (document.getElementById("previewSearch")?.value || "").trim().toLowerCase();

    if (!search) {
        renderSalaryPreviewRows(salaryPreviewRows || []);
        return;
    }

    const filteredRows = (salaryPreviewRows || []).filter(r => {
        const searchableText = [
            getVal(r, "employeeCode"),
            getVal(r, "employeeName"),
            getVal(r, "employeeGroupName"),
            getVal(r, "workingDays"),
            getVal(r, "presentDays"),
            getVal(r, "extraWorkingDays"),
            getVal(r, "otHour"),
            getVal(r, "otMinute"),
            getVal(r, "trDays"),
            getVal(r, "otDays"),
            getVal(r, "paidHolidayDays"),
            getVal(r, "lateHour"),
            getVal(r, "lateMinute"),
            getVal(r, "earlyHour"),
            getVal(r, "earlyMinute"),
            getVal(r, "lateDays"),
            getVal(r, "totalAttendance"),
            getVal(r, "salaryRate"),
            getVal(r, "salaryAmount"),
            getVal(r, "joiningDate"),
            getVal(r, "totalDays"),
            getVal(r, "bonusPercentage"),
            getVal(r, "bonusAmount"),
            getVal(r, "leaveAmount"),
            getVal(r, "otAmount"),
            getVal(r, "teaAmount"),
            getVal(r, "extraEarnAmount"),
            getVal(r, "grossSalary"),
            getVal(r, "chqAmount"),
            getVal(r, "pfAmount"),
            getVal(r, "esicAmount"),
            getVal(r, "ptAmount"),
            getVal(r, "loanAmount"),
            getVal(r, "kharchiAmount"),
            getVal(r, "advanceAmount"),
            getVal(r, "lateDeductionAmount"),
            getVal(r, "extraDeductionAmount"),
            getVal(r, "netSalary")
        ].join(" ").toLowerCase();

        return searchableText.includes(search);
    });

    renderSalaryPreviewRows(filteredRows);
}

async function saveSalaryProcess() {
    const filter = buildFilter("preview");

    const request = {
        salaryMonth: filter.salaryMonth,
        idCompany: filter.idCompany,
        idLocation: filter.idLocation,
        idDivision: filter.idDivision,
        idEmployeeGroup: filter.idEmployeeGroup,
        idEmployee: null,
        search: ""
    };

    if (!request.salaryMonth) return showToast("warning", "Please select month.");
    if (!request.idCompany) return showToast("warning", "Please select company.");
    if (!request.idLocation) return showToast("warning", "Please select location.");
    if (!request.idDivision) return showToast("warning", "Please select division.");

    try {
        await postJson("/api/transaction/salary/save", request);
        showToast("success", "Salary saved successfully.");
    } catch (err) {
        showToast("danger", err.message);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const search = document.getElementById("previewSearch");

    if (search) {
        search.addEventListener("input", filterSalaryPreviewRows);
    }
});

window.fetchSalaryPreview = fetchSalaryPreview;
window.saveSalaryProcess = saveSalaryProcess;
window.filterSalaryPreviewRows = filterSalaryPreviewRows;