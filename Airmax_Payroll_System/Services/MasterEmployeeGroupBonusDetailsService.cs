using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterEmployeeGroupBonusDetailsService
    {
        private readonly MasterEmployeeGroupBonusDetailsRepo _repo;

        public MasterEmployeeGroupBonusDetailsService(
            MasterEmployeeGroupBonusDetailsRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterEmployeeGroupBonusDetails>> GetAllAsync()
            => await _repo.GetAllAsync();

        public async Task<MasterEmployeeGroupBonusDetails?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(MasterEmployeeGroupBonusDetails model)
            => await _repo.SaveAsync(model);

        public async Task<SaveResult> DeleteAsync(int id,string deleteBy)
            => await _repo.DeleteAsync(id, deleteBy);
    }
}
