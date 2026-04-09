using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterDesignationService
    {
        private readonly MasterDesignationRepo _repo;

        public MasterDesignationService(MasterDesignationRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterDesignation>> GetAllAsync()
            => await _repo.GetAllAsync();

        public async Task<MasterDesignation?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(MasterDesignation model)
            => await _repo.SaveAsync(model);

        public async Task<SaveResult> DeleteAsync(int id , string deleteBy)
            => await _repo.DeleteAsync(id, deleteBy);
    }
}