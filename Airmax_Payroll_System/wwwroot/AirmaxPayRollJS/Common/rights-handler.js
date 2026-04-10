


//document.addEventListener("DOMContentLoaded", async function () {
//    const token = localStorage.getItem("auth_token");
//    const storedUser = localStorage.getItem("UserData");

//    if (!token || !storedUser) return;
//    const user = JSON.parse(storedUser);

//    // 🛡️ 1. ULTIMATE JS ADMIN BYPASS
//    const roleValue = (user.roleName || user.RoleName || user.rolename || user.role || "").toString().toLowerCase();
//    if (roleValue === "admin" || roleValue === "administrator") {
//        console.log("🔓 ADMIN Access: Showing all components.");
//        return;
//    }

//    try {
//        const userId = user.IDUser || user.idUser;
//        const response = await fetch(`/api/master/userrights/get-permissions/${userId}`, {
//            headers: { "Authorization": "Bearer " + token }
//        });
//        if (!response.ok) throw new Error("Security Alert: User data missing.");
//        const res = await response.json();

//        if (res.success && res.data) {
//            // 🛡️ 2. Hide Dashboard Menu items
//            const restricted = res.data.filter(p => !p.canView).map(p => p.pageName.trim().toLowerCase());
//            document.querySelectorAll("[data-menu]").forEach(li => {
//                const name = li.getAttribute("data-menu").trim().toLowerCase();
//                if (restricted.includes(name)) { li.remove(); }
//            });

//            // 🛡️ 3. Hide Page Buttons (Add/Edit/Delete)
//            const currentURL = window.location.pathname.toLowerCase();
//            const myRight = res.data.find(p => {
//                const pname = p.pageName.toLowerCase();
//                if (pname === "company master") return currentURL.includes("/company");
//                if (pname === "department master") return currentURL.includes("/department");
//                if (pname === "designation master") return currentURL.includes("/designation");
//                if (pname === "employee master") return currentURL.includes("/employee") && !currentURL.includes("loan") && !currentURL.includes("kharchi") && !currentURL.includes("group") && currentURL.includes("bonus");
//                if (pname === "employee loan") return currentURL.includes("loan");
//                if (pname === "employee kharchi") return currentURL.includes("kharchi");
//                if (pname === "employee group") return currentURL.includes("employeegroup") && !currentURL.includes("bonus");
//                if (pname === "location master") return currentURL.includes("location");
//                if (pname === "shift master") return currentURL.includes("shift");
//                if (pname === "user master") return currentURL.includes("user") && !currentURL.includes("rights");
//                if (pname === "user access management") return currentURL.includes("userrights");
//                return false;
//            });

//            if (myRight) {
//                if (!myRight.canCreate) document.querySelector("#btnAdd, .btn-add")?.remove();
//                if (!myRight.canEdit) document.querySelectorAll("#btnSave, .btn-edit, .me-1.sharp")?.forEach(e => e.remove());
//                if (!myRight.canDelete) document.querySelectorAll(".btn-delete, .sharp.btn-danger, .btn-del")?.forEach(e => e.remove());
//            }
//        }
//    } catch (e) {
//        console.error("Critical Security Failure:", e);
//    }
//});



document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("UserData");

    if (!token || !storedUser) return;
    const user = JSON.parse(storedUser);

    // 🛡️ 1. ADMIN BYPASS (Case Insensitive)
    const role = (user.roleName || user.RoleName || user.role || "").toLowerCase();
    if (role === "admin" || role === "administrator") {
        console.log("🔓 Administrator Mode Active");
        return;
    }

    try {
        const userId = user.IDUser || user.idUser;
        const response = await fetch(`/api/master/userrights/get-permissions/${userId}`, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Security Error");
        const res = await response.json();

        if (res.success && res.data) {
            const currentURL = window.location.pathname.toLowerCase();

            // 🛡️ 2. Identify Current Page Rights
            const myRight = res.data.find(p => {
                const pname = p.pageName.toLowerCase();
                if (pname === "company master") return currentURL.includes("/company");
                if (pname === "location master") return currentURL.includes("/location");
                if (pname === "department master") return currentURL.includes("/department");
                if (pname === "designation master") return currentURL.includes("/designation");
                if (pname === "shift master") return currentURL.includes("/shift");
                if (pname === "employee master") return currentURL.includes("/employee") && !currentURL.includes("loan") && !currentURL.includes("kharchi") && !currentURL.includes("group");
                if (pname === "employee group") return currentURL.includes("employeegroup") && !currentURL.includes("bonus");
                if (pname === "group bonus details") return currentURL.includes("employeegroupbonusdetails");
                if (pname === "user master") return currentURL.includes("/user") && !currentURL.includes("rights");
                if (pname === "user access management") return currentURL.includes("userrights");
                if (pname === "employee kharchi") return currentURL.includes("kharchi");
                if (pname === "employee loan") return currentURL.includes("loan");
                return false;
            });

            // 🛡️ 3. Redirect if Unauthorized View
            if (myRight && !myRight.canView) {
                window.location.href = "/Account/AccessDenied";
                return;
            }

            // 🛡️ 4. Show/Hide Menu Items
            const restrictedRaw = res.data.filter(p => !p.canView).map(p => p.pageName.trim().toLowerCase());
            document.querySelectorAll("[data-menu]").forEach(li => {
                const name = li.getAttribute("data-menu").trim().toLowerCase();
                if (restrictedRaw.includes(name)) { li.style.display = 'none'; li.remove(); }
            });

            // 🛡️ 5. Hide Action Buttons
            if (myRight) {
                if (!myRight.canCreate) document.querySelectorAll("#btnAdd, .btn-add, .add-new").forEach(e => e.remove());
                if (!myRight.canEdit) document.querySelectorAll("#btnSave, .btn-edit, .sharp.me-1").forEach(e => e.remove());
                if (!myRight.canDelete) document.querySelectorAll(".btn-delete, .sharp.btn-danger, .btn-del").forEach(e => e.remove());
            }
        }
    } catch (e) {
        console.error("Security Shield Error:", e);
    }
});
