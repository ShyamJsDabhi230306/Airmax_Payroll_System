using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Models.Common;
using Dapper;
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

        //public async Task<SaveResult> SaveAsync(MasterPayRollApiConfigration model, string username)
        //{
        //    var param = new DynamicParameters();

        //    // Basic & Auth
        //    param.Add("@IDPayrollApiConfigration", model.IDPayrollApiConfigration);
        //    param.Add("@IDCompany", model.IDCompany);
        //    param.Add("@BaseUrl", model.BaseUrl);
        //    param.Add("@AccountName", model.AccountName);
        //    param.Add("@ApiKey", model.ApiKey);
        //    param.Add("@PullApiEndPoint", model.PullApiEndPoint);
        //    param.Add("@RequestTimeout", model.RequestTimeout);
        //    param.Add("@RetryAttemptOfFailer", model.RetryAttemptOfFailer);
        //    param.Add("@RetryBackOff", model.RetryBackOff);

        //    // Flags
        //    param.Add("@UseHTTPSOnly", model.UseHTTPSOnly);
        //    param.Add("@maskApiInLog", model.maskApiInLog);
        //    param.Add("@IPWhiteListEnforcement", model.IPWhiteListEnforcement);
        //    param.Add("@AutoRotateApiKeyOnEvery90Days", model.AutoRotateApiKeyOnEvery90Days);

        //    // Timing & Frequency
        //    param.Add("@PullFrequency", model.PullFrequency);
        //    param.Add("@DateRangeWindow", model.DateRangeWindow);
        //    param.Add("@ActiveHours", model.ActiveHours);

        //    // Toggles
        //    param.Add("@UserIDPull", model.UserIDPull);
        //    param.Add("@LogDate", model.LogDate);
        //    param.Add("@SerialNumberPull", model.SerialNumberPull);
        //    param.Add("@DeviceNamePull", model.DeviceNamePull);

        //    // Data Mapping
        //    param.Add("@UseridPayroll", model.UseridPayroll);
        //    param.Add("@UseridTransform", model.UseridTransform);
        //    param.Add("@LogDatePayroll", model.LogDatePayroll);
        //    param.Add("@LogdateTransform", model.LogdateTransform);
        //    param.Add("@SerialNumberPayroll", model.SerialNumberPayroll);
        //    param.Add("@SerialNumberTransform", model.SerialNumberTransform);
        //    param.Add("@DeviceSNamesPayroll", model.DeviceSNamesPayroll);
        //    param.Add("@deviceSNamesTransform", model.deviceSNamesTransform);

        //    // Rules
        //    param.Add("@OnDuplicatePunch", model.OnDuplicatePunch);
        //    param.Add("@UnknownEmployeeCode", model.UnknownEmployeeCode);
        //    param.Add("@RejectFuturePunch", model.RejectFuturePunch);
        //    param.Add("@RejectOldPunch", model.RejectOldPunch);
        //    param.Add("@EmailOnFailure", model.EmailOnFailure);

        //    // Biometric & Devices
        //    param.Add("@IDBiometricDevice", model.IDBiometricDevice);
        //    param.Add("@DefaultVerifyMode", model.DefaultVerifyMode);
        //    param.Add("@FaceCardDual", model.FaceCardDual);
        //    param.Add("@UploadFaceTemplates", model.UploadFaceTemplates);
        //    param.Add("@UploadFingerprints", model.UploadFingerprints);
        //    param.Add("@UploadCards", model.UploadCards);

        //    // Sync & Enrollment
        //    param.Add("@AutoClearLogsAfterSync", model.AutoClearLogsAfterSync);
        //    param.Add("@OnlineEnrollment", model.OnlineEnrollment);
        //    param.Add("@BlockUserSupport", model.BlockUserSupport);

        //    // Automation & Lifecycle
        //    param.Add("@AutoPushOnEmployeeAdd", model.AutoPushOnEmployeeAdd);
        //    param.Add("@AutoDeleteOnEmployeeResign", model.AutoDeleteOnEmployeeResign);
        //    param.Add("@PushOnDepartmentChange", model.PushOnDepartmentChange);
        //    param.Add("@IsPushPhotoEnabled", model.IsPushPhotoEnabled);
        //    param.Add("@IsExpirySetOnResign", model.IsExpirySetOnResign);
        //    param.Add("@IsPushLocationRestricted", model.IsPushLocationRestricted);
        //    param.Add("@IsBlockOnSuspend", model.IsBlockOnSuspend);

        //    // Limits & Mapping
        //    param.Add("@IDLocationDeviceMaping", model.IDLocationDeviceMaping);
        //    param.Add("@MaxQueueSizePerDevice", model.MaxQueueSizePerDevice);
        //    param.Add("@StaleCommandTTLHours", model.StaleCommandTTLHours);
        //    param.Add("@ConcurrentCommandsPerDevice", model.ConcurrentCommandsPerDevice);

        //    // Audit
        //    param.Add("@IsActive", model.IsActive);
        //    param.Add("@username", username);

        //    return await _dapper.QueryFirstOrDefaultAsync<SaveResult>("usp_Master_PayRollApiConfigration_Save", param);
        //}

        public async Task<SaveResult> SaveAsync(MasterPayRollApiConfigration model, string username)
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
            param.Add("@IDBiometricDevice", model.IDBiometricDevice);
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
            param.Add("@IDLocationDeviceMaping", model.IDLocationDeviceMaping);
            param.Add("@MaxQueueSizePerDevice", model.MaxQueueSizePerDevice);
            param.Add("@StaleCommandTTLHours", model.StaleCommandTTLHours);
            param.Add("@ConcurrentCommandsPerDevice", model.ConcurrentCommandsPerDevice);

            // 2. Audit
            param.Add("@IsActive", model.IsActive);
            param.Add("@username", username);

            // 3. JSON DATA (NEW - Handles the Tables)
            param.Add("@DeviceJson", model.DeviceJson);
            param.Add("@MappingJson", model.MappingJson);

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>("usp_Master_PayRollApiConfigration_Save", param);
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
