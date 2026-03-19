// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/shift";
let entryModal = null;


// ======================================================
// DOM
// ======================================================
const DOM = {
    id: () => document.getElementById("IDShift"),
    department: () => document.getElementById("IDDepartment"),
    desc: () => document.getElementById("ShiftDesc"),

    startTime: () => document.getElementById("StartTime"),
    endTime: () => document.getElementById("EndTime"),

    totalHour: () => document.getElementById("WorkingHour"),
    totalMin: () => document.getElementById("WorkingMinute"),

    overtime: () => document.getElementById("Overtime"),

    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal"),
    save: () => document.getElementById("btnSave")
};


// ======================================================
// UTIL
// ======================================================
function splitTime(time) {
    if (!time || time.indexOf(':') === -1)
        return { hour: null, minute: null };

    const parts = time.split(':');

    return {
        hour: parseInt(parts[0], 10),
        minute: parseInt(parts[1], 10)
    };
}

function formatTime(h, m) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}


// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    entryModal = new bootstrap.Modal(DOM.modal(), { backdrop: "static" });

    await loadDepartment();
    await bindTable();

    // ✅ FIXED EVENTS (WORKING WITH MATERIAL PICKER)
    $('#StartTime').on('change blur', calculateTime);
    $('#EndTime').on('change blur', calculateTime);

    DOM.save().addEventListener("click", saveData);
});


// ======================================================
// LOAD DEPARTMENT
// ======================================================
async function loadDepartment() {

    const res = await fetch("/api/master/department/get-all");
    const json = await res.json();

    if (!json.success) return;

    DOM.department().innerHTML =
        `<option value="">-- Select Department --</option>` +
        json.data.map(d =>
            `<option value="${d.idDepartment}">${d.departmentName}</option>`
        ).join("");
}


// ======================================================
// BIND TABLE
// ======================================================
async function bindTable() {

    const res = await fetch(`${API}/get-all`);
    const json = await res.json();

    if (!json.success) return;

    let html = "";

    json.data.forEach(d => {

        html += `
        <tr>
            <td>${d.departmentName || ""}</td>
            <td>${d.shiftDesc || ""}</td>
            <td>${formatTime(d.startTimeHour, d.startTimeMinute)}</td>
            <td>${formatTime(d.endTimeHour, d.endTimeMinute)}</td>
            <td>${d.totalWorkingHour || ""}</td>
            <td>
                <button onclick="editEntry(${d.idShift})">Edit</button>
                <button onclick="deleteEntry(${d.idShift})">Delete</button>
            </td>
        </tr>`;
    });

    DOM.tbody().innerHTML = html;
}


// ======================================================
// EDIT
// ======================================================
async function editEntry(id) {

    const res = await fetch(`${API}/get-by-id/${id}`);
    const json = await res.json();

    if (!json.success) return;

    const d = json.data;

    DOM.id().value = d.idShift;
    DOM.department().value = d.idDepartment;
    DOM.desc().value = d.shiftDesc;

    DOM.startTime().value = formatTime(d.startTimeHour, d.startTimeMinute);
    DOM.endTime().value = formatTime(d.endTimeHour, d.endTimeMinute);

    calculateTime();

    entryModal.show();
}


// ======================================================
// DELETE
// ======================================================
async function deleteEntry(id) {

    if (!confirm("Delete this record?")) return;

    await fetch(`${API}/delete/${id}`, { method: "DELETE" });

    bindTable();
}


// ======================================================
// SAVE
// ======================================================
async function saveData() {

    if (!DOM.desc().value.trim()) {
        alert("Shift description required");
        return;
    }

    const startVal = DOM.startTime().value;
    const endVal = DOM.endTime().value;

    if (!startVal || !endVal) {
        alert("Please select start and end time");
        return;
    }

    const start = splitTime(startVal);
    const end = splitTime(endVal);

    const dto = {

        idShift: Number(DOM.id().value || 0),
        IDDepartment: DOM.department().value ? Number(DOM.department().value) : null,

        shiftDesc: DOM.desc().value.trim(),

        startTimeHour: start.hour,
        startTimeMinute: start.minute,

        endTimeHour: end.hour,
        endTimeMinute: end.minute,

        overtime: DOM.overtime().value
            ? `1970-01-01T${DOM.overtime().value}:00`
            : null
    };

    DOM.save().disabled = true;

    try {

        const res = await fetch(`${API}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        const json = await res.json();

        if (!json.success)
            throw new Error(json.message);

        alert(json.message);

        entryModal.hide();
        clearForm();
        bindTable();

    }
    catch (err) {
        alert(err.message);
    }
    finally {
        DOM.save().disabled = false;
    }
}


// ======================================================
// CALCULATION (FIXED)
// ======================================================
function calculateTime() {

    const startVal = DOM.startTime().value;
    const endVal = DOM.endTime().value;

    if (!startVal || !endVal) return;

    const start = splitTime(startVal);
    const end = splitTime(endVal);

    if (start.hour === null || end.hour === null) return;

    let startMinutes = (start.hour * 60) + start.minute;
    let endMinutes = (end.hour * 60) + end.minute;

    // Night shift
    if (endMinutes < startMinutes) {
        endMinutes += 1440;
    }

    const total = endMinutes - startMinutes;

    DOM.totalMin().value = total;
    DOM.totalHour().value = (total / 60).toFixed(2);
}


// ======================================================
// CLEAR
// ======================================================
function clearForm() {

    document.querySelectorAll("#entryForm input")
        .forEach(x => x.value = "");

    DOM.id().value = 0;
}