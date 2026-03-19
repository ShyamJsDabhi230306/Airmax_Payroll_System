document.addEventListener("DOMContentLoaded", () => {

    const name = getUserName();
    const role = (getUserRole() || "").toLowerCase();

    const nameEl = document.getElementById("lblLoginName");
    const avatarEl = document.getElementById("userAvatar");

    if (name && nameEl && avatarEl) {
        nameEl.innerText = name;

        const parts = name.trim().split(/\s+/);
        const initials = parts.length > 1
            ? parts[0][0] + parts[1][0]
            : parts[0][0];

        avatarEl.innerText = initials.toUpperCase();
    }

    /* ===============================
       MASTER → ADMIN ONLY
    =============================== */
    const masterMenus = [
        "menuMasterTitle",
        "menuCompany",
        "menuLocation",
        "menuDepartment",
        "menuUser"
    ];

    if (role !== "admin") {
        masterMenus.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });
    }

    /* ===============================
       CREATE DRS → USER + HOD
    =============================== */
    if (role !== "user" && role !== "hod" && role !== "tdr") {
        const createDrs = document.getElementById("menuCreateDrs");
        if (createDrs) createDrs.style.display = "none";
    }

    /* ===============================
       ADMIN → HIDE DRS MENU
    =============================== */
    if (role === "admin") {
        const drsMenu = document.getElementById("menu-drs");
        if (drsMenu) drsMenu.style.display = "none";
    }

    /* ===============================
       TDR / HOD DASHBOARD
    =============================== */
    const menuTdrHodDashboard = document.getElementById("menuTdrHodDashboard");
    if (menuTdrHodDashboard) {
        menuTdrHodDashboard.style.display =
            (role === "hod" || role === "tdr") ? "block" : "none";
    }
});

function openManageDrs() {

    const role = getUserRole();

    switch (role) {
        case "admin":
            window.location.href = "/DRS/ManageAdmin";
            break;

        case "rms":
            window.location.href = "/DRS/ManageRMS";
            break;

        case "tdr":
            window.location.href = "/DRS/ManageTdr";
            break;

        case "design":
            window.location.href = "/DRS/DesignerView";
            break;

        case "hod":
            window.location.href = "/DRS/HodList";
            break;

        case "user":
            window.location.href = "/DRS/ManageUser";
            break;

        default:
            alert("Unauthorized access");
            break;
    }
}
function logoutUser() {

    // ----------------------------
    // CLEAR LOCAL STORAGE
    // ----------------------------
    localStorage.removeItem("auth_token");
    localStorage.removeItem("UserData");

    // ----------------------------
    // CLEAR JWT COOKIE
    // ----------------------------
    document.cookie = "jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // ----------------------------
    // REDIRECT TO LOGIN
    // ----------------------------
    window.location.href = "/Account/Login";
}