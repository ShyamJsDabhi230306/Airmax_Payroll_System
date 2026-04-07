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
    [Route("api/master/employee")]
    [ApiController]
    public class MasterEmployeeController : ControllerBase
    {
        private readonly MasterEmployeeService _service;

        public MasterEmployeeController(MasterEmployeeService service)
        {
            _service = service;
        }

        // 🔹 GET ALL
        //[HttpGet("get-all")]
        //public async Task<IActionResult> GetAll()
        //{
        //    var data = await _service.GetAllAsync();

        //    return Ok(ApiResponse<IEnumerable<MasterEmployee>>.SuccessResponse(
        //        "Employees loaded successfully", data));
        //}

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            // 💡 AUTOMATICALLY GET USER RIGHTS:
            int compId = User.GetIDCompany();
            int locId = User.GetIDLocation();
            int deptId = User.GetIDDepartment();
            // 💡 If NOT an Admin, we force the filters. If Admin, we show everything.
            if (!User.IsAdmin())
            {
                // 🔥 Call the service with the filters
                var data = await _service.GetAllAsync(compId, locId, deptId);
                return Ok(ApiResponse<IEnumerable<MasterEmployee>>.SuccessResponse("Data loaded securely!", data));
            }
            else
            {
                // 🔥 Admin sees EVERYTHING (pass 0 for no filter)
                var allData = await _service.GetAllAsync(0, 0, 0);
                return Ok(ApiResponse<IEnumerable<MasterEmployee>>.SuccessResponse("All Data loaded (Admin view)", allData));
            }
        }

        // 🔹 GET BY ID
        [HttpGet("get-by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);

            if (data == null)
                return Ok(ApiResponse<string>.FailResponse("Employee not found"));

            return Ok(ApiResponse<MasterEmployee>.SuccessResponse(
                "Employee loaded successfully", data));
        }

        // 🔹 SAVE
        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterEmployee emp)
        {
            var result = await _service.SaveAsync(emp);

            if (result.Result != 1)
            {
                return Ok(ApiResponse<string>.FailResponse(
                    result.Message, result.ErrorCode));
            }

            return Ok(ApiResponse<object>.SuccessResponse(
                result.Message,
                new
                {
                    newId = result.NewId,
                    data = emp
                }));
        }

        // 🔹 DELETE
        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (result.Result != 1)
            {
                return Ok(ApiResponse<string>.FailResponse(
                    result.Message, result.ErrorCode));
            }

            return Ok(ApiResponse<string>.SuccessResponse(result.Message));
        }

        [HttpGet("by-department/{id}")]
        public async Task<IActionResult> GetByDepartment(int id)
        {
            var data = await _service.GetByDepartmentAsync(id);

            return Ok(new
            {
                success = true,
                data
            });
        }
    }
}
