using SmartDevCo.SchoolSales.Contracts.Enums;

namespace SmartDevCo.SchoolSales.Contracts.DTOs;

public class SchoolDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public string? District { get; set; }
    public SchoolType SchoolType { get; set; }
    public LeadSource Source { get; set; }
    public SalesStatus SalesStatus { get; set; }
    public string? GeneralNotes { get; set; }

    public Guid CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }

    public Guid? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }

    public int ContactsCount { get; set; }
    public int VisitsCount { get; set; }
    public int ActivitiesCount { get; set; }
    public DateTime? LastVisitDate { get; set; }
    public DateTime? NextFollowUpDate { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}

public class SchoolDetailDto : SchoolDto
{
    public List<SchoolContactDto> Contacts { get; set; } = new();
    public List<SchoolAssignmentHistoryDto> AssignmentHistory { get; set; } = new();
    public List<VisitSummaryDto> RecentVisits { get; set; } = new();
    public List<ActivityDto> RecentActivities { get; set; } = new();
    public List<FollowUpDto> PendingFollowUps { get; set; } = new();
}

public class CreateSchoolRequest
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
    public Guid? AssignedToUserId { get; set; }
    public List<CreateContactRequest>? InitialContacts { get; set; }
}

public class UpdateSchoolRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string City { get; set; } = string.Empty;
    public string? District { get; set; }
    public SchoolType SchoolType { get; set; }
    public LeadSource Source { get; set; }
    public SalesStatus SalesStatus { get; set; }
    public string? GeneralNotes { get; set; }
}

public class SchoolFilterRequest
{
    public string? Search { get; set; }
    public string? City { get; set; }
    public SchoolType? SchoolType { get; set; }
    public SalesStatus? SalesStatus { get; set; }
    public LeadSource? Source { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public bool? IsUnassigned { get; set; }
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class SchoolContactDto
{
    public Guid Id { get; set; }
    public Guid SchoolId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public bool IsDecisionMaker { get; set; }
    public bool IsPrimaryContact { get; set; }
    public string? ContactNotes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class CreateContactRequest
{
    public string FullName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public bool IsDecisionMaker { get; set; }
    public bool IsPrimaryContact { get; set; }
    public string? ContactNotes { get; set; }
}

public class UpdateContactRequest : CreateContactRequest
{
}
