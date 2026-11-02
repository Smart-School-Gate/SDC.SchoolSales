using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;
using SmartDevCo.SchoolSales.Infrastructure.Services;

namespace SmartDevCo.SchoolSales.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration["ConnectionStrings:DefaultConnection"]
            ?? configuration["DATABASE_URL"];

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("PostgreSQL Connection string 'DefaultConnection' or 'DATABASE_URL' not found in configuration/secrets/environment variables.");
        }

        // Support standard PostgreSQL URL format (e.g. postgresql://user:pass@host/db?params) if provided directly
        if (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            connectionString = ConvertPostgresUriToConnectionString(connectionString);
        }

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(3);
            });
        });

        // Register HttpContextAccessor
        services.AddHttpContextAccessor();

        // Core domain services
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ISchoolService, SchoolService>();
        services.AddScoped<ISchoolContactService, SchoolContactService>();
        services.AddScoped<IAssignmentService, AssignmentService>();
        services.AddScoped<IVisitService, VisitService>();
        services.AddScoped<IDiscoveryService, DiscoveryService>();
        services.AddScoped<IActivityService, ActivityService>();
        services.AddScoped<IFollowUpService, FollowUpService>();
        services.AddScoped<ISalesTargetService, SalesTargetService>();
        services.AddScoped<IPresentationService, PresentationService>();
        services.AddScoped<IKnowledgeBaseService, KnowledgeBaseService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IReportService, ReportService>();

        // Seeder
        services.AddScoped<DbSeeder>();

        return services;
    }

    private static string ConvertPostgresUriToConnectionString(string uriString)
    {
        var uri = new Uri(uriString);
        var userInfo = uri.UserInfo.Split(':');
        var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var database = uri.AbsolutePath.TrimStart('/');

        var port = uri.Port > 0 ? uri.Port : 5432;
        return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
    }
}
