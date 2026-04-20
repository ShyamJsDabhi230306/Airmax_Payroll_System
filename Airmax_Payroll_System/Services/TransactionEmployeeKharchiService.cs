using Airmax_Payroll_System.Models.AllDTOS;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class TransactionEmployeeKharchiService
    {
        private readonly TransactionEmployeeKharchiRepo _repo;

        public TransactionEmployeeKharchiService(TransactionEmployeeKharchiRepo repo)
        {
            _repo = repo;
        }


        // Updated to support Division, Month, and Year filtering
        public async Task<IEnumerable<dynamic>> GetAllAsync(int idDivision, int month = 0, int year = 0)
        {
            // Simply passes the parameters to the specialized repository method
            return await _repo.GetAllAsync(idDivision, month, year);
        }

        //public async Task<IEnumerable<TransactionEmployeeKharchi>> GetAllAsync()
        //    => await _repo.GetAllAsync();

        //public async Task<TransactionEmployeeKharchi?> GetByIdAsync(int id)
        //    => await _repo.GetByIdAsync(id);

        // 🔥 UPDATED: Now returns the DTO with the details list
        public async Task<TransactionEmployeeKharchiSaveDto?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);
        public async Task<SaveResult> SaveAsync(TransactionEmployeeKharchiSaveDto model)
            => await _repo.SaveAsync(model);

        public async Task<SaveResult> DeleteAsync(int id,string deleteBy)
            => await _repo.DeleteAsync(id, deleteBy);

        public async Task<string> GenerateKharchiNoAsync()
            => await _repo.GenerateKharchiNoAsync();


        // Add these methods to your Service class
        public async Task<IEnumerable<dynamic>> GetDivisionsWithCountAsync(int idDivision)
        {
            return await _repo.GetDivisionsWithCountAsync(idDivision);
        }

        public async Task<IEnumerable<dynamic>> LoadEmployeesForKharchiAsync(int idDivision)
        {
            return await _repo.LoadEmployeesForKharchiAsync(idDivision);
        }



        // 2. NEW: Method to get departments for the expandable list
        public async Task<IEnumerable<dynamic>> GetDepartmentsWithCountAsync(int idDivision, int month, int year)
        {
            return await _repo.GetDepartmentsWithCountAsync(idDivision, month, year);
        }

        public async Task<IEnumerable<KharchiPrintReportDto>> GetPrintReportAsync(int month, int year, string divIdList)
        {
            // 🔥 Change the parameter from 'int' to 'string' here
            return await _repo.GetPrintReportAsync(month, year, divIdList);
        }

    }
}
