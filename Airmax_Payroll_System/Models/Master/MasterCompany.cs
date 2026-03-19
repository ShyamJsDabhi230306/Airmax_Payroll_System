using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master
{
    public class MasterCompany:AuditFields
    {
        public int IDCompany { get; set; }

        public string? CompanyName { get; set; }
        public string? Office_Address { get; set; }
        public string? CityName { get; set; }
        public string? StateCode { get; set; }
        public string? Pincode { get; set; }

        public string? ContactNo { get; set; }
        public string? OTPMobNo { get; set; }
        public string? PhoneNo { get; set; }

        public string? Comp_EmailID { get; set; }
        public string? FaxNo { get; set; }
        public string? Website { get; set; }

        public string? PanNo { get; set; }
        public string? GSTNo { get; set; }
        public DateTime? GSTDate { get; set; }

        public string? DbUserID { get; set; }
        public string? DbUserPassword { get; set; }
        public string? DbDatabaseName { get; set; }
        public string? DbDatasource { get; set; }
        public string? DbTimeOut { get; set; }
        public string? LogoFileName { get; set; }
        public string? LogoFileExtension { get; set; }

        public string? SignFileName { get; set; }
        public string? SignFileExtension { get; set; }

        public string? Unit { get; set; }

        public decimal? PF { get; set; }
        public decimal? ESIC { get; set; }
        public decimal? PT { get; set; }

        public string? DeviceSerialNo { get; set; }
        public string? OutDeviceSerialNo { get; set; }

    }
}
