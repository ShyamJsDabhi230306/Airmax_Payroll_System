// 🔐 If already logged in, block login page
(async function () {

    const token = localStorage.getItem("auth_token");
    const data = localStorage.getItem("UserData");

    if (!token || !data) return;

    try {
        const res = await fetch("/api/auth/validate", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("UserData");
            localStorage.clear();
            window.location.href = "/Account/Login";
            return;
        }



        const role = JSON.parse(data).role;
        redirectByRole(role);

    } catch (e) {
        console.warn("JWT expired or invalid");

        // 🔴 force logout
        localStorage.removeItem("auth_token");
        localStorage.removeItem("UserData");

        window.location.href = "/Account/Login";
    }

})();


document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const userName = document.getElementById("ic-username").value.trim();
        const password = document.getElementById("ic-password").value.trim();

        if (!userName || !password) {
            Swal.fire({
                icon: "warning",
                title: "Missing Details",
                text: "Username and password are required",
                confirmButtonText: "OK"
            });
            return;
        }

        // 🔄 Loading
        Swal.fire({
            title: "Signing in...",
            text: "Please wait",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch("/api/master/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userName: userName,
                    password: password
                })
            });

            let result;

            const text = await response.text();

            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error("Raw response:", text);

                Swal.fire({
                    icon: "error",
                    title: "Server Error",
                    text: "Unexpected server response. Check API logs."
                });
                return;
            }

            if (!result.success) {
                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: result.message || "Invalid username or password"
                });
                return;
            }

            const loginData = result.data;

            // ----------------------------
            // STORE TOKEN
            // ----------------------------
            if (loginData.token) {

                localStorage.setItem("auth_token", loginData.token);
                localStorage.setItem("UserData", JSON.stringify(loginData.user));

                setJwtCookie(loginData.token, loginData.expiresAt);
            }

            // ----------------------------
            // SUCCESS
            // ----------------------------
            Swal.fire({
                icon: "success",
                title: "Welcome!",
                text: "Login successful",
                timer: 1200,
                showConfirmButton: false
            }).then(() => {
                history.replaceState(null, "", location.href);
                redirectByRole(loginData.user.role);
            });

        } catch (err) {
            console.error("Login error", err);
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Unable to login. Please try again later."
            });
        }
    });

});

// -------------------------------------------------
// COOKIE HELPER
// -------------------------------------------------
function setJwtCookie(token, expiresAt) {

    let expires = "";

    if (expiresAt) {
        const date = new Date(expiresAt);
        expires = "; expires=" + date.toUTCString();
    }

    document.cookie =
        "jwt_token=" + token +
        expires +
        "; path=/; SameSite=Lax";
}

// -------------------------------------------------
// ROLE BASED REDIRECT
// -------------------------------------------------
function redirectByRole(role) {

    role = (role || "").toLowerCase();

    switch (role) {
        case "admin":
            window.location.href = "/home/index";
            break;

        case "rms":
            window.location.href = "/DRS/ManageRMS";
            break;

        case "tdr":
            window.location.href = "/DRS/ManageTdr";
            break;

        case "hod":
            window.location.href = "/DRS/HodList";
            break;

        case "design":
            window.location.href = "/DRS/DesignerView";
            break;

        case "user":
            window.location.href = "/drs/ManageUser";
            break;

        default:
            window.location.href = "/";
            break;
    }
}
