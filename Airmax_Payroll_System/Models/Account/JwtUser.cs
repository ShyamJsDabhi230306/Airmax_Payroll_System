namespace DRSPortals.Models.Account
{
    public class JwtUser
    {
        public int IDUser { get; set; }

        public string UserName { get; set; } = "";

        public string FullName { get; set; } = "";

        public string Mobile { get; set; } = "";

        public string Email { get; set; } = "";

        public string Role { get; set; } = "";
        public int IDCompany { get; set; }
        public int IDLocation { get; set; }
        public int IDDepartment { get; set; }
    }
}
