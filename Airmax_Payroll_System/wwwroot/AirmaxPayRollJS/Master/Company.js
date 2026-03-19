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
async function saveData() {

    if (!DOM.companyName().value.trim()) {
        DOM.companyName().classList.add("is-invalid");
        showToast("danger", "Company name required", "Company Master");
        return;
    }

    const idValue = DOM.id().value;

    const dto = {

        idCompany: idValue ? Number(idValue) : 0,

        companyName: DOM.companyName().value.trim(),
        office_Address: DOM.officeAddress().value.trim(),
        cityName: DOM.city().value.trim(),
        stateCode: DOM.state().value.trim(),
        pincode: DOM.pincode().value.trim(),

        contactNo: DOM.contactNo().value.trim(),
        otpMobNo: DOM.otpMobNo().value.trim(),
        phoneNo: DOM.phoneNo().value.trim(),

        comp_EmailID: DOM.email().value.trim(),
        faxNo: DOM.fax().value.trim(),
        website: DOM.website().value.trim(),

        panNo: DOM.pan().value.trim(),
        gstNo: DOM.gst().value.trim(),
        gstDate: DOM.gstDate().value || null,

        dbUserID: DOM.dbUser().value.trim(),
        dbUserPassword: DOM.dbPassword().value.trim(),
        dbDatabaseName: DOM.dbName().value.trim(),
        dbDatasource: DOM.dbSource().value.trim(),
        dbTimeOut: DOM.dbTimeout().value.trim(),

        unit: DOM.unit().value.trim(),

        pf: DOM.pf().value || null,
        esic: DOM.esic().value || null,
        pt: DOM.pt().value || null,

        deviceSerialNo: DOM.deviceSerial().value.trim(),
        outDeviceSerialNo: DOM.outDeviceSerial().value.trim()
    };

    DOM.save().disabled = true;

    try {

        const res = await apiFetch(`${API}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dto)
        });

        const json = await res.json();

        if (!json.success)
            throw new Error(json.message);

        showToast("success", json.message, "Company Master");

        entryModal.hide();
        clearForm();
        bindTable();

    }
    catch (err) {
        showToast("danger", err.message, "Company Master");
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
}