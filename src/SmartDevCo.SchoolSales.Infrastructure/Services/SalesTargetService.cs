using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public partial class SalesTargetService : ISalesTargetService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public SalesTargetService(ApplicationDbContext db, ICurrentUserService currentUser, IAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<ApiResponse<List<SalesTargetDto>>> GetTargetsAsync(int? year = null, PeriodType? periodType = null, Guid? userId = null)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;

        var query = _db.SalesTargets
            .AsNoTracking()
            .Include(t => t.User)
            .Where(t => t.PeriodYear == targetYear);

        if (periodType.HasValue)
        {
            query = query.Where(t => t.PeriodType == periodType.Value);
        }

        if (userId.HasValue)
        {
            query = query.Where(t => t.UserId == userId.Value);
        }
        else if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            var curId = _currentUser.UserId;
            query = query.Where(t => t.UserId == curId);
        }

        var targets = await query.OrderBy(t => t.PeriodNumber).ToListAsync();

        var result = new List<SalesTargetDto>();
        foreach (var t in targets)
        {
            var (startDate, endDate) = GetPeriodDateRange(t.PeriodType, t.PeriodYear, t.PeriodNumber);

            // Compute actual achievements from DB within period
            var actualNewSchools = await _db.Schools
                .CountAsync(s => s.CreatedByUserId == t.UserId && s.CreatedAtUtc >= startDate && s.CreatedAtUtc <= endDate);

            var visitsQuery = _db.Visits
                .Where(v => v.RepresentativeId == t.UserId && v.VisitDate >= startDate && v.VisitDate <= endDate);

            var actualVisits = await visitsQuery.CountAsync();
            var actualDecisionMakers = await visitsQuery.CountAsync(v => v.DecisionMakerReached);
            var actualDemos = await visitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.DemoRequested);
            var actualProposals = await visitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ProposalRequested);
            var actualDeals = await visitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ClosedWon);

            // Calculate overall achievement rate (allows > 100%, never capped)
            double rate = 0;
            int count = 0;
            if (t.TargetNewSchools > 0) { rate += ((double)actualNewSchools / t.TargetNewSchools) * 100; count++; }
            if (t.TargetVisits > 0) { rate += ((double)actualVisits / t.TargetVisits) * 100; count++; }
            if (t.TargetDecisionMakersReached > 0) { rate += ((double)actualDecisionMakers / t.TargetDecisionMakersReached) * 100; count++; }
            if (t.TargetDemosScheduled > 0) { rate += ((double)actualDemos / t.TargetDemosScheduled) * 100; count++; }
            if (t.TargetProposalsRequested > 0) { rate += ((double)actualProposals / t.TargetProposalsRequested) * 100; count++; }
            if (t.TargetClosedDeals > 0) { rate += ((double)actualDeals / t.TargetClosedDeals) * 100; count++; }

            double avgRate = count > 0 ? Math.Round(rate / count, 1) : 0;

            result.Add(new SalesTargetDto
            {
                Id = t.Id,
                UserId = t.UserId,
                UserName = t.User.FullName,
                PeriodType = t.PeriodType,
                PeriodYear = t.PeriodYear,
                PeriodNumber = t.PeriodNumber,
                TargetNewSchools = t.TargetNewSchools,
                TargetVisits = t.TargetVisits,
                TargetDecisionMakersReached = t.TargetDecisionMakersReached,
                TargetDemosScheduled = t.TargetDemosScheduled,
                TargetProposalsRequested = t.TargetProposalsRequested,
                TargetClosedDeals = t.TargetClosedDeals,
                Notes = t.Notes,

                ActualNewSchools = actualNewSchools,
                ActualVisits = actualVisits,
                ActualDecisionMakersReached = actualDecisionMakers,
                ActualDemosScheduled = actualDemos,
                ActualProposalsRequested = actualProposals,
                ActualClosedDeals = actualDeals,
                OverallAchievementRate = avgRate,
                CreatedAtUtc = t.CreatedAtUtc
            });
        }

        return ApiResponse<List<SalesTargetDto>>.Ok(result);
    }

    public async Task<ApiResponse<SalesTargetDto>> GetTargetByIdAsync(Guid id)
    {
        var target = await _db.SalesTargets.Include(t => t.User).FirstOrDefaultAsync(t => t.Id == id);
        if (target == null)
        {
            return ApiResponse<SalesTargetDto>.Fail("Sales target not found.");
        }

        var (startDate, endDate) = GetPeriodDateRange(target.PeriodType, target.PeriodYear, target.PeriodNumber);

        var actualNewSchools = await _db.Schools
            .CountAsync(s => s.CreatedByUserId == target.UserId && s.CreatedAtUtc >= startDate && s.CreatedAtUtc <= endDate);

        var visitsQuery = _db.Visits
            .Where(v => v.RepresentativeId == target.UserId && v.VisitDate >= startDate && v.VisitDate <= endDate);

        var actualVisits = await visitsQuery.CountAsync();
        var actualDecisionMakers = await visitsQuery.CountAsync(v => v.DecisionMakerReached);
        var actualDemos = await visitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.DemoRequested);
        var actualProposals = await visitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ProposalRequested);
        var actualDeals = await visitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ClosedWon);

        var dto = new SalesTargetDto
        {
            Id = target.Id,
            UserId = target.UserId,
            UserName = target.User.FullName,
            PeriodType = target.PeriodType,
            PeriodYear = target.PeriodYear,
            PeriodNumber = target.PeriodNumber,
            TargetNewSchools = target.TargetNewSchools,
            TargetVisits = target.TargetVisits,
            TargetDecisionMakersReached = target.TargetDecisionMakersReached,
            TargetDemosScheduled = target.TargetDemosScheduled,
            TargetProposalsRequested = target.TargetProposalsRequested,
            TargetClosedDeals = target.TargetClosedDeals,
            Notes = target.Notes,

            ActualNewSchools = actualNewSchools,
            ActualVisits = actualVisits,
            ActualDecisionMakersReached = actualDecisionMakers,
            ActualDemosScheduled = actualDemos,
            ActualProposalsRequested = actualProposals,
            ActualClosedDeals = actualDeals,
            CreatedAtUtc = target.CreatedAtUtc
        };

        return ApiResponse<SalesTargetDto>.Ok(dto);
    }

    public async Task<ApiResponse<SalesTargetDto>> CreateTargetAsync(CreateSalesTargetRequest request)
    {
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            return ApiResponse<SalesTargetDto>.Fail("Only administrators or managers can set sales targets.");
        }

        // Support Team-Wide Target bulk setting
        if (request.IsTeamTarget || !request.UserId.HasValue || request.UserId == Guid.Empty)
        {
            var reps = await _db.Users
                .Where(u => u.IsActive && u.UserRoles.Any(ur => ur.Role.Name == UserRoleType.SalesRepresentative.ToString() || ur.Role.Name == UserRoleType.SalesManager.ToString()))
                .ToListAsync();

            if (!reps.Any())
            {
                var curUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId);
                if (curUser != null) reps.Add(curUser);
            }

            SalesTarget? lastTarget = null;
            foreach (var rep in reps)
            {
                var existingRepTarget = await _db.SalesTargets.FirstOrDefaultAsync(t =>
                    t.UserId == rep.Id &&
                    t.PeriodType == request.PeriodType &&
                    t.PeriodYear == request.PeriodYear &&
                    t.PeriodNumber == request.PeriodNumber);

                if (existingRepTarget != null)
                {
                    existingRepTarget.TargetNewSchools = request.TargetNewSchools;
                    existingRepTarget.TargetVisits = request.TargetVisits;
                    existingRepTarget.TargetDecisionMakersReached = request.TargetDecisionMakersReached;
                    existingRepTarget.TargetDemosScheduled = request.TargetDemosScheduled;
                    existingRepTarget.TargetProposalsRequested = request.TargetProposalsRequested;
                    existingRepTarget.TargetClosedDeals = request.TargetClosedDeals;
                    existingRepTarget.Notes = request.Notes?.Trim();
                    existingRepTarget.UpdatedAtUtc = DateTime.UtcNow;
                    lastTarget = existingRepTarget;
                }
                else
                {
                    var newT = new SalesTarget
                    {
                        UserId = rep.Id,
                        PeriodType = request.PeriodType,
                        PeriodYear = request.PeriodYear,
                        PeriodNumber = request.PeriodNumber,
                        TargetNewSchools = request.TargetNewSchools,
                        TargetVisits = request.TargetVisits,
                        TargetDecisionMakersReached = request.TargetDecisionMakersReached,
                        TargetDemosScheduled = request.TargetDemosScheduled,
                        TargetProposalsRequested = request.TargetProposalsRequested,
                        TargetClosedDeals = request.TargetClosedDeals,
                        Notes = request.Notes?.Trim(),
                        CreatedByUserId = _currentUser.UserId ?? Guid.Empty
                    };
                    _db.SalesTargets.Add(newT);
                    lastTarget = newT;
                }
            }

            await _db.SaveChangesAsync();
            return lastTarget != null ? await GetTargetByIdAsync(lastTarget.Id) : ApiResponse<SalesTargetDto>.Ok(new SalesTargetDto());
        }

        // Individual representative target upsert
        var targetUserId = request.UserId.Value;
        var existing = await _db.SalesTargets.FirstOrDefaultAsync(t =>
            t.UserId == targetUserId &&
            t.PeriodType == request.PeriodType &&
            t.PeriodYear == request.PeriodYear &&
            t.PeriodNumber == request.PeriodNumber);

        if (existing != null)
        {
            existing.TargetNewSchools = request.TargetNewSchools;
            existing.TargetVisits = request.TargetVisits;
            existing.TargetDecisionMakersReached = request.TargetDecisionMakersReached;
            existing.TargetDemosScheduled = request.TargetDemosScheduled;
            existing.TargetProposalsRequested = request.TargetProposalsRequested;
            existing.TargetClosedDeals = request.TargetClosedDeals;
            existing.Notes = request.Notes?.Trim();
            existing.UpdatedAtUtc = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            await _audit.LogAsync("UpdateSalesTarget", "SalesTarget", existing.Id.ToString(), new { existing.UserId, existing.PeriodYear, existing.PeriodNumber });
            return await GetTargetByIdAsync(existing.Id);
        }

        var target = new SalesTarget
        {
            UserId = targetUserId,
            PeriodType = request.PeriodType,
            PeriodYear = request.PeriodYear,
            PeriodNumber = request.PeriodNumber,
            TargetNewSchools = request.TargetNewSchools,
            TargetVisits = request.TargetVisits,
            TargetDecisionMakersReached = request.TargetDecisionMakersReached,
            TargetDemosScheduled = request.TargetDemosScheduled,
            TargetProposalsRequested = request.TargetProposalsRequested,
            TargetClosedDeals = request.TargetClosedDeals,
            Notes = request.Notes?.Trim(),
            CreatedByUserId = _currentUser.UserId ?? Guid.Empty
        };

        _db.SalesTargets.Add(target);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CreateSalesTarget", "SalesTarget", target.Id.ToString(), new { target.UserId, target.PeriodYear, target.PeriodNumber });

        return await GetTargetByIdAsync(target.Id);
    }

    public async Task<ApiResponse<SalesTargetDto>> UpdateTargetAsync(Guid id, UpdateSalesTargetRequest request)
    {
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            return ApiResponse<SalesTargetDto>.Fail("Only administrators or managers can update sales targets.");
        }

        var target = await _db.SalesTargets.FindAsync(id);
        if (target == null)
        {
            return ApiResponse<SalesTargetDto>.Fail("Target not found.");
        }

        target.TargetNewSchools = request.TargetNewSchools;
        target.TargetVisits = request.TargetVisits;
        target.TargetDecisionMakersReached = request.TargetDecisionMakersReached;
        target.TargetDemosScheduled = request.TargetDemosScheduled;
        target.TargetProposalsRequested = request.TargetProposalsRequested;
        target.TargetClosedDeals = request.TargetClosedDeals;
        target.Notes = request.Notes?.Trim();
        target.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UpdateSalesTarget", "SalesTarget", id.ToString());

        return await GetTargetByIdAsync(id);
    }

    public async Task<ApiResponse<bool>> DeleteTargetAsync(Guid id)
    {
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            return ApiResponse<bool>.Fail("Only administrators or managers can delete sales targets.");
        }

        var target = await _db.SalesTargets.FindAsync(id);
        if (target == null)
        {
            return ApiResponse<bool>.Fail("Target not found.");
        }

        _db.SalesTargets.Remove(target);
        await _db.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "Target deleted.");
    }

    private static (DateTime start, DateTime end) GetPeriodDateRange(PeriodType type, int year, int periodNumber)
    {
        if (type == PeriodType.Monthly)
        {
            int month = Math.Clamp(periodNumber, 1, 12);
            var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var end = start.AddMonths(1).AddTicks(-1);
            return (start, end);
        }
        else
        {
            int quarter = Math.Clamp(periodNumber, 1, 4);
            int startMonth = ((quarter - 1) * 3) + 1;
            var start = new DateTime(year, startMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            var end = start.AddMonths(3).AddTicks(-1);
            return (start, end);
        }
    }
}
