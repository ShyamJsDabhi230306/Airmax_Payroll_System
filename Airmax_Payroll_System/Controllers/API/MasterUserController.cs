using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using DRSPortal.Models.Account;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

            //var loggedInUsername = User.Identity?.Name ?? "System";
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            // 🔥 2. Assign it to your model's AuditFields property (E_By)
            model.E_By = loggedInUserFullName;
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
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";


            var result = await _service.DeleteAsync(id, loggedInUserFullName);

            if (result.Result != 1)
                return Ok(ApiResponse<string>
                    .FailResponse(result.Message, result.ErrorCode));

            return Ok(ApiResponse<string>
                .SuccessResponse(result.Message));
        }

        // ---------------------------------------------------------
        // LOGIN (NO AUTH)
        // ---------------------------------------------------------
        //[AllowAnonymous]
        //[HttpPost("login")]
        //public async Task<IActionResult> Login([FromBody] LoginRequest request)
        //{
        //    try
        //    {
        //        var result = await _service.LoginAsync(request.UserName,request.Password);

        //        if (!result.Success)
        //            return Ok(ApiResponse<LoginResponse>.FailResponse(
        //                result.Message));

        //        return Ok(ApiResponse<LoginResponse>.SuccessResponse(
        //            "Login successful", result));
        //    }
        //    catch (Exception ex)
        //    {
        //        return Ok(ApiResponse<string>.FailResponse(
        //            "Login failed. " + ex.Message));
        //    }
        //}



        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                HttpContext.Session.Clear();

                var result = await _service.LoginAsync(request.UserName, request.Password);

                if (!result.Success || result.User == null)
                {
                    return Ok(ApiResponse<LoginResponse>.FailResponse(
                        result.Message));
                }

                var user = result.User;

                var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.IDUser.ToString()),
            new Claim("IDUser", user.IDUser.ToString()),
            new Claim(ClaimTypes.Name, user.UserName ?? ""),
            new Claim("UserName", user.UserName ?? ""),
            new Claim("FullName", user.FullName ?? ""),
            new Claim(ClaimTypes.Role, user.Role ?? ""),
            new Claim("Role", user.Role ?? ""),
            new Claim("IDCompany", user.IDCompany.ToString()),
            new Claim("IDLocation", user.IDLocation.ToString()),
            new Claim("IDDepartment", user.IDDepartment.ToString())
        };

                var identity = new ClaimsIdentity(
                    claims,
                    CookieAuthenticationDefaults.AuthenticationScheme
                );

                var principal = new ClaimsPrincipal(identity);

                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(4),
                    AllowRefresh = true
                };

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    principal,
                    authProperties
                );

                return Ok(ApiResponse<LoginResponse>.SuccessResponse(
                    "Login successful",
                    result));
            }
            catch (Exception ex)
            {
                return Ok(ApiResponse<string>.FailResponse(
                    "Login failed. " + ex.Message));
            }
        }

        [AllowAnonymous]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            HttpContext.Session.Clear();

            Response.Cookies.Delete("Airmax.Auth");
            Response.Cookies.Delete("jwt_token");

            return Ok(ApiResponse<string>.SuccessResponse(
                "Logout successful",
                "Logged out"));
        }


        [HttpGet("me")]
        public IActionResult Me()
        {
            if (User?.Identity?.IsAuthenticated != true)
            {
                return Unauthorized(ApiResponse<string>.FailResponse("Not logged in."));
            }

            var user = new
            {
                IDUser = User.FindFirst("IDUser")?.Value,
                UserName = User.FindFirst("UserName")?.Value,
                FullName = User.FindFirst("FullName")?.Value,
                Role = User.FindFirst("Role")?.Value,
                IDCompany = User.FindFirst("IDCompany")?.Value,
                IDLocation = User.FindFirst("IDLocation")?.Value,
                IDDepartment = User.FindFirst("IDDepartment")?.Value
            };

            return Ok(ApiResponse<object>.SuccessResponse("Current user loaded.", user));
        }
    }
}
