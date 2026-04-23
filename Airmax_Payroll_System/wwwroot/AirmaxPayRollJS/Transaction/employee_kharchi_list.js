
/**
 * 📜 MASTER KHARCHI HISTORY LIST
 */
const API = "/api/transaction/kharchi";
let voucherDetails = {};

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Set Default Date
    const now = new Date();
    const defaultDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthInput = document.getElementById("txtMonthFilter");
    if (monthInput) monthInput.value = defaultDate;

    // 2. Load Filters
    await loadDivisions();

    // 3. Initial Load
    await loadHistory();

    // 4. Attach Event Listeners (This replaces the "onchange" in HTML)
    document.getElementById("ddlDivisionFilter")?.addEventListener("change", loadHistory);
    document.getElementById("txtMonthFilter")?.addEventListener("change", loadHistory);

    // Use debounce for search to prevent blinking while typing
    const searchInput = document.getElementById("txtSearchFilter");
    if (searchInput) {
        searchInput.addEventListener("input", debounce(loadHistory, 500));
    }
});

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function loadDivisions() {
    const res = await apiFetch(`${API}/get-divisions-with-count`);
    const json = await res.json();
    if (json.success) {
        document.getElementById("ddlDivisionFilter").innerHTML = `<option value="0">All Divisions</option>` +
            json.data.map(d => `<option value="${d.idDivision || d.IDDivision}">${d.divisionName || d.DivisionName}</option>`).join("");
    }
}

async function loadHistory() {
    const divId = document.getElementById("ddlDivisionFilter")?.value || 0;
    const monthVal = document.getElementById("txtMonthFilter")?.value || "";
    const search = document.getElementById("txtSearchFilter")?.value.trim() || "";

    let month = 0, year = 0;
    if (monthVal) {
        const parts = monthVal.split("-");
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
    }

    const res = await apiFetch(`${API}/get-all?idDivision=${divId}&month=${month}&year=${year}&search=${encodeURIComponent(search)}`);
    const json = await res.json();

    if (json.success) {
        bindTable(json.data || []);
    }
}

async function bindTable(data) {
    const tbody = document.getElementById("tblBody");
    if (!tbody) return;

    if ($.fn.DataTable.isDataTable('#tblKharchiList')) {
        $('#tblKharchiList').DataTable().destroy();
    }
    tbody.innerHTML = "";

    data.forEach(v => {
        const id = v.idEmployeeKharchi || v.IDEmployeeKharchi || 0;
        const tr = document.createElement("tr");
        tr.className = "align-middle border-bottom voucher-header-row";
        tr.setAttribute("data-id", id);

        tr.innerHTML = `
            <td class="text-center">
                <i class="fas fa-plus-circle text-primary btn-expand" style="cursor:pointer"></i>
            </td>
            <td class="fw-bold text-primary">${v.kharchiNo || v.KharchiNo}</td>
            <td><small class="text-muted d-block text-truncate" style="max-width:30vw;">${v.departmentNames || v.DepartmentNames || ''}</small></td>
            <td class="text-center">${v.totalEmployees || v.TotalEmployees || 0}</td>
            <td class="text-end fw-bold text-success pe-3">₹ ${Number(v.totalAmount || v.TotalAmount).toLocaleString('en-IN')}</td>
            <td class="text-end pe-4 text-muted small">${new Date(v.kharchiDate || v.KharchiDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
        `;
        tbody.appendChild(tr);
    });

    const table = $('#tblKharchiList').DataTable({
        searching: false,
        pageLength: 10,
        ordering: false,
        language: {
            paginate: {
                next: '<i class="fa fa-angle-double-right"></i>',
                previous: '<i class="fa fa-angle-double-left"></i>'
            }
        }
    });

    $('#tblKharchiList tbody').off('click').on('click', 'td .btn-expand', function () {
        const tr = $(this).closest('tr');
        const row = table.row(tr);
        const id = tr.attr("data-id");

        if (row.child.isShown()) {
            row.child.hide();
            $(this).removeClass('fa-minus-circle text-danger').addClass('fa-plus-circle text-primary');
        } else {
            row.child(`<div id="container-${id}" class="p-3 bg-light expanded-container shadow-sm rounded"><div class="p-4 text-center text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div></div>`).show();
            $(this).removeClass('fa-plus-circle text-primary').addClass('fa-minus-circle text-danger');
            loadVoucherDetails(id);
        }
    });
}

async function loadVoucherDetails(id) {
    if (!voucherDetails[id]) {
        const res = await apiFetch(`${API}/get-by-id/${id}`);
        const json = await res.json();
        if (json.success) {
            const grouped = {};
            json.data.details.forEach(e => {
                const dept = e.departmentName || "General";
                if (!grouped[dept]) grouped[dept] = { name: dept, total: 0, items: [] };
                grouped[dept].items.push(e);
                grouped[dept].total += (e.amount || 0);
            });
            voucherDetails[id] = Object.values(grouped);
            renderVoucherDetails(id);
        }
    } else {
        renderVoucherDetails(id);
    }
}

function renderVoucherDetails(vId) {
    const depts = voucherDetails[vId];
    const cont = document.getElementById(`container-${vId}`);
    if (!depts || !cont) return;

    cont.innerHTML = depts.map(d => `
        <div class="bg-white border-bottom">
            <div class="bg-light p-2 px-4 fw-bold d-flex justify-content-between align-items-center" style="font-size: 11px;">
                <span class="text-uppercase text-muted">${d.name} <small class="fw-normal">(${d.items.length} employees)</small></span>
                <span class="text-success">₹ ${Number(d.total).toLocaleString('en-IN')}</span>
            </div>
            <div class="px-3 py-2">
                <table class="table table-sm table-borderless mb-0" style="font-size: 12px;">
                    <tbody>
                        ${d.items.map((emp, j) => `
                        <tr>
                            <td width="30" class="text-muted">${j + 1}</td>
                            <td class="fw-bold text-dark">${emp.employeeName}</td>
                            <td class="text-muted">${emp.employeeCode}</td>
                            <td class="text-end pe-3">₹ ${(emp.amount || 0).toLocaleString('en-IN')}</td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>
        </div>`).join("");
}
