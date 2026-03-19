using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;
using System.Data;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterLocationRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterLocationRepo>? _logger;

        public MasterLocationRepo(
            IDapperHelper dapperHelper,
            ILogger<MasterLocationRepo>? logger = null)
        {
            _dapper = dapperHelper;
            _logger = logger;
        }

        // ---------------------------------------------------------
        // GET ALL
        // ---------------------------------------------------------
        public async Task<IEnumerable<MasterLocation>> GetAllAsync()
        {
            try
            {
                return await _dapper.QueryAsync<MasterLocation>(
                    "usp_Master_Location_SelectAll");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in LocationRepo.GetAllAsync");

                return Enumerable.Empty<MasterLocation>();
            }
        }

        // ---------------------------------------------------------
        // GET BY ID
        // ---------------------------------------------------------
        public async Task<MasterLocation?> GetByIdAsync(int idLocation)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDLocation", idLocation);

                return await _dapper.QueryFirstOrDefaultAsync<MasterLocation>(
                    "usp_Master_Location_SelectById",
                    param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in LocationRepo.GetByIdAsync | IDLocation={IDLocation}",
                    idLocation);

                return null;
            }
        }

        // ---------------------------------------------------------
        // SAVE
        // ---------------------------------------------------------
        public async Task<SaveResult> SaveAsync(MasterLocation model)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@IDLoction", model.IDLocation);
                param.Add("@IDCompany", model.IDCompany);
                param.Add("@LocationName", model.LocationName);
                //param.Add("@Remarks", model.Remarks);
                param.Add("@IsActive", model.IsActive);

                param.Add("@username", model.E_By);
                //param.Add("@E_Date", DateTime.Now);
                //param.Add("@U_Date", DateTime.Now);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Location_Save",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in DepartmentRepo.SaveAsync");

                return SaveResult.Fail(
                    "Failed to save department. " + ex.Message);
            }
        }

        // ---------------------------------------------------------
        // DELETE
        // ---------------------------------------------------------
        public async Task<SaveResult> DeleteAsync(int idLocation)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDLocation", idLocation);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Location_Delete",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in LocationRepo.DeleteAsync");

                return SaveResult.Fail(
                    "Failed to delete location. " + ex.Message);
            }
        }
    }
}