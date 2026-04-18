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
        public async Task<IEnumerable<TransactionEmployeeKharchi>> GetAllAsync(int idDepartment)
        {
            var param = new DynamicParameters();
            param.Add("@IDDepartment", idDepartment);
            return await _dapper.QueryAsync<TransactionEmployeeKharchi>(
                "usp_Transaction_EmployeeKharchi_SelectAll",
                param);
        }


        // 1. First, update your GetByIdAsync to handle JSON string deserialization
        public async Task<TransactionEmployeeKharchiSaveDto?> GetByIdAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeKharchi", id);

            // Fetch as a dynamic object so we can read the 'details' string
            var row = await _dapper.QueryFirstOrDefaultAsync<dynamic>(
                "usp_Transaction_EmployeeKharchi_SelectById",
                param);

            if (row == null) return null;

            // 2. Deserialize the 'details' string manually
            string detailsJson = row.details; // This is the string from FOR JSON PATH
            var detailsList = string.IsNullOrEmpty(detailsJson)
                ? new List<TransactionEmployeeKharchiDetailDto>()
                : JsonConvert.DeserializeObject<List<TransactionEmployeeKharchiDetailDto>>(detailsJson);

            // 3. Map to your final DTO
            return new TransactionEmployeeKharchiSaveDto
            {
                IDEmployeeKharchi = (int)row.idEmployeeKharchi,
                KharchiNo = (string)row.kharchiNo,
                KharchiDate = (DateTime?)row.kharchiDate,
                Date = (DateTime?)row.date,
                IDDepartment = (int)row.idDepartment,
                Details = detailsList // 🔥 Now this will contain your employees!
            };
        }

        public async Task<SaveResult> SaveAsync(TransactionEmployeeKharchiSaveDto model)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeKharchi", model.IDEmployeeKharchi);
            param.Add("@KharchiNo", model.KharchiNo);
            param.Add("@KharchiDate", model.KharchiDate);
            param.Add("@Date", DateTime.Now); // Use current system date for Entry Date
            param.Add("@IDDivision", model.IDDivision);
            param.Add("@UserFullName", model.E_By);
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



    }
}
