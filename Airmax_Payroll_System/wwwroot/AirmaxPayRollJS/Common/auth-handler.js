async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("auth_token");

    options.headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, options);
    
    if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/Account/Login";
        return null;
    }

    if (response.status === 403) {
        if (typeof showToast === 'function') {
            showToast("danger", "You do not have permission to perform this action.", "Access Denied");
        } else {
            alert("Access Denied: You do not have permission to perform this action.");
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
