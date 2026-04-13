namespace Airmax_Payroll_System.Models.Master
{
    public class UserPagePermission
    {
        public int PageId { get; set; }
        public string PageName { get; set; } = string.Empty;
        public string PageUrl { get; set; } = string.Empty;
        public bool CanView { get; set; }
        public bool CanCreate { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
    }
    // 2. This is used when saving multiple rights at once
    public class UserRightsSaveDto
    {
        public int UserId { get; set; }
        public List<UserPagePermission> Permissions { get; set; } = new();
    }
    // 3. Simple class for your Dropdowns (ID and Name)
    public class DropdownItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
