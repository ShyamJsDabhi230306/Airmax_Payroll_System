using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Models.Common;
using Dapper;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterBiomatricDevicesRepo
    {
        private readonly IDapperHelper _dapper;

        public MasterBiomatricDevicesRepo(IDapperHelper dapper)
        {
            _dapper = dapper;
        }

        public async Task<IEnumerable<MasterBiomatricDevices>> GetAllAsync()
        {
            return await _dapper.QueryAsync<MasterBiomatricDevices>("usp_Master_BiomatricDevices_GetAll");
        }

        public async Task<MasterBiomatricDevices> GetByIdAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDBiometricDevice", id);

            return await _dapper.QueryFirstOrDefaultAsync<MasterBiomatricDevices>(
                "usp_Master_BiomatricDevices_GetById",
                param);
        }

        public async Task<SaveResult> SaveAsync(MasterBiomatricDevices model, string username)
        {
            var param = new DynamicParameters();
            param.Add("@IDBiometricDevice", model.IDBiometricDevice);
            param.Add("@DeviceName", model.DeviceName);
            param.Add("@SerialNumber", model.SerialNumber);
            param.Add("@ModelType", model.ModelType);
            param.Add("@IDLocation", model.IDLocation);
            param.Add("@Status", model.Status);
            param.Add("@IsActive", model.IsActive);
            param.Add("@username", username);

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Master_BiomatricDevices_Save",
                param);
        }

        public async Task<SaveResult> DeleteAsync(int id, string username)
        {
            var param = new DynamicParameters();
            param.Add("@IDBiometricDevice", id);
            param.Add("@username", username);

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Master_BiomatricDevices_Delete",
                param);
        }
    }
}
