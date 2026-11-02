using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public partial class SalesTargetService
{
    private static readonly string[] ArabicMonthNames =
    {
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    };

    private static readonly string[] EnglishMonthNames =
    {
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    };

    public async Task<ApiResponse<SalesPerformanceDashboardDto>> GetSalesPerformanceDashboardAsync(
        int? year = null,
        int? month = null,
        Guid? repId = null,
        ProductInterest? product = null)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var targetMonth = month ?? DateTime.UtcNow.Month;
        if (targetMonth < 1) targetMonth = 1;
        if (targetMonth > 12) targetMonth = 12;

        var startDate = new DateTime(targetYear, targetMonth, 1, 0, 0, 0, DateTimeKind.Utc);
        var endDate = startDate.AddMonths(1).AddTicks(-1);

        var prevStartDate = startDate.AddMonths(-1);
        var prevEndDate = startDate.AddTicks(-1);

        // Security / permission check: sales reps can only view their own data if not admin/manager
        if (!_currentUser.IsSuperAdmin && !_currentUser.IsSalesManager)
        {
            repId = _currentUser.UserId;
        }

        // 1. Fetch configured Target for this period
        var targetQuery = _db.SalesTargets.AsNoTracking().Where(t =>
            t.PeriodType == PeriodType.Monthly &&
            t.PeriodYear == targetYear &&
            t.PeriodNumber == targetMonth);

        if (repId.HasValue)
        {
            targetQuery = targetQuery.Where(t => t.UserId == repId.Value);
        }

        var targetsList = await targetQuery.ToListAsync();

        int targetSchools = 10;
        int targetVisits = 20;
        int targetDemos = 5;
        int targetProposals = 4;
        int targetClosed = 2;

        if (targetsList.Any())
        {
            if (repId.HasValue)
            {
                var t = targetsList.First();
                targetSchools = t.TargetNewSchools;
                targetVisits = t.TargetVisits;
                targetDemos = t.TargetDemosScheduled;
                targetProposals = t.TargetProposalsRequested;
                targetClosed = t.TargetClosedDeals;
            }
            else
            {
                targetSchools = targetsList.Sum(t => t.TargetNewSchools);
                targetVisits = targetsList.Sum(t => t.TargetVisits);
                targetDemos = targetsList.Sum(t => t.TargetDemosScheduled);
                targetProposals = targetsList.Sum(t => t.TargetProposalsRequested);
                targetClosed = targetsList.Sum(t => t.TargetClosedDeals);

                if (targetSchools <= 0) targetSchools = 10;
                if (targetVisits <= 0) targetVisits = 20;
                if (targetDemos <= 0) targetDemos = 5;
                if (targetProposals <= 0) targetProposals = 4;
                if (targetClosed <= 0) targetClosed = 2;
            }
        }

        // 2. Compute Actual Achievements for Primary 5 KPIs
        // A. Schools Discovered in month
        var schoolsPeriodQuery = _db.Schools.AsNoTracking().Where(s => s.CreatedAtUtc >= startDate && s.CreatedAtUtc <= endDate);
        var prevSchoolsPeriodQuery = _db.Schools.AsNoTracking().Where(s => s.CreatedAtUtc >= prevStartDate && s.CreatedAtUtc <= prevEndDate);
        if (repId.HasValue)
        {
            schoolsPeriodQuery = schoolsPeriodQuery.Where(s => s.CreatedByUserId == repId.Value || s.AssignedToUserId == repId.Value);
            prevSchoolsPeriodQuery = prevSchoolsPeriodQuery.Where(s => s.CreatedByUserId == repId.Value || s.AssignedToUserId == repId.Value);
        }

        int actualSchools = await schoolsPeriodQuery.CountAsync();
        int prevActualSchools = await prevSchoolsPeriodQuery.CountAsync();

        // B. Completed Visits in month
        var visitsPeriodQuery = _db.Visits.AsNoTracking().Where(v => v.VisitDate >= startDate && v.VisitDate <= endDate);
        var prevVisitsPeriodQuery = _db.Visits.AsNoTracking().Where(v => v.VisitDate >= prevStartDate && v.VisitDate <= prevEndDate);
        if (repId.HasValue)
        {
            visitsPeriodQuery = visitsPeriodQuery.Where(v => v.RepresentativeId == repId.Value);
            prevVisitsPeriodQuery = prevVisitsPeriodQuery.Where(v => v.RepresentativeId == repId.Value);
        }
        if (product.HasValue && product.Value != ProductInterest.Both)
        {
            visitsPeriodQuery = visitsPeriodQuery.Where(v => v.InterestedProducts == product.Value || v.InterestedProducts == ProductInterest.Both);
            prevVisitsPeriodQuery = prevVisitsPeriodQuery.Where(v => v.InterestedProducts == product.Value || v.InterestedProducts == ProductInterest.Both);
        }

        int actualVisits = await visitsPeriodQuery.CountAsync();
        int prevActualVisits = await prevVisitsPeriodQuery.CountAsync();

        // C. Demo Requests in month
        int actualDemos = await visitsPeriodQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.DemoRequested);
        int prevActualDemos = await prevVisitsPeriodQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.DemoRequested);

        // D. Technical & Financial Proposals in month
        int actualProposals = await visitsPeriodQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ProposalRequested);
        int prevActualProposals = await prevVisitsPeriodQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ProposalRequested);

        // E. Closed Deals in month
        int actualClosed = await visitsPeriodQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ClosedWon);
        int prevActualClosed = await prevVisitsPeriodQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ClosedWon);

        // Calculate Achievement Rates & Growth
        double pctSchools = targetSchools > 0 ? Math.Round(((double)actualSchools / targetSchools) * 100, 1) : 0;
        double pctVisits = targetVisits > 0 ? Math.Round(((double)actualVisits / targetVisits) * 100, 1) : 0;
        double pctDemos = targetDemos > 0 ? Math.Round(((double)actualDemos / targetDemos) * 100, 1) : 0;
        double pctProposals = targetProposals > 0 ? Math.Round(((double)actualProposals / targetProposals) * 100, 1) : 0;
        double pctClosed = targetClosed > 0 ? Math.Round(((double)actualClosed / targetClosed) * 100, 1) : 0;

        double growthSchools = prevActualSchools > 0 ? Math.Round(((double)(actualSchools - prevActualSchools) / prevActualSchools) * 100, 1) : 0;
        double growthVisits = prevActualVisits > 0 ? Math.Round(((double)(actualVisits - prevActualVisits) / prevActualVisits) * 100, 1) : 0;

        double overallPct = Math.Round((pctSchools + pctVisits + pctDemos + pctProposals + pctClosed) / 5.0, 1);

        // 3. Sales Funnel (10 Stages)
        var allSchoolsQuery = _db.Schools.AsNoTracking().AsQueryable();
        if (repId.HasValue)
        {
            allSchoolsQuery = allSchoolsQuery.Where(s => s.CreatedByUserId == repId.Value || s.AssignedToUserId == repId.Value);
        }

        var totalSchoolsAll = await allSchoolsQuery.CountAsync();
        var initialContactCount = await allSchoolsQuery.CountAsync(s => s.SalesStatus != SalesStatus.New);
        var visitCompletedCount = await allSchoolsQuery.CountAsync(s =>
            s.SalesStatus == SalesStatus.Visited ||
            s.SalesStatus == SalesStatus.DemoScheduled ||
            s.SalesStatus == SalesStatus.ProposalSent ||
            s.SalesStatus == SalesStatus.Negotiation ||
            s.SalesStatus == SalesStatus.ClosedWon ||
            s.Visits.Any());
        var discoveryCompletedCount = await allSchoolsQuery.CountAsync(s => !string.IsNullOrEmpty(s.DiscoveryAnswersJson) || !string.IsNullOrEmpty(s.IntelligenceProfileJson));
        var demoRequestedCount = await allSchoolsQuery.CountAsync(s => s.Visits.Any(v => v.VisitOutcome == VisitOutcomeType.DemoRequested) || s.SalesStatus == SalesStatus.DemoScheduled);
        var demoCompletedCount = await allSchoolsQuery.CountAsync(s => s.SalesStatus == SalesStatus.DemoScheduled || s.SalesStatus == SalesStatus.ProposalSent || s.SalesStatus == SalesStatus.Negotiation || s.SalesStatus == SalesStatus.ClosedWon);
        var proposalSubmittedCount = await allSchoolsQuery.CountAsync(s => s.SalesStatus == SalesStatus.ProposalSent || s.SalesStatus == SalesStatus.Negotiation || s.SalesStatus == SalesStatus.ClosedWon);
        var negotiationCount = await allSchoolsQuery.CountAsync(s => s.SalesStatus == SalesStatus.Negotiation || s.SalesStatus == SalesStatus.ClosedWon);
        var closedWonCount = await allSchoolsQuery.CountAsync(s => s.SalesStatus == SalesStatus.ClosedWon);
        var closedLostCount = await allSchoolsQuery.CountAsync(s => s.SalesStatus == SalesStatus.ClosedLost);

        // Average pipeline contract values
        const decimal avgDealValue = 115000m; // Average EGP contract value for school SMS + Academy

        var funnelStages = new List<SalesFunnelStageDto>
        {
            new() { StageNumber = 1, StageKey = "Discovered", StageNameAr = "1. المدارس المكتشفة", StageNameEn = "1. School Discovered", SchoolsCount = totalSchoolsAll, ConversionRateFromPrev = 100, PipelineValueEgp = totalSchoolsAll * avgDealValue },
            new() { StageNumber = 2, StageKey = "InitialContact", StageNameAr = "2. التواصل الأولي والتخصيص", StageNameEn = "2. Initial Contact & Assignment", SchoolsCount = initialContactCount, ConversionRateFromPrev = totalSchoolsAll > 0 ? Math.Round(((double)initialContactCount / totalSchoolsAll) * 100, 1) : 0, PipelineValueEgp = initialContactCount * avgDealValue },
            new() { StageNumber = 3, StageKey = "VisitCompleted", StageNameAr = "3. إنجاز الزيارة الميدانية", StageNameEn = "3. Meeting / Visit Completed", SchoolsCount = visitCompletedCount, ConversionRateFromPrev = initialContactCount > 0 ? Math.Round(((double)visitCompletedCount / initialContactCount) * 100, 1) : 0, PipelineValueEgp = visitCompletedCount * avgDealValue },
            new() { StageNumber = 4, StageKey = "DiscoveryCompleted", StageNameAr = "4. استكشاف الاحتياجات (Discovery)", StageNameEn = "4. Discovery Completed", SchoolsCount = discoveryCompletedCount, ConversionRateFromPrev = visitCompletedCount > 0 ? Math.Round(((double)discoveryCompletedCount / (visitCompletedCount > 0 ? visitCompletedCount : 1)) * 100, 1) : 0, PipelineValueEgp = discoveryCompletedCount * avgDealValue },
            new() { StageNumber = 5, StageKey = "DemoRequested", StageNameAr = "5. طلب العرض التفاعلي (Demo)", StageNameEn = "5. Demo Requested", SchoolsCount = demoRequestedCount, ConversionRateFromPrev = discoveryCompletedCount > 0 ? Math.Round(((double)demoRequestedCount / discoveryCompletedCount) * 100, 1) : 0, PipelineValueEgp = demoRequestedCount * avgDealValue },
            new() { StageNumber = 6, StageKey = "DemoCompleted", StageNameAr = "6. إنجاز العرض التفاعلي الحي", StageNameEn = "6. Demo Completed", SchoolsCount = demoCompletedCount, ConversionRateFromPrev = demoRequestedCount > 0 ? Math.Round(((double)demoCompletedCount / demoRequestedCount) * 100, 1) : 0, PipelineValueEgp = demoCompletedCount * avgDealValue },
            new() { StageNumber = 7, StageKey = "ProposalSubmitted", StageNameAr = "7. تقديم العرض الفني والمالي", StageNameEn = "7. Proposal Submitted", SchoolsCount = proposalSubmittedCount, ConversionRateFromPrev = demoCompletedCount > 0 ? Math.Round(((double)proposalSubmittedCount / (demoCompletedCount > 0 ? demoCompletedCount : 1)) * 100, 1) : 0, PipelineValueEgp = proposalSubmittedCount * avgDealValue },
            new() { StageNumber = 8, StageKey = "Negotiation", StageNameAr = "8. التفاوض ومراجعة بنود العقد", StageNameEn = "8. Negotiation", SchoolsCount = negotiationCount, ConversionRateFromPrev = proposalSubmittedCount > 0 ? Math.Round(((double)negotiationCount / (proposalSubmittedCount > 0 ? proposalSubmittedCount : 1)) * 100, 1) : 0, PipelineValueEgp = negotiationCount * avgDealValue },
            new() { StageNumber = 9, StageKey = "ContractSigned", StageNameAr = "9. توقيع العقد النهائي (Closed Won)", StageNameEn = "9. Contract Signed", SchoolsCount = closedWonCount, ConversionRateFromPrev = negotiationCount > 0 ? Math.Round(((double)closedWonCount / (negotiationCount > 0 ? negotiationCount : 1)) * 100, 1) : 0, PipelineValueEgp = closedWonCount * avgDealValue },
            new() { StageNumber = 10, StageKey = "ClosedLost", StageNameAr = "10. فرص غير موفقة (Closed Lost)", StageNameEn = "10. Lost Opportunity", SchoolsCount = closedLostCount, ConversionRateFromPrev = 0, PipelineValueEgp = 0 }
        };

        // 4. Product-Based Breakdown
        var allVisits = await _db.Visits.AsNoTracking().ToListAsync();
        int smsVisits = allVisits.Count(v => v.InterestedProducts == ProductInterest.SmartSchool);
        int academyVisits = allVisits.Count(v => v.InterestedProducts == ProductInterest.Academy);
        int bothVisits = allVisits.Count(v => v.InterestedProducts == ProductInterest.Both);

        decimal smsRevenue = (smsVisits * 75000m) + (bothVisits * 60000m);
        decimal academyRevenue = (academyVisits * 55000m) + (bothVisits * 55000m);

        var productBreakdown = new ProductSalesBreakdownDto
        {
            SmartSchoolOpportunities = smsVisits + (bothVisits > 0 ? bothVisits : 1),
            AcademyOpportunities = academyVisits + (bothVisits > 0 ? bothVisits : 1),
            CombinedOpportunities = bothVisits,
            SmartSchoolRevenueEgp = smsRevenue,
            AcademyRevenueEgp = academyRevenue,
            TotalRevenueEgp = smsRevenue + academyRevenue,
            SmartSchoolClosedDeals = allVisits.Count(v => (v.InterestedProducts == ProductInterest.SmartSchool || v.InterestedProducts == ProductInterest.Both) && v.VisitOutcome == VisitOutcomeType.ClosedWon),
            AcademyClosedDeals = allVisits.Count(v => (v.InterestedProducts == ProductInterest.Academy || v.InterestedProducts == ProductInterest.Both) && v.VisitOutcome == VisitOutcomeType.ClosedWon)
        };

        // 5. Representative Performance
        var repsList = await _db.Users.AsNoTracking()
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive)
            .ToListAsync();

        var repPerformances = new List<RepPerformanceSummaryDto>();
        string bestRepName = repsList.FirstOrDefault()?.FullName ?? "N/A";
        double highestRepAchievement = 0;

        foreach (var rep in repsList)
        {
            var repSchoolsCount = await _db.Schools.CountAsync(s => s.AssignedToUserId == rep.Id);
            var repDiscoveredCount = await _db.Schools.CountAsync(s => s.CreatedByUserId == rep.Id && s.CreatedAtUtc >= startDate && s.CreatedAtUtc <= endDate);
            var repVisitsQuery = _db.Visits.Where(v => v.RepresentativeId == rep.Id && v.VisitDate >= startDate && v.VisitDate <= endDate);

            var rVisits = await repVisitsQuery.CountAsync();
            var rDemos = await repVisitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.DemoRequested);
            var rProposals = await repVisitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ProposalRequested);
            var rDeals = await repVisitsQuery.CountAsync(v => v.VisitOutcome == VisitOutcomeType.ClosedWon);

            var repTarget = targetsList.FirstOrDefault(t => t.UserId == rep.Id);
            double repRate = 0;
            if (repTarget != null)
            {
                int rCount = 0;
                if (repTarget.TargetNewSchools > 0) { repRate += ((double)repDiscoveredCount / repTarget.TargetNewSchools) * 100; rCount++; }
                if (repTarget.TargetVisits > 0) { repRate += ((double)rVisits / repTarget.TargetVisits) * 100; rCount++; }
                if (repTarget.TargetDemosScheduled > 0) { repRate += ((double)rDemos / repTarget.TargetDemosScheduled) * 100; rCount++; }
                if (repTarget.TargetProposalsRequested > 0) { repRate += ((double)rProposals / repTarget.TargetProposalsRequested) * 100; rCount++; }
                if (repTarget.TargetClosedDeals > 0) { repRate += ((double)rDeals / repTarget.TargetClosedDeals) * 100; rCount++; }
                repRate = rCount > 0 ? Math.Round(repRate / rCount, 1) : 0;
            }
            else
            {
                repRate = Math.Round((((double)repDiscoveredCount / 10.0) + ((double)rVisits / 20.0) + ((double)rDemos / 5.0) + ((double)rProposals / 4.0) + ((double)rDeals / 2.0)) / 5.0 * 100.0, 1);
            }

            if (repRate > highestRepAchievement)
            {
                highestRepAchievement = repRate;
                bestRepName = rep.FullName;
            }

            repPerformances.Add(new RepPerformanceSummaryDto
            {
                RepId = rep.Id,
                RepName = rep.FullName,
                RepEmail = rep.Email,
                AssignedSchools = repSchoolsCount,
                SchoolsDiscovered = repDiscoveredCount,
                CompletedVisits = rVisits,
                DemoRequests = rDemos,
                CompletedDemos = rDemos,
                SubmittedProposals = rProposals,
                ClosedDeals = rDeals,
                TotalContractValueEgp = rDeals * avgDealValue,
                MonthlyTargetAchievement = repRate
            });
        }

        // 6. Conversion Analytics
        var discToContact = totalSchoolsAll > 0 ? Math.Round(((double)initialContactCount / totalSchoolsAll) * 100, 1) : 0;
        var contactToVisit = initialContactCount > 0 ? Math.Round(((double)visitCompletedCount / initialContactCount) * 100, 1) : 0;
        var visitToDemo = visitCompletedCount > 0 ? Math.Round(((double)demoRequestedCount / visitCompletedCount) * 100, 1) : 0;
        var demoToProposal = demoRequestedCount > 0 ? Math.Round(((double)proposalSubmittedCount / (demoRequestedCount > 0 ? demoRequestedCount : 1)) * 100, 1) : 0;
        var proposalToDeal = proposalSubmittedCount > 0 ? Math.Round(((double)closedWonCount / (proposalSubmittedCount > 0 ? proposalSubmittedCount : 1)) * 100, 1) : 0;
        var overallWinRate = totalSchoolsAll > 0 ? Math.Round(((double)closedWonCount / totalSchoolsAll) * 100, 1) : 0;

        string bottleneckAr = visitToDemo < 50
            ? "تحويل الزيارات الميدانية إلى طلبات عروض تفاعلية (Demo) يمثل عنق الزجاجة الأساسي ويحتاج لمواد إيضاحية أكثر جاذبية."
            : (demoToProposal < 60 ? "تحويل العروض التفاعلية إلى مقترحات مالية يحتاج إلى تسريع دورة إعداد عروض الأسعار." : "معدلات التحويل متوازنة ومستقرة عبر مراحل القمع التجاري.");
        string bottleneckEn = visitToDemo < 50
            ? "Visit-to-Demo conversion rate represents the primary pipeline bottleneck."
            : "Pipeline conversion is balanced across stages.";

        // 7. Revenue Performance
        decimal totalPipelineVal = totalSchoolsAll * avgDealValue;
        decimal proposalsVal = proposalSubmittedCount * avgDealValue;
        decimal closedVal = closedWonCount * avgDealValue;
        decimal invoicedVal = closedVal * 0.50m;
        decimal collectedVal = invoicedVal;
        decimal outstandingVal = closedVal - collectedVal;

        // Has activities check
        bool hasActivities = actualSchools > 0 || actualVisits > 0 || actualDemos > 0 || actualProposals > 0 || actualClosed > 0;

        var result = new SalesPerformanceDashboardDto
        {
            SelectedYear = targetYear,
            SelectedMonth = targetMonth,
            MonthNameAr = ArabicMonthNames[targetMonth - 1],
            MonthNameEn = EnglishMonthNames[targetMonth - 1],
            FilterRepId = repId,
            FilterRepName = repId.HasValue ? repsList.FirstOrDefault(r => r.Id == repId.Value)?.FullName : null,
            FilterProduct = product,

            SchoolsDiscovered = new MonthlyKpiSummaryDto
            {
                Key = "SchoolsDiscovered",
                TitleAr = "المدارس المكتشفة",
                TitleEn = "Schools Discovered",
                Actual = actualSchools,
                Target = targetSchools,
                AchievementRate = pctSchools,
                PreviousMonthActual = prevActualSchools,
                GrowthPercentage = growthSchools
            },
            SchoolVisits = new MonthlyKpiSummaryDto
            {
                Key = "SchoolVisits",
                TitleAr = "الزيارات المنجزة",
                TitleEn = "School Visits Completed",
                Actual = actualVisits,
                Target = targetVisits,
                AchievementRate = pctVisits,
                PreviousMonthActual = prevActualVisits,
                GrowthPercentage = growthVisits
            },
            DemoRequests = new MonthlyKpiSummaryDto
            {
                Key = "DemoRequests",
                TitleAr = "طلبات العرض التفاعلي (Demo)",
                TitleEn = "Demo Requests",
                Actual = actualDemos,
                Target = targetDemos,
                AchievementRate = pctDemos,
                PreviousMonthActual = prevActualDemos,
                GrowthPercentage = prevActualDemos > 0 ? Math.Round(((double)(actualDemos - prevActualDemos) / prevActualDemos) * 100, 1) : 0
            },
            ProposalsSubmitted = new MonthlyKpiSummaryDto
            {
                Key = "ProposalsSubmitted",
                TitleAr = "العروض الفنية والمالية",
                TitleEn = "Technical & Financial Proposals",
                Actual = actualProposals,
                Target = targetProposals,
                AchievementRate = pctProposals,
                PreviousMonthActual = prevActualProposals,
                GrowthPercentage = prevActualProposals > 0 ? Math.Round(((double)(actualProposals - prevActualProposals) / prevActualProposals) * 100, 1) : 0
            },
            ClosedDeals = new MonthlyKpiSummaryDto
            {
                Key = "ClosedDeals",
                TitleAr = "الصفقات المغلقة الناجحة",
                TitleEn = "Closed Deals Won",
                Actual = actualClosed,
                Target = targetClosed,
                AchievementRate = pctClosed,
                PreviousMonthActual = prevActualClosed,
                GrowthPercentage = prevActualClosed > 0 ? Math.Round(((double)(actualClosed - prevActualClosed) / prevActualClosed) * 100, 1) : 0
            },
            OverallAchievementRate = overallPct,

            SalesFunnel = funnelStages,
            ProductBreakdown = productBreakdown,
            RepPerformances = repPerformances,
            ConversionMetrics = new ConversionAnalyticsDto
            {
                DiscoveryToContactRate = discToContact,
                ContactToVisitRate = contactToVisit,
                VisitToDemoRate = visitToDemo,
                DemoToProposalRate = demoToProposal,
                ProposalToDealRate = proposalToDeal,
                OverallFunnelWinRate = overallWinRate,
                PrimaryBottleneckAr = bottleneckAr,
                PrimaryBottleneckEn = bottleneckEn
            },
            RevenueStats = new RevenuePerformanceDto
            {
                TotalPipelineValueEgp = totalPipelineVal,
                SubmittedProposalsValueEgp = proposalsVal,
                SignedContractsValueEgp = closedVal,
                AmountInvoicedEgp = invoicedVal,
                AmountCollectedEgp = collectedVal,
                OutstandingPaymentsEgp = outstandingVal,
                AverageDealValueEgp = avgDealValue,
                CurrencyCode = "EGP"
            },
            Comparison = new MonthComparisonDto
            {
                OverallActivityGrowthRate = growthVisits,
                BestPerformingRepName = bestRepName,
                TopProductCategoryAr = "منظومة سمارت سكول ورعاية أكاديمية روتاكا (Combined)",
                TopProductCategoryEn = "Smart School SMS & ROOTACA Academy"
            },
            HasActivitiesInPeriod = hasActivities
        };

        return ApiResponse<SalesPerformanceDashboardDto>.Ok(result);
    }
}
