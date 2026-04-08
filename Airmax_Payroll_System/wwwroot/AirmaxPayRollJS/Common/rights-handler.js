///**
// * 🛰️ Global User Rights Handler
// * Automatically hides sidebar menus and on-page buttons based on the user's DB permissions.
// */
//document.addEventListener("DOMContentLoaded", async function () {

//    // 🛡️ 1. Get Security Data (Token & User Info)
//    const token = localStorage.getItem("auth_token");
//    const storedUser = localStorage.getItem("UserData");

//    if (!token || !storedUser) return;

//    const user = JSON.parse(storedUser);

//    // 🛡️ 2. ADMIN BYPASS (Administrators see everything)
//    const roleName = (user.roleName || user.RoleName || "").toLowerCase();
//    if (roleName === "admin" || roleName === "administrator") return;

//    try {
//        const userId = user.IDUser || user.idUser;

//        // 🛡️ 3. FETCH FULL PERMISSIONS FROM API
//        // This hits the get-permissions API we exempted in the Middleware
//        const response = await fetch(`/api/master/userrights/get-permissions/${userId}`, {
//            headers: {
//                "Authorization": "Bearer " + token,
//                "Content-Type": "application/json"
//            }
//        });

//        if (!response.ok) throw new Error("Security Fetch Failed");

//        const res = await response.json();

//        if (res.success && res.data) {

//            // 🛡️ 4. FIND RESTRICTED PAGES (p.canView is false)
//            const restricted = res.data
//                .filter(p => p.canView === false)
//                .map(p => p.pageName.trim().toLowerCase());

//            // Coat 5. SIDEBAR HIDING
//            document.querySelectorAll("[data-menu]").forEach(li => {
//                const name = li.getAttribute("data-menu").trim().toLowerCase();

//                if (restricted.includes(name)) {
//                    li.style.setProperty("display", "none", "important"); // 🔥 Hide it!
//                    li.remove(); // ✂️ Completely remove it!
//                }
//            });

//            // 🛡️ 6. ON-PAGE BUTTONS PROTECTION (Hide Add/Edit/Delete buttons)
//            const currentPath = window.location.pathname.toLowerCase();

//            // Map the current page path to the right permission
//            const myRight = res.data.find(p => {
//                const pname = p.pageName.toLowerCase();

//                if (pname === "company master") return currentPath.includes("company");
//                if (pname === "department master") return currentPath.includes("department");
//                if (pname === "designation master") return currentPath.includes("designation");
//                if (pname === "employee master") return currentPath.includes("employee") && !currentPath.includes("group");
//                if (pname === "employee group") return currentPath.includes("employeegroup") && !currentPath.includes("bonus");
//                if (pname === "group bonus details") return currentPath.includes("employeegroupbonusdetails");
//                if (pname === "location master") return currentPath.includes("location");
//                if (pname === "shift master") return currentPath.includes("shift");
//                if (pname === "user master") return currentPath.includes("user") && !currentPath.includes("rights");
//                if (pname === "user access management") return currentPath.includes("userrights");
//                if (pname === "employee kharchi") return currentPath.includes("transactionemployeekharchi");
//                if (pname === "employee loan") return currentPath.includes("transactionemployeeloan");

//                return false;
//            });

//            if (myRight) {
//                // 🛡️ IF ANY PERMISSION IS MISSING, REMOVE BUTTON
//                if (!myRight.canCreate) document.querySelectorAll(".btn-add, .add-new, #btnAdd").forEach(e => e.remove());
//                if (!myRight.canEdit) document.querySelectorAll(".btn-edit, .sharp.me-1, #btnSave").forEach(e => e.remove());
//                if (!myRight.canDelete) document.querySelectorAll(".btn-delete, .sharp.btn-danger, .btn-del").forEach(e => e.remove());
//            }
//        }
//    } catch (e) {
//        console.error("Critical Security Failure in SideBar:", e);
//    }
//});


document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("UserData");

    if (!token || !storedUser) return;
    const user = JSON.parse(storedUser);

    // 🛡️ 1. ULTIMATE JS ADMIN BYPASS
    const roleValue = (user.roleName || user.RoleName || user.rolename || user.role || "").toString().toLowerCase();
    if (roleValue === "admin" || roleValue === "administrator") {
        console.log("🔓 ADMIN Access: Showing all components.");
        return;
    }

    try {
        const userId = user.IDUser || user.idUser;
        const response = await fetch(`/api/master/userrights/get-permissions/${userId}`, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Security Alert: User data missing.");
        const res = await response.json();

        if (res.success && res.data) {
            // 🛡️ 2. Hide Dashboard Menu items
            const restricted = res.data.filter(p => !p.canView).map(p => p.pageName.trim().toLowerCase());
            document.querySelectorAll("[data-menu]").forEach(li => {
                const name = li.getAttribute("data-menu").trim().toLowerCase();
                if (restricted.includes(name)) { li.remove(); }
            });

            // 🛡️ 3. Hide Page Buttons (Add/Edit/Delete)
            const currentURL = window.location.pathname.toLowerCase();
            const myRight = res.data.find(p => {
                const pname = p.pageName.toLowerCase();
                if (pname === "company master") return currentURL.includes("/company");
                if (pname === "department master") return currentURL.includes("/department");
                if (pname === "designation master") return currentURL.includes("/designation");
                if (pname === "employee master") return currentURL.includes("/employee") && !currentURL.includes("loan") && !currentURL.includes("kharchi") && !currentURL.includes("group") && currentURL.includes("bonus");
                if (pname === "employee loan") return currentURL.includes("loan");
                if (pname === "employee kharchi") return currentURL.includes("kharchi");
                if (pname === "employee group") return currentURL.includes("employeegroup") && !currentURL.includes("bonus");
                if (pname === "location master") return currentURL.includes("location");
                if (pname === "shift master") return currentURL.includes("shift");
                if (pname === "user master") return currentURL.includes("user") && !currentURL.includes("rights");
                if (pname === "user access management") return currentURL.includes("userrights");
                return false;
            });

            if (myRight) {
                if (!myRight.canCreate) document.querySelector("#btnAdd, .btn-add")?.remove();
                if (!myRight.canEdit) document.querySelectorAll("#btnSave, .btn-edit, .me-1.sharp")?.forEach(e => e.remove());
                if (!myRight.canDelete) document.querySelectorAll(".btn-delete, .sharp.btn-danger, .btn-del")?.forEach(e => e.remove());
            }
        }
    } catch (e) {
        console.error("Critical Security Failure:", e);
    }
});
