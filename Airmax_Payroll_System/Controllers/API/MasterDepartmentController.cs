using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Authorize]
    [ApiController]
    [Route("api/master/department")]
    public class DepartmentController : ControllerBase
    {
        private readonly MasterDepartmentService _service;

        public DepartmentController(MasterDepartmentService service)
        {
            _service = service;
        }

        //[HttpGet("get-all")]
        //public async Task<IActionResult> GetAll()
        //{
        //    var data = await _service.GetAllAsync();
        //    return Ok(new { success = true, data });
        //}

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            // 💡 GET USER PERMISSIONS:
            int compId = User.GetIDCompany();
            int locId = User.GetIDLocation();
            int deptId = User.GetIDDepartment();
            if (!User.IsAdmin())
            {
                // 🔥 Non-admin users only see their own Departments
                var filteredData = await _service.GetAllAsync(compId, locId, deptId);
                return Ok(ApiResponse<IEnumerable<MasterDepartment>>.SuccessResponse("Departments loaded securely!", filteredData));
            }
            else
            {
                // 🔥 Admin sees EVERYTHING (pass 0 for no filter)
                var allData = await _service.GetAllAsync(0, 0, 0);
                return Ok(ApiResponse<IEnumerable<MasterDepartment>>.SuccessResponse("All Departments loaded (Admin view)", allData));
            }
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);
            return Ok(new { success = true, data });
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterDepartment model)
        {
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
            var result = await _service.DeleteAsync(id);

            return Ok(new
            {
                success = result.Result == 1,
                message = result.Message
            });
        }
    }
}