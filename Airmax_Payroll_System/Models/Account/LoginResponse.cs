using DRSPortals.Models.Account;

namespace DRSPortal.Models.Account
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";

        public string Token { get; set; } = "";
        public DateTime ExpiresAt { get; set; }

        public JwtUser User { get; set; } = new();
    }
}
