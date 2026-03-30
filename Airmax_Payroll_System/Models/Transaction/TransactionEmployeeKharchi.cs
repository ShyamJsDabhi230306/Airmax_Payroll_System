using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Transaction
{
    public class TransactionEmployeeKharchi : AuditFields
    {
        public int IDEmployeeKharchi { get; set; }

        public string? KharchiNo { get; set; }

        public DateTime? KharchiDate { get; set; }

        public DateTime? Date { get; set; }

        public int? Month { get; set; }

        public int? Year { get; set; }

        public int? IDDepartment { get; set; }

        public string? DepartmentName { get; set; }
        public int? IDEmployee { get; set; }
        public string? EmployeeName { get; set; }

        public string? Amount { get; set; }


    }



    public class EmployeeModel
    {
        public int IDEmployee { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
    }



}
