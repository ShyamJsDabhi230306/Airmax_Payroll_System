using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction;

namespace Airmax_Payroll_System.Models.AllDTOS
{
   public class TransactionEmployeeLoanSaveDto:AuditFields
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
        public List<Transaction_EmployeeLoanDetails>? Details { get; set; }
    }
}
