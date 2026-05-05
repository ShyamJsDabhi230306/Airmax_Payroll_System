/** 
 * Payroll API Configuration Entry JS
 * Full Refactored Version with 53-Field DOM Mapping
 */

const API_CONFIG = "/api/master/payroll-api-config";
let allLocations = [];

// ======================================================
// 1. COMPLETE DOM MAPPING (All 53 Fields)
// ======================================================
const DOM = {
    id: () => document.getElementById("IDPayrollApiConfigration"),
    company: () => document.getElementById("IDCompany"),
    idBiometric: () => document.getElementById("IDBiometricDevice"),
    idMapping: () => document.getElementById("IDLocationDeviceMaping"),

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
    onlineEnroll: () => document.getElementById("OnlineEnrollment"),
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

// ======================================================
// 2. INITIALIZATION
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {
    await loadCompanyDropdown();
    await fetchLocations();

    $(DOM.company()).on('change', async function () {
        const selectedId = $(this).val();
        clearForm();
        if (selectedId && selectedId !== "0") {
            await loadExistingConfig(selectedId);
        }
    });

    const startId = $(DOM.company()).val();
    if (startId && startId !== "0") {
        await loadExistingConfig(startId);
    }
});

// ======================================================
// 3. DATA COLLECTION (getDto)
// ======================================================
function getDto() {
    const n = (el) => parseInt(el()?.value) || 0;
    const c = (el) => el()?.checked || false;
    const v = (el) => el()?.value || "";

    return {
        IDPayrollApiConfigration: n(DOM.id),
        IDCompany: n(DOM.company),
        IDBiometricDevice: n(DOM.idBiometric),
        IDLocationDeviceMaping: n(DOM.idMapping),

        BaseUrl: v(DOM.baseUrl),
        AccountName: v(DOM.accountName),
        ApiKey: v(DOM.apiKey),
        PullApiEndPoint: v(DOM.pullEndPoint),
        RequestTimeout: n(DOM.timeout),
        RetryAttemptOfFailer: n(DOM.retryAttempts),
        RetryBackOff: n(DOM.retryBackoff),
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
        OnlineEnrollment: v(DOM.onlineEnroll),
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

        DeviceJson: JSON.stringify($(DOM.tblDevice()).find('tr').map((i, row) => {
            const r = $(row);
            return {
                DeviceName: r.find('.dev-name').val() || "",
                SerialNumber: r.find('.dev-serial').val() || "",
                ModelType: r.find('.dev-model-select').val() || "SpeedFace",
                IDLocation: parseInt(r.find('.dev-loc-select').val()) || 0,
                Status: "Online" // 🔥 Added missing Status field
            };
        }).get()),
        MappingJson: JSON.stringify($(DOM.tblMapping()).find('tr').map((i, row) => {
            const r = $(row);
            return {
                IDLocation: parseInt(r.find('.save-map-loc').val()) || 0,
                MappedDeviceSerials: r.find('.save-serials').val() || "",
                IDEmployee: parseInt(r.find('.save-count').val()) || 0
            };
        }).get())
    };
}

// ======================================================
// 4. LOADING LOGIC
// ======================================================
async function loadExistingConfig(companyId) {
    try {
        const targetId = parseInt(companyId);
        const res = await apiFetch(`${API_CONFIG}/get-all`);
        const json = await res.json();

        const d = json.data ? json.data.find(x => parseInt(x.idCompany || x.IDCompany) === targetId) : null;

        if (d) {
            DOM.id().value = d.idPayrollApiConfigration || d.IDPayrollApiConfigration || 0;

            // API Connection
            $(DOM.baseUrl()).val(d.baseUrl || "");
            $(DOM.accountName()).val(d.accountName || "");
            $(DOM.apiKey()).val(d.apiKey || "");
            $(DOM.pullEndPoint()).val(d.pullApiEndPoint || "");
            $(DOM.timeout()).val(d.requestTimeout || 30);
            $(DOM.retryAttempts()).val(d.retryAttemptOfFailer || 3);
            $(DOM.retryBackoff()).val(d.retryBackOff || 5);

            // Checkboxes
            DOM.useHttps().checked = d.useHTTPSOnly === true;
            DOM.maskLogs().checked = d.maskApiInLog === true;
            DOM.ipWhiteList().checked = d.ipWhiteListEnforcement === true;
            DOM.autoRotateKey().checked = d.autoRotateApiKeyOnEvery90Days === true;

            // Transforms
            $(DOM.userIdPayroll()).val(d.useridPayroll || "").selectpicker('refresh');
            $(DOM.userIdTransform()).val(d.useridTransform || "").selectpicker('refresh');
            $(DOM.logDatePayroll()).val(d.logDatePayroll || "").selectpicker('refresh');
            $(DOM.logDateTransform()).val(d.logdateTransform || "").selectpicker('refresh');
            $(DOM.serialPayroll()).val(d.serialNumberPayroll || "").selectpicker('refresh');
            $(DOM.serialTransform()).val(d.serialNumberTransform || "").selectpicker('refresh');
            $(DOM.deviceNamesPayroll()).val(d.deviceSNamesPayroll || "").selectpicker('refresh');
            $(DOM.deviceNamesTransform()).val(d.deviceSNamesTransform || "").selectpicker('refresh');

            // Rules & Hardware
            $(DOM.pullFrequency()).val(d.pullFrequency || "").selectpicker('refresh');
            $(DOM.onDuplicate()).val(d.onDuplicatePunch || "").selectpicker('refresh');
            $(DOM.unknownEmp()).val(d.unknownEmployeeCode || "").selectpicker('refresh');
            DOM.rejectFuture().checked = d.rejectFuturePunch === true;
            DOM.emailOnFail().checked = d.emailOnFailure === true;

            // Automation
            $(DOM.autoPushEmp()).val(d.autoPushOnEmployeeAdd || "Yes").selectpicker('refresh');
            $(DOM.autoDelResign()).val(d.autoDeleteOnEmployeeResign || "Yes").selectpicker('refresh');

            // Flags
            DOM.pushPhoto().checked = d.isPushPhotoEnabled === true;
            DOM.blockOnSuspend().checked = d.isBlockOnSuspend === true;

            // Load Tables
            await loadDevices(targetId);
            await loadMappings(targetId);

            showToast("info", "Configuration Loaded.");
        } else {
            clearForm();
        }
    } catch (err) {
        console.error("Load Failed:", err);
    }
}

// ======================================================
// 5. SAVING LOGIC
// ======================================================
async function saveAll() {
    const dto = getDto();
    const btn = DOM.btnSave();

    if (dto.IDCompany === 0) {
        showToast("warning", "Please select a Company!");
        return;
    }

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
        } else {
            showToast("danger", json.message);
        }
    } catch (err) {
        showToast("danger", "Network Error.");
    } finally {
        if (btn) btn.disabled = false;
    }
}

function clearForm() {
    // 1. Reset the Hidden Config ID
    DOM.id().value = 0;

    // 2. Clear the Tables
    DOM.tblDevice().innerHTML = "";
    DOM.tblMapping().innerHTML = "";

    // 3. 🔥 FIX: Reset all dropdowns EXCEPT the Company one
    $('.selectpicker').not('#IDCompany').val('').selectpicker('refresh');

    // 4. Reset all other inputs
    $('input[type="text"], input[type="number"]').val('');
    $('input[type="checkbox"]').prop('checked', false);

    console.log("Form cleared, but Company selection kept.");
}


// ======================================================
// 6. HELPER FUNCTIONS (Tables & Locations)
// ======================================================

async function fetchLocations() {
    try {
        const res = await apiFetch("/api/master/location/get-all");
        const json = await res.json();
        allLocations = json.data || [];
    } catch (err) { console.error("Location Fetch Error", err); }
}

async function loadCompanyDropdown() {
    try {
        const res = await apiFetch("/api/master/company/get-all");
        const json = await res.json();
        const ddl = $(DOM.company());
        ddl.empty().append('<option value="0">-- Select Company --</option>');
        if (json.data) {
            json.data.forEach(c => ddl.append(`<option value="${c.idCompany}">${c.companyName}</option>`));
        }
        ddl.selectpicker('refresh');
    } catch (err) { console.error("Company Load Error", err); }
}

// --- ROW BUILDERS ---
function addDeviceRow(data = {}) {
    const tbody = DOM.tblDevice();
    const row = document.createElement("tr");

    // Safety check for location data
    const currentLocId = data.IDLocation || data.idLocation || 0;
    const currentModel = data.ModelType || data.modelType || "SpeedFace";

    let locOptions = `<option value="0">-- Location --</option>`;
    allLocations.forEach(l => {
        const id = l.IDLocation || l.idLocation;
        const name = l.LocationName || l.locationName;
        locOptions += `<option value="${id}" ${id == currentLocId ? 'selected' : ''}>${name}</option>`;
    });

    row.innerHTML = `
        <td><input type="text" class="form-control dev-name" value="${data.DeviceName || data.deviceName || ''}"></td>
        <td><input type="text" class="form-control dev-serial" value="${data.SerialNumber || data.serialNumber || ''}"></td>
        <td>
            <select class="form-control dev-model-select">
                <option value="SpeedFace" ${currentModel === 'SpeedFace' ? 'selected' : ''}>SpeedFace</option>
                <option value="K40" ${currentModel === 'K40' ? 'selected' : ''}>K40</option>
            </select>
        </td>
        <td><select class="form-control dev-loc-select">${locOptions}</select></td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest('tr').remove()">X</button></td>
    `;
    tbody.appendChild(row);
    $(row).find('select').selectpicker('render');
}

function addMappingRow(data = {}) {
    const tbody = DOM.tblMapping();
    const row = document.createElement("tr");
    let locOptions = `<option value="">-- Location --</option>`;

    allLocations.forEach(l => {
        // 🔥 FIX: Use PascalCase (IDLocation)
        const id = l.IDLocation || l.idLocation;
        const name = l.LocationName || l.locationName;
        locOptions += `<option value="${id}" ${id == data.idLocation ? 'selected' : ''}>${name}</option>`;
    });

    row.innerHTML = `
        <td><select class="form-control save-map-loc" onchange="updateLocationEmployeeCount(this)">${locOptions}</select></td>
        <td><input type="text" class="form-control save-serials" value="${data.mappedDeviceSerials || ''}"></td>
        <td><input type="text" class="form-control save-count" value="${data.idEmployee || 0}" readonly></td>
        <td><button type="button" class="btn btn-sm btn-danger" onclick="$(this).closest('tr').remove()">X</button></td>
    `;
    tbody.appendChild(row);
    $(row).find('select').selectpicker();
}

async function updateLocationEmployeeCount(select) {
    const locId = $(select).val();
    const input = $(select).closest('tr').find('.save-count');
    if (!locId) return;
    const res = await apiFetch(`/api/master/employee/get-all?locId=${locId}`);
    const json = await res.json();
    input.val(json.data ? json.data.length : 0);
}
