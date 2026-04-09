using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Dapper;
using System.Data;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterDepartmentRepo
    {
        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterDepartmentRepo>? _logger;

        public MasterDepartmentRepo(IDapperHelper dapperHelper,
            ILogger<MasterDepartmentRepo>? logger = null)
        {
            _dapper = dapperHelper;
            _logger = logger;
        }

        //public async Task<IEnumerable<MasterDepartment>> GetAllAsync()
        //{
        //    try
        //    {
        //        return await _dapper.QueryAsync<MasterDepartment>(
        //            "usp_Master_Department_SelectAll");
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger?.LogError(ex,
        //            "Error in DepartmentRepo.GetAllAsync");
        //        return Enumerable.Empty<MasterDepartment>();
        //    }
        //}

        // Path: Repositories\MasterDepartmentRepo.cs

        public async Task<IEnumerable<MasterDepartment>> GetAllAsync(int idCompany, int idLocation, int idDepartment)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDCompany", idCompany); 
                param.Add("@IDLocation", idLocation); 
                param.Add("@IDDepartment", idDepartment);
        
        // 🔍 This calls your updated "usp_Master_Department_SelectAll"
        return await _dapper.QueryAsync<MasterDepartment>("usp_Master_Department_SelectAll", param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterDepartmentRepo.GetAllAsync");
                return Enumerable.Empty<MasterDepartment>();
            }
        }


        public async Task<MasterDepartment?> GetByIdAsync(int idDepartment)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDDepartment", idDepartment);

                return await _dapper.QueryFirstOrDefaultAsync<MasterDepartment>(
                    "usp_Master_Department_SelectById",
                    param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in DepartmentRepo.GetByIdAsync | IDDepartment={IDDepartment}",
                    idDepartment);
                return null;
            }
        }

        public async Task<SaveResult> SaveAsync(MasterDepartment model)
        {
            var param = new DynamicParameters();

            param.Add("@IDDepartment", model.IDDepartment);
            param.Add("@IDLocation", model.IDLocation);
            param.Add("@DepartmentName", model.DepartmentName);
            param.Add("@Remarks", model.Remarks);
            param.Add("@IsActive", model.IsActive);

            param.Add("@username", model.E_By);
            param.Add("@E_Date", DateTime.Now);
            param.Add("@U_Date", DateTime.Now);

            var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                "usp_Master_Department_Save",
                param);

            return result;
        }

        public async Task<SaveResult> DeleteAsync(int idDepartment, string deleteBy)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDDepartment", idDepartment);
                param.Add("@D_By", deleteBy);
               


                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Department_Delete",
                    param);

                return result ?? SaveResult.Fail("No response from database.");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex,
                    "Error in DepartmentRepo.DeleteAsync | IDDepartment={IDDepartment}",
                    idDepartment);

                return SaveResult.Fail(
                    "Failed to delete department. " + ex.Message);
            }
        }
    }
}