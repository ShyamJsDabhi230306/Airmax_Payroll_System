using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.AllDTOS;
using Airmax_Payroll_System.Models.Transaction;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ClosedXML.Excel;
using System.IO;

namespace Airmax_Payroll_System.Controllers.API
{
    [Authorize]
    [Route("api/transaction/kharchi")]
    [ApiController]
    public class TransactionEmployeeKharchiController : ControllerBase
    {
        private readonly TransactionEmployeeKharchiService _service;

        public TransactionEmployeeKharchiController(TransactionEmployeeKharchiService service)
        {
            _service = service;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll(int idDivision = 0, int month = 0, int year = 0, string search = "")
        {
            bool isAdmin = User.IsAdmin();
            int filterDivId = isAdmin ? idDivision : User.GetIDDivision();

            // Pass the search term to the service
            var data = await _service.GetAllAsync(filterDivId, month, year, search);

            return Ok(new { success = true, data });
        }


        [HttpGet("get-by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);
            return Ok(new { success = true, data });
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] TransactionEmployeeKharchiSaveDto model)
        {
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            model.E_By = loggedInUserFullName;
            var result = await _service.SaveAsync(model);

            return Ok(new
            {
                success = result.Result == 1,
                message = result.Message
            });
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            var result = await _service.DeleteAsync(id, loggedInUserFullName);

            return Ok(new
            {
                success = result.Result == 1,
                message = result.Message
            });
        }

        [HttpGet("generate-no")]
        public async Task< IActionResult > GenerateKharchiNo()
        {
            // Example logic
            // 🔥 Calls the sequence logic from the Repo
            var nextNo = await _service.GenerateKharchiNoAsync();
            return Ok(new
            {
                success = true,
                data = nextNo // This will return "001", "002", etc.
            });
        }


        [HttpGet("get-divisions-with-count")]
        public async Task<IActionResult> GetDivisionsWithCount()
        {
            // If Admin, pass 0 to see all divisions. Otherwise pass user's Division ID.
            int divId = User.IsAdmin() ? 0 : User.GetIDDivision();
            var data = await _service.GetDivisionsWithCountAsync(divId);
            return Ok(new { success = true, data });
        }

        [HttpGet("load-employees/{idDivision}")]
        public async Task<IActionResult> LoadEmployees(int idDivision, int month = 0, int year = 0)
        {
            // Pass month and year to the service
            var data = await _service.LoadEmployeesForKharchiAsync(idDivision, month, year);
            return Ok(new { success = true, data });
        }



        [HttpGet("get-departments/{id}")]
        public async Task<IActionResult> GetDepartments(int id, [FromQuery] int month, [FromQuery] int year)
        {
            // Make sure you pass month and year to the service!
            var data = await _service.GetDepartmentsWithCountAsync(id, month, year);
            return Ok(new { success = true, data });
        }

        [HttpGet("get-print-data")]
        public async Task<IActionResult> GetPrintData([FromQuery] int month, [FromQuery] int year, [FromQuery] string divIds)
        {
            // 🔥 Ensure 'divIds' is passed as a string
            var data = await _service.GetPrintReportAsync(month, year, divIds);
            return Ok(new { success = true, data });
        }


        


        [HttpGet("export-excel")]
        public async Task<IActionResult> ExportToExcel([FromQuery] int month, [FromQuery] int year, [FromQuery] string divIds)
        {
            var data = await _service.GetPrintReportAsync(month, year, divIds);

            if (data == null || !data.Any())
                return NotFound("No data found to export.");

            using (var workbook = new XLWorkbook())
            {
                var groupedByDivDept = data.GroupBy(x => new { x.DivisionName, x.DepartmentName });

                foreach (var group in groupedByDivDept)
                {
                    string divName = group.Key.DivisionName ?? "DIV";
                    string deptName = group.Key.DepartmentName ?? "DEPT";

                    string fullSheetName = $"{divName} - {deptName}";
                    string safeSheetName = string.Join("-", fullSheetName.Split(Path.GetInvalidFileNameChars())).Replace("[", "").Replace("]", "");
                    if (safeSheetName.Length > 31) safeSheetName = safeSheetName.Substring(0, 31);

                    var worksheet = workbook.Worksheets.Add(safeSheetName);
                    int currentRow = 1;
                    int headerStartRow = currentRow;

                    // --- 1. CONNECTED HEADER BOX ---
                    worksheet.Range(currentRow, 1, currentRow, 5).Merge().Value = "Aira Euro Automation Pvt.Ltd.";
                    worksheet.Range(currentRow, 1, currentRow, 5).Style.Font.SetBold().Font.SetFontSize(16).Font.SetFontColor(XLColor.FromHtml("#1a237e")).Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
                    currentRow++;

                    worksheet.Range(currentRow, 1, currentRow, 5).Merge().Value = "aira(HO)";
                    worksheet.Range(currentRow, 1, currentRow, 5).Style.Font.SetFontSize(10).Font.SetFontColor(XLColor.Gray).Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
                    currentRow++;

                    worksheet.Range(currentRow, 1, currentRow, 5).Merge().Value = $"KHARCHI REPORT: {divName.ToUpper()} / {deptName.ToUpper()}";
                    worksheet.Range(currentRow, 1, currentRow, 5).Style.Font.SetBold().Font.SetFontSize(12).Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
                    currentRow++;

                    worksheet.Range(currentRow, 1, currentRow, 5).Merge().Value = $"Period: {new DateTime(year, month, 1):MMMM yyyy}";
                    worksheet.Range(currentRow, 1, currentRow, 5).Style.Font.SetFontSize(11).Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

                    // Apply Box to Header
                    var headerBox = worksheet.Range(headerStartRow, 1, currentRow, 5);
                    headerBox.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;
                    headerBox.Style.Border.InsideBorder = XLBorderStyleValues.None;

                    currentRow++; // Move to next row for Table Header (NO GAP)

                    // --- 2. TABLE HEADERS ---
                    worksheet.Cell(currentRow, 1).Value = "SR.";
                    worksheet.Cell(currentRow, 2).Value = "CODE";
                    worksheet.Cell(currentRow, 3).Value = "EMPLOYEE NAME";
                    worksheet.Cell(currentRow, 4).Value = "AMOUNT";
                    worksheet.Cell(currentRow, 5).Value = "SIGNATURE";

                    var tableHeaderRange = worksheet.Range(currentRow, 1, currentRow, 5);
                    tableHeaderRange.Style.Font.Bold = true;
                    tableHeaderRange.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#2c3e50"));
                    tableHeaderRange.Style.Font.FontColor = XLColor.White;
                    tableHeaderRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    tableHeaderRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin; // Vertical lines
                    currentRow++;

                    // --- 3. EMPLOYEE DATA ---
                    int sr = 1;
                    decimal total = 0;
                    foreach (var emp in group)
                    {
                        worksheet.Cell(currentRow, 1).Value = sr++;
                        worksheet.Cell(currentRow, 2).Value = emp.EmployeeCode;
                        worksheet.Cell(currentRow, 3).Value = emp.EmployeeName;

                        if (emp.Amount > 0)
                        {
                            worksheet.Cell(currentRow, 4).Value = emp.Amount;
                            worksheet.Cell(currentRow, 4).Style.NumberFormat.Format = "#,##0.00";
                        }

                        var rowRange = worksheet.Range(currentRow, 1, currentRow, 5);
                        rowRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                        rowRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin; // Vertical lines

                        total += emp.Amount;
                        currentRow++;
                    }

                    // --- 4. FOOTER TOTAL ---
                    worksheet.Cell(currentRow, 3).Value = "TOTAL:";
                    worksheet.Cell(currentRow, 3).Style.Font.Bold = true;
                    worksheet.Cell(currentRow, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                    if (total > 0)
                    {
                        worksheet.Cell(currentRow, 4).Value = total;
                        worksheet.Cell(currentRow, 4).Style.NumberFormat.Format = "#,##0.00";
                    }
                    worksheet.Cell(currentRow, 4).Style.Font.Bold = true;

                    var footerRange = worksheet.Range(currentRow, 1, currentRow, 5);
                    footerRange.Style.Fill.SetBackgroundColor(XLColor.AliceBlue);
                    footerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    footerRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;

                    worksheet.Columns().AdjustToContents();
                }

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    string fileName = $"Kharchi_Report_{DateTime.Now:dd-MM-yyyy_HH-mm}.xlsx";
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
                }
            }
        }


    }
}
