using Airmax_Payroll_System.Models.DeviceLog;

namespace Airmax_Payroll_System.Services
{
    public class AttendanceCalculationService
    {
        public List<AttendanceDailySummary> CalculateDailySummary(
            List<DeviceLog> logs,
            Dictionary<string, string> employeeNameLookup)
        {
            TimeSpan shiftStart = new TimeSpan(9, 0, 0);
            TimeSpan shiftEnd = new TimeSpan(18, 0, 0);

            var parsedLogs = logs
                .Where(x => !string.IsNullOrWhiteSpace(x.EmployeeCode)
                            && !string.IsNullOrWhiteSpace(x.LogDate))
                .Select(x => new
                {
                    Log = x,
                    ParsedLogDate = DateTime.Parse(x.LogDate)
                })
                .ToList();

            var groupedLogs = parsedLogs
                .GroupBy(x => new
                {
                    x.Log.EmployeeCode,
                    AttendenceDate = x.ParsedLogDate.Date
                });

            var result = new List<AttendanceDailySummary>();

            foreach (var group in groupedLogs)
            {
                var orderedLogs = group
                    .OrderBy(x => x.ParsedLogDate)
                    .ToList();

                var inLog = orderedLogs
                    .Where(x => string.Equals(x.Log.PunchDirection, "in", StringComparison.OrdinalIgnoreCase))
                    .OrderBy(x => x.ParsedLogDate)
                    .FirstOrDefault();

                var outLog = orderedLogs
                    .Where(x => string.Equals(x.Log.PunchDirection, "out", StringComparison.OrdinalIgnoreCase))
                    .OrderByDescending(x => x.ParsedLogDate)
                    .FirstOrDefault();

                TimeSpan totalWorking = TimeSpan.Zero;
                TimeSpan late = TimeSpan.Zero;
                TimeSpan ot = TimeSpan.Zero;

                string status = "Present";

                DateTime shiftStartDateTime = group.Key.AttendenceDate.Add(shiftStart);
                DateTime shiftEndDateTime = group.Key.AttendenceDate.Add(shiftEnd);

                if (inLog == null && outLog == null)
                {
                    status = "Absent";
                }
                else if (inLog != null && outLog == null)
                {
                    status = "Missing Out";

                    if (inLog.ParsedLogDate > shiftStartDateTime)
                    {
                        late = inLog.ParsedLogDate - shiftStartDateTime;
                    }
                }
                else if (inLog == null && outLog != null)
                {
                    status = "Missing In";
                }
                else if (outLog.ParsedLogDate <= inLog.ParsedLogDate)
                {
                    status = "Invalid Punch";
                }
                else
                {
                    status = "Present";

                    totalWorking = outLog.ParsedLogDate - inLog.ParsedLogDate;

                    if (inLog.ParsedLogDate > shiftStartDateTime)
                    {
                        late = inLog.ParsedLogDate - shiftStartDateTime;
                    }

                    if (outLog.ParsedLogDate > shiftEndDateTime)
                    {
                        ot = outLog.ParsedLogDate - shiftEndDateTime;
                    }
                }

                string employeeName = employeeNameLookup != null
                                      && employeeNameLookup.ContainsKey(group.Key.EmployeeCode)
                    ? employeeNameLookup[group.Key.EmployeeCode]
                    : "";

                result.Add(new AttendanceDailySummary
                {
                    EmployeeCode = group.Key.EmployeeCode,
                    EmployeeName = employeeName,
                    AttendenceDate = group.Key.AttendenceDate.ToString("yyyy-MM-dd"),

                    InTime = inLog?.ParsedLogDate.ToString("yyyy-MM-dd HH:mm:ss"),
                    OutTime = outLog?.ParsedLogDate.ToString("yyyy-MM-dd HH:mm:ss"),

                    TotalWorkingHour = (int)totalWorking.TotalHours,
                    TotalWorkingMinute = totalWorking.Minutes,

                    LateHour = (int)late.TotalHours,
                    LateMinute = late.Minutes,

                    OTHour = (int)ot.TotalHours,
                    OTMinute = ot.Minutes,

                    AttendenceStatus = status,

                    InDevice = inLog?.Log.SerialNumber,
                    OutDevice = outLog?.Log.SerialNumber
                });
            }

            return result
                .OrderBy(x => x.AttendenceDate)
                .ThenBy(x => x.EmployeeCode, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }
    }
}