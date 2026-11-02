using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class DiscoveryService : IDiscoveryService
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditService _audit;

    public DiscoveryService(ApplicationDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<ApiResponse<List<QuestionCategoryDto>>> GetCategoriesAndQuestionsAsync(ProductInterest? product = null)
    {
        var categories = await _db.QuestionCategories
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Include(c => c.Questions.OrderBy(q => q.DisplayOrder))
            .ToListAsync();

        var result = new List<QuestionCategoryDto>();

        foreach (var cat in categories)
        {
            var questions = cat.Questions.AsEnumerable();
            if (product.HasValue)
            {
                questions = questions.Where(q => q.Product == product.Value || q.Product == ProductInterest.Both);
            }

            result.Add(new QuestionCategoryDto
            {
                Id = cat.Id,
                NameAr = cat.NameAr,
                NameEn = cat.NameEn,
                DisplayOrder = cat.DisplayOrder,
                Questions = questions.Select(q => new QuestionTemplateDto
                {
                    Id = q.Id,
                    CategoryId = q.CategoryId,
                    CategoryNameAr = cat.NameAr,
                    CategoryNameEn = cat.NameEn,
                    Product = q.Product,
                    QuestionAr = q.QuestionAr,
                    QuestionEn = q.QuestionEn,
                    GuidanceAr = q.GuidanceAr,
                    GuidanceEn = q.GuidanceEn,
                    AnswerType = q.AnswerType,
                    OptionsJson = q.OptionsJson,
                    IsRequired = q.IsRequired,
                    DisplayOrder = q.DisplayOrder,
                    IsActive = q.IsActive
                }).ToList()
            });
        }

        return ApiResponse<List<QuestionCategoryDto>>.Ok(result);
    }

    public async Task<ApiResponse<QuestionTemplateDto>> CreateQuestionTemplateAsync(CreateQuestionTemplateRequest request)
    {
        var category = await _db.QuestionCategories.FindAsync(request.CategoryId);
        if (category == null)
        {
            return ApiResponse<QuestionTemplateDto>.Fail("Category not found.");
        }

        var template = new QuestionTemplate
        {
            CategoryId = request.CategoryId,
            Product = request.Product,
            QuestionAr = request.QuestionAr.Trim(),
            QuestionEn = request.QuestionEn.Trim(),
            GuidanceAr = request.GuidanceAr?.Trim(),
            GuidanceEn = request.GuidanceEn?.Trim(),
            AnswerType = request.AnswerType,
            OptionsJson = request.OptionsJson,
            IsRequired = request.IsRequired,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive
        };

        _db.QuestionTemplates.Add(template);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CreateQuestionTemplate", "QuestionTemplate", template.Id.ToString(), new { template.QuestionEn, template.Product });

        var dto = new QuestionTemplateDto
        {
            Id = template.Id,
            CategoryId = template.CategoryId,
            CategoryNameAr = category.NameAr,
            CategoryNameEn = category.NameEn,
            Product = template.Product,
            QuestionAr = template.QuestionAr,
            QuestionEn = template.QuestionEn,
            GuidanceAr = template.GuidanceAr,
            GuidanceEn = template.GuidanceEn,
            AnswerType = template.AnswerType,
            OptionsJson = template.OptionsJson,
            IsRequired = template.IsRequired,
            DisplayOrder = template.DisplayOrder,
            IsActive = template.IsActive
        };

        return ApiResponse<QuestionTemplateDto>.Ok(dto, "Question template created.");
    }

    public async Task<ApiResponse<QuestionTemplateDto>> UpdateQuestionTemplateAsync(Guid id, UpdateQuestionTemplateRequest request)
    {
        var template = await _db.QuestionTemplates.Include(q => q.Category).FirstOrDefaultAsync(q => q.Id == id);
        if (template == null)
        {
            return ApiResponse<QuestionTemplateDto>.Fail("Question template not found.");
        }

        template.CategoryId = request.CategoryId;
        template.Product = request.Product;
        template.QuestionAr = request.QuestionAr.Trim();
        template.QuestionEn = request.QuestionEn.Trim();
        template.GuidanceAr = request.GuidanceAr?.Trim();
        template.GuidanceEn = request.GuidanceEn?.Trim();
        template.AnswerType = request.AnswerType;
        template.OptionsJson = request.OptionsJson;
        template.IsRequired = request.IsRequired;
        template.DisplayOrder = request.DisplayOrder;
        template.IsActive = request.IsActive;
        template.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UpdateQuestionTemplate", "QuestionTemplate", id.ToString());

        var dto = new QuestionTemplateDto
        {
            Id = template.Id,
            CategoryId = template.CategoryId,
            CategoryNameAr = template.Category?.NameAr ?? "",
            CategoryNameEn = template.Category?.NameEn ?? "",
            Product = template.Product,
            QuestionAr = template.QuestionAr,
            QuestionEn = template.QuestionEn,
            GuidanceAr = template.GuidanceAr,
            GuidanceEn = template.GuidanceEn,
            AnswerType = template.AnswerType,
            OptionsJson = template.OptionsJson,
            IsRequired = template.IsRequired,
            DisplayOrder = template.DisplayOrder,
            IsActive = template.IsActive
        };

        return ApiResponse<QuestionTemplateDto>.Ok(dto, "Question template updated.");
    }

    public async Task<ApiResponse<bool>> DeleteQuestionTemplateAsync(Guid id)
    {
        var template = await _db.QuestionTemplates.FindAsync(id);
        if (template == null)
        {
            return ApiResponse<bool>.Fail("Question template not found.");
        }

        _db.QuestionTemplates.Remove(template);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("DeleteQuestionTemplate", "QuestionTemplate", id.ToString());

        return ApiResponse<bool>.Ok(true, "Question template deleted.");
    }

    public async Task<ApiResponse<List<VisitAnswerDto>>> GetVisitAnswersAsync(Guid visitId)
    {
        var answers = await _db.VisitAnswers
            .AsNoTracking()
            .Where(a => a.VisitId == visitId)
            .OrderBy(a => a.CreatedAtUtc)
            .Select(a => new VisitAnswerDto
            {
                Id = a.Id,
                VisitId = a.VisitId,
                SchoolId = a.SchoolId,
                QuestionTemplateId = a.QuestionTemplateId,
                QuestionSnapshotAr = a.QuestionSnapshotAr,
                QuestionSnapshotEn = a.QuestionSnapshotEn,
                AnswerValue = a.AnswerValue,
                CreatedAtUtc = a.CreatedAtUtc
            })
            .ToListAsync();

        return ApiResponse<List<VisitAnswerDto>>.Ok(answers);
    }

    public async Task<ApiResponse<List<VisitAnswerDto>>> GetSchoolLatestAnswersAsync(Guid schoolId)
    {
        // Get the most recent answers for each question for this school
        var answers = await _db.VisitAnswers
            .AsNoTracking()
            .Where(a => a.SchoolId == schoolId)
            .OrderByDescending(a => a.CreatedAtUtc)
            .ToListAsync();

        var distinctByQuestion = answers
            .GroupBy(a => a.QuestionTemplateId)
            .Select(g => g.First())
            .Select(a => new VisitAnswerDto
            {
                Id = a.Id,
                VisitId = a.VisitId,
                SchoolId = a.SchoolId,
                QuestionTemplateId = a.QuestionTemplateId,
                QuestionSnapshotAr = a.QuestionSnapshotAr,
                QuestionSnapshotEn = a.QuestionSnapshotEn,
                AnswerValue = a.AnswerValue,
                CreatedAtUtc = a.CreatedAtUtc
            })
            .ToList();

        return ApiResponse<List<VisitAnswerDto>>.Ok(distinctByQuestion);
    }
}
