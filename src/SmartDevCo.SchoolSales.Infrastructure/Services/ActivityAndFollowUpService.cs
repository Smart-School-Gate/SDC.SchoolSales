using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class ActivityService : IActivityService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public ActivityService(ApplicationDbContext db, ICurrentUserService currentUser, IAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<ApiResponse<List<ActivityDto>>> GetActivitiesAsync(Guid? schoolId = null, Guid? userId = null)
    {
        var query = _db.Activities
            .AsNoTracking()
            .Include(a => a.School)
            .Include(a => a.User)
            .AsQueryable();

        if (schoolId.HasValue)
        {
            query = query.Where(a => a.SchoolId == schoolId.Value);
        }

        if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }
        else if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            var curId = _currentUser.UserId;
            query = query.Where(a => a.UserId == curId || a.School.AssignedToUserId == curId || a.School.CreatedByUserId == curId);
        }

        var list = await query
            .OrderByDescending(a => a.CreatedAtUtc)
            .Take(100)
            .Select(a => new ActivityDto
            {
                Id = a.Id,
                SchoolId = a.SchoolId,
                SchoolName = a.School.Name,
                UserId = a.UserId,
                UserName = a.User.FullName,
                Type = a.Type,
                Subject = a.Subject,
                Description = a.Description,
                DueDateUtc = a.DueDateUtc,
                CompletedAtUtc = a.CompletedAtUtc,
                IsCompleted = a.IsCompleted,
                CreatedAtUtc = a.CreatedAtUtc
            })
            .ToListAsync();

        return ApiResponse<List<ActivityDto>>.Ok(list);
    }

    public async Task<ApiResponse<ActivityDto>> CreateActivityAsync(CreateActivityRequest request)
    {
        var school = await _db.Schools.FindAsync(request.SchoolId);
        if (school == null)
        {
            return ApiResponse<ActivityDto>.Fail("School not found.");
        }

        var userId = _currentUser.UserId ?? Guid.Empty;

        var activity = new Activity
        {
            SchoolId = school.Id,
            UserId = userId,
            Type = request.Type,
            Subject = request.Subject.Trim(),
            Description = request.Description?.Trim(),
            DueDateUtc = request.DueDateUtc,
            IsCompleted = request.IsCompleted,
            CompletedAtUtc = request.IsCompleted ? DateTime.UtcNow : null
        };

        _db.Activities.Add(activity);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        var dto = new ActivityDto
        {
            Id = activity.Id,
            SchoolId = activity.SchoolId,
            SchoolName = school.Name,
            UserId = activity.UserId,
            UserName = user?.FullName ?? "",
            Type = activity.Type,
            Subject = activity.Subject,
            Description = activity.Description,
            DueDateUtc = activity.DueDateUtc,
            CompletedAtUtc = activity.CompletedAtUtc,
            IsCompleted = activity.IsCompleted,
            CreatedAtUtc = activity.CreatedAtUtc
        };

        return ApiResponse<ActivityDto>.Ok(dto, "Activity created.");
    }

    public async Task<ApiResponse<ActivityDto>> ToggleCompleteAsync(Guid id)
    {
        var activity = await _db.Activities.Include(a => a.School).Include(a => a.User).FirstOrDefaultAsync(a => a.Id == id);
        if (activity == null)
        {
            return ApiResponse<ActivityDto>.Fail("Activity not found.");
        }

        activity.IsCompleted = !activity.IsCompleted;
        activity.CompletedAtUtc = activity.IsCompleted ? DateTime.UtcNow : null;
        await _db.SaveChangesAsync();

        var dto = new ActivityDto
        {
            Id = activity.Id,
            SchoolId = activity.SchoolId,
            SchoolName = activity.School.Name,
            UserId = activity.UserId,
            UserName = activity.User.FullName,
            Type = activity.Type,
            Subject = activity.Subject,
            Description = activity.Description,
            DueDateUtc = activity.DueDateUtc,
            CompletedAtUtc = activity.CompletedAtUtc,
            IsCompleted = activity.IsCompleted,
            CreatedAtUtc = activity.CreatedAtUtc
        };

        return ApiResponse<ActivityDto>.Ok(dto);
    }

    public async Task<ApiResponse<bool>> DeleteActivityAsync(Guid id)
    {
        var activity = await _db.Activities.FindAsync(id);
        if (activity == null)
        {
            return ApiResponse<bool>.Fail("Activity not found.");
        }

        _db.Activities.Remove(activity);
        await _db.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "Activity deleted.");
    }
}

public class FollowUpService : IFollowUpService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public FollowUpService(ApplicationDbContext db, ICurrentUserService currentUser, IAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<ApiResponse<List<FollowUpDto>>> GetFollowUpsAsync(Guid? schoolId = null, Guid? userId = null, bool? onlyPending = null)
    {
        var query = _db.FollowUps
            .AsNoTracking()
            .Include(f => f.School)
            .Include(f => f.AssignedToUser)
            .AsQueryable();

        if (schoolId.HasValue)
        {
            query = query.Where(f => f.SchoolId == schoolId.Value);
        }

        if (userId.HasValue)
        {
            query = query.Where(f => f.AssignedToUserId == userId.Value);
        }
        else if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            var curId = _currentUser.UserId;
            query = query.Where(f => f.AssignedToUserId == curId || f.School.AssignedToUserId == curId || f.School.CreatedByUserId == curId);
        }

        if (onlyPending == true)
        {
            query = query.Where(f => f.Status == FollowUpStatus.Pending || f.Status == FollowUpStatus.InProgress);
        }

        var list = await query
            .OrderBy(f => f.DueDate)
            .Take(100)
            .Select(f => new FollowUpDto
            {
                Id = f.Id,
                SchoolId = f.SchoolId,
                SchoolName = f.School.Name,
                AssignedToUserId = f.AssignedToUserId,
                AssignedToUserName = f.AssignedToUser.FullName,
                DueDate = f.DueDate,
                Priority = f.Priority,
                Status = f.Status,
                Title = f.Title,
                Notes = f.Notes,
                CompletedAtUtc = f.CompletedAtUtc,
                CreatedAtUtc = f.CreatedAtUtc
            })
            .ToListAsync();

        return ApiResponse<List<FollowUpDto>>.Ok(list);
    }

    public async Task<ApiResponse<FollowUpDto>> CreateFollowUpAsync(CreateFollowUpRequest request)
    {
        var school = await _db.Schools.FindAsync(request.SchoolId);
        if (school == null)
        {
            return ApiResponse<FollowUpDto>.Fail("School not found.");
        }

        var followUp = new FollowUp
        {
            SchoolId = school.Id,
            AssignedToUserId = request.AssignedToUserId,
            DueDate = request.DueDate,
            Priority = request.Priority,
            Status = FollowUpStatus.Pending,
            Title = request.Title.Trim(),
            Notes = request.Notes?.Trim()
        };

        _db.FollowUps.Add(followUp);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(request.AssignedToUserId);
        var dto = new FollowUpDto
        {
            Id = followUp.Id,
            SchoolId = followUp.SchoolId,
            SchoolName = school.Name,
            AssignedToUserId = followUp.AssignedToUserId,
            AssignedToUserName = user?.FullName ?? "",
            DueDate = followUp.DueDate,
            Priority = followUp.Priority,
            Status = followUp.Status,
            Title = followUp.Title,
            Notes = followUp.Notes,
            CompletedAtUtc = followUp.CompletedAtUtc,
            CreatedAtUtc = followUp.CreatedAtUtc
        };

        return ApiResponse<FollowUpDto>.Ok(dto, "Follow-up created.");
    }

    public async Task<ApiResponse<FollowUpDto>> UpdateFollowUpAsync(Guid id, UpdateFollowUpRequest request)
    {
        var followUp = await _db.FollowUps.Include(f => f.School).Include(f => f.AssignedToUser).FirstOrDefaultAsync(f => f.Id == id);
        if (followUp == null)
        {
            return ApiResponse<FollowUpDto>.Fail("Follow-up not found.");
        }

        followUp.DueDate = request.DueDate;
        followUp.Priority = request.Priority;
        followUp.Status = request.Status;
        followUp.Title = request.Title.Trim();
        followUp.Notes = request.Notes?.Trim();
        if (request.Status == FollowUpStatus.Completed && followUp.CompletedAtUtc == null)
        {
            followUp.CompletedAtUtc = DateTime.UtcNow;
        }
        else if (request.Status != FollowUpStatus.Completed)
        {
            followUp.CompletedAtUtc = null;
        }
        followUp.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var dto = new FollowUpDto
        {
            Id = followUp.Id,
            SchoolId = followUp.SchoolId,
            SchoolName = followUp.School.Name,
            AssignedToUserId = followUp.AssignedToUserId,
            AssignedToUserName = followUp.AssignedToUser.FullName,
            DueDate = followUp.DueDate,
            Priority = followUp.Priority,
            Status = followUp.Status,
            Title = followUp.Title,
            Notes = followUp.Notes,
            CompletedAtUtc = followUp.CompletedAtUtc,
            CreatedAtUtc = followUp.CreatedAtUtc
        };

        return ApiResponse<FollowUpDto>.Ok(dto, "Follow-up updated.");
    }

    public async Task<ApiResponse<bool>> DeleteFollowUpAsync(Guid id)
    {
        var followUp = await _db.FollowUps.FindAsync(id);
        if (followUp == null)
        {
            return ApiResponse<bool>.Fail("Follow-up not found.");
        }

        _db.FollowUps.Remove(followUp);
        await _db.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "Follow-up deleted.");
    }
}
