using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;
using System.Data;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterCompanyRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterCompanyRepo>? _logger;
        public MasterCompanyRepo(IDapperHelper dapperHelper, ILogger<MasterCompanyRepo>? logger = null
            )
        {
            _dapper = dapperHelper;
            _logger = logger;

        }
        // ---------------------------------------------------------
        // GET ALL COMPANIES
        // ---------------------------------------------------------
        public async Task<IEnumerable<MasterCompany>> GetAllAsync()
        {
            try
            {
                return await _dapper.QueryAsync<MasterCompany>(
                    "usp_Master_Company_SelectAll");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in CompanyRepo.GetAllAsync");
                return Enumerable.Empty<MasterCompany>();
            }
        }

        // ---------------------------------------------------------
        // GET COMPANY BY ID
        // ---------------------------------------------------------
        public async Task<MasterCompany?> GetByIdAsync(int idCompany)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDCompany", idCompany);

                var company = await _dapper.QueryFirstOrDefaultAsync<MasterCompany>(
                    "usp_Master_Company_SelectById",
                    param);
                return company;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in CompanyRepo.GetByIdAsync | IDCompany={IDCompany}",
                    idCompany);
                return null;
            }
        }

        // ---------------------------------------------------------
        // SAVE COMPANY
        // ---------------------------------------------------------
        public async Task<SaveResult> SaveAsync(MasterCompany company)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@IDCompany", company.IDCompany);
                param.Add("@CompanyName", company.CompanyName);
                param.Add("@Office_Address", company.Office_Address);
                param.Add("@CityName", company.CityName);
                param.Add("@StateCode", company.StateCode);
                param.Add("@Pincode", company.Pincode);
                param.Add("@ContactNo", company.ContactNo);
                param.Add("@OTPMobNo", company.OTPMobNo);
                param.Add("@PhoneNo", company.PhoneNo);
                param.Add("@Comp_EmailID", company.Comp_EmailID);

                param.Add("@FaxNo", company.FaxNo);              // ✅ added
                param.Add("@Website", company.Website);          // ✅ added

                param.Add("@PanNo", company.PanNo);
                param.Add("@GSTNo", company.GSTNo);
                param.Add("@GSTDate", company.GSTDate);

                param.Add("@DbUserID", company.DbUserID);
                param.Add("@DbUserPassword", company.DbUserPassword);
                param.Add("@DbDatabaseName", company.DbDatabaseName);
                param.Add("@DbDatasource", company.DbDatasource);
                param.Add("@DbTimeOut", company.DbTimeOut);      // ✅ fixed

                param.Add("@LogoFileName", company.LogoFileName);
                param.Add("@LogoFileExtension", company.LogoFileExtension);
                param.Add("@SignFileName", company.SignFileName);
                param.Add("@SignFileExtension", company.SignFileExtension);

                param.Add("@Unit", company.Unit);                // ✅ fixed

                param.Add("@PF", company.PF);
                param.Add("@ESIC", company.ESIC);
                param.Add("@PT", company.PT);

                param.Add("@DeviceSerialNo", company.DeviceSerialNo);
                param.Add("@OutDeviceSerialNo", company.OutDeviceSerialNo);

        
                param.Add("@UserName", company.E_By);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Company_Save",
                    param   // ✅ VERY IMPORTANT
                );

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in CompanyRepo.SaveAsync | IDCompany={IDCompany}",
                    company.IDCompany);

                return SaveResult.Fail(
                    "Failed to save company. " + ex.Message);
            }
        }

        // ---------------------------------------------------------
        // DELETE COMPANY
        // ---------------------------------------------------------
        public async Task<SaveResult> DeleteAsync(int idCompany,string deleteBy)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDCompany", idCompany);
                param.Add("@D_By", deleteBy);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Company_Delete",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in CompanyRepo.DeleteAsync | IDCompany={IDCompany}",
                    idCompany);

                return SaveResult.Fail(
                    "Failed to delete company. " + ex.Message);
            }
        }
    }
}
