using SmartDevCo.SchoolSales.Contracts.Enums;

namespace SmartDevCo.SchoolSales.Contracts.DTOs;

public class SchoolAssignmentHistoryDto
{
    public Guid Id { get; set; }
    public Guid SchoolId { get; set; }
    public Guid AssignedToUserId { get; set; }
    public string AssignedToUserName { get; set; } = string.Empty;
    public Guid AssignedByUserId { get; set; }
    public string AssignedByUserName { get; set; } = string.Empty;
    public DateTime AssignedAtUtc { get; set; }
    public DateTime? UnassignedAtUtc { get; set; }
    public string? Notes { get; set; }
}

public class AssignSchoolRequest
{
    public Guid SchoolId { get; set; }
    public Guid AssignedToUserId { get; set; }
    public string? Notes { get; set; }
}

public class BulkAssignRequest
{
    public List<Guid> SchoolIds { get; set; } = new();
    public Guid AssignedToUserId { get; set; }
    public string? Notes { get; set; }
}

public class TeamMemberDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    public List<string> Roles { get; set; } = new();
    public int DiscoveredSchoolsCount { get; set; }
    public int AssignedSchoolsCount { get; set; }
    public int VisitsCount { get; set; }
    public int ClosedDealsCount { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class CreateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public List<UserRoleType> Roles { get; set; } = new();
}

public class UpdateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
    public List<UserRoleType> Roles { get; set; } = new();
    public string? NewPassword { get; set; }
}

public class SalesTeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public List<TeamMemberDto> Members { get; set; } = new();
    public DateTime CreatedAtUtc { get; set; }
}

public class CreateTeamRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ManagerId { get; set; }
    public List<Guid> MemberUserIds { get; set; } = new();
}
