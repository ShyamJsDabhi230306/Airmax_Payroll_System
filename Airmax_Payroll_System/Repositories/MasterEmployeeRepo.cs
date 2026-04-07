using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Models.Transaction;
using Dapper;

namespace Airmax_Payroll_System.Repositories
{
    public class MasterEmployeeRepo
    {

        private readonly IDapperHelper _dapper;
        private readonly ILogger<MasterEmployeeRepo>? _logger;

        public MasterEmployeeRepo(IDapperHelper dapper, ILogger<MasterEmployeeRepo>? logger = null)
        {
            _dapper = dapper;
            _logger = logger;
        }

        // 🔹 GET ALL
        //public async Task<IEnumerable<MasterEmployee>> GetAllAsync()
        //{
        //    try
        //    {
        //        return await _dapper.QueryAsync<MasterEmployee>("usp_Master_Employee_SelectAll");
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger?.LogError(ex, "Error in EmployeeRepo.GetAllAsync");
        //        return Enumerable.Empty<MasterEmployee>();
        //    }
        //}


        // Path: Repositories\MasterEmployeeRepo.cs

        public async Task<IEnumerable<MasterEmployee>> GetAllAsync(int idCompany, int idLocation, int idDepartment)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDCompany", idCompany); 
                param.Add("@IDLocation", idLocation);
                param.Add("@IDDepartment", idDepartment);
        
        // 🔍 This calls your updated "usp_Master_Employee_SelectAll"
        return await _dapper.QueryAsync<MasterEmployee>("usp_Master_Employee_SelectAll", param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in MasterEmployeeRepo.GetAllAsync");
                return Enumerable.Empty<MasterEmployee>();
            }
        }


        // 🔹 GET BY ID
        public async Task<MasterEmployee?> GetByIdAsync(int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDEmployee", id);

                return await _dapper.QueryFirstOrDefaultAsync<MasterEmployee>(
                    "usp_Master_Employee_SelectById", param);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in EmployeeRepo.GetByIdAsync");
                return null;
            }
        }

        // 🔹 SAVE
        public async Task<SaveResult> SaveAsync(MasterEmployee emp)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@IDEmployee", emp.IDEmployee);
                param.Add("@EmployeeCode", emp.EmployeeCode);
                param.Add("@IDCompany", emp.IDCompany);
                param.Add("@IDLocation", emp.IDLocation);
                param.Add("@IDDepartment", emp.IDDepartment);
                param.Add("@IDEmployeeGroup", emp.IDEmployeeGroup);
                param.Add("@IDShift", emp.IDShift);
                param.Add("@IDDesignation", emp.IDDesignation);
                param.Add("@EmployeeName", emp.EmployeeName);
                param.Add("@Emp_Address", emp.Emp_Address);
                param.Add("@Emp_ContactNo", emp.Emp_ContactNo);
                param.Add("@EmailID", emp.EmailID);
                param.Add("@JoiningDate", emp.JoiningDate);
                param.Add("@BloodGroup", emp.BloodGroup);

                param.Add("@Salary", emp.Salary);
                param.Add("@SecondSalary", emp.SecondSalary);
                param.Add("@BonusPercentage", emp.BonusPercentage);
                param.Add("@LeavePercentage", emp.LeavePercentage);
                param.Add("@TeaCoffeeAmt", emp.TeaCoffeeAmt);

                param.Add("@CalculatePF", emp.CalculatePF);
                param.Add("@CalculateDA", emp.CalculateDA);
                param.Add("@DAPercentage", emp.DAPercentage);

                param.Add("@AadharNo", emp.AadharNo);
                param.Add("@PanNo", emp.PanNo);
                param.Add("@BankName", emp.BankName);
                param.Add("@BankACNo", emp.BankACNo);
                param.Add("@IFSCCode", emp.IFSCCode);

                param.Add("@UAN", emp.UAN);
                param.Add("@PFNo", emp.PFNo);
                param.Add("@ApplyPFBonus", emp.ApplyPFBonus);
                param.Add("@HasDifferentBankAC", emp.HasDifferentBankAC);

                param.Add("@DefaultLateHrs", emp.DefaultLateHrs);

                param.Add("@UserName", emp.UserName);
                param.Add("@Password", emp.Password);

                param.Add("@IsLeave", emp.IsLeave);
                param.Add("@LeaveDate", emp.LeaveDate);

                param.Add("@Remark", emp.Remarks);

                // ✅ FIXED
                param.Add("@E_By", emp.E_By);

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Employee_Save", param);

                return result ?? SaveResult.Fail("No response");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in EmployeeRepo.SaveAsync");
                return SaveResult.Fail(ex.Message);
            }
        }

        // 🔹 DELETE
        public async Task<SaveResult> DeleteAsync(int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@IDEmployee", id);
                param.Add("@D_By", "ADMIN"); // TODO: Replace with actual user ID
               

                var result = await _dapper.QueryFirstOrDefaultAsync<SaveResult>(
                    "usp_Master_Employee_Delete", param);

                return result ?? SaveResult.Fail("No response");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error in EmployeeRepo.DeleteAsync");
                return SaveResult.Fail(ex.Message);
            }
        }



        public async Task<IEnumerable<EmployeeModel>> GetByDepartmentAsync(int id)
        {
            var param = new DynamicParameters();
            param.Add("@IDDepartment", id);

            return await _dapper.QueryAsync<EmployeeModel>(
                "usp_Employee_GetByDepartment",
                param);
        }
    }
}
