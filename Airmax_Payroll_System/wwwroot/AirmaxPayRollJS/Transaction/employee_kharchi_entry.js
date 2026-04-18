/**
 * 📝 EMPLOYEE KHARCHI ENTRY - (COMPLETE & FIXED)
 */
const API = "/api/transaction/kharchi";
let allDepartments = [];
let employeeData = {};
let expandedDepts = new Set();

document.addEventListener("DOMContentLoaded", async () => {
    await loadDivisions();
    initDate();

    const id = new URLSearchParams(window.location.search).get("id") || 0;
    if (id > 0) {
        await loadForEdit(id);
    } else {
        // 🔥 FIX: Generate Voucher No on page load
        generateNewVoucherNo();
    }
});

function initDate() {
    const now = new Date();
    document.getElementById("txtKharchiDate").value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

async function loadDivisions() {
    const res = await apiFetch(`${API}/get-divisions-with-count`);
    const json = await res.json();
    if (json.success) {
        const ddl = document.getElementById("ddlDivision");
        if (ddl) {
            ddl.innerHTML = `<option value="">-- Select Division --</option>` +
                json.data.map(d => `<option value="${d.idDivision || d.IDDivision}">${d.divisionName || d.DivisionName}</option>`).join("");
        }
    }
}

async function generateNewVoucherNo() {
    const res = await apiFetch(`${API}/generate-no`);
    const json = await res.json();
    if (json.success) {
        document.getElementById("txtKharchiNo").value = json.data;
    }
}

async function btnLoadEmployees() {
    const divId = document.getElementById("ddlDivision").value;
    if (!divId) return;

    const deptRes = await apiFetch(`${API}/get-departments/${divId}`);
    const deptJson = await deptRes.json();
    if (deptJson.success) {
        allDepartments = deptJson.data.map(d => ({
            idDepartment: d.idDepartment || d.IDDepartment,
            departmentName: d.departmentName || d.DepartmentName,
            selected: false
        }));
    }

    const empRes = await apiFetch(`${API}/load-employees/${divId}`);
    const empJson = await empRes.json();
    if (empJson.success) {
        employeeData = {};
        empJson.data.forEach(emp => {
            const dId = emp.idDepartment || emp.IDDepartment;
            if (!employeeData[dId]) employeeData[dId] = [];
            employeeData[dId].push({
                idEmployee: emp.idEmployee || emp.IDEmployee,
                employeeCode: emp.employeeCode || emp.EmployeeCode,
                employeeName: emp.employeeName || emp.EmployeeName,
                designationName: emp.designationName || emp.DesignationName,
                amount: emp.amount || emp.Amount || 0,
                remarks: emp.remarks || emp.Remarks || ""
            });
        });
    }
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById("tblBody");
    tbody.innerHTML = allDepartments.map(dept => {
        const dId = dept.idDepartment;
        const isExp = expandedDepts.has(dId);
        const emps = employeeData[dId] || [];
        const deptTotal = emps.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

        return `
        <tr class="table-light align-middle" style="cursor:pointer">
            <td class="text-center" onclick="toggleDept(${dId})"><i class="fas ${isExp ? 'fa-minus-circle text-danger' : 'fa-plus-circle text-primary'}"></i></td>
            <td class="text-center"><input type="checkbox" class="form-check-input" ${dept.selected ? 'checked' : ''} onchange="toggleDeptSelection(${dId}, this.checked)" /></td>
            <td onclick="toggleDept(${dId})"><b>${dept.departmentName}</b></td>
            <td colspan="2"></td>
            <td class="text-end pe-4 fw-bold text-primary">₹ ${deptTotal.toLocaleString('en-IN')}</td>
            <td></td>
        </tr>
        ${isExp ? `<tr><td colspan="7" class="p-0 border-0"><div class="px-5 py-2 bg-white border-start border-primary border-4">
            <table class="table table-sm table-bordered">
                <thead><tr class="bg-light small"><th>#</th><th>Employee</th><th>Designation</th><th>Amount</th><th>Remarks</th></tr></thead>
                <tbody>${emps.map((e, i) => `<tr>
                    <td>${i + 1}</td>
                    <td><b>${e.employeeName}</b><br><small>${e.employeeCode}</small></td>
                    <td><small>${e.designationName}</small></td>
                    <td><input type="number" class="form-control form-control-sm text-end" value="${e.amount}" oninput="updateEmpAmt(${dId}, ${i}, this.value)" /></td>
                    <td><input type="text" class="form-control form-control-sm" value="${e.remarks}" onchange="updateEmpRem(${dId}, ${i}, this.value)" /></td>
                </tr>`).join("")}</tbody>
            </table></div></td></tr>` : ''}`;
    }).join("");
    updateStats();
}

function updateEmpAmt(dId, i, val) { employeeData[dId][i].amount = parseFloat(val) || 0; updateStats(); }
function updateEmpRem(dId, i, val) { employeeData[dId][i].remarks = val; }
function toggleDept(id) { expandedDepts.has(id) ? expandedDepts.delete(id) : expandedDepts.add(id); renderTable(); }
function toggleDeptSelection(id, val) { const d = allDepartments.find(x => x.idDepartment == id); d.selected = val; renderTable(); }

function updateStats() {
    let total = 0, selected = 0;
    Object.values(employeeData).forEach(deptEmps => {
        deptEmps.forEach(e => {
            const amt = parseFloat(e.amount) || 0;
            if (amt > 0) { total += amt; selected++; }
        });
    });
    document.getElementById("lblTotal").innerText = `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById("lblSelected").innerText = selected;
}

/**
 * 🔥 FIXED SAVE: This actualy calls the API now
 */
async function saveData() {
    const id = new URLSearchParams(window.location.search).get("id") || 0;
    const divId = document.getElementById("ddlDivision").value;
    const kharchiDate = document.getElementById("txtKharchiDate").value;

    if (!divId || !kharchiDate) return showToast("error", "Fill Division and Month");

    const details = [];
    Object.keys(employeeData).forEach(dId => {
        employeeData[dId].forEach(e => {
            if (parseFloat(e.amount) > 0) {
                details.push({
                    IDEmployee: e.idEmployee,
                    Amount: parseFloat(e.amount),
                    Remarks: e.remarks,
                    EmployeeCode: e.employeeCode
                });
            }
        });
    });

    if (details.length === 0) return Swal.fire("Required", "No amounts entered.", "warning");

    const dto = {
        IDEmployeeKharchi: parseInt(id),
        KharchiNo: document.getElementById("txtKharchiNo").value,
        KharchiDate: kharchiDate + "-01",
        IDDivision: parseInt(divId),
        Details: details
    };

    // --- Start Save Call ---
    const res = await apiFetch(`${API}/save`, {
        method: "POST",
        body: JSON.stringify(dto)
    });
    const json = await res.json();

    if (json.success) {
        Swal.fire("Success", "Voucher saved successfully!", "success")
            .then(() => window.location.href = "/Transaction/EmployeeKharchiList");
    } else {
        Swal.fire("Error", json.message || "Could not save.", "error");
    }
}

function printKharchi() {
    const id = new URLSearchParams(window.location.search).get("id") || 0;
    KharchiPrintService.print(id, allDepartments, employeeData);
}

async function loadForEdit(id) {
    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await res.json();
    if (json.success && json.data) {
        const d = json.data;
        document.getElementById("txtKharchiNo").value = d.kharchiNo;
        document.getElementById("txtKharchiDate").value = d.kharchiDate.split("T")[0].substring(0, 7);
        document.getElementById("ddlDivision").value = d.idDivision;
        await btnLoadEmployees();
        d.details.forEach(saved => {
            const list = employeeData[saved.idDepartment] || [];
            const emp = list.find(e => e.idEmployee === saved.idEmployee);
            if (emp) {
                emp.amount = saved.amount;
                emp.remarks = saved.remarks;
                expandedDepts.add(saved.idDepartment);
            }
        });
        renderTable();
    }
}
