using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterPayRollApiConfigrationRepo
    {
        private readonly IDapperHelper _dapper;

        public MasterPayRollApiConfigrationRepo(IDapperHelper dapper)
        {
            _dapper = dapper;
        }

        public async Task<IEnumerable<MasterPayRollApiConfigration>> GetAllAsync()
        {
            return await _dapper.QueryAsync<MasterPayRollApiConfigration>("usp_Master_PayRollApiConfigration_GetAll");
        }

        public async Task<MasterPayRollApiConfigration> GetByIdAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDPayrollApiConfigration", id);
            return await _dapper.QueryFirstOrDefaultAsync<MasterPayRollApiConfigration>("usp_Master_PayRollApiConfigration_GetById", param);
        }

        

        public async Task<SaveResult> SaveAsync(MasterPayRollApiConfigration model, string username)
        {
            try
            {

                var param = new DynamicParameters();

            // 1. Basic & Auth (All 53 columns)
            param.Add("@IDPayrollApiConfigration", model.IDPayrollApiConfigration);
            param.Add("@IDCompany", model.IDCompany);
            param.Add("@BaseUrl", model.BaseUrl);
            param.Add("@AccountName", model.AccountName);
            param.Add("@ApiKey", model.ApiKey);
            param.Add("@PullApiEndPoint", model.PullApiEndPoint);
            param.Add("@RequestTimeout", model.RequestTimeout);
            param.Add("@RetryAttemptOfFailer", model.RetryAttemptOfFailer);
            param.Add("@RetryBackOff", model.RetryBackOff);
            param.Add("@UseHTTPSOnly", model.UseHTTPSOnly);
            param.Add("@maskApiInLog", model.maskApiInLog);
            param.Add("@IPWhiteListEnforcement", model.IPWhiteListEnforcement);
            param.Add("@AutoRotateApiKeyOnEvery90Days", model.AutoRotateApiKeyOnEvery90Days);
            param.Add("@PullFrequency", model.PullFrequency);
            param.Add("@DateRangeWindow", model.DateRangeWindow);
            param.Add("@ActiveHours", model.ActiveHours);
            param.Add("@UserIDPull", model.UserIDPull);
            param.Add("@LogDate", model.LogDate);
            param.Add("@SerialNumberPull", model.SerialNumberPull);
            param.Add("@DeviceNamePull", model.DeviceNamePull);
            param.Add("@UseridPayroll", model.UseridPayroll);
            param.Add("@UseridTransform", model.UseridTransform);
            param.Add("@LogDatePayroll", model.LogDatePayroll);
            param.Add("@LogdateTransform", model.LogdateTransform);
            param.Add("@SerialNumberPayroll", model.SerialNumberPayroll);
            param.Add("@SerialNumberTransform", model.SerialNumberTransform);
            param.Add("@DeviceSNamesPayroll", model.DeviceSNamesPayroll);
            param.Add("@deviceSNamesTransform", model.deviceSNamesTransform);
            param.Add("@OnDuplicatePunch", model.OnDuplicatePunch);
            param.Add("@UnknownEmployeeCode", model.UnknownEmployeeCode);
            param.Add("@RejectFuturePunch", model.RejectFuturePunch);
            param.Add("@RejectOldPunch", model.RejectOldPunch);
            param.Add("@EmailOnFailure", model.EmailOnFailure);
            //param.Add("@IDBiometricDevice", model.IDBiometricDevice);
            param.Add("@DefaultVerifyMode", model.DefaultVerifyMode);
            param.Add("@FaceCardDual", model.FaceCardDual);
            param.Add("@UploadFaceTemplates", model.UploadFaceTemplates);
            param.Add("@UploadFingerprints", model.UploadFingerprints);
            param.Add("@UploadCards", model.UploadCards);
            param.Add("@AutoClearLogsAfterSync", model.AutoClearLogsAfterSync);
            param.Add("@OnlineEnrollment", model.OnlineEnrollment);
            param.Add("@BlockUserSupport", model.BlockUserSupport);
            param.Add("@AutoPushOnEmployeeAdd", model.AutoPushOnEmployeeAdd);
            param.Add("@AutoDeleteOnEmployeeResign", model.AutoDeleteOnEmployeeResign);
            param.Add("@PushOnDepartmentChange", model.PushOnDepartmentChange);
            param.Add("@IsPushPhotoEnabled", model.IsPushPhotoEnabled);
            param.Add("@IsExpirySetOnResign", model.IsExpirySetOnResign);
            param.Add("@IsPushLocationRestricted", model.IsPushLocationRestricted);
            param.Add("@IsBlockOnSuspend", model.IsBlockOnSuspend);
            //param.Add("@IDLocationDeviceMaping", model.IDLocationDeviceMaping);
            param.Add("@MaxQueueSizePerDevice", model.MaxQueueSizePerDevice);
            param.Add("@StaleCommandTTLHours", model.StaleCommandTTLHours);
            param.Add("@ConcurrentCommandsPerDevice", model.ConcurrentCommandsPerDevice);

            // 2. Audit
            param.Add("@IsActive", model.IsActive);
            param.Add("@username", username);

                // 3. JSON DATA — always serialize as array (never as "null" which breaks OPENJSON in SP)
             var deviceJson = JsonConvert.SerializeObject(model.DeviceList ?? new List<MasterBiomatricDevices>());
             var mappingJson = JsonConvert.SerializeObject(model.MappingList ?? new List<MasterLocationDeviceMapping>());
             param.Add("@DeviceJson", deviceJson);
             param.Add("@MappingJson", mappingJson);

                return await _dapper.QueryFirstOrDefaultAsync<SaveResult>("usp_Master_PayRollApiConfigration_Save", param);
            }
            catch (Exception ex)
            {
                return new SaveResult { Result = -1, Message = $"Database Error: {ex.Message}" };
            }
        }


        public async Task<SaveResult> DeleteAsync(int id, string username)
        {
            var param = new DynamicParameters();
            param.Add("@IDPayrollApiConfigration", id);
            param.Add("@username", username);
            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>("usp_Master_PayRollApiConfigration_Delete", param);
        }
    }
}
