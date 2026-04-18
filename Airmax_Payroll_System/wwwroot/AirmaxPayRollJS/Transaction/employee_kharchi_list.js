/**
 * 📜 HISTORY LIST - (Single Expandable View like Entry Form)
 */
const API = "/api/transaction/kharchi";

let voucherDetails = {};
let expandedVouchers = new Set();

document.addEventListener("DOMContentLoaded", async () => {
    await loadDivisions();
    loadHistory();
});

async function loadDivisions() {
    const res = await apiFetch(`${API}/get-divisions-with-count`);
    const json = await res.json();
    if (json.success) {
        document.getElementById("ddlDivisionFilter").innerHTML = `<option value="0">-- All Divisions --</option>` +
            json.data.map(d => `<option value="${d.idDivision || d.IDDivision}">${d.divisionName || d.DivisionName}</option>`).join("");
    }
}

async function loadHistory() {
    const divId = document.getElementById("ddlDivisionFilter")?.value || 0;
    const res = await apiFetch(`${API}/get-all?idDivision=${divId}`);
    const json = await res.json();

    const tbody = document.getElementById("tblBody");
    if (json.success && json.data.length > 0) {
        tbody.innerHTML = json.data.map((v) => {
            const id = v.idEmployeeKharchi || v.IDEmployeeKharchi;
            const isExp = expandedVouchers.has(id);
            return `
            <tr class="align-middle border-bottom table-light shadow-sm">
                <td class="text-center" onclick="toggleVoucher(${id})">
                    <i class="fas ${isExp ? 'fa-minus-circle text-danger' : 'fa-plus-circle text-primary'}" style="cursor:pointer"></i>
                </td>
                <td class="fw-bold">${v.kharchiNo || v.KharchiNo}</td>
                <td><span class="badge bg-soft-primary text-primary">${v.totalDepartments || v.TotalDepartments} Depts</span></td>
                <td class="text-center">${v.totalEmployees || v.TotalEmployees} Employees</td>
                <td class="text-end fw-bold text-success pe-4">₹ ${(v.totalAmount || v.TotalAmount).toLocaleString('en-IN')}</td>
                <td class="text-end pe-4 text-muted">
                    ${new Date(v.kharchiDate || v.KharchiDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </td>
            </tr>
            <tr id="exp-${id}" class="${isExp ? '' : 'd-none'}">
                <td colspan="6" class="p-0 border-0 bg-white">
                    <div id="container-${id}">
                        ${isExp && voucherDetails[id] ? '' : '<div class="p-4 text-center"><i class="fas fa-spinner fa-spin me-2"></i> Loading details...</div>'}
                    </div>
                </td>
            </tr>`;
        }).join("");

        expandedVouchers.forEach(vid => {
            if (voucherDetails[vid]) {
                renderVoucherDetails(vid);
            }
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5">No history found.</td></tr>`;
    }
}

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

// 🔥 NO SECOND EXPANSION: Show everything exactly like the Entry Form
function renderVoucherDetails(vId) {
    const depts = voucherDetails[vId];
    if (!depts) return;
    const cont = document.getElementById(`container-${vId}`);

    cont.innerHTML = depts.map(d => {
        return `
        <div class="bg-white border-bottom border-secondary border-1">
            <!-- DEPARTMENT HEADER ROW -->
            <div class="bg-light p-2 px-4 fw-bold d-flex justify-content-between align-items-center">
                <span>${d.name} <small class="text-muted fw-normal ms-1">(${d.items.length} employees)</small></span>
                <span class="text-success fs-6">₹ ${d.total.toLocaleString('en-IN')}</span>
            </div>
            
            <!-- EMPLOYEE TABLE (Matches Entry Form design) -->
            <div class="px-5 py-2 bg-white border-start border-primary border-4 ms-3 my-2 shadow-sm rounded">
                <table class="table table-sm table-borderless align-middle mb-0">
                    <thead class="text-muted small border-bottom">
                        <tr>
                            <th width="40" class="text-center">#</th>
                            <th>Employee Name</th>
                            <th>Code</th>
                            <th>Designation</th>
                            <th class="text-end">Amount</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${d.items.map((emp, j) => `
                        <tr>
                            <td class="text-center text-muted small">${j + 1}</td>
                            <td><span class="fw-bold">${emp.employeeName}</span></td>
                            <td class="text-muted">${emp.employeeCode}</td>
                            <td><small>${emp.DesignationName || '-'}</small></td>
                            <td class="text-end fw-bold">₹ ${emp.amount.toLocaleString('en-IN')}</td>
                            <td><span class="text-muted small">${emp.remarks || ''}</span></td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>
        </div>`;
    }).join("");
}
