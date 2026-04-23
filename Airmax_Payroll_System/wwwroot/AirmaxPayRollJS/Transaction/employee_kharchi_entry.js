
/**
 * 📝 EMPLOYEE KHARCHI ENTRY - MASTER FILE (Includes Print & Excel)
 */
const API = "/api/transaction/kharchi";
let currentDivisionId = 0;
let currentDepartmentId = 0;
let currentEmployees = [];
let isCurrentDeptSaved = false;

document.addEventListener("DOMContentLoaded", async () => {
    initDate();
    generateNewVoucherNo();
    loadDivisionsForMonth();
});

function initDate() {
    const now = new Date();
    document.getElementById("txtKharchiDate").value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

async function generateNewVoucherNo() {
    const res = await apiFetch(`${API}/generate-no`);
    const json = await res.json();
    if (json.success) document.getElementById("txtKharchiNo").value = json.data;
}

// 1. Division List
async function loadDivisionsForMonth() {
    const tbody = document.getElementById("tblDivisionBody");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><i class="fas fa-spinner fa-spin me-2"></i> Loading Divisions...</td></tr>`;

    const res = await apiFetch(`${API}/get-divisions-with-count`);
    const json = await res.json();

    if (json.success && json.data && json.data.length > 0) {
        tbody.innerHTML = json.data.map(d => {
            const divId = d.idDivision || d.IDDivision;
            const divName = d.divisionName || d.DivisionName || 'Unknown Division';
            const deptCount = d.totalDepartments || d.TotalDepartments || 0;
            
            return `
            <tr class="border-bottom">
                <td class="text-center"><input type="checkbox" class="form-check-input chk-division" data-id="${divId}"></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary border-0 rounded-circle" onclick="toggleDivision(${divId}, this)">
                        <i class="fas fa-plus-circle"></i>
                    </button>
                </td>
                <td><span class="fw-bold text-dark fs-6">${divName}</span></td>
                <td class="text-center"><span class="badge bg-soft-primary text-primary px-3">${deptCount} Depts</span></td>
                <td class="text-end pe-4"><i class="fas fa-chevron-right text-light"></i></td>
            </tr>
            <tr id="div-child-${divId}" class="d-none bg-light shadow-inner">
                <td colspan="5" class="p-3"><div id="dept-container-${divId}" class="ps-5 py-2"></div></td>
            </tr>`;
        }).join("");
    } else if (!json.success) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-danger">Failed to load divisions: ${json.message || 'Unknown error'}</td></tr>`;
    } else {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">No Divisions found.</td></tr>`;
    }
}

async function toggleDivision(divId, btn) {
    const row = document.getElementById(`div-child-${divId}`);
    const icon = btn.querySelector("i");
    if (row.classList.contains("d-none")) {
        row.classList.remove("d-none");
        icon.className = "fas fa-minus-circle text-danger";
        await loadDepartments(divId);
    } else {
        row.classList.add("d-none");
        icon.className = "fas fa-plus-circle text-primary";
    }
}

// 2. Department List (Badges)
async function loadDepartments(divId) {
    const container = document.getElementById(`dept-container-${divId}`);
    const dateVal = document.getElementById("txtKharchiDate").value;
    const [year, month] = dateVal.split("-");
    const res = await apiFetch(`${API}/get-departments/${divId}?month=${month}&year=${year}`);
    const json = await res.json();
    if (json.success && json.data && json.data.length > 0) {
        container.innerHTML = `
            <table class="table table-sm table-hover mb-0 border bg-white shadow-sm mt-2">
                <thead class="bg-light small"><tr><th class="ps-3">DEPARTMENT NAME</th><th class="text-center">EMP</th><th class="text-end pe-3">ACTION</th></tr></thead>
                <tbody>
                    ${json.data.map(dept => {
                        const total = dept.EmployeeCount || dept.employeeCount || 0;
                        const saved = dept.SavedCount || dept.savedCount || 0;
                        const isSaved = (dept.IsSaved == 1 || dept.isSaved == 1);
                        const deptId = dept.IDDepartment || dept.idDepartment;
                        const deptName = (dept.DepartmentName || dept.departmentName || "Unknown").replace(/'/g, "\\'");
                        
                        const complete = isSaved || (saved === total && total > 0);
                        let badge = '';
                        if (complete) {
                            badge = `<span class="badge bg-success ms-2"><i class="fas fa-check-circle me-1"></i> SAVED ${total > 0 ? `(${saved || total}/${total})` : ''}</span>`;
                        } else if (saved > 0) {
                            badge = `<span class="badge bg-warning text-white ms-2"><i class="fas fa-hourglass-half me-1"></i> PARTIAL (${saved}/${total})</span>`;
                        }
                        
                        return `<tr>
                            <td class="ps-3"><b>${dept.DepartmentName || dept.departmentName}</b> ${badge}</td>
                            <td class="text-center small">${total}</td>
                            <td class="text-end pe-2">
                                <button class="btn btn-sm ${complete ? 'btn-outline-success' : 'btn-primary'} py-1 px-3 fw-bold" 
                                        onclick="openKharchiPopup(${divId}, ${deptId}, '${deptName}')">
                                    <i class="fas ${complete ? 'fa-eye' : 'fa-pencil-alt'} me-1"></i>
                                    ${complete ? 'View' : 'Kharchi'}
                                </button>
                            </td>
                        </tr>`;
                    }).join("")}
                </tbody>
            </table>`;
    } else {
        container.innerHTML = `<div class="text-center py-3 text-muted">No departments found for this division.</div>`;
    }
}

// 3. Popup
async function openKharchiPopup(divId, deptId, deptName) {
    currentDivisionId = divId; currentDepartmentId = deptId;
    document.getElementById("modalTitle").innerText = `Kharchi List: ${deptName}`;
    const dateVal = document.getElementById("txtKharchiDate").value;
    const [year, month] = dateVal.split("-");
    const res = await apiFetch(`${API}/load-employees/${divId}?month=${month}&year=${year}`);
    const json = await res.json();
    if (json.success) {
        currentEmployees = json.data.filter(e => (e.idDepartment || e.IDDepartment) == deptId);
        isCurrentDeptSaved = currentEmployees.length > 0 && currentEmployees.every(e => (e.PaymentDate || e.paymentDate) != null);

        const saveBtn = document.getElementById("btnSaveData");
        const bulkBtn = document.getElementById("btnBulkApply");
        const clearBtn = document.getElementById("btnClearAll");

        if (isCurrentDeptSaved) {
            if (saveBtn) saveBtn.style.display = "none";
            if (bulkBtn) bulkBtn.style.display = "none";
            if (clearBtn) clearBtn.style.display = "none";
        } else {
            if (saveBtn) { saveBtn.style.display = "inline-block"; saveBtn.disabled = false; }
            if (bulkBtn) bulkBtn.style.display = "inline-block";
            if (clearBtn) clearBtn.style.display = "inline-block";
        }
        document.getElementById("lblCount").innerText = `${currentEmployees.length} Employees`;
        renderEmployeeTable();
        new bootstrap.Modal(document.getElementById('kharchiModal')).show();
    }
}

// 4. Employee Table
function renderEmployeeTable() {
    const tbody = document.getElementById("tblEmployeeBody");
    tbody.innerHTML = currentEmployees.map((e, i) => {
        const empName = e.EmployeeName || e.employeeName || 'Unknown';
        const empCode = e.EmployeeCode || e.employeeCode || '-';
        const amt = e.Amount || e.amount || 0;
        const payDate = e.PaymentDate || e.paymentDate;
        const fromDB = payDate != null;
        const dateStr = payDate ? new Date(payDate).toLocaleDateString('en-GB') : '';
        return `
        <tr class="border-bottom ${fromDB ? 'bg-light' : ''}">
            <td class="ps-3 py-2">
                <div class="fw-bold ${fromDB ? 'text-success' : 'text-dark'}">${empName}</div>
                <div class="text-muted small">Code: ${empCode}</div>
            </td>
            <td>${fromDB ? `<span class="badge bg-success">PAID ON ${dateStr}</span>` : '<span class="badge bg-warning text-white">PENDING</span>'}</td>
            <td class="pe-3"><input type="number" class="form-control text-end fw-bold" value="${amt > 0 ? amt : ''}" placeholder="0" ${(isCurrentDeptSaved || fromDB) ? 'disabled' : ''} oninput="updateEmployeeData(${i}, 'Amount', this.value)" /></td>
        </tr>`;
    }).join("");
    calculateDeptTotal();
}

function updateEmployeeData(i, f, v) { 
    if (f === 'Amount') {
        currentEmployees[i].Amount = parseFloat(v) || 0;
        currentEmployees[i].amount = parseFloat(v) || 0; // Sync both for robustness
    }
    calculateDeptTotal(); 
}

function calculateDeptTotal() {
    const total = currentEmployees.reduce((sum, e) => sum + (parseFloat(e.Amount || e.amount) || 0), 0);
    const lbl = document.getElementById("lblDeptTotal");
    if (lbl) lbl.innerText = `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

// 5. Actions
function applyBulkAmount() {
    const bulkAmt = parseFloat(document.getElementById("txtBulkAmount").value) || 0;
    if (bulkAmt <= 0) return;
    currentEmployees.forEach(emp => { 
        if (!(emp.PaymentDate || emp.paymentDate)) {
            emp.Amount = bulkAmt;
            emp.amount = bulkAmt;
        }
    });
    renderEmployeeTable();
}

function clearAllAmounts() {
    currentEmployees.forEach(emp => { 
        if (!(emp.PaymentDate || emp.paymentDate)) {
            emp.Amount = 0;
            emp.amount = 0;
        }
    });
    renderEmployeeTable();
}

//async function saveDepartmentData() {
//    const details = currentEmployees.filter(e => (parseFloat(e.Amount || e.amount) || 0) > 0).map(e => ({
//        IDEmployee: e.idEmployee || e.IDEmployee, Amount: parseFloat(e.Amount || e.amount), IDDepartment: e.idDepartment || e.IDDepartment, AllowForCalculate: true
//    }));
//    if (details.length === 0) return Swal.fire("Required", "Enter amount", "warning");
//    const dto = {
//        IDEmployeeKharchi: 0, KharchiNo: document.getElementById("txtKharchiNo").value, KharchiDate: document.getElementById("txtKharchiDate").value + "-01",
//        IDDivision: currentDivisionId, IDDepartment: currentDepartmentId, Details: details
//    };
//    const res = await apiFetch(`${API}/save`, { method: "POST", body: JSON.stringify(dto) });
//    const json = await res.json();
//    if (json.success) {
//        bootstrap.Modal.getInstance(document.getElementById('kharchiModal')).hide();
//        loadDepartments(currentDivisionId);
//        Swal.fire("Success", "Saved!", "success");
//    }
//}


async function saveDepartmentData() {
    // 🔥 FILTER: Only send employees who have an amount > 0 AND are NOT already saved
    const details = currentEmployees.filter(e => {
        const amt = parseFloat(e.Amount || e.amount) || 0;
        const isAlreadySaved = (e.PaymentDate || e.paymentDate) != null;
        return amt > 0 && !isAlreadySaved;
    }).map(e => ({
        IDEmployee: e.idEmployee || e.IDEmployee,
        Amount: parseFloat(e.Amount || e.amount),
        IDDepartment: e.idDepartment || e.IDDepartment,
        AllowForCalculate: true
    }));

    if (details.length === 0) {
        return Swal.fire(
            "Info",
            "Employee amounts for this department for this month have already been saved.",
            "info"
        );
    }

    const dto = {
        IDEmployeeKharchi: 0,
        KharchiNo: document.getElementById("txtKharchiNo").value,
        KharchiDate: document.getElementById("txtKharchiDate").value + "-01",
        IDDivision: currentDivisionId,
        IDDepartment: currentDepartmentId,
        Details: details
    };

    const res = await apiFetch(`${API}/save`, { method: "POST", body: JSON.stringify(dto) });
    const json = await res.json();
    if (json.success) {
        bootstrap.Modal.getInstance(document.getElementById('kharchiModal')).hide();
        loadDepartments(currentDivisionId);
        Swal.fire("Success", "New entries saved successfully!", "success");
    }
}


// 🔥 6. PRINT & EXCEL FUNCTIONS (RESTORED)
function selectAllDivs(chk) {
    document.querySelectorAll('.chk-division').forEach(c => { c.checked = chk.checked; });
}

async function exportKharchiToExcel() {
    const dateVal = document.getElementById("txtKharchiDate").value;
    if (!dateVal) return Swal.fire("Required", "Select month", "warning");
    const [year, month] = dateVal.split("-");
    const selectedBoxes = document.querySelectorAll('.chk-division:checked');
    let divIdList = Array.from(selectedBoxes).map(chk => chk.getAttribute('data-id')).join(',');
    if (!divIdList) return Swal.fire("Required", "Select at least one division", "info");
    window.location.href = `${API}/export-excel?month=${month}&year=${year}&divIds=${divIdList}`;
}
