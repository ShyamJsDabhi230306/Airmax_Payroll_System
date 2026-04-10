using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterPageRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterPageRepo>? _logger;
        public MasterPageRepo(IDapperHelper dapperHelper, ILogger<MasterPageRepo>? logger = null)
        {
            _dapper = dapperHelper;
            _logger = logger;
        }
        public async Task<IEnumerable<MasterPage>> GetAllAsync()
        {
            try
            {
                return await _dapper.QueryAsync<MasterPage>("usp_Master_Page_SelectAll");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterPageRepo.GetAllAsync");
                return Enumerable.Empty<MasterPage>();
            }
        }
        public async Task<MasterPage?> GetByIdAsync(int pageId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@PageId", pageId);
                return await _dapper.QueryFirstOrDefaultAsync<MasterPage>("usp_Master_Page_SelectById", param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterPageRepo.GetByIdAsync | PageId={PageId}", pageId);
                return null;
            }
        }
        public async Task<SaveResult> SaveAsync(MasterPage model)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@PageId", model.PageId);
                param.Add("@PageName", model.PageName);
                param.Add("@PageUrl", model.PageUrl); //
                param.Add("@IsActive", model.IsActive);
                param.Add("@username", model.E_By);
                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>("usp_Master_Page_Save", param);
                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterPageRepo.SaveAsync");
                return SaveResult.Fail("Failed to save page. " + ex.Message);
            }
        }
        public async Task<SaveResult> DeleteAsync(int pageId, string deletedBy)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@PageId", pageId);
                param.Add("@IsDelete", true); // Pass bit value for soft delete
                param.Add("@D_By", deletedBy);
                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>("usp_Master_Page_Delete", param);
                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterPageRepo.DeleteAsync");
                return SaveResult.Fail("Failed to delete page. " + ex.Message);
            }
        }
    }
}
