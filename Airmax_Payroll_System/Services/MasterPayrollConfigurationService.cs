using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master.Payroll;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterPayrollConfigurationService
    {
        private readonly MasterPayrollConfigurationRepo _repo;

        public MasterPayrollConfigurationService(MasterPayrollConfigurationRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterPayrollConfiguration>> GetAllAsync()
            => await _repo.GetAllAsync();

        public async Task<MasterPayrollConfiguration?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<MasterPayrollConfiguration?> GetByCompanyGroupAsync(int idCompany, int idEmployeeGroup)
            => await _repo.GetByCompanyGroupAsync(idCompany, idEmployeeGroup);

        public async Task<SaveResult> SaveAsync(MasterPayrollConfiguration model)
            => await _repo.SaveAsync(model);

        public async Task<SaveResult> DeleteAsync(int id, string deleteBy)
            => await _repo.DeleteAsync(id, deleteBy);
    }
}
