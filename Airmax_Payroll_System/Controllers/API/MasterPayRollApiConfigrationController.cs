using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Airmax_Payroll_System.Controllers.API
{
    [Authorize]
    [ApiController]
    [Route("api/master/payroll-api-config")]
    public class MasterPayRollApiConfigrationController : ControllerBase
    {
        private readonly MasterPayRollApiConfigrationService _service;

        public MasterPayRollApiConfigrationController(MasterPayRollApiConfigrationService service)
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
        public async Task<IActionResult> Save([FromBody] MasterPayRollApiConfigration model)
        {
            try
            {
                var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
                var result = await _service.SaveAsync(model, loggedInUserFullName);

                if (result == null)
                    return StatusCode(500, new { success = false, message = "Save operation returned no result from database." });

                return Ok(new
                {
                    success = result.Result == 1,
                    message = result.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
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
