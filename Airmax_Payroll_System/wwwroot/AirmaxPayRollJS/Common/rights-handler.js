
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
        // 🛡️ ADMIN BYPASS: If user is Admin, do not hide anything
        const userRole = typeof getUserRole === "function" ? getUserRole().toLowerCase() : "";
        if (userRole.includes("admin") || userRole.includes("administrator") || userRole === "super") {
            console.log("Security Shield: Admin detected, full access granted.");
            return;
        }




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




/**
 * 🔒 GLOBAL RIGHTS HANDLER - FINAL STABLE VERSION
 */
//(function () {
//    const CONFIG = {
//        API_BASE: "/api/master/userrights",
//        selectors: {
//            create: [".btn-add", "#btnAdd", ".add-new", ".btn-create", "[onclick*='Add']", "[onclick*='Create']", "[data-bs-target*='add']"],
//            update: [".btn-edit", ".fa-pencil", ".btn-info.sharp", ".sharp.me-1", "[onclick*='edit']", "[onclick*='Edit']", "a[href*='Entry?id=']", "#btnSave"],
//            delete: [".btn-delete", ".btn-danger.sharp", ".fa-trash", "[onclick*='delete']", "[onclick*='Delete']", "#btnDelete"]
//        }
//    };

//    async function initializeSecurity() {
//        const userId = typeof getUserId === "function" ? getUserId() : null;
//        if (!userId) return;

//        // 🛡️ ADMIN BYPASS: If user is Admin, do not hide anything
//        const userRole = typeof getUserRole === "function" ? getUserRole().toLowerCase() : "";
//        if (userRole.includes("admin") || userRole.includes("administrator") || userRole === "super") {
//            console.log("Security Shield: Admin detected, full access granted.");
//            return;
//        }

//        try {
//            // 1. Fetch data
//            const res = await apiFetch(`${CONFIG.API_BASE}/get-permissions/${userId}`);
//            const json = await res.json();
//            const permissions = json.data || [];
//            const path = window.location.pathname.toLowerCase();

//            // 2. Find target page
//            const pageRight = permissions.find(p => {
//                const u = (p.PageUrl || p.pageUrl || "").toLowerCase();
//                return u && (path.includes(u) || u.includes(path));
//            });

//            if (!pageRight) return;

//            // 3. Extract rights
//            const rights = {
//                canCreate: pageRight.CanCreate ?? pageRight.canCreate,
//                canEdit: pageRight.CanEdit ?? pageRight.canEdit,
//                canDelete: pageRight.CanDelete ?? pageRight.canDelete
//            };

//            const applyShield = () => {
//                // 🛡️ FIX: Use == false to catch 0, false, or null from database
//                if (rights.canCreate == false) hideElements(CONFIG.selectors.create);
//                if (rights.canEdit == false) hideElements(CONFIG.selectors.update);
//                if (rights.canDelete == false) hideElements(CONFIG.selectors.delete);

//                // EXTRA: Special check for "Add/Create" button text
//                if (rights.canCreate == false) {
//                    document.querySelectorAll('.btn-primary, .btn').forEach(btn => {
//                        const txt = btn.innerText.toLowerCase();
//                        if (txt.includes('add') || txt.includes('create')) {
//                            btn.style.setProperty("display", "none", "important");
//                        }
//                    });
//                }
//            };

//            applyShield();
//            const observer = new MutationObserver(applyShield);
//            observer.observe(document.body, { childList: true, subtree: true });

//        } catch (err) {
//            console.error("Security Shield Error:", err);
//        }
//    }

//    function hideElements(list) {
//        list.forEach(sel => {
//            try {
//                document.querySelectorAll(sel).forEach(el => {
//                    // Triple-layer hiding to be 100% sure
//                    el.style.setProperty("display", "none", "important");
//                    el.hidden = true;
//                    el.classList.add('d-none');
//                });
//            } catch (e) { /* ignore invalid selectors */ }
//        });
//    }

//    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeSecurity);
//    else initializeSecurity();
//})();
