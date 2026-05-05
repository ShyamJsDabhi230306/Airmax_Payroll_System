const API = "/api/master/payroll-configuration";

const DOM = {
    id: () => document.getElementById("IDPayrollConfiguration"),
    save: () => document.getElementById("btnSave")
};

document.addEventListener("DOMContentLoaded", async () => {
    await loadCompanies();
    await loadEmployeeGroups();

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (id && parseInt(id) > 0) {
        await loadExistingData(id);
    } else {
        setDefaultRows();
    }
});

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("exclusion-chip")) {
        e.target.classList.toggle("active");
        e.target.classList.toggle("btn-primary");
        e.target.classList.toggle("btn-outline-primary");
    }
});

async function loadCompanies() {
    const ddl = document.getElementById("IDCompany");

    try {
        const res = await apiFetch("/api/master/company/get-all");
        const json = await res.json();

        if (json.success) {
            ddl.innerHTML = `<option value="">Select Company</option>` +
                json.data.map(x => `<option value="${x.idCompany || x.IDCompany}">${x.companyName || x.CompanyName}</option>`).join("");
        }
    } catch {
        ddl.innerHTML = `<option value="1">Default Company</option>`;
    }

    $('.selectpicker').selectpicker('refresh');
}

async function loadEmployeeGroups() {
    const ddl = document.getElementById("IDEmployeeGroup");

    try {
        const res = await apiFetch("/api/master/employeegroup/get-all");
        const json = await res.json();

        if (json.success) {
            ddl.innerHTML = `<option value="">Select Employee Group</option>` +
                json.data.map(x => `<option value="${x.idEmployeeGroup || x.IDEmployeeGroup}">${x.employeeGroupName || x.EmployeeGroupName}</option>`).join("");
        }
    } catch {
        ddl.innerHTML = `
            <option value="1">Default Employee Group</option>`;
    }

    $('.selectpicker').selectpicker('refresh');
}

async function loadExistingData(id) {
    const res = await apiFetch(`${API}/get-by-id/${id}`);
    const json = await res.json();

    if (!json.success || !json.data) {
        showToast("error", "Configuration not found");
        return;
    }

    const m = json.data;

    bindModel(m);
    bindExclusionButtons(m);
    $("#IDCompany").selectpicker("refresh");
    $("#IDEmployeeGroup").selectpicker("refresh");

    bindComponents(m.components || m.Components || []);
    bindSlabs(m.slabs || m.Slabs || []);
}

function bindExclusionButtons(m) {
    setChip("Bonus", m.isBonusExcluded ?? m.IsBonusExcluded);
    setChip("Tea / Coffee", m.isTeaExcluded ?? m.IsTeaExcluded);
    setChip("Leave Credit", m.isLeaveCreditExcluded ?? m.IsLeaveCreditExcluded);
    setChip("OT Amount", m.isOTAmountExcluded ?? m.IsOTAmountExcluded);
    setChip("HRA", m.isHRAExcluded ?? m.IsHRAExcluded);
    setChip("PF Deduction", m.isPFDeduction ?? m.IsPFDeduction);
}

function setChip(name, isActive) {
    const btn = document.querySelector(`[data-name="${name}"]`);
    if (!btn) return;

    btn.classList.toggle("active", !!isActive);
    btn.classList.toggle("btn-primary", !!isActive);
    btn.classList.toggle("btn-outline-primary", !isActive);
}

function bindModel(m) {
    const id = m.idPayrollConfiguration ?? m.IDPayrollConfiguration;
    const idCompany = m.idCompany ?? m.IDCompany;
    const idEmployeeGroup = m.idEmployeeGroup ?? m.IDEmployeeGroup;

    document.getElementById("IDPayrollConfiguration").value = id || 0;

    setSelectValue("IDCompany", idCompany);
    setSelectValue("IDEmployeeGroup", idEmployeeGroup);

    const fields = [
        "ShiftInTime", "ShiftOutTime", "GracePeriods", "ShiftType", "WorkingHour",
        "MinFullDayHours", "WeeklyOff",
        "AllowedLateCount", "MaxAllowedLateTime", "AfterLateActionType",
        "PenaltyStartFromCount", "HalfDayThreshold", "FullAbsentThreshold",
        "GracePeriodLate", "PerMinuteAutoCalculate", "FixedDeductionPerMinute",
        "MaxDeductiblePerDay",
        "EarlyAllowedCount", "EarlyBufferMinutes", "EarlyAfterCountAction",
        "EarlyHalfDayBeforeTime",
        "OTStartAfterTime", "OTCalculationBasis", "MaxOTPerDay", "OTApplicable",
        "MaxLoanAmount", "AlternateLoanAmount", "SalaryThresholdForAltLoan",
        "MaxLoanTenure", "MinServiceRequired", "GuarantorRequired",
        "AllowPreClose", "AllowEMISkip", "InterestApplicable", "AutoDeductEMI",
        "ExtraDayPaymentEnabled", "ExtraDayPaymentType", "ExtraDayApplicable",
        "ExtraDayMinHours", "IsBonusExcluded", "IsTeaExcluded", "IsLeaveCreditExcluded",
        "IsOTAmountExcluded", "IsHRAExcluded", "IsPFDeduction",
        "PayslipHeaderText", "PayslipFooterNote",
        "ShowCompanyLogo", "ShowPFESICBreakdown", "ShowSalaryComponentBreakdown",
        "AutoEmailPayslip", "ShowOTAmountSeparately"
    ];

    fields.forEach(f => {
        set(f, m[toCamel(f)] ?? m[f]);
    });

    $('.selectpicker').selectpicker('refresh');
}

function setSelectValue(id, value) {
    const el = document.getElementById(id);
    if (!el || value === null || value === undefined) return;

    const stringValue = value.toString();

    const optionExists = [...el.options].some(o => o.value.toString() === stringValue);

    if (optionExists) {
        el.value = stringValue;
    }

    if ($(el).hasClass("selectpicker")) {
        $(el).selectpicker("val", stringValue);
        $(el).selectpicker("refresh");
    }
}

function set(id, value) {
    const el = document.getElementById(id);
    if (!el || value === null || value === undefined) return;

    if (el.type === "checkbox") {
        el.checked = value === true || value === "true" || value === 1;
    } else if (el.type === "time") {
        el.value = value.toString().substring(0, 5);
    } else if (typeof value === "boolean") {
        el.value = value.toString();
    } else {
        el.value = value;
    }
}

function setDefaultRows() {
    addComponentRow("Basic Salary", "salary * 0.50", true, true, 1);
    addComponentRow("HRA", "salary * 0.20", true, true, 2);
    addComponentRow("Conveyance", "1600", false, true, 3);
    addComponentRow("Medical Allowance", "1250", false, true, 4);
    addComponentRow("Special Allowance", "salary - basic - hra - conveyance - medical", true, true, 5);
    addComponentRow("Bonus", "(salaryAmt + leaveAmt) * bonusPer / 100", true, true, 6);
    addComponentRow("Leave Encashment", "salary / workingDays * presentDays * leavePercentage / workingDays", true, true, 7);

    addLateSlabRow("09:01", "09:30", "No Deduction", 0);
    addLateSlabRow("09:31", "10:30", "Half Day", 0);
    addLateSlabRow("10:31", "23:59", "Full Day", 0);

    addEarlySlabRow("00:00", "14:00", "Full Day");
    addEarlySlabRow("14:01", "17:45", "Half Day");
    addEarlySlabRow("17:46", "18:00", "No Deduction");

    addOTSlabRow("18:00", "19:25", 0, 1);
    addOTSlabRow("19:26", "20:25", 1, 1.5);
    addOTSlabRow("20:26", "23:59", 2, 2);
}

window.addComponentRow = function (
    componentName = "",
    formula = "",
    isTaxable = true,
    showOnPayslip = true,
    sortOrder = null
) {
    const tbody = document.getElementById("tblComponentBody");
    const index = tbody.querySelectorAll("tr").length + 1;

    tbody.insertAdjacentHTML("beforeend", `
        <tr>
            <td><input class="form-control form-control-sm comp-name" value="${safe(componentName)}" /></td>
            <td><input class="form-control form-control-sm comp-formula" value="${safe(formula)}" onfocus="activeFormulaInput=this" /></td>
            <td>
                <select class="form-control form-control-sm comp-taxable">
                    <option value="true" ${isTaxable ? "selected" : ""}>Yes</option>
                    <option value="false" ${!isTaxable ? "selected" : ""}>No</option>
                </select>
            </td>
            <td>
                <select class="form-control form-control-sm comp-payslip">
                    <option value="true" ${showOnPayslip ? "selected" : ""}>Yes</option>
                    <option value="false" ${!showOnPayslip ? "selected" : ""}>No</option>
                </select>
            </td>
            <td><input type="number" class="form-control form-control-sm comp-sort" value="${sortOrder || index}" /></td>
            <td class="text-center">
                <button type="button" class="btn btn-danger btn-xs" onclick="this.closest('tr').remove()">×</button>
            </td>
        </tr>
    `);
};

function bindComponents(list) {
    document.getElementById("tblComponentBody").innerHTML = "";

    list.forEach(x => {
        addComponentRow(
            x.componentName || x.ComponentName,
            x.formula || x.Formula,
            x.isTaxable ?? x.IsTaxable,
            x.showOnPayslip ?? x.ShowOnPayslip,
            x.sortOrder || x.SortOrder
        );
    });
}

window.addLateSlabRow = function (
    fromTime = "",
    toTime = "",
    deductionType = "No Deduction",
    deductionValue = 0
) {
    document.getElementById("tblLateSlabBody").insertAdjacentHTML("beforeend", `
        <tr>
            <td><input type="time" class="form-control form-control-sm late-from" value="${formatTimeInput(fromTime)}" /></td>
            <td><input type="time" class="form-control form-control-sm late-to" value="${formatTimeInput(toTime)}" /></td>
            <td><select class="form-control form-control-sm late-deduction form-select default-select">${deductionOptions(deductionType)}</select></td>
            <td><input type="number" class="form-control form-control-sm late-value" value="${deductionValue || 0}" /></td>
            <td class="text-center">
                <button type="button" class="btn btn-danger btn-xs" onclick="this.closest('tr').remove()">×</button>
            </td>
        </tr>
    `);
};

window.addEarlySlabRow = function (
    fromTime = "",
    toTime = "",
    deductionType = "No Deduction"
) {
    document.getElementById("tblEarlySlabBody").insertAdjacentHTML("beforeend", `
        <tr>
            <td><input type="time" class="form-control form-control-sm early-from" value="${formatTimeInput(fromTime)}" /></td>
            <td><input type="time" class="form-control form-control-sm early-to" value="${formatTimeInput(toTime)}" /></td>
            <td><select class="form-control form-control-sm early-deduction form-select default-select">${deductionOptions(deductionType)}</select></td>
            <td class="text-center">
                <button type="button" class="btn btn-danger btn-xs" onclick="this.closest('tr').remove()">×</button>
            </td>
        </tr>
    `);
};

window.addOTSlabRow = function (
    fromTime = "",
    toTime = "",
    otHours = 0,
    rateMultiplier = 1
) {
    document.getElementById("tblOTSlabBody").insertAdjacentHTML("beforeend", `
        <tr>
            <td><input type="time" class="form-control form-control-sm ot-from" value="${formatTimeInput(fromTime)}" /></td>
            <td><input type="time" class="form-control form-control-sm ot-to" value="${formatTimeInput(toTime)}" /></td>
            <td><input type="number" class="form-control form-control-sm ot-hours" value="${otHours || 0}" step="0.5" /></td>
            <td>
                <select class="form-control form-control-sm ot-rate form-select default-select">
                    <option value="1" ${Number(rateMultiplier) === 1 ? "selected" : ""}>1x</option>
                    <option value="1.5" ${Number(rateMultiplier) === 1.5 ? "selected" : ""}>1.5x</option>
                    <option value="2" ${Number(rateMultiplier) === 2 ? "selected" : ""}>2x</option>
                </select>
            </td>
            <td class="text-center">
                <button type="button" class="btn btn-danger btn-xs" onclick="this.closest('tr').remove()">×</button>
            </td>
        </tr>
    `);
};

function bindSlabs(list) {
    document.getElementById("tblLateSlabBody").innerHTML = "";
    document.getElementById("tblEarlySlabBody").innerHTML = "";
    document.getElementById("tblOTSlabBody").innerHTML = "";

    list.forEach(x => {
        const type = x.slabType || x.SlabType;

        if (type === "LATE") {
            addLateSlabRow(
                x.fromTime || x.FromTime,
                x.toTime || x.ToTime,
                x.deductionType || x.DeductionType,
                x.deductionValue || x.DeductionValue
            );
        }

        if (type === "EARLY") {
            addEarlySlabRow(
                x.fromTime || x.FromTime,
                x.toTime || x.ToTime,
                x.deductionType || x.DeductionType
            );
        }

        if (type === "OT") {
            addOTSlabRow(
                x.fromTime || x.FromTime,
                x.toTime || x.ToTime,
                x.otHours || x.OTHours,
                x.rateMultiplier || x.RateMultiplier
            );
        }
    });
}

function collectComponents() {
    const list = [];

    document.querySelectorAll("#tblComponentBody tr").forEach(row => {
        list.push({
            ComponentName: row.querySelector(".comp-name").value,
            Formula: row.querySelector(".comp-formula").value,
            IsTaxable: row.querySelector(".comp-taxable").value === "true",
            ShowOnPayslip: row.querySelector(".comp-payslip").value === "true",
            SortOrder: parseInt(row.querySelector(".comp-sort").value) || 0
        });
    });

    return list;
}

function collectSlabs() {
    const list = [];

    document.querySelectorAll("#tblLateSlabBody tr").forEach(row => {
        list.push({
            SlabType: "LATE",
            FromTime: fixTime(row.querySelector(".late-from").value),
            ToTime: fixTime(row.querySelector(".late-to").value),
            DeductionType: row.querySelector(".late-deduction").value,
            DeductionValue: parseFloat(row.querySelector(".late-value").value) || 0,
            OTHours: null,
            RateMultiplier: null
        });
    });

    document.querySelectorAll("#tblEarlySlabBody tr").forEach(row => {
        list.push({
            SlabType: "EARLY",
            FromTime: fixTime(row.querySelector(".early-from").value),
            ToTime: fixTime(row.querySelector(".early-to").value),
            DeductionType: row.querySelector(".early-deduction").value,
            DeductionValue: 0,
            OTHours: null,
            RateMultiplier: null
        });
    });

    document.querySelectorAll("#tblOTSlabBody tr").forEach(row => {
        list.push({
            SlabType: "OT",
            FromTime: fixTime(row.querySelector(".ot-from").value),
            ToTime: fixTime(row.querySelector(".ot-to").value),
            DeductionType: null,
            DeductionValue: 0,
            OTHours: parseFloat(row.querySelector(".ot-hours").value) || 0,
            RateMultiplier: parseFloat(row.querySelector(".ot-rate").value) || 1
        });
    });

    return list;
}

function collectExtraDayExclusions() {
    const list = [];

    document.querySelectorAll(".exclusion-chip").forEach(btn => {
        list.push({
            ExclusionName: btn.dataset.name,
            IsExcluded: btn.classList.contains("active")
        });
    });

    return list;
}

function bindExtraDayExclusions(list) {
    document.querySelectorAll(".exclusion-chip").forEach(btn => {
        const item = list.find(x =>
            (x.exclusionName || x.ExclusionName) === btn.dataset.name
        );

        const isActive = item ? (item.isExcluded ?? item.IsExcluded) : false;

        btn.classList.toggle("active", isActive);
        btn.classList.toggle("btn-primary", isActive);
        btn.classList.toggle("btn-outline-primary", !isActive);
    });
}

// Salary Formula
let activeFormulaInput = null;

document.addEventListener("focusin", function (e) {
    if (e.target.classList.contains("comp-formula")) {
        activeFormulaInput = e.target;
    }
});

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("formula-tag")) {
        const value = e.target.dataset.value;
        insertFormulaValue(value);
    }
});

function insertFormulaValue(value) {
    if (!activeFormulaInput) {
        const firstFormula = document.querySelector(".comp-formula");
        if (!firstFormula) return;
        activeFormulaInput = firstFormula;
    }

    const input = activeFormulaInput;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    input.value =
        input.value.substring(0, start) +
        value +
        input.value.substring(end);

    input.focus();
    input.selectionStart = input.selectionEnd = start + value.length;
}

window.saveData = async function () {
    if (!val("IDCompany")) {
        showToast("warning", "Please select company");
        return;
    }

    if (!val("IDEmployeeGroup")) {
        showToast("warning", "Please select employee group");
        return;
    }

    const model = {
        IDPayrollConfiguration: intVal("IDPayrollConfiguration") || 0,
        IDCompany: intVal("IDCompany"),
        IDEmployeeGroup: intVal("IDEmployeeGroup"),

        ShiftInTime: timeVal("ShiftInTime"),
        ShiftOutTime: timeVal("ShiftOutTime"),
        GracePeriods: timeVal("GracePeriods"),
        ShiftType: val("ShiftType"),
        WorkingHour: dec("WorkingHour"),
        MinFullDayHours: dec("MinFullDayHours"),
        WeeklyOff: val("WeeklyOff"),

        AllowedLateCount: intVal("AllowedLateCount"),
        MaxAllowedLateTime: timeVal("MaxAllowedLateTime"),
        AfterLateActionType: val("AfterLateActionType"),
        PenaltyStartFromCount: intVal("PenaltyStartFromCount"),
        HalfDayThreshold: timeVal("HalfDayThreshold"),
        FullAbsentThreshold: timeVal("FullAbsentThreshold"),
        GracePeriodLate: timeVal("GracePeriodLate"),
        PerMinuteAutoCalculate: boolVal("PerMinuteAutoCalculate"),
        FixedDeductionPerMinute: dec("FixedDeductionPerMinute"),
        MaxDeductiblePerDay: val("MaxDeductiblePerDay"),

        EarlyAllowedCount: intVal("EarlyAllowedCount"),
        EarlyBufferMinutes: intVal("EarlyBufferMinutes"),
        EarlyAfterCountAction: val("EarlyAfterCountAction"),
        EarlyHalfDayBeforeTime: timeVal("EarlyHalfDayBeforeTime"),

        OTStartAfterTime: timeVal("OTStartAfterTime"),
        OTCalculationBasis: val("OTCalculationBasis"),
        MaxOTPerDay: dec("MaxOTPerDay"),
        OTApplicable: boolVal("OTApplicable"),

        MaxLoanAmount: dec("MaxLoanAmount"),
        AlternateLoanAmount: dec("AlternateLoanAmount"),
        SalaryThresholdForAltLoan: dec("SalaryThresholdForAltLoan"),
        MaxLoanTenure: intVal("MaxLoanTenure"),
        MinServiceRequired: intVal("MinServiceRequired"),
        GuarantorRequired: intVal("GuarantorRequired"),
        AllowPreClose: boolVal("AllowPreClose"),
        AllowEMISkip: boolVal("AllowEMISkip"),
        InterestApplicable: boolVal("InterestApplicable"),
        AutoDeductEMI: boolVal("AutoDeductEMI"),

        ExtraDayPaymentEnabled: boolVal("ExtraDayPaymentEnabled"),
        ExtraDayPaymentType: val("ExtraDayPaymentType"),
        ExtraDayApplicable: val("ExtraDayApplicable"),
        ExtraDayMinHours: dec("ExtraDayMinHours"),
        IsBonusExcluded: document.querySelector('[data-name="Bonus"]')?.classList.contains("active") || false,
        IsTeaExcluded: document.querySelector('[data-name="Tea / Coffee"]')?.classList.contains("active") || false,
        IsLeaveCreditExcluded: document.querySelector('[data-name="Leave Credit"]')?.classList.contains("active") || false,
        IsOTAmountExcluded: document.querySelector('[data-name="OT Amount"]')?.classList.contains("active") || false,
        IsHRAExcluded: document.querySelector('[data-name="HRA"]')?.classList.contains("active") || false,
        IsPFDeduction: document.querySelector('[data-name="PF Deduction"]')?.classList.contains("active") || false,

        PayslipHeaderText: val("PayslipHeaderText"),
        PayslipFooterNote: val("PayslipFooterNote"),
        ShowCompanyLogo: boolVal("ShowCompanyLogo"),
        ShowPFESICBreakdown: boolVal("ShowPFESICBreakdown"),
        ShowSalaryComponentBreakdown: boolVal("ShowSalaryComponentBreakdown"),
        AutoEmailPayslip: boolVal("AutoEmailPayslip"),
        ShowOTAmountSeparately: boolVal("ShowOTAmountSeparately"),

        Components: collectComponents(),
        Slabs: collectSlabs()
    };

    DOM.save().disabled = true;

    try {
        const res = await apiFetch(`${API}/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(model)
        });

        const json = await res.json();

        if (json.success) {
            showToast("success", "Payroll configuration saved successfully");
            window.location.href = "/Master/PayrollConfigurationList";
        } else {
            showToast("error", json.message || "Save failed");
        }
    } catch (e) {
        console.error(e);
        showToast("error", "Save failed");
    } finally {
        DOM.save().disabled = false;
    }
};

function deductionOptions(selected) {
    const list = ["No Deduction", "Minutes", "Half Day", "Full Day"];

    return list.map(x =>
        `<option value="${x}" ${x === selected ? "selected" : ""}>${x}</option>`
    ).join("");
}

function val(id) {
    return document.getElementById(id)?.value || null;
}

function intVal(id) {
    const value = parseInt(val(id));
    return isNaN(value) ? null : value;
}

function dec(id) {
    const value = parseFloat(val(id));
    return isNaN(value) ? null : value;
}

function boolVal(id) {
    const el = document.getElementById(id);
    if (!el) return false;

    if (el.type === "checkbox") {
        return el.checked;
    }

    return el.value === "true";
}

function timeVal(id) {
    const value = document.getElementById(id)?.value;
    return value ? normalizeTime(value) : null;
}

function fixTime(value) {
    return value ? normalizeTime(value) : null;
}

function normalizeTime(value) {
    if (!value) return null;
    if (value.length === 5) return value + ":00";
    return value;
}

function formatTimeInput(value) {
    return value ? value.toString().substring(0, 5) : "";
}

function toCamel(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function safe(value) {
    return (value || "")
        .toString()
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}