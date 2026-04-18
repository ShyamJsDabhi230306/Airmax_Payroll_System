namespace Airmax_Payroll_System.Models.AllDTOS
{
    public class EmployeeKharchiLoadDto
    {
        public int IDEmployee { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string DepartmentName { get; set; } // 🔥 Added for Grouping
        public string DesignationName { get; set; }
        public string ShiftName { get; set; }
        public decimal Amount { get; set; } = 0;
        public string Remarks { get; set; } = "";
    }
}
