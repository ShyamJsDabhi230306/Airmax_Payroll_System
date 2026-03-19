// -----------------------------
// AUTH GUARD FOR BILLING POS
// -----------------------------

(function () {

    // 1️⃣ Get token from localStorage or sessionStorage
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

    if (!token) {
        redirectToLogin("Session expired. Please log in again.");
        return;
    }

    // 2️⃣ Decode JWT Payload
    function parseJwt(jwt) {
        try {
            const base64Url = jwt.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    const payload = parseJwt(token);

    if (!payload) {
        redirectToLogin("Invalid token. Please login again.");
        return;
    }

    // 3️⃣ Validate Expiry
    const now = Date.now() / 1000; // seconds

    if (payload.exp && payload.exp < now) {
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token");
        redirectToLogin("Your session has expired. Please login again.");
        return;
    }

    // 4️⃣ Make user information available globally
    window.currentUser = {
        userId: payload.UserId || payload.userid || payload.userId,
        username: payload.Username || payload.username,
        role: payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        token: token
    };

    console.log("Authenticated User:", window.currentUser);

    // 5️⃣ Helper for redirect
    function redirectToLogin(message) {
        Swal.fire("Authentication Required", message, "warning")
            .then(() => {
                window.location.href = "/account/login";
            });
    }

})();
