///* 🛡️ AIRMAX SECONDARY DATA-TABLE SHIELD */
//document.addEventListener("DOMContentLoaded", async function () {
//    const token = localStorage.getItem("auth_token");
//    const storedUser = localStorage.getItem("UserData");

//    if (!token || !storedUser) return;
//    const user = JSON.parse(storedUser);

//    // Helper to get property regardless of casing
//    const getProp = (obj, key) => {
//        if (!obj) return null;
//        return obj[key] ?? obj[key.charAt(0).toLowerCase() + key.slice(1)] ?? obj[key.toUpperCase()];
//    };

//    try {
//        const userId = getProp(user, "IDUser");
//        if (!userId) return;

//        const response = await fetch(`/api/master/userrights/get-permissions/${userId}`, {
//            headers: { "Authorization": "Bearer " + token }
//        });
//        const res = await response.json();

//        if (res.success && res.data) {
//            const permissions = res.data;

//            // we only need current page rights for dynamic table button cleanup
//            const myRight = permissions.find(p => {
//                const pageName = getProp(p, "PageName");
//                if (!pageName) return false;
//                const normalizedPath = window.location.pathname.toLowerCase().replace(/-/g, "").replace(/\s+/g, "");
//                const normalizedDBName = pageName.toLowerCase().replace(" master", "").trim().replace(/\s+/g, "");
//                return normalizedPath.includes(normalizedDBName);
//            });

//            if (myRight) {
//                // Secondary Guardian (Cleanup buttons in DataTables after they load)
//                const cleanupDynamicButtons = () => {
//                    const canCreate = getProp(myRight, "CanCreate");
//                    const canEdit = getProp(myRight, "CanEdit");
//                    const canDelete = getProp(myRight, "CanDelete");

//                    document.querySelectorAll("a, button").forEach(el => {
//                        const txt = el.textContent.toLowerCase().trim();
//                        if ((canCreate === false || canCreate === 0) && (txt.includes("add ") || txt === "add" || txt.includes("create"))) {
//                            el.style.setProperty("display", "none", "important");
//                        }
//                        if ((canEdit === false || canEdit === 0) && (txt === "edit" || txt === "update" || txt === "save")) {
//                            el.style.setProperty("display", "none", "important");
//                        }
//                        if ((canDelete === false || canDelete === 0) && (txt === "delete" || txt === "remove")) {
//                            el.style.setProperty("display", "none", "important");
//                        }
//                    });
//                };

//                cleanupDynamicButtons();
//                new MutationObserver(cleanupDynamicButtons).observe(document.body, { childList: true, subtree: true });
//            }
//        }
//    } catch (e) {
//        console.error("Shield Secondary Layer Error:", e);
//    }
//});





/**
 * 🔒 GLOBAL RIGHTS HANDLER - FINAL STABLE VERSION
 * This version handles both C# (PascalCase) and JS (camelCase) properties.
 */
/**
 * 🔒 GLOBAL RIGHTS HANDLER - FINAL STABLE VERSION
 */
(function () {
    const CONFIG = {
        API_BASE: "/api/master/userrights",
        selectors: {
            create: [".btn-add", "#btnAdd", ".add-new", ".btn-create", "[onclick*='Add']", "[onclick*='Create']", "[data-bs-target*='add']"],
            update: [".btn-edit", ".fa-pencil", ".btn-info.sharp", ".sharp.me-1", "[onclick*='edit']", "[onclick*='Edit']", "a[href*='Entry?id=']", "#btnSave"],
            delete: [".btn-delete", ".btn-danger.sharp", ".fa-trash", "[onclick*='delete']", "[onclick*='Delete']", "#btnDelete"]
        }
    };

    async function initializeSecurity() {
        const userId = typeof getUserId === "function" ? getUserId() : null;
        if (!userId) return;

        try {
            // 1. Fetch data
            const res = await apiFetch(`${CONFIG.API_BASE}/get-permissions/${userId}`);
            const json = await res.json();
            const permissions = json.data || [];
            const path = window.location.pathname.toLowerCase();

            // 2. Find target page
            const pageRight = permissions.find(p => {
                const u = (p.PageUrl || p.pageUrl || "").toLowerCase();
                return u && (path.includes(u) || u.includes(path));
            });

            if (!pageRight) return;

            // 3. Extract rights
            const rights = {
                canCreate: pageRight.CanCreate ?? pageRight.canCreate,
                canEdit: pageRight.CanEdit ?? pageRight.canEdit,
                canDelete: pageRight.CanDelete ?? pageRight.canDelete
            };

            const applyShield = () => {
                // Hide standard selectors
                if (rights.canCreate === false) hideElements(CONFIG.selectors.create);
                if (rights.canEdit === false) hideElements(CONFIG.selectors.update);
                if (rights.canDelete === false) hideElements(CONFIG.selectors.delete);

                // EXTRA: Special check for "Add Employee" button text
                if (rights.canCreate === false) {
                    document.querySelectorAll('.btn-primary, .btn').forEach(btn => {
                        if (btn.innerText.toLowerCase().includes('add')) {
                            btn.style.setProperty("display", "none", "important");
                        }
                    });
                }
            };

            applyShield();
            const observer = new MutationObserver(applyShield);
            observer.observe(document.body, { childList: true, subtree: true });

        } catch (err) {
            console.error("Security Shield Error:", err);
        }
    }

    function hideElements(list) {
        list.forEach(sel => {
            try {
                document.querySelectorAll(sel).forEach(el => {
                    el.style.setProperty("display", "none", "important");
                });
            } catch (e) { /* ignore invalid selectors */ }
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeSecurity);
    else initializeSecurity();
})();

