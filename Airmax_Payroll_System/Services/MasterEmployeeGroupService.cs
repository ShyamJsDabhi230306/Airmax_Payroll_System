using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterEmployeeGroupService
    {
        private readonly MasterEmployeeGroupRepo _repo;

        public MasterEmployeeGroupService(MasterEmployeeGroupRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterEmployeeGroup>> GetAllAsync()
            => await _repo.GetAllAsync();

        public async Task<MasterEmployeeGroup?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(MasterEmployeeGroup group)
            => await _repo.SaveAsync(group);

        public async Task<SaveResult> DeleteAsync(int id)
            => await _repo.DeleteAsync(id);
    }
}
