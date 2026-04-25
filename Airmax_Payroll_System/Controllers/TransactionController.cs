using Airmax_Payroll_System.Services;
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

        private readonly TransactionEmployeeKharchiService _kharchiService;
        public TransactionController(TransactionEmployeeKharchiService kharchiService)
        {
            _kharchiService = kharchiService;
        }
        public IActionResult EmployeeKharchiList()
        {
            return View();
        }
        // ?? 2. THE ENTRY ROOM
        public IActionResult EmployeeKharchiEntry()
        {
            return View();
        }

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

        public IActionResult EmployeeLoanDashboard()
        {
            // This tells MVC to look for a file named "EmployeeLoanDashboard.cshtml"
            return View();
        }

        // Path: Controllers/TransactionController.cs

        public IActionResult EmployeeLoanSchedule()
        {
            // This looks for Views/Transaction/EmployeeLoanSchedule.cshtml
            return View();
        }


    }
}
