using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Transaction
{
    public class Transaction_EmployeeLoan : AuditFields
    {
        public int IDEmployeeLoan { get; set; }
        public string? LoanNo { get; set; }
        public DateTime? Date { get; set; }
        public int? IDEmployee { get; set; }
        public int? IDDepartment { get; set; }
        public decimal? LoanAmount { get; set; }
        public int? TotalInstallments { get; set; }
        public decimal? InstallmentAmount { get; set; }
        public DateTime? InstallmentStartingDate { get; set; }

        // Closing properties
        public bool? IsClose { get; set; }
        public string? CloseType { get; set; }
        public string? CloseRemarks { get; set; }
        public string? CloseBy { get; set; }
        public DateTime? CloseDate { get; set; }
        // Extra UI properties (for displaying names)
        public string? EmployeeName { get; set; }
        public string? EmployeeCode { get; set; }
        public string? DepartmentName { get; set; }
        // List of installments to be sent to/from the API
        public List<Transaction_EmployeeLoanDetails>? Details { get; set; }
    }
}
