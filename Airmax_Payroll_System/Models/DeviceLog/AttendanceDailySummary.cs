namespace Airmax_Payroll_System.Models.DeviceLog
{

    public class AttendanceDailySummary
    {
        public int? IDAttendenceDailySummary { get; set; }
        public string EmployeeCode { get; set; }

        public int? IDEmployee { get; set; }
        public string EmployeeName { get; set; }

        public int? IDDepartment { get; set; }

        public string DepartmentName { get; set; }
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
        public int TotalRecords { get; set; }
    }

    public class PagedResponse<T>
    {
        public List<T> Data { get; set; }

        public int TotalRecords { get; set; }
        public int Page { get; set; }

        public int PageSize { get; set; }
    }

    public class AttendanceManualUpdateRequest
    {
        public int IDAttendenceDailySummary { get; set; }

        public string InTime { get; set; }

        public string OutTime { get; set; }
    }
}
