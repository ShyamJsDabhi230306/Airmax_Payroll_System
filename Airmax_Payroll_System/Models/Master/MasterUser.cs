using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterUser: AuditFields
    {
        public int IDUser { get; set; }

        public int? IDCompany { get; set; }
        public string? CompanyName { get; set; }

        public int? IDLocation { get; set; }
        public string? LocationName { get; set; }
        public int? IDDepartment { get; set; }
        public string? DepartmentName { get; set; }
        public string UserName { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string? Email { get; set; }

        public string? Mobile { get; set; }

        public string RoleName { get; set; } = string.Empty;
    }
}
