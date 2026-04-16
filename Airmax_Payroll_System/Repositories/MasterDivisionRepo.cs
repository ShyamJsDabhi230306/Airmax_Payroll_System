using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;
using System.Data;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterDivisionRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterDivisionRepo>? _logger;

        public MasterDivisionRepo(IDapperHelper dapperHelper, ILogger<MasterDivisionRepo>? logger = null)
        {
            _dapper = dapperHelper;
            _logger = logger;
        }

        public async Task<IEnumerable<MasterDivision>> GetAllAsync()
        {
            try
            {
                var param = new DynamicParameters();
                

                return await _dapper.QueryAsync<MasterDivision>("usp_Master_Division_SelectAll");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterDivisionRepo.GetAllAsync");
                return Enumerable.Empty<MasterDivision>();
            }
        }

        public async Task<MasterDivision?> GetByIdAsync(int idDivision)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDDivision", idDivision);

                return await _dapper.QueryFirstOrDefaultAsync<MasterDivision>("usp_Master_Division_SelectById", param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterDivisionRepo.GetByIdAsync | IDDivision={IDDivision}", idDivision);
                return null;
            }
        }

        public async Task<SaveResult> SaveAsync(MasterDivision model)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDDivision", model.IDDivision);
                param.Add("@IDLocation", model.IDLocation);
                param.Add("@DivisionName", model.DivisionName);
                param.Add("@Remarks", model.Remarks);
                param.Add("@IsActive", model.IsActive);
                param.Add("@username", model.E_By);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>("usp_Master_Division_Save", param);
                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterDivisionRepo.SaveAsync");
                return SaveResult.Fail("Failed to save division. " + ex.Message);
            }
        }

        public async Task<SaveResult> DeleteAsync(int idDivision, string deleteBy)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDDivision", idDivision);
                param.Add("@D_By", deleteBy);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>("usp_Master_Division_Delete", param);
                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterDivisionRepo.DeleteAsync | IDDivision={IDDivision}", idDivision);
                return SaveResult.Fail("Failed to delete division. " + ex.Message);
            }
        }
    }
}
