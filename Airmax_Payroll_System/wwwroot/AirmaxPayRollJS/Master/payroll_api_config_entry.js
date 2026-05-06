/** 
 * Payroll API Configuration Entry JS - Final Robust Version
 * Handles Hybrid Model (String JSON and Object Lists)
 */

const API_CONFIG = "/api/master/payroll-api-config";
let allLocations = [];
let deviceRowCounter = 0;
let mappingRowCounter = 0;

const DOM = {
    id: () => document.getElementById("IDPayrollApiConfigration"),
    company: () => document.getElementById("IDCompany"),
    baseUrl: () => document.getElementById("BaseUrl"),
    accountName: () => document.getElementById("AccountName"),
    apiKey: () => document.getElementById("ApiKey"),
    pullEndPoint: () => document.getElementById("PullApiEndPoint"),
    timeout: () => document.getElementById("RequestTimeout"),
    retryAttempts: () => document.getElementById("RetryAttemptOfFailer"),
    retryBackoff: () => document.getElementById("RetryBackOff"),
    useHttps: () => document.getElementById("UseHTTPSOnly"),
    maskLogs: () => document.getElementById("maskApiInLog"),
    ipWhiteList: () => document.getElementById("IPWhiteListEnforcement"),
    autoRotateKey: () => document.getElementById("AutoRotateApiKeyOnEvery90Days"),
    userIdPayroll: () => document.getElementById("UseridPayroll"),
    userIdTransform: () => document.getElementById("UseridTransform"),
    logDatePayroll: () => document.getElementById("LogDatePayroll"),
    logDateTransform: () => document.getElementById("LogdateTransform"),
    serialPayroll: () => document.getElementById("SerialNumberPayroll"),
    serialTransform: () => document.getElementById("SerialNumberTransform"),
    deviceNamesPayroll: () => document.getElementById("DeviceSNamesPayroll"),
    deviceNamesTransform: () => document.getElementById("deviceSNamesTransform"),
    userIdPull: () => document.getElementById("UserIDPull"),
    logDatePull: () => document.getElementById("LogDate"),
    serialNumberPull: () => document.getElementById("SerialNumberPull"),
    deviceNamePull: () => document.getElementById("DeviceNamePull"),
    pullFrequency: () => document.getElementById("PullFrequency"),
    dateWindow: () => document.getElementById("DateRangeWindow"),
    activeHours: () => document.getElementById("ActiveHours"),
    onDuplicate: () => document.getElementById("OnDuplicatePunch"),
    unknownEmp: () => document.getElementById("UnknownEmployeeCode"),
    rejectFuture: () => document.getElementById("RejectFuturePunch"),
    rejectOld: () => document.getElementById("RejectOldPunch"),
    emailOnFail: () => document.getElementById("EmailOnFailure"),
    verifyMode: () => document.getElementById("DefaultVerifyMode"),
    faceCardDual: () => document.getElementById("FaceCardDual"),
    upFace: () => document.getElementById("UploadFaceTemplates"),
    upFinger: () => document.getElementById("UploadFingerprints"),
    upCards: () => document.getElementById("UploadCards"),
    autoClearLogs: () => document.getElementById("AutoClearLogsAfterSync"),
    onlineEnrollment: () => document.getElementById("OnlineEnrollment"),
    blockSupport: () => document.getElementById("BlockUserSupport"),
    autoPushEmp: () => document.getElementById("AutoPushOnEmployeeAdd"),
    autoDelResign: () => document.getElementById("AutoDeleteOnEmployeeResign"),
    pushDeptChange: () => document.getElementById("PushOnDepartmentChange"),
    pushPhoto: () => document.getElementById("IsPushPhotoEnabled"),
    expiryOnResign: () => document.getElementById("IsExpirySetOnResign"),
    pushLocRestrict: () => document.getElementById("IsPushLocationRestricted"),
    blockOnSuspend: () => document.getElementById("IsBlockOnSuspend"),
    maxQueue: () => document.getElementById("MaxQueueSizePerDevice"),
    staleTTL: () => document.getElementById("StaleCommandTTLHours"),
    concurrentCmd: () => document.getElementById("ConcurrentCommandsPerDevice"),
    tblDevice: () => document.getElementById("tblDeviceBody"),
    tblMapping: () => document.getElementById("tblMappingBody"),
    btnSave: () => document.getElementById("btnSaveAll") || document.getElementById("btnSave")
};

const getProp = (obj, prop) => {
    if (!obj) return null;
    // Case-insensitive property lookup
    const key = Object.keys(obj).find(k => k.toLowerCase() === prop.toLowerCase());
    return key ? obj[key] : null;
};



// ======================================================
// INITIALIZATION
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {
    await loadCompanyDropdown();
    allLocations = []; // Start with empty locations until a company is selected here — locations are company-specific.
    // They will only be fetched after a company is selected.

    $(DOM.company()).on('change', async function () {
        const selectedId = $(this).val();

        // 1. If no company is selected, just clear the form
        if (!selectedId || selectedId === "0") {
            allLocations = [];
            clearForm();
            return;
        }

        try {
            // 2. Check if a configuration already exists for this company
            const checkRes = await apiFetch(`${API_CONFIG}/get-all`);
            const checkJson = await checkRes.json();

            // Find the record matching the selected company ID
            const existing = checkJson.data ? checkJson.data.find(x =>
                parseInt(x.IDCompany || x.idCompany) === parseInt(selectedId)
            ) : null;

            if (existing) {
                const result = await Swal.fire({
                    title: 'Existing Setup Found!',
                    text: "A configuration for this company already exists. Would you like to Edit it?",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Yes, Edit Existing',
                    cancelButtonText: 'No, Cancel Selection', // Changed text for clarity
                    reverseButtons: true
                });

                if (result.isConfirmed) {
                    // ✅ 1. EDIT MODE: Load the full details
                    const configId = existing.IDPayrollApiConfigration || existing.idPayrollApiConfigration;

                    showToast("info", "Fetching full configuration details...");
                    const detailRes = await apiFetch(`${API_CONFIG}/get-by-id/${configId}`);
                    const detailJson = await detailRes.json();

                    if (detailJson.success && detailJson.data) {
                        await fetchLocations(selectedId);
                        fillForm(detailJson.data);
                        showToast("success", "Edit mode activated.");
                    } else {
                        showToast("danger", "Failed to load detailed configuration.");
                    }
                    return; // Stop here!
                }
                else {
                    // ❌ 2. CANCEL/NO: Reset the selection to prevent accidental save
                    $(DOM.company()).val('0').selectpicker('refresh'); // Reset dropdown to blank
                    clearForm();
                    allLocations = [];
                    showToast("warning", "Selection cancelled. Use Edit mode to change existing setups.");
                    return; // Stop here!
                }
            }

        } catch (err) {
            console.error("Error during company change:", err);
            showToast("danger", "An error occurred while checking existing configurations.");
        }

        // 5. Default behavior for brand new company (No existing config)
        clearForm();
        await fetchLocations(selectedId);
    });



    const startId = $(DOM.company()).val();
    if (startId && startId !== "0") {
        await fetchLocations(startId);
        await loadExistingConfig(startId);
    }
});

// ======================================================
// DATA COLLECTION (getDto)
// ======================================================
function getDto() {
    const n = (el) => parseInt(el()?.value) || 0;
    const c = (el) => el()?.checked || false;
    const v = (el) => el()?.value || "";

    return {
        IDPayrollApiConfigration: n(DOM.id),
        IDCompany: n(DOM.company),
        BaseUrl: v(DOM.baseUrl),
        AccountName: v(DOM.accountName),
        ApiKey: v(DOM.apiKey),
        PullApiEndPoint: v(DOM.pullEndPoint),
        RequestTimeout: n(DOM.timeout) || 30,
        RetryAttemptOfFailer: n(DOM.retryAttempts) || 3,
        RetryBackOff: n(DOM.retryBackoff) || 5,
        UseHTTPSOnly: c(DOM.useHttps),
        maskApiInLog: c(DOM.maskLogs),
        IPWhiteListEnforcement: c(DOM.ipWhiteList),
        AutoRotateApiKeyOnEvery90Days: c(DOM.autoRotateKey),
        UseridPayroll: v(DOM.userIdPayroll),
        UseridTransform: v(DOM.userIdTransform),
        LogDatePayroll: v(DOM.logDatePayroll),
        LogdateTransform: v(DOM.logDateTransform),
        SerialNumberPayroll: v(DOM.serialPayroll),
        SerialNumberTransform: v(DOM.serialTransform),
        DeviceSNamesPayroll: v(DOM.deviceNamesPayroll),
        deviceSNamesTransform: v(DOM.deviceNamesTransform),
        UserIDPull: c(DOM.userIdPull),
        LogDate: c(DOM.logDatePull),
        SerialNumberPull: c(DOM.serialNumberPull),
        DeviceNamePull: c(DOM.deviceNamePull),
        PullFrequency: v(DOM.pullFrequency),
        DateRangeWindow: v(DOM.dateWindow),
        ActiveHours: v(DOM.activeHours),
        OnDuplicatePunch: v(DOM.onDuplicate),
        UnknownEmployeeCode: v(DOM.unknownEmp),
        RejectFuturePunch: c(DOM.rejectFuture),
        RejectOldPunch: c(DOM.rejectOld),
        EmailOnFailure: c(DOM.emailOnFail),
        DefaultVerifyMode: v(DOM.verifyMode),
        FaceCardDual: v(DOM.faceCardDual),
        UploadFaceTemplates: v(DOM.upFace),
        UploadFingerprints: v(DOM.upFinger),
        UploadCards: v(DOM.upCards),
        AutoClearLogsAfterSync: v(DOM.autoClearLogs),
        OnlineEnrollment: v(DOM.onlineEnrollment),
        BlockUserSupport: v(DOM.blockSupport),
        AutoPushOnEmployeeAdd: v(DOM.autoPushEmp),
        AutoDeleteOnEmployeeResign: v(DOM.autoDelResign),
        PushOnDepartmentChange: v(DOM.pushDeptChange),
        IsPushPhotoEnabled: c(DOM.pushPhoto),
        IsExpirySetOnResign: c(DOM.expiryOnResign),
        IsPushLocationRestricted: c(DOM.pushLocRestrict),
        IsBlockOnSuspend: c(DOM.blockOnSuspend),
        MaxQueueSizePerDevice: n(DOM.maxQueue),
        StaleCommandTTLHours: n(DOM.staleTTL),
        ConcurrentCommandsPerDevice: n(DOM.concurrentCmd),

        // Collection for Biometric Devices — read by unique ID to bypass selectpicker class issues
        DeviceList: $(DOM.tblDevice()).find('tr').map((i, tr) => {
            const $tr = $(tr);
            const rowId = $tr.data('row-id');
            const rawSerial = $tr.find('.dev-serial').val();
            const serial = rawSerial ? rawSerial.trim() : '';
            if (!serial) return null; // Skip empty rows

            // Read directly from the native <select> element by its unique ID
            const locEl = document.getElementById('dev-loc-' + rowId);
            const modelEl = document.getElementById('dev-model-' + rowId);
            const locVal = locEl ? locEl.value : '0';
            const modelVal = modelEl ? modelEl.value : 'SpeedFace';

            const rawName = $tr.find('.dev-name').val();
            return {
                IDBiometricDevice: parseInt($tr.find('.dev-id').val()) || 0,
                IDPayrollApiConfigration: n(DOM.id),
                DeviceName: rawName ? rawName.trim() : '',
                SerialNumber: serial,
                ModelType: modelVal,
                IDLocation: parseInt(locVal) || 0,
                Status: 'Online'
            };
        }).get().filter(function(x) { return x !== null; }),

        // Collection for Location Mapping — read by unique ID
        MappingList: $('#tblMappingBody tr').map((i, tr) => {
            const $tr = $(tr);
            const rowId = $tr.data('row-id');
            const locEl = document.getElementById('map-loc-' + rowId);
            const rawSerials = $tr.find('.save-serials').val();
            const serials = rawSerials ? rawSerials.trim() : '';

            const locVal = locEl ? locEl.value : '0';
            if (!locVal || locVal === '0') return null;

            return {
                IDLocationDeviceMaping: parseInt($tr.find('.map-id').val()) || 0,
                IDPayrollApiConfigration: n(DOM.id),
                IDLocation: parseInt(locVal) || 0,
                MappedDeviceSerials: serials || '',
                TotalEmployee: $tr.find('.save-count').val() || '0' 
            };
        }).get().filter(function(x) { return x !== null; })
    };
}

// Validation Helper - More Descriptive
function validateDto(dto) {
    if (dto.IDCompany === 0) return "Please select a Company first!";
    
    if (dto.DeviceList.length === 0 && dto.MappingList.length === 0) {
        // Optional: Allow saving empty config if that's desired, 
        // but usually at least one device or mapping is expected if the user is interacting with tables.
    }

    for (let [index, dev] of dto.DeviceList.entries()) {
        const rowNum = index + 1;
        if (!dev.DeviceName) return `Device Name is missing in Device Row #${rowNum}`;
        if (!dev.SerialNumber) return `Serial Number is missing in Device Row #${rowNum}`;
        if (dev.IDLocation === 0) return `Please select a Location for Device: ${dev.SerialNumber || ('Row ' + rowNum)}`;
    }
    
    for (let [index, map] of dto.MappingList.entries()) {
        const rowNum = index + 1;
        if (map.IDLocation === 0) return `Please select a Location in Mapping Row #${rowNum}`;
        if (!map.MappedDeviceSerials) return `Please enter Mapped Device Serials in Mapping Row #${rowNum}`;
    }
    
    return null;
}

// ======================================================
// LOADING LOGIC
// ======================================================
async function loadExistingConfig(companyId) {
    try {
        const targetId = parseInt(companyId);
        const res = await apiFetch(`${API_CONFIG}/get-all`);
        const json = await res.json();
        const d = json.data ? json.data.find(x => parseInt(x.IDCompany || x.idCompany) === targetId) : null;

        if (d) {
            DOM.id().value = getProp(d, 'IDPayrollApiConfigration') || 0;
            $(DOM.baseUrl()).val(getProp(d, 'BaseUrl') || "");
            $(DOM.accountName()).val(getProp(d, 'AccountName') || "");
            $(DOM.apiKey()).val(getProp(d, 'ApiKey') || "");
            $(DOM.pullEndPoint()).val(getProp(d, 'PullApiEndPoint') || "");
            $(DOM.timeout()).val(getProp(d, 'RequestTimeout') || 30);
            $(DOM.retryAttempts()).val(getProp(d, 'RetryAttemptOfFailer') || 3);
            $(DOM.retryBackoff()).val(getProp(d, 'RetryBackOff') || 5);

            DOM.useHttps().checked = getProp(d, 'UseHTTPSOnly') === true;
            DOM.maskLogs().checked = getProp(d, 'maskApiInLog') === true;
            DOM.ipWhiteList().checked = getProp(d, 'IPWhiteListEnforcement') === true;
            DOM.autoRotateKey().checked = getProp(d, 'AutoRotateApiKeyOnEvery90Days') === true;

            $(DOM.userIdPayroll()).val(getProp(d, 'UseridPayroll') || "").selectpicker('refresh');
            $(DOM.userIdTransform()).val(getProp(d, 'UseridTransform') || "").selectpicker('refresh');
            $(DOM.logDatePayroll()).val(getProp(d, 'LogDatePayroll') || "").selectpicker('refresh');
            $(DOM.logDateTransform()).val(getProp(d, 'LogdateTransform') || "").selectpicker('refresh');
            $(DOM.serialPayroll()).val(getProp(d, 'SerialNumberPayroll') || "").selectpicker('refresh');
            $(DOM.serialTransform()).val(getProp(d, 'SerialNumberTransform') || "").selectpicker('refresh');
            $(DOM.deviceNamesPayroll()).val(getProp(d, 'DeviceSNamesPayroll') || "").selectpicker('refresh');
            $(DOM.deviceNamesTransform()).val(getProp(d, 'deviceSNamesTransform') || "").selectpicker('refresh');

            DOM.userIdPull().checked = getProp(d, 'UserIDPull') === true;
            DOM.logDatePull().checked = getProp(d, 'LogDate') === true;
            DOM.serialNumberPull().checked = getProp(d, 'SerialNumberPull') === true;
            DOM.deviceNamePull().checked = getProp(d, 'DeviceNamePull') === true;

            $(DOM.pullFrequency()).val(getProp(d, 'PullFrequency') || "").selectpicker('refresh');
            $(DOM.dateWindow()).val(getProp(d, 'DateRangeWindow') || "").selectpicker('refresh');
            $(DOM.activeHours()).val(getProp(d, 'ActiveHours') || "").selectpicker('refresh');
            $(DOM.onDuplicate()).val(getProp(d, 'OnDuplicatePunch') || "").selectpicker('refresh');
            $(DOM.unknownEmp()).val(getProp(d, 'UnknownEmployeeCode') || "").selectpicker('refresh');

            DOM.rejectFuture().checked = getProp(d, 'RejectFuturePunch') === true;
            DOM.rejectOld().checked = getProp(d, 'RejectOldPunch') === true;
            DOM.emailOnFail().checked = getProp(d, 'EmailOnFailure') === true;

            $(DOM.verifyMode()).val(getProp(d, 'DefaultVerifyMode') || "").selectpicker('refresh');
            $(DOM.faceCardDual()).val(getProp(d, 'FaceCardDual') || "").selectpicker('refresh');
            $(DOM.upFace()).val(getProp(d, 'UploadFaceTemplates') || "False").selectpicker('refresh');
            $(DOM.upFinger()).val(getProp(d, 'UploadFingerprints') || "False").selectpicker('refresh');
            $(DOM.upCards()).val(getProp(d, 'UploadCards') || "False").selectpicker('refresh');
            $(DOM.autoClearLogs()).val(getProp(d, 'AutoClearLogsAfterSync') || "None").selectpicker('refresh');
            $(DOM.onlineEnrollment()).val(getProp(d, 'OnlineEnrollment') || "Disabled").selectpicker('refresh');
            $(DOM.blockSupport()).val(getProp(d, 'BlockUserSupport') || "None").selectpicker('refresh');

            $(DOM.autoPushEmp()).val(getProp(d, 'AutoPushOnEmployeeAdd') || "Yes").selectpicker('refresh');
            $(DOM.autoDelResign()).val(getProp(d, 'AutoDeleteOnEmployeeResign') || "Yes").selectpicker('refresh');
            $(DOM.pushDeptChange()).val(getProp(d, 'PushOnDepartmentChange') || "None").selectpicker('refresh');

            DOM.pushPhoto().checked = getProp(d, 'IsPushPhotoEnabled') === true;
            DOM.expiryOnResign().checked = getProp(d, 'IsExpirySetOnResign') === true;
            DOM.pushLocRestrict().checked = getProp(d, 'IsPushLocationRestricted') === true;
            DOM.blockOnSuspend().checked = getProp(d, 'IsBlockOnSuspend') === true;

            $(DOM.maxQueue()).val(getProp(d, 'MaxQueueSizePerDevice') || 500);
            $(DOM.staleTTL()).val(getProp(d, 'StaleCommandTTLHours') || 24);
            $(DOM.concurrentCmd()).val(getProp(d, 'ConcurrentCommandsPerDevice') || 3);

            DOM.tblDevice().innerHTML = "";
            DOM.tblMapping().innerHTML = "";

            // 🔥 Robust JSON Parsing
            const parseData = (val) => {
                if (!val) return [];
                return typeof val === 'string' ? JSON.parse(val) : val;
            };

            parseData(getProp(d, 'DeviceJson')).forEach(dev => addDeviceRow(dev));
            parseData(getProp(d, 'MappingJson')).forEach(map => addMappingRow(map));

            showToast("info", "Configuration Loaded.");
        } else {
            clearForm();
        }
    } catch (err) { console.error("Load Failed:", err); }
}


function fillForm(d) {
    if (!d) return;

    // 1. Primary Keys & Company
    DOM.id().value = getProp(d, 'IDPayrollApiConfigration') || 0;
    $(DOM.company()).val(getProp(d, 'IDCompany')).selectpicker('refresh');

    // 2. Connection & Auth
    $(DOM.baseUrl()).val(getProp(d, 'BaseUrl') || "");
    $(DOM.accountName()).val(getProp(d, 'AccountName') || "");
    $(DOM.apiKey()).val(getProp(d, 'ApiKey') || "");
    $(DOM.pullEndPoint()).val(getProp(d, 'PullApiEndPoint') || "");
    $(DOM.timeout()).val(getProp(d, 'RequestTimeout') || 30);
    $(DOM.retryAttempts()).val(getProp(d, 'RetryAttemptOfFailer') || 3); // Fixed
    $(DOM.retryBackoff()).val(getProp(d, 'RetryBackOff') || 5);

    // 3. Checkboxes
    DOM.useHttps().checked = getProp(d, 'UseHTTPSOnly') === true;
    DOM.maskLogs().checked = getProp(d, 'maskApiInLog') === true;
    DOM.ipWhiteList().checked = getProp(d, 'IPWhiteListEnforcement') === true; // Fixed
    DOM.autoRotateKey().checked = getProp(d, 'AutoRotateApiKeyOnEvery90Days') === true; // Fixed

    // 4. Timing & Toggles
    $(DOM.pullFrequency()).val(getProp(d, 'PullFrequency') || "5"); // Fixed
    $(DOM.dateWindow()).val(getProp(d, 'DateRangeWindow') || "1");
    $(DOM.activeHours()).val(getProp(d, 'ActiveHours') || "24");

    DOM.userIdPull().checked = getProp(d, 'UserIDPull') === true; // Fixed
    DOM.logDatePull().checked = getProp(d, 'LogDate') === true;
    DOM.serialNumberPull().checked = getProp(d, 'SerialNumberPull') === true; // Fixed
    DOM.deviceNamePull().checked = getProp(d, 'DeviceNamePull') === true; // Fixed

    // 5. Mapping Fields
    $(DOM.userIdPayroll()).val(getProp(d, 'UseridPayroll') || ""); // Fixed
    $(DOM.userIdTransform()).val(getProp(d, 'UseridTransform') || "Ignore");
    $(DOM.logDatePayroll()).val(getProp(d, 'LogDatePayroll') || ""); // Fixed
    $(DOM.logDateTransform()).val(getProp(d, 'LogdateTransform') || "Ignore");
    $(DOM.serialPayroll()).val(getProp(d, 'SerialNumberPayroll') || ""); // Fixed
    $(DOM.serialTransform()).val(getProp(d, 'SerialNumberTransform') || "Ignore");
    $(DOM.deviceNamesPayroll()).val(getProp(d, 'DeviceSNamesPayroll') || ""); // Fixed
    $(DOM.deviceNamesTransform()).val(getProp(d, 'deviceSNamesTransform') || "Ignore");

    // 6. Rules & Logic
    $(DOM.onDuplicate()).val(getProp(d, 'OnDuplicatePunch') || "Ignore");
    $(DOM.unknownEmp()).val(getProp(d, 'UnknownEmployeeCode') || "Create"); // Fixed
    DOM.rejectFuture().checked = getProp(d, 'RejectFuturePunch') === true;
    DOM.rejectOld().checked = getProp(d, 'RejectOldPunch') === true;
    DOM.emailOnFail().checked = getProp(d, 'EmailOnFailure') === true;

    // 7. Device Settings (Selectpickers)
    $(DOM.verifyMode()).val(getProp(d, 'DefaultVerifyMode') || "Card").selectpicker('refresh');
    $(DOM.faceCardDual()).val(getProp(d, 'FaceCardDual') || "No").selectpicker('refresh');
    $(DOM.upFace()).val(getProp(d, 'UploadFaceTemplates') || "No").selectpicker('refresh');
    $(DOM.upFinger()).val(getProp(d, 'UploadFingerprints') || "No").selectpicker('refresh');
    $(DOM.upCards()).val(getProp(d, 'UploadCards') || "No").selectpicker('refresh');

    // 8. Sync & Automation
    $(DOM.autoClearLogs()).val(getProp(d, 'AutoClearLogsAfterSync') || "No").selectpicker('refresh');
    $(DOM.onlineEnrollment()).val(getProp(d, 'OnlineEnrollment') || "No").selectpicker('refresh');
    $(DOM.blockSupport()).val(getProp(d, 'BlockUserSupport') || "No").selectpicker('refresh');
    $(DOM.autoPushEmp()).val(getProp(d, 'AutoPushOnEmployeeAdd') || "No").selectpicker('refresh');
    $(DOM.autoDelResign()).val(getProp(d, 'AutoDeleteOnEmployeeResign') || "No").selectpicker('refresh');
    $(DOM.pushDeptChange()).val(getProp(d, 'PushOnDepartmentChange') || "No").selectpicker('refresh');

    DOM.pushPhoto().checked = getProp(d, 'IsPushPhotoEnabled') === true;
    DOM.expiryOnResign().checked = getProp(d, 'IsExpirySetOnResign') === true;
    DOM.pushLocRestrict().checked = getProp(d, 'IsPushLocationRestricted') === true;
    DOM.blockOnSuspend().checked = getProp(d, 'IsBlockOnSuspend') === true;

    // 9. Limits
    $(DOM.maxQueue()).val(getProp(d, 'MaxQueueSizePerDevice') || 500);
    $(DOM.staleTTL()).val(getProp(d, 'StaleCommandTTLHours') || 24);
    $(DOM.concurrentCmd()).val(getProp(d, 'ConcurrentCommandsPerDevice') || 3);

    // 10. Tables (JSON parsing)
    const parseData = (val) => {
        if (!val) return [];
        return typeof val === 'string' ? JSON.parse(val) : val;
    };

    DOM.tblDevice().innerHTML = "";
    parseData(getProp(d, 'DeviceJson')).forEach(dev => addDeviceRow(dev));

    DOM.tblMapping().innerHTML = "";
    parseData(getProp(d, 'MappingJson')).forEach(map => addMappingRow(map));
}

// ======================================================
// SAVING LOGIC
// ======================================================
async function saveAll() {
    const dto = getDto();
    
    // Debugging: Log the collected data so we can see exactly what's failing
    console.log("Saving Configuration DTO:", dto);

    const error = validateDto(dto);
    if (error) {
        showToast("warning", error);
        return;
    }
    
    const btn = DOM.btnSave();
    if (btn) btn.disabled = true;
    try {
        const res = await apiFetch(`${API_CONFIG}/save`, {
            method: "POST",
            body: JSON.stringify(dto)
        });
        const json = await res.json();
        if (json.success) {
            showToast("success", "Saved Perfectly!");
            await loadExistingConfig(dto.IDCompany);
            clearForm(); 
        } else {
            showToast("danger", json.message);
        }
    } catch (err) {
        showToast("danger", "Network Error.");
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ======================================================
// HELPERS
// ======================================================
// Fetch and filter locations by the selected company
async function fetchLocations(companyId) {
    if (!companyId || companyId === "0") {
        allLocations = [];
        return;
    }
    
    try {
        const res = await apiFetch("/api/master/location/get-all");
        const json = await res.json();
        const all = json.data || [];
        
        // Strictly filter to the chosen company
        allLocations = all.filter(l => {
            const cId = getProp(l, 'IDCompany');
            return cId && parseInt(cId) === parseInt(companyId);
        });
    } catch (err) { console.error("Location Fetch Error", err); }
}


function buildLocationOptions(selectedId) {
    // If no company is selected yet, show a prompt to select company first
    const companyId = $(DOM.company()).val();
    if (!companyId || companyId === "0") {
        return `<option value="0" disabled>-- Select a Company first --</option>`;
    }

    // If company is selected but has no locations, show informative message
    if (!allLocations || allLocations.length === 0) {
        return `<option value="0" disabled>-- No locations for this company --</option>`;
    }

    let options = `<option value="0">-- Select Location --</option>`;
    allLocations.forEach(l => {
        const id = getProp(l, 'IDLocation');
        const name = getProp(l, 'LocationName');
        if (id !== null) {
            options += `<option value="${id}" ${id == selectedId ? 'selected' : ''}>${name || 'Unnamed'}</option>`;
        }
    });
    return options;
}
async function loadCompanyDropdown() {
    try {
        const res = await apiFetch("/api/master/company/get-all");
        const json = await res.json();
        const ddl = $('select#IDCompany');
        ddl.empty().append('<option value="0">-- Select Company --</option>');
        if (json.data) {
            json.data.forEach(c => {
                ddl.append(`<option value="${c.idCompany}">${c.companyName}</option>`);
            });
        }
        ddl.selectpicker('refresh');
    } catch (err) { console.error("Company Load Error", err); }
}

function addDeviceRow(data = {}) {
    const tbody = DOM.tblDevice();
    const row = document.createElement("tr");
    const rowId = ++deviceRowCounter; // Unique ID for this row
    const locId = getProp(data, 'IDLocation') || 0;
    const model = getProp(data, 'ModelType') || "SpeedFace";
    const locOptions = buildLocationOptions(locId);

    row.dataset.rowId = rowId; // Store row ID as data attribute for getDto()
    row.innerHTML = `
        <td class="text-center text-muted small">${rowId}
         <input type="hidden" class="dev-id" value="${getProp(data, 'IDBiometricDevice') || 0}">
        </td>
    
        <td><input type="text" class="form-control dev-name" value="${getProp(data, 'DeviceName') || ''}"></td>
        <td><input type="text" class="form-control dev-serial" value="${getProp(data, 'SerialNumber') || ''}"></td>
        <td>
            <select id="dev-model-${rowId}" class="form-control selectpicker" data-container="body">
                <option value="SpeedFace" ${model === 'SpeedFace' ? 'selected' : ''}>SpeedFace</option>
                <option value="K40" ${model === 'K40' ? 'selected' : ''}>K40</option>
            </select>
        </td>
        <td><select id="dev-loc-${rowId}" class="form-control selectpicker" data-live-search="true" data-container="body">${locOptions}</select></td>
        <td class="text-center"><span class="badge bg-light-success text-success">Online</span></td>
        <td class="text-center"><button type="button" class="btn btn-sm btn-danger border-0" onclick="$(this).closest('tr').remove()">X</button></td>
    `;
    tbody.appendChild(row);
    $(`#dev-loc-${rowId}, #dev-model-${rowId}`).selectpicker();

    // Use ID-based selectpicker refresh to ensure value is set correctly
    if (locId > 0) $(`#dev-loc-${rowId}`).selectpicker('val', locId.toString());
    $(`#dev-model-${rowId}`).selectpicker('val', model);
}

function addMappingRow(data = {}) {
    const tbody = DOM.tblMapping();
    const row = document.createElement("tr");
    const rowId = ++mappingRowCounter; // Unique ID for this row
    const locId = getProp(data, 'IDLocation') || 0;
    const locOptions = buildLocationOptions(locId);

    row.dataset.rowId = rowId; // Store row ID as data attribute for getDto()
    row.innerHTML = `
        <td><select id="map-loc-${rowId}" class="form-control selectpicker" onchange="updateLocationEmployeeCount(this)" data-live-search="true" data-container="body">${locOptions}</select>
         <input type="hidden" class="map-id" value="${getProp(data, 'IDLocationDeviceMaping') || 0}">
        </td>
       
        <td><input type="text" class="form-control save-serials" value="${getProp(data, 'MappedDeviceSerials') || ''}"></td>
        <td><input type="text" class="form-control save-count" value="${getProp(data, 'TotalEmployee') || 0}" readonly></td>
        <td><button type="button" class="btn btn-sm btn-danger border-0" onclick="$(this).closest('tr').remove()">X</button></td>
    `;
    tbody.appendChild(row);
    $(`#map-loc-${rowId}`).selectpicker();

    if (locId > 0) $(`#map-loc-${rowId}`).selectpicker('val', locId.toString());
}

// ✅ NEW - Uses the correct dedicated count endpoint
async function updateLocationEmployeeCount(select) {
    const locId = $(select).val();
    const input = $(select).closest('tr').find('.save-count');
    if (!locId || locId === "0") {
        input.val(0);
        return;
    }
    try {
        const res = await apiFetch(`/api/master/employee/get-count-by-location/${locId}`);
        const json = await res.json();
        input.val(json.count || 0);
    } catch (err) {
        console.error("Employee count fetch error", err);
        input.val(0);
    }
}

function clearForm() {
    DOM.id().value = 0;
    DOM.tblDevice().innerHTML = "";
    DOM.tblMapping().innerHTML = "";
    $('.selectpicker').each(function () {
        if (this.id !== 'IDCompany') $(this).val('').selectpicker('refresh');
    });
    $('input[type="text"], input[type="number"]').val('');
    $('input[type="checkbox"]').prop('checked', false);
}


function togglePass(id) {
    const el = document.getElementById(id);
    if (!el) return;

    // Toggle type
    el.type = (el.type === 'password') ? 'text' : 'password';

    // Update button text or icon if needed
    const btn = event.currentTarget;
    if (btn) {
        btn.innerText = (el.type === 'password') ? 'Show' : 'Hide';
    }
}


function copyVal(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.select();
    el.setSelectionRange(0, 99999); // For mobile devices

    try {
        document.execCommand("copy");
        showToast("info", "Value copied to clipboard");
    } catch (err) {
        showToast("danger", "Failed to copy value.");
    }
}


function copyFullUrl() {
    let base = $('#BaseUrl').val() || '';
    let end = $('#PullApiEndPoint').val() || '';
    const acc = $('#AccountName').val() || '';
    const key = $('#ApiKey').val() || '';

    if (!base || !end) {
        showToast("warning", "Base URL and Endpoint are required to generate URL");
        return;
    }

    // --- Perfect URL Formatting ---
    // Remove trailing slash from base and leading slash from end
    base = base.replace(/\/+$/, '');
    end = end.replace(/^\/+/, '');

    const fullUrl = `${base}/${end}?AccountName=${acc}&APIKey=${key}&FromDate=2026-05-01&ToDate=2026-05-02`;

    // Modern Copy to Clipboard
    const dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.value = fullUrl;
    dummy.select();

    try {
        document.execCommand("copy");
        showToast("success", "Full Debug URL copied!");
        console.log("Debug URL:", fullUrl); // Helpful for console debugging
    } finally {
        document.body.removeChild(dummy);
    }
}
