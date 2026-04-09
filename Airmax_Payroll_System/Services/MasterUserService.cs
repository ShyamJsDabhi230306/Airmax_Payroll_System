using Airmax_Payroll_System.Models.Common;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;
using DRSPortal.Helpers;
using DRSPortal.Models.Account;
using DRSPortals.Models.Account;
using System.IdentityModel.Tokens.Jwt;

namespace Airmax_Payroll_System.Services
{
    public class MasterUserService
    {
        private readonly MasterUserRepo _repo;
        private readonly JwtHelper _jwtHelper;

        public MasterUserService(
            MasterUserRepo repo,
            JwtHelper jwtHelper)
        {
            _repo = repo;
            _jwtHelper = jwtHelper;
        }

        public MasterUserService(MasterUserRepo repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<MasterUser>> GetAllAsync()
            => await _repo.GetAllAsync();

        public async Task<MasterUser?> GetByIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<SaveResult> SaveAsync(MasterUser model)
            => await _repo.SaveAsync(model);

        public async Task<SaveResult> DeleteAsync(int id,string DeletedBy)
            => await _repo.DeleteAsync(id, DeletedBy);





        // ---------------------------------------------------------
        // LOGIN
        // ---------------------------------------------------------
        public async Task<LoginResponse> LoginAsync(
            string userName,
            string password)
        {
            if (string.IsNullOrWhiteSpace(userName)
                || string.IsNullOrWhiteSpace(password))
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "Username and password required"
                };
            }

            var user = await _repo.LoginAsync(userName, password);

            if (user == null)
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = "Invalid username or password"
                };
            }

            // 🔑 Generate JWT
            var token = _jwtHelper.GenerateToken(
                user.IDUser,
                user.UserName,
                user.FullName,
                user.RoleName,
                user.IDCompany ?? 0,
                user.IDLocation ?? 0,
                user.IDDepartment ?? 0);

            return new LoginResponse
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(4),
                User = MapToJwtUser(user)
            };
        }

        // ---------------------------------------------------------
        // MAP DB USER → JWT USER
        // ---------------------------------------------------------
        private static JwtUser MapToJwtUser(MasterUser user)
        {
            return new JwtUser
            {
                IDUser = user.IDUser,
                UserName = user.UserName,
                FullName = user.FullName,
                Email = user.Email ?? "",
                Mobile = user.Mobile ?? "",
                Role = user.RoleName,
                IDCompany = user.IDCompany ?? 0,
                IDLocation = user.IDLocation ?? 0,
                IDDepartment = user.IDDepartment ?? 0,
            };
        }
    }
}
