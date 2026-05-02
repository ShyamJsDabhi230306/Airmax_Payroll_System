using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers.API
{
    public class ConfigController : Controller
    {
        public IActionResult AttendanceConfig()
        {
            return View();
        }
    }
}
