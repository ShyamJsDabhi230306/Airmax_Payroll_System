using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Route("api/master/employeegroup")]
    [ApiController]
    public class MasterEmployeeGroupController : ControllerBase
    {

        private readonly MasterEmployeeGroupService _service;

        public MasterEmployeeGroupController(MasterEmployeeGroupService service)
        {
            _service = service;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();

            return Ok(ApiResponse<IEnumerable<MasterEmployeeGroup>>
                .SuccessResponse("Loaded successfully", data));
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);

            if (data == null)
                return Ok(ApiResponse<string>.FailResponse("Not found"));

            return Ok(ApiResponse<MasterEmployeeGroup>
                .SuccessResponse("Loaded successfully", data));
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterEmployeeGroup model)
        {
            var result = await _service.SaveAsync(model);

            if (result.Result != 1)
                return Ok(ApiResponse<string>.FailResponse(result.Message));

            return Ok(ApiResponse<object>.SuccessResponse(result.Message, new
            {
                newId = result.NewId
            }));
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (result.Result != 1)
                return Ok(ApiResponse<string>.FailResponse(result.Message));

            return Ok(ApiResponse<string>.SuccessResponse(result.Message));
        }
    }
}
