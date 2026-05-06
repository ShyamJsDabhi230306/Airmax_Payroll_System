using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Models.Common;
using Dapper;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterLocationDeviceMappingRepo
    {
        private readonly IDapperHelper _dapper;

        public MasterLocationDeviceMappingRepo(IDapperHelper dapper)
        {
            _dapper = dapper;
        }

        public async Task<IEnumerable<MasterLocationDeviceMapping>> GetAllAsync()
        {
            return await _dapper.QueryAsync<MasterLocationDeviceMapping>("usp_Master_LocationDeviceMapping_GetAll");
        }

        public async Task<MasterLocationDeviceMapping> GetByIdAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDLocationDeviceMaping", id);
            return await _dapper.QueryFirstOrDefaultAsync<MasterLocationDeviceMapping>("usp_Master_LocationDeviceMapping_GetById", param);
        }

        public async Task<SaveResult> SaveAsync(MasterLocationDeviceMapping model, string username)
        {
            var param = new DynamicParameters();
            param.Add("@IDLocationDeviceMaping", model.IDLocationDeviceMaping);
            param.Add("@IDLocation", model.IDLocation);
            param.Add("@MappedDeviceSerials", model.MappedDeviceSerials);
            param.Add("@TotalEmployee", model.TotalEmployee);
            param.Add("@IsActive", model.IsActive);
            param.Add("@username", username);
            param.Add("@IDPayrollApiConfigration", model.IDPayrollApiConfigration);

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>("usp_Master_LocationDeviceMapping_Save", param);
        }

        public async Task<SaveResult> DeleteAsync(int id, string username)
        {
            var param = new DynamicParameters();
            param.Add("@IDLocationDeviceMaping", id);
            param.Add("@username", username);
            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>("usp_Master_LocationDeviceMapping_Delete", param);
        }
    }
}
