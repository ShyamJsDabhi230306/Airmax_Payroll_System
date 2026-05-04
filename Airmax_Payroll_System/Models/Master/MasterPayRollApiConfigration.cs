using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterPayRollApiConfigration : AuditFields
    {

        public int IDPayrollApiConfigration { get; set; }
        public int IDCompany { get; set; }

        // Connection & Auth
        public string? BaseUrl { get; set; }
        public string? AccountName { get; set; }
        public string? ApiKey { get; set; }
        public string? PullApiEndPoint { get; set; }
        public int? RequestTimeout { get; set; }
        public int? RetryAttemptOfFailer { get; set; }
        public int? RetryBackOff { get; set; }

        // Security & Flags
        public bool UseHTTPSOnly { get; set; }
        public bool maskApiInLog { get; set; }
        public bool IPWhiteListEnforcement { get; set; }
        public bool AutoRotateApiKeyOnEvery90Days { get; set; }

        // Frequency & Timing
        public string PullFrequency { get; set; }
        public string DateRangeWindow { get; set; }
        public string ActiveHours { get; set; }

        // Pull Toggles
        public bool UserIDPull { get; set; }
        public bool LogDate { get; set; }
        public bool SerialNumberPull { get; set; }
        public bool DeviceNamePull { get; set; }

        // Data Mapping
        public string UseridPayroll { get; set; }
        public string UseridTransform { get; set; }
        public string LogDatePayroll { get; set; }
        public string LogdateTransform { get; set; }
        public string SerialNumberPayroll { get; set; }
        public string SerialNumberTransform { get; set; }
        public string DeviceSNamesPayroll { get; set; }
        public string deviceSNamesTransform { get; set; }

        // Logic & Rules
        public string OnDuplicatePunch { get; set; }
        public string UnknownEmployeeCode { get; set; }
        public bool RejectFuturePunch { get; set; }
        public bool RejectOldPunch { get; set; }
        public bool EmailOnFailure { get; set; }

        // Biometric Settings
        public int? IDBiometricDevice { get; set; }
        public string DefaultVerifyMode { get; set; }
        public string FaceCardDual { get; set; }
        public string UploadFaceTemplates { get; set; }
        public string UploadFingerprints { get; set; }
        public string UploadCards { get; set; }

        // Operations
        public string AutoClearLogsAfterSync { get; set; }
        public string OnlineEnrollment { get; set; }
        public string BlockUserSupport { get; set; }

        // Automation
        public string AutoPushOnEmployeeAdd { get; set; }
        public string AutoDeleteOnEmployeeResign { get; set; }
        public string PushOnDepartmentChange { get; set; }
        public bool IsPushPhotoEnabled { get; set; }
        public bool IsExpirySetOnResign { get; set; }
        public bool IsPushLocationRestricted { get; set; }
        public bool IsBlockOnSuspend { get; set; }

        // Limits & Mapping
        public int? IDLocationDeviceMaping { get; set; }
        public int? MaxQueueSizePerDevice { get; set; }
        public int? StaleCommandTTLHours { get; set; }
        public int? ConcurrentCommandsPerDevice { get; set; }


        // Add these to MasterPayRollApiConfigration.cs
        public string? DeviceJson { get; set; }
        public string? MappingJson { get; set; }

    }
}
