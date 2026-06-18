namespace Airmax_Payroll_System.Models.DeviceLog
{

    public class AttendanceDailySummary
    {
        public string EmployeeCode { get; set; }

        public string EmployeeName { get; set; }

        public string AttendenceDate { get; set; }

        public string InTime { get; set; }

        public string OutTime { get; set; }

        public int? TotalWorkingHour { get; set; }

        public int? TotalWorkingMinute { get; set; }

        public int? LateHour { get; set; }

        public int? LateMinute { get; set; }

        public int? OTHour { get; set; }

        public int? OTMinute { get; set; }

        public string AttendenceStatus { get; set; }

        public string InDevice { get; set; }

        public string OutDevice { get; set; }
    }
}
