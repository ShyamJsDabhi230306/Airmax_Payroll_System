using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.AllDTOS;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction;
using Dapper;
using Newtonsoft.Json;

namespace Airmax_Payroll_System.Repositories
{
    public class TransactionEmployeeKharchiRepo
    {
        private readonly IDapperHelper _dapper;

        public TransactionEmployeeKharchiRepo(IDapperHelper dapper)
        {
            _dapper = dapper;
        }

        public async Task<IEnumerable<TransactionEmployeeKharchi>> GetAllAsync()
        {
            return await _dapper.QueryAsync<TransactionEmployeeKharchi>(
                "usp_Transaction_EmployeeKharchi_SelectAll");
        }

        public async Task<TransactionEmployeeKharchi?> GetByIdAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeKharchi", id);

            return await _dapper.QueryFirstOrDefaultAsync<TransactionEmployeeKharchi>(
                "usp_Transaction_EmployeeKharchi_SelectById",
                param);
        }

        public async Task<SaveResult> SaveAsync(TransactionEmployeeKharchiSaveDto model)
        {
            var param = new DynamicParameters();

            param.Add("@KharchiNo", model.KharchiNo);
            param.Add("@KharchiDate", model.KharchiDate);
            param.Add("@Date", model.Date);
            param.Add("@IDDepartment", model.IDDepartment);

            param.Add("@Details", JsonConvert.SerializeObject(model.Details));

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Transaction_EmployeeKharchi_Save",
                param);
        }

        public async Task<SaveResult> DeleteAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeKharchi", id);
            param.Add("@D_By", "ADMIN");

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Transaction_EmployeeKharchi_Delete",
                param);
        }


        
    }
}
