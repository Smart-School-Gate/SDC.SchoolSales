using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;

namespace SmartDevCo.SchoolSales.Core.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    IReadOnlyList<string> Roles { get; }
    bool IsAuthenticated { get; }
    bool IsSuperAdmin { get; }
    bool IsSalesManager { get; }
    bool IsSalesRepresentative { get; }
}

public interface IAuthService
{
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request, string? ipAddress = null);
    Task<ApiResponse<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request, string? ipAddress = null);
    Task<ApiResponse<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    Task EnsureSuperAdminBootstrappedAsync();
}

public interface ISchoolService
{
    Task<ApiResponse<PagedResult<SchoolDto>>> GetSchoolsAsync(SchoolFilterRequest filter);
    Task<ApiResponse<SchoolDetailDto>> GetSchoolByIdAsync(Guid id);
    Task<ApiResponse<SchoolDto>> CreateSchoolAsync(CreateSchoolRequest request);
    Task<ApiResponse<SchoolDto>> UpdateSchoolAsync(Guid id, UpdateSchoolRequest request);
    Task<ApiResponse<SchoolDetailDto>> UpdateSchoolIntelligenceAsync(Guid id, string intelligenceJson);
    Task<ApiResponse<SchoolDetailDto>> UpdateSchoolDiscoveryAnswersAsync(Guid id, string answersJson);
    Task<ApiResponse<bool>> DeleteSchoolAsync(Guid id);
}

public interface ISchoolContactService
{
    Task<ApiResponse<List<SchoolContactDto>>> GetContactsBySchoolIdAsync(Guid schoolId);
    Task<ApiResponse<SchoolContactDto>> AddContactAsync(Guid schoolId, CreateContactRequest request);
    Task<ApiResponse<SchoolContactDto>> UpdateContactAsync(Guid contactId, UpdateContactRequest request);
    Task<ApiResponse<bool>> DeleteContactAsync(Guid contactId);
}

public interface IAssignmentService
{
    Task<ApiResponse<bool>> AssignSchoolAsync(AssignSchoolRequest request);
    Task<ApiResponse<int>> BulkAssignAsync(BulkAssignRequest request);
    Task<ApiResponse<List<SchoolAssignmentHistoryDto>>> GetAssignmentHistoryAsync(Guid schoolId);
    Task<ApiResponse<List<SchoolDto>>> GetUnassignedSchoolsAsync();
}

public interface IVisitService
{
    Task<ApiResponse<PagedResult<VisitSummaryDto>>> GetVisitsAsync(VisitFilterRequest filter);
    Task<ApiResponse<VisitDto>> GetVisitByIdAsync(Guid id);
    Task<ApiResponse<VisitDto>> CreateVisitAsync(CreateVisitRequest request);
    Task<ApiResponse<VisitDto>> UpdateVisitAsync(Guid id, UpdateVisitRequest request);
    Task<ApiResponse<bool>> DeleteVisitAsync(Guid id);
}

public interface IDiscoveryService
{
    Task<ApiResponse<List<QuestionCategoryDto>>> GetCategoriesAndQuestionsAsync(ProductInterest? product = null);
    Task<ApiResponse<QuestionTemplateDto>> CreateQuestionTemplateAsync(CreateQuestionTemplateRequest request);
    Task<ApiResponse<QuestionTemplateDto>> UpdateQuestionTemplateAsync(Guid id, UpdateQuestionTemplateRequest request);
    Task<ApiResponse<bool>> DeleteQuestionTemplateAsync(Guid id);
    Task<ApiResponse<List<VisitAnswerDto>>> GetVisitAnswersAsync(Guid visitId);
    Task<ApiResponse<List<VisitAnswerDto>>> GetSchoolLatestAnswersAsync(Guid schoolId);
}

public interface IActivityService
{
    Task<ApiResponse<List<ActivityDto>>> GetActivitiesAsync(Guid? schoolId = null, Guid? userId = null);
    Task<ApiResponse<ActivityDto>> CreateActivityAsync(CreateActivityRequest request);
    Task<ApiResponse<ActivityDto>> ToggleCompleteAsync(Guid id);
    Task<ApiResponse<bool>> DeleteActivityAsync(Guid id);
}

public interface IFollowUpService
{
    Task<ApiResponse<List<FollowUpDto>>> GetFollowUpsAsync(Guid? schoolId = null, Guid? userId = null, bool? onlyPending = null);
    Task<ApiResponse<FollowUpDto>> CreateFollowUpAsync(CreateFollowUpRequest request);
    Task<ApiResponse<FollowUpDto>> UpdateFollowUpAsync(Guid id, UpdateFollowUpRequest request);
    Task<ApiResponse<bool>> DeleteFollowUpAsync(Guid id);
}

public interface ISalesTargetService
{
    Task<ApiResponse<List<SalesTargetDto>>> GetTargetsAsync(int? year = null, PeriodType? periodType = null, Guid? userId = null);
    Task<ApiResponse<SalesPerformanceDashboardDto>> GetSalesPerformanceDashboardAsync(int? year = null, int? month = null, Guid? repId = null, ProductInterest? product = null);
    Task<ApiResponse<SalesTargetDto>> GetTargetByIdAsync(Guid id);
    Task<ApiResponse<SalesTargetDto>> CreateTargetAsync(CreateSalesTargetRequest request);
    Task<ApiResponse<SalesTargetDto>> UpdateTargetAsync(Guid id, UpdateSalesTargetRequest request);
    Task<ApiResponse<bool>> DeleteTargetAsync(Guid id);
}

public interface IPresentationService
{
    Task<ApiResponse<List<PresentationDto>>> GetPresentationsAsync(Guid? schoolId = null, bool? templatesOnly = null);
    Task<ApiResponse<PresentationDto>> GetPresentationByIdAsync(Guid id);
    Task<ApiResponse<PresentationDto>> CreatePresentationAsync(CreatePresentationRequest request);
    Task<ApiResponse<PresentationDto>> DuplicateForSchoolAsync(Guid templateId, Guid schoolId);
    Task<ApiResponse<PresentationSlideDto>> AddSlideAsync(Guid presentationId, CreateSlideRequest request);
    Task<ApiResponse<PresentationSlideDto>> UpdateSlideAsync(Guid slideId, UpdateSlideRequest request);
    Task<ApiResponse<bool>> DeleteSlideAsync(Guid slideId);
    Task<ApiResponse<bool>> ReorderSlidesAsync(Guid presentationId, ReorderSlidesRequest request);
    Task<ApiResponse<bool>> SaveVersionAsync(Guid presentationId);
}

public interface IKnowledgeBaseService
{
    Task<ApiResponse<List<QACategoryDto>>> GetCategoriesAndQAAsync(ProductInterest? product = null);
    Task<ApiResponse<QATemplateDto>> CreateQAAsync(CreateQARequest request);
    Task<ApiResponse<QATemplateDto>> UpdateQAAsync(Guid id, UpdateQARequest request);
    Task<ApiResponse<bool>> DeleteQAAsync(Guid id);
}

public interface IUserService
{
    Task<ApiResponse<List<TeamMemberDto>>> GetUsersAsync();
    Task<ApiResponse<TeamMemberDto>> GetUserByIdAsync(Guid id);
    Task<ApiResponse<TeamMemberDto>> CreateUserAsync(CreateUserRequest request);
    Task<ApiResponse<TeamMemberDto>> UpdateUserAsync(Guid id, UpdateUserRequest request);
    Task<ApiResponse<bool>> SetActiveStatusAsync(Guid id, bool isActive);
}

public interface IDashboardService
{
    Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync();
}

public interface IReportService
{
    Task<ApiResponse<PerformanceReportDto>> GetPerformanceReportAsync(PerformanceReportRequest request);
}

public interface IAuditService
{
    Task LogAsync(string action, string entityType, string? entityId = null, object? details = null, string? ipAddress = null);
}
