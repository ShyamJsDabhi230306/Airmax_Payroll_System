// ======================================================
// CONFIG
// ======================================================
const API = "/api/master/company";
let entryModal = null;

// ======================================================
// DOM CACHE
// ======================================================
const DOM = {

    id: () => document.getElementById("IDCompany"),

    companyName: () => document.getElementById("CompanyName"),
    officeAddress: () => document.getElementById("Office_Address"),
    city: () => document.getElementById("CityName"),
    state: () => document.getElementById("StateCode"),
    pincode: () => document.getElementById("Pincode"),

    contactNo: () => document.getElementById("ContactNo"),
    otpMobNo: () => document.getElementById("OTPMobNo"),
    phoneNo: () => document.getElementById("PhoneNo"),

    email: () => document.getElementById("Comp_EmailID"),
    fax: () => document.getElementById("FaxNo"),
    website: () => document.getElementById("Website"),

    pan: () => document.getElementById("PanNo"),
    gst: () => document.getElementById("GSTNo"),
    gstDate: () => document.getElementById("GSTDate"),

    dbUser: () => document.getElementById("DbUserID"),
    dbPassword: () => document.getElementById("DbUserPassword"),
    dbName: () => document.getElementById("DbDatabaseName"),
    dbSource: () => document.getElementById("DbDatasource"),
    dbTimeout: () => document.getElementById("DbTimeOut"),

    unit: () => document.getElementById("Unit"),

    pf: () => document.getElementById("PF"),
    esic: () => document.getElementById("ESIC"),
    pt: () => document.getElementById("PT"),

    deviceSerial: () => document.getElementById("DeviceSerialNo"),
    outDeviceSerial: () => document.getElementById("OutDeviceSerialNo"),

    logo: () => document.getElementById("LogoFile"),
    sign: () => document.getElementById("SignFile"),

    logoDisplay: () => document.getElementById("LogoNameDisplay"),
    signDisplay: () => document.getElementById("SignNameDisplay"),
    save: () => document.getElementById("btnSave"),
    tbody: () => document.getElementById("tblBody"),
    modal: () => document.getElementById("addModal")
};

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

    await bindTable();

    $('#companyList').DataTable({
        lengthChange: true,
        searching: true,
        pageLength: 10,
        ordering: false,
        language: {
            paginate: {
                next: '<i class="fa fa-angle-double-right"></i>',
                previous: '<i class="fa fa-angle-double-left"></i>'
            }
        }
    });

    entryModal = new bootstrap.Modal(DOM.modal(), { backdrop: "static" });

    DOM.modal().addEventListener("shown.bs.modal", () => {
        setTimeout(() => DOM.companyName().focus(), 50);
    });

    DOM.modal().addEventListener("hidden.bs.modal", clearForm);

    DOM.save().addEventListener("click", saveData);
});

// ======================================================
// BIND TABLE
// ======================================================
async function bindTable() {

    try {

        const res = await apiFetch(`${API}/get-all`);
        const json = await res.json();

        if (!json.success)
            throw new Error(json.message);

        const tbody = DOM.tbody();
        tbody.innerHTML = "";

        json.data.forEach(d => {

            const tr = document.createElement("tr");

            const id = d.idCompany ?? d.IDCompany ?? 0;

            tr.innerHTML = `
                <td>${escapeHtml(d.companyName)}</td>
                <td>${escapeHtml(d.cityName || "")}</td>
                <td>${escapeHtml(d.contactNo || "")}</td>
                <td>${escapeHtml(d.comp_EmailID || "")}</td>
                <td>
                    <div class="d-flex">
                        <a href="javascript:void(0)" 
                           onclick="editEntry(${id})"
                           class="btn btn-primary shadow btn-xs sharp me-1">
                           <i class="fa fa-pencil"></i>
                        </a>

                        <a href="javascript:void(0)" 
                           onclick="deleteEntry(${id})"
                           class="btn btn-danger shadow btn-xs sharp">
                           <i class="fa fa-trash"></i>
                        </a>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (err) {
        showToast("danger", err.message, "Company Master");
    }
}

// ======================================================
// EDIT
// ======================================================
async function editEntry(id) {

    try {

        const res = await apiFetch(`${API}/get-by-id/${id}`);
        const json = await res.json();

        if (!json.success)
            throw new Error(json.message);

        const d = json.data;

        const companyId = d.idCompany ?? d.IDCompany;

        if (!companyId)
            throw new Error("Invalid company ID from server");

        DOM.id().value = companyId;

        DOM.companyName().value = d.companyName || "";
        DOM.officeAddress().value = d.office_Address || "";
        DOM.city().value = d.cityName || "";
        DOM.state().value = d.stateCode || "";
        DOM.pincode().value = d.pincode || "";

        DOM.contactNo().value = d.contactNo || "";
        DOM.otpMobNo().value = d.otpMobNo || "";
        DOM.phoneNo().value = d.phoneNo || "";

        DOM.email().value = d.comp_EmailID || "";
        DOM.fax().value = d.faxNo || "";
        DOM.website().value = d.website || "";

        DOM.pan().value = d.panNo || "";
        DOM.gst().value = d.gstNo || "";
        DOM.gstDate().value = d.gstDate ? d.gstDate.split("T")[0] : "";

        DOM.dbUser().value = d.dbUserID || "";
        DOM.dbPassword().value = d.dbUserPassword || "";
        DOM.dbName().value = d.dbDatabaseName || "";
        DOM.dbSource().value = d.dbDatasource || "";
        DOM.dbTimeout().value = d.dbTimeOut || "";

        DOM.unit().value = d.unit || "";

        DOM.pf().value = d.pf || "";
        DOM.esic().value = d.esic || "";
        DOM.pt().value = d.pt || "";

        DOM.deviceSerial().value = d.deviceSerialNo || "";
        DOM.outDeviceSerial().value = d.outDeviceSerialNo || "";
        if (d.logoFileName) {
            DOM.logoDisplay().innerHTML = "Current: " + d.logoFileName;
        }

        if (d.signFileName) {
            DOM.signDisplay().innerHTML = "Current: " + d.signFileName;
        }
        entryModal.show();

    } catch (err) {
        showToast("danger", err.message, "Company Master");
    }
}

// ======================================================
// DELETE
// ======================================================
async function deleteEntry(id) {

    const ok = await confirmDelete("This record will be deleted permanently!");

    if (!ok) return;

    try {

        const res = await apiFetch(`${API}/delete/${id}`, {
            method: "DELETE"
        });

        const json = await res.json();

        if (!json.success)
            throw new Error(json.message);

        showToast("success", json.message, "Company Master");

        bindTable();

    } catch (err) {
        showToast("danger", err.message, "Company Master");
    }
}

// ======================================================
// SAVE
// ======================================================
//async function saveData() {

//    if (!DOM.companyName().value.trim()) {
//        DOM.companyName().classList.add("is-invalid");
//        showToast("danger", "Company name required", "Company Master");
//        return;
//    }

//    const idValue = DOM.id().value;

//    const formData = new FormData();
//    formData.append("IDCompany", idValue ? Number(idValue) : 0);
//    formData.append("CompanyName", DOM.companyName().value.trim());
//    formData.append("Office_Address", DOM.officeAddress().value.trim());
//    formData.append("CityName", DOM.city().value.trim());
//    formData.append("StateCode", DOM.state().value.trim());
//    formData.append("Pincode", DOM.pincode().value.trim());
//    formData.append("ContactNo", DOM.contactNo().value.trim());
//    formData.append("OTPMobNo", DOM.otpMobNo().value.trim());
//    formData.append("PhoneNo", DOM.phoneNo().value.trim());
//    formData.append("Comp_EmailID", DOM.email().value.trim());
//    formData.append("FaxNo", DOM.fax().value.trim());
//    formData.append("Website", DOM.website().value.trim());
//    formData.append("PanNo", DOM.pan().value.trim());
//    formData.append("GSTNo", DOM.gst().value.trim());
//    formData.append("GSTDate", DOM.gstDate().value || "");
//    formData.append("DbUserID", DOM.dbUser().value.trim());
//    formData.append("DbUserPassword", DOM.dbPassword().value.trim());
//    formData.append("DbDatabaseName", DOM.dbName().value.trim());
//    formData.append("DbDatasource", DOM.dbSource().value.trim());
//    formData.append("DbTimeOut", DOM.dbTimeout().value.trim());
//    formData.append("Unit", DOM.unit().value.trim());
//    formData.append("PF", parseFloat(DOM.pf().value) || 0);
//    formData.append("ESIC", parseFloat(DOM.esic().value) || 0);
//    formData.append("PT", parseFloat(DOM.pt().value) || 0);
//    formData.append("DeviceSerialNo", DOM.deviceSerial().value.trim());
//    formData.append("OutDeviceSerialNo", DOM.outDeviceSerial().value.trim());

//    if (DOM.logo().files[0]) formData.append("LogoFile", DOM.logo().files[0]);
//    if (DOM.sign().files[0]) formData.append("SignFile", DOM.sign().files[0]);

//    DOM.save().disabled = true;

//    try {
//        const res = await apiFetch(`${API}/save`, {
//            method: "POST",
//            body: formData
//        });

//        const json = await res.json();

//        if (!json.success)
//            throw new Error(json.message);

//        showToast("success", json.message, "Company Master");

//        entryModal.hide();
//        clearForm();
//        bindTable();
//    }
//    catch (err) {
//        showToast("danger", err.message, "Company Master");
//    }
//    finally {
//        DOM.save().disabled = false;
//    }
//}
// --- wwwroot/AirmaxPayRollJS/Master/Company.js ---

// 1. ADD THIS VALIDATION FUNCTION:
function validateForm() {
    let isValid = true;

    if (!DOM.companyName().value.trim()) {
        DOM.companyName().classList.add("is-invalid");
        showToast("danger", "Company name is required", "Validation Error");
        isValid = false;
    } else {
        DOM.companyName().classList.remove("is-invalid");
    }

    return isValid;
}

// 2. UPDATED SAVEDATA FUNCTION:
async function saveData() {
    // Check validation first
    if (!validateForm()) return;

    const idValue = DOM.id().value;
    const formData = new FormData();

    // Add all fields to formData
    formData.append("IDCompany", idValue ? Number(idValue) : 0);
    formData.append("CompanyName", DOM.companyName().value.trim());
    formData.append("Office_Address", DOM.officeAddress().value.trim());
    formData.append("CityName", DOM.city().value.trim());
    formData.append("StateCode", DOM.state().value.trim());
    formData.append("Pincode", DOM.pincode().value.trim());
    formData.append("ContactNo", DOM.contactNo().value.trim());
    formData.append("OTPMobNo", DOM.otpMobNo().value.trim());
    formData.append("PhoneNo", DOM.phoneNo().value.trim());
    formData.append("Comp_EmailID", DOM.email().value.trim());
    formData.append("FaxNo", DOM.fax().value.trim());
    formData.append("Website", DOM.website().value.trim());
    formData.append("PanNo", DOM.pan().value.trim());
    formData.append("GSTNo", DOM.gst().value.trim());
    formData.append("GSTDate", DOM.gstDate().value || "");
    formData.append("DbUserID", DOM.dbUser().value.trim());
    formData.append("DbUserPassword", DOM.dbPassword().value.trim());
    formData.append("DbDatabaseName", DOM.dbName().value.trim());
    formData.append("DbDatasource", DOM.dbSource().value.trim());
    formData.append("DbTimeOut", DOM.dbTimeout().value.trim());
    formData.append("Unit", DOM.unit().value.trim());
    formData.append("PF", parseFloat(DOM.pf().value) || 0);
    formData.append("ESIC", parseFloat(DOM.esic().value) || 0);
    formData.append("PT", parseFloat(DOM.pt().value) || 0);
    formData.append("DeviceSerialNo", DOM.deviceSerial().value.trim());
    formData.append("OutDeviceSerialNo", DOM.outDeviceSerial().value.trim());

    // Add files if selected
    if (DOM.logo().files[0]) formData.append("LogoFile", DOM.logo().files[0]);
    if (DOM.sign().files[0]) formData.append("SignFile", DOM.sign().files[0]);

    DOM.save().disabled = true;

    try {
        // DIRECT FETCH to bypass any JSON header issues
        const res = await fetch(`${API}/save`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
            },
            body: formData
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server Error (${res.status}): ${errorText}`);
        }

        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        showToast("success", json.message, "Company Master");
        entryModal.hide();
        clearForm();
        bindTable();
    }
    catch (err) {
        showToast("danger", err.message, "Company Master");
        console.error("Save Error:", err);
    }
    finally {
        DOM.save().disabled = false;
    }
}

// ======================================================
// CLEAR FORM
// ======================================================
function clearForm() {

    DOM.id().value = 0;

    document.querySelectorAll("#entryForm input, #entryForm textarea")
        .forEach(x => x.value = "");

    DOM.companyName().classList.remove("is-invalid");
    DOM.logoDisplay().innerHTML = "";
    DOM.signDisplay().innerHTML = "";
}