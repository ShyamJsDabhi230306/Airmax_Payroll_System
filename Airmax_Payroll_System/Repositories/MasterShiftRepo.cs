using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterShiftRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterShiftRepo>? _logger;

        public MasterShiftRepo(IDapperHelper dapperHelper,
            ILogger<MasterShiftRepo>? logger = null)
        {
            _dapper = dapperHelper;
            _logger = logger;
        }

        // ---------------------------------------------------------
        // GET ALL
        // ---------------------------------------------------------
        public async Task<IEnumerable<MasterShift>> GetAllAsync()
        {
            try
            {
                return await _dapper.QueryAsync<MasterShift>(
                    "usp_Master_Shift_SelectAll");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in ShiftRepo.GetAllAsync");
                return Enumerable.Empty<MasterShift>();
            }
        }

        // ---------------------------------------------------------
        // GET BY ID
        // ---------------------------------------------------------
        public async Task<MasterShift?> GetByIdAsync(int idShift)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDShift", idShift);

                return await _dapper.QueryFirstOrDefaultAsync<MasterShift>(
                    "usp_Master_Shift_SelectById",
                    param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in ShiftRepo.GetByIdAsync | IDShift={IDShift}",
                    idShift);
                return null;
            }
        }

        // ---------------------------------------------------------
        // SAVE
        // ---------------------------------------------------------
        public async Task<SaveResult> SaveAsync(MasterShift shift)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@IDShift", shift.IDShift);
                param.Add("@IDDepartment", shift.IDDepartment);
                param.Add("@ShiftDesc", shift.ShiftDesc);

                param.Add("@StartTimeHour", shift.StartTimeHour);
                param.Add("@StartTimeMinute", shift.StartTimeMinute);

                param.Add("@EndTimeHour", shift.EndTimeHour);
                param.Add("@EndTimeMinute", shift.EndTimeMinute);

                param.Add("@Remarks", shift.Remarks);
                param.Add("@IsActive", shift.IsActive);
                param.Add("@E_By", shift.E_By);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Shift_Save",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in ShiftRepo.SaveAsync | IDShift={IDShift}",
                    shift.IDShift);

                return SaveResult.Fail(
                    "Failed to save shift. " + ex.Message);
            }
        }

        // ---------------------------------------------------------
        // DELETE
        // ---------------------------------------------------------
        public async Task<SaveResult> DeleteAsync(int idShift)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDShift", idShift);
                param.Add("@D_By", "ADMIN");

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Shift_Delete",
                    param);

                if (result == null)
                {
                    return SaveResult.Fail("Database did not return any response.");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in ShiftRepo.DeleteAsync | IDShift={IDShift}",
                    idShift);

                return SaveResult.Fail(
                    "Failed to delete shift. " + ex.Message);
            }
        }
    }
}