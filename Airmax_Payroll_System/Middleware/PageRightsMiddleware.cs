using Airmax_Payroll_System.Helpers;
using Dapper;
using System.Security.Claims;
using Airmax_Payroll_System.Models.Master;
using Airmax_Payroll_System.Repositories;

namespace Airmax_Payroll_System.Middlewares
{
    public class PageRightsMiddleware
    {
        private readonly RequestDelegate _next;
        private static List<MasterPage> _pageMap = new(); // 📜 Using List to handle multiple pages (List/Entry)
        private static DateTime _lastUpdate = DateTime.MinValue;

        public PageRightsMiddleware(RequestDelegate next) { _next = next; }

        public async Task InvokeAsync(HttpContext context, IDapperHelper _dapper, UserRightsRepo _userRightsRepo)
        {
            var path = context.Request.Path.Value?.ToLower() ?? "";

            // 1. 🌈 SYSTEM ACCESS: Always allowed
            if (path.Contains("/login") || path.Contains("/accessdenied") || path.Contains("/logout") ||
                path.EndsWith(".png") || path.EndsWith(".jpg") || path.EndsWith(".jpeg") || path.EndsWith(".gif") ||
                path.Contains("/vendor/") || path.Contains("/css/") || path.Contains("/js/") ||
                path.Contains("/logo/") || path.Contains("/favicon.ico") ||
                path.Contains("/dropdown") || path.Contains("/by-") ||
                path.Contains("/generate-") || path.Contains("/get-permissions"))
            {
                await _next(context); return;
            }

            // 2. 🔐 AUTH CHECK
            if (context.User.Identity == null || !context.User.Identity.IsAuthenticated)
            {
                if (path.Contains("/api/")) { context.Response.StatusCode = 401; return; }
                string returnUrl = context.Request.Path.Value ?? "/";
                context.Response.Redirect($"/Account/Login?ReturnUrl={Uri.EscapeDataString(returnUrl)}&message=403%20-%20Access%20Restricted.");
                return;
            }

            // 3. 👑 ADMIN BYPASS
            if (context.User.IsInRole("Admin") || context.User.IsInRole("Administrator"))
            {
                await _next(context); return;
            }

            // 4. 🗄️ REFRESH CACHE
            if (DateTime.Now.Subtract(_lastUpdate).TotalMinutes > 5 || _pageMap.Count == 0)
            {
                var pages = await _dapper.QueryAsync<MasterPage>("usp_Master_Page_SelectAll");
                _pageMap = pages.Where(p => !string.IsNullOrEmpty(p.PageUrl)).ToList();
                _lastUpdate = DateTime.Now;
            }

            // 5. 🔍 IDENTIFY CURRENT PAGE(S)
            string normalizedPath = NormalizePath(path);

            // Allow root or home
            if (string.IsNullOrEmpty(normalizedPath) || normalizedPath == "/" || normalizedPath == "/home")
            {
                await _next(context); return;
            }

            // Find ALL pages that normalize to this path
            var matchingPageNames = _pageMap
                .Where(p => NormalizePath(p.PageUrl) == normalizedPath)
                .Select(p => p.PageName.Trim())
                .ToList();

            if (matchingPageNames.Count == 0)
            {
                await _next(context); return;
            }

            // 6. 🛡️ CHECK RIGHTS
            var userIdStr = context.User.FindFirst("IDUser")?.Value ?? context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr != null)
            {
                var allUserRights = await _dapper.QueryAsync<UserPagePermission>("usp_UserRights_GetPagePermissions", new { UserId = int.Parse(userIdStr) });
                var rightsList = allUserRights.ToList();

                // Pass all rights to View for UI Shield
                context.Items["UserPermissions"] = rightsList;

                // Check if user has right for ANY matching page
                var matchedRights = rightsList.Where(r => matchingPageNames.Any(name => name.Equals(r.PageName.Trim(), StringComparison.OrdinalIgnoreCase))).ToList();

                if (!matchedRights.Any())
                {
                    await DenyAccess(context, path);
                    return;
                }

                bool isAllowed = false;
                string method = context.Request.Method.ToUpper();

                // If user has permission on ANY matching page, grant access
                foreach (var right in matchedRights)
                {
                    if (method == "GET")
                        isAllowed |= (right.CanView || right.CanCreate || right.CanEdit || right.CanDelete);
                    else if (method == "POST" || method == "PUT")
                        isAllowed |= (right.CanCreate || right.CanEdit);
                    else if (method == "DELETE")
                        isAllowed |= right.CanDelete;
                }

                if (!isAllowed)
                {
                    await DenyAccess(context, path);
                    return;
                }
            }

            await _next(context);
        }

        private string NormalizePath(string path)
        {
            if (string.IsNullOrEmpty(path)) return "/";
            string normalized = path.ToLower().Trim();

            if (normalized.StartsWith("/api/")) normalized = "/" + normalized.Substring(5);

            // 🛡️ UTILITY BYPASS: Treat as Root
            if (normalized.Contains("/dropdown") || normalized.Contains("/by-") ||
                normalized.Contains("/generate-") || normalized.Contains("/get-permissions"))
            {
                return "/";
            }

            // Strip action suffixes
            string[] suffixes = { "/save", "/delete", "/get-all", "/get-by-id", "/index", "/active-deactive", "/dropdown", "/get-permissions", "/generate-no", "list", "entry" };
            foreach (var s in suffixes)
            {
                if (normalized.Contains(s))
                {
                    normalized = normalized.Replace(s, "");
                }
            }

            normalized = normalized.Replace("-", "");
            if (!normalized.StartsWith("/")) normalized = "/" + normalized;
            if (normalized.Length > 1 && normalized.EndsWith("/")) normalized = normalized.TrimEnd('/');

            return normalized;
        }

        private async Task DenyAccess(HttpContext context, string path)
        {
            if (path.ToLower().Contains("/api/"))
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new { success = false, message = "Access Denied." });
            }
            else
            {
                context.Response.Redirect("/Account/AccessDenied");
            }
        }
    }
}
