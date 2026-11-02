using SmartDevCo.SchoolSales.Contracts.Enums;

namespace SmartDevCo.SchoolSales.Contracts.DTOs;

public class VisitDto
{
    public Guid Id { get; set; }
    public Guid SchoolId { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public Guid RepresentativeId { get; set; }
    public string RepresentativeName { get; set; } = string.Empty;
    public DateTime VisitDate { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public string? ContactPosition { get; set; }
    public bool DecisionMakerReached { get; set; }
    public ProductInterest InterestedProducts { get; set; }
    public VisitOutcomeType VisitOutcome { get; set; }
    public string? Notes { get; set; }
    public string? NextAction { get; set; }
    public DateTime? NextFollowUpDate { get; set; }
    public List<VisitAnswerDto> Answers { get; set; } = new();
    public DateTime CreatedAtUtc { get; set; }
}

public class VisitSummaryDto
{
    public Guid Id { get; set; }
    public Guid SchoolId { get; set; }
    public string RepresentativeName { get; set; } = string.Empty;
    public DateTime VisitDate { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public bool DecisionMakerReached { get; set; }
    public ProductInterest InterestedProducts { get; set; }
    public VisitOutcomeType VisitOutcome { get; set; }
    public string? NextAction { get; set; }
    public DateTime? NextFollowUpDate { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class CreateVisitRequest
{
    public Guid SchoolId { get; set; }
    public DateTime VisitDate { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public string? ContactPosition { get; set; }
    public bool DecisionMakerReached { get; set; }
    public ProductInterest InterestedProducts { get; set; }
    public VisitOutcomeType VisitOutcome { get; set; }
    public string? Notes { get; set; }
    public string? NextAction { get; set; }
    public DateTime? NextFollowUpDate { get; set; }
    public List<SubmitVisitAnswerItem>? Answers { get; set; }
}

public class UpdateVisitRequest
{
    public DateTime VisitDate { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public string? ContactPosition { get; set; }
    public bool DecisionMakerReached { get; set; }
    public ProductInterest InterestedProducts { get; set; }
    public VisitOutcomeType VisitOutcome { get; set; }
    public string? Notes { get; set; }
    public string? NextAction { get; set; }
    public DateTime? NextFollowUpDate { get; set; }
}

public class VisitFilterRequest
{
    public Guid? SchoolId { get; set; }
    public Guid? RepresentativeId { get; set; }
    public VisitOutcomeType? Outcome { get; set; }
    public ProductInterest? Product { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class QuestionCategoryDto
{
    public Guid Id { get; set; }
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public List<QuestionTemplateDto> Questions { get; set; } = new();
}

public class QuestionTemplateDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryNameAr { get; set; } = string.Empty;
    public string CategoryNameEn { get; set; } = string.Empty;
    public ProductInterest Product { get; set; }
    public string QuestionAr { get; set; } = string.Empty;
    public string QuestionEn { get; set; } = string.Empty;
    public string? GuidanceAr { get; set; }
    public string? GuidanceEn { get; set; }
    public AnswerType AnswerType { get; set; }
    public string? OptionsJson { get; set; }
    public bool IsRequired { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public class CreateQuestionTemplateRequest
{
    public Guid CategoryId { get; set; }
    public ProductInterest Product { get; set; }
    public string QuestionAr { get; set; } = string.Empty;
    public string QuestionEn { get; set; } = string.Empty;
    public string? GuidanceAr { get; set; }
    public string? GuidanceEn { get; set; }
    public AnswerType AnswerType { get; set; }
    public string? OptionsJson { get; set; }
    public bool IsRequired { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateQuestionTemplateRequest : CreateQuestionTemplateRequest
{
}

public class VisitAnswerDto
{
    public Guid Id { get; set; }
    public Guid VisitId { get; set; }
    public Guid SchoolId { get; set; }
    public Guid QuestionTemplateId { get; set; }
    public string QuestionSnapshotAr { get; set; } = string.Empty;
    public string QuestionSnapshotEn { get; set; } = string.Empty;
    public string AnswerValue { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}

public class SubmitVisitAnswerItem
{
    public Guid QuestionTemplateId { get; set; }
    public string AnswerValue { get; set; } = string.Empty;
}

public class ActivityDto
{
    public Guid Id { get; set; }
    public Guid SchoolId { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public ActivityType Type { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDateUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class CreateActivityRequest
{
    public Guid SchoolId { get; set; }
    public ActivityType Type { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDateUtc { get; set; }
    public bool IsCompleted { get; set; }
}

public class FollowUpDto
{
    public Guid Id { get; set; }
    public Guid SchoolId { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public Guid AssignedToUserId { get; set; }
    public string AssignedToUserName { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public FollowUpPriority Priority { get; set; }
    public FollowUpStatus Status { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public bool IsOverdue => Status != FollowUpStatus.Completed && Status != FollowUpStatus.Cancelled && DueDate < DateTime.UtcNow;
    public DateTime CreatedAtUtc { get; set; }
}

public class CreateFollowUpRequest
{
    public Guid SchoolId { get; set; }
    public Guid AssignedToUserId { get; set; }
    public DateTime DueDate { get; set; }
    public FollowUpPriority Priority { get; set; } = FollowUpPriority.Medium;
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class UpdateFollowUpRequest
{
    public DateTime DueDate { get; set; }
    public FollowUpPriority Priority { get; set; }
    public FollowUpStatus Status { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
