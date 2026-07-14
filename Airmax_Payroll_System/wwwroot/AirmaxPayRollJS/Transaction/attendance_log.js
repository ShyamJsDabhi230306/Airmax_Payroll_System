
// Global variables to manage the state of raw and calculated logs

let fetchedLogs = [];
let calculatedLogs = [];

let currentBatchKey = "";
let rawCurrentPage = 1;
let rawPageSize = 100;
let rawTotalLoaded = 0;
let rawFetchCompleted = false;
let rawFetchTimer = null;
let calculatedCurrentPage = 1;
let calculatedPageSize = 25;
let calculatedTotalRecords = 0;
let manualEditLogs = [];


async function readJsonResponse(response) {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return {
            success: false,
            message: text
        };
    }
}
// Function to fetch raw logs based on selected month and initialize the fetching process
async function fetchLogs() {
    const monthVal = document.getElementById("filterMonth").value;

    if (!monthVal) {
        showToast("warning", "Please select a month.");
        return;
    }

    const { firstDay, lastDayFormatted } = getMonthDateRange(monthVal);

    const tableBody = document.getElementById("tblLogsBody");
    const saveBtn = document.getElementById("btnSave");
    const info = document.getElementById("rawFetchInfo");

    currentBatchKey = "";
    rawCurrentPage = 1;
    rawTotalLoaded = 0;
    rawFetchCompleted = false;
    fetchedLogs = [];

    if (rawFetchTimer) {
        clearInterval(rawFetchTimer);
        rawFetchTimer = null;
    }

    saveBtn.disabled = true;

    if (info) {
        info.innerText = "Starting fetch...";
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <i class="fas fa-spinner fa-spin me-2"></i>Starting device fetch...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(`/api/DeviceLog/start-fetch?fromDate=${firstDay}&toDate=${lastDayFormatted}`, {
            method: "POST"
        });

        const result = await readJsonResponse(response);

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to start fetch.");
        }

        currentBatchKey =
            result.batchKey ||
            result.BatchKey ||
            result.data?.batchKey ||
            result.data?.BatchKey ||
            result.Data?.batchKey ||
            result.Data?.BatchKey;

        if (!currentBatchKey) {
            throw new Error(result.message || "Batch key not found from fetch response.");
        }

        showToast("success", "Device fetch started.");

        await loadRawPage(1);

        rawFetchTimer = setInterval(async function () {
            try {
                await loadRawPage(rawCurrentPage);

                if (rawFetchCompleted) {
                    clearInterval(rawFetchTimer);
                    rawFetchTimer = null;

                    saveBtn.disabled = rawTotalLoaded === 0;

                    showToast("success", "All logs fetched. You can now Save & Calculate.");
                }
            } catch (err) {
                clearInterval(rawFetchTimer);
                rawFetchTimer = null;
                showToast("danger", err.message);
            }
        }, 1500);

    } catch (err) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    Failed to fetch logs. Reason: ${err.message}
                </td>
            </tr>
        `;

        if (info) {
            info.innerText = "Fetch failed.";
        }

        console.error(err);
    }
}



// Function to load a specific page of raw logs based on the current batch key
async function loadRawPage(page) {
    if (!currentBatchKey) {
        return;
    }

    const response = await fetch(`/api/DeviceLog/fetch-page?batchKey=${currentBatchKey}&page=${page}&pageSize=${rawPageSize}`);
    const result = await readJsonResponse(response);

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load raw page.");
    }

    fetchedLogs = result.records || result.Records || [];
    rawTotalLoaded = result.totalLoaded || result.TotalLoaded || 0;
    rawFetchCompleted = result.isCompleted || result.IsCompleted || false;
    rawCurrentPage = page;

    sortRawLogs(fetchedLogs);
    renderRawLogs(fetchedLogs);
    updateRawFetchInfo();
}


// Function to update the raw fetch information display
function updateRawFetchInfo() {
    const info = document.getElementById("rawFetchInfo");

    if (!info) {
        return;
    }

    if (rawTotalLoaded === 0) {
        info.innerText = "No records loaded.";
        return;
    }

    const startRecord = ((rawCurrentPage - 1) * rawPageSize) + 1;
    const endRecord = Math.min(rawCurrentPage * rawPageSize, rawTotalLoaded);

    info.innerText = `Showing ${startRecord} to ${endRecord} of ${rawTotalLoaded} loaded records${rawFetchCompleted ? " | Completed" : " | Fetching..."}`;
}

// Function to navigate to the next page of raw logs
async function nextRawPage() {
    if (!currentBatchKey) {
        showToast("warning", "Please fetch logs first.");
        return;
    }

    const maxPage = Math.ceil(rawTotalLoaded / rawPageSize);

    if (rawCurrentPage >= maxPage) {
        showToast("info", rawFetchCompleted ? "No more records." : "More records are still loading.");
        return;
    }

    await loadRawPage(rawCurrentPage + 1);
}

// Function to navigate to the previous page of raw logs

async function previousRawPage() {
    if (!currentBatchKey) {
        showToast("warning", "Please fetch logs first.");
        return;
    }

    if (rawCurrentPage <= 1) {
        return;
    }

    await loadRawPage(rawCurrentPage - 1);
}


// Function to change the page size for raw logs and fetch the first page

async function changeRawPageSize() {
    const pageSizeValue = document.getElementById("rawPageSize").value;

    rawPageSize = parseInt(pageSizeValue, 10);
    rawCurrentPage = 1;

    if (!currentBatchKey) {
        return;
    }

    await loadRawPage(1);
}


// Function to save the fetched logs and calculate attendance
async function saveLogs() {
    if (!currentBatchKey) {
        showToast("warning", "Please fetch logs first.");
        return;
    }

    if (!rawFetchCompleted) {
        showToast("warning", "Please wait until all logs are fetched.");
        return;
    }

    if (rawTotalLoaded === 0) {
        showToast("warning", "No raw logs available to save.");
        return;
    }

    const saveBtn = document.getElementById("btnSave");

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>Saving...`;

    try {
        const response = await fetch(`/api/DeviceLog/save-batch?batchKey=${currentBatchKey}`, {
            method: "POST"
        });

        const result = await readJsonResponse(response);

        if (response.ok && result.success) {
            calculatedLogs = result.dailySummary || result.DailySummary || [];

            sortSummaryRows(calculatedLogs);
            renderCalculatedLogs(calculatedLogs);

            showToast("success", result.message || "Attendance saved and calculated successfully.");
        } else {
            throw new Error(result.message || "Failed to save attendance.");
        }

    } catch (err) {
        showToast("danger", err.message);
        saveBtn.disabled = false;
    } finally {
        saveBtn.innerHTML = `<i class="fas fa-calculator me-1"></i>Save & Calculate`;
    }
}


// Function to fetch calculated logs based on selected month, search value, and pagination
async function fetchCalculatedLogs(page = 1) {
    const monthVal = document.getElementById("calculatedFilterMonth").value;

    if (!monthVal) {
        showToast("warning", "Please select a month.");
        return;
    }

    const searchValue = document.getElementById("calculatedSearch").value.trim();
    const { firstDay, lastDayFormatted } = getMonthDateRange(monthVal);
    const tableBody = document.getElementById("tblCalculatedLogsBody");

    calculatedCurrentPage = page;

    tableBody.innerHTML = `
        <tr>
            <td colspan="12" class="text-center py-4">
                <i class="fas fa-spinner fa-spin me-2"></i>Loading calculated attendance...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(
            `/api/DeviceLog/summary-paged?fromDate=${firstDay}&toDate=${lastDayFormatted}&page=${calculatedCurrentPage}&pageSize=${calculatedPageSize}&search=${encodeURIComponent(searchValue)}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to fetch calculated attendance.");
        }

        calculatedLogs = result.data || result.Data || [];
        calculatedTotalRecords = result.totalRecords || result.TotalRecords || 0;

        renderCalculatedLogs(calculatedLogs);
        renderCalculatedPagination();

        //showToast("success", `${calculatedTotalRecords} calculated records found.`);

    } catch (err) {
        resetDataTable("#tblCalculatedLogs");

        tableBody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-danger py-4">
                    Failed to fetch calculated data. Reason: ${err.message}
                </td>
            </tr>
        `;
        console.error(err);
    }
}

// Function to render the raw logs in the table
function renderRawLogs(logs) {
    const tableBody = document.getElementById("tblLogsBody");

    if (!logs || logs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    No records found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = logs.map(log => {
        const employeeCode = log.employeeCode || log.EmployeeCode;
        const logDate = log.logDate || log.LogDate;
        const serialNumber = log.serialNumber || log.SerialNumber;
        const direction = log.punchDirection || log.PunchDirection;
        const temperature = log.temperature ?? log.Temperature;
        const temperatureState = log.temperatureState || log.TemperatureState;

        return `
            <tr>
                <td><strong>${employeeCode || "-"}</strong></td>
                <td>${formatDateTimeDisplay(logDate)}</td>
                <td class="font-monospace">${serialNumber || "-"}</td>
                <td>${getDirectionBadge(direction)}</td>
                <td>${temperature ?? "-"}</td>
                <td>${temperatureState || "-"}</td>
            </tr>
        `;
    }).join("");
}


// Function to render the calculated logs in the table
function renderCalculatedLogs(logs) {
    const tableBody = document.getElementById("tblCalculatedLogsBody");

    resetDataTable("#tblCalculatedLogs");

    if (!logs || logs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-muted py-4">
                    No calculated records found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = logs.map(log => {
        const employeeCode = log.employeeCode || log.EmployeeCode;
        const employeeName = log.employeeName || log.EmployeeName;
        const departmentName = log.departmentName || log.DepartmentName;
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
                <td>${departmentName || "-"}</td>
                <td>${formatDateOnly(attendenceDate)}</td>
                <td>${inTime ? `<span class="badge bg-success">${formatTimeOnly(inTime)}</span>` : "-"}</td>
                <td>${outTime ? `<span class="badge bg-primary">${formatTimeOnly(outTime)}</span>` : "-"}</td>
                <td>${formatHourMinute(totalWorkingHour, totalWorkingMinute)}</td>
                <td>${formatHourMinute(lateHour, lateMinute)}</td>
                <td>${formatHourMinute(otHour, otMinute)}</td>
                <td>${getStatusBadge(status)}</td>
                <td class="font-monospace">${inDevice || "-"}</td>
                <td class="font-monospace">${outDevice || "-"}</td>
            </tr>
        `;
    }).join("");

    initializeCalculatedDataTable();
}


// Function to apply the raw logs filter based on search value
function applyRawFilter() {
    const searchValue = document.getElementById("globalSearch").value.trim().toLowerCase();

    if (!fetchedLogs || fetchedLogs.length === 0) {
        renderRawLogs([]);
        return;
    }

    if (!searchValue) {
        renderRawLogs(fetchedLogs);
        return;
    }

    const filteredLogs = fetchedLogs.filter(log => {
        const searchableText = [
            log.employeeCode || log.EmployeeCode,
            log.logDate || log.LogDate,
            log.serialNumber || log.SerialNumber,
            log.punchDirection || log.PunchDirection,
            log.temperature ?? log.Temperature,
            log.temperatureState || log.TemperatureState
        ].join(" ").toLowerCase();

        return searchableText.includes(searchValue);
    });

    renderRawLogs(filteredLogs);
}

// Function to apply the calculated logs filter based on selected month and search value
function applyCalculatedFilter() {
    fetchCalculatedLogs(1);
}


// Function to change the page size for calculated logs and fetch the first page
async function changeCalculatedPageSize() {
    const pageSizeValue = document.getElementById("calculatedPageSize").value;

    calculatedPageSize = parseInt(pageSizeValue, 10);
    calculatedCurrentPage = 1;

    await fetchCalculatedLogs(1);
}


// Function to navigate to the next page of calculated logs
async function nextCalculatedPage() {
    const maxPage = Math.ceil(calculatedTotalRecords / calculatedPageSize);

    if (calculatedCurrentPage >= maxPage) {
        showToast("info", "No more records.");
        return;
    }

    await fetchCalculatedLogs(calculatedCurrentPage + 1);
}

// Function to navigate to the previous page of calculated logs
async function previousCalculatedPage() {
    if (calculatedCurrentPage <= 1) {
        return;
    }

    await fetchCalculatedLogs(calculatedCurrentPage - 1);
}

// Function to render pagination information for calculated logs
function renderCalculatedPagination() {
    const info = document.getElementById("calculatedFetchInfo");

    if (!info) {
        return;
    }

    if (calculatedTotalRecords === 0) {
        info.innerText = "No records loaded.";
        return;
    }

    const startRecord = ((calculatedCurrentPage - 1) * calculatedPageSize) + 1;
    const endRecord = Math.min(calculatedCurrentPage * calculatedPageSize, calculatedTotalRecords);

    info.innerText = `Showing ${startRecord} to ${endRecord} of ${calculatedTotalRecords} records`;
}

//  Function to recalculate attendance for the selected month
async function recalculateAttendance() {
    const monthVal = document.getElementById("calculatedFilterMonth").value;

    if (!monthVal) {
        showToast("warning", "Please select a month.");
        return;
    }

    const { firstDay, lastDayFormatted } = getMonthDateRange(monthVal);
    const tableBody = document.getElementById("tblCalculatedLogsBody");

    tableBody.innerHTML = `
        <tr>
            <td colspan="12" class="text-center py-4">
                <i class="fas fa-spinner fa-spin me-2"></i>Recalculating attendance...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(`/api/DeviceLog/recalculate?fromDate=${firstDay}&toDate=${lastDayFormatted}`, {
            method: "POST"
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to recalculate attendance.");
        }

        calculatedLogs = result.dailySummary || result.DailySummary || [];

        sortSummaryRows(calculatedLogs);
        renderCalculatedLogs(calculatedLogs);

        showToast("success", result.message || "Attendance recalculated successfully.");

    } catch (err) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-danger py-4">
                    Failed to recalculate attendance. Reason: ${err.message}
                </td>
            </tr>
        `;
        console.error(err);
    }
}

function resetDataTable(tableSelector) {
    if ($.fn.DataTable.isDataTable(tableSelector)) {
        $(tableSelector).DataTable().destroy();
    }
}
// Initializes the raw logs DataTable with specific configurations
function initializeRawDataTable() {
    const table = $("#tblRawLogs").DataTable({
        searching: false,
        paging: false,
        info: false,
        lengthChange: false,
        ordering: false,
        autoWidth: false,
        scrollX: true,
        scrollY: "430px",
        scrollCollapse: true
    });

    setTimeout(function () {
        table.columns.adjust();
    }, 100);
}
// Initializes the calculated logs DataTable with specific configurations
function initializeCalculatedDataTable() {
    const table = $("#tblCalculatedLogs").DataTable({
        searching: false,
        paging: false,
        info: false,
        lengthChange: false,
        ordering: false,
        autoWidth: false,
        scrollX: true,
        scrollY: "430px",
        scrollCollapse: true
    });

    setTimeout(function () {
        table.columns.adjust();
    }, 100);
}
// Sorts the raw logs based on employee code and log date
function sortRawLogs(rows) {
    if (!rows) {
        return;
    }

    rows.sort((a, b) => {
        const codeA = a.employeeCode || a.EmployeeCode || "";
        const codeB = b.employeeCode || b.EmployeeCode || "";

        const codeCompare = String(codeA).localeCompare(String(codeB), undefined, {
            numeric: true
        });

        if (codeCompare !== 0) {
            return codeCompare;
        }

        const dateA = parseServerDate(a.logDate || a.LogDate);
        const dateB = parseServerDate(b.logDate || b.LogDate);

        return (dateA || 0) - (dateB || 0);
    });
}
// Sorts the summary rows based on attendance date and employee code
function sortSummaryRows(rows) {
    if (!rows) {
        return;
    }

    rows.sort((a, b) => {
        const dateA = parseServerDate(a.attendenceDate || a.AttendenceDate);
        const dateB = parseServerDate(b.attendenceDate || b.AttendenceDate);

        const dateCompare = (dateA || 0) - (dateB || 0);

        if (dateCompare !== 0) {
            return dateCompare;
        }

        const codeA = a.employeeCode || a.EmployeeCode || "";
        const codeB = b.employeeCode || b.EmployeeCode || "";

        return String(codeA).localeCompare(String(codeB), undefined, {
            numeric: true
        });
    });
}
// Function to get the first and last date of a given month in YYYY-MM-DD format
function getMonthDateRange(monthVal) {
    const [year, month] = monthVal.split("-");
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const lastDayFormatted = `${year}-${month}-${lastDay.toString().padStart(2, "0")}`;

    return {
        firstDay,
        lastDayFormatted
    };
}
// Function to parse server date string into a Date object
function parseServerDate(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    const text = String(value).trim();

    let dateObj = new Date(text.replace(" ", "T"));

    if (!isNaN(dateObj.getTime())) {
        return dateObj;
    }

    const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);

    if (match) {
        const month = Number(match[1]) - 1;
        const day = Number(match[2]);
        const year = Number(match[3]);
        const hour = Number(match[4]);
        const minute = Number(match[5]);
        const second = Number(match[6]);

        dateObj = new Date(year, month, day, hour, minute, second);

        return isNaN(dateObj.getTime()) ? null : dateObj;
    }

    return null;
}
// Function to format date only for display
function formatDateOnly(value) {
    const dateObj = parseServerDate(value);

    if (!dateObj) {
        return value || "-";
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
// Function to format time only for display
function formatTimeOnly(value) {
    const dateObj = parseServerDate(value);

    if (!dateObj) {
        return value || "-";
    }

    return dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}
// Function to format date and time for display
function formatDateTimeDisplay(value) {
    const dateObj = parseServerDate(value);

    if (!dateObj) {
        return value || "-";
    }

    return `${formatDateOnly(value)} ${formatTimeOnly(value)}`;
}
// Function to format hours and minutes into HH:MM format
function formatHourMinute(hour, minute) {
    return `${String(hour || 0).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}`;
}
// Function to get direction badge based on punch direction
function getDirectionBadge(direction) {
    const value = String(direction || "").toLowerCase();

    if (value === "in") {
        return `<span class="badge bg-success">IN</span>`;
    }

    if (value === "out") {
        return `<span class="badge bg-primary">OUT</span>`;
    }

    return `<span class="badge bg-secondary">${direction || "-"}</span>`;
}
// Function to get status badge based on attendance status
function getStatusBadge(status) {
    if (status === "Present") {
        return `<span class="badge bg-success">Present</span>`;
    }

    if (status === "Missing Out" || status === "Missing In") {
        return `<span class="badge bg-warning text-dark">${status}</span>`;
    }

    if (status === "Invalid Punch") {
        return `<span class="badge bg-danger">Invalid Punch</span>`;
    }

    return `<span class="badge bg-secondary">${status || "-"}</span>`;
}

