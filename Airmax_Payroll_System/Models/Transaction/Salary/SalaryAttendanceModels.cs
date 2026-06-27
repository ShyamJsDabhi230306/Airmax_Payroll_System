namespace Airmax_Payroll_System.Models.Transaction.Salary
{
   
        public class SalaryAttendanceMonthlyMetric
        {
            public int? IDEmployee { get; set; }
            public string EmployeeCode { get; set; }
            public string EmployeeName { get; set; }

            public int? IDCompany { get; set; }
            public int? IDLocation { get; set; }
            public int? IDDivision { get; set; }
            public int? IDDepartment { get; set; }
            public string DepartmentName { get; set; }

            public int? IDEmployeeGroup { get; set; }
            public string EmployeeGroupName { get; set; }

            public decimal? WorkingDays { get; set; }
            public decimal? PresentDays { get; set; }
            public decimal? ExtraWorkingDays { get; set; }
            public decimal? AbsentDays { get; set; }

            public int? TotalWorkingHour { get; set; }
            public int? TotalWorkingMinute { get; set; }

            public int? LateHour { get; set; }
            public int? LateMinute { get; set; }

            public int? OTHour { get; set; }
            public int? OTMinute { get; set; }
        }

        public class SalaryEmployeeDailyAttendance
        {
            public int? IDAttendenceDailySummary { get; set; }

            public int? IDEmployee { get; set; }
            public string EmployeeCode { get; set; }
            public string EmployeeName { get; set; }

            public int? IDCompany { get; set; }
            public int? IDLocation { get; set; }
            public int? IDDivision { get; set; }
            public int? IDDepartment { get; set; }
            public string DepartmentName { get; set; }

            public int? IDEmployeeGroup { get; set; }
            public string EmployeeGroupName { get; set; }

            public DateTime? AttendenceDate { get; set; }
            public DateTime? InTime { get; set; }
            public DateTime? OutTime { get; set; }

            public int? TotalWorkingHour { get; set; }
            public int? TotalWorkingMinute { get; set; }

            public int? LateHour { get; set; }
            public int? LateMinute { get; set; }

            public int? OTHour { get; set; }
            public int? OTMinute { get; set; }

            public string AttendenceStatus { get; set; }
            public string InDevice { get; set; }
            public string OutDevice { get; set; }

            public bool? IsManualEntry { get; set; }
            public string ManualEntryType { get; set; }
            public string ManualReason { get; set; }
            public string ApprovedBy { get; set; }
            public string ApprovalReference { get; set; }
        }

        public class ManualAttendanceSaveRequest
        {
            public int IDEmployee { get; set; }
            public string EmployeeCode { get; set; }
            public DateTime AttendenceDate { get; set; }

            public string AttendenceStatus { get; set; }

            public DateTime? InTime { get; set; }
            public DateTime? OutTime { get; set; }

            public int? TotalWorkingHour { get; set; }
            public int? TotalWorkingMinute { get; set; }

            public int? LateHour { get; set; }
            public int? LateMinute { get; set; }

            public int? OTHour { get; set; }
            public int? OTMinute { get; set; }

            public string ManualEntryType { get; set; }
            public string ManualReason { get; set; }
            public string ApprovedBy { get; set; }
            public string ApprovalReference { get; set; }
        } 
    
}
