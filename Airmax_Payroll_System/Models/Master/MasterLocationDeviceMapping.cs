using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterLocationDeviceMapping : AuditFields
    {
        public int IDLocationDeviceMaping { get; set; }
        public int? IDLocation { get; set; }
        public string? LocationName { get; set; }
        public string? MappedDeviceSerials { get; set; }
        public string? TotalEmployee { get; set; }
        public int? IDPayrollApiConfigration { get; set; }
    }
}
