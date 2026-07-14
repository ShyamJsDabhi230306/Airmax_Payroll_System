using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterHoliday : AuditFields
    {

        public int IDHoliday { get; set; }
        public DateTime? HolidayMonth { get; set; }
        public DateTime? HolidayDate { get; set; }
        public string? DayName { get; set; }
        public string? HolidayType { get; set; }
        public string? HolidayName { get; set; }
    }
}
