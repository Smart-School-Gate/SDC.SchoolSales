using SmartDevCo.SchoolSales.Contracts.Enums;

namespace SmartDevCo.SchoolSales.Contracts.DTOs;

public class SalesTargetDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public PeriodType PeriodType { get; set; }
    public int PeriodYear { get; set; }
    public int PeriodNumber { get; set; } // Month (1-12) or Quarter (1-4)
    public int TargetNewSchools { get; set; }
    public int TargetVisits { get; set; }
    public int TargetDecisionMakersReached { get; set; }
    public int TargetDemosScheduled { get; set; }
    public int TargetProposalsRequested { get; set; }
    public int TargetClosedDeals { get; set; }
    public string? Notes { get; set; }

    // Actual Calculated Progress
    public int ActualNewSchools { get; set; }
    public int ActualVisits { get; set; }
    public int ActualDecisionMakersReached { get; set; }
    public int ActualDemosScheduled { get; set; }
    public int ActualProposalsRequested { get; set; }
    public int ActualClosedDeals { get; set; }

    public double OverallAchievementRate { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class CreateSalesTargetRequest
{
    public Guid? UserId { get; set; }
    public bool IsTeamTarget { get; set; }
    public PeriodType PeriodType { get; set; } = PeriodType.Monthly;
    public int PeriodYear { get; set; }
    public int PeriodNumber { get; set; }
    public int TargetNewSchools { get; set; }
    public int TargetVisits { get; set; }
    public int TargetDecisionMakersReached { get; set; }
    public int TargetDemosScheduled { get; set; }
    public int TargetProposalsRequested { get; set; }
    public int TargetClosedDeals { get; set; }
    public string? Notes { get; set; }
}

public class UpdateSalesTargetRequest
{
    public int TargetNewSchools { get; set; }
    public int TargetVisits { get; set; }
    public int TargetDecisionMakersReached { get; set; }
    public int TargetDemosScheduled { get; set; }
    public int TargetProposalsRequested { get; set; }
    public int TargetClosedDeals { get; set; }
    public string? Notes { get; set; }
}

public class PresentationDto
{
    public Guid Id { get; set; }
    public Guid? SchoolId { get; set; }
    public string? SchoolName { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsTemplate { get; set; }
    public ProductInterest SelectedProducts { get; set; }
    public int VersionNumber { get; set; }
    public int SlidesCount { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? PublishedAtUtc { get; set; }
    public int? PublishedVersionNumber { get; set; }
    public string? ShareToken { get; set; }
    public DateTime? ShareTokenExpiresAtUtc { get; set; }
    public List<PresentationSlideDto> Slides { get; set; } = new();
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}

public class PublicPresentationDto
{
    public string ShareToken { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SchoolName { get; set; }
    public ProductInterest SelectedProducts { get; set; }
    public int VersionNumber { get; set; }
    public DateTime PublishedAtUtc { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
    public List<PublicSlideDto> Slides { get; set; } = new();
}

public class PublicSlideDto
{
    public Guid Id { get; set; }
    public string SlideTitleAr { get; set; } = string.Empty;
    public string SlideTitleEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public string ContentEn { get; set; } = string.Empty;
    public string? KeyPointsArJson { get; set; }
    public string? KeyPointsEnJson { get; set; }
    public string? ImageUrl { get; set; }
    public SlideCategory Category { get; set; }
    public int DisplayOrder { get; set; }
}

public class PublishPresentationRequest
{
    public DateTime? ExpiresAtUtc { get; set; }
    public bool RegenerateToken { get; set; }
}

public class PublishResultDto
{
    public Guid PresentationId { get; set; }
    public string ShareToken { get; set; } = string.Empty;
    public string PublicUrl { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime? PublishedAtUtc { get; set; }
    public int? PublishedVersionNumber { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
}

public class RecordViewEventRequest
{
    public string SessionId { get; set; } = string.Empty;
    public int? SlideIndex { get; set; }
    public int DurationSeconds { get; set; }
    public bool IsDemoCtaClick { get; set; }
    public string? Language { get; set; }
    public string? ReferrerDomain { get; set; }
}

public class SlideAnalyticsDto
{
    public int SlideIndex { get; set; }
    public string SlideTitleAr { get; set; } = string.Empty;
    public string SlideTitleEn { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    public int TotalDurationSeconds { get; set; }
    public double AverageDurationSeconds { get; set; }
}

public class PresentationAnalyticsSummaryDto
{
    public Guid PresentationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ShareToken { get; set; }
    public bool IsPublished { get; set; }
    public int TotalViews { get; set; }
    public int UniqueSessions { get; set; }
    public int DemoCtaClicks { get; set; }
    public int TotalEngagementDurationSeconds { get; set; }
    public double AverageDurationPerSessionSeconds { get; set; }
    public DateTime? LastViewedAtUtc { get; set; }
    public List<SlideAnalyticsDto> SlideStats { get; set; } = new();
}

public class PublicLeadInquiryRequest
{
    public string SchoolName { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
    public string? JobTitle { get; set; }
    public string? Message { get; set; }
    public ProductInterest InterestedProduct { get; set; } = ProductInterest.Both;
    public string? Honeypot { get; set; }
}

public class PublicLeadInquiryResultDto
{
    public bool Success { get; set; }
    public string MessageAr { get; set; } = string.Empty;
    public string MessageEn { get; set; } = string.Empty;
}

public class PresentationSlideDto
{
    public Guid Id { get; set; }
    public Guid PresentationId { get; set; }
    public string SlideTitleAr { get; set; } = string.Empty;
    public string SlideTitleEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public string ContentEn { get; set; } = string.Empty;
    public string? KeyPointsArJson { get; set; }
    public string? KeyPointsEnJson { get; set; }
    public string? ImageUrl { get; set; }
    public SlideCategory Category { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsEnabled { get; set; }
    public string? Notes { get; set; }
}

public class CreatePresentationRequest
{
    public Guid? SchoolId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsTemplate { get; set; }
    public ProductInterest SelectedProducts { get; set; } = ProductInterest.Both;
}

public class DuplicatePresentationRequest
{
    public string? NewTitle { get; set; }
    public Guid? TargetSchoolId { get; set; }
    public bool? IsTemplate { get; set; }
}

public class CreateSlideRequest
{
    public string SlideTitleAr { get; set; } = string.Empty;
    public string SlideTitleEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public string ContentEn { get; set; } = string.Empty;
    public string? KeyPointsArJson { get; set; }
    public string? KeyPointsEnJson { get; set; }
    public string? ImageUrl { get; set; }
    public SlideCategory Category { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsEnabled { get; set; } = true;
    public string? Notes { get; set; }
}

public class UpdateSlideRequest : CreateSlideRequest
{
}

public class ReorderSlidesRequest
{
    public List<Guid> SlideIds { get; set; } = new();
}

public class QACategoryDto
{
    public Guid Id { get; set; }
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public List<QATemplateDto> Items { get; set; } = new();
}

public class QATemplateDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryNameAr { get; set; } = string.Empty;
    public string CategoryNameEn { get; set; } = string.Empty;
    public ProductInterest Product { get; set; }
    public string QuestionAr { get; set; } = string.Empty;
    public string QuestionEn { get; set; } = string.Empty;
    public string AnswerAr { get; set; } = string.Empty;
    public string AnswerEn { get; set; } = string.Empty;
    public string? InternalNotes { get; set; } // Hidden in customer presentations!
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
}

public class CreateQARequest
{
    public Guid CategoryId { get; set; }
    public ProductInterest Product { get; set; }
    public string QuestionAr { get; set; } = string.Empty;
    public string QuestionEn { get; set; } = string.Empty;
    public string AnswerAr { get; set; } = string.Empty;
    public string AnswerEn { get; set; } = string.Empty;
    public string? InternalNotes { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
}

public class UpdateQARequest : CreateQARequest
{
}

public class DashboardStatsDto
{
    public int TotalSchools { get; set; }
    public int NewSchools { get; set; }
    public int VisitedSchools { get; set; }
    public int UnassignedSchools { get; set; }
    public int MySchoolsCount { get; set; }
    public int MyAssignedSchoolsCount { get; set; }
    public int TotalVisits { get; set; }
    public int DemosRequested { get; set; }
    public int ProposalsRequested { get; set; }
    public int FollowUpsDueCount { get; set; }
    public int FollowUpsOverdueCount { get; set; }
    public double OverallTargetAchievementRate { get; set; }

    public List<StageCountDto> SchoolsByStage { get; set; } = new();
    public List<ProductInterestCountDto> VisitsByProduct { get; set; } = new();
    public List<RepPerformanceDto> TopRepresentatives { get; set; } = new();
    public List<VisitSummaryDto> UpcomingVisits { get; set; } = new();
    public List<FollowUpDto> OverdueFollowUps { get; set; } = new();
}

public class StageCountDto
{
    public SalesStatus Stage { get; set; }
    public string StageName { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class ProductInterestCountDto
{
    public ProductInterest Product { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class RepPerformanceDto
{
    public Guid RepresentativeId { get; set; }
    public string RepresentativeName { get; set; } = string.Empty;
    public int DiscoveredSchools { get; set; }
    public int AssignedSchools { get; set; }
    public int Visits { get; set; }
    public int DemosScheduled { get; set; }
    public int ProposalsRequested { get; set; }
    public int ClosedDeals { get; set; }
    public double TargetAchievementRate { get; set; }
}

public class PerformanceReportRequest
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? RepresentativeId { get; set; }
    public SalesStatus? Stage { get; set; }
    public ProductInterest? Product { get; set; }
}

public class PerformanceReportDto
{
    public int TotalSchoolsDiscovered { get; set; }
    public int TotalVisits { get; set; }
    public int TotalDecisionMakersReached { get; set; }
    public int TotalDemosRequested { get; set; }
    public int TotalProposalsRequested { get; set; }
    public int TotalClosedDeals { get; set; }
    public List<RepPerformanceDto> Rows { get; set; } = new();
}

public class SalesPerformanceDashboardDto
{
    public int SelectedYear { get; set; }
    public int SelectedMonth { get; set; }
    public string MonthNameAr { get; set; } = string.Empty;
    public string MonthNameEn { get; set; } = string.Empty;
    public Guid? FilterRepId { get; set; }
    public string? FilterRepName { get; set; }
    public ProductInterest? FilterProduct { get; set; }

    // Primary 5 Monthly KPI Cards
    public MonthlyKpiSummaryDto SchoolsDiscovered { get; set; } = new();
    public MonthlyKpiSummaryDto SchoolVisits { get; set; } = new();
    public MonthlyKpiSummaryDto DemoRequests { get; set; } = new();
    public MonthlyKpiSummaryDto ProposalsSubmitted { get; set; } = new();
    public MonthlyKpiSummaryDto ClosedDeals { get; set; } = new();
    public double OverallAchievementRate { get; set; }

    // Sales Funnel (10 Stages)
    public List<SalesFunnelStageDto> SalesFunnel { get; set; } = new();

    // Product-Based Breakdown
    public ProductSalesBreakdownDto ProductBreakdown { get; set; } = new();

    // Sales Representative Performance
    public List<RepPerformanceSummaryDto> RepPerformances { get; set; } = new();

    // Conversion Analytics
    public ConversionAnalyticsDto ConversionMetrics { get; set; } = new();

    // Revenue & Commercial Performance
    public RevenuePerformanceDto RevenueStats { get; set; } = new();

    // Month Comparison & Highlights
    public MonthComparisonDto Comparison { get; set; } = new();

    public bool HasActivitiesInPeriod { get; set; }
}

public class MonthlyKpiSummaryDto
{
    public string Key { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public int Actual { get; set; }
    public int Target { get; set; }
    public double AchievementRate { get; set; }
    public int PreviousMonthActual { get; set; }
    public double GrowthPercentage { get; set; }
}

public class SalesFunnelStageDto
{
    public int StageNumber { get; set; }
    public string StageKey { get; set; } = string.Empty;
    public string StageNameAr { get; set; } = string.Empty;
    public string StageNameEn { get; set; } = string.Empty;
    public int SchoolsCount { get; set; }
    public double ConversionRateFromPrev { get; set; }
    public decimal PipelineValueEgp { get; set; }
}

public class ProductSalesBreakdownDto
{
    public int SmartSchoolOpportunities { get; set; }
    public int AcademyOpportunities { get; set; }
    public int CombinedOpportunities { get; set; }
    public decimal SmartSchoolRevenueEgp { get; set; }
    public decimal AcademyRevenueEgp { get; set; }
    public decimal TotalRevenueEgp { get; set; }
    public int SmartSchoolClosedDeals { get; set; }
    public int AcademyClosedDeals { get; set; }
}

public class RepPerformanceSummaryDto
{
    public Guid RepId { get; set; }
    public string RepName { get; set; } = string.Empty;
    public string? RepEmail { get; set; }
    public int AssignedSchools { get; set; }
    public int SchoolsDiscovered { get; set; }
    public int CompletedVisits { get; set; }
    public int DemoRequests { get; set; }
    public int CompletedDemos { get; set; }
    public int SubmittedProposals { get; set; }
    public int ClosedDeals { get; set; }
    public decimal TotalContractValueEgp { get; set; }
    public double MonthlyTargetAchievement { get; set; }
}

public class ConversionAnalyticsDto
{
    public double DiscoveryToContactRate { get; set; }
    public double ContactToVisitRate { get; set; }
    public double VisitToDemoRate { get; set; }
    public double DemoToProposalRate { get; set; }
    public double ProposalToDealRate { get; set; }
    public double OverallFunnelWinRate { get; set; }
    public string PrimaryBottleneckAr { get; set; } = string.Empty;
    public string PrimaryBottleneckEn { get; set; } = string.Empty;
}

public class RevenuePerformanceDto
{
    public decimal TotalPipelineValueEgp { get; set; }
    public decimal SubmittedProposalsValueEgp { get; set; }
    public decimal SignedContractsValueEgp { get; set; }
    public decimal AmountInvoicedEgp { get; set; }
    public decimal AmountCollectedEgp { get; set; }
    public decimal OutstandingPaymentsEgp { get; set; }
    public decimal AverageDealValueEgp { get; set; }
    public string CurrencyCode { get; set; } = "EGP";
}

public class MonthComparisonDto
{
    public double OverallActivityGrowthRate { get; set; }
    public string BestPerformingRepName { get; set; } = string.Empty;
    public string TopProductCategoryAr { get; set; } = string.Empty;
    public string TopProductCategoryEn { get; set; } = string.Empty;
}
