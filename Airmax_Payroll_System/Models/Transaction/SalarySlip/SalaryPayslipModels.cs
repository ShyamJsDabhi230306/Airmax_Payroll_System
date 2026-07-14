namespace Airmax_Payroll_System.Models.Transaction.SalarySlip
{
    public class SalaryPayslipResponse
    {
        public SalaryPayslipHeader? Header { get; set; }
        public List<SalaryPayslipComponent> Earnings { get; set; } = new();
        public List<SalaryPayslipComponent> Deductions { get; set; } = new();
        public SalaryPayslipTotal? Totals { get; set; }
    }

    public class SalaryPayslipHeader
    {
        public int Result { get; set; }
        public string? Message { get; set; }

        public int IDSalaryProcess { get; set; }
        public DateTime SalaryMonth { get; set; }

        public int IDCompany { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyAddress { get; set; }
        public string? CityName { get; set; }
        public string? StateCode { get; set; }
        public string? Pincode { get; set; }
        public string? ContactNo { get; set; }
        public string? Comp_EmailID { get; set; }

        public int IDEmployee { get; set; }
        public string? EmployeeCode { get; set; }
        public string? EmployeeName { get; set; }

        public string? DepartmentName { get; set; }
        public string? DivisionName { get; set; }
        public string? LocationName { get; set; }
        public string? EmployeeGroupName { get; set; }

        public decimal WorkingDays { get; set; }
        public decimal PresentDays { get; set; }
        public decimal PaidLeaveDays { get; set; }
        public decimal AbsentDays { get; set; }

        public decimal MonthlySalary { get; set; }
        public decimal GrossSalary { get; set; }
        public decimal TotalDeduction { get; set; }
        public decimal RoundOffAmount { get; set; }
        public decimal NetSalary { get; set; }

        public string? SalaryStatus { get; set; }
        public bool IsFinalized { get; set; }
        public bool IsPaid { get; set; }
    }

    public class SalaryPayslipComponent
    {
        public int IDSalaryProcessComponent { get; set; }
        public string? ComponentName { get; set; }
        public string? ComponentType { get; set; }
        public string? Formula { get; set; }
        public string? SourceType { get; set; }
        public decimal Amount { get; set; }
        public int SortOrder { get; set; }
    }

    public class SalaryPayslipTotal
    {
        public decimal GrossSalary { get; set; }
        public decimal TotalDeduction { get; set; }
        public decimal RoundOffAmount { get; set; }
        public decimal NetSalary { get; set; }
    }
}
