/**
 * 🖨️ KHARCHI PRINT SERVICE - (Supports Manual Entry & Printing All Employees)
 */
const KharchiPrintService = {
    // 1. Unified Print Caller (Triggered from Entry Form)
    print: function (savedId, allDepts, empData) {
        if (savedId > 0) {
            Swal.fire({
                title: 'Print Options',
                text: "Print Official Saved Record or Current Manual Entry Sheet?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Official Record',
                cancelButtonText: 'Manual Entry Sheet'
            }).then((res) => {
                if (res.isConfirmed) window.open(`/Transaction/KharchiPrintReport?id=${savedId}`, '_blank');
                else if (res.dismiss === Swal.DismissReason.cancel) this.printDraft(allDepts, empData);
            });
        } else {
            this.printDraft(allDepts, empData);
        }
    },

    // 2. Logic for Printing Manual Entry Sheet (No Filter on 0 Amount)
    printDraft: function (allDepts, empData) {
        const date = document.getElementById("txtKharchiDate").value;
        const divSelect = document.getElementById("ddlDivision");
        const div = divSelect.options[divSelect.selectedIndex].text;

        let html = `<html><head><title>Entry Sheet</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"><style>body{padding:30px} .dept-head{background:#f4f7f6;padding:10px;font-weight:bold;border-left:5px solid #007bff;margin-top:20px} .write-box{border:1px solid #aaa; height:25px; width:100%}</style></head><body onload="window.print()">
        <div class="text-center border-bottom pb-3">
            <h2>AIRMAX PAYROLL</h2>
            <h5>KHARCHI - MANUAL ENTRY SHEET</h5>
            <div class="d-flex justify-content-between px-3 mt-3">
                <span><b>Division:</b> ${div}</span>
                <span><b>Month:</b> ${date}</span>
                <span><b>Date:</b> ${new Date().toLocaleDateString()}</span>
            </div>
        </div>`;

        let selectedDepts = allDepts.filter(d => d.selected);
        if (selectedDepts.length === 0) return Swal.fire("Note", "Please select at least one Department to print.", "info");

        selectedDepts.forEach(dept => {
            // 🔥 REMOVED FILTER: Now shows every employee for manual amount collection
            const emps = (empData[dept.idDepartment] || []);

            html += `<div class="dept-head">DEPT: ${dept.departmentName}</div><table class="table table-bordered table-sm mb-3"><thead><tr><th>#</th><th>Employee</th><th>Code</th><th width="150" class="text-end">Amount (₹)</th><th width="200">Remark</th></tr></thead><tbody>`;

            emps.forEach((e, i) => {
                const amt = parseFloat(e.amount) || 0;
                // If amount is 0, show a writing box for manual entry
                const displayAmt = amt > 0 ? amt.toLocaleString('en-IN') : '<div class="write-box"></div>';
                const displayRem = e.remarks || '<div class="write-box"></div>';

                html += `<tr><td>${i + 1}</td><td><b>${e.employeeName}</b></td><td>${e.employeeCode}</td><td class="text-end">${displayAmt}</td><td>${displayRem}</td></tr>`;
            });
            html += `</tbody></table>`;
        });

        html += `<div class="mt-5 d-flex justify-content-between pt-5"><div class="border-top pt-2 px-4">Admin Signature</div><div class="border-top pt-2 px-4">Authorized Signature</div></div></body></html>`;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    }
};

/**
 * 🖨️ AUTOMATIC PRINT DIALOG (For the Official Record View)
 */
document.addEventListener("DOMContentLoaded", () => {
    // This part only runs when the standalone KharchiPrintReport.cshtml page is opened
    if (window.location.pathname.includes("KharchiPrintReport")) {
        console.log("Professional Print View Loaded...");
        setTimeout(() => { window.print(); }, 800);
    }
});

function triggerPrint() {
    window.print();
}
