namespace Airmax_Payroll_System.Models.DeviceLog
{

    public class AttendanceDailySummary
    {
        public int? IDAttendenceDailySummary { get; set; }
        public string EmployeeCode { get; set; }

        public int? IDEmployee { get; set; }
        public string EmployeeName { get; set; }
        public int? IDDivision { get; set; }
        public string? DivisionName { get; set; }
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







        public int TotalMonthDays { get; set; }
        public int TotalWorkingDays { get; set; }
        public int TotalSundays { get; set; }
        public int TotalPaidHolidays { get; set; }
        public int TotalUnpaidHolidays { get; set; }

        public decimal TotalPresentDays { get; set; }
        public decimal TotalPayableDays { get; set; }

        public int TotalAllWorkingMinutes { get; set; }
        public int TotalAllWorkingHour { get; set; }
        public int TotalAllWorkingMinute { get; set; }

        public int TotalAllLateMinutes { get; set; }
        public int TotalAllLateHour { get; set; }
        public int TotalAllLateMinute { get; set; }

        public int TotalAllOTMinutes { get; set; }
        public int TotalAllOTHour { get; set; }
        public int TotalAllOTMinute { get; set; }

        public decimal TotalOTDays { get; set; }

        public int LateEntryCount { get; set; }
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
        public int IDEmployee { get; set; }
        public DateTime? AttendenceDate { get; set; }
        public DateTime? InTime { get; set; }
        public DateTime? OutTime { get; set; }
        public string? ManualReason { get; set; }



    }
}
