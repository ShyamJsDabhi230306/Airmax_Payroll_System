using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterDepartment: AuditFields
    {
        public int IDDepartment { get; set; }

        public int IDLocation { get; set; }

        public string DepartmentName { get; set; }

        public string? LocationName { get; set; }


    }
}
