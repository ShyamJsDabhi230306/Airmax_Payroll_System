using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Airmax_Payroll_System.Services
{
    public class MasterPayRollApiConfigrationService
    {
        private readonly MasterPayRollApiConfigrationRepo _repo;

        public MasterPayRollApiConfigrationService(MasterPayRollApiConfigrationRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterPayRollApiConfigration>> GetAllAsync() => await _repo.GetAllAsync();
        public async Task<MasterPayRollApiConfigration> GetByIdAsync(int id) => await _repo.GetByIdAsync(id);
        public async Task<SaveResult> SaveAsync(MasterPayRollApiConfigration model, string username) => await _repo.SaveAsync(model, username);
        public async Task<SaveResult> DeleteAsync(int id, string username) => await _repo.DeleteAsync(id, username);
    }
}
