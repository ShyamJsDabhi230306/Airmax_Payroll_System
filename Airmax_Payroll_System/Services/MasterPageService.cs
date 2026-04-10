using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterPageService
    {
        private readonly MasterPageRepo _repo;
        public MasterPageService(MasterPageRepo repo)
        {
            _repo = repo;
        }
        public async Task<IEnumerable<MasterPage>> GetAllAsync() => await _repo.GetAllAsync();
        public async Task<MasterPage?> GetByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<SaveResult> SaveAsync(MasterPage model) => await _repo.SaveAsync(model);
        public async Task<SaveResult> DeleteAsync(int id, string deletedBy) => await _repo.DeleteAsync(id, deletedBy);
    }
}
