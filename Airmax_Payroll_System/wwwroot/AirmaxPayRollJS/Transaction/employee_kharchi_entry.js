/**
 * 📝 EMPLOYEE KHARCHI ENTRY - (Division -> Department -> Popup Flow)
 */
const API = "/api/transaction/kharchi";
let currentDivisionId = 0;
let currentDepartmentId = 0;
let currentEmployees = [];

document.addEventListener("DOMContentLoaded", async () => {
    initDate();
    generateNewVoucherNo();
    loadDivisionsForMonth(); // Initial load for current month
});

function initDate() {
    const now = new Date();
    document.getElementById("txtKharchiDate").value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

async function generateNewVoucherNo() {
    const res = await apiFetch(`${API}/generate-no`);
    const json = await res.json();
    if (json.success) {
        document.getElementById("txtKharchiNo").value = json.data;
    }
}

// 1. Load All Divisions based on selected month
async function loadDivisionsForMonth() {
    const tbody = document.getElementById("tblDivisionBody");
    // 🔥 Updated to colspan="5"
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><i class="fas fa-spinner fa-spin me-2"></i> Loading Divisions...</td></tr>`;

    const res = await apiFetch(`${API}/get-divisions-with-count`);
    const json = await res.json();

    if (json.success && json.data.length > 0) {
        tbody.innerHTML = json.data.map(d => `
            <tr class="border-bottom">
                <td class="text-center">
                    <input type="checkbox" class="form-check-input chk-division" data-id="${d.idDivision || d.IDDivision}">
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary border-0 rounded-circle" onclick="toggleDivision(${d.idDivision || d.IDDivision}, this)">
                        <i class="fas fa-plus-circle"></i>
                    </button>
                </td>
                <td>
                    <span class="fw-bold text-dark fs-6">${d.divisionName || d.DivisionName}</span>
                </td>
                <td class="text-center">
                    <span class="badge bg-soft-primary text-primary px-3">
                        ${d.totalDepartments || d.TotalDepartments || 0} Departments
                    </span>
                </td>
                <td class="text-end pe-4">
                    <small class="text-muted me-3">Month: ${document.getElementById("txtKharchiDate").value}</small>
                    <i class="fas fa-chevron-right text-light"></i>
                </td>
            </tr>
            <!-- 🔥 Updated to colspan="5" -->
            <tr id="div-child-${d.idDivision || d.IDDivision}" class="d-none bg-light shadow-inner">
                <td colspan="5" class="p-3">
                    <div id="dept-container-${d.idDivision || d.IDDivision}" class="ps-5 py-2">
                        <div class="text-center text-muted"><i class="fas fa-spinner fa-spin me-1"></i> Loading Departments...</div>
                    </div>
                </td>
            </tr>
        `).join("");
    } else {
        // 🔥 Updated to colspan="5"
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5">No Divisions found.</td></tr>`;
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

async function loadDepartments(divId) {
    const container = document.getElementById(`dept-container-${divId}`);
    // Show spinner if empty
    if (!container.innerHTML || container.innerHTML.includes("Loading")) {
        container.innerHTML = `<div class="text-center text-muted py-2"><i class="fas fa-spinner fa-spin me-1"></i> Loading Departments...</div>`;
    }

    const dateVal = document.getElementById("txtKharchiDate").value;
    const [year, month] = dateVal.split("-");

    const res = await apiFetch(`${API}/get-departments/${divId}?month=${month}&year=${year}`);
    const json = await res.json();

    if (json.success) {
        container.innerHTML = `
            <div class="card border-0 shadow-sm">
                <table class="table table-sm table-hover mb-0 border">
                    <thead class="bg-soft-primary small">
                        <tr><th>DEPARTMENT NAME</th><th class="text-center">EMPLOYEE</th><th class="text-end pe-4">ACTION</th></tr>
                    </thead>
                    <tbody>
                        ${json.data.map(dept => `
                            <tr>
                                <td class="ps-3 border-end">
                                    <b>${dept.DepartmentName}</b>
                                    ${dept.IsSaved == 1 ? '<span class="badge bg-success ms-2"><i class="fas fa-check-circle me-1"></i> SAVED</span>' : ''}
                                </td>
                                <td class="text-center border-end small">${dept.EmployeeCount || 0}</td>
                                <td class="text-end pe-3">
                                    <button class="btn btn-sm ${dept.IsSaved == 1 ? 'btn-outline-success' : 'btn-primary'} py-1 px-3 fw-bold" 
                                            onclick="openKharchiPopup(${divId}, ${dept.IDDepartment}, '${dept.DepartmentName}')">
                                        <i class="fas ${dept.IsSaved == 1 ? 'fa-eye' : 'fa-pencil-alt'} me-1"></i> 
                                        ${dept.IsSaved == 1 ? 'View List' : 'Kharchi List'}
                                    </button>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>`;
    } else {
        container.innerHTML = `<div class="text-center text-danger py-2">Failed to load departments.</div>`;
    }
}


// 3. Open Modal and Load Employees
async function openKharchiPopup(divId, deptId, deptName) {
    // 1. Keep these ID assignments
    currentDivisionId = divId;
    currentDepartmentId = deptId;
    document.getElementById("modalTitle").innerText = `Kharchi List: ${deptName}`;
    document.getElementById("modalSubTitle").innerText = `Updating kharchi for ${deptName}`;

    // 2. Get the current month/year from the UI
    const dateVal = document.getElementById("txtKharchiDate").value;
    const [year, month] = dateVal.split("-");

    const tbody = document.getElementById("tblEmployeeBody");
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-5"><i class="fas fa-spinner fa-spin me-2"></i> Checking monthly status...</td></tr>`;

    const myModal = new bootstrap.Modal(document.getElementById('kharchiModal'));
    myModal.show();

    // 3. Send month and year to the API
    const res = await apiFetch(`${API}/load-employees/${divId}?month=${month}&year=${year}`);
    const json = await res.json();

    if (json.success) {
        currentEmployees = json.data.filter(e => (e.idDepartment || e.IDDepartment) == deptId);
        document.getElementById("lblCount").innerText = `${currentEmployees.length} Employees`;
        renderEmployeeTable();
    }
}




function renderEmployeeTable() {
    const tbody = document.getElementById("tblEmployeeBody");

    tbody.innerHTML = currentEmployees.map((e, i) => {
        const isGiven = (parseFloat(e.Amount || e.amount) || 0) > 0;
        // Format the payment date if it exists
        const payDate = e.PaymentDate || e.paymentDate;
        const formattedDate = payDate ? new Date(payDate).toLocaleDateString('en-GB') : '';

        return `
        <tr class="border-bottom ${isGiven ? 'bg-light' : ''}">
            <td class="ps-3 py-2">
                <div class="fw-bold ${isGiven ? 'text-success' : 'text-dark'}">${e.EmployeeName || e.employeeName}</div>
                <div class="text-muted small">Code: ${e.EmployeeCode || e.employeeCode}</div>
            </td>
            <td>
                ${isGiven
                ? `<span class="badge bg-success">PAID ON ${formattedDate}</span>`
                : '<span class="badge bg-warning text-dark">PENDING</span>'}
            </td>
            <td class="pe-3">
                <input type="number" class="form-control text-end fw-bold" 
                       value="${e.Amount || e.amount || 0}" 
                       ${isGiven ? 'disabled' : ''} 
                       oninput="updateEmployeeData(${i}, 'Amount', this.value)" />
            </td>
        </tr>`;
    }).join("");
    calculateDeptTotal();
}


function updateEmployeeData(index, field, value) {
    if (field === 'Amount') {
        currentEmployees[index].Amount = parseFloat(value) || 0;
        calculateDeptTotal();
    } else {
        currentEmployees[index].Remarks = value;
    }
}

function calculateDeptTotal() {
    const total = currentEmployees.reduce((sum, e) => sum + (parseFloat(e.Amount) || 0), 0);
    document.getElementById("lblDeptTotal").innerText = `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

// 4. Save Logic (Using Voucher Reuse Logic in SP)
//async function saveDepartmentData() {
//    const details = currentEmployees.filter(e => (parseFloat(e.Amount) || 0) > 0).map(e => ({
//        IDEmployee: e.idEmployee || e.IDEmployee,
//        Amount: parseFloat(e.Amount),
//        Remarks: e.Remarks || "",
//        EmployeeCode: e.employeeCode || e.EmployeeCode,
//        IDDepartment: e.idDepartment || e.IDDepartment,
//        AllowForCalculate: e.allowForCalculate || e.AllowForCalculate || false,
//    }));

//    if (details.length === 0) {
//        return Swal.fire("Required", "Please enter amount for at least one employee.", "warning");
//    }

//    const dto = {
//        IDEmployeeKharchi: 0, // SP will automatically reuse or create voucher ID based on Month
//        KharchiNo: document.getElementById("txtKharchiNo").value,
//        KharchiDate: document.getElementById("txtKharchiDate").value + "-01", // The Month
//        IDDivision: currentDivisionId,
//        IDDepartment: currentDepartmentId, // Critical for selective delete in SP
//        Details: details
//    };

//    try {
//        const res = await apiFetch(`${API}/save`, {
//            method: "POST",
//            body: JSON.stringify(dto)
//        });
//        const json = await res.json();

//        if (json.success) {
//            Swal.fire("Success", `Data for this department saved successfully!`, "success");
//            const modalEl = document.getElementById('kharchiModal');
//            const modalInstance = bootstrap.Modal.getInstance(modalEl);
//            modalInstance.hide();

//            // 🔥 Refresh the department list to show "SAVED" badge
//            loadDepartments(currentDivisionId);
//        } else {
//            Swal.fire("Error", json.message || "Failed to save data.", "error");
//        }
//    } catch (err) {
//        Swal.fire("Error", "An unexpected error occurred while saving.", "error");
//    }
//}



// Function to Apply Bulk Amount to every employee in the list

async function saveDepartmentData() {
    const details = currentEmployees.filter(e => (parseFloat(e.Amount || e.amount) || 0) > 0).map(e => ({
        IDEmployee: e.idEmployee || e.IDEmployee,
        Amount: parseFloat(e.Amount || e.amount),
        Remarks: e.Remarks || e.remarks || "",
        // ✅ ENSURE THESE ARE SENT:
        IDDepartment: e.idDepartment || e.IDDepartment,
        AllowForCalculate: e.allowForCalculate || e.AllowForCalculate || false
    }));

    if (details.length === 0) {
        return Swal.fire("Required", "Please enter amount for at least one employee.", "warning");
    }

    const dto = {
        IDEmployeeKharchi: 0,
        KharchiNo: document.getElementById("txtKharchiNo").value,
        KharchiDate: document.getElementById("txtKharchiDate").value + "-01",
        IDDivision: currentDivisionId,
        IDDepartment: currentDepartmentId,
        Details: details
    };

    try {
        const res = await apiFetch(`${API}/save`, {
            method: "POST",
            body: JSON.stringify(dto)
        });
        const json = await res.json();
        if (json.success) {
            Swal.fire("Success", "Saved successfully!", "success");
            bootstrap.Modal.getInstance(document.getElementById('kharchiModal')).hide();
            loadDepartments(currentDivisionId);
        }
    } catch (err) {
        console.error(err);
    }
}

function applyBulkAmount() {
    const bulkAmt = parseFloat(document.getElementById("txtBulkAmount").value) || 0;

    if (bulkAmt <= 0) {
        return Swal.fire("Required", "Please enter a valid amount to apply.", "warning");
    }

    // Update the data array
    currentEmployees.forEach(emp => {
        emp.Amount = bulkAmt;
    });

    // Refresh the table UI
    renderEmployeeTable();

    // Success Toast
    showToast("success", `Applied ₹${bulkAmt} to all employees`);
}

// Function to Reset all amounts to 0
function clearAllAmounts() {
    Swal.fire({
        title: 'Clear All?',
        text: "This will reset all amounts in this list to zero.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, clear all'
    }).then((result) => {
        if (result.isConfirmed) {
            currentEmployees.forEach(emp => {
                emp.Amount = 0;
            });
            renderEmployeeTable();
            document.getElementById("txtBulkAmount").value = "";
        }
    });
}



function selectAllDivs(chk) {
    // Find all checkboxes with the class 'chk-division'
    const checkboxes = document.querySelectorAll('.chk-division');

    // Set their checked status to match the main checkbox
    checkboxes.forEach(c => {
        c.checked = chk.checked;
    });
}