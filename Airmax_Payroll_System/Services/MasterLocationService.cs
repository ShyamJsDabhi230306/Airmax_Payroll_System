using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterLocationService
    {
        private readonly MasterLocationRepo _repo;

        public MasterLocationService(MasterLocationRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterLocation>> GetAllAsync()
            => await _repo.GetAllAsync();

        public async Task<MasterLocation?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(MasterLocation model)
            => await _repo.SaveAsync(model);

        public async Task<SaveResult> DeleteAsync(int id ,string deleteBy)
            => await _repo.DeleteAsync(id, deleteBy);
    }
}