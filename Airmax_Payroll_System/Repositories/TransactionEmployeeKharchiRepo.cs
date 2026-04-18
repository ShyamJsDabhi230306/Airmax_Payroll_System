using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.AllDTOS;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction;
using Dapper;
using Newtonsoft.Json;
using System.Data;

namespace Airmax_Payroll_System.Repositories
{
    public class TransactionEmployeeKharchiRepo
    {
        private readonly IDapperHelper _dapper;

        public TransactionEmployeeKharchiRepo(IDapperHelper dapper)
        {
            _dapper = dapper;
        }

        //public async Task<IEnumerable<TransactionEmployeeKharchi>> GetAllAsync()
        //{
        //    return await _dapper.QueryAsync<TransactionEmployeeKharchi>(
        //        "usp_Transaction_EmployeeKharchi_SelectAll");
        //}
        // Update line 19:
        public async Task<IEnumerable<dynamic>> GetAllAsync(int idDivision, int month = 0, int year = 0)
        {
            var param = new DynamicParameters();
            param.Add("@IDDivision", idDivision);
            param.Add("@Month", month);
            param.Add("@Year", year);
            return await _dapper.QueryAsync<dynamic>(
                "usp_Transaction_EmployeeKharchi_SelectAll",
                param);
        }


        // 1. First, update your GetByIdAsync to handle JSON string deserialization
        public async Task<TransactionEmployeeKharchiSaveDto?> GetByIdAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeKharchi", id);

            var row = await _dapper.QueryFirstOrDefaultAsync<dynamic>(
                "usp_Transaction_EmployeeKharchi_GetById", // 🔥 Ensure this matches the SP name
                param);

            if (row == null) return null;

            string detailsJson = row.details;
            var detailsList = string.IsNullOrEmpty(detailsJson)
                ? new List<TransactionEmployeeKharchiDetailDto>()
                : JsonConvert.DeserializeObject<List<TransactionEmployeeKharchiDetailDto>>(detailsJson);

            return new TransactionEmployeeKharchiSaveDto
            {
                IDEmployeeKharchi = (int)row.IDEmployeeKharchi,
                KharchiNo = (string)row.KharchiNo,
                KharchiDate = (DateTime?)row.KharchiDate,
                Date = (DateTime?)row.Date,
                IDDivision = (int)row.IDDivision,
                Details = detailsList
            };
        }

        public async Task<SaveResult> SaveAsync(TransactionEmployeeKharchiSaveDto model)
        {
            var param = new DynamicParameters();

            // Header Parameters
            param.Add("@IDEmployeeKharchi", model.IDEmployeeKharchi);
            param.Add("@KharchiNo", model.KharchiNo);
            param.Add("@KharchiDate", model.KharchiDate); // The month selected (e.g., 2026-04-01)
            param.Add("@Date", DateTime.Now);             // The actual entry date (today)
            param.Add("@IDDivision", model.IDDivision);
            param.Add("@UserFullName", model.E_By);
            // Details Parameter (The SP will extract IDDepartment from Master_Employee automatically)
            param.Add("@Details", JsonConvert.SerializeObject(model.Details));
            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Transaction_EmployeeKharchi_Save",
                param);
        }

        public async Task<SaveResult> DeleteAsync(int id,string deleteBy)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeKharchi", id);
            param.Add("@D_By", deleteBy);

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Transaction_EmployeeKharchi_Delete",
                param);
        }

        public async Task<string> GenerateKharchiNoAsync()
        {
            // Queries the Maximum ID in the table and adds 1
            string sql = "SELECT ISNULL(MAX(IDEmployeeKharchi), 0) + 1 FROM Transaction_EmployeeKharchi";
            int nextId = await _dapper.ExecuteScalarAsync<int>(sql, null, System.Data.CommandType.Text);

            // Returns the number padded to 3 digits (e.g., 001, 002)
            return nextId.ToString("D3");
        }



        // 1. Get Divisions with employee counts
        public async Task<IEnumerable<dynamic>> GetDivisionsWithCountAsync(int idDivision)
        {
            var param = new DynamicParameters();
            param.Add("@IDDivision", idDivision);

            return await _dapper.QueryAsync<dynamic>(
                "usp_Transaction_Kharchi_GetDivisionsWithCount",
                param);
        }

        // 2. Load all employees for a specific division
        public async Task<IEnumerable<dynamic>> LoadEmployeesForKharchiAsync(int idDivision)
        {
            var param = new DynamicParameters();
            param.Add("@IDDivision", idDivision);

            return await _dapper.QueryAsync<dynamic>(
                "usp_Transaction_EmployeeKharchi_LoadEmployees",
                param);
        }





        // new thing are add for my department and division
        // 1. Update LoadEmployees to use the Typed DTO
 

        // 2. Add this method to fetch the Expandable Department List
        public async Task<IEnumerable<dynamic>> GetDepartmentsWithCountAsync(int idDivision)
        {
            var param = new DynamicParameters();
            param.Add("@IDDivision", idDivision);

            return await _dapper.QueryAsync<dynamic>(
                "usp_Transaction_Kharchi_GetDepartmentsWithCount",
                param);
        }

        // 3. Ensure GetById matches the new SP name if you renamed it

        public async Task<TransactionEmployeeKharchiSaveDto?> GetPrintDataAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeKharchi", id);
            var row = await _dapper.QueryFirstOrDefaultAsync<dynamic>(
                "usp_Transaction_EmployeeKharchi_GetById",
                param);
            if (row == null) return null;
            string detailsJson = row.details;
            var detailsList = string.IsNullOrEmpty(detailsJson)
                ? new List<TransactionEmployeeKharchiDetailDto>()
                : JsonConvert.DeserializeObject<List<TransactionEmployeeKharchiDetailDto>>(detailsJson);
            return new TransactionEmployeeKharchiSaveDto
            {
                IDEmployeeKharchi = (int)row.IDEmployeeKharchi,
                KharchiNo = (string)row.KharchiNo,
                KharchiDate = (DateTime?)row.KharchiDate,
                E_By = (string)row.E_By, // To show who prepared the report
                Details = detailsList
            };
        }
    }
}
