using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterDivision:AuditFields
    {
        public int IDDivision { get; set; }
        public int IDLocation { get; set; }
        public string? DivisionName { get; set; }
        public string? LocationName { get; set; }
    }
}
