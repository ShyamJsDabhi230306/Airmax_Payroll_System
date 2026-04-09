using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Models.Transaction;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterEmployeeService
    {
        private readonly MasterEmployeeRepo _repo;

        public MasterEmployeeService(MasterEmployeeRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterEmployee>> GetAllAsync(int idCompany, int idLocation, int idDepartment)
            => await _repo.GetAllAsync(idCompany, idLocation, idDepartment);

        public async Task<MasterEmployee?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(MasterEmployee emp)
            => await _repo.SaveAsync(emp);

        public async Task<SaveResult> DeleteAsync(int id,string deleteBy)
            => await _repo.DeleteAsync(id, deleteBy);


        public async Task<IEnumerable<EmployeeModel>> GetByDepartmentAsync(int id)
           => await _repo.GetByDepartmentAsync(id);
    }
}
