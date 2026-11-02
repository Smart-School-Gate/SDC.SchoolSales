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
    public Guid UserId { get; set; }
    public PeriodType PeriodType { get; set; }
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
    public List<PresentationSlideDto> Slides { get; set; } = new();
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
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
