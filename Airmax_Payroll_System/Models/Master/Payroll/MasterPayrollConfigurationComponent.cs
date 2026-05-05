namespace Airmax_Payroll_System.Models.Master.Payroll
{
    public class MasterPayrollConfigurationComponent
    {
        public int IDPayrollConfigurationComponent { get; set; }
        public int IDPayrollConfiguration { get; set; }
        public string? ComponentName { get; set; }
        public string? Formula { get; set; }
        public bool? IsTaxable { get; set; }
        public bool? ShowOnPayslip { get; set; }
        public int? SortOrder { get; set; }
    }
}
