using SmartDevCo.SchoolSales.Contracts.Enums;

namespace SmartDevCo.SchoolSales.Core.Entities;

public class School : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public string? District { get; set; }
    public SchoolType SchoolType { get; set; } = SchoolType.Private;
    public LeadSource Source { get; set; } = LeadSource.FieldVisit;
    public SalesStatus SalesStatus { get; set; } = SalesStatus.New;
    public string? GeneralNotes { get; set; }
    public string? IntelligenceProfileJson { get; set; }
    public string? DiscoveryAnswersJson { get; set; }

    // Ownership & Assignment
    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    public Guid? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }

    // Navigation
    public ICollection<SchoolContact> Contacts { get; set; } = new List<SchoolContact>();
    public ICollection<SchoolAssignment> Assignments { get; set; } = new List<SchoolAssignment>();
    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    public ICollection<FollowUp> FollowUps { get; set; } = new List<FollowUp>();
    public ICollection<Presentation> Presentations { get; set; } = new List<Presentation>();
    public ICollection<VisitAnswer> VisitAnswers { get; set; } = new List<VisitAnswer>();
}

public class SchoolContact : BaseEntity
{
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;

    public string FullName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public bool IsDecisionMaker { get; set; }
    public bool IsPrimaryContact { get; set; }
    public string? ContactNotes { get; set; }
}

public class SalesTeam : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ManagerId { get; set; }
    public User? Manager { get; set; }

    public ICollection<SalesTeamMember> Members { get; set; } = new List<SalesTeamMember>();
}

public class SalesTeamMember
{
    public Guid SalesTeamId { get; set; }
    public SalesTeam SalesTeam { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}

public class SchoolAssignment : BaseEntity
{
    public Guid SchoolId { get; set; }
    public School School { get; set; } = null!;

    public Guid AssignedToUserId { get; set; }
    public User AssignedToUser { get; set; } = null!;

    public Guid AssignedByUserId { get; set; }
    public User AssignedByUser { get; set; } = null!;

    public DateTime AssignedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UnassignedAtUtc { get; set; }
    public string? Notes { get; set; }
}

public class SalesTarget : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public PeriodType PeriodType { get; set; }
    public int PeriodYear { get; set; }
    public int PeriodNumber { get; set; } // 1-12 or 1-4

    public int TargetNewSchools { get; set; }
    public int TargetVisits { get; set; }
    public int TargetDecisionMakersReached { get; set; }
    public int TargetDemosScheduled { get; set; }
    public int TargetProposalsRequested { get; set; }
    public int TargetClosedDeals { get; set; }
    public string? Notes { get; set; }

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
}
