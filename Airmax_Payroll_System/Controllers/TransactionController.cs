using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers
{
    public class TransactionController : Controller
    {
        [Route("transaction/employee-kharchi")]
        public IActionResult TransactionEmployeeKharchi()
        {
            return View();
        }

        [Route("transaction/employee-loan")]
        public IActionResult TransactionEmployeeLoan()
        {
            return View();
        }
    }
}
