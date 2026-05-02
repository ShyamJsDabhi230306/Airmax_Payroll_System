/**
 * PayConfig JavaScript
 * Handles API configuration and connection testing
 */

function togglePassword(id) {
    const input = document.getElementById(id);
    const btn = input.nextElementSibling;
    if (input.type === "password") {
        input.type = "text";
        btn.textContent = "Hide";
    } else {
        input.type = "password";
        btn.textContent = "Show";
    }
}

function copyToClipboard(id) {
    const input = document.getElementById(id);
    input.select();
    document.execCommand("copy");
    
    // Optional: Show a toast or feedback
    alert("Endpoint copied to clipboard!");
}

function copyPullUrl() {
    const baseUrl = document.getElementById('BaseUrl').value;
    const endpoint = document.getElementById('Endpoint').value;
    const fullUrl = baseUrl + endpoint;
    
    navigator.clipboard.writeText(fullUrl).then(() => {
        alert("Full Pull URL copied: " + fullUrl);
    });
}

function testConnection() {
    const statusEl = document.getElementById('testStatus');
    statusEl.innerHTML = '<span class="text-primary"><i class="fas fa-spinner fa-spin me-2"></i>Testing...</span>';
    
    // Simulate API call
    setTimeout(() => {
        statusEl.innerHTML = 'Last test: <span class="text-success">200 OK</span> - <span class="text-muted">145ms</span>';
    }, 1500);
}

function saveAll() {
    // Collect data
    const configData = {
        BaseUrl: document.getElementById('BaseUrl').value,
        AccountName: document.getElementById('AccountName').value,
        ApiKey: document.getElementById('ApiKey').value,
        Endpoint: document.getElementById('Endpoint').value,
        Timeout: document.getElementById('Timeout').value,
        RetryAttempts: document.getElementById('RetryAttempts').value,
        RetryBackoff: document.getElementById('RetryBackoff').value
    };
    
    console.log("Saving Configuration:", configData);
    
    // Show loading on button
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
    btn.disabled = true;
    
    // Simulate save
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert("Configuration saved successfully!");
    }, 1000);
}

// Initialize tooltips or other UI elements
document.addEventListener('DOMContentLoaded', function() {
    console.log("PayConfig UI Initialized");
});
