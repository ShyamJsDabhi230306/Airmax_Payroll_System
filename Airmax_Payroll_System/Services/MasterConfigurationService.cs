using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterConfigurationService
    {
        private readonly MasterConfigurationRepo _repo;
        public MasterConfigurationService(MasterConfigurationRepo repo)
        {
            _repo = repo;
        }
        public async Task<IEnumerable<Master_Configuration>> GetAllAsync()
        {
            try
            {
                return await _repo.GetAllAsync();
            }
            catch (Exception)
            {
                return new List<Master_Configuration>();
            }
        }
        public async Task<Master_Configuration?> GetByIdAsync(int id)
        {
            try
            {
                return await _repo.GetByIdAsync(id);
            }
            catch (Exception)
            {
                return null;
            }
        }
        public async Task<SaveResult> SaveAsync(Master_Configuration model)
        {
            try
            {
                return await _repo.SaveAsync(model);
            }
            catch (Exception ex)
            {
                return new SaveResult { Result = 0, Message = ex.Message };
            }
        }
        public async Task<SaveResult> DeleteAsync(int id, string deletedBy)
        {
            try
            {
                return await _repo.DeleteAsync(id, deletedBy);
            }
            catch (Exception ex)
            {
                return new SaveResult { Result = 0, Message = ex.Message };
            }
        }
        public async Task<decimal> GetLimitByCompanyAsync(int companyId)
        {
            try
            {
                // Calls the repo method we created in the previous step
                return await _repo.GetLimitByCompanyAsync(companyId);
            }
            catch (Exception)
            {
                // Fallback to 0 if there is an error
                return 0;
            }
        }

    }
}
