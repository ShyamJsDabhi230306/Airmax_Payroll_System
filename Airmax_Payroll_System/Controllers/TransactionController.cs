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

        // This action will be used to serve the professional Print page


        [HttpGet]
        public async Task<IActionResult> KharchiPrintReport(int id)
        {
            if (id <= 0) return Content("Invalid Voucher ID");
            // Fetch grouped data for the report
            var data = await _kharchiService.GetPrintDataAsync(id);

            if (data == null) return Content("Record not found or has been deleted.");
            // Return the specialized print view we created
            return View(data);
        }
    }
}
