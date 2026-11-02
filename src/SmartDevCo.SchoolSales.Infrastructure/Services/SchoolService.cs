using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class SchoolService : ISchoolService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public SchoolService(ApplicationDbContext db, ICurrentUserService currentUser, IAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    private IQueryable<School> ApplyDataVisibility(IQueryable<School> query)
    {
        if (_currentUser.IsSuperAdmin || _currentUser.IsSalesManager)
        {
            return query;
        }

        var currentUserId = _currentUser.UserId;
        if (currentUserId == null)
        {
            return query.Where(s => false);
        }

        // Sales representative sees only schools they created OR are assigned to
        return query.Where(s => s.CreatedByUserId == currentUserId || s.AssignedToUserId == currentUserId);
    }

    public async Task<ApiResponse<PagedResult<SchoolDto>>> GetSchoolsAsync(SchoolFilterRequest filter)
    {
        var query = _db.Schools
            .AsNoTracking()
            .Include(s => s.CreatedByUser)
            .Include(s => s.AssignedToUser)
            .Include(s => s.Contacts)
            .Include(s => s.Visits)
            .Include(s => s.Activities)
            .Include(s => s.FollowUps)
            .AsQueryable();

        query = ApplyDataVisibility(query);

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(search)
                                  || s.City.ToLower().Contains(search)
                                  || (s.Phone != null && s.Phone.Contains(search))
                                  || (s.Email != null && s.Email.ToLower().Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(filter.City))
        {
            query = query.Where(s => s.City.ToLower() == filter.City.Trim().ToLower());
        }

        if (filter.SchoolType.HasValue)
        {
            query = query.Where(s => s.SchoolType == filter.SchoolType.Value);
        }

        if (filter.SalesStatus.HasValue)
        {
            query = query.Where(s => s.SalesStatus == filter.SalesStatus.Value);
        }

        if (filter.Source.HasValue)
        {
            query = query.Where(s => s.Source == filter.Source.Value);
        }

        if (filter.AssignedToUserId.HasValue)
        {
            query = query.Where(s => s.AssignedToUserId == filter.AssignedToUserId.Value);
        }

        if (filter.CreatedByUserId.HasValue)
        {
            query = query.Where(s => s.CreatedByUserId == filter.CreatedByUserId.Value);
        }

        if (filter.IsUnassigned == true)
        {
            query = query.Where(s => s.AssignedToUserId == null);
        }

        var totalCount = await query.CountAsync();

        var pageIndex = filter.PageIndex <= 0 ? 1 : filter.PageIndex;
        var pageSize = filter.PageSize <= 0 ? 20 : filter.PageSize;

        var items = await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SchoolDto
            {
                Id = s.Id,
                Name = s.Name,
                Phone = s.Phone,
                Email = s.Email,
                Website = s.Website,
                Address = s.Address,
                City = s.City,
                District = s.District,
                SchoolType = s.SchoolType,
                Source = s.Source,
                SalesStatus = s.SalesStatus,
                GeneralNotes = s.GeneralNotes,
                CreatedByUserId = s.CreatedByUserId,
                CreatedByUserName = s.CreatedByUser.FullName,
                AssignedToUserId = s.AssignedToUserId,
                AssignedToUserName = s.AssignedToUser != null ? s.AssignedToUser.FullName : null,
                ContactsCount = s.Contacts.Count,
                VisitsCount = s.Visits.Count,
                ActivitiesCount = s.Activities.Count,
                LastVisitDate = s.Visits.OrderByDescending(v => v.VisitDate).Select(v => (DateTime?)v.VisitDate).FirstOrDefault(),
                NextFollowUpDate = s.FollowUps.Where(f => f.Status == FollowUpStatus.Pending).OrderBy(f => f.DueDate).Select(f => (DateTime?)f.DueDate).FirstOrDefault(),
                CreatedAtUtc = s.CreatedAtUtc,
                UpdatedAtUtc = s.UpdatedAtUtc
            })
            .ToListAsync();

        var result = new PagedResult<SchoolDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageIndex = pageIndex,
            PageSize = pageSize
        };

        return ApiResponse<PagedResult<SchoolDto>>.Ok(result);
    }

    public async Task<ApiResponse<SchoolDetailDto>> GetSchoolByIdAsync(Guid id)
    {
        var query = _db.Schools
            .AsNoTracking()
            .Include(s => s.CreatedByUser)
            .Include(s => s.AssignedToUser)
            .Include(s => s.Contacts)
            .Include(s => s.Assignments)
                .ThenInclude(a => a.AssignedToUser)
            .Include(s => s.Assignments)
                .ThenInclude(a => a.AssignedByUser)
            .Include(s => s.Visits)
                .ThenInclude(v => v.Representative)
            .Include(s => s.Activities)
                .ThenInclude(a => a.User)
            .Include(s => s.FollowUps)
                .ThenInclude(f => f.AssignedToUser)
            .Where(s => s.Id == id);

        query = ApplyDataVisibility(query);

        var school = await query.FirstOrDefaultAsync();
        if (school == null)
        {
            return ApiResponse<SchoolDetailDto>.Fail("School not found or you do not have permission to view it.");
        }

        var detail = new SchoolDetailDto
        {
            Id = school.Id,
            Name = school.Name,
            Phone = school.Phone,
            Email = school.Email,
            Website = school.Website,
            Address = school.Address,
            City = school.City,
            District = school.District,
            SchoolType = school.SchoolType,
            Source = school.Source,
            SalesStatus = school.SalesStatus,
            GeneralNotes = school.GeneralNotes,
            CreatedByUserId = school.CreatedByUserId,
            CreatedByUserName = school.CreatedByUser.FullName,
            AssignedToUserId = school.AssignedToUserId,
            AssignedToUserName = school.AssignedToUser?.FullName,
            ContactsCount = school.Contacts.Count,
            VisitsCount = school.Visits.Count,
            ActivitiesCount = school.Activities.Count,
            LastVisitDate = school.Visits.OrderByDescending(v => v.VisitDate).Select(v => (DateTime?)v.VisitDate).FirstOrDefault(),
            NextFollowUpDate = school.FollowUps.Where(f => f.Status == FollowUpStatus.Pending).OrderBy(f => f.DueDate).Select(f => (DateTime?)f.DueDate).FirstOrDefault(),
            CreatedAtUtc = school.CreatedAtUtc,
            UpdatedAtUtc = school.UpdatedAtUtc,

            Contacts = school.Contacts.Select(c => new SchoolContactDto
            {
                Id = c.Id,
                SchoolId = c.SchoolId,
                FullName = c.FullName,
                JobTitle = c.JobTitle,
                Phone = c.Phone,
                Email = c.Email,
                IsDecisionMaker = c.IsDecisionMaker,
                IsPrimaryContact = c.IsPrimaryContact,
                ContactNotes = c.ContactNotes,
                CreatedAtUtc = c.CreatedAtUtc
            }).OrderByDescending(c => c.IsPrimaryContact).ThenBy(c => c.FullName).ToList(),

            AssignmentHistory = school.Assignments.OrderByDescending(a => a.AssignedAtUtc).Select(a => new SchoolAssignmentHistoryDto
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
            }).ToList(),

            RecentVisits = school.Visits.OrderByDescending(v => v.VisitDate).Select(v => new VisitSummaryDto
            {
                Id = v.Id,
                SchoolId = v.SchoolId,
                RepresentativeName = v.Representative.FullName,
                VisitDate = v.VisitDate,
                ContactPerson = v.ContactPerson,
                DecisionMakerReached = v.DecisionMakerReached,
                InterestedProducts = v.InterestedProducts,
                VisitOutcome = v.VisitOutcome,
                NextAction = v.NextAction,
                NextFollowUpDate = v.NextFollowUpDate,
                CreatedAtUtc = v.CreatedAtUtc
            }).Take(10).ToList(),

            RecentActivities = school.Activities.OrderByDescending(a => a.CreatedAtUtc).Select(a => new ActivityDto
            {
                Id = a.Id,
                SchoolId = a.SchoolId,
                SchoolName = school.Name,
                UserId = a.UserId,
                UserName = a.User.FullName,
                Type = a.Type,
                Subject = a.Subject,
                Description = a.Description,
                DueDateUtc = a.DueDateUtc,
                CompletedAtUtc = a.CompletedAtUtc,
                IsCompleted = a.IsCompleted,
                CreatedAtUtc = a.CreatedAtUtc
            }).Take(10).ToList(),

            PendingFollowUps = school.FollowUps.Where(f => f.Status == FollowUpStatus.Pending || f.Status == FollowUpStatus.InProgress)
                .OrderBy(f => f.DueDate)
                .Select(f => new FollowUpDto
                {
                    Id = f.Id,
                    SchoolId = f.SchoolId,
                    SchoolName = school.Name,
                    AssignedToUserId = f.AssignedToUserId,
                    AssignedToUserName = f.AssignedToUser.FullName,
                    DueDate = f.DueDate,
                    Priority = f.Priority,
                    Status = f.Status,
                    Title = f.Title,
                    Notes = f.Notes,
                    CompletedAtUtc = f.CompletedAtUtc,
                    CreatedAtUtc = f.CreatedAtUtc
                }).ToList()
        };

        return ApiResponse<SchoolDetailDto>.Ok(detail);
    }

    public async Task<ApiResponse<SchoolDto>> CreateSchoolAsync(CreateSchoolRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.City))
        {
            return ApiResponse<SchoolDto>.Fail("School name and city are required.");
        }

        // Prevent accidental duplicates
        var trimmedName = request.Name.Trim().ToLower();
        var trimmedCity = request.City.Trim().ToLower();
        var isDuplicate = await _db.Schools.AnyAsync(s => s.Name.ToLower() == trimmedName && s.City.ToLower() == trimmedCity);
        if (isDuplicate)
        {
            return ApiResponse<SchoolDto>.Fail($"A school with the name '{request.Name}' in '{request.City}' already exists.");
        }

        var currentUserId = _currentUser.UserId;
        if (currentUserId == null)
        {
            return ApiResponse<SchoolDto>.Fail("Unauthorized.");
        }

        // Creator is the current user
        var school = new School
        {
            Name = request.Name.Trim(),
            Phone = request.Phone?.Trim(),
            Email = request.Email?.Trim(),
            Website = request.Website?.Trim(),
            Address = request.Address?.Trim(),
            City = request.City.Trim(),
            District = request.District?.Trim(),
            SchoolType = request.SchoolType,
            Source = request.Source,
            SalesStatus = request.SalesStatus,
            GeneralNotes = request.GeneralNotes?.Trim(),
            CreatedByUserId = currentUserId.Value,
            AssignedToUserId = request.AssignedToUserId ?? currentUserId.Value
        };

        if (request.InitialContacts != null && request.InitialContacts.Any())
        {
            foreach (var c in request.InitialContacts)
            {
                school.Contacts.Add(new SchoolContact
                {
                    FullName = c.FullName.Trim(),
                    JobTitle = c.JobTitle.Trim(),
                    Phone = c.Phone.Trim(),
                    Email = c.Email?.Trim(),
                    IsDecisionMaker = c.IsDecisionMaker,
                    IsPrimaryContact = c.IsPrimaryContact,
                    ContactNotes = c.ContactNotes?.Trim()
                });
            }
        }

        // If assigned right away, log assignment
        if (school.AssignedToUserId.HasValue)
        {
            school.Assignments.Add(new SchoolAssignment
            {
                AssignedToUserId = school.AssignedToUserId.Value,
                AssignedByUserId = currentUserId.Value,
                AssignedAtUtc = DateTime.UtcNow,
                Notes = "Initial assignment upon school creation"
            });
        }

        _db.Schools.Add(school);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CreateSchool", "School", school.Id.ToString(), new { school.Name, school.City });

        var createdDto = (await GetSchoolByIdAsync(school.Id)).Data!;
        return ApiResponse<SchoolDto>.Ok(createdDto, "School created successfully.");
    }

    public async Task<ApiResponse<SchoolDto>> UpdateSchoolAsync(Guid id, UpdateSchoolRequest request)
    {
        var school = await _db.Schools.FirstOrDefaultAsync(s => s.Id == id);
        if (school == null)
        {
            return ApiResponse<SchoolDto>.Fail("School not found.");
        }

        // Check permission: Admin, Manager, or Employee who created or is assigned to the school
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            var isCreator = school.CreatedByUserId != null && school.CreatedByUserId != Guid.Empty && school.CreatedByUserId == _currentUser.UserId;
            var isAssigned = school.AssignedToUserId != null && school.AssignedToUserId != Guid.Empty && school.AssignedToUserId == _currentUser.UserId;
            var isUnclaimed = school.CreatedByUserId == null || school.CreatedByUserId == Guid.Empty;

            if (!isCreator && !isAssigned && !isUnclaimed)
            {
                return ApiResponse<SchoolDto>.Fail("You do not have permission to update this school.");
            }
        }

        // Duplicate check if name or city changed
        var trimmedName = request.Name.Trim().ToLower();
        var trimmedCity = request.City.Trim().ToLower();
        if (school.Name.ToLower() != trimmedName || school.City.ToLower() != trimmedCity)
        {
            var isDuplicate = await _db.Schools.AnyAsync(s => s.Id != id && s.Name.ToLower() == trimmedName && s.City.ToLower() == trimmedCity);
            if (isDuplicate)
            {
                return ApiResponse<SchoolDto>.Fail($"Another school named '{request.Name}' in '{request.City}' already exists.");
            }
        }

        school.Name = request.Name.Trim();
        school.Phone = request.Phone?.Trim();
        school.Email = request.Email?.Trim();
        school.Website = request.Website?.Trim();
        school.Address = request.Address?.Trim();
        school.City = request.City.Trim();
        school.District = request.District?.Trim();
        school.SchoolType = request.SchoolType;
        school.Source = request.Source;
        school.SalesStatus = request.SalesStatus;
        school.GeneralNotes = request.GeneralNotes?.Trim();
        school.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UpdateSchool", "School", school.Id.ToString(), new { school.Name, school.SalesStatus });

        var updatedDto = (await GetSchoolByIdAsync(school.Id)).Data!;
        return ApiResponse<SchoolDto>.Ok(updatedDto, "School updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteSchoolAsync(Guid id)
    {
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            return ApiResponse<bool>.Fail("Only administrators or managers can delete a school.");
        }

        var school = await _db.Schools.FirstOrDefaultAsync(s => s.Id == id);
        if (school == null)
        {
            return ApiResponse<bool>.Fail("School not found.");
        }

        _db.Schools.Remove(school);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("DeleteSchool", "School", id.ToString(), new { school.Name });
        return ApiResponse<bool>.Ok(true, "School deleted successfully.");
    }
}
