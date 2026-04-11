// 🔐 If already logged in, block login page
(async function () {
    const token = localStorage.getItem("auth_token");
    const data = localStorage.getItem("UserData");

    if (!token || !data) return;

    try {
        const res = await fetch("/api/master/user/get-all", { // Basic check
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        });

        if (!res.ok) {
            clearAuthData();
            return;
        }

        const role = JSON.parse(data).role;
        redirectByRole(role);

    } catch (e) {
        clearAuthData();
    }
})();

function clearAuthData() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("UserData");
    localStorage.clear();
    document.cookie = "jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const userName = document.getElementById("ic-username").value.trim();
        const password = document.getElementById("ic-password").value.trim();

        if (!userName || !password) {
            Swal.fire({ icon: "warning", title: "Missing Details", text: "Username and password are required" });
            return;
        }

        Swal.fire({
            title: "Signing in...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const response = await fetch("/api/master/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName, password })
            });

            const result = await response.json();

            if (!result.success) {
                Swal.fire({ icon: "error", title: "Login Failed", text: result.message });
                return;
            }

            const loginData = result.data;

            // --- SAVE TO STORAGE & COOKIE ---
            localStorage.setItem("auth_token", loginData.token);
            localStorage.setItem("UserData", JSON.stringify(loginData.user));
            
            setJwtCookie(loginData.token, loginData.expiresAt);

            // --- REDIRECT ---
            Swal.fire({
                icon: "success",
                title: "Welcome!",
                text: "Login successful",
                timer: 1000,
                showConfirmButton: false
            }).then(() => {
                const params = new URLSearchParams(window.location.search);
                const returnUrl = params.get("ReturnUrl");

                if (returnUrl) {
                    window.location.href = returnUrl;
                } else {
                    redirectByRole(loginData.user.role);
                }
            });

        } catch (err) {
            Swal.fire({ icon: "error", title: "Server Error", text: "Unable to login. Try again later." });
        }
    });
});

function setJwtCookie(token, expiresAt) {
    let expires = "";
    if (expiresAt) {
        const date = new Date(expiresAt);
        expires = "; expires=" + date.toUTCString();
    }
    // Cross-browser compatible cookie setting
    document.cookie = `jwt_token=${token}${expires}; path=/; SameSite=Lax`;
}

function redirectByRole(role) {
    role = (role || "").toLowerCase();
    window.location.href = "/Home/Index"; // Default dashboard for now
}
