namespace Airmax_Payroll_System.Models.AllDTOS
{
    public class TransactionEmployeeLoanDetailDto
    {
        public DateTime? Date { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public decimal? InstallmentAmount { get; set; }
        public string? Status { get; set; }
    }
}
