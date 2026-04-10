using Airmax_Payroll_System.Helpers;
using Dapper;
using System.Security.Claims;
using Airmax_Payroll_System.Models.Master;

namespace Airmax_Payroll_System.Middlewares
{
    public class PageRightsMiddleware
    {
        private readonly RequestDelegate _next;

        public PageRightsMiddleware(RequestDelegate next) { _next = next; }

        public async Task InvokeAsync(HttpContext context, IDapperHelper _dapper)
        {
            var path = context.Request.Path.Value?.ToLower() ?? "";

            // 1. ALWAYS ALLOW: Core system paths
            if (path.Contains("/get-permissions/") || path.Contains("/login") ||
                path.Contains("/accessdenied") || path.Contains("/home/error") ||
                path.Contains("/get-all") || path.Contains("/by-"))
            {
                await _next(context); return;
            }

            // 2. Map the URL to the DB Page Name (Flexible Matching)
            string pageName = "";
            if (path.Contains("/company")) pageName = "Company Master";
            else if (path.Contains("/location")) pageName = "Location Master";
            else if (path.Contains("/department")) pageName = "Department Master";
            else if (path.Contains("/designation")) pageName = "Designation Master";
            else if (path.Contains("/shift")) pageName = "Shift Master";
            else if (path.Contains("/user") && !path.Contains("rights")) pageName = "User Master";
            else if (path.Contains("/userrights")) pageName = "User Access Management";
            else if (path.Contains("/employeegroup") && !path.Contains("/bonus")) pageName = "Employee Group";
            else if (path.Contains("/employeegroupbonusdetails")) pageName = "Group Bonus Details";
            else if (path.Contains("/employee") && !path.Contains("loan") && !path.Contains("kharchi") && !path.Contains("group")) pageName = "Employee Master";
            else if (path.Contains("/kharchi")) pageName = "Employee Kharchi";
            else if (path.Contains("/loan")) pageName = "Employee Loan";

            // If it's a dashboard or unrecognized system page, let it pass
            if (string.IsNullOrEmpty(pageName) || path == "/" || path.EndsWith("/index")) { await _next(context); return; }

            var user = context.User;

            // 3. 🛡️ ROBUST ADMIN BYPASS (Checks for "Admin" and "Administrator" case-insensitive)
            var userRole = user.FindFirst(ClaimTypes.Role)?.Value?.ToLower() ?? "";
            if (userRole == "admin" || userRole == "administrator" || user.IsInRole("Admin") || user.IsInRole("Administrator"))
            {
                await _next(context); return;
            }

            // 4. Fetch User Permissions
            var userIdStr = user.FindFirst("IDUser")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdStr != null)
            {
                int userId = int.Parse(userIdStr);
                var param = new DynamicParameters();
                param.Add("@UserId", userId);

                var rights = await _dapper.QueryAsync<UserPagePermission>("usp_UserRights_GetPagePermissions", param);
                var currentRight = rights.FirstOrDefault(r => r.PageName.Trim().Equals(pageName, StringComparison.OrdinalIgnoreCase));

                // 5. ENFORCE SECURITY
                bool isAllowed = false;
                string method = context.Request.Method;

                if (!path.Contains("/api/")) // Page Navigation
                {
                    isAllowed = currentRight?.CanView ?? false;
                }
                else // API Actions
                {
                    if (method == "GET") isAllowed = currentRight?.CanView ?? false;
                    else if (method == "POST" || method == "PUT") isAllowed = currentRight?.CanEdit ?? currentRight?.CanCreate ?? false;
                    else if (method == "DELETE") isAllowed = currentRight?.CanDelete ?? false;
                }

                if (!isAllowed)
                {
                    if (path.Contains("/api/"))
                    {
                        context.Response.StatusCode = 403;
                        await context.Response.WriteAsJsonAsync(new { success = false, message = "Access Denied" });
                    }
                    else
                    {
                        context.Response.Redirect("/Account/AccessDenied");
                    }
                    return;
                }
            }

            await _next(context);
        }
    }
}
