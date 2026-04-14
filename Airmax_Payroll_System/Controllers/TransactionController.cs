using Microsoft.AspNetCore.Mvc;

namespace Airmax_Payroll_System.Controllers
{
    public class TransactionController : Controller
    {
        //[Route("transaction/employee-kharchi")]
        //public IActionResult TransactionEmployeeKharchi()
        //{
        //    return View();
        //}

        // ?? 1. THE LIST ROOM (Accurate name!)
        public IActionResult EmployeeKharchiList()
        {
            return View();
        }
        // ?? 2. THE ENTRY ROOM
        public IActionResult EmployeeKharchiEntry()
        {
            return View();
        }

        //[Route("transaction/employee-loan")]
        //public IActionResult TransactionEmployeeLoan()
        //{
        //    return View();
        //}

        public IActionResult EmployeeLoanList()
        {
            // Standalone list page
            return View();
        }
        public IActionResult EmployeeLoanEntry()
        {
            // Full-page bulk entry form
            return View();
        }
    }
}
