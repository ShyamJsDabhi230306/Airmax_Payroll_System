using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterPage : AuditFields
    {
        public int PageId { get; set; }
        public string PageName { get; set; } = string.Empty;
        public string? PageUrl { get; set; } 
    }
}
