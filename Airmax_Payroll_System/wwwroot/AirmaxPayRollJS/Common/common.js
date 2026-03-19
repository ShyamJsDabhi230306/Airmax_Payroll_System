/**************************************************
 *  GLOBAL JS
 **************************************************/
'use strict';

window.showToast = function (type, message, title) {
    toastr.options = {
        positionClass: "toast-top-right",
        timeOut: 5e3,
        closeButton: !0,
        debug: !1,
        newestOnTop: !0,
        progressBar: !0,
        preventDuplicates: !0,
        onclick: null,
        showDuration: "300",
        hideDuration: "1000",
        extendedTimeOut: "1000",
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
        tapToDismiss: !1
    };

    title = title || "Notification";

    switch (type) {
        case "success":
            toastr.success(message, title);
            break;
        case "error":
            toastr.error(message, title);
            break;
        case "danger":
            toastr.error(message, title);
            break;
        case "warning":
            toastr.warning(message, title);
            break;
        case "info":
            toastr.info(message, title);
            break;
        default:
            toastr.info(message, title);
            break;
    }
};

async function confirmDelete(message) {
    const result = await Swal.fire({
        title: "Are you sure?",
        text: message || "You will not be able to recover this record!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#DD6B55"
    });

    return result.isConfirmed;
}


/**************************************************
 * GLOBAL USER NAME (SESSION)
 **************************************************/
window.getLoggedInUser = function () {
    const data = localStorage.getItem("UserData");
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Invalid UserData in storage");
        return null;
    }
};
window.getUserId = function () {
    const user = getLoggedInUser();
    return user?.idUser || user?.id || null;
};
window.getUserName = function () {
    const user = getLoggedInUser();
    return user?.fullName || user?.email || "";
};
window.getUserRole = function () {
    const user = getLoggedInUser();
    return (user?.role || "").toLowerCase();
};
window.getUserEmail = function () {
    const user = getLoggedInUser();
    return user?.email || "--";
};
window.getCompanyId = function () {
    const user = getLoggedInUser();
    return user?.idCompany || null;
};


function formatDateTime(dt) {
    if (!dt) return "";

    const d = new Date(dt);

    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12 || 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}
function formatDateForApi(dateValue) {
    // input already yyyy-MM-dd from <input type="date">
    // normalize & validate
    if (!dateValue) return null;

    const d = new Date(dateValue);
    if (isNaN(d)) return null;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}
function timeAgo(dateStr) {
    const d = new Date(dateStr);
    const diff = Math.floor((new Date() - d) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
    return Math.floor(diff / 86400) + " days ago";
}
function formatDateForDateInput(dateStr) {
    if (!dateStr) return "";

    // already yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
        return dateStr;

    // convert from dd-MM-yyyy
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [dd, mm, yyyy] = dateStr.split("-");
        return `${yyyy}-${mm}-${dd}`;
    }

    // ISO / Date string
    const d = new Date(dateStr);
    if (isNaN(d)) return "";

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}
function formatDate(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}
function getInitials(name) {
    const n = (name || "").trim().replace(/\s+/g, " ");
    if (!n) return "NA";

    const parts = n.split(" ");
    const first = parts[0]?.charAt(0) || "N";
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
    return (first + last).toUpperCase();
}

function hashToColorKey(str) {
    const colors = ["primary", "success", "info", "warning", "danger", "secondary"];
    const s = (str || "x").toLowerCase();

    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash) + s.charCodeAt(i);

    return colors[Math.abs(hash) % colors.length];
}
function escapeHtml(text) {

    if (text === null || text === undefined)
        return "";

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function escapeQuotes(str) {
    if (!str) return "";
    return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (
        params.get("id") ||
        params.get("ticketId") ||
        0
    );
}
function itemStatusBadge(status) {
    if (!status) return "";

    const map = {
        "NEW": {
            text: "New Request",
            cls: "badge badge-warning",
            icon: "fa fa-file-text"
        },
        "APPROVED": {
            text: "Approved",
            cls: "badge badge-success",
            icon: "fa fa-check"
        },
        "TASK_ASSIGNED": {
            text: "Task Assigned",
            cls: "badge badge-info",
            icon: "fa fa-tasks"
        },
        "REJECTED": {
            text: "Rejected",
            cls: "badge badge-danger",
            icon: "fa fa-times"
            }

    };

    const cfg = map[status];

    if (!cfg) {
        return `
            <span class="badge badge-light text-dark">
                ${status.replaceAll("_", " ")}
            </span>
        `;
    }

    return `
        <span class="${cfg.cls}">
            ${cfg.text}
            <span class="ms-1 ${cfg.icon}"></span>
        </span>
    `;
}

function overallStatusBadge(status) {
    if (!status) return "";

    const map = {
        "COMPLETED": {
            text: "Completed",
            cls: "badge badge-success",
            icon: "fa fa-check"
        },
       
        "RMS_PENDING": {
            text: "RMS Pending",
            cls: "badge badge-warning",
            icon: "fa fa-clock"
        },
        "TDR_PENDING": {
            text: "TDR Pending",
            cls: "badge badge-info",
            icon: "fa fa-clock"
        },
        "DESIGN_PENDING": {
            text: "Design Pending",
            cls: "badge badge-purple",
            icon: "fa fa-drafting-compass"
        },
        "IN_PROGRESS": {
            text: "In Progress",
            cls: "badge badge-primary",
            icon: "fa fa-spinner"
        },
        "RMS_SENT_BACK": {
            text: "Sent Back",
            cls: "badge badge-danger",
            icon: "fa fa-undo"
        },
        "TDR_SENT_BACK": {
            text: "Sent Back",
            cls: "badge badge-danger",
            icon: "fa fa-undo"
        },
        "HOD_SENT_BACK": {
            text: "Sent Back",
            cls: "badge badge-danger",
            icon: "fa fa-undo"
        },
        "REJECTED": {
            text: "Rejected",
            cls: "badge badge-danger",
            icon: "fa fa-times"
        }
    };

    const cfg = map[status];

    if (!cfg) {
        return `<span class="badge badge-secondary">${status.replaceAll("_", " ")}</span>`;
    }

    return `
        <span class="${cfg.cls}">
            ${cfg.text}
            <span class="ms-1 ${cfg.icon}"></span>
        </span>
    `;
}
function isLate(deliveryDate) {
    if (!deliveryDate) return false;
    return new Date(deliveryDate) < new Date();
}
function getDrsTypeBadge(drsType) {
    if (!drsType) return "";

    if (drsType === "Revision") {
        return `<span class="badge badge-sm badge-warning">Revision</span>`;
    }
    if (drsType === "New Work") {
        return `<span class="badge badge-sm badge-success">New Work</span>`;
    }
}
function getAvatarColor(key) {
    if (!key) return "bg-secondary";

    let hash = 0;
    const avatarColors = [
        "bg-primary",
        "bg-success",
        "bg-info",
        "bg-warning",
        "bg-danger"
    ];

    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % avatarColors.length;
    return avatarColors[index];
}
function formatPrettyDate(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    const dayNames = [
        "Sunday", "Monday", "Tuesday",
        "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${month} ${day}${getDaySuffix(day)} ${year}`;
}
function getDaySuffix(day) {
    if (day >= 11 && day <= 13) return "th";

    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}
function getFileFaIcon(contentType) {

    if (!contentType) {
        return "fa-regular fa-folder";
    }

    contentType = contentType.toLowerCase();

    if (contentType.includes("pdf")) {
        return "fa-regular fa-file-pdf text-danger";
    }

    if (contentType.includes("image")) {
        return "fa-regular fa-file-image text-info";
    }

    if (contentType.includes("word")) {
        return "fa-regular fa-file-word text-primary";
    }

    if (contentType.includes("excel") || contentType.includes("spreadsheet")) {
        return "fa-regular fa-file-excel text-success";
    }

    if (contentType.includes("powerpoint")) {
        return "fa-regular fa-file-powerpoint text-warning";
    }

    if (contentType.includes("zip") || contentType.includes("rar")) {
        return "fa-regular fa-file-zipper text-secondary";
    }

    if (contentType.includes("text")) {
        return "fa-regular fa-file-lines text-muted";
    }

    return "fa-regular fa-file text-secondary";
}
function getSlaBadge(status) {

    switch ((status || "").toUpperCase()) {
        case "ON_TRACK":
            return `<span class="badge badge-rounded badge-outline-success">On Track</span>`;

        case "BREACHED":
            return `<span class="badge badge-rounded badge-outline-danger">Breached</span>`;

        case "COMPLETED_ON_TIME":
            return `<span class="badge badge-rounded badge-outline-primary">Completed On Time</span>`;

        case "COMPLETED_LATE":
            return `<span class="badge badge-rounded badge-outline-warning text-dark">Completed Late</span>`;

        default:
            return `<span class="badge badge-rounded badge-outline-secondary">Pending</span>`;
    }
}
function getTaskStatusBadge(status) {

    switch ((status || "").toUpperCase()) {
        case "ASSIGNED":
            return `<span class="badge bg-info">Assigned</span>`;

        case "ACCEPTED":
        case "IN_PROGRESS":
            return `<span class="badge bg-warning text-dark">In Progress</span>`;

        case "COMPLETED":
            return `<span class="badge bg-success">Completed</span>`;

        default:
            return `<span class="badge bg-secondary">${status}</span>`;
    }
}
function formatTime(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    }).toLowerCase();
}
function getWorkedDays(start, end) {
    if (!start || !end) return null;

    const s = new Date(start);
    const e = new Date(end);

    // Strip time, keep date only
    const startDate = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    const endDate = new Date(e.getFullYear(), e.getMonth(), e.getDate());

    const diffTime = endDate - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
}

function formatHours(val) {
    if (val === null || val === undefined) return "—";
    const num = Number(val);
    if (isNaN(num)) return "—";
    return num.toFixed(2);
}
function formatActualTime(hours) {
    if (hours === null || hours === undefined) return "—";

    const h = Number(hours);
    if (isNaN(h)) return "—";

    // Explicit ZERO handling
    if (h === 0) {
        return "0 min";
    }

    // Less than 1 hour → minutes
    if (h < 1) {
        return Math.round(h * 60) + " min";
    }

    // 1 hour or more
    return h.toFixed(2) + " hrs";
}
function formatDateOnly(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatTimeOnly(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}
function getItemStatusBadge(status) {
    status = (status || "NEW").toUpperCase();

    switch (status) {
        case "NEW":
            return {
                cls: "badge badge-sm badge-pill badge-info",
                text: "New"
            };

        case "HOD_APPROVED":
        case "APPROVED": 
            return {
                cls: "badge badge-sm badge-pill badge-success",
                text: "Approved"
            };

        case "TASK_ASSIGNED":
            return {
                cls: "badge badge-sm badge-pill badge-primary",
                text: "Task Assigned"
            };

        case "HOD_REJECTED":
        case "REJECTED":
            return {
                cls: "badge badge-sm badge-pill badge-danger",
                text: "Rejected"
            };

        default:
            return {
                cls: "badge badge-sm badge-pill badge-secondary",
                text: status.replace(/_/g, " ")
            };
    }
}
function getItemCardClass(status) {
    status = (status || "").toUpperCase();

    switch (status) {
        case "REJECTED":
        case "HOD_REJECTED":
            return "ic-send-bx bgl-danger";

        case "COMPLETED":
        case "APPROVED":
            return "ic-send-bx bgl-success";

        case "IN_PROGRESS":
        case "TASK_ASSIGNED":
            return "ic-send-bx bgl-warning";

        default:
            return "border-light bg-light";
    }
}
async function sendWhatsAppMessage({
    mobile,
    templateName,
    parameters,
    language = "en"
}) {
    if (!mobile || mobile.length !== 10) {
        console.warn("Invalid mobile number, WhatsApp skipped");
        return;
    }

    try {
        await apiFetch("/api/whatsapp/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: mobile,
                templateName: templateName,
                language: language,
                parameters: parameters
            })
        });
    } catch (err) {
        console.error("WhatsApp send failed", err);
        // silent fail – never block UI
    }
}
function formatDeliveryDateWithDays(deliveryDate) {
    if (!deliveryDate) return "-";

    const due = new Date(deliveryDate);
    due.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dateStr = formatDateShort(deliveryDate); // your existing dd-MM-yyyy formatter

    if (diffDays > 1) return `${dateStr} (in ${diffDays} days)`;
    if (diffDays === 1) return `${dateStr} (tomorrow)`;
    if (diffDays === 0) return `${dateStr} (today)`;

    return `${dateStr} (${Math.abs(diffDays)} days overdue)`;
}
function formatDateShort(dateValue) {
    if (!dateValue) return "-";

    const d = new Date(dateValue);
    if (isNaN(d)) return "-";

    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}
