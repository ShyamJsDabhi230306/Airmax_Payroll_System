using Airmax_Payroll_System.Models.AllDTOS;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Authorize]
    [Route("api/transaction/employee-loan")]
    [ApiController]
    public class TransactionEmployeeLoanController : ControllerBase
    {
        private readonly TransactionEmployeeLoanService _service;
        public TransactionEmployeeLoanController(TransactionEmployeeLoanService service) { _service = service; }
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            // 1. Get user role and department from token
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value?.ToLower() ?? "";
            var deptIdStr = User.FindFirst("IDDepartment")?.Value ?? "0";
            int.TryParse(deptIdStr, out int deptId);

            // 2. If user is Admin, we show EVERYTHING (deptId = 0)
            if (role.Contains("admin") || role.Contains("super")) { deptId = 0; }

            var data = await _service.GetAllAsync(deptId);
            return Ok(new { success = true, data });
        }

        [HttpGet("get-by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
             var data = await _service.GetByIdAsync(id);
            return Ok(new { success = true, data });
        }
        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] TransactionEmployeeLoanSaveDto model)
        {
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            model.E_By = loggedInUserFullName;
            var result = await _service.SaveAsync(model);
            return Ok(new { success = result.Result == 1, message = result.Message });
        }
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            var result = await _service.DeleteAsync(id , loggedInUserFullName);
            return Ok(new { success = result.Result == 1, message = result.Message });
        }
        [HttpGet("generate-no")]
        public async Task<IActionResult> GenerateLoanNo()
        {
            var nextNo = await _service.GenerateNoAsync();
            return Ok(new { success = true, data = nextNo });
        }



        [HttpPost("skip-month")]
        public async Task<IActionResult> SkipMonth([FromBody] EmployeeLoanSkipDto model)
        {
            var res = await _service.SkipMonthAsync(model.IDEmployeeLoanDetails);
            return Ok(new { success = res.Result == 1, message = res.Message });
        }

        [HttpPost("reschedule")]
        public async Task<IActionResult> Reschedule([FromBody] EmployeeLoanRescheduleDto model)
        {
            var res = await _service.RescheduleAsync(model);
            return Ok(new { success = res.Result == 1, message = res.Message });
        }

        [HttpGet("check-active/{employeeId:int}")]
        public async Task<IActionResult> CheckActiveLoan(int employeeId)
        {
            var hasActive = await _service.HasActiveLoanAsync(employeeId);
            if (hasActive)
                return Ok(new { success = false, message = "This employee already has an active loan. Close the existing loan before creating a new one." });

            return Ok(new { success = true, message = "No active loan found." });
        }


        [HttpGet("get-dashboard")]
        public async Task<IActionResult> GetDashboard(int idDivision = 0, int idDepartment = 0, string status = "All")
        {
            // Get user role and department for filtering
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value?.ToLower() ?? "";
            var deptIdStr = User.FindFirst("IDDepartment")?.Value ?? "0";
            int.TryParse(deptIdStr, out int deptId);
            // Admin bypasses department filter
            if (role.Contains("admin")) { deptId = 0; }
            else if (idDepartment == 0) { idDepartment = deptId; }
            var result = await _service.GetDashboardDataAsync(idDivision, idDepartment, status);
            return Ok(new { success = true, stats = result.Stats, data = result.Loans });
        }


        [HttpGet("by-employee/{id:int}")]
        public async Task<IActionResult> GetByEmployee(int id)
        {
            var data = await _service.GetByEmployeeAsync(id);
            return Ok(new { success = true, data });
        }

        [HttpGet("get-schedule/{id:int}")]
        public async Task<IActionResult> GetSchedule(int id)
        {
            var result = await _service.GetScheduleAsync(id);
            return Ok(new { success = true, header = result.Header, details = result.Details });
        }


    }
}
