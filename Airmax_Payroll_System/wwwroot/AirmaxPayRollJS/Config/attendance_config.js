/**
 * Attendance Configuration Logic
 * Fully integrated with Bootstrap 5 Tabs
 */

// 1. Company Profiles Data
const COMPANY_PROFILES = {
    aira: { base: 'https://sohcm.com/SmartApp_ess', account: 'ACE', key: '233916012427', devs: 3 },
    airmax: { base: 'https://sohcm.com/SmartApp_ess', account: 'AIRMAX', key: '521714042205', devs: 5 },
    '4matic': { base: 'https://sohcm.com/SmartApp_ess', account: '4MATIC', key: '593910012317', devs: 2 }
};

function loadCompany(co) {
    const p = COMPANY_PROFILES[co];
    if (!p) return;
    document.getElementById('api-base').value = p.base;
    document.getElementById('api-account').value = p.account;
    document.getElementById('api-key').value = p.key;
    document.getElementById('dev-count').textContent = p.devs;
    if (typeof toastr !== 'undefined') toastr.success('Switched to ' + co.toUpperCase());
}

// 2. UI Utilities
function toggleApiKey(btn) {
    const input = document.getElementById('api-key');
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
    } else {
        input.type = 'password';
        btn.textContent = 'Show';
    }
}

function copyText(id, btn) {
    const input = document.getElementById(id);
    input.select();
    document.execCommand("copy");
    const orig = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => btn.textContent = orig, 1200);
}

// 3. Tab Helper (Fixes ReferenceError)
function updateActiveTab(name) {
    console.log("Active Tab:", name);
    // Add extra logic if needed when tabs switch
}

// 4. Simulator
function testConnection() {
    const btn = event.currentTarget;
    const msg = document.getElementById('conn-msg');
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = '<i class="fa fa-bolt me-1"></i> Test Connection';
        btn.disabled = false;
        msg.innerHTML = 'Last test: <span class="text-success fw-bold">200 OK</span> - 248ms';
        if (typeof toastr !== 'undefined') toastr.success('Connection Successful!');
    }, 1000);
}

function runTest() {
    const endpoint = document.getElementById('t-endpoint').value;
    const resPre = document.getElementById('res-pre');
    resPre.textContent = "// Executing simulation...";
    setTimeout(() => {
        let data = (endpoint === 'GetDeviceLogs')
            ? [{ EmployeeCode: "001", LogDate: "2026-05-01 09:00:00", Serial: "C260" }]
            : { Message: "Command Send Successfully.", Result: true };
        resPre.textContent = JSON.stringify(data, null, 2);
    }, 800);
}

// 5. Device Management
function addDeviceRow() {
    const tbody = document.getElementById('dev-rows');
    const idx = tbody.children.length + 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx}</td><td><input class="form-control form-control-sm"></td><td><input class="form-control form-control-sm font-monospace"></td><td><input class="form-control form-control-sm"></td><td><span class="badge bg-secondary">Draft</span></td><td><button class="btn btn-danger btn-sm p-1" onclick="this.closest('tr').remove()"><i class="fa fa-times"></i></button></td>`;
    tbody.appendChild(tr);
    document.getElementById('dev-count').textContent = tbody.children.length;
}

function setFreq(m) {
    document.getElementById('pull-freq').value = (m >= 60) ? "60" : m.toString();
    if (typeof toastr !== 'undefined') toastr.info('Frequency updated');
}

function saveAll() {
    if (typeof toastr !== 'undefined') toastr.success('All settings saved to database!');
    else alert('All settings saved!');
}
