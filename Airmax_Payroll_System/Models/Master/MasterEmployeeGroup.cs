using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterEmployeeGroup:AuditFields
    {
        public int IDEmployeeGroup { get; set; }
        public string? EmployeeGroupName { get; set; }
        public int? IDDepartment { get; set; }
        public string? DepartmentName { get; set; }
    }
}
