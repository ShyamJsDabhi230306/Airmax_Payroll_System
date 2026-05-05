namespace Airmax_Payroll_System.Models.Master.Payroll
{
    public class MasterPayrollConfigurationSlab
    {
        public int IDPayrollConfigurationSlab { get; set; }
        public int IDPayrollConfiguration { get; set; }
        public string? SlabType { get; set; }
        public TimeSpan? FromTime { get; set; }
        public TimeSpan? ToTime { get; set; }
        public string? DeductionType { get; set; }
        public decimal? DeductionValue { get; set; }
        public decimal? OTHours { get; set; }
        public decimal? RateMultiplier { get; set; }
    }
}
