using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Route("api/master/employeegroupbonusdetails")]
    [ApiController]
    public class MasterEmployeeGroupBonusDetailsController : ControllerBase
    {
        private readonly MasterEmployeeGroupBonusDetailsService _service;

        public MasterEmployeeGroupBonusDetailsController(
            MasterEmployeeGroupBonusDetailsService service)
        {
            _service = service;
        }

        // ---------------------------------------------------------
        // GET ALL
        // ---------------------------------------------------------
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();

            return Ok(ApiResponse<IEnumerable<MasterEmployeeGroupBonusDetails>>
                .SuccessResponse("Data loaded successfully", data));
        }

        // ---------------------------------------------------------
        // GET BY ID
        // ---------------------------------------------------------
        [HttpGet("get-by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);

            if (data == null)
                return Ok(ApiResponse<string>
                    .FailResponse("Record not found"));

            return Ok(ApiResponse<MasterEmployeeGroupBonusDetails>
                .SuccessResponse("Data loaded successfully", data));
        }

        // ---------------------------------------------------------
        // SAVE
        // ---------------------------------------------------------
        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterEmployeeGroupBonusDetails model)
        {
            var result = await _service.SaveAsync(model);

            if (result.Result != 1)
                return Ok(ApiResponse<string>
                    .FailResponse(result.Message, result.ErrorCode));

            return Ok(ApiResponse<object>
                .SuccessResponse(result.Message,
                new
                {
                    newId = result.NewId,
                    data = model
                }));
        }

        // ---------------------------------------------------------
        // DELETE
        // ---------------------------------------------------------
        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (result.Result != 1)
                return Ok(ApiResponse<string>
                    .FailResponse(result.Message, result.ErrorCode));

            return Ok(ApiResponse<string>
                .SuccessResponse(result.Message));
        }
    }
}
