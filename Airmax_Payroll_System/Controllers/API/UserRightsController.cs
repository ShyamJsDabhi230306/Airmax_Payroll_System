using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Authorize] // 🛡️ Protect this API
    [ApiController]
    [Route("api/master/userrights")]
    public class UserRightsController : ControllerBase
    {
        private readonly UserRightsService _service;
        public UserRightsController(UserRightsService service)
        {
            _service = service;
        }
        // GET - Cascading Filter Data
        [HttpGet("get-locations/{companyId:int}")]
        public async Task<IActionResult> GetLocations(int companyId) => Ok(await _service.GetLocationsAsync(companyId));
        [HttpGet("get-departments/{locationId:int}")]
        public async Task<IActionResult> GetDepartments(int locationId) => Ok(await _service.GetDepartmentsAsync(locationId));
        [HttpGet("get-users/{deptId:int}")]
        public async Task<IActionResult> GetUsers(int deptId) => Ok(await _service.GetUsersAsync(deptId));
        // GET - All page permissions for a user
        [HttpGet("get-permissions/{userId:int}")]
        public async Task<IActionResult> GetPermissions(int userId)
        {
            var data = await _service.GetPermissionsAsync(userId);
            return Ok(ApiResponse<IEnumerable<UserPagePermission>>.SuccessResponse("Permissions loaded", data));
        }
        // POST - Update user rights
        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] UserRightsSaveDto model)
        {
            var result = await _service.SavePermissionsAsync(model);
            if (result.Result != 1) return BadRequest(ApiResponse<string>.FailResponse(result.Message));

            return Ok(ApiResponse<string>.SuccessResponse(result.Message));
        }
    }
}
