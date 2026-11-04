using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class VisitService : IVisitService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public VisitService(ApplicationDbContext db, ICurrentUserService currentUser, IAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<ApiResponse<PagedResult<VisitSummaryDto>>> GetVisitsAsync(VisitFilterRequest filter)
    {
        var query = _db.Visits
            .AsNoTracking()
            .Include(v => v.School)
            .Include(v => v.Representative)
            .AsQueryable();

        // RBAC: Representative sees only their visits or assigned schools
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            var userId = _currentUser.UserId;
            query = query.Where(v => v.RepresentativeId == userId || v.School.AssignedToUserId == userId || v.School.CreatedByUserId == userId);
        }

        if (filter.SchoolId.HasValue)
        {
            query = query.Where(v => v.SchoolId == filter.SchoolId.Value);
        }

        if (filter.RepresentativeId.HasValue)
        {
            query = query.Where(v => v.RepresentativeId == filter.RepresentativeId.Value);
        }

        if (filter.Outcome.HasValue)
        {
            query = query.Where(v => v.VisitOutcome == filter.Outcome.Value);
        }

        if (filter.Product.HasValue)
        {
            query = query.Where(v => v.InterestedProducts == filter.Product.Value);
        }

        if (filter.FromDate.HasValue)
        {
            var fromUtc = filter.FromDate.Value.Kind == DateTimeKind.Utc 
                ? filter.FromDate.Value 
                : DateTime.SpecifyKind(filter.FromDate.Value, DateTimeKind.Utc);
            query = query.Where(v => v.VisitDate >= fromUtc);
        }

        if (filter.ToDate.HasValue)
        {
            var toUtc = filter.ToDate.Value.Kind == DateTimeKind.Utc 
                ? filter.ToDate.Value 
                : DateTime.SpecifyKind(filter.ToDate.Value, DateTimeKind.Utc);
            query = query.Where(v => v.VisitDate <= toUtc);
        }

        var totalCount = await query.CountAsync();
        var pageIndex = filter.PageIndex <= 0 ? 1 : filter.PageIndex;
        var pageSize = filter.PageSize <= 0 ? 20 : filter.PageSize;

        var items = await query
            .OrderByDescending(v => v.VisitDate)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(v => new VisitSummaryDto
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
            })
            .ToListAsync();

        return ApiResponse<PagedResult<VisitSummaryDto>>.Ok(new PagedResult<VisitSummaryDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageIndex = pageIndex,
            PageSize = pageSize
        });
    }

    public async Task<ApiResponse<VisitDto>> GetVisitByIdAsync(Guid id)
    {
        var visit = await _db.Visits
            .AsNoTracking()
            .Include(v => v.School)
            .Include(v => v.Representative)
            .Include(v => v.Answers)
                .ThenInclude(a => a.QuestionTemplate)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (visit == null)
        {
            return ApiResponse<VisitDto>.Fail("Visit not found.");
        }

        var dto = new VisitDto
        {
            Id = visit.Id,
            SchoolId = visit.SchoolId,
            SchoolName = visit.School.Name,
            RepresentativeId = visit.RepresentativeId,
            RepresentativeName = visit.Representative.FullName,
            VisitDate = visit.VisitDate,
            ContactPerson = visit.ContactPerson,
            ContactPosition = visit.ContactPosition,
            DecisionMakerReached = visit.DecisionMakerReached,
            InterestedProducts = visit.InterestedProducts,
            VisitOutcome = visit.VisitOutcome,
            Notes = visit.Notes,
            NextAction = visit.NextAction,
            NextFollowUpDate = visit.NextFollowUpDate,
            CreatedAtUtc = visit.CreatedAtUtc,
            Answers = visit.Answers.Select(a => new VisitAnswerDto
            {
                Id = a.Id,
                VisitId = a.VisitId,
                SchoolId = a.SchoolId,
                QuestionTemplateId = a.QuestionTemplateId,
                QuestionSnapshotAr = a.QuestionSnapshotAr,
                QuestionSnapshotEn = a.QuestionSnapshotEn,
                AnswerValue = a.AnswerValue,
                CreatedAtUtc = a.CreatedAtUtc
            }).ToList()
        };

        return ApiResponse<VisitDto>.Ok(dto);
    }

    public async Task<ApiResponse<VisitDto>> CreateVisitAsync(CreateVisitRequest request)
    {
        var school = await _db.Schools.FirstOrDefaultAsync(s => s.Id == request.SchoolId);
        if (school == null)
        {
            return ApiResponse<VisitDto>.Fail("School not found.");
        }

        var repId = _currentUser.UserId;
        if (!repId.HasValue || repId == Guid.Empty)
        {
            repId = (school.AssignedToUserId.HasValue && school.AssignedToUserId != Guid.Empty)
                ? school.AssignedToUserId
                : (school.CreatedByUserId != Guid.Empty ? school.CreatedByUserId : null);
        }

        if (!repId.HasValue || repId == Guid.Empty)
        {
            var defaultUser = await _db.Users.OrderBy(u => u.CreatedAtUtc).FirstOrDefaultAsync();
            if (defaultUser != null)
            {
                repId = defaultUser.Id;
            }
            else
            {
                return ApiResponse<VisitDto>.Fail("No representative user found to associate with this visit.");
            }
        }

        var visitDateUtc = request.VisitDate.Kind == DateTimeKind.Utc
            ? request.VisitDate
            : DateTime.SpecifyKind(request.VisitDate, DateTimeKind.Utc);

        DateTime? nextFollowUpUtc = null;
        if (request.NextFollowUpDate.HasValue)
        {
            nextFollowUpUtc = request.NextFollowUpDate.Value.Kind == DateTimeKind.Utc
                ? request.NextFollowUpDate.Value
                : DateTime.SpecifyKind(request.NextFollowUpDate.Value, DateTimeKind.Utc);
        }

        var visit = new Visit
        {
            SchoolId = school.Id,
            RepresentativeId = repId.Value,
            VisitDate = visitDateUtc,
            ContactPerson = request.ContactPerson.Trim(),
            ContactPosition = request.ContactPosition?.Trim(),
            DecisionMakerReached = request.DecisionMakerReached,
            InterestedProducts = request.InterestedProducts,
            VisitOutcome = request.VisitOutcome,
            Notes = request.Notes?.Trim(),
            NextAction = request.NextAction?.Trim(),
            NextFollowUpDate = nextFollowUpUtc
        };

        // Attach discovery question answers with historical snapshots
        if (request.Answers != null && request.Answers.Any())
        {
            var questionIds = request.Answers.Select(a => a.QuestionTemplateId).ToList();
            var templates = await _db.QuestionTemplates.Where(q => questionIds.Contains(q.Id)).ToDictionaryAsync(q => q.Id);

            foreach (var ans in request.Answers)
            {
                if (templates.TryGetValue(ans.QuestionTemplateId, out var template))
                {
                    visit.Answers.Add(new VisitAnswer
                    {
                        SchoolId = school.Id,
                        QuestionTemplateId = template.Id,
                        QuestionSnapshotAr = template.QuestionAr,
                        QuestionSnapshotEn = template.QuestionEn,
                        AnswerValue = ans.AnswerValue ?? string.Empty
                    });
                }
            }
        }

        // Auto update school sales status
        switch (request.VisitOutcome)
        {
            case VisitOutcomeType.ClosedWon:
                school.SalesStatus = SalesStatus.ClosedWon;
                break;
            case VisitOutcomeType.ClosedLost:
                school.SalesStatus = SalesStatus.ClosedLost;
                break;
            case VisitOutcomeType.DemoRequested:
                school.SalesStatus = SalesStatus.DemoScheduled;
                break;
            case VisitOutcomeType.ProposalRequested:
                school.SalesStatus = SalesStatus.ProposalSent;
                break;
            case VisitOutcomeType.MeetingScheduled:
                school.SalesStatus = SalesStatus.Negotiation;
                break;
            default:
                if (school.SalesStatus == SalesStatus.New || school.SalesStatus == SalesStatus.Assigned || school.SalesStatus == SalesStatus.VisitScheduled)
                {
                    school.SalesStatus = SalesStatus.Visited;
                }
                break;
        }
        school.UpdatedAtUtc = DateTime.UtcNow;

        // Auto create follow-up if next follow-up date is provided
        if (nextFollowUpUtc.HasValue)
        {
            _db.FollowUps.Add(new FollowUp
            {
                SchoolId = school.Id,
                AssignedToUserId = repId.Value,
                DueDate = nextFollowUpUtc.Value,
                Priority = FollowUpPriority.High,
                Status = FollowUpStatus.Pending,
                Title = string.IsNullOrWhiteSpace(request.NextAction) ? $"Follow-up after visit to {school.Name}" : request.NextAction,
                Notes = request.Notes
            });
        }

        // Add activity record
        _db.Activities.Add(new Activity
        {
            SchoolId = school.Id,
            UserId = repId.Value,
            Type = ActivityType.Visit,
            Subject = $"Visit with {request.ContactPerson} ({request.VisitOutcome})",
            Description = request.Notes,
            CompletedAtUtc = visitDateUtc,
            IsCompleted = true
        });

        _db.Visits.Add(visit);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CreateVisit", "Visit", visit.Id.ToString(), new
        {
            visit.SchoolId,
            SchoolName = school.Name,
            visit.VisitOutcome,
            visit.InterestedProducts
        });

        var createdDto = (await GetVisitByIdAsync(visit.Id)).Data!;
        return ApiResponse<VisitDto>.Ok(createdDto, "Visit report recorded successfully.");
    }

    public async Task<ApiResponse<VisitDto>> UpdateVisitAsync(Guid id, UpdateVisitRequest request)
    {
        var visit = await _db.Visits.Include(v => v.School).FirstOrDefaultAsync(v => v.Id == id);
        if (visit == null)
        {
            return ApiResponse<VisitDto>.Fail("Visit not found.");
        }

        var visitDateUtc = request.VisitDate.Kind == DateTimeKind.Utc
            ? request.VisitDate
            : DateTime.SpecifyKind(request.VisitDate, DateTimeKind.Utc);

        DateTime? nextFollowUpUtc = null;
        if (request.NextFollowUpDate.HasValue)
        {
            nextFollowUpUtc = request.NextFollowUpDate.Value.Kind == DateTimeKind.Utc
                ? request.NextFollowUpDate.Value
                : DateTime.SpecifyKind(request.NextFollowUpDate.Value, DateTimeKind.Utc);
        }

        visit.VisitDate = visitDateUtc;
        visit.ContactPerson = request.ContactPerson.Trim();
        visit.ContactPosition = request.ContactPosition?.Trim();
        visit.DecisionMakerReached = request.DecisionMakerReached;
        visit.InterestedProducts = request.InterestedProducts;
        visit.VisitOutcome = request.VisitOutcome;
        visit.Notes = request.Notes?.Trim();
        visit.NextAction = request.NextAction?.Trim();
        visit.NextFollowUpDate = nextFollowUpUtc;
        visit.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UpdateVisit", "Visit", id.ToString(), new { visit.VisitOutcome });

        var updatedDto = (await GetVisitByIdAsync(visit.Id)).Data!;
        return ApiResponse<VisitDto>.Ok(updatedDto, "Visit report updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteVisitAsync(Guid id)
    {
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            return ApiResponse<bool>.Fail("Only administrators or managers can delete visit records.");
        }

        var visit = await _db.Visits.FindAsync(id);
        if (visit == null)
        {
            return ApiResponse<bool>.Fail("Visit not found.");
        }

        _db.Visits.Remove(visit);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("DeleteVisit", "Visit", id.ToString());
        return ApiResponse<bool>.Ok(true, "Visit report deleted successfully.");
    }
}
