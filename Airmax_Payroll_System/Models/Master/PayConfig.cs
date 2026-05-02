using System;

namespace Airmax_Payroll_System.Models.Master
{
    public class PayConfig
    {
        public int IDPayConfig { get; set; }
        public int IDCompany { get; set; }
        public string BaseUrl { get; set; }
        public string AccountName { get; set; }
        public string ApiKey { get; set; }
        public string PullEndpoint { get; set; }
        public int RequestTimeout { get; set; }
        public int RetryAttempts { get; set; }
        public int RetryBackoff { get; set; }
        public string E_By { get; set; }
        public DateTime? E_Date { get; set; }
        public string U_By { get; set; }
        public DateTime? U_Date { get; set; }
    }
}
