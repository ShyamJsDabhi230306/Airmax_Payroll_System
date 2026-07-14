using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterHolidayService
    {
        private readonly MasterHolidayRepo _repo;

        public MasterHolidayService(MasterHolidayRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterHoliday>> GetAllAsync()
            => await _repo.GetAllAsync();

        public async Task<MasterHoliday?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(MasterHoliday model, string userFullName)
            => await _repo.SaveAsync(model, userFullName);

        public async Task<SaveResult> DeleteAsync(int id, string deletedBy)
            => await _repo.DeleteAsync(id, deletedBy);

        public async Task<IEnumerable<MasterHoliday>> GetByMonthAsync(DateTime holidayMonth)
        {
            return await _repo.GetByMonthAsync(holidayMonth);
        }
    }
}