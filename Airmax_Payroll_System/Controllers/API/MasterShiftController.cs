using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{   
    [ApiController]
    [Route("api/master/shift")]
    public class MasterShiftController : ControllerBase
    {
        private readonly MasterShiftService _shiftService;

        public MasterShiftController(MasterShiftService shiftService)
        {
            _shiftService = shiftService;
        }

        // ---------------------------------------------------------
        // GET ALL
        // ---------------------------------------------------------
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var shifts = await _shiftService.GetAllAsync();

            return Ok(ApiResponse<IEnumerable<MasterShift>>.SuccessResponse(
                "Shifts loaded successfully", shifts));
        }

        // ---------------------------------------------------------
        // GET BY ID
        // ---------------------------------------------------------
        [HttpGet("get-by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var shift = await _shiftService.GetByIdAsync(id);

            if (shift == null)
                return Ok(ApiResponse<string>.FailResponse("Shift not found"));

            return Ok(ApiResponse<MasterShift>.SuccessResponse(
                "Shift loaded successfully", shift));
        }

        // ---------------------------------------------------------
        // SAVE
        // ---------------------------------------------------------
        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterShift shift)
        {
            var result = await _shiftService.SaveAsync(shift);

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
                    data = shift
                }));
        }

        // ---------------------------------------------------------
        // DELETE
        // ---------------------------------------------------------
        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _shiftService.DeleteAsync(id);

            if (result.Result != 1)
            {
                return Ok(ApiResponse<string>.FailResponse(
                    result.Message, result.ErrorCode));
            }

            return Ok(ApiResponse<string>.SuccessResponse(
                result.Message));
        }
    }
}