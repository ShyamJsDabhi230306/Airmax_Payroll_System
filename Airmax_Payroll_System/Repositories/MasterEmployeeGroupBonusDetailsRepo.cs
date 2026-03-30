using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;
using System.Data;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterEmployeeGroupBonusDetailsRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterEmployeeGroupBonusDetailsRepo>? _logger;

        public MasterEmployeeGroupBonusDetailsRepo(
            IDapperHelper dapperHelper,
            ILogger<MasterEmployeeGroupBonusDetailsRepo>? logger = null)
        {
            _dapper = dapperHelper;
            _logger = logger;
        }

        // ---------------------------------------------------------
        // GET ALL
        // ---------------------------------------------------------
        public async Task<IEnumerable<MasterEmployeeGroupBonusDetails>> GetAllAsync()
        {
            try
            {
                return await _dapper.QueryAsync<MasterEmployeeGroupBonusDetails>(
                    "usp_Master_EmployeeGroupBonusDetails_SelectAll");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in BonusDetailsRepo.GetAllAsync");

                return Enumerable.Empty<MasterEmployeeGroupBonusDetails>();
            }
        }

        // ---------------------------------------------------------
        // GET BY ID
        // ---------------------------------------------------------
        public async Task<MasterEmployeeGroupBonusDetails?> GetByIdAsync(int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDEmployeeGroupBonus", id);

                return await _dapper.QueryFirstOrDefaultAsync<MasterEmployeeGroupBonusDetails>(
                    "usp_Master_EmployeeGroupBonusDetails_SelectByID",
                    param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in BonusDetailsRepo.GetByIdAsync | ID={ID}",
                    id);

                return null;
            }
        }

        // ---------------------------------------------------------
        // SAVE
        // ---------------------------------------------------------
        public async Task<SaveResult> SaveAsync(MasterEmployeeGroupBonusDetails model)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@IDEmployeeGroupBonus", model.IDEmployeeGroupBonus);
                param.Add("@IDEmployeeGroup", model.IDEmployeeGroup);
                param.Add("@MinYear", model.MinYear);
                param.Add("@MaxYear", model.MaxYear);
                param.Add("@Bonus", model.Bonus);
                param.Add("@IsActive", model.IsActive);

                param.Add("@username", model.E_By);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_EmployeeGroupBonusDetails_Save",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in BonusDetailsRepo.SaveAsync");

                return SaveResult.Fail(
                    "Failed to save record. " + ex.Message);
            }
        }

        // ---------------------------------------------------------
        // DELETE
        // ---------------------------------------------------------
        public async Task<SaveResult> DeleteAsync(int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDEmployeeGroupBonus", id);
                param.Add("@D_By", "ADMIN"); // ✅ REQUIRED

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_EmployeeGroupBonusDetails_Delete",
                    param
                );

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in BonusDetailsRepo.DeleteAsync");

                return SaveResult.Fail(
                    "Failed to delete record. " + ex.Message);
            }
        }
    }
}
