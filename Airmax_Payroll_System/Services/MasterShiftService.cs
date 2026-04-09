using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class MasterShiftService
    {
        private readonly MasterShiftRepo _shiftRepo;

        public MasterShiftService(MasterShiftRepo shiftRepo)
        {
            _shiftRepo = shiftRepo;
        }

        public async Task<IEnumerable<MasterShift>> GetAllAsync()
            => await _shiftRepo.GetAllAsync();

        public async Task<MasterShift?> GetByIdAsync(int idShift)
            => await _shiftRepo.GetByIdAsync(idShift);

        public async Task<SaveResult> SaveAsync(MasterShift shift)
            => await _shiftRepo.SaveAsync(shift);

        public async Task<SaveResult> DeleteAsync(int idShift,string deleteBy)
            => await _shiftRepo.DeleteAsync(idShift , deleteBy);
    }
}