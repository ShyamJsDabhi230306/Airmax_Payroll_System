namespace Airmax_Payroll_System.Models.AllDTOS
{
    // Path: Models/AllDTOS/LoanDashboardDto.cs
    public class LoanDashboardDto
    {
        public int IDEmployeeLoan { get; set; }
        public string? LoanNo { get; set; }
        public string? EmployeeName { get; set; }
        public string? EmployeeCode { get; set; }
        public string? DepartmentName { get; set; }
        public decimal? LoanAmount { get; set; }
        public decimal? InstallmentAmount { get; set; }
        public int? TotalInstallments { get; set; }
        public int? EmisPaid { get; set; }
        public decimal? RecoveredAmount { get; set; }
        public decimal? OutstandingAmount { get; set; }
        public int? Progress { get; set; }
    }
    public class LoanSummaryStats
    {
        public int ActiveLoans { get; set; }
        public decimal TotalDisbursed { get; set; }
        public decimal TotalOutstanding { get; set; }
        public decimal TotalRecovered { get; set; }
    }
}
