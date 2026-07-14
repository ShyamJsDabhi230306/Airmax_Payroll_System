using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Authorize]
    [ApiController]
    [Route("api/master/holiday")]
    public class MasterHolidayController : ControllerBase
    {
        private readonly MasterHolidayService _service;

        public MasterHolidayController(MasterHolidayService service)
        {
            _service = service;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();

            return Ok(ApiResponse<IEnumerable<MasterHoliday>>
                .SuccessResponse("Holidays loaded successfully", data));
        }

        [HttpGet("get-by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);

            if (data == null)
                return Ok(ApiResponse<string>.FailResponse("Holiday not found"));

            return Ok(ApiResponse<MasterHoliday>
                .SuccessResponse("Holiday loaded successfully", data));
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterHoliday model)
        {
            var userFullName = User.FindFirst("FullName")?.Value ?? "System";

            var result = await _service.SaveAsync(model, userFullName);

            if (result.Result != 1)
                return Ok(ApiResponse<string>
                    .FailResponse(result.Message, result.ErrorCode));

            return Ok(ApiResponse<object>
                .SuccessResponse(result.Message, new
                {
                    newId = result.NewId,
                    data = model
                }));
        }

        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userFullName = User.FindFirst("FullName")?.Value ?? "System";

            var result = await _service.DeleteAsync(id, userFullName);

            if (result.Result != 1)
                return Ok(ApiResponse<string>
                    .FailResponse(result.Message, result.ErrorCode));

            return Ok(ApiResponse<string>
                .SuccessResponse(result.Message));
        }

        [HttpGet("get-by-month")]
        public async Task<IActionResult> GetByMonth([FromQuery] string holidayMonth)
        {
            if (string.IsNullOrWhiteSpace(holidayMonth))
            {
                return Ok(ApiResponse<string>.FailResponse("Holiday month is required."));
            }

            if (!DateTime.TryParse(holidayMonth, out var monthDate))
            {
                return Ok(ApiResponse<string>.FailResponse("Invalid holiday month."));
            }

            var data = await _service.GetByMonthAsync(monthDate);

            return Ok(ApiResponse<IEnumerable<MasterHoliday>>
                .SuccessResponse("Holiday loaded successfully", data));
        }
    }
}