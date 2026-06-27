namespace Airmax_Payroll_System.Models.Transaction.Salary
{
 

        public class SalaryConfiguration
        {
            public int IDPayrollConfiguration { get; set; }
            public int IDCompany { get; set; }
            public int IDEmployeeGroup { get; set; }
            public string EmployeeGroupName { get; set; }

            public TimeSpan? ShiftInTime { get; set; }
            public TimeSpan? ShiftOutTime { get; set; }
            public TimeSpan? GracePeriods { get; set; }

            public string ShiftType { get; set; }
            public decimal? WorkingHour { get; set; }
            public decimal? MinFullDayHours { get; set; }
            public string WeeklyOff { get; set; }

            public int? AllowedLateCount { get; set; }
            public TimeSpan? MaxAllowedLateTime { get; set; }
            public string AfterLateActionType { get; set; }
            public int? PenaltyStartFromCount { get; set; }

            public TimeSpan? HalfDayThreshold { get; set; }
            public TimeSpan? FullAbsentThreshold { get; set; }
            public TimeSpan? GracePeriodLate { get; set; }

            public bool? PerMinuteAutoCalculate { get; set; }
            public decimal? FixedDeductionPerMinute { get; set; }
            public string MaxDeductiblePerDay { get; set; }

            public TimeSpan? OTStartAfterTime { get; set; }
            public string OTCalculationBasis { get; set; }
            public decimal? MaxOTPerDay { get; set; }
            public bool? OTApplicable { get; set; }

            public bool? ExtraDayPaymentEnabled { get; set; }
            public string ExtraDayPaymentType { get; set; }
            public string ExtraDayApplicable { get; set; }
            public decimal? ExtraDayMinHours { get; set; }

            public bool? IsBonusExcluded { get; set; }
            public bool? IsTeaExcluded { get; set; }
            public bool? IsLeaveCreditExcluded { get; set; }
            public bool? IsOTAmountExcluded { get; set; }
            public bool? IsHRAExcluded { get; set; }
            public bool? IsPFDeduction { get; set; }
        }

        public class SalaryConfigurationComponent
        {
            public int IDPayrollConfiguration { get; set; }
            public int IDPayrollConfigurationComponent { get; set; }

            public string ComponentName { get; set; }
            public string Formula { get; set; }

            public bool? IsTaxable { get; set; }
            public bool? ShowOnPayslip { get; set; }
            public int? SortOrder { get; set; }
        }

        public class SalaryConfigurationSlab
        {
            public int IDPayrollConfiguration { get; set; }
            public int IDPayrollConfigurationSlab { get; set; }

            public string SlabType { get; set; }
            public TimeSpan? FromTime { get; set; }
            public TimeSpan? ToTime { get; set; }

            public string DeductionType { get; set; }
            public decimal? DeductionValue { get; set; }
            public decimal? OTHours { get; set; }
            public decimal? RateMultiplier { get; set; }
        }

        public class SalaryConfigurationResponse
        {
            public List<SalaryConfiguration> Configurations { get; set; } = new();
            public List<SalaryConfigurationComponent> Components { get; set; } = new();
            public List<SalaryConfigurationSlab> Slabs { get; set; } = new();
        }
    
}
