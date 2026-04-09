using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [ApiController]
    [Route("api/master/designation")]
    public class MasterDesignationController : ControllerBase
    {
        private readonly MasterDesignationService _designationService;

        public MasterDesignationController(MasterDesignationService designationService)
        {
            _designationService = designationService;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _designationService.GetAllAsync();

            return Ok(ApiResponse<IEnumerable<MasterDesignation>>.SuccessResponse(
                "Designation loaded successfully", data));
        }

        [HttpGet("get-by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _designationService.GetByIdAsync(id);

            if (data == null)
                return Ok(ApiResponse<string>.FailResponse("Designation not found"));

            return Ok(ApiResponse<MasterDesignation>.SuccessResponse(
                "Designation loaded successfully", data));
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterDesignation model)
        {
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            model.E_By = loggedInUserFullName;
            var result = await _designationService.SaveAsync(model);

            if (result.Result != 1)
                return Ok(ApiResponse<string>.FailResponse(result.Message, result.ErrorCode));

            return Ok(ApiResponse<object>.SuccessResponse(
                result.Message,
                new
                {
                    newId = result.NewId,
                    data = model
                }));
        }

        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            var result = await _designationService.DeleteAsync(id , loggedInUserFullName);

            if (result.Result != 1)
                return Ok(ApiResponse<string>.FailResponse(result.Message, result.ErrorCode));

            return Ok(ApiResponse<string>.SuccessResponse(result.Message));
        }
    }
}