using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterLocation : AuditFields
    {
        public int IDLocation { get; set; }

        public int? IDCompany { get; set; }

        public string? LocationName { get; set; }
        public string? CompanyName { get; set; }
    }
}
