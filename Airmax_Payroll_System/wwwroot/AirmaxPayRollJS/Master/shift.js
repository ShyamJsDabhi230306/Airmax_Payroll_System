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

    //overtime: () => document.getElementById("Overtime"),

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

    $(DOM.department()).selectpicker('refresh');
}


// ======================================================
// BIND TABLE
// ======================================================
async function bindTable() {

    //const res = await fetch(`${API}/get-all`);
    // Add a timestamp (?v=...) to prevent the browser from using a cached version
    const res = await fetch(`${API}/get-all?v=${new Date().getTime()}`);
    const json = await res.json();

    if (!json.success) return;

    const tbody = DOM.tbody();
    tbody.innerHTML = "";

    json.data.forEach(d => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(d.departmentName || "")}</td>
            <td>${escapeHtml(d.shiftDesc || "")}</td>
            <td>${formatTime(d.startTimeHour, d.startTimeMinute)}</td>
            <td>${formatTime(d.endTimeHour, d.endTimeMinute)}</td>
            <td>${d.totalWorkingHour || ""}</td>
            <td>${d.overtime ? d.overtime.substring(11, 16) : ""}</td>


            <td class="text-center">
                <div class="d-flex justify-content-center">
                    <a onclick="editEntry(${d.idShift})"
                       class="btn btn-primary btn-xs sharp me-1">
                        <i class="fa fa-pencil"></i>
                    </a>

                    <a onclick="deleteEntry(${d.idShift})"
                       class="btn btn-danger btn-xs sharp">
                        <i class="fa fa-trash"></i>
                    </a>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // 🔥 Reinitialize DataTable properly
    if ($.fn.DataTable.isDataTable('#shiftList')) {
        $('#shiftList').DataTable().destroy();
    }

    $('#shiftList').DataTable({
        searching: true,
        pageLength: 10,
        ordering: false,
        language: {
            paginate: {
                next: '<i class="fa fa-angle-double-right"></i>',
                previous: '<i class="fa fa-angle-double-left"></i>'
            }
        }
    });
}

// ======================================================
// EDIT
// ======================================================
async function editEntry(id) {

    const res = await fetch(`${API}/get-by-id/${id}`);
    const json = await res.json();

    if (!json.success) return;

    const d = json.data;

    // BASIC
    DOM.id().value = d.idShift;
    DOM.department().value = d.idDepartment;
    DOM.desc().value = d.shiftDesc;

    // ✅ USE StartTime if available (BEST)
    if (d.startTime) {
        DOM.startTime().value = d.startTime.substring(0, 5);
    } else {
        DOM.startTime().value = formatTime(d.startTimeHour, d.startTimeMinute);
    }

    if (d.endTime) {
        DOM.endTime().value = d.endTime.substring(0, 5);
    } else {
        DOM.endTime().value = formatTime(d.endTimeHour, d.endTimeMinute);
    }

    // ✅ WORKING TIME
    DOM.totalHour().value = d.totalWorkingHour || "";
    DOM.totalMin().value = d.totalWorkingMinute || "";

    //// ✅ OVERTIME (handle datetime → time)
    //if (d.overtime) {
    //    DOM.overtime().value = d.overtime.substring(11, 16);
    //} else {
    //    DOM.overtime().value = "";
    //}

    // OPTIONAL
    // remark if you have field
    // document.getElementById("Remark").value = d.remark || "";

    entryModal.show();
}

// ======================================================
// DELETE
// ======================================================
// ======================================================
// DELETE (SHIFT - UPDATED LIKE DESIGNATION)
// ======================================================
async function deleteEntry(id) {

    const ok = await confirmDelete("This record will be deleted permanently!");

    if (!ok) return;

    try {

        const res = await apiFetch(`${API}/delete/${id}`, {
            method: "DELETE"
        });

        const json = await res.json();

        if (!json.success)
            throw new Error(json.message);

        showToast("success", json.message, "Shift Master");

        await bindTable();

    } catch (err) {

        showToast("danger", err.message, "Shift Master");

    }
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

        //overtime: DOM.overtime().value
        //    ? `1970-01-01T${DOM.overtime().value}:00`
        //    : null
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

        showToast("success", json.message, "shift Master");



        entryModal.hide();
        clearForm();
        bindTable();

    }
    catch (err) {
        showToast("error", error.message, "shift Master");
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