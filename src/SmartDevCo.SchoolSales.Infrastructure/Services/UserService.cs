using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public UserService(ApplicationDbContext db, ICurrentUserService currentUser, IAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<ApiResponse<List<TeamMemberDto>>> GetUsersAsync()
    {
        var users = await _db.Users
            .AsNoTracking()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.CreatedSchools)
            .Include(u => u.AssignedSchools)
            .Include(u => u.Visits)
            .OrderByDescending(u => u.CreatedAtUtc)
            .ToListAsync();

        var list = users.Select(u => new TeamMemberDto
        {
            Id = u.Id,
            Email = u.Email,
            FullName = u.FullName,
            Phone = u.Phone,
            IsActive = u.IsActive,
            Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList(),
            DiscoveredSchoolsCount = u.CreatedSchools.Count,
            AssignedSchoolsCount = u.AssignedSchools.Count,
            VisitsCount = u.Visits.Count,
            ClosedDealsCount = u.Visits.Count(v => v.VisitOutcome == VisitOutcomeType.ClosedWon),
            CreatedAtUtc = u.CreatedAtUtc
        }).ToList();

        return ApiResponse<List<TeamMemberDto>>.Ok(list);
    }

    public async Task<ApiResponse<TeamMemberDto>> GetUserByIdAsync(Guid id)
    {
        var u = await _db.Users
            .AsNoTracking()
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.CreatedSchools)
            .Include(u => u.AssignedSchools)
            .Include(u => u.Visits)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (u == null)
        {
            return ApiResponse<TeamMemberDto>.Fail("User not found.");
        }

        var dto = new TeamMemberDto
        {
            Id = u.Id,
            Email = u.Email,
            FullName = u.FullName,
            Phone = u.Phone,
            IsActive = u.IsActive,
            Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList(),
            DiscoveredSchoolsCount = u.CreatedSchools.Count,
            AssignedSchoolsCount = u.AssignedSchools.Count,
            VisitsCount = u.Visits.Count,
            ClosedDealsCount = u.Visits.Count(v => v.VisitOutcome == VisitOutcomeType.ClosedWon),
            CreatedAtUtc = u.CreatedAtUtc
        };

        return ApiResponse<TeamMemberDto>.Ok(dto);
    }

    public async Task<ApiResponse<TeamMemberDto>> CreateUserAsync(CreateUserRequest request)
    {
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            return ApiResponse<TeamMemberDto>.Fail("Only administrators or sales managers can add team members.");
        }

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Password))
        {
            return ApiResponse<TeamMemberDto>.Fail("Email, full name, and password are required.");
        }

        var emailLower = request.Email.Trim().ToLower();
        var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == emailLower);
        if (exists)
        {
            return ApiResponse<TeamMemberDto>.Fail("A user with this email address already exists.");
        }

        var user = new User
        {
            Email = emailLower,
            FullName = request.FullName.Trim(),
            Phone = request.Phone?.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true
        };

        var allRoles = await _db.Roles.ToListAsync();
        var rolesToAssign = request.Roles.Any() ? request.Roles : new List<UserRoleType> { UserRoleType.SalesRepresentative };

        foreach (var rType in rolesToAssign)
        {
            var rName = rType.ToString();
            var role = allRoles.FirstOrDefault(r => r.Name == rName);
            if (role != null)
            {
                user.UserRoles.Add(new UserRole { RoleId = role.Id, User = user });
            }
        }

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CreateUser", "User", user.Id.ToString(), new { user.Email, user.FullName });

        return await GetUserByIdAsync(user.Id);
    }

    public async Task<ApiResponse<TeamMemberDto>> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            return ApiResponse<TeamMemberDto>.Fail("Only administrators or managers can update team members.");
        }

        var user = await _db.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            return ApiResponse<TeamMemberDto>.Fail("User not found.");
        }

        user.FullName = request.FullName.Trim();
        user.Phone = request.Phone?.Trim();
        user.IsActive = request.IsActive;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }

        if (request.Roles != null && request.Roles.Any())
        {
            user.UserRoles.Clear();
            var allRoles = await _db.Roles.ToListAsync();
            foreach (var rType in request.Roles)
            {
                var role = allRoles.FirstOrDefault(r => r.Name == rType.ToString());
                if (role != null)
                {
                    user.UserRoles.Add(new UserRole { RoleId = role.Id, UserId = user.Id });
                }
            }
        }

        user.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync("UpdateUser", "User", id.ToString(), new { user.FullName, user.IsActive });

        return await GetUserByIdAsync(id);
    }

    public async Task<ApiResponse<bool>> SetActiveStatusAsync(Guid id, bool isActive)
    {
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            return ApiResponse<bool>.Fail("Only administrators or managers can change user activation status.");
        }

        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return ApiResponse<bool>.Fail("User not found.");
        }

        user.IsActive = isActive;
        user.UpdatedAtUtc = DateTime.UtcNow;

        if (!isActive)
        {
            // Revoke active refresh tokens
            var tokens = await _db.RefreshTokens.Where(rt => rt.UserId == id && rt.RevokedAtUtc == null).ToListAsync();
            foreach (var t in tokens)
            {
                t.RevokedAtUtc = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync("SetUserActiveStatus", "User", id.ToString(), new { isActive });

        return ApiResponse<bool>.Ok(true, $"User status changed to {(isActive ? "Active" : "Inactive")}.");
    }
}
