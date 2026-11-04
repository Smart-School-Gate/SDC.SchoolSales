using SmartDevCo.SchoolSales.Contracts.Enums;

namespace SmartDevCo.SchoolSales.Core.Entities;

public class Presentation : BaseEntity
{
    public Guid? SchoolId { get; set; }
    public School? School { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsTemplate { get; set; }
    public ProductInterest SelectedProducts { get; set; } = ProductInterest.Both;
    public int VersionNumber { get; set; } = 1;

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public bool IsPublished { get; set; }
    public DateTime? PublishedAtUtc { get; set; }
    public int? PublishedVersionNumber { get; set; }
    public string? PublishedSnapshotJson { get; set; }
    public string? ShareToken { get; set; }
    public DateTime? ShareTokenExpiresAtUtc { get; set; }

    public ICollection<PresentationSlide> Slides { get; set; } = new List<PresentationSlide>();
    public ICollection<PresentationVersion> Versions { get; set; } = new List<PresentationVersion>();
    public ICollection<PresentationViewEvent> ViewEvents { get; set; } = new List<PresentationViewEvent>();
    public ICollection<PresentationPublicInquiry> PublicInquiries { get; set; } = new List<PresentationPublicInquiry>();
}

public class PresentationViewEvent : BaseEntity
{
    public Guid PresentationId { get; set; }
    public Presentation Presentation { get; set; } = null!;

    public string ShareToken { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public int? SlideIndex { get; set; }
    public int DurationSeconds { get; set; }
    public bool IsDemoCtaClick { get; set; }
    public string? Language { get; set; }
    public string? ReferrerDomain { get; set; }
}

public class PresentationPublicInquiry : BaseEntity
{
    public Guid PresentationId { get; set; }
    public Presentation Presentation { get; set; } = null!;

    public Guid? SchoolId { get; set; }
    public School? School { get; set; }

    public string ShareToken { get; set; } = string.Empty;
    public string SchoolName { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string? ContactEmail { get; set; }
    public string? JobTitle { get; set; }
    public string? Message { get; set; }
    public ProductInterest InterestedProduct { get; set; } = ProductInterest.Both;
    public bool IsReviewed { get; set; } = false;
    public Guid? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }
}

public class PresentationSlide : BaseEntity
{
    public Guid PresentationId { get; set; }
    public Presentation Presentation { get; set; } = null!;

    public string SlideTitleAr { get; set; } = string.Empty;
    public string SlideTitleEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public string ContentEn { get; set; } = string.Empty;
    public string? KeyPointsArJson { get; set; }
    public string? KeyPointsEnJson { get; set; }
    public string? ImageUrl { get; set; }
    public SlideCategory Category { get; set; } = SlideCategory.CompanyOverview;
    public int DisplayOrder { get; set; }
    public bool IsEnabled { get; set; } = true;
    public string? Notes { get; set; }
}

public class PresentationVersion : BaseEntity
{
    public Guid PresentationId { get; set; }
    public Presentation Presentation { get; set; } = null!;

    public int VersionNumber { get; set; }
    public string SnapshotJson { get; set; } = string.Empty;

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
}

public class QACategory : BaseEntity
{
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }

    public ICollection<QATemplate> Items { get; set; } = new List<QATemplate>();
}

public class QATemplate : BaseEntity
{
    public Guid CategoryId { get; set; }
    public QACategory Category { get; set; } = null!;

    public ProductInterest Product { get; set; } = ProductInterest.Both;
    public string QuestionAr { get; set; } = string.Empty;
    public string QuestionEn { get; set; } = string.Empty;
    public string AnswerAr { get; set; } = string.Empty;
    public string AnswerEn { get; set; } = string.Empty;
    public string? InternalNotes { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
}

public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public string? UserEmail { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? DetailsJson { get; set; }
    public string? IpAddress { get; set; }
}
