using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Airmax_Payroll_System.Services
{
    public class MasterBiomatricDevicesService
    {
        private readonly MasterBiomatricDevicesRepo _repo;

        public MasterBiomatricDevicesService(MasterBiomatricDevicesRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterBiomatricDevices>> GetAllAsync() => await _repo.GetAllAsync();

        public async Task<MasterBiomatricDevices> GetByIdAsync(int id) => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(MasterBiomatricDevices model, string username) => await _repo.SaveAsync(model, username);

        public async Task<SaveResult> DeleteAsync(int id, string username) => await _repo.DeleteAsync(id, username);
    }
}
