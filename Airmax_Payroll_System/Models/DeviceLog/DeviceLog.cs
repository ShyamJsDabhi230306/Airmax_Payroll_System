namespace Airmax_Payroll_System.Models.DeviceLog
{
    public class DeviceLog
    {
        public string EmployeeCode { get; set; }

        //public DateTime LogDate { get; set; }
        public string LogDate { get; set; }

        public string SerialNumber { get; set; }

        public string PunchDirection { get; set; }

        public decimal Temperature { get; set; }

        public string TemperatureState { get; set; }
    }

    public class EmployeeNameDto
    {
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
    }
    public class AttendanceFetchResponse
    {
        public List<DeviceLog> RawLogs { get; set; }

        public List<AttendanceDailySummary> DailySummary { get; set; }
    }
    public class AttendanceSaveRequest
    {
        public List<DeviceLog> RawLogs { get; set; }

        public List<AttendanceDailySummary> DailySummary { get; set; }
    }
}
