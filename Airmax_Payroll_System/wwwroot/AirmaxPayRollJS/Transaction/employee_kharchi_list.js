/**
 * 📜 HISTORY LIST - WITH CURRENT MONTH DEFAULT & FILTRATION
 */
const API = "/api/transaction/kharchi";

let voucherDetails = {};
let expandedVouchers = new Set();

document.addEventListener("DOMContentLoaded", async () => {
    // 🔥 1. SET DEFAULT TO CURRENT MONTH
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const defaultDate = `${year}-${month}`;

    const monthInput = document.getElementById("txtMonthFilter");
    if (monthInput) {
        monthInput.value = defaultDate;
    }

    // Load everything else
    await loadDivisions();
    loadHistory();
});

// Load all divisions for the filter dropdown
async function loadDivisions() {
    const res = await apiFetch(`${API}/get-divisions-with-count`);
    const json = await res.json();
    if (json.success) {
        document.getElementById("ddlDivisionFilter").innerHTML = `<option value="0">All Divisions</option>` +
            json.data.map(d => `<option value="${d.idDivision || d.IDDivision}">${d.divisionName || d.DivisionName}</option>`).join("");
    }
}

// Load main history table based on filters
async function loadHistory() {
    const divId = document.getElementById("ddlDivisionFilter")?.value || 0;
    const monthVal = document.getElementById("txtMonthFilter")?.value || "";
    const search = document.getElementById("txtSearchFilter")?.value || "";

    // 🔥 2. SPLIT DATE FOR BACKEND COMPATIBILITY
    let month = 0;
    let year = 0;
    if (monthVal) {
        const parts = monthVal.split("-");
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
    }

    // Send split month and year parameters
    const res = await apiFetch(`${API}/get-all?idDivision=${divId}&month=${month}&year=${year}&search=${search}`);
    const json = await res.json();

    const tbody = document.getElementById("tblBody");
    if (json.success && json.data.length > 0) {
        tbody.innerHTML = json.data.map((v) => {
            const id = v.idEmployeeKharchi || v.IDEmployeeKharchi;
            const isExp = expandedVouchers.has(id);
            return `
            <tr class="align-middle border-bottom shadow-sm">
                <td class="text-center" onclick="toggleVoucher(${id})">
                    <i class="fas ${isExp ? 'fa-minus-circle text-danger' : 'fa-plus-circle text-primary'}" style="cursor:pointer"></i>
                </td>
                <td class="fw-bold text-primary">${v.kharchiNo || v.KharchiNo}</td>
                <td>
                    <small class="text-muted text-wrap d-block" style="max-width: 25vw;">${v.departmentNames || v.DepartmentNames || ''}</small>
                </td>
                <td class="text-center">${v.totalEmployees || v.TotalEmployees}</td>
                <td class="text-end fw-bold text-success pe-4">₹ ${(v.totalAmount || v.TotalAmount).toLocaleString('en-IN')}</td>
                <td class="text-end pe-4 text-muted">
                    ${new Date(v.kharchiDate || v.KharchiDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </td>
            </tr>
            <tr id="exp-${id}" class="${isExp ? '' : 'd-none'}">
                <td colspan="6" class="p-0 border-0 bg-white">
                    <div id="container-${id}">
                        ${isExp && voucherDetails[id] ? '' : '<div class="p-4 text-center text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>'}
                    </div>
                </td>
            </tr>`;
        }).join("");

        expandedVouchers.forEach(vid => {
            if (voucherDetails[vid]) renderVoucherDetails(vid);
        });
    } else {
        // 🔥 3. SHOW EMPTY STATE IF NO DATA FOR SELECTED MONTH
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="text-muted mb-2"><i class="fas fa-calendar-times fa-3x"></i></div>
                    <div class="fw-bold">No Kharchi Records Found</div>
                    <small class="text-muted">No data saved for the selected month or filters.</small>
                </td>
            </tr>`;
    }
}

// Expand/Collapse logic
async function toggleVoucher(id) {
    if (expandedVouchers.has(id)) {
        expandedVouchers.delete(id);
        loadHistory();
    } else {
        expandedVouchers.add(id);
        loadHistory();

        if (!voucherDetails[id]) {
            const res = await apiFetch(`${API}/get-by-id/${id}`);
            const json = await res.json();
            if (json.success) {
                const grouped = {};
                json.data.details.forEach(e => {
                    const dept = e.departmentName || "Other";
                    if (!grouped[dept]) grouped[dept] = { name: dept, total: 0, items: [] };
                    grouped[dept].items.push(e);
                    grouped[dept].total += e.amount;
                });
                voucherDetails[id] = Object.values(grouped);
            }
        }
        loadHistory();
    }
}

function renderVoucherDetails(vId) {
    const depts = voucherDetails[vId];
    if (!depts) return;
    const cont = document.getElementById(`container-${vId}`);

    cont.innerHTML = depts.map(d => {
        return `
        <div class="bg-white border-bottom py-1">
            <div class="bg-light p-2 px-4 fw-bold d-flex justify-content-between align-items-center">
                <span class="small">${d.name} <small class="text-muted fw-normal ms-1">(${d.items.length} employees)</small></span>
                <span class="text-success small">₹ ${d.total.toLocaleString('en-IN')}</span>
            </div>
            <div class="px-5 py-2">
                <table class="table table-sm table-borderless align-middle mb-0" style="font-size:0.85rem">
                    <thead class="text-muted border-bottom">
                        <tr>
                            <th width="40" class="text-center">#</th>
                            <th>Employee Name</th>
                            <th>Code</th>
                            <th class="text-end">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${d.items.map((emp, j) => `
                        <tr>
                            <td class="text-center text-muted small">${j + 1}</td>
                            <td><span class="fw-bold text-dark">${emp.employeeName}</span></td>
                            <td class="text-muted">${emp.employeeCode}</td>
                            <td class="text-end fw-bold">₹ ${emp.amount.toLocaleString('en-IN')}</td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>
        </div>`;
    }).join("");
}
