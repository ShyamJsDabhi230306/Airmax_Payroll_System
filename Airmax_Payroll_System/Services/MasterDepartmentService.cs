using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterDepartmentService
    {

        private readonly MasterDepartmentRepo _repo;

        public MasterDepartmentService(MasterDepartmentRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterDepartment>> GetAllAsync(int idCompany, int idLocation, int idDepartment)
            => await _repo.GetAllAsync(idCompany,idLocation,idDepartment);

        public async Task<MasterDepartment?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(MasterDepartment model)
            => await _repo.SaveAsync(model);

        public async Task<SaveResult> DeleteAsync(int id ,string deleteBy)
            => await _repo.DeleteAsync(id, deleteBy);
    }
}