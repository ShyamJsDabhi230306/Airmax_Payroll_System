using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterEmployeeGroupRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterEmployeeGroupRepo>? _logger;

        public MasterEmployeeGroupRepo(IDapperHelper dapper,
            ILogger<MasterEmployeeGroupRepo>? logger = null)
        {
            _dapper = dapper;
            _logger = logger;
        }

        // GET ALL
        public async Task<IEnumerable<MasterEmployeeGroup>> GetAllAsync()
        {
            try
            {
                return await _dapper.QueryAsync<MasterEmployeeGroup>(
                    "usp_Master_EmployeeGroup_SelectAll");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error GetAll EmployeeGroup");
                return Enumerable.Empty<MasterEmployeeGroup>();
            }
        }

        // GET BY ID
        public async Task<MasterEmployeeGroup?> GetByIdAsync(int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDEmployeeGroup", id);

                return await _dapper.QueryFirstOrDefaultAsync<MasterEmployeeGroup>(
                    "usp_Master_EmployeeGroup_SelectById", param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error GetById EmployeeGroup");
                return null;
            }
        }

        // SAVE
        public async Task<SaveResult> SaveAsync(MasterEmployeeGroup group)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@IDEmployeeGroup", group.IDEmployeeGroup);
                param.Add("@EmployeeGroupName", group.EmployeeGroupName);
                param.Add("@IDDepartment", group.IDDepartment);
                param.Add("@IsActive", group.IsActive);
                param.Add("@UserFullName", group.E_By);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_EmployeeGroup_Save", param);

                return result ?? SaveResult.Fail("No response");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error Save EmployeeGroup");
                return SaveResult.Fail(ex.Message);
            }
        }

        // DELETE
        public async Task<SaveResult> DeleteAsync(int id,string deleteBy)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDEmployeeGroup", id);
                param.Add("D_By", deleteBy);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_EmployeeGroup_Delete", param);

                return result ?? SaveResult.Fail("No response");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error Delete EmployeeGroup");
                return SaveResult.Fail(ex.Message);
            }
        }
    }
}
