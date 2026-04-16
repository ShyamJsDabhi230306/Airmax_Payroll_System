using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [ApiController]
    [Route("api/master/division")]
    public class MasterDivisionController : ControllerBase
    {
        private readonly MasterDivisionService _service;

        public MasterDivisionController(MasterDivisionService service)
        {
            _service = service;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            int compId = User.GetIDCompany();
            int locId = User.GetIDLocation();
            int divId = User.GetIDDepartment(); // Using common helper for ID filter

            if (!User.IsAdmin())
            {
                var filteredData = await _service.GetAllAsync(compId, locId, divId);
                return Ok(ApiResponse<IEnumerable<MasterDivision>>.SuccessResponse("Divisions loaded safely", filteredData));
            }
            else
            {
                var allData = await _service.GetAllAsync(0, 0, 0);
                return Ok(ApiResponse<IEnumerable<MasterDivision>>.SuccessResponse("All Divisions loaded (Admin view)", allData));
            }
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);
            return Ok(new { success = true, data });
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterDivision model)
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
    }
}
