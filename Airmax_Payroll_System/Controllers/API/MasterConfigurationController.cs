using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Route("api/master/configuration")]
    [ApiController]
    public class MasterConfigurationController : ControllerBase
    {
        private readonly MasterConfigurationService _service;
        public MasterConfigurationController(MasterConfigurationService service)
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
        public async Task<IActionResult> Save([FromBody] Master_Configuration model)
        {
            try
            {
                var loggedInUser = User.FindFirst("FullName")?.Value ?? "System";
                model.E_By = loggedInUser;
                model.U_By = loggedInUser;
                var result = await _service.SaveAsync(model);
                return Ok(new { success = result.Result == 1, message = result.Message, type = result.Result });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, message = ex.Message });
            }
        }
        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var loggedInUser = User.FindFirst("FullName")?.Value ?? "System";
            var result = await _service.DeleteAsync(id, loggedInUser);
            return Ok(new { success = result.Result == 1, message = result.Message });
        }

        [HttpGet("get-my-company-limit")]
        public async Task<IActionResult> GetMyCompanyLimit()
        {
            var companyIdStr = User.FindFirst("IDCompany")?.Value ?? "0";
            int.TryParse(companyIdStr, out int companyId);

            // 🔥 NEW: Also get the company name from the claims
            var companyName = User.FindFirst("CompanyName")?.Value ?? "Your Company";

            var limit = await _service.GetLimitByCompanyAsync(companyId);
            return Ok(new { success = true, limit = limit, companyName = companyName });
        }


    }
}
