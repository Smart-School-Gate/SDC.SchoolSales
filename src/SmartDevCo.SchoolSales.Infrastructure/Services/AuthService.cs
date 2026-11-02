using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;
    private readonly IAuditService _audit;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        ApplicationDbContext db,
        IConfiguration config,
        IAuditService audit,
        ILogger<AuthService> logger)
    {
        _db = db;
        _config = config;
        _audit = audit;
        _logger = logger;
    }

    public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request, string? ipAddress = null)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return ApiResponse<LoginResponse>.Fail("Email and password are required.");
        }

        var user = await _db.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());

        if (user == null)
        {
            return ApiResponse<LoginResponse>.Fail("Invalid credentials.");
        }

        if (!user.IsActive)
        {
            return ApiResponse<LoginResponse>.Fail("Your account has been deactivated. Contact an administrator.");
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return ApiResponse<LoginResponse>.Fail("Invalid credentials.");
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        var (accessToken, expiresAtUtc) = GenerateJwtToken(user, roles, permissions);
        var refreshToken = GenerateRefreshToken(user.Id);

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("UserLogin", "User", user.Id.ToString(), new { user.Email, Roles = roles }, ipAddress);

        var response = new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAtUtc = expiresAtUtc,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                IsActive = user.IsActive,
                Roles = roles,
                Permissions = permissions,
                CreatedAtUtc = user.CreatedAtUtc
            }
        };

        return ApiResponse<LoginResponse>.Ok(response, "Login successful.");
    }

    public async Task<ApiResponse<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress = null)
    {
        var existingRefreshToken = await _db.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

        if (existingRefreshToken == null || !existingRefreshToken.IsActive)
        {
            return ApiResponse<LoginResponse>.Fail("Invalid or expired refresh token.");
        }

        var user = existingRefreshToken.User;
        if (!user.IsActive)
        {
            return ApiResponse<LoginResponse>.Fail("User account is inactive.");
        }

        // Revoke the old refresh token
        existingRefreshToken.RevokedAtUtc = DateTime.UtcNow;

        // Generate new pair
        var newRefreshToken = GenerateRefreshToken(user.Id);
        existingRefreshToken.ReplacedByToken = newRefreshToken.Token;

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        var (newAccessToken, expiresAtUtc) = GenerateJwtToken(user, roles, permissions);

        _db.RefreshTokens.Add(newRefreshToken);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("TokenRefreshed", "User", user.Id.ToString(), new { user.Email }, ipAddress);

        var response = new LoginResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            ExpiresAtUtc = expiresAtUtc,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                IsActive = user.IsActive,
                Roles = roles,
                Permissions = permissions,
                CreatedAtUtc = user.CreatedAtUtc
            }
        };

        return ApiResponse<LoginResponse>.Ok(response, "Token refreshed successfully.");
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
        {
            return ApiResponse<bool>.Fail("User not found.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return ApiResponse<bool>.Fail("Current password does not match.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return ApiResponse<bool>.Fail("New password must be at least 6 characters.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAtUtc = DateTime.UtcNow;

        // Revoke all existing refresh tokens for security
        var activeTokens = await _db.RefreshTokens.Where(rt => rt.UserId == userId && rt.RevokedAtUtc == null).ToListAsync();
        foreach (var t in activeTokens)
        {
            t.RevokedAtUtc = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync("ChangePassword", "User", userId.ToString());

        return ApiResponse<bool>.Ok(true, "Password changed successfully.");
    }

    public async Task EnsureSuperAdminBootstrappedAsync()
    {
        var seeder = new DbSeeder(_db, _config, LoggerFactory.Create(b => b.AddConsole()).CreateLogger<DbSeeder>());
        await seeder.SeedAsync();
    }

    private (string token, DateTime expiresAtUtc) GenerateJwtToken(User user, List<string> roles, List<string> permissions)
    {
        var secretKey = _config["Jwt:SecretKey"] ?? "SmartDevCo_SchoolSales_Super_Secure_JWT_Key_2026_AfricaCairo!";
        var issuer = _config["Jwt:Issuer"] ?? "SmartDevCo.SchoolSales";
        var audience = _config["Jwt:Audience"] ?? "SmartDevCo.SchoolSales.Client";
        var expirationMinutes = int.TryParse(_config["Jwt:AccessTokenExpirationMinutes"], out var mins) ? mins : 120;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        foreach (var perm in permissions)
        {
            claims.Add(new Claim("permission", perm));
        }

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAtUtc,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return (tokenHandler.WriteToken(token), expiresAtUtc);
    }

    private static RefreshToken GenerateRefreshToken(Guid userId)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        return new RefreshToken
        {
            UserId = userId,
            Token = Convert.ToBase64String(randomBytes),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        };
    }
}
