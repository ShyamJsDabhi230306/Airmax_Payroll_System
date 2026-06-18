let fetchedLogs = [];
let groupedLogs = [];

const SHIFT_START = "09:00:00";
const SHIFT_END = "18:00:00";

async function fetchLogs() {
    const monthVal = document.getElementById("filterMonth").value;

    if (!monthVal) {
        showToast("warning", "Please select a month.");
        return;
    }

    const [year, month] = monthVal.split("-");
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const lastDayFormatted = `${year}-${month}-${lastDay.toString().padStart(2, "0")}`;

    const tableBody = document.getElementById("tblLogsBody");
    const saveBtn = document.getElementById("btnSave");

    tableBody.innerHTML = `
        <tr>
            <td colspan="12" class="text-center py-4">
                <i class="fas fa-spinner fa-spin me-2"></i>Loading logs from API...
            </td>
        </tr>
    `;

    saveBtn.disabled = true;

    try {
        const response = await fetch(`/api/DeviceLog?fromDate=${firstDay}&toDate=${lastDayFormatted}`);

        if (!response.ok) {
            throw new Error("API call failed.");
        }

        const data = await response.json();

        fetchedLogs = data.rawLogs || data.RawLogs || [];
        groupedLogs = data.dailySummary || data.DailySummary || [];
        groupedLogs.sort((a, b) => {
            const dateA = a.attendenceDate || a.AttendenceDate;
            const dateB = b.attendenceDate || b.AttendenceDate;

            const dateCompare = new Date(dateA) - new Date(dateB);

            if (dateCompare !== 0) {
                return dateCompare;
            }

            const codeA = a.employeeCode || a.EmployeeCode || "";
            const codeB = b.employeeCode || b.EmployeeCode || "";

            return String(codeA).localeCompare(String(codeB), undefined, {
                numeric: true
            });
        });
        if (!fetchedLogs || fetchedLogs.length === 0) {
            tableBody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-muted py-4">
                    No records found for the selected month.
                </td>
            </tr>
        `;
            return;
        }

        applyGlobalFilter();

        saveBtn.disabled = false;
        showToast("success", `${fetchedLogs.length} logs fetched successfully.`);

    } catch (err) {
        tableBody.innerHTML = `
        <tr>
            <td colspan="12" class="text-center text-danger py-4">
                Failed to fetch logs. Reason: ${err.message}
            </td>
        </tr>
    `;
        console.error(err);
    }
}
// Group logs employee-wise and date-wise
function groupAttendanceLogs(logs) {
    const grouped = {};

    logs.forEach(log => {
        const employeeCode = log.employeeCode || log.EmployeeCode;
        const logDateValue = log.logDate || log.LogDate;
        const serialNumber = log.serialNumber || log.SerialNumber;
        const direction = (log.punchDirection || log.PunchDirection || "").toLowerCase();
        const temperature = log.temperature || log.Temperature;
        const temperatureState = log.temperatureState || log.TemperatureState;

        if (!employeeCode || !logDateValue) {
            return;
        }

        const logDateObj = new Date(logDateValue);

        const dateOnly = formatDate(logDateObj);
        const timeOnly = formatTime(logDateObj);

        const key = `${employeeCode}_${dateOnly}`;

        if (!grouped[key]) {
            grouped[key] = {
                employeeCode: employeeCode,
                date: dateOnly,
                inTime: "",
                outTime: "",
                inDevice: "",
                outDevice: "",
                temperature: temperature,
                temperatureState: temperatureState,
                allLogs: []
            };
        }

        grouped[key].allLogs.push(log);

        if (direction === "in") {
            if (!grouped[key].inTime || logDateObj < new Date(grouped[key].inDateTime)) {
                grouped[key].inTime = timeOnly;
                grouped[key].inDateTime = logDateValue;
                grouped[key].inDevice = serialNumber;
            }
        }

        if (direction === "out") {
            if (!grouped[key].outTime || logDateObj > new Date(grouped[key].outDateTime)) {
                grouped[key].outTime = timeOnly;
                grouped[key].outDateTime = logDateValue;
                grouped[key].outDevice = serialNumber;
            }
        }
    });

    return Object.values(grouped).sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);

        if (dateCompare !== 0) {
            return dateCompare;
        }

        return String(a.employeeCode).localeCompare(String(b.employeeCode),
         undefined, {
            numeric: true
        });
    });
}

// Render grouped logs into table
function renderGroupedLogs(logs) {
    const tableBody = document.getElementById("tblLogsBody");

    if (!logs || logs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-muted py-4">
                    No records found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = logs.map(log => {
        const employeeCode = log.employeeCode || log.EmployeeCode;
        const employeeName = log.employeeName || log.EmployeeName;
        const attendenceDate = log.attendenceDate || log.AttendenceDate;
        const inTime = log.inTime || log.InTime;
        const outTime = log.outTime || log.OutTime;

        const totalWorkingHour = log.totalWorkingHour ?? log.TotalWorkingHour;
        const totalWorkingMinute = log.totalWorkingMinute ?? log.TotalWorkingMinute;

        const lateHour = log.lateHour ?? log.LateHour;
        const lateMinute = log.lateMinute ?? log.LateMinute;

        const otHour = log.otHour ?? log.OTHour;
        const otMinute = log.otMinute ?? log.OTMinute;

        const status = log.attendenceStatus || log.AttendenceStatus;
        const inDevice = log.inDevice || log.InDevice;
        const outDevice = log.outDevice || log.OutDevice;

        return `
            <tr>
                <td><strong>${employeeCode || "-"}</strong></td>
                <td>${employeeName || "-"}</td>
                <td>${formatDateOnly(attendenceDate)}</td>
                <td>${inTime ? `<span class="badge bg-success">${formatTimeOnly(inTime)}</span>` : "-"}</td>
                <td>${outTime ? `<span class="badge bg-primary">${formatTimeOnly(outTime)}</span>` : "-"}</td>
                <td>${formatHourMinute(totalWorkingHour, totalWorkingMinute)}</td>
                <td>${formatHourMinute(lateHour, lateMinute)}</td>
                <td>${formatHourMinute(otHour, otMinute)}</td>
                <td>${getStatusBadge(status)}</td>
                <td class="font-monospace">${inDevice || "-"}</td>
                <td class="font-monospace">${outDevice || "-"}</td>
                <td>-</td>
            </tr>
        `;
    }).join("");
}
// Format date as yyyy-MM-dd
function formatDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Format time as hh:mm:ss AM/PM
function formatTime(dateObj) {
    return dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}
function prepareLogsForSave(logs) {
    return logs.map(log => {
        return {
            EmployeeCode: log.employeeCode || log.EmployeeCode,
            LogDate: log.logDate || log.LogDate,
            SerialNumber: log.serialNumber || log.SerialNumber,
            PunchDirection: log.punchDirection || log.PunchDirection,
            Temperature: log.temperature || log.Temperature,
            TemperatureState: log.temperatureState || log.TemperatureState,

            IsActive: true,
            IsDelete: false,

            E_By: null,
            E_Date: new Date().toISOString(),

            U_By: null,
            U_Date: null
        };
    });
}
// Post records back to backend to save into DB
async function saveLogs() {
    if (!fetchedLogs || fetchedLogs.length === 0) {
        return;
    }

    const saveBtn = document.getElementById("btnSave");

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>Saving...`;

    try {
        const response = await fetch("/api/DeviceLog/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fetchedLogs)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast("success", result.message);

            fetchedLogs = [];
            groupedLogs = [];

            document.getElementById("tblLogsBody").innerHTML = `
                <tr>
                    <td colspan="12" class="text-center text-success py-4">
                        Attendance logs and daily summary saved successfully!
                    </td>
                </tr>
            `;
        } else {
            throw new Error(result.message || "Failed to save.");
        }

    } catch (err) {
        showToast("danger", err.message);
        saveBtn.disabled = false;
    } finally {
        saveBtn.innerHTML = `<i class="fas fa-save me-2"></i>Save`;
    }
}
function applyGlobalFilter() {
    const searchValue = document.getElementById("globalSearch").value.trim().toLowerCase();

    if (!groupedLogs || groupedLogs.length === 0) {
        renderGroupedLogs([]);
        return;
    }

    if (!searchValue) {
        renderGroupedLogs(groupedLogs);
        return;
    }

    const filteredLogs = groupedLogs.filter(log => {
        const searchableText = [
            log.employeeCode || log.EmployeeCode,
            log.employeeName || log.EmployeeName,
            log.attendenceDate || log.AttendenceDate,
            log.inTime || log.InTime,
            log.outTime || log.OutTime,
            log.totalWorkingHour ?? log.TotalWorkingHour,
            log.totalWorkingMinute ?? log.TotalWorkingMinute,
            log.lateHour ?? log.LateHour,
            log.lateMinute ?? log.LateMinute,
            log.otHour ?? log.OTHour,
            log.otMinute ?? log.OTMinute,
            log.attendenceStatus || log.AttendenceStatus,
            log.inDevice || log.InDevice,
            log.outDevice || log.OutDevice
        ].join(" ").toLowerCase();

        return searchableText.includes(searchValue);
    });

    renderGroupedLogs(filteredLogs);
}
function calculateAttendanceSummary(logs) {
    const grouped = {};

    logs.forEach(log => {
        const employeeCode = log.employeeCode || log.EmployeeCode;
        const logDateValue = log.logDate || log.LogDate;
        const serialNumber = log.serialNumber || log.SerialNumber;
        const direction = (log.punchDirection || log.PunchDirection || "").toLowerCase();
        const temperatureState = log.temperatureState || log.TemperatureState;

        if (!employeeCode || !logDateValue) {
            return;
        }

        const logDateObj = parseDate(logDateValue);
        const dateOnly = formatDate(logDateObj);
        const key = `${employeeCode}_${dateOnly}`;

        if (!grouped[key]) {
            grouped[key] = {
                employeeCode: employeeCode,
                employeeName: "",
                date: dateOnly,
                inDateTime: null,
                outDateTime: null,
                inTime: "",
                outTime: "",
                totalWorkingHour: 0,
                totalWorkingMinute: 0,
                lateHour: 0,
                lateMinute: 0,
                otHour: 0,
                otMinute: 0,
                status: "",
                inDevice: "",
                outDevice: "",
                temperatureState: temperatureState || "-"
            };
        }

        if (direction === "in") {
            if (!grouped[key].inDateTime || logDateObj < grouped[key].inDateTime) {
                grouped[key].inDateTime = logDateObj;
                grouped[key].inTime = formatTime(logDateObj);
                grouped[key].inDevice = serialNumber;
            }
        }

        if (direction === "out") {
            if (!grouped[key].outDateTime || logDateObj > grouped[key].outDateTime) {
                grouped[key].outDateTime = logDateObj;
                grouped[key].outTime = formatTime(logDateObj);
                grouped[key].outDevice = serialNumber;
            }
        }
    });

    const result = Object.values(grouped);

    result.forEach(row => {
        calculateRowHours(row);
    });

    return result.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);

        if (dateCompare !== 0) {
            return dateCompare;
        }

        return String(a.employeeCode).localeCompare(String(b.employeeCode), undefined, {
            numeric: true
        });
    });
}

function calculateRowHours(row) {
    const shiftStart = parseDate(`${row.date} ${SHIFT_START}`);
    const shiftEnd = parseDate(`${row.date} ${SHIFT_END}`);

    if (row.inDateTime && row.outDateTime && row.outDateTime > row.inDateTime) {
        row.status = "Present";

        const workingMinutes = diffMinutes(row.inDateTime, row.outDateTime);
        row.totalWorkingHour = Math.floor(workingMinutes / 60);
        row.totalWorkingMinute = workingMinutes % 60;

        if (row.inDateTime > shiftStart) {
            const lateMinutes = diffMinutes(shiftStart, row.inDateTime);
            row.lateHour = Math.floor(lateMinutes / 60);
            row.lateMinute = lateMinutes % 60;
        }

        if (row.outDateTime > shiftEnd) {
            const otMinutes = diffMinutes(shiftEnd, row.outDateTime);
            row.otHour = Math.floor(otMinutes / 60);
            row.otMinute = otMinutes % 60;
        }

        return;
    }

    if (row.inDateTime && !row.outDateTime) {
        row.status = "Missing Out";

        if (row.inDateTime > shiftStart) {
            const lateMinutes = diffMinutes(shiftStart, row.inDateTime);
            row.lateHour = Math.floor(lateMinutes / 60);
            row.lateMinute = lateMinutes % 60;
        }

        return;
    }

    if (!row.inDateTime && row.outDateTime) {
        row.status = "Missing In";
        return;
    }

    row.status = "Invalid";
}

function parseDate(value) {
    return new Date(String(value).replace(" ", "T"));
}

function diffMinutes(startDate, endDate) {
    return Math.floor((endDate - startDate) / 60000);
}

function formatDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatTime(dateObj) {
    return dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

function formatHourMinute(hour, minute) {
    return `${String(hour || 0).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}`;
}

function getStatusBadge(status) {
    if (status === "Present") {
        return `<span class="badge bg-success">Present</span>`;
    }

    if (status === "Missing Out" || status === "Missing In") {
        return `<span class="badge bg-warning text-dark">${status}</span>`;
    }

    return `<span class="badge bg-danger">${status || "Invalid"}</span>`;
}

function formatDateOnly(value) {
    if (!value) {
        return "-";
    }

    const dateObj = new Date(String(value).replace(" ", "T"));

    if (isNaN(dateObj.getTime())) {
        return value;
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatTimeOnly(value) {
    if (!value) {
        return "-";
    }

    const dateObj = new Date(String(value).replace(" ", "T"));

    if (isNaN(dateObj.getTime())) {
        return value;
    }

    return dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

function formatHourMinute(hour, minute) {
    return `${String(hour || 0).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}`;
}

function getStatusBadge(status) {
    if (status === "Present") {
        return `<span class="badge bg-success">Present</span>`;
    }

    if (status === "Missing Out" || status === "Missing In") {
        return `<span class="badge bg-warning text-dark">${status}</span>`;
    }

    return `<span class="badge bg-danger">${status || "Invalid"}</span>`;
}

