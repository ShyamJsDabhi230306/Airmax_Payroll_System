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
        // 🚀 SMART CACHE: Keeps performance lightning fast
        private static Dictionary<string, string> _pageMap = new();
        private static DateTime _lastUpdate = DateTime.MinValue;

        public PageRightsMiddleware(RequestDelegate next) { _next = next; }









        //public async Task InvokeAsync(HttpContext context, IDapperHelper _dapper)
        //{
        //    var path = context.Request.Path.Value?.ToLower() ?? "";

        //    // 1. 🌈 THE "OPEN" DOORS (No Login Required)
        //    // We must allow these, otherwise no one can log in!
        //    if (path == "/" || path == "/account/login" || path.Contains("/api/master/user/login") ||
        //        path.Contains("/accessdenied") || path.Contains("/logout") ||
        //        path.Contains("/vendor/") || path.Contains("/css/") || path.Contains("/js/") || path.Contains("/logo/"))
        //    {
        //        await _next(context); return;
        //    }

        //    // 2. 🔐 THE MASTER LOCK (Authentication)
        //    // If the user is NOT logged in and tries to access ANY other page, 
        //    // we kick them out to the Login page immediately.
        //    if (context.User.Identity?.IsAuthenticated == false)
        //    {
        //        if (path.Contains("/api/"))
        //        {
        //            context.Response.StatusCode = 401; // Unauthorized for API
        //            return;
        //        }
        //        context.Response.Redirect("/Account/Login");
        //        return;
        //    }

        //    // 3. 👑 ADMIN BYPASS
        //    if (context.User.IsInRole("Admin") || context.User.IsInRole("Administrator"))
        //    {
        //        await _next(context); return;
        //    }

        //    // 4. 🗄️ PAGE RIGHTS CHECK
        //    // (This part ensures they can only see pages assigned to them)
        //    var userIdStr = context.User.FindFirst("IDUser")?.Value ?? context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        //    // Auto-refresh the page list every 5 mins
        //    if (DateTime.Now.Subtract(_lastUpdate).TotalMinutes > 5)
        //    {
        //        var pages = await _dapper.QueryAsync<MasterPage>("usp_Master_Page_SelectAll");
        //        _pageMap = pages.Where(p => !string.IsNullOrEmpty(p.PageUrl)).ToDictionary(p => p.PageUrl!.ToLower(), p => p.PageName);
        //        _lastUpdate = DateTime.Now;
        //    }

        //    // Find if the current URL is a Master or Transaction page
        //    string pageName = "";
        //    var pathParts = path.Trim('/').Split('/');
        //    if (pathParts.Length >= 2)
        //    {
        //        string lookupPath = $"/{pathParts[0]}/{pathParts[1]}";
        //        pageName = _pageMap.FirstOrDefault(m => m.Key.ToLower().Contains(lookupPath)).Value ?? "";
        //    }

        //    if (!string.IsNullOrEmpty(pageName) && userIdStr != null)
        //    {
        //        var userId = int.Parse(userIdStr);
        //        var rights = await _dapper.QueryAsync<UserPagePermission>("usp_UserRights_GetPagePermissions", new { UserId = userId });
        //        var currentRight = rights.FirstOrDefault(r => r.PageName.Trim().Equals(pageName, StringComparison.OrdinalIgnoreCase));

        //        // Redirect if they have NO permissions or cannot View
        //        if (currentRight == null || !currentRight.CanView)
        //        {
        //            context.Response.Redirect("/Account/AccessDenied");
        //            return;
        //        }
        //    }

        //    await _next(context);
        //}



        public async Task InvokeAsync(HttpContext context, IDapperHelper _dapper, UserRightsRepo _userRightsRepo)
        {
            var path = context.Request.Path.Value?.ToLower() ?? "";

            // 1. 🌈 SYSTEM ACCESS: Always allow these
            if (path.Contains("/login") || path.Contains("/accessdenied") || path.Contains("/logout") ||
                path.Contains("/vendor/") || path.Contains("/css/") || path.Contains("/js/") || 
                path.Contains("/logo/") || path.Contains("/favicon.ico"))
            {
                await _next(context); return;
            }

            // 2. 🔐 AUTH & DASHBOARD CHECK
            if (context.User.Identity == null || !context.User.Identity.IsAuthenticated)
            {
                // Detailed logging for debugging
                Console.WriteLine($"[SHIELD] Unauthenticated access to: {path}");

                if (path.Contains("/api/"))
                {
                    context.Response.StatusCode = 401;
                    return;
                }

                // Append ReturnUrl so user comes back to this page after login
                string returnUrl = context.Request.Path.Value ?? "/";
                if (!string.IsNullOrEmpty(context.Request.QueryString.Value))
                {
                    returnUrl += context.Request.QueryString.Value;
                }

                // Spec Requirement #5: Redirect to login with specific 403 message
                context.Response.Redirect($"/Account/Login?ReturnUrl={Uri.EscapeDataString(returnUrl)}&message=403%20-%20You%20are%20not%20authorized.%20Please%20log%20in%20to%20continue.");
                return;
            }

            // 🛑 Requirement #1: Global Denial if no pages are assigned
            // We check this even on the Dashboard to prevent access to the app entirely
            if (!context.User.IsInRole("Admin") && !context.User.IsInRole("Administrator"))
            {
                var userIdStr0 = context.User.FindFirst("IDUser")?.Value ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr0, out var userId0)) userId0 = 0;

                var userRights = await _userRightsRepo.GetPermissionsAsync(userId0);
                
                if (userRights == null || !userRights.Any(r => r.CanView))
                {
                    Console.WriteLine($"[SHIELD] Global Denial for User {userId0} at {path}");
                    
                    // Block access to everything if no rights at all
                    if (path.Contains("/api/"))
                    {
                        context.Response.StatusCode = 403;
                        await context.Response.WriteAsJsonAsync(new { success = false, message = "You do not have access to any pages. Please contact your administrator." });
                        return;
                    }
                    context.Response.Redirect("/Account/AccessDenied?message=You%20do%20not%20have%20access%20to%20any%20pages.%20Please%20contact%20your%20administrator.");
                    return;
                }
            }

            // 3. 👑 ADMIN BYPASS
            if (context.User.IsInRole("Admin") || context.User.IsInRole("Administrator"))
            {
                await _next(context); return;
            }

            // 4. 🗄️ REFRESH CACHE (Every 5 mins)
            if (DateTime.Now.Subtract(_lastUpdate).TotalMinutes > 5 || _pageMap.Count == 0)
            {
                var pages = await _dapper.QueryAsync<MasterPage>("usp_Master_Page_SelectAll");
                _pageMap = pages.Where(p => !string.IsNullOrEmpty(p.PageUrl))
                                .ToDictionary(p => NormalizePath(p.PageUrl!), p => p.PageName);
                _lastUpdate = DateTime.Now;
            }

            // 5. 🔍 NORMALIZE PATH
            string normalizedPath = NormalizePath(path);
            
            // Find Page Name by exact match on normalized path
            // We search for the longest matching key to handle nested paths correctly
            var pageEntry = _pageMap.OrderByDescending(m => m.Key.Length)
                                   .FirstOrDefault(m => normalizedPath.StartsWith(m.Key));
            
            string pageName = pageEntry.Value ?? "";

            // If path is not tracked (like root or home), allow it
            if (string.IsNullOrEmpty(pageName) || normalizedPath == "/" || normalizedPath == "/home")
            {
                await _next(context); return;
            }

            // 6. 🛡️ CHECK RIGHTS
            var userIdStr = context.User.FindFirst("IDUser")?.Value ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr != null)
            {
                var rights = await _dapper.QueryAsync<UserPagePermission>("usp_UserRights_GetPagePermissions", new { UserId = int.Parse(userIdStr) });
                var currentRight = rights.FirstOrDefault(r => r.PageName.Trim().Equals(pageName, StringComparison.OrdinalIgnoreCase));

                if (currentRight == null)
                {
                    await DenyAccess(context, path);
                    return;
                }

                bool isAllowed = false;
                string method = context.Request.Method.ToUpper();

                if (method == "GET")
                {
                    // Any permission implies View-only access
                    isAllowed = currentRight.CanView || currentRight.CanCreate || currentRight.CanEdit || currentRight.CanDelete;
                }
                else if (method == "POST" || method == "PUT")
                {
                    isAllowed = currentRight.CanCreate || currentRight.CanEdit;
                }
                else if (method == "DELETE")
                {
                    isAllowed = currentRight.CanDelete;
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

            // 1. Strip /api prefix
            if (normalized.StartsWith("/api/")) normalized = "/" + normalized.Substring(5);

            // 2. Strip common action suffixes/noise
            string[] suffixes = { "/save", "/delete", "/get-all", "/get-by-id", "/index", "/active-deactive", "/dropdown", "/get-permissions", "/generate-no" };
            foreach (var s in suffixes)
            {
                if (normalized.Contains(s))
                {
                    normalized = normalized.Split(s)[0];
                    break;
                }
            }

            // 3. Remove hyphens (helps match api/master/employee-loan with /master/employeeloan)
            normalized = normalized.Replace("-", "");

            // 4. Handle Redundant Controller Prefixes: /transaction/transactionemployee -> /transaction/employee
            var parts = normalized.Trim('/').Split('/');
            if (parts.Length >= 2)
            {
                string controller = parts[0];
                string action = parts[1];
                if (action.StartsWith(controller) && action.Length > controller.Length)
                {
                    normalized = "/" + controller + "/" + action.Substring(controller.Length);
                }
            }

            // 5. Ensure leading slash and remove trailing slash
            if (!normalized.StartsWith("/")) normalized = "/" + normalized;
            if (normalized.Length > 1 && normalized.EndsWith("/")) normalized = normalized.TrimEnd('/');

            return normalized;
        }

        private async Task DenyAccess(HttpContext context, string path)
        {
            if (path.ToLower().Contains("/api/"))
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new { success = false, message = "You do not have permission to view this page." });
            }
            else
            {
                // To display the specific "You do not have permission to view this page." message,
                // we'll redirect to AccessDenied but could potentially pass the message via query string
                // if the AccessDenied page is equipped to show it.
                context.Response.Redirect("/Account/AccessDenied?message=You%20do%20not%20have%20permission%20to%20view%20this%20page.");
            }
        }

    }
}
