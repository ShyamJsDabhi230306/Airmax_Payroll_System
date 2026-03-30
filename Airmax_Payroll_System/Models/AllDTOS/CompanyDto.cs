namespace Airmax_Payroll_System.Models.AllDTOS
{
    public class CompanyDto
    {
        public int IDCompany { get; set; }
        public string CompanyName { get; set; }

        public IFormFile LogoFile { get; set; }
        public IFormFile SignFile { get; set; }
    }
}
