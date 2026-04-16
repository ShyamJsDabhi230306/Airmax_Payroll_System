/**
 * 📝 EMPLOYEE KHARCHI ENTRY - FULL VERSION (APPROACH 1)
 */
const API = "/api/transaction/kharchi";
let employeeRows = [];

// DOM elements
const DOM = {
    id: () => document.getElementById("txtID"),
    kharchiNo: () => document.getElementById("txtKharchiNo"),
    kharchiDate: () => document.getElementById("txtKharchiDate"),
    department: () => document.getElementById("ddlDepartment"),
    save: () => document.getElementById("btnSave"),
    total: () => document.getElementById("lblTotalAmount")
};

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Load Departments Dropdown
    await loadDepartments();

    // 2. Check if we are Editing or Adding
    const id = getIdFromUrl();
    if (id > 0) {
        await loadExistingData(id);
    } else {
        await generateNewNo();
    }
});

// ✅ APPROACH 1: Smart Search with Confirmation Card
async function checkAutoLoad() {
    const deptId = DOM.department().value;
    const month = DOM.kharchiDate().value;

    // Safety check: Don't trigger if already in edit mode
    if (!deptId || !month || (parseInt(DOM.id().value) > 0)) return;

    const res = await apiFetch(`${API}/get-all`);
    const json = await res.json();

    // 🛡️ Find if this Dept + Month exists in the detailed list
    const existing = (json.data || []).find(x =>
        (x.idDepartment == deptId || x.IDDepartment == deptId) &&
        x.kharchiDate.startsWith(month)
    );

    if (existing) {
        // 🔥 SHOW THE CARD IMMEDIATELY
        const result = await Swal.fire({
            title: "Voucher For This Month Already Exists!",
            text: `A voucher already exists for this department in ${month}. Would you like to edit it?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Load for Edit",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            window.location.href = `/Transaction/EmployeeKharchiEntry?id=${existing.idEmployeeKharchi || existing.IDEmployeeKharchi}`;
        } else {
            DOM.department().value = ""; // Reset
        }
    } else {
        await fetchAllEmployeesByDept(deptId);
    }
}

async function fetchAllEmployeesByDept(deptId) {
    if (!deptId) return;
    const res = await apiFetch(`/api/master/employee/by-department/${deptId}`);
    const json = await res.json();
    if (json.success) {
        employeeRows = json.data.map(emp => ({
            idEmployee: emp.idEmployee,
            empCode: emp.employeeCode,
            empName: emp.employeeName,
            amount: 0,
            remarks: "",
            isSaved: false
        }));
        renderTable();
    }
}

async function loadExistingData(id) {
    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await res.json();
    if (json.success && json.data) {
        const d = json.data;
        DOM.id().value = d.idEmployeeKharchi;
        DOM.kharchiNo().value = d.kharchiNo;
        // Format YYYY-MM for the month input
        if (d.kharchiDate) DOM.kharchiDate().value = d.kharchiDate.split("T")[0].substring(0, 7);
        DOM.department().value = d.idDepartment;


        DOM.kharchiDate().disabled = true;
        DOM.department().disabled = true;
        // Load the merged data from SQL (Approach 1)
        employeeRows = (d.details || []).map(x => ({
            idEmployee: x.idEmployee,
            empCode: x.employeeCode,
            empName: x.employeeName,
            amount: x.amount || 0,
            remarks: x.remarks || "",
            isSaved: x.amount > 0
        }));
        renderTable();
    }
}

function renderTable() {
    const tbody = document.getElementById("tblBody");
    tbody.innerHTML = employeeRows.map((row, index) => `
        <tr class="${row.amount > 0 ? 'bg-dark text-white fw-bold' : ''}">
             <td class="text-center ${row.amount > 0 ? 'text-white' : 'text-muted'}">${index + 1}</td>
            <td class="text-center">${row.empCode}</td>
            <td>
                ${row.empName} 
                ${row.amount > 0 ? '<span class="badge badge-success badge-xs ms-2">Saved</span>' : ''}
            </td>
            <td>
                <input type="number" class="form-control text-end" 
                       value="${row.amount}" 
                       onchange="employeeRows[${index}].amount = parseFloat(this.value || 0); calculateTotal();" />
            </td>
            <td>
                <input type="text" class="form-control" 
                       value="${row.remarks}" 
                       placeholder="Enter reason..."
                       onchange="employeeRows[${index}].remarks = this.value;" />
            </td>
        </tr>
    `).join("");
    calculateTotal();
}

async function saveData() {
    const id = parseInt(DOM.id().value) || 0;
    const dto = {
        IDEmployeeKharchi: id,
        KharchiNo: DOM.kharchiNo().value,
        KharchiDate: DOM.kharchiDate().value + "-01", // Make it a full date
        Date: new Date().toISOString().split('T')[0],
        IDDepartment: parseInt(DOM.department().value),
        Details: employeeRows
            .filter(x => x.amount > 0 || x.remarks.length > 0)
            .map(x => ({
                IDEmployee: parseInt(x.idEmployee),
                Amount: parseFloat(x.amount || 0),
                EmployeeCode: x.empCode,
                Remarks: x.remarks,
                AllowForCalculate: true
            }))
    };

    if (!DOM.kharchiDate().value) return showToast("error", "Select Month");
    if (!dto.IDDepartment) return showToast("error", "Select Department");
    if (dto.Details.length === 0) return showToast("error", "Enter at least one amount");

    const btn = DOM.save();
    btn.disabled = true;
    try {
        const res = await apiFetch(`${API}/save`, { method: "POST", body: JSON.stringify(dto) });
        const json = await res.json();

        // 🛡️ 1. CHECK FOR DUPLICATE (Voucher already exists)
        if (json.result === 2) {
            const result = await Swal.fire({
                title: "Voucher Already Exists!",
                text: "A record for this Department & Month already exists. Would you like to edit it?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Yes, Load for Edit",
                cancelButtonText: "Cancel"
            });

            if (result.isConfirmed) {
                // Redirect to the existing record ID
                window.location.href = `/Transaction/EmployeeKharchiEntry?id=${json.newId}`;
            }
            btn.disabled = false;
            return;
        }

        // 🛡️ 2. CHECK FOR SUCCESS
        if (json.success) {
            showToast("success", "Kharchi Saved Successfully");
            window.location.href = "/Transaction/EmployeeKharchiList";
        } else {
            // Error from server
            showToast("danger", json.message || "Failed to save");
            btn.disabled = false;
        }
    } catch (e) {
        showToast("danger", "Failed to connect to server");
        btn.disabled = false;
    }
}

function calculateTotal() {
    const total = employeeRows.reduce((a, b) => a + parseFloat(b.amount || 0), 0);
    DOM.total().innerText = `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

async function loadDepartments() {
    const res = await apiFetch("/api/master/department/get-all");
    const json = await res.json();
    if (json.success) {
        const ddl = DOM.department();
        ddl.innerHTML = `<option value="">-- Select Department --</option>` +
            json.data.map(d => `<option value="${d.idDepartment}">${d.departmentName}</option>`).join("");
    }
}

async function generateNewNo() {
    const res = await apiFetch(`${API}/generate-no`);
    const json = await res.json();
    if (json.success) DOM.kharchiNo().value = json.data;
}

function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id") || 0);
}
