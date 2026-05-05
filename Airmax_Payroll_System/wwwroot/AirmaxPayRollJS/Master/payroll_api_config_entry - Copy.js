/** 
 * Part 1: Initial Data Loading Logic
 * This populates the form using data from the database.
 */

/** 
 * Part 1: Initial Data Loading Logic
 * This populates the form using data from the database.
 */

const API_CONFIG = "/api/master/payroll-api-config";
let allLocations = []; // To store locations from API

document.addEventListener("DOMContentLoaded", async () => {
    await loadCompanyDropdown();
    await fetchLocations(); // Fetch locations first

    $('#IDCompany').on('change', function () {
        const selectedCompanyId = $(this).val();
        // CLEAR THE TABLES when the company changes so we don't show old data
        $('#tblDeviceBody, #tblMappingBody').empty();
        loadExistingConfig(selectedCompanyId);
    });
    const initialCompanyId = $('#IDCompany').val();
    if (initialCompanyId) {
        await loadExistingConfig(initialCompanyId);
    }
});



async function loadExistingConfig(companyId = null) {
    try {
        // Use the selected company ID or get it from the dropdown if not provided
        const targetCompanyId = companyId || $('#IDCompany').val();

        // We fetch ALL but look for the specific company match
        const res = await apiFetch(`${API_CONFIG}/get-all`);
        const json = await res.json();

        // Try to find the config for the selected company
        const configData = json.data ? json.data.find(x => x.idCompany == targetCompanyId) : null;

        if (json.success && configData) {
            const d = configData;

            // --- IDs & Primary Keys ---
            $('#IDPayrollApiConfigration').val(d.idPayrollApiConfigration || 0);
            $('#IDBiometricDevice').val(d.idBiometricDevice || 0);
            $('#IDLocationDeviceMaping').val(d.idLocationDeviceMaping || 0);

            // --- Connection & Auth ---
            $('#BaseUrl').val(d.baseUrl);
            $('#AccountName').val(d.accountName);
            $('#ApiKey').val(d.apiKey);
            $('#PullApiEndPoint').val(d.pullApiEndPoint);
            $('#RequestTimeout').val(d.requestTimeout);
            $('#RetryAttemptOfFailer').val(d.retryAttemptOfFailer);
            $('#RetryBackOff').val(d.retryBackOff);

            // --- Flags ---
            $('#UseHTTPSOnly').prop('checked', d.useHTTPSOnly === true);
            $('#maskApiInLog').prop('checked', d.maskApiInLog === true);
            $('#IPWhiteListEnforcement').prop('checked', d.ipWhiteListEnforcement === true);
            $('#AutoRotateApiKeyOnEvery90Days').prop('checked', d.autoRotateApiKeyOnEvery90Days === true);

            // --- Data Mapping ---
            // --- Data Mapping (Now using selectpickers) ---
            $('#UseridPayroll').val(d.useridPayroll || 'employees.staff_code').selectpicker('refresh');
            $('#UseridTransform').val(d.useridTransform || 'None').selectpicker('refresh');
            $('#LogDatePayroll').val(d.logDatePayroll || 'punches.punch_time').selectpicker('refresh');
            $('#LogdateTransform').val(d.logdateTransform || 'None').selectpicker('refresh');
            $('#SerialNumberPayroll').val(d.serialNumberPayroll || 'punch_logs.device_serial').selectpicker('refresh');
            $('#SerialNumberTransform').val(d.serialNumberTransform || 'None').selectpicker('refresh');
            $('#DeviceSNamesPayroll').val(d.deviceSNamesPayroll || 'punch_logs.device_name').selectpicker('refresh');
            $('#deviceSNamesTransform').val(d.deviceSNamesTransform || 'None').selectpicker('refresh');


            // --- Rules & Pull Logic ---
            $('#PullFrequency').val(d.pullFrequency).selectpicker('refresh');
            $('#DateRangeWindow').val(d.dateRangeWindow).selectpicker('refresh');
            $('#ActiveHours').val(d.activeHours).selectpicker('refresh');

            $('#UserIDPull').prop('checked', d.userIDPull === true);
            $('#LogDate').prop('checked', d.logDate === true);
            $('#SerialNumberPull').prop('checked', d.serialNumberPull === true);
            $('#DeviceNamePull').prop('checked', d.deviceNamePull === true);

            $('#OnDuplicatePunch').val(d.onDuplicatePunch).selectpicker('refresh');
            $('#UnknownEmployeeCode').val(d.unknownEmployeeCode).selectpicker('refresh');
            $('#RejectFuturePunch').prop('checked', d.rejectFuturePunch === true);
            $('#RejectOldPunch').prop('checked', d.rejectOldPunch === true);
            $('#EmailOnFailure').prop('checked', d.emailOnFailure === true);

            // Load child tables
            await loadDevices();
            await loadMappings();

            $('.selectpicker').selectpicker('refresh');
            showToast("info", "Configuration loaded for selected company.");
        }
        else {
            // NO CONFIG FOUND: Reset form for a NEW entry
            $('#IDPayrollApiConfigration').val(0);
            // Clear form fields (optional but recommended)
            $('#BaseUrl, #AccountName, #ApiKey').val('');
            $('#tblDeviceBody, #tblMappingBody').empty();
            showToast("warning", "No configuration found for this company. Ready for new entry.");
        }
    } catch (err) {
        console.error("Failed to load config:", err);
    }
}

async function fetchLocations() {
    try {
        const res = await apiFetch("/api/master/location/get-all");
        const json = await res.json();

        // --- FIX: Support multiple API response formats ---
        if (json.success || json.isSuccess || json.result == 1) {
            allLocations = json.data;
            console.log("Locations loaded successfully:", allLocations);
        } else {
            console.warn("Location API returned success:false", json);
        }
    } catch (err) {
        console.error("Location Fetch Error:", err);
    }
}
async function loadDevices() {
    try {
        const res = await apiFetch("/api/master/biometric-device/get-all");
        const json = await res.json();
        if (json.success) {
            const tbody = document.getElementById("tblDeviceBody");
            tbody.innerHTML = "";
            json.data.forEach(d => addDeviceRow(d));
        }
    } catch (err) { console.error("Device Load Error:", err); }
}

async function loadMappings() {
    try {
        const res = await apiFetch("/api/master/location-device-mapping/get-all");
        const json = await res.json();
        if (json.success) {
            const tbody = document.getElementById("tblMappingBody");
            tbody.innerHTML = "";
            json.data.forEach(m => addMappingRow(m));
        }
    } catch (err) { console.error("Mapping Load Error:", err); }
}
async function loadCompanyDropdown() {
    try {
        const res = await apiFetch("/api/master/company/get-all");
        const json = await res.json();
        if (json.success) {
            const sel = $('#IDCompany');
            sel.empty();
            json.data.forEach(c => {
                sel.append(`<option value="${c.idCompany}">${c.companyName}</option>`);
            });
            // Critical for Bootstrap-Select with live search
            sel.selectpicker('destroy').selectpicker();
        }
    } catch (err) {
        console.error("Company Load Error:", err);
    }
}

async function saveAll() {
    const btn = event.currentTarget;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
    btn.disabled = true;

    // --- SAFETY HELPERS ---
    const getVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return "";
        return el.value === null || el.value === undefined ? "" : el.value;
    };
    const getNum = (id, def = 0) => {
        const el = document.getElementById(id);
        if (!el) return def;
        const v = parseInt(el.value);
        return isNaN(v) ? def : v;
    };
    const getChk = (id) => {
        const el = document.getElementById(id);
        return el ? el.checked : false;
    };

    // --- 1. COLLECT TABLE DATA ---
    const devices = [];
    $("#tblDeviceBody tr").each(function () {
        devices.push({
            DeviceName: $(this).find(".dev-name").val() || "",
            SerialNumber: $(this).find(".dev-serial").val() || "",
            ModelType: $(this).find(".dev-model").val() || "",
            IDLocation: parseInt($(this).find(".dev-loc-id").val()) || 0,
            Status: "Online"
        });
    });

    const mappings = [];
    $("#tblMappingBody tr").each(function () {
        mappings.push({
            IDLocation: parseInt($(this).find(".m-loc-id").val()) || 0,
            MappedDeviceSerials: $(this).find(".m-serials").val() || "",
            IDEmployee: parseInt($(this).find(".m-emp-id").val()) || 0
        });
    });

    // --- 2. BUILD COMPLETE MODEL ---
    const model = {
        // IDs
        IDPayrollApiConfigration: getNum("IDPayrollApiConfigration", 0),
        IDCompany: getNum("IDCompany", 1),
        IDBiometricDevice: getNum("IDBiometricDevice", 0),
        IDLocationDeviceMaping: getNum("IDLocationDeviceMaping", 0),

        // Connection
        BaseUrl: getVal("BaseUrl"),
        AccountName: getVal("AccountName"),
        ApiKey: getVal("ApiKey"),
        PullApiEndPoint: getVal("PullApiEndPoint"),
        RequestTimeout: getNum("RequestTimeout", 30),
        RetryAttemptOfFailer: getNum("RetryAttemptOfFailer", 3),
        RetryBackOff: getNum("RetryBackOff", 5),
        UseHTTPSOnly: getChk("UseHTTPSOnly"),
        maskApiInLog: getChk("maskApiInLog"),
        IPWhiteListEnforcement: getChk("IPWhiteListEnforcement"),
        AutoRotateApiKeyOnEvery90Days: getChk("AutoRotateApiKeyOnEvery90Days"),

        // Pull Config
        PullFrequency: getVal("PullFrequency") || "15",
        DateRangeWindow: getVal("DateRangeWindow") || "2",
        ActiveHours: getVal("ActiveHours") || "24",
        UserIDPull: getChk("UserIDPull"),
        LogDate: getChk("LogDate"),
        SerialNumberPull: getChk("SerialNumberPull"),
        DeviceNamePull: getChk("DeviceNamePull"),

        // Mappings
        UseridPayroll: getVal("UseridPayroll"),
        UseridTransform: getVal("UseridTransform"),
        LogDatePayroll: getVal("LogDatePayroll"),
        LogdateTransform: getVal("LogdateTransform"),
        SerialNumberPayroll: getVal("SerialNumberPayroll"),
        SerialNumberTransform: getVal("SerialNumberTransform"),
        DeviceSNamesPayroll: getVal("DeviceSNamesPayroll"),
        deviceSNamesTransform: getVal("deviceSNamesTransform"),

        // Punch Rules
        OnDuplicatePunch: getVal("OnDuplicatePunch") || "Ignore",
        UnknownEmployeeCode: getVal("UnknownEmployeeCode") || "LogError",
        RejectFuturePunch: getChk("RejectFuturePunch"),
        RejectOldPunch: getChk("RejectOldPunch"),
        EmailOnFailure: getChk("EmailOnFailure"),

        // Hardware
        DefaultVerifyMode: getVal("DefaultVerifyMode") || "Any",
        FaceCardDual: getVal("FaceCardDual") || "Disabled",
        UploadFaceTemplates: getVal("UploadFaceTemplates") || "False",
        UploadFingerprints: getVal("UploadFingerprints") || "False",
        UploadCards: getVal("UploadCards") || "False",
        AutoClearLogsAfterSync: getVal("AutoClearLogsAfterSync") || "None",
        OnlineEnrollment: getVal("OnlineEnrollment") || "Disabled",
        BlockUserSupport: getVal("BlockUserSupport") || "None",

        // Automation
        AutoPushOnEmployeeAdd: getVal("AutoPushOnEmployeeAdd") || "Yes",
        AutoDeleteOnEmployeeResign: getVal("AutoDeleteOnEmployeeResign") || "Yes",
        PushOnDepartmentChange: getVal("PushOnDepartmentChange") || "No",
        IsPushPhotoEnabled: getChk("IsPushPhotoEnabled"),
        IsExpirySetOnResign: getChk("IsExpirySetOnResign"),
        IsPushLocationRestricted: getChk("IsPushLocationRestricted"),
        IsBlockOnSuspend: getChk("IsBlockOnSuspend"),

        // Performance
        MaxQueueSizePerDevice: getNum("MaxQueueSizePerDevice", 500),
        StaleCommandTTLHours: getNum("StaleCommandTTLHours", 24),
        ConcurrentCommandsPerDevice: getNum("ConcurrentCommandsPerDevice", 3),

        // JSON Tables
        DeviceJson: JSON.stringify(devices),
        MappingJson: JSON.stringify(mappings),

        IsActive: true,
        username: getUserName()
    };

    try {
        const res = await apiFetch(`${API_CONFIG}/save`, {
            method: 'POST',
            body: JSON.stringify(model)
        });

        const json = await res.json();
        if (json.success) {
            showToast("success", "Saved successfully!");
            await loadExistingConfig(); // Refresh IDs
        } else {
            showToast("error", json.message || "Save failed");
        }
    } catch (err) {
        showToast("error", "Network error occurred.");
    } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
    }
}

/**
 * Part 4: UI Interaction & API Tester Logic
 */

// Toggle Password Visibility (API Key)
function togglePass(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.type = el.type === 'password' ? 'text' : 'password';
    const btn = event.currentTarget;
    btn.innerText = el.type === 'password' ? 'Show' : 'Hide';
}

// Copy value to clipboard
function copyVal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.select();
    document.execCommand("copy");
    showToast("info", "Value copied to clipboard");
}

// Generate and copy the full API URL for debugging in Postman/Browser
function copyFullUrl() {
    const base = $('#BaseUrl').val();
    const end = $('#PullApiEndPoint').val();
    const acc = $('#AccountName').val();
    const key = $('#ApiKey').val();

    if (!base || !end) {
        showToast("warning", "Base URL and Endpoint are required to generate URL");
        return;
    }

    const fullUrl = `${base}${end}?AccountName=${acc}&APIKey=${key}&FromDate=2026-05-01&ToDate=2026-05-02`;

    const dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.value = fullUrl;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);

    showToast("success", "Full Debug URL copied!");
}

// Real-time Connection Test
async function testConnection() {
    const btn = event.currentTarget;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Testing...';
    btn.disabled = true;

    // Collect just the connection fields
    const testData = {
        BaseUrl: $('#BaseUrl').val(),
        AccountName: $('#AccountName').val(),
        ApiKey: $('#ApiKey').val(),
        PullApiEndPoint: $('#PullApiEndPoint').val()
    };

    try {
        // This calls a dedicated test action in your controller
        const res = await apiFetch(`${API_CONFIG}/TestApiConnection`, {
            method: 'POST',
            body: JSON.stringify(testData)
        });
        const json = await res.json();

        if (json.isSuccess) {
            showToast("success", "API Connection Successful!");
            $('.text-success:contains("200 OK")').parent().html('Last test: <span class="text-success">200 OK</span> · ' + (json.latency || '240') + 'ms');
        } else {
            showToast("error", json.message || "Connection Failed");
        }
    } catch (err) {
        showToast("error", "Could not reach the API Gateway.");
    } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
    }
}

// Update Tester Preview when typing
$(document).on('input', '#BaseUrl, #PullApiEndPoint', function () {
    const base = $('#BaseUrl').val();
    const end = $('#PullApiEndPoint').val();
    $('#req-pre').text(`GET ${base}${end}`);
});



/**
* Part 5: Dynamic Tables & Mapping Logic
*/

// --- 1. BIOMETRIC DEVICES TABLE ---
function addDeviceRow(data = {}) {
    const tbody = document.getElementById("tblDeviceBody");
    if (!tbody) return;

    const rowIdx = tbody.rows.length + 1;
    const row = document.createElement("tr");

    // FIX: Show ALL locations instead of filtering, so they always appear
    let locOptions = `<option value="">-- Select Location --</option>`;
    allLocations.forEach(l => {
        const id = l.idLocation || l.IDLocation;
        const name = l.locationName || l.LocationName;
        const company = l.companyName || l.CompanyName || "";
        const isSelected = (id == data.idLocation) ? 'selected' : '';
        locOptions += `<option value="${id}" ${isSelected}>${name} (${company})</option>`;
    });

    row.innerHTML = `
        <td class="text-center fw-bold text-muted small">${rowIdx}</td>
        <td><input type="text" class="form-control  dev-name shadow-none" value="${data.deviceName || ''}" placeholder="e.g. Main Gate"></td>
        <td><input type="text" class="form-control  font-monospace dev-serial shadow-none" value="${data.serialNumber || ''}" placeholder="SN123456"></td>
        <td>
            <select class="form-control dev-model-select shadow-none" data-live-search="true" data-style="btn-light border" data-container="body" data-width="100%">
                <option value="SpeedFace" ${data.modelType === 'SpeedFace' ? 'selected' : ''}>SpeedFace V5L</option>
                <option value="K40" ${data.modelType === 'K40' ? 'selected' : ''}>K40 / G3</option>
                <option value="F22" ${data.modelType === 'F22' ? 'selected' : ''}>F22 / SilkID</option>
            </select>
        </td>
        <td>
            <select class="form-control dev-loc-select shadow-none" data-live-search="true" data-style="btn-light border" data-container="body" data-width="100%">
                ${locOptions}
            </select>
        </td>
        <td class="text-center"><span class="badge bg-light text-muted rounded-pill">${data.status || 'Offline'}</span></td>
        <td class="text-center">
            <button type="button" class="btn btn-link text-danger p-0" onclick="$(this).closest('tr').remove(); updateDeviceCount();">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(row);

    // Manual initialization to prevent DOUBLE dropdowns
    $(row).find('.dev-model-select, .dev-loc-select').addClass('selectpicker').selectpicker();

    updateDeviceCount();
}

function updateDeviceCount() {
    const el = document.getElementById("dev-count-text");
    if (el) el.innerText = document.getElementById("tblDeviceBody").rows.length;
}



async function updateLocationEmployeeCount(selectElement) {
    const locationId = $(selectElement).val();
    const row = $(selectElement).closest('tr');

    // This is the input box where we will show the number (50, 20, 250)
    const empInput = row.find('.m-emp');

    if (!locationId || locationId == "0" || locationId == "") {
        empInput.val('0');
        return;
    }

    try {
        // Fetch employees for this location
        const res = await apiFetch(`/api/master/employee/get-all?locId=${locationId}`);
        const json = await res.json();

        if (json.success || json.isSuccess) {
            const count = json.data ? json.data.length : 0;

            // SET THE NUMBER DIRECTLY IN THE INPUT BOX
            empInput.val(count);
        }
    } catch (err) {
        console.error("Error fetching employee count:", err);
        empInput.val('Error');
    }
}

function addMappingRow(data = {}) {
    const tbody = document.getElementById("tblMappingBody");
    if (!tbody) return;

    const row = document.createElement("tr");

    let locOptions = `<option value="">-- Select Location --</option>`;
    allLocations.forEach(l => {
        const id = l.idLocation || l.IDLocation;
        const name = l.locationName || l.LocationName;
        const company = l.companyName || l.CompanyName || "";
        const isSelected = (id == (data.idLocation || data.IDLocation)) ? 'selected' : '';
        locOptions += `<option value="${id}" ${isSelected}>${name} (${company})</option>`;
    });

    row.innerHTML = `
        <td>
            <select class="form-control selectpicker shadow-none m-loc-id" 
                    data-live-search="true" 
                    data-style="btn-light border" 
                    data-container="body" 
                    data-width="100%"
                    onchange="updateLocationEmployeeCount(this)">
                ${locOptions}
            </select>
        </td>
        <td>
            <input type="text" class="form-control shadow-none m-serials" value="${data.mappedDeviceSerials || ''}" placeholder="SN1, SN2...">
        </td>
        <td>
            <!-- THIS BOX WILL SHOW THE NUMBER (e.g. 250) -->
            <input type="text" class="form-control shadow-none m-emp text-center fw-bold text-primary" 
                   value="0" readonly style="background-color: #f8f9fa;">
        </td>
        <td class="text-center">
            <button type="button" class="btn btn-link text-danger p-0" onclick="$(this).closest('tr').remove()">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(row);
    $(row).find('.selectpicker').selectpicker('render');

    if (data.idLocation || data.IDLocation) {
        updateLocationEmployeeCount($(row).find('.m-loc-id'));
    }
}


// --- 3. BATCH MAINTENANCE COMMANDS ---

async function executeBatchCommand(cmdType) {
    const btn = event.currentTarget;
    const originalHtml = btn.innerHTML;

    // Confirm dangerous actions
    if (cmdType === 'ClearLogs' || cmdType === 'Reboot') {
        if (!confirm(`Are you sure you want to ${cmdType} on ALL devices?`)) return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Queuing...';
    btn.disabled = true;

    try {
        const res = await apiFetch(`${API_CONFIG}/ExecuteCommand?type=${cmdType}`, { method: 'POST' });
        const json = await res.json();

        if (json.success) {
            showToast("success", `Command [${cmdType}] sent to all online devices.`);
        } else {
            showToast("error", json.message || "Device communication error.");
        }
    } catch (err) {
        showToast("error", "Failed to communicate with device gateway.");
    } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
    }
}
/**
 * Part 6: Endpoint Testing & Tab Navigation
 */

/**
 * Triggered from the "Endpoints" tab list.
 * Pre-fills the Tester tab and switches focus to it.
 */
function testEndpoint(pathName) {
    // 1. Identify the matching internal code for the dropdown
    const pathMap = {
        'AddBiometric': 'upload',
        'GetDeviceCommands': 'commands',
        'PullAPI': 'pull',
        'UploadUser': 'upload',
        'FetchLiveUsers': 'fetchusers'
    };

    const targetType = pathMap[pathName] || 'pull';

    // 2. Set the dropdown in the Tester Tab
    const testerSelect = document.getElementById("t-endpoint");
    if (testerSelect) {
        testerSelect.value = targetType;
        // Trigger the preview update logic
        if (typeof updateTesterPreview === 'function') updateTesterPreview();
    }

    // 3. Switch Tab to "API Tester" (Tab 6)
    const testerTabTrigger = document.querySelector('[data-bs-target="#tab-tester"]');
    if (testerTabTrigger) {
        const tabInstance = bootstrap.Tab.getOrCreateInstance(testerTabTrigger);
        tabInstance.show();
    }

    showToast("info", `Switched to tester for: ${pathName}`);
}

/**
 * Formats JSON nicely for the terminal output in the Tester
 */
function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'text-info'; // number
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'text-primary'; // key
            } else {
                cls = 'text-success'; // string
            }
        } else if (/true|false/.test(match)) {
            cls = 'text-warning'; // boolean
        } else if (/null/.test(match)) {
            cls = 'text-secondary'; // null
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

/**
 * Simulates a live API test run
 */
async function runApiTest() {
    const logArea = document.getElementById("t-log");
    const statusLabel = document.getElementById("t-status");
    const responsePre = document.getElementById("res-pre");

    if (!logArea) return;

    // Reset UI
    logArea.innerHTML = `<div>[${new Date().toLocaleTimeString()}] Initializing request...</div>`;
    statusLabel.innerText = "WAITING";
    statusLabel.className = "h5 mb-0 text-warning fw-bold";
    responsePre.innerText = "{}";

    // Simulate Network Delay
    setTimeout(() => {
        logArea.innerHTML += `<div class="text-info">> Resolving host: sohcm.com...</div>`;
        logArea.innerHTML += `<div class="text-info">> Handshaking with TLS 1.3...</div>`;
    }, 500);

    setTimeout(() => {
        logArea.innerHTML += `<div class="text-success ms-2">> Connection Established.</div>`;
        logArea.innerHTML += `<div class="text-success ms-2">> API Key Validated (Active).</div>`;

        statusLabel.innerText = "200 OK";
        statusLabel.className = "h5 mb-0 text-success fw-bold";

        const mockResponse = {
            status: "success",
            timestamp: new Date().toISOString(),
            data: {
                total_logs: 142,
                device_status: "Online",
                last_serial: "SN992837"
            }
        };

        responsePre.innerHTML = syntaxHighlight(mockResponse);
        logArea.innerHTML += `<div class="text-muted ms-2">> Transaction Complete.</div>`;
    }, 1500);
}
