using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Authorize]
    [ApiController]
    [Route("api/master/biometric-device")]
    public class MasterBiomatricDevicesController : ControllerBase
    {
        private readonly MasterBiomatricDevicesService _service;
        public MasterBiomatricDevicesController(MasterBiomatricDevicesService service)
        {
            _service = service;
        }
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(new { success = true, data });
        }
        [HttpGet("get-by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);
            return Ok(new { success = true, data });
        }
        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterBiomatricDevices model)
        {
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            var result = await _service.SaveAsync(model, loggedInUserFullName);
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
