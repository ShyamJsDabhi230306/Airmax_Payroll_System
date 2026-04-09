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
        public async Task<IEnumerable<Transaction_EmployeeLoan>> GetAllAsync() => await _repo.GetAllAsync();
        public async Task<TransactionEmployeeLoanSaveDto?> GetByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<SaveResult> SaveAsync(TransactionEmployeeLoanSaveDto model) => await _repo.SaveAsync(model);
        public async Task<SaveResult> DeleteAsync(int id,string deleteBy) => await _repo.DeleteAsync(id, deleteBy);
        public async Task<string> GenerateNoAsync() => await _repo.GenerateNoAsync();
    }
}
