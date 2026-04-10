using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Airmax_Payroll_System.Controllers.API
{
    [Route("api/master/pagemaster")]
    [ApiController]
    [Authorize]
    public class PageMasterAPIController : ControllerBase
    {
        private readonly MasterPageService _service;
        public PageMasterAPIController(MasterPageService service)
        {
            _service = service;
        }
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(new { success = true, data });
        }
        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);
            if (data == null) return NotFound();
            return Ok(new { success = true, data });
        }
        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterPage model)
        {
            // 🛡️ Get username from JWT Token
            model.E_By = User.FindFirst(ClaimTypes.Name)?.Value ?? "System";

            var result = await _service.SaveAsync(model);
            return Ok(result);
        }
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            string deletedBy = User.FindFirst(ClaimTypes.Name)?.Value ?? "System";
            var result = await _service.DeleteAsync(id, deletedBy);
            return Ok(result);
        }
    }
}
