using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class KnowledgeBaseService : IKnowledgeBaseService
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditService _audit;

    public KnowledgeBaseService(ApplicationDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<ApiResponse<List<QACategoryDto>>> GetCategoriesAndQAAsync(ProductInterest? product = null)
    {
        var categories = await _db.QACategories
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Include(c => c.Items.OrderBy(i => i.DisplayOrder))
            .ToListAsync();

        var result = new List<QACategoryDto>();
        foreach (var cat in categories)
        {
            var items = cat.Items.AsEnumerable();
            if (product.HasValue)
            {
                items = items.Where(i => i.Product == product.Value || i.Product == ProductInterest.Both);
            }

            result.Add(new QACategoryDto
            {
                Id = cat.Id,
                NameAr = cat.NameAr,
                NameEn = cat.NameEn,
                DisplayOrder = cat.DisplayOrder,
                Items = items.Select(i => new QATemplateDto
                {
                    Id = i.Id,
                    CategoryId = i.CategoryId,
                    CategoryNameAr = cat.NameAr,
                    CategoryNameEn = cat.NameEn,
                    Product = i.Product,
                    QuestionAr = i.QuestionAr,
                    QuestionEn = i.QuestionEn,
                    AnswerAr = i.AnswerAr,
                    AnswerEn = i.AnswerEn,
                    InternalNotes = i.InternalNotes,
                    IsActive = i.IsActive,
                    DisplayOrder = i.DisplayOrder
                }).ToList()
            });
        }

        return ApiResponse<List<QACategoryDto>>.Ok(result);
    }

    public async Task<ApiResponse<QATemplateDto>> CreateQAAsync(CreateQARequest request)
    {
        var category = await _db.QACategories.FindAsync(request.CategoryId);
        if (category == null)
        {
            return ApiResponse<QATemplateDto>.Fail("Category not found.");
        }

        var item = new QATemplate
        {
            CategoryId = request.CategoryId,
            Product = request.Product,
            QuestionAr = request.QuestionAr.Trim(),
            QuestionEn = request.QuestionEn.Trim(),
            AnswerAr = request.AnswerAr.Trim(),
            AnswerEn = request.AnswerEn.Trim(),
            InternalNotes = request.InternalNotes?.Trim(),
            IsActive = request.IsActive,
            DisplayOrder = request.DisplayOrder
        };

        _db.QATemplates.Add(item);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CreateQAItem", "QATemplate", item.Id.ToString(), new { item.QuestionEn, item.Product });

        var dto = new QATemplateDto
        {
            Id = item.Id,
            CategoryId = item.CategoryId,
            CategoryNameAr = category.NameAr,
            CategoryNameEn = category.NameEn,
            Product = item.Product,
            QuestionAr = item.QuestionAr,
            QuestionEn = item.QuestionEn,
            AnswerAr = item.AnswerAr,
            AnswerEn = item.AnswerEn,
            InternalNotes = item.InternalNotes,
            IsActive = item.IsActive,
            DisplayOrder = item.DisplayOrder
        };

        return ApiResponse<QATemplateDto>.Ok(dto, "Q&A item created.");
    }

    public async Task<ApiResponse<QATemplateDto>> UpdateQAAsync(Guid id, UpdateQARequest request)
    {
        var item = await _db.QATemplates.Include(q => q.Category).FirstOrDefaultAsync(q => q.Id == id);
        if (item == null)
        {
            return ApiResponse<QATemplateDto>.Fail("Q&A item not found.");
        }

        item.CategoryId = request.CategoryId;
        item.Product = request.Product;
        item.QuestionAr = request.QuestionAr.Trim();
        item.QuestionEn = request.QuestionEn.Trim();
        item.AnswerAr = request.AnswerAr.Trim();
        item.AnswerEn = request.AnswerEn.Trim();
        item.InternalNotes = request.InternalNotes?.Trim();
        item.IsActive = request.IsActive;
        item.DisplayOrder = request.DisplayOrder;
        item.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UpdateQAItem", "QATemplate", id.ToString());

        var dto = new QATemplateDto
        {
            Id = item.Id,
            CategoryId = item.CategoryId,
            CategoryNameAr = item.Category?.NameAr ?? "",
            CategoryNameEn = item.Category?.NameEn ?? "",
            Product = item.Product,
            QuestionAr = item.QuestionAr,
            QuestionEn = item.QuestionEn,
            AnswerAr = item.AnswerAr,
            AnswerEn = item.AnswerEn,
            InternalNotes = item.InternalNotes,
            IsActive = item.IsActive,
            DisplayOrder = item.DisplayOrder
        };

        return ApiResponse<QATemplateDto>.Ok(dto, "Q&A item updated.");
    }

    public async Task<ApiResponse<bool>> DeleteQAAsync(Guid id)
    {
        var item = await _db.QATemplates.FindAsync(id);
        if (item == null)
        {
            return ApiResponse<bool>.Fail("Q&A item not found.");
        }

        _db.QATemplates.Remove(item);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("DeleteQAItem", "QATemplate", id.ToString());

        return ApiResponse<bool>.Ok(true, "Q&A item deleted.");
    }
}
