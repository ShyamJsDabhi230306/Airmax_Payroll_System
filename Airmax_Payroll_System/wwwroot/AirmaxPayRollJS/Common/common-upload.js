async function uploadFile(input, folder) {

    let file = null;

    // ✅ NEW: support File object (Dropzone)
    if (input instanceof File) {
        file = input;
    }
    else if (typeof input === "string") {
        file = document.querySelector(input)?.files?.[0] || null;
    }
    else if (input instanceof HTMLInputElement) {
        file = input.files?.[0] || null;
    }

    if (!file) return null;

    const form = new FormData();
    form.append("file", file);

    let responseText = "";
    try {
        const response = await fetch(`/api/upload/${folder}`, {
            method: "POST",
            body: form
        });

        responseText = await response.text();
    }
    catch (err) {
        console.error("Upload error:", err);
        showToast("danger", "File upload failed — network error");
        return null;
    }

    let json = null;
    try {
        json = JSON.parse(responseText);
    }
    catch {
        console.error("Invalid upload response:", responseText);
        showToast("danger", "Invalid server response during upload");
        return null;
    }

    if (!json.success) {
        showToast("danger", json.message || "File upload failed");
        return null;
    }

    return json.data;
}
