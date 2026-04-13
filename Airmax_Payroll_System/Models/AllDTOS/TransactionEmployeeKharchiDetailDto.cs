namespace Airmax_Payroll_System.Models.AllDTOS
{
    public class TransactionEmployeeKharchiDetailDto
    {
        

        public string? EmployeeName { get; set; }

        public int IDEmployee { get; set; }

        public decimal? Amount { get; set; }
        public string? EmployeeCode { get; set; }
        public string? Remarks { get; set; }
        public bool? AllowForCalculate { get; set; }
    }
}
