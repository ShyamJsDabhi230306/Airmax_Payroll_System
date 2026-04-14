/**
 * ============================================================
 *  PERMISSION GUARD  —  Airmax Payroll System
 * ============================================================
 *  This single file handles ALL permission errors globally.
 *  Just include it in _Layout.cshtml and it works everywhere.
 * ============================================================
 */

// ============================================================
// STEP 1: Inject the 403 Overlay HTML + CSS into the page
// ============================================================
(function injectOverlay() {

    // --- CSS ---
    const style = document.createElement("style");
    style.textContent = `
        #pg-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.80);
            z-index: 999999;
            align-items: center;
            justify-content: center;
        }
        #pg-overlay.pg-show {
            display: flex;
        }
        #pg-box {
            background: #ffffff;
            border-radius: 20px;
            padding: 52px 44px;
            text-align: center;
            max-width: 460px;
            width: 90%;
            box-shadow: 0 24px 80px rgba(0,0,0,0.45);
            animation: pgSlide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes pgSlide {
            from { opacity: 0; transform: scale(0.75); }
            to   { opacity: 1; transform: scale(1); }
        }
        #pg-icon {
            font-size: 64px;
            margin-bottom: 12px;
        }
        #pg-title {
            font-size: 26px;
            font-weight: 800;
            color: #c0392b;
            margin: 0 0 10px 0;
            letter-spacing: -0.5px;
        }
        #pg-message {
            font-size: 15px;
            color: #555;
            margin: 0 0 24px 0;
            line-height: 1.6;
        }
        #pg-countdown-box {
            background: #fff5f5;
            border: 1px solid #f5c6cb;
            border-radius: 10px;
            padding: 12px 20px;
            font-size: 14px;
            color: #888;
        }
        #pg-countdown-box strong {
            color: #c0392b;
            font-size: 18px;
        }
    `;
    document.head.appendChild(style);

    // --- HTML ---
    document.addEventListener("DOMContentLoaded", function () {
        const overlay = document.createElement("div");
        overlay.id = "pg-overlay";
        overlay.innerHTML = `
            <div id="pg-box">
                <div id="pg-icon">🔒</div>
                <h2 id="pg-title">Access Denied</h2>
                <p id="pg-message">
                    Oh Dear! You do not have the right to perform this action.<br/>
                    Please contact your administrator.
                </p>
                <div id="pg-countdown-box">
                    Going back in <strong id="pg-seconds">3</strong> second(s)...
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    });

})();


// ============================================================
// STEP 2: The show403() function — call this from anywhere
// ============================================================
function show403(customMessage) {
    const overlay = document.getElementById("pg-overlay");
    const msgEl = document.getElementById("pg-message");
    const secEl = document.getElementById("pg-seconds");

    if (!overlay) return;

    // Set custom message if provided
    if (customMessage && msgEl) {
        msgEl.innerHTML = customMessage;
    }

    // Show overlay
    overlay.classList.add("pg-show");

    // Countdown 3 → 2 → 1 → hide
    let seconds = 3;
    if (secEl) secEl.textContent = seconds;

    const timer = setInterval(function () {
        seconds--;
        if (secEl) secEl.textContent = seconds;

        if (seconds <= 0) {
            clearInterval(timer);
            overlay.classList.remove("pg-show");
        }
    }, 1000);
}


// ============================================================
// STEP 3: apiFetch — handles ALL API calls with auth token
//         401 → redirect to login
//         403 → show 403 overlay, return null
// ============================================================
async function apiFetch(url, options = {}) {
    // Standardized token name: auth_token
    const token = localStorage.getItem("auth_token");

    options.headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, options);
    // 🛡️ GLOBAL SAFE OBJECT: Prevents "null.json()" crashes
    const safeObject = {
        ok: false,
        status: response.status,
        json: async () => ({ success: false, data: [] }), // Returns empty data so it doesn't crash
        text: async () => ""
    };
    if (response.status === 401) {
        clearAuthData();
        window.location.href = "/Account/Login";
        return safeObject; // ✅ Changed from null to safeObject
    }
    if (response.status === 403) {
        show403("You do not have the right to perform this action.");
        return safeObject; // ✅ Changed from null to safeObject
    }
    return response;
}


// ============================================================
// STEP 4: Helper to CLEAR ALL auth data (LocalStorage & Cookie)
// ============================================================
function clearAuthData() {
    // Clear LocalStorage (handle all known naming variations)
    localStorage.removeItem("auth_token");
    localStorage.removeItem("jwtToken"); 
    localStorage.removeItem("UserData");
    localStorage.removeItem("Username");
    localStorage.clear();

    // Clear Cookies (handle all known naming variations)
    document.cookie = "jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}


// ============================================================
// STEP 5: logoutUser — The global sign-out function
// ============================================================
function logoutUser() {
    if (typeof Swal === 'undefined') {
        if (confirm("Are you sure you want to sign out?")) {
            clearAuthData();
            window.location.href = "/Account/Login";
        }
        return;
    }

    Swal.fire({
        icon: "warning",
        title: "Logout?",
        text: "Are you sure you want to sign out?",
        showCancelButton: true,
        confirmButtonText: "Yes, Logout",
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancel"
    }).then(result => {
        if (!result.isConfirmed) return;

        clearAuthData();
        
        showToast("info", "Logged out successfully!");
        setTimeout(() => {
            window.location.href = "/Account/Login";
        }, 700);
    });
}


// ============================================================
// STEP 4: Global deleteEntry wrapper
//         Use this if you don't want to write the same
//         delete code in every module
// ============================================================
async function globalDelete(apiUrl, label, onSuccess) {
    const ok = await confirmDelete("This record will be deleted permanently!");
    if (!ok) return;

    const res = await apiFetch(apiUrl, { method: "DELETE" });
    if (!res) return; // null = 401 or 403, already handled

    const json = await res.json();

    if (!json.success) {
        showToast("danger", json.message, label);
        return;
    }

    showToast("success", json.message, label);
    if (typeof onSuccess === "function") onSuccess();
}
 