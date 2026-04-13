/**
 * 📄 EMPLOYEE KHARCHI LIST - PROFESSIONAL VERSION
 */
const API = "/api/transaction/kharchi";

document.addEventListener("DOMContentLoaded", async () => {
    await bindTable();
});

async function bindTable() {
    // 🛡️ 1. Destroy the old table before loading new data (fixes pagination issues)
    if ($.fn.DataTable.isDataTable('#kharchiList')) {
        $('#kharchiList').DataTable().destroy();
    }

    const res = await apiFetch(`${API}/get-all`);
    const json = await res.json();

    const tbody = document.getElementById("tblBody");
    tbody.innerHTML = "";

    (json.data || []).forEach((d, index) => {
        const monthDisplay = (d.kharchiDate || d.KharchiDate)
            ? new Date(d.kharchiDate || d.KharchiDate).toLocaleString('default', { month: 'long', year: 'numeric' })
            : "";

        tbody.innerHTML += `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td class="text-center">${d.kharchiNo || d.KharchiNo || ""}</td>
                <td>${d.departmentName || d.DepartmentName || "N/A"}</td>
                <td class="text-center">${monthDisplay}</td>
                
                <!-- ✅ Shows the TotalAmount from your new C# Property -->
                <td class="text-end fw-bold">
                    ₹ ${(d.totalAmount || d.TotalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>

                <td class="text-center">
                    <div class="d-flex justify-content-center">
                        <a href="/Transaction/EmployeeKharchiEntry?id=${d.idEmployeeKharchi || d.IDEmployeeKharchi}"
                           class="btn btn-primary btn-xs sharp me-1">
                           <i class="fa fa-pencil"></i>
                        </a>
                        <button onclick="deleteEntry(${d.idEmployeeKharchi || d.IDEmployeeKharchi})"
                           class="btn btn-danger btn-xs sharp">
                           <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    });

    // 🛡️ 2. Re-initialize the DataTable AFTER the data is loaded
    $('#kharchiList').DataTable({
        searching: true,
        pageLength: 10,
        ordering: false,
        responsive: true,
        language: {
            // Makes the pagination look cleaner
            paginate: {
                next: '<i class="fa fa-chevron-right"></i>',
                previous: '<i class="fa fa-chevron-left"></i>'
            }
        }
    });
}

// ... deleteEntry function remains same ...
