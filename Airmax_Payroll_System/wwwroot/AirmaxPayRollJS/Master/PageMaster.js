const API = "/api/master/pagemaster";
let entryModal = null;

const DOM = {
    id: () => document.getElementById("PageId"),
    pageName: () => document.getElementById("PageName"),
    pageUrl: () => document.getElementById("PageUrl"),
    isActive: () => document.getElementById("IsActive"),
    save: () => document.getElementById("btnSave"),
    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal")
};

document.addEventListener("DOMContentLoaded", async () => {
    await bindTable();

    $('#pageList').DataTable({
        lengthChange: true,
        searching: true,
        pageLength: 10,
        ordering: false,
        language: {
            paginate: {
                next: '<i class="fa fa-angle-double-right"></i>',
                previous: '<i class="fa fa-angle-double-left"></i>'
            }
        }
    });

    entryModal = new bootstrap.Modal(DOM.modal(), { backdrop: "static" });
    DOM.modal().addEventListener("hidden.bs.modal", clearForm);
    DOM.save().addEventListener("click", saveData);
});

async function bindTable() {
    try {
        const res = await apiFetch(`${API}/get-all`);
        const json = await res.json();
        if (!json.success) return;

        const tbody = DOM.tbody();
        tbody.innerHTML = json.data.map(d => `
            <tr>
                <td>${d.pageId}</td>
                <td class="fw-bold">${escapeHtml(d.pageName)}</td>
                <td><code class="text-primary">${escapeHtml(d.pageUrl || "")}</code></td>
                <td class="text-center">
                    <span class="badge ${d.isActive ? 'bg-success' : 'bg-danger'}">${d.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td class="text-center">
                    <div class="d-flex justify-content-center">
                        <a href="javascript:void(0)" onclick="editEntry(${d.pageId})" class="btn btn-primary shadow btn-xs sharp me-1"><i class="fa fa-pencil"></i></a>
                        <a href="javascript:void(0)" onclick="deleteEntry(${d.pageId})" class="btn btn-danger shadow btn-xs sharp"><i class="fa fa-trash"></i></a>
                    </div>
                </td>
            </tr>`).join("");
    } catch (err) { showToast("danger", "Failed to load table", "Page Master"); }
}

async function editEntry(id) {
    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await res.json();
    const d = json.data;
    DOM.id().value = d.pageId;
    DOM.pageName().value = d.pageName;
    DOM.pageUrl().value = d.pageUrl || "";
    DOM.isActive().checked = d.isActive;
    entryModal.show();
}

async function saveData() {
    const dto = {
        PageId: Number(DOM.id().value || 0),
        PageName: DOM.pageName().value.trim(),
        PageUrl: DOM.pageUrl().value.trim().toLowerCase(),
        IsActive: DOM.isActive().checked
    };
    try {
        const res = await apiFetch(`${API}/save`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dto) });
        const json = await res.json();
        if (json.result > 0) {
            showToast("success", json.message);
            entryModal.hide();
            location.reload();
        }
    } catch (e) { showToast("danger", "Error saving"); }
}

async function deleteEntry(id) {
    const ok = await confirmDelete("This will remove the page from the system!");
    if (!ok) return;
    const res = await apiFetch(`${API}/delete/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.result > 0) { showToast("success", json.message); location.reload(); }
}

function clearForm() {
    DOM.id().value = 0;
    DOM.pageName().value = "";
    DOM.pageUrl().value = "";
    DOM.isActive().checked = true;
}
