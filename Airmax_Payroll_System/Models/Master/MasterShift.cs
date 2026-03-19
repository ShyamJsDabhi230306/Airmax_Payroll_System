using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterShift:AuditFields
    {
        public int IDShift { get; set; }

        public int? IDDepartment { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? ShiftDesc { get; set; }

        public DateTime? StartTime { get; set; }

        public int? StartTimeHour { get; set; }

        public int? StartTimeMinute { get; set; }

        public DateTime? EndTime { get; set; }

        public int? EndTimeHour { get; set; }

        public int? EndTimeMinute { get; set; }

        public decimal? TotalWorkingHour { get; set; }

        public decimal? TotalWorkingMinute { get; set; }

        public DateTime? Overtime { get; set; }
    }
}
