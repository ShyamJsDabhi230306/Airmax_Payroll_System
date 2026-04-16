using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterDivisionService
    {
        private readonly MasterDivisionRepo _repo;

        public MasterDivisionService(MasterDivisionRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterDivision>> GetAllAsync(int idCompany, int idLocation, int idDivision)
            => await _repo.GetAllAsync(idCompany, idLocation, idDivision);

        public async Task<MasterDivision?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(MasterDivision model)
            => await _repo.SaveAsync(model);

        public async Task<SaveResult> DeleteAsync(int id, string deleteBy)
            => await _repo.DeleteAsync(id, deleteBy);
    }
}
