using Airmax_Payroll_System.Models.AllDTOS;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class TransactionEmployeeKharchiService
    {
        private readonly TransactionEmployeeKharchiRepo _repo;

        public TransactionEmployeeKharchiService(TransactionEmployeeKharchiRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<TransactionEmployeeKharchi>> GetAllAsync()
            => await _repo.GetAllAsync();

        public async Task<TransactionEmployeeKharchi?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(TransactionEmployeeKharchiSaveDto model)
            => await _repo.SaveAsync(model);

        public async Task<SaveResult> DeleteAsync(int id)
            => await _repo.DeleteAsync(id);

       
    }
}
