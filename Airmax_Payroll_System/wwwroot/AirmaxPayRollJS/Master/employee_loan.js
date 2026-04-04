// ======================================================
// CONFIG & DOM
// ======================================================
const API = "/api/transaction/employee-loan";
let entryModal = null;

const DOM = {
    id: () => document.getElementById("IDEmployeeLoan"),
    loanNo: () => document.getElementById("LoanNo"),
    date: () => document.getElementById("Date"),
    department: () => document.getElementById("IDDepartment"),
    employee: () => document.getElementById("IDEmployee"),
    installmentAmount: () => document.getElementById("InstallmentAmount"), // If you have it in HTML
    loanAmount: () => document.getElementById("LoanAmount"),
    totalInstallments: () => document.getElementById("TotalInstallments"),
    startingDate: () => document.getElementById("InstallmentStartingDate"),
    grid: () => document.getElementById("tblLoanBody"),
    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal"),
    save: () => document.getElementById("btnSave"),
    totalLabel: () => document.getElementById("lblTotalAmount"),
    form: () => document.getElementById("entryForm") // Added this missing link!
};

// ======================================================
// INITIALIZATION
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {
    if (!DOM.tbody()) return;

    await loadDepartment();
    await bindTable();

    // Init DataTable (Same style as Kharchi)
    $('#loanList').DataTable({
        searching: true,
        pageLength: 10,
        ordering: false,
        destroy: true,
        language: {
            paginate: { next: '<i class="fa fa-angle-double-right"></i>', previous: '<i class="fa fa-angle-double-left"></i>' }
        }
    });

    entryModal = new bootstrap.Modal(DOM.modal(), { backdrop: "static" });

    // Events
    DOM.modal().addEventListener("hidden.bs.modal", clearForm);
    DOM.department().addEventListener("change", loadEmployees);
    DOM.save().addEventListener("click", saveData);
});

// ======================================================
// EXPOSED GLOBAL FUNCTIONS (For HTML OnClick)
// ======================================================
window.addNewEntry = async function () {
    clearForm();
    try {
        const res = await apiFetch(`${API}/generate-no`);
        const json = await res.json();
        if (json.success) DOM.loanNo().value = json.data;
    } catch (e) { console.error("Auto-No failed", e); }

    DOM.date().value = new Date().toISOString().split('T')[0];
    entryModal.show();
};

window.editEntry = async function (id) {
    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await res.json();
    if (!json.success) return;

    const m = json.data;
    clearForm();

    DOM.id().value = m.idEmployeeLoan;
    DOM.loanNo().value = m.loanNo;
    DOM.date().value = m.date ? m.date.split('T')[0] : "";
    DOM.loanAmount().value = m.loanAmount;
    DOM.totalInstallments().value = m.totalInstallments;
    DOM.startingDate().value = m.installmentStartingDate ? m.installmentStartingDate.split('T')[0] : "";

    DOM.department().value = m.idDepartment;
    if ($.fn.selectpicker) $(DOM.department()).selectpicker('refresh');

    await loadEmployees();
    DOM.employee().value = m.idEmployee;
    if ($.fn.selectpicker) $(DOM.employee()).selectpicker('refresh');

    // Load Grid
    const tbody = DOM.grid();
    if (m.details) {
        m.details.forEach((item, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${item.month}</td>
                <td class="text-center">${item.year}</td>
                <td><input type="number" class="form-control text-end inst-amt" value="${item.installmentAmount}" onchange="calculateTotal()" /></td>
                <td class="text-center"><button type="button" class="btn btn-danger btn-xs" onclick="this.closest('tr').remove(); calculateTotal();">X</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
    calculateTotal();
    entryModal.show();
};

window.deleteEntry = async function (id) {
    const ok = await confirmDelete("Are you sure you want to delete this loan?");
    if (!ok) return;

    const res = await apiFetch(`${API}/delete/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
        showToast("success", json.message);
        bindTable();
    }
};

// ======================================================
// CALCULATION LOGIC
// ======================================================
window.generateInstallments = function () {
    const totalAmount = parseFloat(DOM.loanAmount().value) || 0;
    const installmentCount = parseInt(DOM.totalInstallments().value) || 0;
    const startValue = DOM.startingDate().value;

    if (totalAmount <= 0 || installmentCount <= 0 || !startValue) {
        showToast("warning", "Please enter Amount, Installments, and Starting Date");
        return;
    }

    // 1. Calculate base installment and the remainder
    const baseInstallment = Math.floor((totalAmount / installmentCount) * 100) / 100;
    const totalAllocated = baseInstallment * (installmentCount - 1);
    const lastInstallment = (totalAmount - totalAllocated).toFixed(2);

    // 2. Prepare Date logic (Manual Month/Year to avoid JS Date bugs)
    const startDate = new Date(startValue);
    let currentMonth = startDate.getMonth(); // 0-11
    let currentYear = startDate.getFullYear();

    const tbody = DOM.grid();
    tbody.innerHTML = "";

    for (let i = 0; i < installmentCount; i++) {
        const displayAmt = (i === installmentCount - 1) ? lastInstallment : baseInstallment.toFixed(2);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td class="text-center">${currentMonth + 1}</td>
            <td class="text-center">${currentYear}</td>
            <td>
                <input type="number" class="form-control text-end inst-amt" 
                       value="${displayAmt}" onchange="calculateTotal()" />
            </td>
            <td class="text-center">
                <button type="button" class="btn btn-danger btn-xs" onclick="this.closest('tr').remove(); calculateTotal();">X</button>
            </td>
        `;
        tbody.appendChild(tr);

        // 3. Increment Month manually (Safe Way)
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    }
    calculateTotal();
};
function calculateTotal() {
    let total = 0;
    document.querySelectorAll(".inst-amt").forEach(input => total += parseFloat(input.value) || 0);
    DOM.totalLabel().innerText = total.toFixed(2);
}

// ======================================================
// DATA FETCHING & SAVING
// ======================================================
async function loadDepartment() {
    const res = await apiFetch(`/api/master/department/get-all`);
    const json = await res.json();
    if (json.success) {
        DOM.department().innerHTML = `<option value="">Select Department</option>` +
            json.data.map(d => `<option value="${d.idDepartment}">${d.departmentName}</option>`).join("");
        if ($.fn.selectpicker) $(DOM.department()).selectpicker('refresh');
    }
}

async function loadEmployees() {
    const deptId = DOM.department().value;
    const ddl = DOM.employee();
    ddl.innerHTML = '<option value="">Select Employee</option>';
    if (!deptId) {
        if ($.fn.selectpicker) $(ddl).selectpicker('refresh');
        return;
    }
    const res = await apiFetch(`/api/master/employee/by-department/${deptId}`);
    const json = await res.json();
    if (json.success) {
        json.data.forEach(emp => {
            const opt = document.createElement("option");
            opt.value = emp.idEmployee;
            opt.textContent = emp.employeeName;
            ddl.appendChild(opt);
        });
    }
    if ($.fn.selectpicker) $(ddl).selectpicker('refresh');
}

async function bindTable() {
    // 1. Destroy old DataTable if it exists
    if ($.fn.DataTable.isDataTable('#loanList')) {
        $('#loanList').DataTable().destroy();
    }
    const res = await apiFetch(`${API}/get-all`);
    const json = await res.json();
    if (!json || !json.success) return;
    const tbody = DOM.tbody();
    tbody.innerHTML = "";
    json.data.forEach((d, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td class="text-center fw-bold text-primary">${escapeHtml(d.loanNo)}</td>
            <td>${escapeHtml(d.employeeName)}</td>
            <td class="text-center fw-bold">${d.loanAmount.toFixed(2)}</td>
            <td class="text-center">${d.totalInstallments}</td>
            <td class="text-center">
                <span class="badge ${d.isClose ? 'bg-danger' : 'bg-success'}">
                    ${d.isClose ? 'Closed' : 'Active'}
                </span>
            </td>
            <td class="text-center">
                <div class="d-flex justify-content-center">
                    <a onclick="editEntry(${d.idEmployeeLoan})" class="btn btn-primary btn-xs sharp me-1">
                        <i class="fa fa-pencil"></i>
                    </a>
                    <a onclick="deleteEntry(${d.idEmployeeLoan})" class="btn btn-danger btn-xs sharp">
                        <i class="fa fa-trash"></i>
                    </a>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    // 2. Re-initialize DataTable AFTER filling the rows
    $('#loanList').DataTable({
        searching: true,
        pageLength: 10,
        ordering: true, // You can now sort
        destroy: true,
        language: {
            paginate: {
                next: '<i class="fa fa-angle-double-right"></i>',
                previous: '<i class="fa fa-angle-double-left"></i>'
            }
        }
    });
}
async function saveData() {
    const details = [];
    // 🔥 COPY THIS COMPLETE BLOCK
        document.querySelectorAll("#tblLoanBody tr").forEach(row => {

            // 1. First, we MUST define 'month' and 'year' from the table cells
            const month = parseInt(row.cells[1].innerText) || 1;
            const year = parseInt(row.cells[2].innerText) || 2026;

            // 2. NOW, define 'installmentDate' (it will find year/month because they are above)
            const installmentDate = `${year}-${String(month).padStart(2, '0')}-01`;

            // 3. Push it to the list
            details.push({
                Month: month,
                Year: year,
                Date: installmentDate,
                InstallmentAmount: parseFloat(row.querySelector(".inst-amt").value) || 0,
                Status: "Pending"
            });

        });


    if (details.length === 0) { showToast("warning", "Generate installments first!"); return; }

    const dto = {
        IDEmployeeLoan: parseInt(DOM.id().value) || 0,
        LoanNo: DOM.loanNo().value,
        Date: DOM.date().value,
        IDEmployee: parseInt(DOM.employee().value),
        IDDepartment: parseInt(DOM.department().value),
         InstallmentAmount: (parseFloat(DOM.loanAmount().value) / parseInt(DOM.totalInstallments().value)).toFixed(2),
        LoanAmount: parseFloat(DOM.loanAmount().value),
        TotalInstallments: parseInt(DOM.totalInstallments().value),
        InstallmentStartingDate: DOM.startingDate().value,
        Details: details
    };

    DOM.save().disabled = true;
    try {
        const res = await apiFetch(`${API}/save`, { method: "POST", body: JSON.stringify(dto) });
        const json = await res.json();
        if (json.success) {
            showToast("success", json.message);
            entryModal.hide();
            bindTable();
        } else { showToast("error", json.message); }
    } catch (e) { showToast("error", "Save failed"); } finally { DOM.save().disabled = false; }
}

function clearForm() {
    DOM.id().value = 0;
    if (DOM.form()) DOM.form().reset();

    // Explicitly wipe the values clean so no '0' remains
    DOM.loanNo().value = "";
    DOM.loanAmount().value = "";
    DOM.totalInstallments().value = "";
    DOM.grid().innerHTML = "";
    DOM.totalLabel().innerText = "0.00";

    // Refresh the dropdowns
    if ($.fn.selectpicker) {
        $(DOM.department()).val('').selectpicker('refresh');
        $(DOM.employee()).val('').selectpicker('refresh');
    }
}

