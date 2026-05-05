using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master.Payroll;
using Dapper;
using Newtonsoft.Json;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterPayrollConfigurationRepo
    {
        private readonly IDapperHelper _dapper;

        public MasterPayrollConfigurationRepo(IDapperHelper dapper)
        {
            _dapper = dapper;
        }

        public async Task<IEnumerable<MasterPayrollConfiguration>> GetAllAsync()
        {
            return await _dapper.QueryAsync<MasterPayrollConfiguration>(
                "usp_Master_PayrollConfiguration_SelectAll",
                null
            );
        }

        public async Task<MasterPayrollConfiguration?> GetByIdAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDPayrollConfiguration", id);

            return await GetSingleAsync("usp_Master_PayrollConfiguration_SelectById", param);
        }

        public async Task<MasterPayrollConfiguration?> GetByCompanyGroupAsync(int idCompany, int idEmployeeGroup)
        {
            var param = new DynamicParameters();
            param.Add("@IDCompany", idCompany);
            param.Add("@IDEmployeeGroup", idEmployeeGroup);

            return await GetSingleAsync("usp_Master_PayrollConfiguration_SelectByCompanyGroup", param);
        }

        private async Task<MasterPayrollConfiguration?> GetSingleAsync(string spName, DynamicParameters param)
        {
            var row = await _dapper.QueryFirstOrDefaultAsync<dynamic>(spName, param);

            if (row == null)
                return null;

            string slabsJson = Convert.ToString(row.Slabs) ?? "[]";
            string componentsJson = Convert.ToString(row.Components) ?? "[]";

            var model = new MasterPayrollConfiguration
            {
                IDPayrollConfiguration = row.IDPayrollConfiguration,
                IDCompany = row.IDCompany,
                IDEmployeeGroup = row.IDEmployeeGroup,

                ShiftInTime = row.ShiftInTime,
                ShiftOutTime = row.ShiftOutTime,
                GracePeriods = row.GracePeriods,
                ShiftType = row.ShiftType,
                WorkingHour = row.WorkingHour,
                MinFullDayHours = row.MinFullDayHours,
                WeeklyOff = row.WeeklyOff,

                AllowedLateCount = row.AllowedLateCount,
                MaxAllowedLateTime = row.MaxAllowedLateTime,
                AfterLateActionType = row.AfterLateActionType,
                PenaltyStartFromCount = row.PenaltyStartFromCount,
                HalfDayThreshold = row.HalfDayThreshold,
                FullAbsentThreshold = row.FullAbsentThreshold,
                GracePeriodLate = row.GracePeriodLate,
                PerMinuteAutoCalculate = row.PerMinuteAutoCalculate,
                FixedDeductionPerMinute = row.FixedDeductionPerMinute,
                MaxDeductiblePerDay = row.MaxDeductiblePerDay,

                EarlyAllowedCount = row.EarlyAllowedCount,
                EarlyBufferMinutes = row.EarlyBufferMinutes,
                EarlyAfterCountAction = row.EarlyAfterCountAction,
                EarlyHalfDayBeforeTime = row.EarlyHalfDayBeforeTime,

                OTStartAfterTime = row.OTStartAfterTime,
                OTCalculationBasis = row.OTCalculationBasis,
                MaxOTPerDay = row.MaxOTPerDay,
                OTApplicable = row.OTApplicable,

                MaxLoanAmount = row.MaxLoanAmount,
                AlternateLoanAmount = row.AlternateLoanAmount,
                SalaryThresholdForAltLoan = row.SalaryThresholdForAltLoan,
                MaxLoanTenure = row.MaxLoanTenure,
                MinServiceRequired = row.MinServiceRequired,
                GuarantorRequired = row.GuarantorRequired,
                AllowPreClose = row.AllowPreClose,
                AllowEMISkip = row.AllowEMISkip,
                InterestApplicable = row.InterestApplicable,
                AutoDeductEMI = row.AutoDeductEMI,

                ExtraDayPaymentEnabled = row.ExtraDayPaymentEnabled,
                ExtraDayPaymentType = row.ExtraDayPaymentType,
                ExtraDayApplicable = row.ExtraDayApplicable,
                ExtraDayMinHours = row.ExtraDayMinHours,
                IsBonusExcluded = row.IsBonusExcluded,
                IsTeaExcluded = row.IsTeaExcluded,
                IsLeaveCreditExcluded = row.IsLeaveCreditExcluded,
                IsOTAmountExcluded = row.IsOTAmountExcluded,
                IsHRAExcluded = row.IsHRAExcluded,
                IsPFDeduction = row.IsPFDeduction,

                PayslipHeaderText = row.PayslipHeaderText,
                PayslipFooterNote = row.PayslipFooterNote,
                ShowCompanyLogo = row.ShowCompanyLogo,
                ShowPFESICBreakdown = row.ShowPFESICBreakdown,
                ShowSalaryComponentBreakdown = row.ShowSalaryComponentBreakdown,
                AutoEmailPayslip = row.AutoEmailPayslip,
                ShowOTAmountSeparately = row.ShowOTAmountSeparately,

                Slabs = JsonConvert.DeserializeObject<List<MasterPayrollConfigurationSlab>>(slabsJson) ?? new(),
                Components = JsonConvert.DeserializeObject<List<MasterPayrollConfigurationComponent>>(componentsJson) ?? new(),
            };

            return model;
        }

        public async Task<SaveResult> SaveAsync(MasterPayrollConfiguration model)
        {
            var param = new DynamicParameters();

            param.Add("@IDPayrollConfiguration", model.IDPayrollConfiguration);
            param.Add("@IDCompany", model.IDCompany);
            param.Add("@IDEmployeeGroup", model.IDEmployeeGroup);

            param.Add("@ShiftInTime", model.ShiftInTime);
            param.Add("@ShiftOutTime", model.ShiftOutTime);
            param.Add("@GracePeriods", model.GracePeriods);
            param.Add("@ShiftType", model.ShiftType);
            param.Add("@WorkingHour", model.WorkingHour);
            param.Add("@MinFullDayHours", model.MinFullDayHours);
            param.Add("@WeeklyOff", model.WeeklyOff);

            param.Add("@AllowedLateCount", model.AllowedLateCount);
            param.Add("@MaxAllowedLateTime", model.MaxAllowedLateTime);
            param.Add("@AfterLateActionType", model.AfterLateActionType);
            param.Add("@PenaltyStartFromCount", model.PenaltyStartFromCount);
            param.Add("@HalfDayThreshold", model.HalfDayThreshold);
            param.Add("@FullAbsentThreshold", model.FullAbsentThreshold);
            param.Add("@GracePeriodLate", model.GracePeriodLate);
            param.Add("@PerMinuteAutoCalculate", model.PerMinuteAutoCalculate);
            param.Add("@FixedDeductionPerMinute", model.FixedDeductionPerMinute);
            param.Add("@MaxDeductiblePerDay", model.MaxDeductiblePerDay);

            param.Add("@EarlyAllowedCount", model.EarlyAllowedCount);
            param.Add("@EarlyBufferMinutes", model.EarlyBufferMinutes);
            param.Add("@EarlyAfterCountAction", model.EarlyAfterCountAction);
            param.Add("@EarlyHalfDayBeforeTime", model.EarlyHalfDayBeforeTime);

            param.Add("@OTStartAfterTime", model.OTStartAfterTime);
            param.Add("@OTCalculationBasis", model.OTCalculationBasis);
            param.Add("@MaxOTPerDay", model.MaxOTPerDay);
            param.Add("@OTApplicable", model.OTApplicable);

            param.Add("@MaxLoanAmount", model.MaxLoanAmount);
            param.Add("@AlternateLoanAmount", model.AlternateLoanAmount);
            param.Add("@SalaryThresholdForAltLoan", model.SalaryThresholdForAltLoan);
            param.Add("@MaxLoanTenure", model.MaxLoanTenure);
            param.Add("@MinServiceRequired", model.MinServiceRequired);
            param.Add("@GuarantorRequired", model.GuarantorRequired);
            param.Add("@AllowPreClose", model.AllowPreClose);
            param.Add("@AllowEMISkip", model.AllowEMISkip);
            param.Add("@InterestApplicable", model.InterestApplicable);
            param.Add("@AutoDeductEMI", model.AutoDeductEMI);

            param.Add("@ExtraDayPaymentEnabled", model.ExtraDayPaymentEnabled);
            param.Add("@ExtraDayPaymentType", model.ExtraDayPaymentType);
            param.Add("@ExtraDayApplicable", model.ExtraDayApplicable);
            param.Add("@ExtraDayMinHours", model.ExtraDayMinHours);
            param.Add("@IsBonusExcluded", model.IsBonusExcluded);
            param.Add("@IsTeaExcluded", model.IsTeaExcluded);
            param.Add("@IsLeaveCreditExcluded", model.IsLeaveCreditExcluded);
            param.Add("@IsOTAmountExcluded", model.IsOTAmountExcluded);
            param.Add("@IsHRAExcluded", model.IsHRAExcluded);
            param.Add("@IsPFDeduction", model.IsPFDeduction);

            param.Add("@PayslipHeaderText", model.PayslipHeaderText);
            param.Add("@PayslipFooterNote", model.PayslipFooterNote);
            param.Add("@ShowCompanyLogo", model.ShowCompanyLogo);
            param.Add("@ShowPFESICBreakdown", model.ShowPFESICBreakdown);
            param.Add("@ShowSalaryComponentBreakdown", model.ShowSalaryComponentBreakdown);
            param.Add("@AutoEmailPayslip", model.AutoEmailPayslip);
            param.Add("@ShowOTAmountSeparately", model.ShowOTAmountSeparately);

            param.Add("@Slabs", JsonConvert.SerializeObject(model.Slabs));
            param.Add("@Components", JsonConvert.SerializeObject(model.Components));

            param.Add("@UserName", model.IDPayrollConfiguration == 0 ? model.E_By : model.U_By);

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Master_PayrollConfiguration_Save",
                param
            );
        }

        public async Task<SaveResult> DeleteAsync(int id, string deleteBy)
        {
            var param = new DynamicParameters();
            param.Add("@IDPayrollConfiguration", id);
            param.Add("@D_By", deleteBy);

            return await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Master_PayrollConfiguration_Delete",
                param
            );
        }
    }
}
