using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterEmployee: AuditFields
    {
        public int IDEmployee { get; set; }
        public string? EmployeeCode { get; set; }
        public int? IDDesignation { get; set; }
        public string? DesignationName { get; set; }
        public int? IDDepartment { get; set; }
        public string? DepartmentName { get; set; }
        public int? IDEmployeeGroup { get; set; }
        public string? EmployeeGroupName { get; set; }
        public int? IDShift { get; set; }
        public string? ShiftName { get; set; }
        public string? EmployeeName { get; set; }
        public string? Emp_Address { get; set; }
        public string? Emp_ContactNo { get; set; }
        public string? EmailID { get; set; }
        public DateTime? JoiningDate { get; set; }
        public string? BloodGroup { get; set; }
        public DateTime? DOB { get; set; }

        public bool? IsLeave { get; set; }
        public DateTime? LeaveDate { get; set; }

        public decimal? Salary { get; set; }
        public string? SalaryType { get; set; }
        public decimal? PerDaySalary { get; set; }

        public decimal? BonusPercentage { get; set; }
        public decimal? LeavePercentage { get; set; }
        public decimal? TeaCoffeeAmt { get; set; }
        public decimal? SecondSalary { get; set; }

        public bool? CalculatePF { get; set; }
        public bool? CalculateDA { get; set; }
        public decimal? DAPercentage { get; set; }

        public string? AadharNo { get; set; }
        public string? BankACNo { get; set; }
        public string? BankName { get; set; }

        public string? UAN { get; set; }
        public bool? HasDifferentBankAC { get; set; }
        public string? PFNo { get; set; }
        public string? PanNo { get; set; }
        public bool? ApplyPFBonus { get; set; }

        public decimal? DefaultLateHrs { get; set; }

        public int? IDCompany { get; set; }
        public string? CompanyName { get; set; }
        public int? IDLocation { get; set; }
        public string? LocationName { get; set; }
        public int? IDDivision { get; set; }
        public string? DivisionName { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }

        public string? IFSCCode { get; set; }
    }
}
