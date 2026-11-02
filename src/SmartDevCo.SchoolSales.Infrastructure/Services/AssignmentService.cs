using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class AssignmentService : IAssignmentService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public AssignmentService(ApplicationDbContext db, ICurrentUserService currentUser, IAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<ApiResponse<bool>> AssignSchoolAsync(AssignSchoolRequest request)
    {
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            return ApiResponse<bool>.Fail("Only administrators and sales managers can assign or reassign schools.");
        }

        var school = await _db.Schools.FirstOrDefaultAsync(s => s.Id == request.SchoolId);
        if (school == null)
        {
            return ApiResponse<bool>.Fail("School not found.");
        }

        var targetUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.AssignedToUserId && u.IsActive);
        if (targetUser == null)
        {
            return ApiResponse<bool>.Fail("Selected sales representative is not found or is inactive.");
        }

        var currentUserId = _currentUser.UserId ?? Guid.Empty;

        // Close previous assignment if active
        var previousActiveAssignment = await _db.SchoolAssignments
            .Where(a => a.SchoolId == school.Id && a.UnassignedAtUtc == null)
            .OrderByDescending(a => a.AssignedAtUtc)
            .FirstOrDefaultAsync();

        if (previousActiveAssignment != null)
        {
            previousActiveAssignment.UnassignedAtUtc = DateTime.UtcNow;
        }

        // Add new assignment record
        var newAssignment = new SchoolAssignment
        {
            SchoolId = school.Id,
            AssignedToUserId = targetUser.Id,
            AssignedByUserId = currentUserId,
            AssignedAtUtc = DateTime.UtcNow,
            Notes = request.Notes
        };
        _db.SchoolAssignments.Add(newAssignment);

        // Update school responsible representative (preserving CreatedByUserId!)
        school.AssignedToUserId = targetUser.Id;
        if (school.SalesStatus == SalesStatus.New)
        {
            school.SalesStatus = SalesStatus.Assigned;
        }
        school.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _audit.LogAsync("AssignSchool", "School", school.Id.ToString(), new
        {
            SchoolName = school.Name,
            AssignedToUserId = targetUser.Id,
            AssignedToUserName = targetUser.FullName,
            request.Notes
        });

        return ApiResponse<bool>.Ok(true, $"School successfully assigned to {targetUser.FullName}.");
    }

    public async Task<ApiResponse<int>> BulkAssignAsync(BulkAssignRequest request)
    {
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            return ApiResponse<int>.Fail("Only administrators and sales managers can assign schools.");
        }

        if (request.SchoolIds == null || !request.SchoolIds.Any())
        {
            return ApiResponse<int>.Fail("No schools selected for assignment.");
        }

        var targetUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.AssignedToUserId && u.IsActive);
        if (targetUser == null)
        {
            return ApiResponse<int>.Fail("Selected sales representative is not found or is inactive.");
        }

        var currentUserId = _currentUser.UserId ?? Guid.Empty;
        var schools = await _db.Schools.Where(s => request.SchoolIds.Contains(s.Id)).ToListAsync();

        int assignedCount = 0;
        foreach (var school in schools)
        {
            var previousActive = await _db.SchoolAssignments
                .Where(a => a.SchoolId == school.Id && a.UnassignedAtUtc == null)
                .OrderByDescending(a => a.AssignedAtUtc)
                .FirstOrDefaultAsync();

            if (previousActive != null)
            {
                previousActive.UnassignedAtUtc = DateTime.UtcNow;
            }

            _db.SchoolAssignments.Add(new SchoolAssignment
            {
                SchoolId = school.Id,
                AssignedToUserId = targetUser.Id,
                AssignedByUserId = currentUserId,
                AssignedAtUtc = DateTime.UtcNow,
                Notes = request.Notes ?? "Bulk assignment"
            });

            school.AssignedToUserId = targetUser.Id;
            if (school.SalesStatus == SalesStatus.New)
            {
                school.SalesStatus = SalesStatus.Assigned;
            }
            school.UpdatedAtUtc = DateTime.UtcNow;
            assignedCount++;
        }

        await _db.SaveChangesAsync();

        await _audit.LogAsync("BulkAssignSchools", "School", null, new
        {
            Count = assignedCount,
            AssignedToUserId = targetUser.Id,
            AssignedToUserName = targetUser.FullName
        });

        return ApiResponse<int>.Ok(assignedCount, $"{assignedCount} schools successfully assigned to {targetUser.FullName}.");
    }

    public async Task<ApiResponse<List<SchoolAssignmentHistoryDto>>> GetAssignmentHistoryAsync(Guid schoolId)
    {
        var history = await _db.SchoolAssignments
            .AsNoTracking()
            .Include(a => a.AssignedToUser)
            .Include(a => a.AssignedByUser)
            .Where(a => a.SchoolId == schoolId)
            .OrderByDescending(a => a.AssignedAtUtc)
            .Select(a => new SchoolAssignmentHistoryDto
            {
                Id = a.Id,
                SchoolId = a.SchoolId,
                AssignedToUserId = a.AssignedToUserId,
                AssignedToUserName = a.AssignedToUser.FullName,
                AssignedByUserId = a.AssignedByUserId,
                AssignedByUserName = a.AssignedByUser.FullName,
                AssignedAtUtc = a.AssignedAtUtc,
                UnassignedAtUtc = a.UnassignedAtUtc,
                Notes = a.Notes
            })
            .ToListAsync();

        return ApiResponse<List<SchoolAssignmentHistoryDto>>.Ok(history);
    }

    public async Task<ApiResponse<List<SchoolDto>>> GetUnassignedSchoolsAsync()
    {
        var query = _db.Schools
            .AsNoTracking()
            .Include(s => s.CreatedByUser)
            .Include(s => s.Contacts)
            .Include(s => s.Visits)
            .Where(s => s.AssignedToUserId == null)
            .OrderByDescending(s => s.CreatedAtUtc);

        var list = await query.Select(s => new SchoolDto
        {
            Id = s.Id,
            Name = s.Name,
            Phone = s.Phone,
            Email = s.Email,
            City = s.City,
            District = s.District,
            SchoolType = s.SchoolType,
            Source = s.Source,
            SalesStatus = s.SalesStatus,
            GeneralNotes = s.GeneralNotes,
            CreatedByUserId = s.CreatedByUserId,
            CreatedByUserName = s.CreatedByUser.FullName,
            ContactsCount = s.Contacts.Count,
            VisitsCount = s.Visits.Count,
            CreatedAtUtc = s.CreatedAtUtc
        }).ToListAsync();

        return ApiResponse<List<SchoolDto>>.Ok(list);
    }
}
