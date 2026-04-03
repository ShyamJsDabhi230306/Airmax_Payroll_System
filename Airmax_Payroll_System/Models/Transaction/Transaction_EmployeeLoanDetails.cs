namespace Airmax_Payroll_System.Models.Transaction
{
    public class Transaction_EmployeeLoanDetails
    {
        public int IDEmployeeLoanDetails { get; set; }
        public int? IDEmployeeLoan { get; set; }
        public DateTime? Date { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public decimal? InstallmentAmount { get; set; }
        public string? Status { get; set; }
    }
}
