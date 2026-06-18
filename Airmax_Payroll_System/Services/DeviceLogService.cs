using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.DeviceLog;
using Dapper;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Airmax_Payroll_System.Services
{
    public class DeviceLogService
    {
        private readonly IConfiguration _configuration;
        private readonly IDapperHelper _dapper;
        private readonly AttendanceCalculationService _attendanceCalculationService;
        // Inject IDapperHelper directly into the Service
        public DeviceLogService(IConfiguration configuration, IDapperHelper dapper, AttendanceCalculationService attendanceCalculationService)
        {
            _configuration = configuration;
            _dapper = dapper;
            _attendanceCalculationService = attendanceCalculationService;

        }

        // ─── 1. FETCH LOGS FROM EXTERNAL API ─────────────────────────────────────
        public async Task<List<DeviceLog>> GetDeviceLogs(string fromDate, string toDate)
        {
            var apiUrl = _configuration["DeviceApi:Url"];
            var apiKey = _configuration["DeviceApi:ApiKey"];

            var finalUrl = $"{apiUrl}?APIKey={apiKey}&FromDate={fromDate}&ToDate={toDate}";

            using var client = new HttpClient();
            var response = await client.GetAsync(finalUrl);

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var logs = JsonSerializer.Deserialize<List<DeviceLog>>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return logs ?? new List<DeviceLog>();
            }

            return new List<DeviceLog>();
        }

        // ─── 2. SAVE FETCHED LOGS TO DATABASE (VIA STORED PROCEDURE) ─────────────
        public async Task<bool> SaveDeviceLogsAsync(List<DeviceLog> logs, string username)
        {
            try
            {
                foreach (var log in logs)
                {
                    var param = new DynamicParameters();
                    param.Add("@EmployeeCode", log.EmployeeCode);
                    param.Add("@LogDate", Convert.ToDateTime(log.LogDate));
                    param.Add("@SerialNumber", log.SerialNumber);
                    param.Add("@PunchDirection", log.PunchDirection);
                    param.Add("@Temperature", log.Temperature);
                    param.Add("@TemperatureState", log.TemperatureState);
                    param.Add("@Username", username);

                    await _dapper.ExecuteAsync("usp_Transaction_DeviceLog_Save", param);
                }

                var employeeNameLookup = await GetEmployeeNameLookupAsync();

                var dailySummary = _attendanceCalculationService.CalculateDailySummary(
                    logs,
                    employeeNameLookup
                );

                foreach (var summary in dailySummary)
                {
                    var summaryParam = new DynamicParameters();

                    summaryParam.Add("@EmployeeCode", summary.EmployeeCode);
                    summaryParam.Add("@EmployeeName", summary.EmployeeName);
                    summaryParam.Add("@AttendenceDate", summary.AttendenceDate);
                    summaryParam.Add("@InTime", summary.InTime);
                    summaryParam.Add("@OutTime", summary.OutTime);
                    summaryParam.Add("@TotalWorkingHour", summary.TotalWorkingHour);
                    summaryParam.Add("@TotalWorkingMinute", summary.TotalWorkingMinute);
                    summaryParam.Add("@LateHour", summary.LateHour);
                    summaryParam.Add("@LateMinute", summary.LateMinute);
                    summaryParam.Add("@OTHour", summary.OTHour);
                    summaryParam.Add("@OTMinute", summary.OTMinute);
                    summaryParam.Add("@AttendenceStatus", summary.AttendenceStatus);
                    summaryParam.Add("@InDevice", summary.InDevice);
                    summaryParam.Add("@OutDevice", summary.OutDevice);
                    summaryParam.Add("@Username", username);

                    await _dapper.ExecuteAsync("usp_Transaction_Attendence_Daily_Summary_Save", summaryParam);
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error saving device logs: " + ex.Message);
                return false;
            }
        }
        // put it here, after SaveDeviceLogsAsync ends
        public async Task<Dictionary<string, string>> GetEmployeeNameLookupAsync()
        {
            var sql = @"
        SELECT 
            EmployeeCode,
            EmployeeName
        FROM Master_Employee
        WHERE ISNULL(IsDelete, 0) = 0
    ";

            var employees = await _dapper.QueryAsync<EmployeeNameDto>(
     sql,
     commandType: CommandType.Text
 );
            return employees
                .Where(x => !string.IsNullOrWhiteSpace(x.EmployeeCode))
                .GroupBy(x => x.EmployeeCode)
                .ToDictionary(
                    x => x.Key,
                    x => x.First().EmployeeName ?? ""
                );
        }

    }
}
