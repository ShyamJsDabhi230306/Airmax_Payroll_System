using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterUserRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterUserRepo>? _logger;

        public MasterUserRepo(
            IDapperHelper dapperHelper,
            ILogger<MasterUserRepo>? logger = null)
        {
            _dapper = dapperHelper;
            _logger = logger;
        }

        // ---------------------------------------------------------
        // GET ALL
        // ---------------------------------------------------------
        public async Task<IEnumerable<MasterUser>> GetAllAsync()
        {
            try
            {
                return await _dapper.QueryAsync<MasterUser>(
                    "usp_Master_User_SelectAll");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterUserRepo.GetAllAsync");
                return Enumerable.Empty<MasterUser>();
            }
        }

        // ---------------------------------------------------------
        // GET BY ID
        // ---------------------------------------------------------
        public async Task<MasterUser?> GetByIdAsync(int idUser)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDUser", idUser);

                return await _dapper.QueryFirstOrDefaultAsync<MasterUser>(
                    "usp_Master_User_SelectById",
                    param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in MasterUserRepo.GetByIdAsync | IDUser={IDUser}",
                    idUser);

                return null;
            }
        }

        // ---------------------------------------------------------
        // SAVE
        // ---------------------------------------------------------
        public async Task<SaveResult> SaveAsync(MasterUser model)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@IDUser", model.IDUser);
                param.Add("@IDCompany", model.IDCompany);
                param.Add("@IDLocation", model.IDLocation);
                param.Add("@IDDepartment", model.IDDepartment);
                param.Add("@UserName", model.UserName);
                param.Add("@Password", model.Password);
                param.Add("@FullName", model.FullName);
                param.Add("@Email", model.Email);
                param.Add("@Mobile", model.Mobile);
                param.Add("@RoleName", model.RoleName);

                param.Add("@UserActionBy", model.E_By);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_User_Save",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterUserRepo.SaveAsync");

                return SaveResult.Fail("Failed to save user. " + ex.Message);
            }
        }

        // ---------------------------------------------------------
        // DELETE
        // ---------------------------------------------------------
        public async Task<SaveResult> DeleteAsync(int idUser)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDUser", idUser);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_User_Delete",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterUserRepo.DeleteAsync");

                return SaveResult.Fail("Failed to delete user. " + ex.Message);
            }
        }

        public async Task<MasterUser?> LoginAsync(string userName, string password)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@UserName", userName);
                param.Add("@Password", password);

                return await _dapper.QueryFirstOrDefaultAsync<MasterUser>(
                    "usp_Master_User_Login",
                    param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in MasterUserRepo.LoginAsync | UserName={UserName}",
                    userName);
                return null;
            }
        }
    }
}
