using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{

    public class MasterBiomatricDevices : AuditFields
    {
        public int IDBiometricDevice { get; set; }
        public string? DeviceName { get; set; }
        public string? SerialNumber { get; set; }
        public string? ModelType { get; set; }
        public int? IDLocation { get; set; }
        public string? locationName { get; set; }
        public string? Status { get; set; }
        public int? IDPayrollApiConfigration { get; set; }
    }
}