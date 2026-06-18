using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Airmax_Payroll_System.Services
{
    public class MasterLocationDeviceMappingService
    {
        private readonly MasterLocationDeviceMappingRepo _repo;

        public MasterLocationDeviceMappingService(MasterLocationDeviceMappingRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterLocationDeviceMapping>> GetAllAsync() => await _repo.GetAllAsync();
        public async Task<MasterLocationDeviceMapping> GetByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<SaveResult> SaveAsync(MasterLocationDeviceMapping model, string username) => await _repo.SaveAsync(model, username);
        public async Task<SaveResult> DeleteAsync(int id, string username) => await _repo.DeleteAsync(id, username);
    }
}
