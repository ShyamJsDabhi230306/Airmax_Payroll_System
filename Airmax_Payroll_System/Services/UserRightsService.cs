using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class UserRightsService
    {
        private readonly UserRightsRepo _repo;
        public UserRightsService(UserRightsRepo repo)
        {
            _repo = repo;
        }
        // Dropdown Filtering
        public async Task<IEnumerable<DropdownItem>> GetLocationsAsync(int companyId) => await _repo.GetLocationsAsync(companyId);
        public async Task<IEnumerable<DropdownItem>> GetDepartmentsAsync(int locationId) => await _repo.GetDepartmentsAsync(locationId);
        public async Task<IEnumerable<DropdownItem>> GetUsersAsync(int deptId) => await _repo.GetUsersAsync(deptId);
        // Permissions Management
        public async Task<IEnumerable<UserPagePermission>> GetPermissionsAsync(int userId) => await _repo.GetPermissionsAsync(userId);
        public async Task<SaveResult> SavePermissionsAsync(UserRightsSaveDto model) => await _repo.SavePermissionsAsync(model);
    }
}
