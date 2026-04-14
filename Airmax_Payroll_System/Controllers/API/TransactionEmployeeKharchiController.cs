using Airmax_Payroll_System.Models.AllDTOS;
using Airmax_Payroll_System.Models.Transaction;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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



       

    }
}
