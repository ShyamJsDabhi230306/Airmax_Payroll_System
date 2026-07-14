using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Transaction.Salary;
using Airmax_Payroll_System.Models.Transaction.SalarySlip;
using Dapper;
using System.Data;

namespace Airmax_Payroll_System.Repositories
{
    public class TransactionSalaryRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<TransactionSalaryRepo>? _logger;

        public TransactionSalaryRepo(
            IDapperHelper dapperHelper,
            ILogger<TransactionSalaryRepo>? logger = null)
        {
            _dapper = dapperHelper;
            _logger = logger;
        }

        public async Task<SalaryConfigurationResponse> GetConfigurationAsync(int idCompany, int? idEmployeeGroup)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDCompany", idCompany);
                param.Add("@IDEmployeeGroup", idEmployeeGroup);

                var multi = await _dapper.QueryMultipleAsync(
                    "usp_Transaction_Salary_Configuration_Get",
                    param
                );

                using var reader = multi.Reader;
                using var conn = multi.Conn;

                var response = new SalaryConfigurationResponse
                {
                    Configurations = (await reader.ReadAsync<SalaryConfiguration>()).ToList(),
                    Components = (await reader.ReadAsync<SalaryConfigurationComponent>()).ToList(),
                    Slabs = (await reader.ReadAsync<SalaryConfigurationSlab>()).ToList()
                };

                return response;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.GetConfigurationAsync");
                return new SalaryConfigurationResponse();
            }
        }

        public async Task<IEnumerable<SalaryAttendanceMonthlyMetric>> GetAttendanceMonthlyMetricsAsync(SalaryFilterRequest request)
        {
            try
            {
                var param = BuildFilterParameters(request);

                return await _dapper.QueryAsync<SalaryAttendanceMonthlyMetric>(
                    "usp_Transaction_Salary_AttendanceMonthlyMetrics_Get",
                    param
                );
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.GetAttendanceMonthlyMetricsAsync");
                return Enumerable.Empty<SalaryAttendanceMonthlyMetric>();
            }
        }

        public async Task<IEnumerable<SalaryEmployeeDailyAttendance>> GetEmployeeDailyAttendanceAsync(
            DateTime salaryMonth,
            int idCompany,
            int? idEmployee,
            string employeeCode)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@SalaryMonth", salaryMonth);
                param.Add("@IDCompany", idCompany);
                param.Add("@IDEmployee", idEmployee);
                param.Add("@EmployeeCode", employeeCode);

                return await _dapper.QueryAsync<SalaryEmployeeDailyAttendance>(
                    "usp_Transaction_Salary_EmployeeDailyAttendance_Get",
                    param
                );
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.GetEmployeeDailyAttendanceAsync");
                return Enumerable.Empty<SalaryEmployeeDailyAttendance>();
            }
        }

        public async Task<SalaryEmployeeDailyAttendance?> SaveManualAttendanceAsync(
            ManualAttendanceSaveRequest request,
            string username)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@IDEmployee", request.IDEmployee);
                param.Add("@EmployeeCode", request.EmployeeCode);
                param.Add("@AttendenceDate", request.AttendenceDate);

                param.Add("@AttendenceStatus", request.AttendenceStatus);

                param.Add("@InTime", request.InTime);
                param.Add("@OutTime", request.OutTime);

                param.Add("@TotalWorkingHour", request.TotalWorkingHour ?? 0);
                param.Add("@TotalWorkingMinute", request.TotalWorkingMinute ?? 0);

                param.Add("@LateHour", request.LateHour ?? 0);
                param.Add("@LateMinute", request.LateMinute ?? 0);

                param.Add("@OTHour", request.OTHour ?? 0);
                param.Add("@OTMinute", request.OTMinute ?? 0);

                param.Add("@ManualEntryType", request.ManualEntryType);
                param.Add("@ManualReason", request.ManualReason);
                param.Add("@ApprovedBy", request.ApprovedBy);
                param.Add("@ApprovalReference", request.ApprovalReference);

                param.Add("@Username", username);

                return await _dapper.QueryFirstOrDefaultAsync<SalaryEmployeeDailyAttendance>(
                    "usp_Transaction_Salary_EmployeeDailyAttendance_Manual_Save",
                    param
                );
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.SaveManualAttendanceAsync");
                return null;
            }
        }

        public async Task<IEnumerable<SalaryDeductionMonthly>> GetDeductionMonthlyAsync(SalaryFilterRequest request)
        {
            try
            {
                var param = BuildFilterParameters(request);

                return await _dapper.QueryAsync<SalaryDeductionMonthly>(
                    "usp_Transaction_Salary_DeductionMonthly_Get",
                    param
                );
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.GetDeductionMonthlyAsync");
                return Enumerable.Empty<SalaryDeductionMonthly>();
            }
        }

        public async Task<IEnumerable<SalaryPreviewRow>> GetSalaryPreviewAsync(SalaryFilterRequest request)
        {
            try
            {
                var param = BuildFilterParameters(request);

                return await _dapper.QueryAsync<SalaryPreviewRow>(
                    "usp_Transaction_Salary_Preview_Get",
                    param
                );
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.GetSalaryPreviewAsync");
                return Enumerable.Empty<SalaryPreviewRow>();
            }
        }

        public async Task<SalaryBreakdownResponse> GetLiveBreakdownAsync(
      DateTime salaryMonth,
      int idCompany,
      int idEmployee)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@SalaryMonth", salaryMonth);
                param.Add("@IDCompany", idCompany);
                param.Add("@IDEmployee", idEmployee);

                var multi = await _dapper.QueryMultipleAsync(
                    "usp_Transaction_Salary_LiveBreakdown_Get",
                    param
                );

                using var reader = multi.Reader;
                using var conn = multi.Conn;

                var header = await reader.ReadFirstOrDefaultAsync<SalaryBreakdownHeader>();
                var lines = (await reader.ReadAsync<SalaryBreakdownLine>()).ToList();

                return new SalaryBreakdownResponse
                {
                    Header = header,
                    Lines = lines
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.GetLiveBreakdownAsync");
                return new SalaryBreakdownResponse();
            }
        }
        public async Task<SaveResult> SaveSalaryProcessAsync(SalaryFilterRequest request, string username)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@SalaryMonth", request.SalaryMonth);
                param.Add("@IDCompany", request.IDCompany);
                param.Add("@IDLocation", request.IDLocation);
                param.Add("@IDDivision", request.IDDivision);
                param.Add("@IDEmployeeGroup", request.IDEmployeeGroup);
                param.Add("@IDEmployee", request.IDEmployee);
                param.Add("@Username", username);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Transaction_Salary_Process_Save",
                    param,
                    commandType: CommandType.StoredProcedure
                );

                return result ?? SaveResult.Success("Salary saved successfully.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.SaveSalaryProcessAsync");
                return SaveResult.Fail("Failed to save salary. " + ex.Message);
            }
        }

        public async Task<IEnumerable<SalaryProcessRow>> GetSavedSalaryAsync(SalaryFilterRequest request)
        {
            try
            {
                var param = BuildFilterParameters(request);

                return await _dapper.QueryAsync<SalaryProcessRow>(
                    "usp_Transaction_Salary_Process_Get",
                    param
                );
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.GetSavedSalaryAsync");
                return Enumerable.Empty<SalaryProcessRow>();
            }
        }

        public async Task<IEnumerable<SalaryProcessComponent>> GetSavedSalaryComponentsAsync(int idSalaryProcess)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDSalaryProcess", idSalaryProcess);

                return await _dapper.QueryAsync<SalaryProcessComponent>(
                    "usp_Transaction_Salary_Process_Component_Get",
                    param
                );
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.GetSavedSalaryComponentsAsync");
                return Enumerable.Empty<SalaryProcessComponent>();
            }
        }

        private DynamicParameters BuildFilterParameters(SalaryFilterRequest request)
        {
            var param = new DynamicParameters();

            param.Add("@SalaryMonth", request.SalaryMonth);
            param.Add("@IDCompany", request.IDCompany);
            param.Add("@IDLocation", request.IDLocation);
            param.Add("@IDDivision", request.IDDivision);
            param.Add("@IDDepartment", request.IDDepartment);
            param.Add("@IDEmployeeGroup", request.IDEmployeeGroup);
            param.Add("@IDEmployee", request.IDEmployee);
            param.Add("@Search", request.Search);

            return param;
        }


        public async Task<SalaryPayslipResponse?> GetSalaryPayslipAsync(DateTime salaryMonth, int idCompany, int idEmployee)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@SalaryMonth", salaryMonth);
                param.Add("@IDCompany", idCompany);
                param.Add("@IDEmployee", idEmployee);

                var resultSet = await _dapper.QueryMultipleAsync(
                    "usp_Transaction_Salary_Payslip_Get",
                    param,
                    commandType: CommandType.StoredProcedure
                );

                using var multi = resultSet.Reader;
                using var conn = resultSet.Conn;

                var header = await multi.ReadFirstOrDefaultAsync<SalaryPayslipHeader>();

                if (header == null || header.Result != 1)
                {
                    return new SalaryPayslipResponse
                    {
                        Header = header
                    };
                }

                var earnings = (await multi.ReadAsync<SalaryPayslipComponent>()).ToList();
                var deductions = (await multi.ReadAsync<SalaryPayslipComponent>()).ToList();
                var totals = await multi.ReadFirstOrDefaultAsync<SalaryPayslipTotal>();

                return new SalaryPayslipResponse
                {
                    Header = header,
                    Earnings = earnings,
                    Deductions = deductions,
                    Totals = totals
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in TransactionSalaryRepo.GetSalaryPayslipAsync");

                return new SalaryPayslipResponse
                {
                    Header = new SalaryPayslipHeader
                    {
                        Result = 0,
                        Message = "Failed to load payslip. " + ex.Message
                    }
                };
            }
        }

    }
}