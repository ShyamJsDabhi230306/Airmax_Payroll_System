using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterConfigurationRepo
    {
        private readonly IDapperHelper _dapper;
        public MasterConfigurationRepo(IDapperHelper dapper)
        {
            _dapper = dapper;
        }
        public async Task<IEnumerable<Master_Configuration>> GetAllAsync()
        {
            return await _dapper.QueryAsync<Master_Configuration>(
                "usp_Master_Configuration_SelectAll", null);
        }
        public async Task<Master_Configuration?> GetByIdAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDConfiguration", id);
            return await _dapper.QueryFirstOrDefaultAsync<Master_Configuration>(
                "usp_Master_Configuration_SelectById", param);
        }
        public async Task<SaveResult> SaveAsync(Master_Configuration model)
        {
            var param = new DynamicParameters();
            param.Add("@IDConfiguration", model.IDConfiguration);
            param.Add("@IDCompany", model.IDCompany);
            param.Add("@LoanLimit", model.LoanLimit);
            param.Add("@UserFullName", model.E_By); // Uses E_By from AuditFields
            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Master_Configuration_Save", param);
        }
        public async Task<SaveResult> DeleteAsync(int id, string deletedBy)
        {
            var param = new DynamicParameters();
            param.Add("@IDConfiguration", id);
            param.Add("@UserFullName", deletedBy);
            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Master_Configuration_Delete", param);
        }

        public async Task<decimal> GetLimitByCompanyAsync(int companyId)
        {
            var param = new DynamicParameters();
            param.Add("@IDCompany", companyId);
            // 🔥 Now calling the Stored Procedure
            var limit = await _dapper.ExecuteScalarAsync<decimal?>(
                "usp_Master_Configuration_GetLimitByCompany",
                param);
            return limit ?? 0;
        }

    }

}
