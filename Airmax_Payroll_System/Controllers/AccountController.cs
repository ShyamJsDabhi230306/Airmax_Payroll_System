using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers
{
    public class AccountController : Controller
    {
        public IActionResult Login()
        {
            return View();
        }

        public IActionResult AccessDenied()
        {
            return View();
        }
    }
}
