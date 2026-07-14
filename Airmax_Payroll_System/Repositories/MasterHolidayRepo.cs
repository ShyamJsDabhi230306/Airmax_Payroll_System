using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterHolidayRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterHolidayRepo>? _logger;

        public MasterHolidayRepo(
            IDapperHelper dapperHelper,
            ILogger<MasterHolidayRepo>? logger = null)
        {
            _dapper = dapperHelper;
            _logger = logger;
        }

        public async Task<IEnumerable<MasterHoliday>> GetAllAsync()
        {
            try
            {
                return await _dapper.QueryAsync<MasterHoliday>(
                    "usp_Master_Holiday_SelectAll");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in HolidayRepo.GetAllAsync");

                return Enumerable.Empty<MasterHoliday>();
            }
        }

        public async Task<MasterHoliday?> GetByIdAsync(int idHoliday)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDHoliday", idHoliday);

                return await _dapper.QueryFirstOrDefaultAsync<MasterHoliday>(
                    "usp_Master_Holiday_SelectById",
                    param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in HolidayRepo.GetByIdAsync | IDHoliday={IDHoliday}",
                    idHoliday);

                return null;
            }
        }

        public async Task<SaveResult> SaveAsync(MasterHoliday model, string userFullName)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@IDHoliday", model.IDHoliday);
                param.Add("@HolidayMonth", model.HolidayMonth);
                param.Add("@HolidayDate", model.HolidayDate);
                param.Add("@DayName", model.DayName);
                param.Add("@HolidayType", model.HolidayType);
                param.Add("@HolidayName", model.HolidayName);
                param.Add("@IsActive", model.IsActive);
                param.Add("@UserFullName", model.E_By);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Holiday_Save",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in HolidayRepo.SaveAsync | IDHoliday={IDHoliday}",
                    model.IDHoliday);

                return SaveResult.Fail(
                    "Failed to save holiday. " + ex.Message);
            }
        }

        public async Task<SaveResult> DeleteAsync(int idHoliday, string deleteBy)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDHoliday", idHoliday);
                param.Add("@D_By", deleteBy);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Holiday_Delete",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in HolidayRepo.DeleteAsync | IDHoliday={IDHoliday}",
                    idHoliday);

                return SaveResult.Fail(
                    "Failed to delete holiday. " + ex.Message);
            }
        }

        public async Task<IEnumerable<MasterHoliday>> GetByMonthAsync(DateTime holidayMonth)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@HolidayMonth", holidayMonth);

                return await _dapper.QueryAsync<MasterHoliday>(
                    "usp_Master_Holiday_SelectByMonth",
                    param
                );
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterHolidayRepo.GetByMonthAsync");
                return Enumerable.Empty<MasterHoliday>();
            }
        }
    }
}