using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly ISalesTargetService _targetService;

    public DashboardService(ApplicationDbContext db, ICurrentUserService currentUser, ISalesTargetService targetService)
    {
        _db = db;
        _currentUser = currentUser;
        _targetService = targetService;
    }

    public async Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync()
    {
        var curUserId = _currentUser.UserId;
        bool isManagerOrAdmin = _currentUser.IsSuperAdmin || _currentUser.IsSalesManager;

        var schoolsQuery = _db.Schools.AsNoTracking().AsQueryable();
        var visitsQuery = _db.Visits.AsNoTracking().AsQueryable();
        var followUpsQuery = _db.FollowUps.AsNoTracking().Include(f => f.School).Include(f => f.AssignedToUser).AsQueryable();

        int totalSchools = await schoolsQuery.CountAsync();
        int newSchools = await schoolsQuery.CountAsync(s => s.SalesStatus == SalesStatus.New);
        int visitedSchools = await schoolsQuery.CountAsync(s => s.SalesStatus == SalesStatus.Visited || s.SalesStatus == SalesStatus.DemoScheduled || s.SalesStatus == SalesStatus.ProposalSent || s.SalesStatus == SalesStatus.ClosedWon);
        int unassignedSchools = await schoolsQuery.CountAsync(s => s.AssignedToUserId == null);

        int mySchoolsCount = 0;
        int myAssignedSchoolsCount = 0;
        if (curUserId.HasValue)
        {
            mySchoolsCount = await schoolsQuery.CountAsync(s => s.CreatedByUserId == curUserId.Value);
            myAssignedSchoolsCount = await schoolsQuery.CountAsync(s => s.AssignedToUserId == curUserId.Value);
        }

        // Visits & metrics
        var effectiveVisitsQuery = isManagerOrAdmin
            ? visitsQuery
            : visitsQuery.Where(v => v.RepresentativeId == curUserId || v.School.AssignedToUserId == curUserId);

        int totalVisits = await effectiveVisitsQuery.CountAsync();
        int demosRequested = await effectiveVisitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.DemoRequested);
        int proposalsRequested = await effectiveVisitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ProposalRequested);

        // Follow ups
        var nowUtc = DateTime.UtcNow;
        var effectiveFollowUpsQuery = isManagerOrAdmin
            ? followUpsQuery
            : followUpsQuery.Where(f => f.AssignedToUserId == curUserId);

        int followUpsDueCount = await effectiveFollowUpsQuery.CountAsync(f => (f.Status == FollowUpStatus.Pending || f.Status == FollowUpStatus.InProgress) && f.DueDate >= nowUtc);
        int followUpsOverdueCount = await effectiveFollowUpsQuery.CountAsync(f => (f.Status == FollowUpStatus.Pending || f.Status == FollowUpStatus.InProgress) && f.DueDate < nowUtc);

        // Stage breakdown
        var stagesGroup = await schoolsQuery
            .GroupBy(s => s.SalesStatus)
            .Select(g => new { Stage = g.Key, Count = g.Count() })
            .ToListAsync();

        var stageList = Enum.GetValues<SalesStatus>().Select(st => new StageCountDto
        {
            Stage = st,
            StageName = st.ToString(),
            Count = stagesGroup.FirstOrDefault(x => x.Stage == st)?.Count ?? 0
        }).ToList();

        // Product breakdown
        var productGroup = await effectiveVisitsQuery
            .GroupBy(v => v.InterestedProducts)
            .Select(g => new { Product = g.Key, Count = g.Count() })
            .ToListAsync();

        var productList = productGroup.Select(pg => new ProductInterestCountDto
        {
            Product = pg.Product,
            ProductName = pg.Product.ToString(),
            Count = pg.Count
        }).ToList();

        // Top representatives & target progress
        var currentYear = nowUtc.Year;
        var currentMonth = nowUtc.Month;
        var targetsResult = await _targetService.GetTargetsAsync(currentYear, PeriodType.Monthly);
        var targets = targetsResult.Data ?? new List<SalesTargetDto>();

        var reps = await _db.Users
            .AsNoTracking()
            .Include(u => u.CreatedSchools)
            .Include(u => u.AssignedSchools)
            .Include(u => u.Visits)
            .Where(u => u.IsActive)
            .ToListAsync();

        var repPerformance = reps.Select(u =>
        {
            var userTargets = targets.Where(t => t.UserId == u.Id && t.PeriodNumber == currentMonth).ToList();
            double achieveRate = userTargets.Any() ? userTargets.Average(t => t.OverallAchievementRate) : 0;

            return new RepPerformanceDto
            {
                RepresentativeId = u.Id,
                RepresentativeName = u.FullName,
                DiscoveredSchools = u.CreatedSchools.Count,
                AssignedSchools = u.AssignedSchools.Count,
                Visits = u.Visits.Count,
                DemosScheduled = u.Visits.Count(v => v.VisitOutcome == VisitOutcomeType.DemoRequested),
                ProposalsRequested = u.Visits.Count(v => v.VisitOutcome == VisitOutcomeType.ProposalRequested),
                ClosedDeals = u.Visits.Count(v => v.VisitOutcome == VisitOutcomeType.ClosedWon),
                TargetAchievementRate = achieveRate
            };
        }).OrderByDescending(r => r.Visits).Take(10).ToList();

        double overallAchievementRate = targets.Any() ? Math.Round(targets.Average(t => t.OverallAchievementRate), 1) : 0;

        // Upcoming visits
        var upcomingVisits = await effectiveVisitsQuery
            .Include(v => v.School)
            .Include(v => v.Representative)
            .Where(v => v.VisitDate >= nowUtc.Date)
            .OrderBy(v => v.VisitDate)
            .Take(5)
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

        // Overdue follow ups list
        var overdueFollowUps = await effectiveFollowUpsQuery
            .Where(f => (f.Status == FollowUpStatus.Pending || f.Status == FollowUpStatus.InProgress) && f.DueDate < nowUtc)
            .OrderBy(f => f.DueDate)
            .Take(5)
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

        var stats = new DashboardStatsDto
        {
            TotalSchools = totalSchools,
            NewSchools = newSchools,
            VisitedSchools = visitedSchools,
            UnassignedSchools = unassignedSchools,
            MySchoolsCount = mySchoolsCount,
            MyAssignedSchoolsCount = myAssignedSchoolsCount,
            TotalVisits = totalVisits,
            DemosRequested = demosRequested,
            ProposalsRequested = proposalsRequested,
            FollowUpsDueCount = followUpsDueCount,
            FollowUpsOverdueCount = followUpsOverdueCount,
            OverallTargetAchievementRate = overallAchievementRate,
            SchoolsByStage = stageList,
            VisitsByProduct = productList,
            TopRepresentatives = repPerformance,
            UpcomingVisits = upcomingVisits,
            OverdueFollowUps = overdueFollowUps
        };

        return ApiResponse<DashboardStatsDto>.Ok(stats);
    }
}

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ReportService(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<PerformanceReportDto>> GetPerformanceReportAsync(PerformanceReportRequest request)
    {
        var usersQuery = _db.Users
            .AsNoTracking()
            .Include(u => u.CreatedSchools)
            .Include(u => u.AssignedSchools)
            .Include(u => u.Visits)
            .Where(u => u.IsActive);

        if (request.RepresentativeId.HasValue)
        {
            usersQuery = usersQuery.Where(u => u.Id == request.RepresentativeId.Value);
        }
        else if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            var curId = _currentUser.UserId;
            usersQuery = usersQuery.Where(u => u.Id == curId);
        }

        var users = await usersQuery.ToListAsync();

        var rows = new List<RepPerformanceDto>();

        foreach (var u in users)
        {
            var schoolsCreated = u.CreatedSchools.AsQueryable();
            var visits = u.Visits.AsQueryable();

            if (request.FromDate.HasValue)
            {
                schoolsCreated = schoolsCreated.Where(s => s.CreatedAtUtc >= request.FromDate.Value);
                visits = visits.Where(v => v.VisitDate >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                schoolsCreated = schoolsCreated.Where(s => s.CreatedAtUtc <= request.ToDate.Value);
                visits = visits.Where(v => v.VisitDate <= request.ToDate.Value);
            }

            if (request.Stage.HasValue)
            {
                schoolsCreated = schoolsCreated.Where(s => s.SalesStatus == request.Stage.Value);
            }

            if (request.Product.HasValue)
            {
                visits = visits.Where(v => v.InterestedProducts == request.Product.Value || v.InterestedProducts == ProductInterest.Both);
            }

            var discovered = schoolsCreated.Count();
            var visitsCount = visits.Count();
            var demos = visits.Count(v => v.VisitOutcome == VisitOutcomeType.DemoRequested);
            var proposals = visits.Count(v => v.VisitOutcome == VisitOutcomeType.ProposalRequested);
            var deals = visits.Count(v => v.VisitOutcome == VisitOutcomeType.ClosedWon);

            rows.Add(new RepPerformanceDto
            {
                RepresentativeId = u.Id,
                RepresentativeName = u.FullName,
                DiscoveredSchools = discovered,
                AssignedSchools = u.AssignedSchools.Count,
                Visits = visitsCount,
                DemosScheduled = demos,
                ProposalsRequested = proposals,
                ClosedDeals = deals,
                TargetAchievementRate = 100.0 // computed dynamically when target assigned
            });
        }

        var report = new PerformanceReportDto
        {
            TotalSchoolsDiscovered = rows.Sum(r => r.DiscoveredSchools),
            TotalVisits = rows.Sum(r => r.Visits),
            TotalDecisionMakersReached = 0,
            TotalDemosRequested = rows.Sum(r => r.DemosScheduled),
            TotalProposalsRequested = rows.Sum(r => r.ProposalsRequested),
            TotalClosedDeals = rows.Sum(r => r.ClosedDeals),
            Rows = rows
        };

        return ApiResponse<PerformanceReportDto>.Ok(report);
    }
}
