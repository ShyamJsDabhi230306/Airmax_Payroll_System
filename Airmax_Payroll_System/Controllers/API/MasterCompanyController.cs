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
        private readonly IWebHostEnvironment _environment;

        public MasterCompanyController(MasterCompanyService companyService, IWebHostEnvironment environment)
        {
            _companyService = companyService;
            _environment = environment;
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
        // --- MasterCompanyController.cs ---

        [HttpPost("save")]
        [Consumes("multipart/form-data")] 
        public async Task<IActionResult> Save([FromForm] MasterCompany company, IFormFile? LogoFile, IFormFile? SignFile)
        {
            // 1. Get Logged in User
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            company.E_By = loggedInUserFullName;

            try
            {
                // 2. Setup Upload Path
                string uploadFolder = Path.Combine(_environment.WebRootPath, "Uploads", "Company");
                if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

                // 3. Handle Logo Image
                if (LogoFile != null && LogoFile.Length > 0)
                {
                    string ext = Path.GetExtension(LogoFile.FileName);
                    string fileName = $"Logo_{DateTime.Now:yyyyMMddHHmmssfff}{ext}";
                    string filePath = Path.Combine(uploadFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await LogoFile.CopyToAsync(stream);
                    }
                    company.LogoFileName = fileName;
                    company.LogoFileExtension = ext;
                }

                // 4. Handle Signature Image
                if (SignFile != null && SignFile.Length > 0)
                {
                    string ext = Path.GetExtension(SignFile.FileName);
                    string fileName = $"Sign_{DateTime.Now:yyyyMMddHHmmssfff}{ext}";
                    string filePath = Path.Combine(uploadFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await SignFile.CopyToAsync(stream);
                    }
                    company.SignFileName = fileName;
                    company.SignFileExtension = ext;
                }
            }
            catch (Exception ex)
            {
                return Ok(ApiResponse<string>.FailResponse("Image Upload Error: " + ex.Message));
            }

            // 5. Save to Database using your existing Repository logic
            var result = await _companyService.SaveAsync(company);

            if (result.Result != 1)
            {
                return Ok(ApiResponse<string>.FailResponse(result.Message, result.ErrorCode));
            }

            return Ok(ApiResponse<object>.SuccessResponse(result.Message, new { newId = result.NewId }));
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
