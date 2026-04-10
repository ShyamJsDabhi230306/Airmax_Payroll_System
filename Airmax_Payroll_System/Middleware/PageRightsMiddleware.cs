using Airmax_Payroll_System.Helpers;
using Dapper;
using System.Security.Claims;
using Airmax_Payroll_System.Models.Master;

namespace Airmax_Payroll_System.Middlewares
{
    public class PageRightsMiddleware
    {
        private readonly RequestDelegate _next;
        // 🚀 SMART CACHE: Keeps performance lightning fast
        private static Dictionary<string, string> _pageMap = new();
        private static DateTime _lastUpdate = DateTime.MinValue;

        public PageRightsMiddleware(RequestDelegate next) { _next = next; }

        public async Task InvokeAsync(HttpContext context, IDapperHelper _dapper)
        {
            var path = context.Request.Path.Value?.ToLower() ?? "";

            // 1. ALWAYS ALLOW: system paths
            if (path.Contains("/get-permissions/") || path.Contains("/login") ||
                path.Contains("/accessdenied") || path.Contains("/home/error") ||
                path.Contains("/get-all") || path.Contains("/by-"))
            {
                await _next(context); return;
            }

            // 2. 🛡️ DYNAMIC LOOKUP: Sync with database every 5 minutes
            if (DateTime.Now.Subtract(_lastUpdate).TotalMinutes > 5)
            {
                var pages = await _dapper.QueryAsync<MasterPage>("usp_Master_Page_SelectAll");
                _pageMap = pages.Where(p => !string.IsNullOrEmpty(p.PageUrl))
                                .ToDictionary(p => p.PageUrl!.ToLower(), p => p.PageName);
                _lastUpdate = DateTime.Now;
            }

            // 3. Find the Page Name by comparing the URL
            string pageName = _pageMap.FirstOrDefault(m => path.StartsWith(m.Key)).Value ?? "";

            // Allow if page is not tracked or it's a root/index
            if (string.IsNullOrEmpty(pageName) || path == "/" || path.EndsWith("/index")) { await _next(context); return; }

            var user = context.User;
            var userRole = user.FindFirst(ClaimTypes.Role)?.Value?.ToLower() ?? "";

            // 4. ADMIN BYPASS
            if (userRole == "admin" || userRole == "administrator" || user.IsInRole("Admin") || user.IsInRole("Administrator"))
            {
                await _next(context); return;
            }

            // 5. FETCH RIGHTS
            var userIdStr = user.FindFirst("IDUser")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr != null)
            {
                var rights = await _dapper.QueryAsync<UserPagePermission>("usp_UserRights_GetPagePermissions", new { UserId = int.Parse(userIdStr) });
                var currentRight = rights.FirstOrDefault(r => r.PageName.Trim().Equals(pageName, StringComparison.OrdinalIgnoreCase));

                bool isAllowed = false;
                if (!path.Contains("/api/"))
                {
                    isAllowed = currentRight?.CanView ?? false;
                }
                else
                {
                    string method = context.Request.Method;
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
