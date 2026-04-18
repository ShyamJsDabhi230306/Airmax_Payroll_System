using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction;

namespace Airmax_Payroll_System.Models.AllDTOS
{
  
        public class TransactionEmployeeKharchiSaveDto: AuditFields
    {
            public int IDEmployeeKharchi { get; set; }
            public string? KharchiNo { get; set; }

            public DateTime? KharchiDate { get; set; } // Month selection

            public DateTime? Date { get; set; } // Entry date

            public int IDDepartment { get; set; }
            public int IDDivision { get; set; }
            public List<TransactionEmployeeKharchiDetailDto>? Details { get; set; }
        }
    
}
