// ======================================================
// MANUAL EDIT ATTENDANCE
// ======================================================
//let manualEditLogs = [];

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", function () {
    loadManualEditEmployees();

    const saveBtn = document.getElementById("btnSaveManualAttendance");
    if (saveBtn) {
        saveBtn.addEventListener("click", saveManualAttendanceTime);
    }

    const tableSearch = document.getElementById("manualEditTableSearch");
    if (tableSearch) {
        tableSearch.addEventListener("input", filterManualEditRows);
    }
});

// ======================================================
// FETCH MANUAL EDIT LIST
// ======================================================
window.fetchManualEditList = async function () {
    const monthVal = document.getElementById("manualEditMonth")?.value || "";
    const employeeSelect = document.getElementById("manualEditEmployee");
    const selectedOption = employeeSelect?.options[employeeSelect.selectedIndex];

    const searchValue = selectedOption?.dataset?.code || "";



    if (!monthVal) {
        showToast("warning", "Please select a month.");
        return;
    }

    if (!searchValue) {
        showToast("warning", "Please select employee.");
        return;
    }

    const { firstDay, lastDayFormatted } = getMonthDateRange(monthVal);
    const tableBody = document.getElementById("tblManualEditLogsBody");

    hideManualEditTotals();

    tableBody.innerHTML = `
        <tr>
            <td colspan="11" class="text-center py-4">
                <i class="fas fa-spinner fa-spin me-2"></i>Loading employee attendance...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(
            `/api/DeviceLog/manual-edit-list?fromDate=${firstDay}&toDate=${lastDayFormatted}&search=${encodeURIComponent(searchValue)}`,
            { credentials: "same-origin" }
        );







        const result = typeof readJsonResponse === "function"
            ? await readJsonResponse(response)
            : await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to fetch manual edit data.");
        }

        manualEditLogs = result.data || result.Data || [];



        const tableSearch = document.getElementById("manualEditTableSearch");
        if (tableSearch) tableSearch.value = "";

        if (!hasRealAttendanceData(manualEditLogs)) {
            manualEditLogs = [];

            tableBody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center text-muted py-4">
                        No attendance saved for selected employee and month.
                    </td>
                </tr>
            `;

            hideManualEditTotals();
            showToast("warning", "No attendance saved for selected employee and month.");
            return;
        }

        renderManualEditRows(manualEditLogs);
        renderManualEditTotals(manualEditLogs);

        showToast("success", `${manualEditLogs.length} day(s) loaded.`);

    } catch (err) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-danger py-4">
                    Failed to fetch data. Reason: ${err.message}
                </td>
            </tr>
        `;

        hideManualEditTotals();
        console.error(err);
    }
};

// ======================================================
// LOAD EMPLOYEE DROPDOWN
// ======================================================
async function loadManualEditEmployees() {
    const employeeSelect = document.getElementById("manualEditEmployee");
    if (!employeeSelect) return;

    employeeSelect.innerHTML = `<option value="">Select employee...</option>`;

    try {
        const response = await fetch("/api/master/employee/get-all", {
            credentials: "same-origin"
        });

        const result = await readJsonResponse(response);

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to load employees.");
        }

        const employees = result.data || result.Data || [];

        employeeSelect.innerHTML =
            `<option value="">Select employee...</option>` +
            employees.map(x => {
                const id = getAny(x, "idEmployee", "IDEmployee") || "";
                const code = getAny(x, "employeeCode", "EmployeeCode") || "";
                const name = getAny(x, "employeeName", "EmployeeName") || "";

                return `<option value="${id}" data-code="${safeText(code)}">
                    ${safeText(code)} - ${safeText(name)}
                </option>`;
            }).join("");

        if ($.fn.selectpicker) {
            $(employeeSelect).selectpicker("destroy");
            $(employeeSelect).selectpicker({
                liveSearch: true,
                size: 6,
                width: "100%",
                container: "body",
                dropupAuto: false
            });
        }

    } catch (err) {
        showToast("danger", err.message || "Failed to load employees.");
    }
}

// ======================================================
// RENDER ROWS
// ======================================================
function renderManualEditRows(logs) {
    const tableBody = document.getElementById("tblManualEditLogsBody");

    if (!logs || logs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    No attendance records found for this employee.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = logs.map((log, index) => {
        const employeeCode = getAny(log, "employeeCode", "EmployeeCode");
        const employeeName = getAny(log, "employeeName", "EmployeeName");
        const divisionName = getAny(log, "divisionName", "DivisionName");
        const attendenceDate = getAny(log, "attendenceDate", "AttendenceDate");
        const inTime = getAny(log, "inTime", "InTime");
        const outTime = getAny(log, "outTime", "OutTime");

        const totalWorkingHour = getAny(log, "totalWorkingHour", "TotalWorkingHour") || 0;
        const totalWorkingMinute = getAny(log, "totalWorkingMinute", "TotalWorkingMinute") || 0;

        const lateHour = getAny(log, "lateHour", "LateHour") || 0;
        const lateMinute = getAny(log, "lateMinute", "LateMinute") || 0;

        const otHour = getAny(log, "otHour", "OTHour") || 0;
        const otMinute = getAny(log, "otMinute", "OTMinute") || 0;

        const status = getAny(log, "attendenceStatus", "AttendenceStatus");

        return `
            <tr>
                <td><strong>${safeText(employeeCode || "-")}</strong></td>
                <td>${safeText(employeeName || "-")}</td>
                <td>${safeText(divisionName || "-")}</td>


                <td>${inTime ? formatManualDateOnly(inTime) : "-"}</td>
                <td>${inTime ? `<span class="badge bg-success">${formatTimeOnly(inTime)}</span>` : "-"}</td>
                
               <td>
    ${
            outTime
                ? `<span class="${isDifferentDate(attendenceDate, outTime) ? "text-danger fw-bold" : ""}">
                    ${formatManualDateOnly(outTime)}
               </span>`
                : "-"
    }
</td>
                <td>${outTime ? `<span class="badge bg-primary">${formatTimeOnly(outTime)}</span>` : "-"}</td>
                <td>${formatHourMinute(totalWorkingHour, totalWorkingMinute)}</td>
                <td>${formatHourMinute(lateHour, lateMinute)}</td>
                <td>${formatHourMinute(otHour, otMinute)}</td>
                <td>${getStatusBadge(status)}</td>
                <td>
                    <button type="button"
                            class="btn btn-primary btn-sm"
                            onclick="openManualEditModal(${index})">
                        Edit
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// ======================================================
// OPEN EDIT MODAL
// ======================================================
function openManualEditModal(index) {
    const log = manualEditLogs[index];

    if (!log) return;

    const id =
        getAny(log, "idAttendenceDailySummary", "IDAttendenceDailySummary") ||
        getAny(log, "idAttendanceDailySummary", "IDAttendanceDailySummary") ||
        0;

    const employeeId = getAny(log, "idEmployee", "IDEmployee") || 0;
    const employeeCode = getAny(log, "employeeCode", "EmployeeCode") || "";
    const employeeName = getAny(log, "employeeName", "EmployeeName") || "";
    const attendenceDate = getAny(log, "attendenceDate", "AttendenceDate");
    const inTime = getAny(log, "inTime", "InTime");
    const outTime = getAny(log, "outTime", "OutTime");

    document.getElementById("manualEditSummaryId").value = id;
    document.getElementById("manualEditEmployeeId").value = employeeId;
    document.getElementById("manualEditEmployeeText").value = `${employeeCode} - ${employeeName}`;
    document.getElementById("manualEditDate").value = formatDateOnly(attendenceDate);

    setManualDateTimeFields("manualEditIn", inTime, attendenceDate);
    setManualDateTimeFields("manualEditOut", outTime, attendenceDate);

    const modalElement = document.getElementById("manualEditModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement, {
        backdrop: "static",
        keyboard: false
    });

    modal.show();
}
// ======================================================
// SAVE MANUAL EDIT
// ======================================================
async function saveManualAttendanceTime() {
    const id = Number(document.getElementById("manualEditSummaryId")?.value || 0);
    const employeeId = Number(document.getElementById("manualEditEmployeeId")?.value || 0);
    const attendanceDate = document.getElementById("manualEditDate")?.value || "";
    const inTime = getManualDateTimeValue("manualEditIn");
    const outTime = getManualDateTimeValue("manualEditOut");
    const reason = document.getElementById("manualEditReason")?.value || "";

    if (!employeeId) {
        showToast("danger", "Employee id not found.");
        return;
    }

    if (!attendanceDate) {
        showToast("danger", "Attendance date not found.");
        return;
    }

    if (!inTime && !outTime) {
        showToast("warning", "Please enter In Time or Out Time.");
        return;
    }

    try {
        const response = await fetch("/api/DeviceLog/manual-update", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idAttendenceDailySummary: id,
                idEmployee: employeeId,
                attendenceDate: attendanceDate,
                inTime: inTime || null,
                outTime: outTime || null,
                manualReason: reason
            })
        });

        const result = await readJsonResponse(response);

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to update attendance time.");
        }

        const modalElement = document.getElementById("manualEditModal");
        const modal = bootstrap.Modal.getInstance(modalElement);

        if (modal) {
            modal.hide();
        }

        showToast("success", result.message || "Attendance time updated successfully.");

        await fetchManualEditList();

    } catch (err) {
        showToast("danger", err.message);
        console.error(err);
    }
}

// ======================================================
// TOTALS
// ======================================================
function renderManualEditTotals(logs) {
    if (!logs || logs.length === 0) {
        hideManualEditTotals();
        return;
    }

    const total = logs[0];

    setText("totalMonthDays", getAny(total, "totalMonthDays", "TotalMonthDays") || 0);
    setText("totalWorkingDays", getAny(total, "totalWorkingDays", "TotalWorkingDays") || 0);
    setText("totalPresentDays", formatDecimal(getAny(total, "totalPresentDays", "TotalPresentDays") || 0));
    setText("totalPayableDays", formatDecimal(getAny(total, "totalPayableDays", "TotalPayableDays") || 0));

    setText(
        "totalWorkingTime",
        formatHourMinute(
            getAny(total, "totalAllWorkingHour", "TotalAllWorkingHour") || 0,
            getAny(total, "totalAllWorkingMinute", "TotalAllWorkingMinute") || 0
        )
    );

    setText(
        "totalLateTime",
        formatHourMinute(
            getAny(total, "totalAllLateHour", "TotalAllLateHour") || 0,
            getAny(total, "totalAllLateMinute", "TotalAllLateMinute") || 0
        )
    );

    setText(
        "totalOTTime",
        formatHourMinute(
            getAny(total, "totalAllOTHour", "TotalAllOTHour") || 0,
            getAny(total, "totalAllOTMinute", "TotalAllOTMinute") || 0
        )
    );

    setText("totalOTDays", formatDecimal(getAny(total, "totalOTDays", "TotalOTDays") || 0));
    setText("lateEntryCount", getAny(total, "lateEntryCount", "LateEntryCount") || 0);

    const box = document.getElementById("manualEditTotals");
    if (box) box.classList.remove("d-none");
}

function hideManualEditTotals() {
    const box = document.getElementById("manualEditTotals");
    if (box) box.classList.add("d-none");
}






function filterManualEditRows() {
    const searchText = document.getElementById("manualEditTableSearch")?.value
        ?.toLowerCase()
        ?.trim() || "";

    if (!searchText) {
        renderManualEditRows(manualEditLogs);
        return;
    }

    const filteredLogs = manualEditLogs.filter(log => {
        const employeeCode = getAny(log, "employeeCode", "EmployeeCode") || "";
        const employeeName = getAny(log, "employeeName", "EmployeeName") || "";
        const divisionName = getAny(log, "divisionName", "DivisionName") || "";
        const attendenceDate = getAny(log, "attendenceDate", "AttendenceDate") || "";
        const inTime = getAny(log, "inTime", "InTime") || "";
        const outTime = getAny(log, "outTime", "OutTime") || "";
        const status = getAny(log, "attendenceStatus", "AttendenceStatus") || "";

        const searchableText = [
            employeeCode,
            employeeName,
            divisionName,
            formatManualDateOnly(attendenceDate),
            formatManualDateOnly(inTime),
            formatManualDateOnly(outTime),
            formatTimeOnly(inTime),
            formatTimeOnly(outTime),
            status
        ].join(" ").toLowerCase();

        return searchableText.includes(searchText);
    });

    renderManualEditRows(filteredLogs);
}

// ======================================================
// HELPERS
// ======================================================


// =====================================================
// formatManualEditDateTime12
// =====================================================


function formatManualEditDateTime12(value, fallbackDate) {
    const dateObj = parseServerDate(value) || parseServerDate(fallbackDate);

    if (!dateObj) return "";

    const date = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const time = dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    return `${date} ${time}`;
}


function formatManualDateOnly(value) {
    const dateObj = parseServerDate(value);

    if (!dateObj) {
        return value || "-";
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
}







// ================================================
// setManualDateTimeFields
// ================================================
function setManualDateTimeFields(prefix, value, fallbackDate) {
    const dateObj = parseServerDate(value) || parseServerDate(fallbackDate);

    const dateInput = document.getElementById(`${prefix}Date`);
    const timeInput = document.getElementById(`${prefix}Time12`);
    const ampmInput = document.getElementById(`${prefix}AmPm`);

    if (!dateObj) {
        if (dateInput) dateInput.value = "";
        if (timeInput) timeInput.value = "";
        if (ampmInput) ampmInput.value = "AM";
        return;
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    let hour = dateObj.getHours();
    const minute = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    if (dateInput) dateInput.value = `${year}-${month}-${day}`;
    if (timeInput) timeInput.value = `${String(hour).padStart(2, "0")}:${minute}`;
    if (ampmInput) ampmInput.value = ampm;
}

function getManualDateTimeValue(prefix) {
    const date = document.getElementById(`${prefix}Date`)?.value || "";
    const time = document.getElementById(`${prefix}Time12`)?.value || "";
    const ampm = document.getElementById(`${prefix}AmPm`)?.value || "AM";

    if (!date || !time) return "";

    let [hour, minute] = time.split(":").map(Number);

    if (ampm === "PM" && hour < 12) {
        hour += 12;
    }

    if (ampm === "AM" && hour === 12) {
        hour = 0;
    }

    return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}



// ====================================================
// isDifferentDate

// ====================================================

function isDifferentDate(date1, date2) {
    const d1 = parseServerDate(date1);
    const d2 = parseServerDate(date2);

    if (!d1 || !d2) return false;

    return d1.getFullYear() !== d2.getFullYear()
        || d1.getMonth() !== d2.getMonth()
        || d1.getDate() !== d2.getDate();
}
function isDifferentDate(date1, date2) {
    const d1 = parseServerDate(date1);
    const d2 = parseServerDate(date2);

    if (!d1 || !d2) return false;

    return d1.getFullYear() !== d2.getFullYear()
        || d1.getMonth() !== d2.getMonth()
        || d1.getDate() !== d2.getDate();
}

// ====================================================
// datehelper function 
// ====================================================
function formatManualEditDateTime(value) {
    const dateObj = parseServerDate(value);

    if (!dateObj) {
        return value || "-";
    }

    const date = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const time = dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });

    return `${date} ${time}`;
}

function toDateTimeLocalValue(value, fallbackDate) {
    let dateObj = parseServerDate(value);

    if (!dateObj && fallbackDate) {
        dateObj = parseServerDate(fallbackDate);
    }

    if (!dateObj) return "";

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hour = value ? String(dateObj.getHours()).padStart(2, "0") : "00";
    const minute = value ? String(dateObj.getMinutes()).padStart(2, "0") : "00";

    return `${year}-${month}-${day}T${hour}:${minute}`;
}



function getAny(obj, camel, pascal) {
    return obj?.[camel] ?? obj?.[pascal];
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

function formatDecimal(value) {
    const n = Number(value || 0);
    return n.toFixed(2);
}

function safeText(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function getStatusBadge(status) {
    const value = (status || "").toString().trim();
    const key = value.toLowerCase();

    const colors = {
        "present": {
            bg: "#10b981",
            color: "#ffffff"
        },
        "absent": {
            bg: "#ef4444",
            color: "#ffffff"
        },
        "half day": {
            bg: "#f59e0b",
            color: "#ffffff"
        },
        "halfday": {
            bg: "#f59e0b",
            color: "#ffffff"
        },
        "late": {
            bg: "#fb923c",
            color: "#ffffff"
        },
        //"no punch": {
        //    bg: "#64748b",
        //    color: "#ffffff"
        //},
        "single punch": {
            bg: "#8b5cf6",
            color: "#ffffff"
        },
        "sunday": {
            bg: "#0ea5e9",
            color: "#ffffff"
        },
        "week off": {
            bg: "#0ea5e9",
            color: "#ffffff"
        },
        "weekly off": {
            bg: "#0ea5e9",
            color: "#ffffff"
        },
        "paid holiday": {
            bg: "#14b8a6",
            color: "#ffffff"
        },
        "unpaid holiday": {
            bg: "#dc2626",
            color: "#ffffff"
        },
        "holiday": {
            bg: "#6366f1",
            color: "#ffffff"
        },
        "leave": {
            bg: "#a855f7",
            color: "#ffffff"
        }
    };

    if (key === "no punch") {
        return `<span style="color:#64748b; font-weight:600;">
        ${safeText(value || "-")}
    </span>`;
    }
    const selected = colors[key] || {
        bg: "#94a3b8",
        color: "#ffffff"
    };

    return `
        <span class="badge rounded-pill"
              style="background-color:${selected.bg}; color:${selected.color};">
            ${safeText(value || "-")}
        </span>
    `;
}
function hasRealAttendanceData(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return false;

    return rows.some(x => {
        const attendanceId = getAny(x, "idAttendance", "IDAttendance", "attendanceId", "AttendanceId");
        const inTime = getAny(x, "inTime", "InTime");
        const outTime = getAny(x, "outTime", "OutTime");
        const totalWorking = getAny(x, "totalWorking", "TotalWorking");
        const status = (getAny(x, "status", "Status") || "").toString().toLowerCase();

        return (
            attendanceId ||
            (inTime && inTime !== "-") ||
            (outTime && outTime !== "-") ||
            (totalWorking && totalWorking !== "00:00") ||
            !["", "no punch", "sunday"].includes(status)
        );
    });
}