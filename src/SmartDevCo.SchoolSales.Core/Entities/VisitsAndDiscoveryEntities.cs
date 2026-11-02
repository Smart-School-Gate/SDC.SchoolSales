using SmartDevCo.SchoolSales.Contracts.Enums;

namespace SmartDevCo.SchoolSales.Core.Entities;

public class QuestionCategory : BaseEntity
{
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }

    public ICollection<QuestionTemplate> Questions { get; set; } = new List<QuestionTemplate>();
}

public class QuestionTemplate : BaseEntity
{
    public Guid CategoryId { get; set; }
    public QuestionCategory Category { get; set; } = null!;

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

public class Visit : BaseEntity
{
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;

    public Guid RepresentativeId { get; set; }
    public User Representative { get; set; } = null!;

    public DateTime VisitDate { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public string? ContactPosition { get; set; }
    public bool DecisionMakerReached { get; set; }
    public ProductInterest InterestedProducts { get; set; }
    public VisitOutcomeType VisitOutcome { get; set; }
    public string? Notes { get; set; }
    public string? NextAction { get; set; }
    public DateTime? NextFollowUpDate { get; set; }

    public ICollection<VisitAnswer> Answers { get; set; } = new List<VisitAnswer>();
}

public class VisitAnswer : BaseEntity
{
    public Guid VisitId { get; set; }
    public Visit Visit { get; set; } = null!;

    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;

    public Guid QuestionTemplateId { get; set; }
    public QuestionTemplate QuestionTemplate { get; set; } = null!;

    public string QuestionSnapshotAr { get; set; } = string.Empty;
    public string QuestionSnapshotEn { get; set; } = string.Empty;
    public string AnswerValue { get; set; } = string.Empty;
}

public class Activity : BaseEntity
{
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ActivityType Type { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDateUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public bool IsCompleted { get; set; }
}

public class FollowUp : BaseEntity
{
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;

    public Guid AssignedToUserId { get; set; }
    public User AssignedToUser { get; set; } = null!;

    public DateTime DueDate { get; set; }
    public FollowUpPriority Priority { get; set; } = FollowUpPriority.Medium;
    public FollowUpStatus Status { get; set; } = FollowUpStatus.Pending;
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
}
