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
            var path = context.Request.Path.Value.ToLower();

            // 🛡️ 1. ALWAYS ALLOW: Security check (get-permissions) & Lookups (by-department, get-all dropdowns)
            if (path.Contains("/get-permissions/") || path.Contains("/by-") || path.Contains("/generate-no") || path.Contains("/login"))
            {
                await _next(context); return;
            }

            // 🛡️ 2. Only protect API calls
            if (!path.Contains("/api/master/") && !path.Contains("/api/transaction/"))
            {
                await _next(context); return;
            }

            // 🛡️ 3. FINAL ACCURATE MAPPING (Based on your Controllers)
            string pageName = path switch
            {
                var p when p.Contains("/api/master/company") => "Company Master",
                var p when p.Contains("/api/master/department") => "Department Master",
                var p when p.Contains("/api/master/designation") => "Designation Master",
                var p when p.Contains("/api/master/employee") && !p.Contains("group") => "Employee Master",
                var p when p.Contains("/api/master/employeegroup") && !p.Contains("bonus") => "Employee Group",
                var p when p.Contains("/api/master/employeegroupbonusdetails") => "Group Bonus Details",
                var p when p.Contains("/api/master/location") => "Location Master",
                var p when p.Contains("/api/master/shift") => "Shift Master",
                var p when p.Contains("/api/master/user") && !p.Contains("rights") => "User Master",
                var p when p.Contains("/api/master/userrights") => "User Access Management",
                var p when p.Contains("/api/transaction/kharchi") => "Employee Kharchi",
                var p when p.Contains("/api/transaction/employee-loan") => "Employee Loan",
                _ => ""
            };

            // If we don't recognize the URL, let it pass
            if (string.IsNullOrEmpty(pageName)) { await _next(context); return; }

            var user = context.User;

            // 🛡️ 4. Admins bypass the check
            if (user.IsInRole("Admin")) { await _next(context); return; }

            // 🛡️ 5. Fetch User ID and Validate Rights
            var userIdStr = user.FindFirst("IDUser")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdStr != null)
            {
                int userId = int.Parse(userIdStr);
                var param = new DynamicParameters();
                param.Add("@UserId", userId);

                var rights = await _dapper.QueryAsync<UserPagePermission>("usp_UserRights_GetPagePermissions", param);
                var currentRight = rights.FirstOrDefault(r => r.PageName.Equals(pageName, StringComparison.OrdinalIgnoreCase));

                // 🛡️ 6. Enforce Permission (GET=View, POST=Edit/Create, DELETE=Delete)
                string method = context.Request.Method;
                bool isAllowed = false;

                if (method == "GET")
                {
                    isAllowed = currentRight?.CanView ?? false;
                }
                else if (method == "POST" || method == "PUT")
                {
                    isAllowed = currentRight?.CanEdit ?? currentRight?.CanCreate ?? false;
                }
                else if (method == "DELETE")
                {
                    isAllowed = currentRight?.CanDelete ?? false;
                }

                if (!isAllowed)
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsJsonAsync(new { success = false, message = "Access Denied: Missing Right for " + pageName });
                    return;
                }
            }

            await _next(context);
        }
    }
}
