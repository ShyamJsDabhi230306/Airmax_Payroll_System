using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction.Salary;
using Airmax_Payroll_System.Models.Transaction.SalarySlip;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Services
{
    public class TransactionSalaryService
    {
        private readonly TransactionSalaryRepo _salaryRepo;

        public TransactionSalaryService(TransactionSalaryRepo salaryRepo)
        {
            _salaryRepo = salaryRepo;
        }

        public async Task<SalaryConfigurationResponse> GetConfigurationAsync(int idCompany, int? idEmployeeGroup)
        {
            return await _salaryRepo.GetConfigurationAsync(idCompany, idEmployeeGroup);
        }

        public async Task<IEnumerable<SalaryAttendanceMonthlyMetric>> GetAttendanceMonthlyMetricsAsync(SalaryFilterRequest request)
        {
            return await _salaryRepo.GetAttendanceMonthlyMetricsAsync(request);
        }

        public async Task<IEnumerable<SalaryEmployeeDailyAttendance>> GetEmployeeDailyAttendanceAsync(
            DateTime salaryMonth,
            int idCompany,
            int? idEmployee,
            string employeeCode)
        {
            return await _salaryRepo.GetEmployeeDailyAttendanceAsync(
                salaryMonth,
                idCompany,
                idEmployee,
                employeeCode
            );
        }

        public async Task<SalaryEmployeeDailyAttendance?> SaveManualAttendanceAsync(
            ManualAttendanceSaveRequest request,
            string username)
        {
            return await _salaryRepo.SaveManualAttendanceAsync(request, username);
        }

        public async Task<IEnumerable<SalaryDeductionMonthly>> GetDeductionMonthlyAsync(SalaryFilterRequest request)
        {
            return await _salaryRepo.GetDeductionMonthlyAsync(request);
        }

        public async Task<IEnumerable<SalaryPreviewRow>> GetSalaryPreviewAsync(SalaryFilterRequest request)
        {
            return await _salaryRepo.GetSalaryPreviewAsync(request);
        }

        public async Task<SalaryBreakdownResponse> GetLiveBreakdownAsync(
            DateTime salaryMonth,
            int idCompany,
            int idEmployee)
        {
            return await _salaryRepo.GetLiveBreakdownAsync(
                salaryMonth,
                idCompany,
                idEmployee
            );
        }

        public async Task<SaveResult> SaveSalaryProcessAsync(SalaryFilterRequest request, string username)
        {
            return await _salaryRepo.SaveSalaryProcessAsync(request, username);
        }

        public async Task<IEnumerable<SalaryProcessRow>> GetSavedSalaryAsync(SalaryFilterRequest request)
        {
            return await _salaryRepo.GetSavedSalaryAsync(request);
        }

        public async Task<IEnumerable<SalaryProcessComponent>> GetSavedSalaryComponentsAsync(int idSalaryProcess)
        {
            return await _salaryRepo.GetSavedSalaryComponentsAsync(idSalaryProcess);
        }

        public async Task<SalaryPayslipResponse?> GetSalaryPayslipAsync(DateTime salaryMonth, int idCompany, int idEmployee)
        {
            return await _salaryRepo.GetSalaryPayslipAsync(salaryMonth, idCompany, idEmployee);
        }
    }
}