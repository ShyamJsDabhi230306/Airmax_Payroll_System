// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/holiday";

let editId = 0;
let holidayTable = null;

// ======================================================
// DOM
// ======================================================
const DOM = {
    id: () => document.getElementById("IDHoliday"),
    holidayDate: () => document.getElementById("HolidayDate"),
    holidayMonth: () => document.getElementById("HolidayMonth"),
    dayName: () => document.getElementById("DayName"),
    holidayType: () => document.getElementById("HolidayType"),
    holidayName: () => document.getElementById("HolidayName"),
    isActive: () => document.getElementById("IsActive"),

    save: () => document.getElementById("btnSave"),
    clear: () => document.getElementById("btnClear"),

    tbody: () => document.getElementById("tblBody")
};

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    setHolidayMinDate()
    DOM.save()?.addEventListener("click", saveData);
    DOM.clear()?.addEventListener("click", clearForm);
    DOM.holidayDate()?.addEventListener("change", setDateFields);

    await bindTable();
});

// ======================================================
// LOAD TABLE
// ======================================================
async function bindTable() {
    const tbody = DOM.tbody();
    if (!tbody) return;

    if ($.fn.DataTable.isDataTable("#holidayList")) {
        $("#holidayList").DataTable().destroy();
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">Loading...</td>
        </tr>
    `;

    try {
        const res = await apiFetch(`${API}/get-all`);
        if (!res) return;

        const json = await res.json();

        if (!json.success) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger py-4">
                        ${json.message || "Failed to load holidays."}
                    </td>
                </tr>
            `;
            return;
        }

        const rows = json.data || [];

        tbody.innerHTML = rows.length
            ? rows.map(x => `
                <tr>
                    <td>${formatMonth(x.holidayMonth)}</td>
                    <td>${formatDate(x.holidayDate)}</td>
                    <td>${safeText(x.dayName)}</td>
                    <td>${badgeHolidayType(x.holidayType)}</td>
                    <td>${safeText(x.holidayName)}</td>
                    <td class="text-end">
                        <button type="button"
                                class="btn btn-primary btn-xs sharp me-1 btn-edit"
                                onclick="editEntry(${x.idHoliday})">
                            <i class="fas fa-pencil-alt"></i>
                        </button>

                        <button type="button"
                                class="btn btn-danger btn-xs sharp btn-delete"
                                onclick="deleteEntry(${x.idHoliday})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join("")
            : "";

        holidayTable = $("#holidayList").DataTable({
            searching: true,
            pageLength: 10,
            lengthMenu: [10, 25, 50, 100],
            ordering: false,
            destroy: true,
            language: {
                search: "",
                searchPlaceholder: "Search holiday...",
                emptyTable: "No holidays loaded.",
                paginate: {
                    next: '<i class="fa fa-angle-double-right"></i>',
                    previous: '<i class="fa fa-angle-double-left"></i>'
                }
            }
        });

    } catch (err) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    ${err.message}
                </td>
            </tr>
        `;
    }
}

// ======================================================
// SAVE
// ======================================================
async function saveData() {
    const model = {
        idHoliday: Number(editId || 0),
        holidayMonth: DOM.holidayMonth()?.value ? `${DOM.holidayMonth().value}-01` : null,
        holidayDate: DOM.holidayDate()?.value || null,
        dayName: DOM.dayName()?.value || "",
        holidayType: DOM.holidayType()?.value || "",
        holidayName: DOM.holidayName()?.value?.trim() || "",
        isActive: DOM.isActive()?.checked ?? true
    };

    if (!model.holidayDate) return showToast("warning", "Please select holiday date.");
    if (!model.holidayType) return showToast("warning", "Please select holiday type.");
    if (!model.holidayName) return showToast("warning", "Please enter holiday name.");

    try {
        const res = await apiFetch(`${API}/save`, {
            method: "POST",
            body: JSON.stringify(model)
        });

        if (!res) return;

        const json = await res.json();

        if (!json.success) {
            showToast("danger", json.message || "Failed to save holiday.");
            return;
        }

        showToast("success", json.message || "Holiday saved successfully.");

        clearForm();
        await bindTable();

    } catch (err) {
        showToast("danger", err.message);
    }
}

// ======================================================
// EDIT
// ======================================================
async function editEntry(id) {
    try {
        const res = await apiFetch(`${API}/get-by-id/${id}`);
        if (!res) return;

        const json = await res.json();

        if (!json.success || !json.data) {
            showToast("danger", json.message || "Holiday not found.");
            return;
        }

        const x = json.data;

        editId = x.idHoliday || 0;

        DOM.id().value = editId;
        DOM.holidayMonth().value = toInputMonth(x.holidayMonth);
        DOM.holidayDate().value = toInputDate(x.holidayDate);
        DOM.dayName().value = x.dayName || "";
        DOM.holidayType().value = x.holidayType || "";
        DOM.holidayName().value = x.holidayName || "";
        DOM.isActive().checked = x.isActive !== false;

        DOM.save().innerText = "Update";

        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
        showToast("danger", err.message);
    }
}

// ======================================================
// DELETE
// ======================================================
async function deleteEntry(id) {
    const ok = await confirmDelete("Delete this holiday?");
    if (!ok) return;

    try {
        const res = await apiFetch(`${API}/delete/${id}`, {
            method: "DELETE"
        });

        if (!res) return;

        const json = await res.json();

        if (!json.success) {
            showToast("danger", json.message || "Failed to delete holiday.");
            return;
        }

        showToast("success", json.message || "Holiday deleted successfully.");

        clearForm();
        await bindTable();

    } catch (err) {
        showToast("danger", err.message);
    }
}

// ======================================================
// HELPERS
// ======================================================
function clearForm() {
    editId = 0;

    DOM.id().value = 0;
    DOM.holidayDate().value = "";
    DOM.holidayMonth().value = "";
    DOM.dayName().value = "";
    DOM.holidayType().value = "";
    DOM.holidayName().value = "";
    DOM.isActive().checked = true;
    DOM.save().innerText = "Save";
}

function setDateFields() {
    const value = DOM.holidayDate()?.value;

    if (!value) {
        DOM.holidayMonth().value = "";
        DOM.dayName().value = "";
        return;
    }

    const date = new Date(value + "T00:00:00");

    DOM.holidayMonth().value = value.substring(0, 7);
    DOM.dayName().value = date.toLocaleDateString("en-IN", { weekday: "long" });
}

function toInputDate(value) {
    if (!value) return "";
    return String(value).substring(0, 10);
}

function toInputMonth(value) {
    if (!value) return "";
    return String(value).substring(0, 7);
}

function formatDate(value) {
    if (!value) return "-";

    const d = new Date(value);
    if (isNaN(d)) return "-";

    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatMonth(value) {
    if (!value) return "-";

    const d = new Date(value);
    if (isNaN(d)) return "-";

    return d.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });
}


async function readJsonResponse(response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : null;
    } catch {
        throw new Error(text || "Server returned invalid response.");
    }
}
function getVal(obj, key) {
    if (!obj || !key) return null;

    return obj[key] ??
        obj[key.charAt(0).toUpperCase() + key.slice(1)] ??
        obj[key.charAt(0).toLowerCase() + key.slice(1)] ??
        null;
}

function formatHolidayMonth(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });
}

function formatHolidayDate(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}
function badgeHolidayType(type) {
    const value = safeText(type || "-");

    if ((type || "").toLowerCase() === "paid") {
        return `<span class="badge bg-success">${value}</span>`;
    }

    if ((type || "").toLowerCase() === "unpaid") {
        return `<span class="badge bg-warning text-dark">${value}</span>`;
    }

    return `<span class="badge bg-secondary">${value}</span>`;
}

function safeText(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function setHolidayMinDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const minDate = `${yyyy}-${mm}-${dd}`;

    if (DOM.holidayDate()) {
        DOM.holidayDate().setAttribute("min", minDate);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const btnFetchMonthHolidays = document.getElementById("btnFetchMonthHolidays");

    if (btnFetchMonthHolidays) {
        btnFetchMonthHolidays.addEventListener("click", fetchMonthWiseHolidays);
    }
});

async function fetchMonthWiseHolidays() {
    const monthValue = document.getElementById("FilterHolidayMonth")?.value || "";
    const body = document.getElementById("tblMonthHolidayBody");

    if (!body) return;

    if (!monthValue) {
        showToast("warning", "Please select month.");
        return;
    }

    body.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4">Loading...</td>
        </tr>
    `;

    try {
        const response = await fetch(`/api/master/holiday/get-by-month?holidayMonth=${monthValue}-01`);
        const result = await readJsonResponse(response);

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to load holidays.");
        }

        const rows = result.data || result.Data || [];

        body.innerHTML = rows.length
            ? rows.map(r => `
                <tr>
                    <td>${formatHolidayMonth(getVal(r, "holidayMonth"))}</td>
                    <td>${formatHolidayDate(getVal(r, "holidayDate"))}</td>
                    <td>${getVal(r, "dayName") || "-"}</td>
                    <td>
                        <span class="badge ${getVal(r, "holidayType") === "Paid" ? "bg-success" : "bg-warning text-dark"}">
                            ${getVal(r, "holidayType") || "-"}
                        </span>
                    </td>
                    <td>${getVal(r, "holidayName") || "-"}</td>
                </tr>
            `).join("")
            : `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">No holidays found for this month.</td>
                </tr>
            `;
    } catch (err) {
        body.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">${err.message}</td>
            </tr>
        `;
    }
}