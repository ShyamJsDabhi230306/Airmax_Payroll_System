using Airmax_Payroll_System.Models.DeviceLog;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;

namespace Airmax_Payroll_System.Controllers.API
{
    [ApiController]
    [Route("api/DeviceLog")]
    public class DeviceLogController : ControllerBase
    {
        private readonly DeviceLogService _deviceLogService;
        private readonly AttendanceCalculationService _attendanceCalculationService;
        public DeviceLogController(DeviceLogService deviceLogService, AttendanceCalculationService attendanceCalculationService)
        {
            _deviceLogService = deviceLogService;
            _attendanceCalculationService = attendanceCalculationService;
            _attendanceCalculationService = attendanceCalculationService;
        }
        //// GET: api/DeviceLog?fromDate=2026-06-01&toDate=2026-06-15
        //[HttpGet]
        //public async Task<IActionResult> GetLogs([FromQuery] string fromDate, [FromQuery] string toDate)
        //{
        //    if (string.IsNullOrEmpty(fromDate) || string.IsNullOrEmpty(toDate))
        //    {
        //        return BadRequest("FromDate and ToDate parameters are required.");
        //    }
        //    var result = await _deviceLogService.GetDeviceLogs(fromDate, toDate);
        //    return Ok(result);
        //}
        [HttpGet]
        public async Task<IActionResult> GetLogs([FromQuery] string fromDate, [FromQuery] string toDate)
            {
            if (string.IsNullOrEmpty(fromDate) || string.IsNullOrEmpty(toDate))
            {
                return BadRequest("FromDate and ToDate parameters are required.");
            }

            var rawLogs = await _deviceLogService.GetDeviceLogs(fromDate, toDate);

            var employeeNameLookup = await _deviceLogService.GetEmployeeNameLookupAsync();

            var dailySummary = _attendanceCalculationService.CalculateDailySummary(
                rawLogs,
                employeeNameLookup
            );

            var response = new AttendanceFetchResponse
            {
                RawLogs = rawLogs,
                DailySummary = dailySummary
            };

            return Ok(response);
        }
        // POST: api/DeviceLog/save
        [HttpPost("save")]
        public async Task<IActionResult> SaveLogs([FromBody] List<DeviceLog> logs)
        {
            if (logs == null || logs.Count == 0)
            {
                return BadRequest("No log records were provided to save.");
            }
            // Retrieve logged-in username or default to "System"
            var loggedInUserFullName = User.FindFirst("FullName")?.Value ?? "System";
            var success = await _deviceLogService.SaveDeviceLogsAsync(logs, loggedInUserFullName);
            if (success)
            {
                return Ok(new { success = true, message = $"{logs.Count} logs saved successfully." });
            }
            return StatusCode(500, new { success = false, message = "Failed to save logs to the database." });
        }
    }
}
