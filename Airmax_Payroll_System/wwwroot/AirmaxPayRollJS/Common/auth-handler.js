
//async function apiFetch(url, options = {}) {
//    const token = localStorage.getItem("auth_token");

//    // 1. Initialize headers with Authorization
//    options.headers = {
//        "Authorization": `Bearer ${token}`,
//        ...options.headers
//    };

//    // 2. SMART CONTENT-TYPE HANDLING
//    if (options.body && options.body instanceof FormData) {
//        // 🛑 IMPORTANT: For file uploads, we MUST remove the Content-Type header.
//        // This allows the browser to automatically set "multipart/form-data".
//        delete options.headers["Content-Type"];
//        delete options.headers["content-type"];
//    }
//    else {
//        // For all other regular API calls (JSON), we keep it as application/json
//        options.headers["Content-Type"] = "application/json";
//    }

//    // 3. Perform the request
//    const response = await fetch(url, options);

//    // 4. Handle Authentication Errors (401 Unauthorized)
//    if (response.status === 401) {
//        localStorage.clear();
//        window.location.href = "/Account/Login";
//        return null;
//    }

//    // 5. Handle Permission Errors (403 Forbidden)
//    if (response.status === 403) {
//        if (typeof showToast === 'function') {
//            showToast("danger", "You do not have permission.", "Access Denied");
//        }
//    }

//    return response;
//}
async function apiFetch(url, options = {}) {
    options.credentials = "same-origin";

    options.headers = {
        ...options.headers
    };

    if (options.body && options.body instanceof FormData) {
        delete options.headers["Content-Type"];
        delete options.headers["content-type"];
    } else if (options.body) {
        options.headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/Account/Login";
        return null;
    }

    if (response.status === 403) {
        if (typeof showToast === "function") {
            showToast("danger", "You do not have permission.", "Access Denied");
        }
    }

    return response;
}
function logoutUser() {
    Swal.fire({
        icon: "warning",
        title: "Logout?",
        text: "Are you sure you want to sign out?",
        showCancelButton: true,
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Cancel"
    }).then(result => {

        if (!result.isConfirmed) return;

        // 🔥 CLEAR ALL LOGIN DATA
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("UserData");
        localStorage.removeItem("Username");

        localStorage.clear();
        document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        showToast("info", "Logged out successfully!");

        setTimeout(() => {
            window.location.href = "/Login";
        }, 700);

    });
}
