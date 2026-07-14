using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
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
        private readonly AttendanceFetchCacheService _attendanceFetchCacheService;

        // Inject IDapperHelper directly into the Service
        public DeviceLogService(
                IConfiguration configuration,
                IDapperHelper dapper,
                AttendanceCalculationService attendanceCalculationService,
                 AttendanceFetchCacheService attendanceFetchCacheService)
        {
            _configuration = configuration;
            _dapper = dapper;
            _attendanceCalculationService = attendanceCalculationService;
            _attendanceFetchCacheService = attendanceFetchCacheService;
        }
       
        public async Task<List<DeviceLog>> GetDeviceLogs(string fromDate, string toDate)
        {
            var apiUrl = _configuration["DeviceApi:Url"];
            var apiKey = _configuration["DeviceApi:ApiKey"];

            var finalUrl = $"{apiUrl}?APIKey={apiKey}&FromDate={fromDate}&ToDate={toDate}";

            using var client = new HttpClient();
            client.Timeout = TimeSpan.FromMinutes(5);

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
        public string StartDeviceLogFetchBatch(string fromDate, string toDate, string username)
        {
            var batchKey = _attendanceFetchCacheService.CreateBatch(fromDate, toDate, username);

            _ = Task.Run(async () =>
            {
                await FetchDeviceLogsDayWiseAsync(batchKey, fromDate, toDate);
            });

            return batchKey;
        }
        private async Task FetchDeviceLogsDayWiseAsync(string batchKey, string fromDate, string toDate)
        {
            try
            {
                var startDate = Convert.ToDateTime(fromDate);
                var endDate = Convert.ToDateTime(toDate);

                for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
                {
                    var dayFrom = date.ToString("yyyy-MM-dd");
                    var dayTo = date.ToString("yyyy-MM-dd");

                    var logs = await GetDeviceLogs(dayFrom, dayTo);

                    _attendanceFetchCacheService.AddLogs(batchKey, logs);
                }

                _attendanceFetchCacheService.CompleteBatch(batchKey);
            }
            catch
            {
                _attendanceFetchCacheService.CompleteBatch(batchKey);
            }
        }
        public object GetFetchBatchPage(string batchKey, int page, int pageSize)
        {
            var batch = _attendanceFetchCacheService.GetBatch(batchKey);

            if (batch == null)
            {
                return new
                {
                    success = false,
                    message = "Fetch batch not found.",
                    records = new List<DeviceLog>(),
                    totalLoaded = 0,
                    isCompleted = true
                };
            }

            var records = _attendanceFetchCacheService.GetPage(batchKey, page, pageSize);

            return new
            {
                success = true,
                records = records,
                totalLoaded = batch.TotalLoaded,
                isCompleted = batch.IsCompleted,
                page = page,
                pageSize = pageSize
            };
        }
        public async Task<List<AttendanceDailySummary>> SaveDeviceLogsByBatchAsync(string batchKey, string username)
        {
            var logs = _attendanceFetchCacheService.GetAllLogs(batchKey);

            return await SaveDeviceLogsAsync(logs, username);
        }
        // ─── 2. SAVE FETCHED LOGS TO DATABASE (VIA STORED PROCEDURE) ─────────────


        private static DataTable BuildDeviceLogDataTable(List<DeviceLog> logs)
        {
            var table = new DataTable();

            table.Columns.Add("EmployeeCode", typeof(string));
            table.Columns.Add("LogDate", typeof(DateTime));
            table.Columns.Add("SerialNumber", typeof(string));
            table.Columns.Add("PunchDirection", typeof(string));
            table.Columns.Add("Temperature", typeof(decimal));
            table.Columns.Add("TemperatureState", typeof(string));

            foreach (var log in logs)
            {
                if (string.IsNullOrWhiteSpace(log.EmployeeCode) || string.IsNullOrWhiteSpace(log.LogDate))
                    continue;

                table.Rows.Add(
                    log.EmployeeCode?.Trim(),
                    Convert.ToDateTime(log.LogDate),
                    log.SerialNumber?.Trim() ?? "",
                    log.PunchDirection?.Trim() ?? "",
                    log.Temperature,
                    log.TemperatureState?.Trim() ?? ""
                );
            }

            return table;
        }


        public async Task<List<AttendanceDailySummary>> SaveDeviceLogsAsync(List<DeviceLog> logs, string username)
        {
            try
            {
                if (logs == null || logs.Count == 0)
                {
                    return new List<AttendanceDailySummary>();
                }

                var validLogs = logs
                    .Where(x =>
                        !string.IsNullOrWhiteSpace(x.EmployeeCode) &&
                        !string.IsNullOrWhiteSpace(x.LogDate))
                    .ToList();

                if (validLogs.Count == 0)
                {
                    return new List<AttendanceDailySummary>();
                }

                var table = BuildDeviceLogDataTable(validLogs);

                var param = new DynamicParameters();
                param.Add(
                    "@Logs",
                    table.AsTableValuedParameter("dbo.DeviceLogTVP")
                );
                param.Add("@Username", username);

                await _dapper.ExecuteAsync(
                    "usp_Transaction_DeviceLog_Bulk_Save",
                    param
                );

                var fromDate = validLogs.Min(x => Convert.ToDateTime(x.LogDate)).Date;
                var toDate = validLogs.Max(x => Convert.ToDateTime(x.LogDate)).Date;

                await CalculateAttendanceSummaryAsync(fromDate, toDate, username);

                var summary = await GetAttendanceDailySummaryAsync(fromDate, toDate);

                return summary;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error saving device logs: " + ex.Message);
                return new List<AttendanceDailySummary>();
            }
        }
        //public async Task<List<AttendanceDailySummary>> SaveDeviceLogsAsync(List<DeviceLog> logs, string username)
        //{
        //    try
        //    {
        //        if (logs == null || logs.Count == 0)
        //        {
        //            return new List<AttendanceDailySummary>();
        //        }

        //        foreach (var log in logs)
        //        {
        //            var param = new DynamicParameters();

        //            param.Add("@EmployeeCode", log.EmployeeCode);
        //            param.Add("@LogDate", Convert.ToDateTime(log.LogDate));
        //            param.Add("@SerialNumber", log.SerialNumber);
        //            param.Add("@PunchDirection", log.PunchDirection);
        //            param.Add("@Temperature", log.Temperature);
        //            param.Add("@TemperatureState", log.TemperatureState);
        //            param.Add("@Username", username);

        //            await _dapper.ExecuteAsync("usp_Transaction_DeviceLog_Save", param);
        //        }

        //        var fromDate = logs.Min(x => Convert.ToDateTime(x.LogDate)).Date;
        //        var toDate = logs.Max(x => Convert.ToDateTime(x.LogDate)).Date;

        //        await CalculateAttendanceSummaryAsync(fromDate, toDate, username);

        //        var summary = await GetAttendanceDailySummaryAsync(fromDate, toDate);

        //        return summary;
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("Error saving device logs: " + ex.Message);
        //        return new List<AttendanceDailySummary>();
        //    }
        //}

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


        private async Task CalculateAttendanceSummaryAsync(DateTime fromDate, DateTime toDate, string username)
        {
            var param = new DynamicParameters();

            param.Add("@FromDate", fromDate);
            param.Add("@ToDate", toDate);
            param.Add("@Username", username);

            await _dapper.ExecuteAsync(
                "usp_Transaction_Attendence_Daily_Summary_Calculate",
                param
            );
        }

        public async Task<List<AttendanceDailySummary>> GetAttendanceDailySummaryAsync(DateTime fromDate, DateTime toDate)
        {
            var param = new DynamicParameters();

            param.Add("@FromDate", fromDate);
            param.Add("@ToDate", toDate);

            var result = await _dapper.QueryAsync<AttendanceDailySummary>(
                "usp_Transaction_Attendence_Daily_Summary_Get",
                param
            );

            return result.ToList();
        }
        public async Task<PagedResponse<AttendanceDailySummary>> GetAttendanceDailySummaryPagedAsync(
    DateTime fromDate,
    DateTime toDate,
    int page,
    int pageSize,
    string search)
        {
            var param = new DynamicParameters();

            param.Add("@FromDate", fromDate);
            param.Add("@ToDate", toDate);
            param.Add("@Page", page);
            param.Add("@PageSize", pageSize);
            param.Add("@Search", search);

            var result = await _dapper.QueryAsync<AttendanceDailySummary>(
                "usp_Transaction_Attendence_Daily_Summary_GetPaged",
                param
            );

            var list = result.ToList();

            var totalRecords = list.Count > 0
                ? list.First().TotalRecords
                : 0;

            return new PagedResponse<AttendanceDailySummary>
            {
                Data = list,
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
        }
        public async Task<List<AttendanceDailySummary>> RecalculateAttendanceAsync(DateTime fromDate, DateTime toDate, string username)
        {
            await CalculateAttendanceSummaryAsync(fromDate, toDate, username);

            var summary = await GetAttendanceDailySummaryAsync(fromDate, toDate);

            return summary;
        }
        public async Task<List<AttendanceDailySummary>> GetAttendanceSummaryForEditAsync(
                      DateTime fromDate,
                      DateTime toDate,
                       string search)
        {
            var param = new DynamicParameters();

            param.Add("@FromDate", fromDate);
            param.Add("@ToDate", toDate);
            param.Add("@Search", search ?? "");

            var result = await _dapper.QueryAsync<AttendanceDailySummary>(
                "usp_Transaction_Attendence_Daily_Summary_Edit_Get",
                param
            );

            return result.ToList();
        }
        public async Task<SaveResult> UpdateAttendanceManualAsync(
    AttendanceManualUpdateRequest request,
    string username)
        {
            var param = new DynamicParameters();

            param.Add("@IDAttendenceDailySummary", request.IDAttendenceDailySummary);
            param.Add("@IDEmployee", request.IDEmployee);
            param.Add("@AttendenceDate", request.AttendenceDate);

            param.Add("@InTime", request.InTime);
            param.Add("@OutTime", request.OutTime);

            param.Add("@ManualReason", request.ManualReason);
            param.Add("@Username", username);

            var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Transaction_Attendence_Daily_Summary_Manual_Update",
                param
            );

            return result ?? SaveResult.Fail("No response from database.");
        }
    }
}
