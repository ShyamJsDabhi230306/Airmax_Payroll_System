using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterEmployeeGroupBonusDetails : AuditFields
    {
        public int IDEmployeeGroupBonus { get; set; }

        public int? IDEmployeeGroup { get; set; }
        public string? EmployeeGroupName { get; set; }
        public decimal? MinYear { get; set; }

        public decimal? MaxYear { get; set; }

        public decimal? Bonus { get; set; }
    }
}
