namespace Airmax_Payroll_System.Models.Transaction.Salary
{
 
        public class SalaryDeductionMonthly
        {
            public int? IDEmployee { get; set; }
            public string EmployeeCode { get; set; }
            public string EmployeeName { get; set; }

            public int? IDCompany { get; set; }
            public int? IDLocation { get; set; }
            public int? IDDivision { get; set; }
            public int? IDDepartment { get; set; }
            public int? IDEmployeeGroup { get; set; }

            public decimal? LoanAmount { get; set; }
            public decimal? KharchiAmount { get; set; }
            public decimal? TotalOtherDeduction { get; set; }
        }

    public class SalaryPreviewRow
    {
        public DateTime? SalaryMonth { get; set; }

        public int? IDCompany { get; set; }
        public int? IDLocation { get; set; }
        public int? IDDivision { get; set; }
        public int? IDDepartment { get; set; }
        public int? IDDesignation { get; set; }
        public int? IDEmployeeGroup { get; set; }
        public string? EmployeeGroupName { get; set; }

        public int? IDEmployee { get; set; }
        public string? EmployeeCode { get; set; }
        public string? EmployeeName { get; set; }
        public DateTime? JoiningDate { get; set; }

        public decimal? WorkingDays { get; set; }
        public decimal? PresentDays { get; set; }
        public decimal? ExtraWorkingDays { get; set; }
        public decimal? UnpaidHolidayDays { get; set; }
        public decimal? PaidHolidayDays { get; set; }
        public decimal? TRDays { get; set; }
        public decimal? OTDays { get; set; }
        public decimal? LateDays { get; set; }
        public decimal? TotalAttendance { get; set; }

        public decimal? TotalDays { get; set; }
        public decimal? AttendancePercentage { get; set; }
        public decimal? AbsentDays { get; set; }

        public int? TotalWorkingHour { get; set; }
        public int? TotalWorkingMinute { get; set; }

        public int? LateHour { get; set; }
        public int? LateMinute { get; set; }

        public int? EarlyHour { get; set; }
        public int? EarlyMinute { get; set; }

        public int? OTHour { get; set; }
        public int? OTMinute { get; set; }

        public decimal? SalaryRate { get; set; }
        public decimal? MonthlySalary { get; set; }
        public decimal? PerDaySalary { get; set; }
        public decimal? PerHourSalary { get; set; }
        public decimal? SecondSalary { get; set; }

        public decimal? SalaryAmount { get; set; }
        public decimal? LeaveAmount { get; set; }
        public decimal? BonusAmount { get; set; }
        public decimal? BonusPercentage { get; set; }
        public decimal? OTAmount { get; set; }
        public decimal? TeaAmount { get; set; }
        public decimal? ExtraEarnAmount { get; set; }

        public decimal? GrossSalary { get; set; }

        public decimal? PFSalary { get; set; }
        public decimal? PFAmount { get; set; }
        public decimal? ESICAmount { get; set; }
        public decimal? PTAmount { get; set; }
        public decimal? ChqAmount { get; set; }

        public decimal? LateDeductionAmount { get; set; }
        public decimal? LoanAmount { get; set; }
        public decimal? KharchiAmount { get; set; }
        public decimal? AdvanceAmount { get; set; }
        public decimal? ExtraDeductionAmount { get; set; }

        public decimal? TotalDeduction { get; set; }
        public decimal? ActualNetSalary { get; set; }
        public decimal? NetSalary { get; set; }
        public decimal? RoundOffAmount { get; set; }

        public string? SalaryStatus { get; set; }
    }

    public class SalaryBreakdownHeader
        {
            public int? IDEmployee { get; set; }
            public string EmployeeCode { get; set; }
            public string EmployeeName { get; set; }
            public string EmployeeGroupName { get; set; }

            public DateTime? SalaryMonth { get; set; }

            public decimal? WorkingDays { get; set; }
            public decimal? PresentDays { get; set; }
            public decimal? ExtraWorkingDays { get; set; }
            public decimal? AbsentDays { get; set; }

            public int? LateHour { get; set; }
            public int? LateMinute { get; set; }

            public int? OTHour { get; set; }
            public int? OTMinute { get; set; }

            public decimal? MonthlySalary { get; set; }
            public decimal? PerDaySalary { get; set; }
            public decimal? NetSalary { get; set; }
        }

        public class SalaryBreakdownLine
        {
            public int? SortOrder { get; set; }
            public string LineItem { get; set; }
            public string FormulaText { get; set; }
            public string SourceType { get; set; }

            public decimal? Amount { get; set; }

            public bool? IsEarning { get; set; }
            public bool? IsDeduction { get; set; }
        }

        public class SalaryBreakdownResponse
        {
            public SalaryBreakdownHeader Header { get; set; }
            public List<SalaryBreakdownLine> Lines { get; set; } = new List<SalaryBreakdownLine>();
        }

        public class SalaryProcessRow : SalaryPreviewRow
        {
            public int? IDSalaryProcess { get; set; }

            public string DepartmentName { get; set; }

            public bool? IsFinalized { get; set; }
            public bool? IsPaid { get; set; }

            public string E_By { get; set; }
            public DateTime? E_Date { get; set; }

            public string U_By { get; set; }
            public DateTime? U_Date { get; set; }
        }

        public class SalaryProcessComponent
        {
            public int? IDSalaryProcessComponent { get; set; }
            public int? IDSalaryProcess { get; set; }

            public string ComponentName { get; set; }
            public string ComponentType { get; set; }
            public string Formula { get; set; }
            public string SourceType { get; set; }

            public decimal? Amount { get; set; }

            public bool? IsEarning { get; set; }
            public bool? IsDeduction { get; set; }
            public bool? IsTaxable { get; set; }
            public bool? ShowOnPayslip { get; set; }

            public int? SortOrder { get; set; }
        }

        public class SalaryFilterRequest
        {
            public DateTime SalaryMonth { get; set; }

            public int IDCompany { get; set; }
            public int? IDLocation { get; set; }
            public int? IDDivision { get; set; }
            public int? IDDepartment { get; set; }
            public int? IDEmployeeGroup { get; set; }
            public int? IDEmployee { get; set; }

            public string? Search { get; set; }
        }
    
}
