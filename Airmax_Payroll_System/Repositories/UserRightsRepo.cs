using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;

namespace Airmax_Payroll_System.Repositories
{
    public class UserRightsRepo
    {
        private readonly IDapperHelper _dapper;
        public UserRightsRepo(IDapperHelper dapper)
        {
            _dapper = dapper;
        }
        // 🏢 Get Locations for Filtering
        public async Task<IEnumerable<DropdownItem>> GetLocationsAsync(int companyId)
        {
            var param = new DynamicParameters();
            param.Add("@IDCompany", companyId);
            return await _dapper.QueryAsync<DropdownItem>("usp_UserRights_GetLocations", param);
        }
        // 📍 Get Departments for Filtering
        public async Task<IEnumerable<DropdownItem>> GetDepartmentsAsync(int locationId)
        {
            var param = new DynamicParameters();
            param.Add("@IDLocation", locationId);
            return await _dapper.QueryAsync<DropdownItem>("usp_UserRights_GetDepartments", param);
        }
        // 👤 Get Users for Filtering
        public async Task<IEnumerable<DropdownItem>> GetUsersAsync(int deptId)
        {
            var param = new DynamicParameters();
            param.Add("@IDDepartment", deptId);
            return await _dapper.QueryAsync<DropdownItem>("usp_UserRights_GetUsers", param);
        }
        // ⛓️ Get Permissions for Selected User
        public async Task<IEnumerable<UserPagePermission>> GetPermissionsAsync(int userId)
        {
            var param = new DynamicParameters();
            param.Add("@UserId", userId);
            return await _dapper.QueryAsync<UserPagePermission>("usp_UserRights_GetPagePermissions", param);
        }
        // 💾 Save Permissions
        public async Task<SaveResult> SavePermissionsAsync(UserRightsSaveDto model)
        {
            foreach (var item in model.Permissions)
            {
                var param = new DynamicParameters();
                param.Add("@UserId", model.UserId);
                param.Add("@PageId", item.PageId);
                param.Add("@CanView", item.CanView);
                param.Add("@CanCreate", item.CanCreate);
                param.Add("@CanEdit", item.CanEdit);
                param.Add("@CanDelete", item.CanDelete);
                await _dapper.ExecuteAsync("usp_UserRights_SavePermissions", param);
            }
            return SaveResult.Success("Rights updated successfully!");
        }
    }
}
