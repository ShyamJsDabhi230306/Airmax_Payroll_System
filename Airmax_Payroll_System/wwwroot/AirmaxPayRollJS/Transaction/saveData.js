
async function saveData() {
    const id = parseInt(DOM.id().value) || 0;
    const dto = {
        IDEmployeeKharchi: id,
        KharchiNo: DOM.kharchiNo().value,
        KharchiDate: DOM.kharchiDate().value + "-01",
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
        if (json.success) {
            showToast("success", "Kharchi Saved Successfully");
            window.location.href = "/Transaction/EmployeeKharchiList";
        } else {
            showToast("danger", json.message);
        }
    } catch (e) { showToast("danger", "Failed to connect to server"); }
    finally { btn.disabled = false; }
}
