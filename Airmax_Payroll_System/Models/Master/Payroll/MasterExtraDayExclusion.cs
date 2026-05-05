namespace Airmax_Payroll_System.Models.Master.Payroll
{
    public class MasterExtraDayExclusion
    {
        public int IDExtraDayExclusion { get; set; }
        public int IDPayrollConfiguration { get; set; }
        public string? ExclusionName { get; set; }
        public bool? IsExcluded { get; set; }
    }
}
