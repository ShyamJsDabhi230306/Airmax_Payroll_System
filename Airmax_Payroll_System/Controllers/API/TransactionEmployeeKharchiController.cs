using Airmax_Payroll_System.Helpers;
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
        public async Task<IActionResult> GetAll(int idDivision = 0, int month = 0, int year = 0)
        {
            // 1. Get user status
            bool isAdmin = User.IsAdmin();

            // 2. Security: If user is Admin, they can filter by any Division. 
            // If not, we FORCE the filter to be their own Division.
            int filterDivId = isAdmin ? idDivision : User.GetIDDivision();

            // 3. Fetch summary data (Division-wise) using the new SP
            var data = await _service.GetAllAsync(filterDivId, month, year);

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
        [HttpGet("load-employees/{divId:int}")]
        public async Task<IActionResult> LoadEmployees(int divId)
        {
            var data = await _service.LoadEmployeesForKharchiAsync(divId);
            return Ok(new { success = true, data });
        }


        [HttpGet("get-departments/{divId:int}")]
        public async Task<IActionResult> GetDepartmentsByDivision(int divId)
        {
            // If divId is 0, we fetch based on user's authorized division
            int targetDivId = divId == 0 ? (User.IsAdmin() ? 0 : User.GetIDDivision()) : divId;

            var data = await _service.GetDepartmentsWithCountAsync(targetDivId);
            return Ok(new { success = true, data });
        }

        
    }
}
