namespace Airmax_Payroll_System.Models.AllDTOS
{
    public class KharchiPrintReportDto
    {

        public string CompanyName { get; set; }
        public string LocationName { get; set; }
        public string KharchiNo { get; set; }
        public DateTime KharchiDate { get; set; }
        public string DivisionName { get; set; }
        public string DepartmentName { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeCode { get; set; }
        public decimal Amount { get; set; }
        public int IDDivision { get; set; }
        public int IDDepartment { get; set; }
        public int DeptEmployeeCount { get; set; }
    }
}
