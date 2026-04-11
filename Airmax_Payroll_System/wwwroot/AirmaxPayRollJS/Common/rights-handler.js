/* 🛡️ AIRMAX SECONDARY DATA-TABLE SHIELD */
document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("UserData");

    if (!token || !storedUser) return;
    const user = JSON.parse(storedUser);

    // Helper to get property regardless of casing
    const getProp = (obj, key) => {
        if (!obj) return null;
        return obj[key] ?? obj[key.charAt(0).toLowerCase() + key.slice(1)] ?? obj[key.toUpperCase()];
    };

    try {
        const userId = getProp(user, "IDUser");
        if (!userId) return;

        const response = await fetch(`/api/master/userrights/get-permissions/${userId}`, {
            headers: { "Authorization": "Bearer " + token }
        });
        const res = await response.json();

        if (res.success && res.data) {
            const permissions = res.data;
            
            // we only need current page rights for dynamic table button cleanup
            const myRight = permissions.find(p => {
                const pageName = getProp(p, "PageName");
                if (!pageName) return false;
                const normalizedPath = window.location.pathname.toLowerCase().replace(/-/g, "").replace(/\s+/g, "");
                const normalizedDBName = pageName.toLowerCase().replace(" master", "").trim().replace(/\s+/g, "");
                return normalizedPath.includes(normalizedDBName);
            });

            if (myRight) {
                // Secondary Guardian (Cleanup buttons in DataTables after they load)
                const cleanupDynamicButtons = () => {
                    const canCreate = getProp(myRight, "CanCreate");
                    const canEdit = getProp(myRight, "CanEdit");
                    const canDelete = getProp(myRight, "CanDelete");

                    document.querySelectorAll("a, button").forEach(el => {
                        const txt = el.textContent.toLowerCase().trim();
                        if ((canCreate === false || canCreate === 0) && (txt.includes("add ") || txt === "add" || txt.includes("create"))) {
                            el.style.setProperty("display", "none", "important");
                        }
                        if ((canEdit === false || canEdit === 0) && (txt === "edit" || txt === "update" || txt === "save")) {
                            el.style.setProperty("display", "none", "important");
                        }
                        if ((canDelete === false || canDelete === 0) && (txt === "delete" || txt === "remove")) {
                            el.style.setProperty("display", "none", "important");
                        }
                    });
                };

                cleanupDynamicButtons();
                new MutationObserver(cleanupDynamicButtons).observe(document.body, { childList: true, subtree: true });
            }
        }
    } catch (e) {
        console.error("Shield Secondary Layer Error:", e);
    }
});
