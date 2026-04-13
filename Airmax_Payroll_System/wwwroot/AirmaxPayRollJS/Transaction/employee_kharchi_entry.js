/**
 * 🛠️ EMPLOYEE KHARCHI - BULK ENTRY COMPLETE STABLE VERSION
 */
const API = "/api/transaction/kharchi";

const DOM = {
    id: () => document.getElementById("IDEmployeeKharchi"),
    kharchiNo: () => document.getElementById("KharchiNo"),
    kharchiDate: () => document.getElementById("KharchiDate"),
    department: () => document.getElementById("IDDepartment"),
    grid: () => document.getElementById("tblEmployeeBody"),
    save: () => document.getElementById("btnSave"),
    totalLabel: () => document.getElementById("lblTotalExpense")
};

let employeeRows = [];

// ==========================================
// 1. INITIALIZE PAGE
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    // Load dropdowns
    await loadDepartments();

    const id = getIdFromUrl();
    if (id > 0) {
        // Mode: EDIT
        await loadExistingData(id);
    } else {
        // Mode: ADD (Get next auto-number)
        await generateKharchiNo();
    }

    // Bind Save Button
    DOM.save().onclick = saveData;
});

// ==========================================
// 2. LOAD DEPARTMENTS
// ==========================================
async function loadDepartments() {
    const res = await apiFetch(`/api/master/department/get-all`);
    const json = await res.json();
    const ddl = DOM.department();
    (json.data || json).forEach(d => {
        ddl.innerHTML += `<option value="${d.idDepartment || d.IDDepartment}">${d.departmentName || d.DepartmentName}</option>`;
    });
}

// ==========================================
// 3. AUTO-GENERATE NUMBER
// ==========================================
async function generateKharchiNo() {
    try {
        const res = await apiFetch(`${API}/generate-no`);
        const json = await res.json();
        if (json.success) {
            DOM.kharchiNo().value = json.data;
        }
    } catch (e) {
        console.error("Failed to generate Kharchi No", e);
    }
}

// ==========================================
// 4. BULK LOAD EMPLOYEES ON DEPT CHANGE
// ==========================================
async function onDepartmentChange() {
    const deptId = DOM.department().value;
    if (!deptId) {
        employeeRows = [];
        renderGrid();
        return;
    }

    const res = await apiFetch(`/api/master/employee/by-department/${deptId}`);
    const json = await res.json();

    // Fill the array with fresh employees
    employeeRows = (json.data || []).map(e => ({
        idEmployee: e.idEmployee || e.IDEmployee,
        empCode: e.empCode || e.EmpCode || e.employeeCode || e.EmployeeCode,
        fullName: e.fullName || e.FullName || e.employeeName || e.EmployeeName,
        amount: 0
    }));

    renderGrid();
}

// ==========================================
// 5. RENDER GRID (WITH TOTALS)
// ==========================================
function renderGrid() {
    const tbody = DOM.grid();
    tbody.innerHTML = "";

    let totalEx = 0;

    employeeRows.forEach((item, index) => {
        totalEx += (parseFloat(item.amount) || 0);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td class="text-center">${item.empCode}</td>
            <td>${item.fullName}</td>
            <td>
                <input type="number" class="form-control text-end amount" 
                       value="${item.amount > 0 ? item.amount : ''}" 
                       placeholder="0.00"
                       onchange="updateAmt(${index}, this.value)" />
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Update Bottom Total
    if (DOM.totalLabel()) {
        DOM.totalLabel().innerText = totalEx.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    }
}

function updateAmt(idx, val) {
    employeeRows[idx].amount = parseFloat(val) || 0;
    renderGrid(); // Recalculate totals
}

// ==========================================
// 6. SAVE DATA
// ==========================================
//async function saveData() {
//    const dto = {
//        IDEmployeeKharchi: parseInt(DOM.id().value) || 0,
//        KharchiNo: DOM.kharchiNo().value,
//        KharchiDate: DOM.kharchiDate().value + "-01", // The Month

//        // ✅ FIX: Added the Entry Date (Today)
//        Date: new Date().toISOString().split('T')[0],

//        IDDepartment: parseInt(DOM.department().value),

//        Details: employeeRows
//            .filter(x => x.amount > 0)
//            .map(x => ({
//                IDEmployee: parseInt(x.idEmployee),
//                Amount: x.amount,
//                EmployeeCode: x.empCode,

//                // ✅ FIX: Added the Calculate flag (Default to true)
//                AllowForCalculate: true
//            }))
//    };

//    // Validation
//    if (!DOM.kharchiDate().value) return showToast("error", "Please select Kharchi Month");
//    if (!dto.IDDepartment) return showToast("error", "Please select Department");
//    if (dto.Details.length === 0) return showToast("error", "Please enter amount for at least one person");

//    const btn = DOM.save();
//    btn.disabled = true;

//    try {
//        const res = await apiFetch(`${API}/save`, {
//            method: "POST",
//            body: JSON.stringify(dto)
//        });

//        // If it's still 400, log the error details to console
//        if (res.status === 400) {
//            const err = await res.json();
//            console.error("400 Error Details:", err);
//            showToast("danger", "Validation Error. Check console for details.");
//            return;
//        }

//        const json = await res.json();
//        if (json.success) {
//            showToast("success", json.message);
//            window.location.href = "/Transaction/EmployeeKharchiList";
//        } else {
//            showToast("danger", json.message);
//        }
//    } catch (e) {
//        showToast("danger", "Failed to connect to server");
//    } finally {
//        btn.disabled = false;
//    }
//}


async function saveData() {
    const dto = {
        IDEmployeeKharchi: parseInt(DOM.id().value) || 0,
        KharchiNo: DOM.kharchiNo().value,
        KharchiDate: DOM.kharchiDate().value + "-01",
        Date: new Date().toISOString().split('T')[0],
        IDDepartment: parseInt(DOM.department().value),
        Details: employeeRows
            .filter(x => x.amount > 0)
            .map(x => ({
                IDEmployee: parseInt(x.idEmployee),
                Amount: x.amount,
                EmployeeCode: x.empCode,
                AllowForCalculate: true
            }))
    };

    const btn = DOM.save();
    btn.disabled = true;

    try {
        const res = await apiFetch(`${API}/save`, { method: "POST", body: JSON.stringify(dto) });
        const json = await res.json();

        console.log("Server Response:", json); // 🔍 DEBUG: Look at your console (F12)

        // ✅ ONLY SHOW THE CARD IF Result is exactly 2 (High precision)
        if (json.result === 2) {
            const confirmed = await Swal.fire({
                title: "Entry Already Exists!",
                text: "A record for this department and month already exists. Do you want to load it?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Load It",
                cancelButtonText: "Cancel"
            });

            if (confirmed.isConfirmed && json.newId) {
                window.location.href = `/Transaction/EmployeeKharchiEntry?id=${json.newId}`;
                return;
            }
        }
        else if (json.success) {
            showToast("success", json.message);
            window.location.href = "/Transaction/EmployeeKharchiList";
        }
        else {
            // If it's a general error, show the red notification
            showToast("danger", json.message || "Error saving record");
        }
    } catch (e) {
        showToast("danger", "Connection error");
    } finally {
        btn.disabled = false;
    }
}






// ==========================================
// 7. EDIT REDIRECT LOAD
// ==========================================
async function loadExistingData(id) {
    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await res.json();
    const m = json.data;

    DOM.id().value = m.idEmployeeKharchi || m.IDEmployeeKharchi;
    DOM.kharchiNo().value = m.kharchiNo || m.KharchiNo;
    if (m.kharchiDate || m.KharchiDate) {
        DOM.kharchiDate().value = (m.kharchiDate || m.KharchiDate).substring(0, 7);
    }
    DOM.department().value = m.idDepartment || m.IDDepartment;

    const details = m.details || m.Details || [];
    employeeRows = details.map(d => ({
        idEmployee: d.idEmployee || d.IDEmployee,
        empCode: d.employeeCode || d.EmployeeCode || "",
        fullName: d.employeeName || d.EmployeeName || "",
        amount: d.amount || d.Amount || 0
    }));
    renderGrid();
}
