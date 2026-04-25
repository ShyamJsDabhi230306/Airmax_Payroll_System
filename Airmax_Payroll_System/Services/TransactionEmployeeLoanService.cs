using Airmax_Payroll_System.Models.AllDTOS;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class TransactionEmployeeLoanService
    {
        private readonly TransactionEmployeeLoanRepo _repo;
        public TransactionEmployeeLoanService(TransactionEmployeeLoanRepo repo) { _repo = repo; }
        public async Task<IEnumerable<Transaction_EmployeeLoan>> GetAllAsync(int idDepartment)
    => await _repo.GetAllAsync(idDepartment);
        public async Task<TransactionEmployeeLoanSaveDto?> GetByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<SaveResult> SaveAsync(TransactionEmployeeLoanSaveDto model) => await _repo.SaveAsync(model);
        public async Task<SaveResult> DeleteAsync(int id,string deleteBy) => await _repo.DeleteAsync(id, deleteBy);
        public async Task<string> GenerateNoAsync() => await _repo.GenerateNoAsync();


        public async Task<SaveResult> SkipMonthAsync(int idLoanDetail)
        {
            try
            {
                return await _repo.SkipMonthAsync(idLoanDetail);
            }
            catch (Exception ex)
            {
                return new SaveResult { Result = 0, Message = "Service Error: " + ex.Message };
            }
        }

        public async Task<SaveResult> RescheduleAsync(EmployeeLoanRescheduleDto model)
        {
            try
            {
                return await _repo.RescheduleAsync(model);
            }
            catch (Exception ex)
            {
                return new SaveResult { Result = 0, Message = "Service Error: " + ex.Message };
            }
        }
        public async Task<bool> HasActiveLoanAsync(int employeeId)
        {
            return await _repo.HasActiveLoanAsync(employeeId);
        }

        public async Task<dynamic> GetDashboardDataAsync(int idDivision, int idDepartment, string status)
        {
            return await _repo.GetDashboardDataAsync(idDivision, idDepartment, status);
        }


        public async Task<IEnumerable<Transaction_EmployeeLoan>> GetByEmployeeAsync(int id, int idDivision, string search)
        {
            return await _repo.GetByEmployeeAsync(id, idDivision, search);
        }

        public async Task<dynamic> GetScheduleAsync(int id)
            => await _repo.GetScheduleAsync(id);

    }
}
