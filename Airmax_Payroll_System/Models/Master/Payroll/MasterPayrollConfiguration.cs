using Airmax_Payroll_System.Models.Common;

namespace Airmax_Payroll_System.Models.Master.Payroll
{
    public class MasterPayrollConfiguration : AuditFields
    {
        public int IDPayrollConfiguration { get; set; }

        public int IDCompany { get; set; }
        public int IDEmployeeGroup { get; set; }
        public string? CompanyName { get; set; }
        public string? EmployeeGroupName { get; set; }

        public TimeSpan? ShiftInTime { get; set; }
        public TimeSpan? ShiftOutTime { get; set; }
        public TimeSpan? GracePeriods { get; set; }
        public string? ShiftType { get; set; }
        public decimal? WorkingHour { get; set; }
        public decimal? MinFullDayHours { get; set; }
        public string? WeeklyOff { get; set; }

        public int? AllowedLateCount { get; set; }
        public TimeSpan? MaxAllowedLateTime { get; set; }
        public string? AfterLateActionType { get; set; }
        public int? PenaltyStartFromCount { get; set; }
        public TimeSpan? HalfDayThreshold { get; set; }
        public TimeSpan? FullAbsentThreshold { get; set; }
        public TimeSpan? GracePeriodLate { get; set; }
        public bool? PerMinuteAutoCalculate { get; set; }
        public decimal? FixedDeductionPerMinute { get; set; }
        public string? MaxDeductiblePerDay { get; set; }

        public int? EarlyAllowedCount { get; set; }
        public int? EarlyBufferMinutes { get; set; }
        public string? EarlyAfterCountAction { get; set; }
        public TimeSpan? EarlyHalfDayBeforeTime { get; set; }

        public TimeSpan? OTStartAfterTime { get; set; }
        public string? OTCalculationBasis { get; set; }
        public decimal? MaxOTPerDay { get; set; }
        public bool? OTApplicable { get; set; }

        public decimal? MaxLoanAmount { get; set; }
        public decimal? AlternateLoanAmount { get; set; }
        public decimal? SalaryThresholdForAltLoan { get; set; }
        public int? MaxLoanTenure { get; set; }
        public int? MinServiceRequired { get; set; }
        public int? GuarantorRequired { get; set; }
        public bool? AllowPreClose { get; set; }
        public bool? AllowEMISkip { get; set; }
        public bool? InterestApplicable { get; set; }
        public bool? AutoDeductEMI { get; set; }

        public bool? ExtraDayPaymentEnabled { get; set; }
        public string? ExtraDayPaymentType { get; set; }
        public string? ExtraDayApplicable { get; set; }
        public decimal? ExtraDayMinHours { get; set; }
        public bool? IsBonusExcluded { get; set; }
        public bool? IsTeaExcluded { get; set; }
        public bool? IsLeaveCreditExcluded { get; set; }
        public bool? IsOTAmountExcluded { get; set; }
        public bool? IsHRAExcluded { get; set; }
        public bool? IsPFDeduction { get; set; }

        public string? PayslipHeaderText { get; set; }
        public string? PayslipFooterNote { get; set; }
        public bool? ShowCompanyLogo { get; set; }
        public bool? ShowPFESICBreakdown { get; set; }
        public bool? ShowSalaryComponentBreakdown { get; set; }
        public bool? AutoEmailPayslip { get; set; }
        public bool? ShowOTAmountSeparately { get; set; }

        public List<MasterPayrollConfigurationSlab> Slabs { get; set; } = new();
        public List<MasterPayrollConfigurationComponent> Components { get; set; } = new();
    }
}
