using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.AllDTOS;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction;
using Dapper;
using Newtonsoft.Json;

namespace Airmax_Payroll_System.Repositories
{
    public class TransactionEmployeeLoanRepo
    {
        private readonly IDapperHelper _dapper;

        public TransactionEmployeeLoanRepo(IDapperHelper dapper)
        {
            _dapper = dapper;
        }

        public async Task<IEnumerable<Transaction_EmployeeLoan>> GetAllAsync(int idDepartment)
        {
            var param = new DynamicParameters();
            param.Add("@IDDepartment", idDepartment);
            return await _dapper.QueryAsync<Transaction_EmployeeLoan>(
                "usp_Transaction_EmployeeLoan_SelectAll",
                param);
        }

        public async Task<TransactionEmployeeLoanSaveDto?> GetByIdAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeLoan", id);

            // 1. Fetch as dynamic to read the JSON 'Details' string
            var row = await _dapper.QueryFirstOrDefaultAsync<dynamic>(
                "usp_Transaction_EmployeeLoan_SelectById",
                param);

            if (row == null) return null;

            // 2. Deserialize the installments grid
            string detailsJson = row.Details; // Matches your FOR JSON PATH output
            var detailsList = string.IsNullOrEmpty(detailsJson)
                ? new List<Transaction_EmployeeLoanDetails>()
                : JsonConvert.DeserializeObject<List<Transaction_EmployeeLoanDetails>>(detailsJson);

            // 3. Map to DTO for the Frontend
            return new TransactionEmployeeLoanSaveDto
            {
                IDEmployeeLoan = (int)row.IDEmployeeLoan,
                LoanNo = (string)row.LoanNo,
                Date = (DateTime?)row.Date,
                IDEmployee = (int?)row.IDEmployee,
                IDDepartment = (int?)row.IDDepartment,
                IDDivision = (int?)row.IDDivision,
                LoanAmount = (decimal?)row.LoanAmount,
                TotalInstallments = (int?)row.TotalInstallments,
                InstallmentAmount = (decimal?)row.InstallmentAmount,
                InstallmentStartingDate = (DateTime?)row.InstallmentStartingDate,
                Details = detailsList
            };
        }

        public async Task<SaveResult> SaveAsync(TransactionEmployeeLoanSaveDto model)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeLoan", model.IDEmployeeLoan);
            param.Add("@LoanNo", model.LoanNo);
            param.Add("@Date", model.Date);
            param.Add("@IDDivision", model.IDDivision);
            param.Add("@IDDepartment", model.IDDepartment);
            param.Add("@IDEmployee", model.IDEmployee);
            param.Add("@LoanAmount", model.LoanAmount);
            param.Add("@InstallmentAmount", model.InstallmentAmount);
            param.Add("@TotalInstallments", model.TotalInstallments);
            param.Add("@InstallmentStartingDate", model.InstallmentStartingDate);

            // Serialize list to JSON just like Kharchi
            param.Add("@Details", JsonConvert.SerializeObject(model.Details));
            param.Add("@UserFullName", model.E_By); // or your user context

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Transaction_EmployeeLoan_Save",
                param);
        }

        public async Task<SaveResult> DeleteAsync(int id,string deleteBy)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeLoan", id);
            param.Add("@D_By", deleteBy);

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Transaction_EmployeeLoan_Delete",
                param);
        }

        public async Task<string> GenerateNoAsync()
        {
            try
            {
                // Safer SQL: Using COALESCE and ensuring it returns a number
                string sql = "SELECT COALESCE(MAX(IDEmployeeLoan), 0) + 1 FROM Transaction_EmployeeLoan";
                int nextId = await _dapper.ExecuteScalarAsync<int>(sql, null, System.Data.CommandType.Text);

                // Returns LOAN-001 format which looks much better
                return "LOAN-" + nextId.ToString("D3");
            }
            catch (Exception)
            {
                return "LOAN-001"; // Fallback if table doesn't exist yet
            }
        }


        public async Task<SaveResult> SkipMonthAsync(int idLoanDetail)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeLoanDetails", idLoanDetail);

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Transaction_EmployeeLoan_SkipMonth",
                param);
        }

        public async Task<SaveResult> RescheduleAsync(EmployeeLoanRescheduleDto model)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeLoan", model.IDEmployeeLoan);
            param.Add("@NewRemainingMonths", model.NewRemainingMonths);

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Transaction_EmployeeLoan_Reschedule",
                param);
        }

        public async Task<bool> HasActiveLoanAsync(int employeeId)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployee", employeeId);

            int count = await _dapper.ExecuteScalarAsync<int>(
                "usp_Transaction_EmployeeLoan_CheckActive",
                param,
                System.Data.CommandType.StoredProcedure
            );

            return count > 0;
        }


        // Path: Repositories/TransactionEmployeeLoanRepo.cs
        public async Task<dynamic> GetDashboardDataAsync(int idDivision, int idDepartment, string status)
        {
            var param = new DynamicParameters();
            param.Add("@IDDivision", idDivision);
            param.Add("@IDDepartment", idDepartment);
            param.Add("@Status", status);

            // returns (Reader, Conn) tuple
            var result = await _dapper.QueryMultipleAsync("usp_Transaction_EmployeeLoan_Dashboard", param);

            using (result.Conn)
            using (result.Reader)
            {
                var stats = await result.Reader.ReadFirstOrDefaultAsync<dynamic>();
                var loans = await result.Reader.ReadAsync<dynamic>();
                return new { Stats = stats, Loans = loans };
            }
        }
        // Path: Repositories/TransactionEmployeeLoanRepo.cs
        public async Task<IEnumerable<Transaction_EmployeeLoan>> GetByEmployeeAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployee", id);

            // Now calling the stored procedure instead of raw text
            return await _dapper.QueryAsync<Transaction_EmployeeLoan>(
                "usp_Transaction_EmployeeLoan_GetByEmployee",
                param
            );
        }

        public async Task<dynamic> GetScheduleAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDEmployeeLoan", id);
            var result = await _dapper.QueryMultipleAsync("usp_Transaction_EmployeeLoan_GetSchedule", param);
            using (result.Conn)
            using (result.Reader)
            {
                return new
                {
                    Header = await result.Reader.ReadFirstOrDefaultAsync<dynamic>(),
                    Details = await result.Reader.ReadAsync<dynamic>()
                };
            }
        }



    }
}
