using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using DRSPortal.Models.Account;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    [Authorize]
    [ApiController]
    [Route("api/master/user")]
    public class MasterUserController : ControllerBase
    {
        private readonly MasterUserService _service;

        public MasterUserController(MasterUserService service)
        {
            _service = service;
        }

        // GET ALL
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();

            return Ok(ApiResponse<IEnumerable<MasterUser>>
                .SuccessResponse("Users loaded successfully", data));
        }

        // GET BY ID
        [HttpGet("get-by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
      {
            var data = await _service.GetByIdAsync(id);

            if (data == null)
                return Ok(ApiResponse<string>
                    .FailResponse("User not found"));

            return Ok(ApiResponse<MasterUser>
                .SuccessResponse("User loaded successfully", data));
        }

        // SAVE
        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterUser model)
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

        // DELETE
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

        // ---------------------------------------------------------
        // LOGIN (NO AUTH)
        // ---------------------------------------------------------
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _service.LoginAsync(
                    request.UserName,
                    request.Password);

                if (!result.Success)
                    return Ok(ApiResponse<LoginResponse>.FailResponse(
                        result.Message));

                return Ok(ApiResponse<LoginResponse>.SuccessResponse(
                    "Login successful", result));
            }
            catch (Exception ex)
            {
                return Ok(ApiResponse<string>.FailResponse(
                    "Login failed. " + ex.Message));
            }
        }
    }
}
