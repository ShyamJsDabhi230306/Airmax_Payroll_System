using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterCompanyService
    {
        private readonly MasterCompanyRepo _companyRepo;
        public MasterCompanyService(MasterCompanyRepo companyRepo)
        {

            _companyRepo = companyRepo;
        }
        public async Task<IEnumerable<Models.Master.MasterCompany>> GetAllAsync() => await _companyRepo.GetAllAsync();
        public async Task<Models.Master.MasterCompany?> GetByIdAsync(int idCompany) => await _companyRepo.GetByIdAsync(idCompany);
        public async Task<SaveResult> SaveAsync(Models.Master.MasterCompany company) => await _companyRepo.SaveAsync(company);
        public async Task<SaveResult> DeleteAsync(int idCompany , string deleteBy) => await _companyRepo.DeleteAsync(idCompany , deleteBy);
    }
}
