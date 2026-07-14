using Airmax_Payroll_System.Models.DeviceLog;
using Airmax_Payroll_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;

namespace Airmax_Payroll_System.Controllers.API
{
    [Authorize]
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
        [HttpGet("fetch-page")]
        public IActionResult GetFetchPage([FromQuery] string batchKey,[FromQuery] int page = 1,[FromQuery] int pageSize = 100)
        {
            if (string.IsNullOrEmpty(batchKey))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "BatchKey is required."
                });
            }

            var result = _deviceLogService.GetFetchBatchPage(batchKey, page, pageSize);

            return Ok(result);
        }
        [HttpPost("save-batch")]
        public async Task<IActionResult> SaveBatch([FromQuery] string batchKey)
        {
            if (string.IsNullOrEmpty(batchKey))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "BatchKey is required."
                });
            }

            var username = User.Identity?.Name ?? "System";

            var summary = await _deviceLogService.SaveDeviceLogsByBatchAsync(batchKey, username);

            return Ok(new
            {
                success = summary != null && summary.Count > 0,
                message = "Attendance logs saved and calculated successfully.",
                dailySummary = summary
            });
        }
        [HttpPost("start-fetch")]
        public IActionResult StartFetch([FromQuery] string fromDate, [FromQuery] string toDate)
        {
            if (string.IsNullOrEmpty(fromDate) || string.IsNullOrEmpty(toDate))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "FromDate and ToDate parameters are required."
                });
            }

            var username = User.Identity?.Name ?? "System";

            var batchKey = _deviceLogService.StartDeviceLogFetchBatch(fromDate, toDate, username);

            return Ok(new
            {
                success = true,
                message = "Device log fetch started.",
                batchKey = batchKey
            });
        }
        // POST: api/DeviceLog/save
        [HttpPost("save")]
        public async Task<IActionResult> SaveLogs([FromBody] List<DeviceLog> logs)
        {
            if (logs == null || logs.Count == 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No attendance logs received."
                });
            }

            var username = User.Identity?.Name ?? "System";

            var summary = await _deviceLogService.SaveDeviceLogsAsync(logs, username);

            if (summary == null || summary.Count == 0)
            {
                return Ok(new
                {
                    success = false,
                    message = "Attendance logs saved, but no calculated summary found.",
                    dailySummary = summary
                });
            }

            return Ok(new
            {
                success = true,
                message = "Attendance logs saved and calculated successfully.",
                dailySummary = summary
            });
        }
        [HttpGet("summary")]
        public async Task<IActionResult> GetCalculatedSummary([FromQuery] string fromDate, [FromQuery] string toDate)
        {
            if (string.IsNullOrEmpty(fromDate) || string.IsNullOrEmpty(toDate))
            {
                return BadRequest("FromDate and ToDate parameters are required.");
            }

            var from = Convert.ToDateTime(fromDate);
            var to = Convert.ToDateTime(toDate);

            var summary = await _deviceLogService.GetAttendanceDailySummaryAsync(from, to);

            return Ok(summary);
        }
        [HttpPost("recalculate")]
        public async Task<IActionResult> RecalculateAttendance([FromQuery] string fromDate, [FromQuery] string toDate)
        {
            if (string.IsNullOrEmpty(fromDate) || string.IsNullOrEmpty(toDate))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "FromDate and ToDate parameters are required."
                });
            }

            var from = Convert.ToDateTime(fromDate);
            var to = Convert.ToDateTime(toDate);
            var username = User.Identity?.Name ?? "System";

            var summary = await _deviceLogService.RecalculateAttendanceAsync(from, to, username);

            return Ok(new
            {
                success = true,
                message = "Attendance recalculated successfully.",
                dailySummary = summary
            });
        }


        [HttpGet("summary-paged")]
        public async Task<IActionResult> GetCalculatedSummaryPaged(
                                         [FromQuery] string fromDate,
                                         [FromQuery] string toDate,
                                         [FromQuery] int page = 1,
                                         [FromQuery] int pageSize = 25,
                                         [FromQuery] string search = "")
        {
            if (string.IsNullOrEmpty(fromDate) || string.IsNullOrEmpty(toDate))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "FromDate and ToDate parameters are required."
                });
            }

            var from = Convert.ToDateTime(fromDate);
            var to = Convert.ToDateTime(toDate);

            var result = await _deviceLogService.GetAttendanceDailySummaryPagedAsync(
                from,
                to,
                page,
                pageSize,
                search ?? ""
            );

            return Ok(new
            {
                success = true,
                data = result.Data,
                totalRecords = result.TotalRecords,
                page = result.Page,
                pageSize = result.PageSize
            });
        }

        [HttpGet("manual-edit-list")]
        public async Task<IActionResult> GetManualEditList(
                 [FromQuery] string fromDate,
                 [FromQuery] string toDate,
                 [FromQuery] string search = "")
        {
            if (string.IsNullOrEmpty(fromDate) || string.IsNullOrEmpty(toDate))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "FromDate and ToDate parameters are required."
                });
            }

            var from = Convert.ToDateTime(fromDate);
            var to = Convert.ToDateTime(toDate);

            var data = await _deviceLogService.GetAttendanceSummaryForEditAsync(
                from,
                to,
                search ?? ""
            );

            return Ok(new
            {
                success = true,
                data = data
            });
        }

        [HttpPost("manual-update")]
        public async Task<IActionResult> ManualUpdate([FromBody] AttendanceManualUpdateRequest request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid request."
                });
            }

            if (request.IDAttendenceDailySummary <= 0 && request.IDEmployee <= 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Employee is required for new attendance entry."
                });
            }

            if (request.IDAttendenceDailySummary <= 0 && request.AttendenceDate == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Attendance date is required for new attendance entry."
                });
            }

            if (request.InTime == null && request.OutTime == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Please enter In Time or Out Time."
                });
            }

            var username = User.Identity?.Name ?? "System";

            var result = await _deviceLogService.UpdateAttendanceManualAsync(
                request,
                username
            );

            if (result.Result != 1)
            {
                return Ok(new
                {
                    success = false,
                    message = result.Message,
                    errorCode = result.ErrorCode
                });
            }

            return Ok(new
            {
                success = true,
                message = result.Message,
                data = result
            });
        }
    }
}
