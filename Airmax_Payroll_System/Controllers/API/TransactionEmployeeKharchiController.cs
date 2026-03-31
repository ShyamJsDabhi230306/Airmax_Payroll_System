using Airmax_Payroll_System.Models.AllDTOS;
using Airmax_Payroll_System.Models.Transaction;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Route("api/transaction/kharchi")]
    [ApiController]
    public class TransactionEmployeeKharchiController : ControllerBase
    {
        private readonly TransactionEmployeeKharchiService _service;

        public TransactionEmployeeKharchiController(TransactionEmployeeKharchiService service)
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
        public async Task<IActionResult> Save([FromBody] TransactionEmployeeKharchiSaveDto model)
        {
            var result = await _service.SaveAsync(model);

            return Ok(new
            {
                success = result.Result == 1,
                message = result.Message
            });
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            return Ok(new
            {
                success = result.Result == 1,
                message = result.Message
            });
        }

        [HttpGet("generate-no")]
        public IActionResult GenerateKharchiNo()
        {
            // Example logic
            var kharchiNo = "KH-" + DateTime.Now.Ticks.ToString().Substring(10);

            return Ok(new
            {
                success = true,
                data = kharchiNo
            });
        }

       
    }
}
