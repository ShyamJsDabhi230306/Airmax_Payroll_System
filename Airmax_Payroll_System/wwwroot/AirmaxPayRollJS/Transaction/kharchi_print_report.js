/**
 * AIRMAX PROFESSIONAL PRINT ENGINE - FINAL STABLE
 */

//async function printKharchiReport() {
//    const dateVal = document.getElementById("txtKharchiDate").value;
//    if (!dateVal) return Swal.fire("Required", "Please select a month first", "warning");
//    const [year, month] = dateVal.split("-");

//    const selectedBoxes = document.querySelectorAll('.chk-division:checked');
//    let divIdList = "0";

//    if (selectedBoxes.length > 0) {
//        divIdList = Array.from(selectedBoxes).map(chk => chk.getAttribute('data-id')).join(',');
//    } else {
//        return Swal.fire("Selection Required", "Please check a division checkbox first.", "info");
//    }

//    const printWin = window.open('', '_blank');
//    if (!printWin) return Swal.fire("Blocked", "Please allow popups for printing.", "warning");

//    printWin.document.write("<html><body style='text-align:center; padding-top:100px;'><h2>Preparing Report...</h2></body></html>");

//    try {
//        const res = await apiFetch(`${API}/get-print-data?month=${month}&year=${year}&divIds=${divIdList}`);
//        const json = await res.json();

//        if (!json.success || !json.data || json.data.length === 0) {
//            printWin.close();
//            return Swal.fire("No Data", "No employees found for this selection.", "info");
//        }

//        const groupedData = groupBy(json.data, d => d.divisionName || d.DivisionName);
//        let printHtml = '';

//        const divKeys = Object.keys(groupedData);
//        divKeys.forEach((divName, divIdx) => {
//            const depts = groupBy(groupedData[divName], d => d.departmentName || d.DepartmentName);
//            const deptKeys = Object.keys(depts);

//            deptKeys.forEach((deptName, deptIdx) => {
//                const employees = depts[deptName];
//                const header = employees[0];
//                const MAX_ROWS = 30; // 🚀 STRICTLY 20 ROWS PER PAGE

//                for (let i = 0; i < employees.length; i += MAX_ROWS) {
//                    const chunk = employees.slice(i, i + MAX_ROWS);
//                    const isLastPageOfDept = (i + MAX_ROWS >= employees.length);

//                    printHtml += `
//                        <div class="a4-page">
//                            <div class="rpt-header">
//                                <div class="rpt-header-left">
//                                    <img src="${window.location.origin}/aira.png" alt="Logo" class="rpt-logo">
//                                </div>
//                                <div class="rpt-header-center">
//                                    <h1>${header.companyName || header.CompanyName || 'AIRA EURO AUTOMATION PVT LTD'}</h1>
//                                    <div class="rpt-subtitle">${header.locationName || header.LocationName || 'aira(HO)'}</div>
//                                    <div class="rpt-title">MONTHLY KHARCHI REPORT</div>
//                                </div>
//                                <div class="rpt-header-right">
//                                    <div class="rpt-date-big">${new Date(year, month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
//                                    <div class="rpt-pg-text">Page ${Math.floor(i / MAX_ROWS) + 1} of ${Math.ceil(employees.length / MAX_ROWS)}</div>
//                                </div>
//                            </div>

//                            <div class="info-bar">
//                                <div class="info-item"><b>DIVISION:</b> ${divName}</div>
//                                <div class="info-item"><b>DEPARTMENT:</b> ${deptName}</div>
//                                <div class="info-item text-end" style="border:0"><b>TOTAL EMPLOYEE:</b> ${employees.length}</div>
//                            </div>

//                            <table class="rpt-table">
//                                <thead>
//                                    <tr>
//                                        <th width="40" style="text-align:center">SR.</th>
//                                        <th width="100">CODE</th>
//                                        <th>EMPLOYEE NAME</th>
//                                        <th width="150" style="text-align:right">KHARCHI AMOUNT (₹)</th>
//                                    </tr>
//                                </thead>
//                                <tbody>
//                                    ${chunk.map((e, idx) => {
//                        const amt = parseFloat(e.amount || e.Amount) || 0;
//                        return `
//                                        <tr>
//                                            <td align="center">${i + idx + 1}</td>
//                                            <td style="font-weight:600;">${e.employeeCode || e.EmployeeCode}</td>
//                                            <td>${e.employeeName || e.EmployeeName}</td>
//                                            <td align="right">
//                                                ${amt > 0
//                                ? `<span class="amt-val">₹ ${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>`
//                                : `<div class="amt-box"></div>`
//                            }
//                                            </td>
//                                        </tr>
//                                    `}).join('')}
//                                </tbody>
//                                ${isLastPageOfDept ? `
//                                <tfoot>
//                                    <tr>
//                                        <td colspan="3" align="right" style="font-weight:bold; background:#fafafa; padding: 4px 10px;">DEPARTMENT TOTAL:</td>
//                                        <td align="right" style="background:#fafafa; padding: 4px 10px;">
//                                            <div class="amt-box-solid"></div>
//                                        </td>
//                                    </tr>
//                                </tfoot>` : ''}
//                            </table>
//                        </div>
//                    `;
//                }
//            });
//        });

//        printWin.document.body.innerHTML = printHtml;
//        printWin.document.head.innerHTML = `
//            <style>
//                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

//                body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #555; }

//                .a4-page {
//                    background: white;
//                    width: 210mm;
//                    margin: 10mm auto;
//                    padding: 12mm;
//                    box-sizing: border-box;
//                    position: relative;
//                    box-shadow: 0 0 15px rgba(0,0,0,0.5);
//                    min-height: 295mm; /* Calculated to prevent spills */
//                }

//                .rpt-header { display: flex; justify-content: space-between; border-bottom: 3px solid #1a237e; padding-bottom: 10px; margin-bottom: 15px; align-items: center; }
//                .rpt-logo { height: 70px; width: auto; }

//                .rpt-header-center { flex: 1; text-align: center; }
//                .rpt-header-center h1 { margin: 0; font-size: 24px; color: #1a237e; font-weight: 800; }
//                .rpt-subtitle { font-size: 13px; color: #444; font-weight: 500; margin-top: 2px; }
//                .rpt-title { margin-top: 8px; font-size: 14px; font-weight: 700; color: #e11d48; text-transform: uppercase; }

//                .rpt-header-right { text-align: right; width: 150px; }
//                .rpt-date-big { font-weight: 800; font-size: 18px; color: #1e293b; }
//                .rpt-pg-text { font-size: 11px; color: #666; font-weight: 600; }

//                .info-bar { display: flex; border: 1px solid #ddd; margin-bottom: 12px; border-radius: 4px; border-left: 5px solid #1a237e; }
//                .info-item { flex: 1; padding: 6px 12px; font-size: 12px; border-right: 1px solid #ddd; font-weight: 600; }
//                .info-item b { color: #666; margin-right: 5px; font-size: 10px; }

//                .rpt-table { width: 100%; border-collapse: collapse; font-size: 13px; }
//                .rpt-table th { background: #f8fafc; border: 1px solid #999; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
//                .rpt-table td { border: 1px solid #ddd; padding: 6px 10px; height: 32px; color: #111; }

//                .amt-val { font-weight: 700; color: #000; }
//                .amt-box { border: 1px dashed #999; height: 22px; width: 100px; float: right; border-radius: 3px; }
//                .amt-box-solid { border: 1.5px solid #1a237e; height: 24px; width: 105px; float: right; border-radius: 4px; }

//                @media print {
//                    body { background: white !important; margin: 0 !important; padding: 0 !important; }
//                    .a4-page {
//                        margin: 0 !important;
//                        box-shadow: none !important;
//                        width: 100% !important;
//                        padding: 10mm !important;
//                        height: 297mm !important;
//                        page-break-after: always !important;
//                    }
//                    .a4-page:last-child { page-break-after: avoid !important; }
//                    @page { size: A4; margin: 0; }
//                }
//            </style>
//        `;

//        setTimeout(() => {
//            printWin.print();
//        }, 600);

//    } catch (err) {
//        if (printWin) printWin.close();
//        Swal.fire("Error", err.message, "error");
//    }
//}

//function groupBy(array, keyFn) {
//    return array.reduce((result, item) => {
//        const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
//        (result[key] = result[key] || []).push(item);
//        return result;
//    }, {});
//}



/**
 * AIRMAX PROFESSIONAL PRINT ENGINE - 30 ROWS + TOTALS + SIGN
 */

/**
 * AIRMAX PROFESSIONAL PRINT ENGINE - 40 ROWS + CONDITIONAL SYMBOLS
 */

async function printKharchiReport() {
    const dateVal = document.getElementById("txtKharchiDate").value;
    if (!dateVal) return Swal.fire("Required", "Please select a month first", "warning");
    const [year, month] = dateVal.split("-");

    const selectedBoxes = document.querySelectorAll('.chk-division:checked');
    let divIdList = Array.from(selectedBoxes).map(chk => chk.getAttribute('data-id')).join(',');

    if (!divIdList) return Swal.fire("Selection Required", "Please check a division checkbox.", "info");

    const printWin = window.open('', '_blank');
    printWin.document.write("<html><body><h2 style='text-align:center;margin-top:100px;'>Generating Print...</h2></body></html>");

    try {
        const res = await apiFetch(`${API}/get-print-data?month=${month}&year=${year}&divIds=${divIdList}`);
        const json = await res.json();

        if (!json.success || !json.data || json.data.length === 0) {
            printWin.close();
            return Swal.fire("No Data", "No employees found.", "info");
        }

        const groupedData = groupBy(json.data, d => d.divisionName || d.DivisionName);
        let printHtml = '';

        const divKeys = Object.keys(groupedData);
        divKeys.forEach((divName) => {
            const depts = groupBy(groupedData[divName], d => d.departmentName || d.DepartmentName);
            const deptKeys = Object.keys(depts);
            let divisionTotal = 0;

            deptKeys.forEach((deptName, deptIdx) => {
                const employees = depts[deptName];
                const MAX_ROWS = 40; // 🚀 UPDATED TO 40 ROWS
                let deptTotal = 0;

                for (let i = 0; i < employees.length; i += MAX_ROWS) {
                    const chunk = employees.slice(i, i + MAX_ROWS);
                    const isLastPageOfDept = (i + MAX_ROWS >= employees.length);
                    const isLastPageOfDiv = isLastPageOfDept && (deptIdx === deptKeys.length - 1);

                    // Calculate totals
                    chunk.forEach(e => {
                        const amt = parseFloat(e.amount || e.Amount) || 0;
                        deptTotal += amt;
                        divisionTotal += amt;
                    });

                    printHtml += `
                        <div class="a4-page">
                            <div class="rpt-header">
                                <div class="rpt-header-left"><img src="${window.location.origin}/aira.png" class="rpt-logo"></div>
                                <div class="rpt-header-center">
                                    <h1>${json.data[0].companyName || 'AIRMAX PVT. LTD.'}</h1>
                                    <div class="rpt-subtitle">aira(HO)</div>
                                    <div class="rpt-title">MONTHLY KHARCHI REPORT</div>
                                </div>
                                <div class="rpt-header-right">
                                    <div class="rpt-date-big">${new Date(year, month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
                                    <div class="rpt-pg-text">Page ${Math.floor(i / MAX_ROWS) + 1}</div>
                                </div>
                            </div>

                            <div class="info-bar">
                                <div class="info-item"><b>DIV:</b> ${divName}</div>
                                <div class="info-item"><b>DEPT:</b> ${deptName}</div>
                                <div class="info-item text-end" style="border:0"><b>EMP COUNT:</b> ${employees.length}</div>
                            </div>

                            <table class="rpt-table">
                                <thead>
                                    <tr>
                                        <th width="30" style="text-align:center">SR.</th>
                                        <th width="70">CODE</th>
                                        <th>EMPLOYEE NAME</th>
                                        <th width="120" style="text-align:right">AMOUNT</th>
                                        <th width="90" style="text-align:center">SIGN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${chunk.map((e, idx) => {
                                        const amt = parseFloat(e.amount || e.Amount) || 0;
                                        return `
                                        <tr>
                                            <td align="center">${i + idx + 1}</td>
                                            <td style="font-weight:600;">${e.employeeCode || e.EmployeeCode}</td>
                                            <td>${e.employeeName || e.EmployeeName}</td>
                                            <td align="right">
                                                ${amt > 0 
                                                    ? `<span class="amt-val">₹ ${amt.toLocaleString('en-IN')}</span>` 
                                                    : `<div class="amt-box-empty"></div>` /* ✅ REMOVED LINE */}
                                            </td>
                                            <td align="center"><div class="sign-box"></div></td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                                ${isLastPageOfDept ? `
                                    <tr class="footer-row">
                                        <td colspan="3" align="right"><b>DEPT TOTAL (${deptName}):</b></td>
                                        <td align="right"><b>${deptTotal > 0 ? '₹ ' + deptTotal.toLocaleString('en-IN') : '-'}</b></td>
                                        <td></td>
                                    </tr>` : ''}
                                ${isLastPageOfDiv ? `
                                    <tr class="footer-row division-footer">
                                        <td colspan="3" align="right"><b>GRAND TOTAL (${divName}):</b></td>
                                        <td align="right"><b>${divisionTotal > 0 ? '₹ ' + divisionTotal.toLocaleString('en-IN') : '-'}</b></td>
                                        <td></td>
                                    </tr>` : ''}
                            </table>
                        </div>
                    `;
                }
            });
        });

        printWin.document.body.innerHTML = printHtml;
        printWin.document.head.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #eee; }
                .a4-page { background: white; width: 210mm; margin: 10mm auto; padding: 8mm; box-sizing: border-box; box-shadow: 0 0 10px rgba(0,0,0,0.1); min-height: 296mm; }
                .rpt-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 8px; align-items: center; }
                .rpt-logo { height: 40px; }
                .rpt-header-center h1 { margin: 0; font-size: 18px; color: #1a237e; }
                .rpt-subtitle { font-size: 9px; color: #666; }
                .rpt-title { font-size: 11px; font-weight: 700; color: #e11d48; }
                .rpt-header-right { text-align: right; width: 150px; }
                .rpt-date-big { font-weight: 700; font-size: 12px; }
                .rpt-pg-text { font-size: 9px; }
                .info-bar { display: flex; border: 1px solid #000; margin-bottom: 5px; font-size: 10px; }
                .info-item { flex: 1; padding: 3px 8px; border-right: 1px solid #000; }
                .rpt-table { width: 100%; border-collapse: collapse; font-size: 10px; }
                .rpt-table th { border: 1px solid #000; padding: 3px; background: #f0f0f0; }
                .rpt-table td { border: 1px solid #000; padding: 2px 6px; height: 18px; } /* ✅ SMALLER HEIGHT FOR 40 ROWS */
                .amt-box-empty { height: 16px; width: 80px; } /* ✅ NO BORDER LINE */
                .sign-box { height: 16px; width: 100%; }
                .footer-row td { background: #f9f9f9; font-size: 11px; border-top: 1.5px solid #000; height: 22px; }
                .division-footer td { background: #e3f2fd !important; color: #0d47a1; }
                @media print {
                    body { background: white; }
                    .a4-page { margin: 0; box-shadow: none; width: 100%; height: 297mm; page-break-after: always; }
                    .a4-page:last-child { page-break-after: avoid; }
                    @page { size: A4; margin: 0; }
                }
            </style>
        `;
        setTimeout(() => printWin.print(), 500);
    } catch (err) { printWin.close(); Swal.fire("Error", err.message, "error"); }
}

function groupBy(array, keyFn) {
    return array.reduce((result, item) => {
        const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
        (result[key] = result[key] || []).push(item);
        return result;
    }, {});
}
