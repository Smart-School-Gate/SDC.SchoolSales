using System.Text.Json;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AuditService(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task LogAsync(string action, string entityType, string? entityId = null, object? details = null, string? ipAddress = null)
    {
        try
        {
            var audit = new AuditLog
            {
                UserId = _currentUser.UserId,
                UserEmail = _currentUser.Email,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                DetailsJson = details != null ? JsonSerializer.Serialize(details) : null,
                IpAddress = ipAddress
            };

            _db.AuditLogs.Add(audit);
            await _db.SaveChangesAsync();
        }
        catch
        {
            // Fail-safe to ensure auditing errors do not crash primary business actions
        }
    }
}
