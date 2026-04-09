using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{

    [ApiController]
    [Route("api/master/company")]
    public class MasterCompanyController : ControllerBase
    {
        private readonly MasterCompanyService _companyService;

        public MasterCompanyController(MasterCompanyService companyService)
        {
            _companyService = companyService;
        }
        // ---------------------------------------------------------
        // GET ALL COMPANIES
        // ---------------------------------------------------------
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var companies = await _companyService.GetAllAsync();

            return Ok(ApiResponse<IEnumerable<MasterCompany>>.SuccessResponse(
                "Companies loaded successfully", companies));
        }

        // ---------------------------------------------------------
        // GET COMPANY BY ID
        // ---------------------------------------------------------
        [HttpGet("get-by-id/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var company = await _companyService.GetByIdAsync(id);

            if (company == null)
                return Ok(ApiResponse<string>.FailResponse("Company not found"));

            return Ok(ApiResponse<MasterCompany>.SuccessResponse(
                "Company loaded successfully", company));
        }
        // ---------------------------------------------------------
        // SAVE COMPANY (INSERT / UPDATE)
        // ---------------------------------------------------------
        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] MasterCompany company)
        {
            //var actionBy = ClaimsHelper.GetCurrentUserFullName(User);
            //company.E_By = actionBy;

            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            company.E_By = loggedInUserFullName;
            var result = await _companyService.SaveAsync(company);

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
                    data = company
                }));
        }

        // ---------------------------------------------------------
        // DELETE COMPANY
        // ---------------------------------------------------------
        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var LoggedInUser = User.FindFirst("FullName")?.Value ?? "System";

            var result = await _companyService.DeleteAsync(id,LoggedInUser);

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
