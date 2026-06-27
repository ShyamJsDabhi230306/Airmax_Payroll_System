using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction.Salary;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [ApiController]
    [Route("api/transaction/salary")]
    public class TransactionSalaryController : ControllerBase
    {
        private readonly TransactionSalaryService _salaryService;

        public TransactionSalaryController(TransactionSalaryService salaryService)
        {
            _salaryService = salaryService;
        }

        [HttpGet("configuration")]
        public async Task<IActionResult> GetConfiguration(
            [FromQuery] int idCompany,
            [FromQuery] int? idEmployeeGroup)
        {
            var result = await _salaryService.GetConfigurationAsync(idCompany, idEmployeeGroup);

            return Ok(ApiResponse<SalaryConfigurationResponse>.SuccessResponse(
                "Salary configuration loaded successfully.",
                result
            ));
        }

        [HttpPost("attendance-monthly-metrics")]
        public async Task<IActionResult> GetAttendanceMonthlyMetrics([FromBody] SalaryFilterRequest request)
        {
            var result = await _salaryService.GetAttendanceMonthlyMetricsAsync(request);

            return Ok(ApiResponse<IEnumerable<SalaryAttendanceMonthlyMetric>>.SuccessResponse(
                "Attendance monthly metrics loaded successfully.",
                result
            ));
        }

        [HttpGet("employee-daily-attendance")]
        public async Task<IActionResult> GetEmployeeDailyAttendance(
     [FromQuery] DateTime salaryMonth,
     [FromQuery] int idCompany,
     [FromQuery] int? idEmployee,
     [FromQuery] string? employeeCode = null)
        {
            var result = await _salaryService.GetEmployeeDailyAttendanceAsync(
                salaryMonth,
                idCompany,
                idEmployee,
                employeeCode
            );

            return Ok(ApiResponse<IEnumerable<SalaryEmployeeDailyAttendance>>.SuccessResponse(
                "Employee daily attendance loaded successfully.",
                result
            ));
        }

        [HttpPost("manual-attendance-save")]
        public async Task<IActionResult> SaveManualAttendance([FromBody] ManualAttendanceSaveRequest request)
        {
            var username = User.FindFirst("FullName")?.Value ?? "System";

            var result = await _salaryService.SaveManualAttendanceAsync(request, username);

            if (result == null)
            {
                return Ok(ApiResponse<string>.FailResponse(
                    "Failed to save manual attendance."
                ));
            }

            return Ok(ApiResponse<SalaryEmployeeDailyAttendance>.SuccessResponse(
                "Manual attendance saved successfully.",
                result
            ));
        }

        [HttpPost("deduction-monthly")]
        public async Task<IActionResult> GetDeductionMonthly([FromBody] SalaryFilterRequest request)
        {
            var result = await _salaryService.GetDeductionMonthlyAsync(request);

            return Ok(ApiResponse<IEnumerable<SalaryDeductionMonthly>>.SuccessResponse(
                "Salary deductions loaded successfully.",
                result
            ));
        }

        [HttpPost("preview")]
        public async Task<IActionResult> GetSalaryPreview([FromBody] SalaryFilterRequest request)
        {
            var result = await _salaryService.GetSalaryPreviewAsync(request);

            return Ok(ApiResponse<IEnumerable<SalaryPreviewRow>>.SuccessResponse(
                "Salary preview loaded successfully.",
                result
            ));
        }

        [HttpGet("live-breakdown")]
        public async Task<IActionResult> GetLiveBreakdown(
            [FromQuery] DateTime salaryMonth,
            [FromQuery] int idCompany,
            [FromQuery] int idEmployee)
        {
            var result = await _salaryService.GetLiveBreakdownAsync(
                salaryMonth,
                idCompany,
                idEmployee
            );

            return Ok(ApiResponse<SalaryBreakdownResponse>.SuccessResponse(
                "Salary breakdown loaded successfully.",
                result
            ));
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveSalaryProcess([FromBody] SalaryFilterRequest request)
        {
            var username = User.FindFirst("FullName")?.Value ?? "System";

            var result = await _salaryService.SaveSalaryProcessAsync(request, username);

            if (result.Result != 1)
            {
                return Ok(ApiResponse<string>.FailResponse(
                    result.Message,
                    result.ErrorCode
                ));
            }

            return Ok(ApiResponse<SaveResult>.SuccessResponse(
                result.Message,
                result
            ));
        }

        [HttpPost("saved")]
        public async Task<IActionResult> GetSavedSalary([FromBody] SalaryFilterRequest request)
        {
            var result = await _salaryService.GetSavedSalaryAsync(request);

            return Ok(ApiResponse<IEnumerable<SalaryProcessRow>>.SuccessResponse(
                "Saved salary loaded successfully.",
                result
            ));
        }

        [HttpGet("saved-components/{idSalaryProcess:int}")]
        public async Task<IActionResult> GetSavedSalaryComponents(int idSalaryProcess)
        {
            var result = await _salaryService.GetSavedSalaryComponentsAsync(idSalaryProcess);

            return Ok(ApiResponse<IEnumerable<SalaryProcessComponent>>.SuccessResponse(
                "Saved salary components loaded successfully.",
                result
            ));
        }
    }
}