using Airmax_Payroll_System.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace Airmax_Payroll_System.Models.Master
{
    public class Master_Configuration : AuditFields
    {
        
        public int IDConfiguration { get; set; }
        
        public int IDCompany { get; set; }
       
        public decimal LoanLimit { get; set; }
        // Extra property for Grid Display
        public string? CompanyName { get; set; }
    }
}
