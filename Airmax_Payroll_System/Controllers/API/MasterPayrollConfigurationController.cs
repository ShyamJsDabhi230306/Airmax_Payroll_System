using Airmax_Payroll_System.Models.Master.Payroll;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Route("api/master/payroll-configuration")]
    [ApiController]
    public class MasterPayrollConfigurationController : ControllerBase
    {
        private readonly MasterPayrollConfigurationService _service;

        public MasterPayrollConfigurationController(MasterPayrollConfigurationService service)
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

        [HttpGet("get-by-company-group")]
        public async Task<IActionResult> GetByCompanyGroup(int idCompany, int idEmployeeGroup)
        {
            var data = await _service.GetByCompanyGroupAsync(idCompany, idEmployeeGroup);
            return Ok(new { success = true, data });
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterPayrollConfiguration model)
        {
            var user = User.FindFirst("FullName")?.Value ?? "System";

            if (model.IDPayrollConfiguration == 0)
                model.E_By = user;
            else
                model.U_By = user;

            var result = await _service.SaveAsync(model);

            return Ok(new
            {
                success = result.Result == 1,
                message = result.Message
            });
        }

        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = User.FindFirst("FullName")?.Value ?? "System";

            var result = await _service.DeleteAsync(id, user);

            return Ok(new
            {
                success = result.Result == 1,
                message = result.Message
            });
        }
    }
}
