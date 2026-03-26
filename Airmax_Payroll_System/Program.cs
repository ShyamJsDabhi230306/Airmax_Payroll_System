using Airmax_Payroll_System.Helpers;
using Airmax_Payroll_System.Repositories;
using Airmax_Payroll_System.Services;
using DRSPortal.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
// ---------------------------------
// MVC + JSON
// ---------------------------------
builder.Services
    .AddControllersWithViews()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---------------------------------
// Session
// ---------------------------------
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<JwtHelper>();
builder.Services.AddScoped<IDapperHelper, DapperHelper>();
// this is the Repo layer
builder.Services.AddScoped<MasterCompanyRepo>();
builder.Services.AddScoped<MasterLocationRepo>();
builder.Services.AddScoped<MasterDepartmentRepo>();
builder.Services.AddScoped<MasterDesignationRepo>();
builder.Services.AddScoped<MasterShiftRepo>();
builder.Services.AddScoped<MasterUserRepo>();
builder.Services.AddScoped<MasterEmployeeRepo>();
builder.Services.AddScoped<MasterEmployeeGroupRepo>();
builder.Services.AddScoped<MasterEmployeeGroupBonusDetailsRepo>();
// this is the service layer
builder.Services.AddScoped<MasterCompanyService>();
builder.Services.AddScoped<MasterLocationService>();
builder.Services.AddScoped<MasterDepartmentService>();
builder.Services.AddScoped<MasterDesignationService>();
builder.Services.AddScoped<MasterShiftService>();
builder.Services.AddScoped<MasterUserService>();
builder.Services.AddScoped<MasterEmployeeService>();
builder.Services.AddScoped<MasterEmployeeGroupService>();
builder.Services.AddScoped<MasterEmployeeGroupBonusDetailsService>();


// ---------------------------------
// JWT AUTH
// ---------------------------------
var jwtKey = Encoding.UTF8.GetBytes(
    builder.Configuration["Jwt:Key"]
        ?? throw new Exception("Jwt:Key missing")
);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtKey),
            ClockSkew = TimeSpan.Zero
        };
    });

// ---------------------------------
// SWAGGER
// ---------------------------------
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// 🔑 Inject JWT from Cookie into Header
app.Use(async (context, next) =>
{
    if (!context.Request.Headers.ContainsKey("Authorization") &&
        context.Request.Cookies.TryGetValue("jwt_token", out var token))
    {
        context.Request.Headers["Authorization"] = "Bearer " + token;
    }
    await next();
});

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Account}/{action=Login}/{id?}");

app.Run();
