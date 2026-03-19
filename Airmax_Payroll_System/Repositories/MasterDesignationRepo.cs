using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;
using System.Data;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterDesignationRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterDesignationRepo>? _logger;

        public MasterDesignationRepo(IDapperHelper dapperHelper,
            ILogger<MasterDesignationRepo>? logger = null)
        {
            _dapper = dapperHelper;
            _logger = logger;
        }

        public async Task<IEnumerable<MasterDesignation>> GetAllAsync()
        {
            try
            {
                return await _dapper.QueryAsync<MasterDesignation>(
                    "usp_Master_Designation_SelectAll");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in DesignationRepo.GetAllAsync");
                return Enumerable.Empty<MasterDesignation>();
            }
        }

        public async Task<MasterDesignation?> GetByIdAsync(int idDesignation)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDDesignation", idDesignation);

                return await _dapper.QueryFirstOrDefaultAsync<MasterDesignation>(
                    "usp_Master_Designation_SelectById",
                    param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in DesignationRepo.GetByIdAsync | IDDesignation={IDDesignation}",
                    idDesignation);
                return null;
            }
        }

        public async Task<SaveResult> SaveAsync(MasterDesignation model)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@IDDesignation", model.IDDesignation);
                param.Add("@Designetion", model.Designetion);
                param.Add("@IsActive", model.IsActive);
                param.Add("@E_By", model.E_By ?? "Admin");
                param.Add("@E_Date", DateTime.Now);
                param.Add("@U_Date", DateTime.Now);
                param.Add("@U_By", model.U_By ?? "Admin");
                param.Add("@Remark", model.Remarks);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Designation_Save",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in DesignationRepo.SaveAsync | IDDesignation={IDDesignation}",
                    model.IDDesignation);

                return SaveResult.Fail(
                    "Failed to save designation. " + ex.Message);
            }
        }

        public async Task<SaveResult> DeleteAsync(int idDesignation)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDDesignation", idDesignation);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Designation_Delete",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in DesignationRepo.DeleteAsync | IDDesignation={IDDesignation}",
                    idDesignation);

                return SaveResult.Fail(
                    "Failed to delete designation. " + ex.Message);
            }
        }
    }
}