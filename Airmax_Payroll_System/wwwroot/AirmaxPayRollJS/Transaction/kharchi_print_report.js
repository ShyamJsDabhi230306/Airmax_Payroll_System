/**
 * AIRMAX PROFESSIONAL PRINT ENGINE
 * - Bulk Selection Logic
 * - 20 Rows per Page Pagination
 * - Automatic Repeating Headers
 * - No Blank Pages Bugfix
 */

async function printKharchiReport() {
    const dateVal = document.getElementById("txtKharchiDate").value;
    if (!dateVal) return Swal.fire("Required", "Please select a month first", "warning");
    const [year, month] = dateVal.split("-");

    // 1. Get ONLY the checked divisions
    const selectedBoxes = document.querySelectorAll('.chk-division:checked');
    let divIdList = "0";

    if (selectedBoxes.length > 0) {
        divIdList = Array.from(selectedBoxes).map(chk => chk.getAttribute('data-id')).join(',');
    } else {
        return Swal.fire("Selection Required", "Please check a division checkbox first.", "info");
    }

    const printWin = window.open('', '_blank');
    if (!printWin) return Swal.fire("Blocked", "Please allow popups for printing.", "warning");

    printWin.document.write("<html><body style='font-family:sans-serif; text-align:center; padding-top:100px;'><h2>Generating Checklist...</h2></body></html>");

    try {
        const res = await apiFetch(`${API}/get-print-data?month=${month}&year=${year}&divIds=${divIdList}`);
        const json = await res.json();

        if (!json.success || !json.data || json.data.length === 0) {
            printWin.close();
            return Swal.fire("No Data", "No employees found for this selection.", "info");
        }

        const groupedData = groupBy(json.data, d => d.divisionName || d.DivisionName);
        let printHtml = '';

        const divKeys = Object.keys(groupedData);
        divKeys.forEach((divName, divIdx) => {
            const depts = groupBy(groupedData[divName], d => d.departmentName || d.DepartmentName);
            const deptKeys = Object.keys(depts);

            deptKeys.forEach((deptName, deptIdx) => {
                const employees = depts[deptName];
                const header = employees[0];
                const MAX_ROWS = 20;

                for (let i = 0; i < employees.length; i += MAX_ROWS) {
                    const chunk = employees.slice(i, i + MAX_ROWS);

                    // 🔥 FIX: Prevent blank page at the end of the report
                    const isLastPageOfReport = (divIdx === divKeys.length - 1) &&
                        (deptIdx === deptKeys.length - 1) &&
                        (i + MAX_ROWS >= employees.length);

                    printHtml += `
                        <div class="a4-page" style="${isLastPageOfReport ? '' : 'page-break-after: always;'}">
                            <div class="rpt-header">
                                <div class="rpt-comp">
                                    <h1>${header.companyName || header.CompanyName}</h1>
                                    <span>${header.locationName || header.LocationName}</span>
                                    <div class="rpt-title">Monthly Kharchi Checklist</div>
                                </div>
                                <div class="rpt-meta">
                                    <div class="rpt-date">${new Date(year, month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
                                    <div class="rpt-pg">Page ${Math.floor(i / MAX_ROWS) + 1} of ${Math.ceil(employees.length / MAX_ROWS)}</div>
                                </div>
                            </div>

                            <div class="info-bar">
                                <div class="info-item"><b>DIV:</b> ${divName}</div>
                                <div class="info-item"><b>DEPT:</b> ${deptName}</div>
                                <div class="info-item" style="border:0"><b>TOTAL EMP:</b> ${employees.length}</div>
                            </div>

                            <table class="rpt-table">
                                <thead>
                                    <tr>
                                        <th width="40" style="text-align:center">SR.</th>
                                        <th width="100">CODE</th>
                                        <th>EMPLOYEE NAME</th>
                                        <th width="120" style="text-align:right">AMOUNT (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${chunk.map((e, idx) => `
                                        <tr>
                                            <td align="center" style="color:#888;">${i + idx + 1}</td>
                                            <td style="font-weight:500;">${e.employeeCode || e.EmployeeCode}</td>
                                            <td><b>${e.employeeName || e.EmployeeName}</b></td>
                                            <td align="right">
                                                <div style="border:1px solid #ccc; height:20px; width:100px; float:right; border-radius:2px;"></div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                }
            });
        });

        printWin.document.body.innerHTML = printHtml;
        printWin.document.head.innerHTML = `
            <style>
                body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #555; }
                
                .a4-page { 
                    background: white; 
                    width: 210mm; 
                    margin: 10mm auto; 
                    padding: 15mm; 
                    box-sizing: border-box; 
                    position: relative; 
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }

                .rpt-header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a237e; padding-bottom: 10px; margin-bottom: 15px; }
                .rpt-comp h1 { margin: 0; font-size: 20px; color: #1a237e; text-transform: uppercase; font-weight: 800; }
                .rpt-comp span { font-size: 12px; color: #666; }
                .rpt-title { margin-top: 10px; font-size: 14px; font-weight: bold; color: #d32f2f; border-left: 4px solid #d32f2f; padding-left: 8px; text-transform: uppercase; }
                
                .rpt-meta { text-align: right; }
                .rpt-date { font-weight: bold; font-size: 14px; color: #1a237e; }
                .rpt-pg { font-size: 10px; color: #888; margin-top: 5px; }

                .info-bar { display: flex; background: #f8f9fa; border: 1px solid #ddd; margin-bottom: 15px; border-left: 6px solid #1a237e; }
                .info-item { flex: 1; padding: 8px 12px; font-size: 12px; border-right: 1px solid #ddd; }

                .rpt-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .rpt-table th { background: #f0f0f0; border: 1px solid #999; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
                .rpt-table td { border: 1px solid #eee; padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }

                @media print {
                    body { background: white; margin: 0; }
                    .a4-page { 
                        margin: 0; 
                        box-shadow: none; 
                        width: 100%; 
                        height: auto !important;
                        min-height: auto !important;
                        padding: 10mm;
                    }
                    @page { margin: 0; }
                }
            </style>
        `;

        // Start print
        setTimeout(() => {
            printWin.print();
            printWin.close();
        }, 300);

    } catch (err) {
        if (printWin) printWin.close();
        Swal.fire("Error", err.message, "error");
    }
}

// 🔥 Helper function for grouping data
function groupBy(array, keyFn) {
    return array.reduce((result, item) => {
        const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
        (result[key] = result[key] || []).push(item);
        return result;
    }, {});
}
