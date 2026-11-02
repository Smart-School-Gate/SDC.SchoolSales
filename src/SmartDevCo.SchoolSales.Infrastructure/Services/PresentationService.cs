using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class PresentationService : IPresentationService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditService _audit;

    public PresentationService(ApplicationDbContext db, ICurrentUserService currentUser, IAuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<ApiResponse<List<PresentationDto>>> GetPresentationsAsync(Guid? schoolId = null, bool? templatesOnly = null)
    {
        var query = _db.Presentations
            .AsNoTracking()
            .Include(p => p.School)
            .Include(p => p.Slides)
            .AsQueryable();

        if (templatesOnly == true)
        {
            query = query.Where(p => p.IsTemplate);
        }
        else if (schoolId.HasValue)
        {
            query = query.Where(p => p.SchoolId == schoolId.Value);
        }

        var list = await query
            .OrderByDescending(p => p.IsTemplate)
            .ThenByDescending(p => p.CreatedAtUtc)
            .Select(p => new PresentationDto
            {
                Id = p.Id,
                SchoolId = p.SchoolId,
                SchoolName = p.School != null ? p.School.Name : null,
                Title = p.Title,
                Description = p.Description,
                IsTemplate = p.IsTemplate,
                SelectedProducts = p.SelectedProducts,
                VersionNumber = p.VersionNumber,
                SlidesCount = p.Slides.Count,
                CreatedAtUtc = p.CreatedAtUtc,
                UpdatedAtUtc = p.UpdatedAtUtc
            })
            .ToListAsync();

        return ApiResponse<List<PresentationDto>>.Ok(list);
    }

    public async Task<ApiResponse<PresentationDto>> GetPresentationByIdAsync(Guid id)
    {
        var presentation = await _db.Presentations
            .AsNoTracking()
            .Include(p => p.School)
            .Include(p => p.Slides.OrderBy(s => s.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == id);

        if (presentation == null)
        {
            return ApiResponse<PresentationDto>.Fail("Presentation not found.");
        }

        var dto = new PresentationDto
        {
            Id = presentation.Id,
            SchoolId = presentation.SchoolId,
            SchoolName = presentation.School?.Name,
            Title = presentation.Title,
            Description = presentation.Description,
            IsTemplate = presentation.IsTemplate,
            SelectedProducts = presentation.SelectedProducts,
            VersionNumber = presentation.VersionNumber,
            SlidesCount = presentation.Slides.Count,
            CreatedAtUtc = presentation.CreatedAtUtc,
            UpdatedAtUtc = presentation.UpdatedAtUtc,
            Slides = presentation.Slides.Select(s => new PresentationSlideDto
            {
                Id = s.Id,
                PresentationId = s.PresentationId,
                SlideTitleAr = s.SlideTitleAr,
                SlideTitleEn = s.SlideTitleEn,
                ContentAr = s.ContentAr,
                ContentEn = s.ContentEn,
                KeyPointsArJson = s.KeyPointsArJson,
                KeyPointsEnJson = s.KeyPointsEnJson,
                ImageUrl = s.ImageUrl,
                Category = s.Category,
                DisplayOrder = s.DisplayOrder,
                IsEnabled = s.IsEnabled,
                Notes = s.Notes
            }).ToList()
        };

        return ApiResponse<PresentationDto>.Ok(dto);
    }

    public async Task<ApiResponse<PresentationDto>> CreatePresentationAsync(CreatePresentationRequest request)
    {
        var pres = new Presentation
        {
            SchoolId = request.SchoolId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            IsTemplate = request.IsTemplate,
            SelectedProducts = request.SelectedProducts,
            CreatedByUserId = _currentUser.UserId ?? Guid.Empty
        };

        _db.Presentations.Add(pres);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CreatePresentation", "Presentation", pres.Id.ToString(), new { pres.Title, pres.IsTemplate });

        return await GetPresentationByIdAsync(pres.Id);
    }

    public async Task<ApiResponse<PresentationDto>> DuplicateForSchoolAsync(Guid templateId, Guid schoolId)
    {
        var template = await _db.Presentations
            .Include(p => p.Slides.OrderBy(s => s.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == templateId);

        if (template == null)
        {
            return ApiResponse<PresentationDto>.Fail("Source template not found.");
        }

        var school = await _db.Schools.FindAsync(schoolId);
        if (school == null)
        {
            return ApiResponse<PresentationDto>.Fail("Target school not found.");
        }

        var schoolCopy = new Presentation
        {
            SchoolId = school.Id,
            Title = $"{school.Name} — {template.Title}",
            Description = $"Custom deck for {school.Name} cloned from {template.Title}",
            IsTemplate = false,
            SelectedProducts = template.SelectedProducts,
            VersionNumber = 1,
            CreatedByUserId = _currentUser.UserId ?? Guid.Empty
        };

        foreach (var s in template.Slides)
        {
            schoolCopy.Slides.Add(new PresentationSlide
            {
                SlideTitleAr = s.SlideTitleAr,
                SlideTitleEn = s.SlideTitleEn,
                ContentAr = s.ContentAr,
                ContentEn = s.ContentEn,
                KeyPointsArJson = s.KeyPointsArJson,
                KeyPointsEnJson = s.KeyPointsEnJson,
                ImageUrl = s.ImageUrl,
                Category = s.Category,
                DisplayOrder = s.DisplayOrder,
                IsEnabled = s.IsEnabled,
                Notes = s.Notes
            });
        }

        _db.Presentations.Add(schoolCopy);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("ClonePresentationForSchool", "Presentation", schoolCopy.Id.ToString(), new { school.Name, SourceTemplateId = templateId });

        return await GetPresentationByIdAsync(schoolCopy.Id);
    }

    public async Task<ApiResponse<PresentationSlideDto>> AddSlideAsync(Guid presentationId, CreateSlideRequest request)
    {
        var pres = await _db.Presentations.Include(p => p.Slides).FirstOrDefaultAsync(p => p.Id == presentationId);
        if (pres == null)
        {
            return ApiResponse<PresentationSlideDto>.Fail("Presentation not found.");
        }

        int maxOrder = pres.Slides.Any() ? pres.Slides.Max(s => s.DisplayOrder) : 0;

        var slide = new PresentationSlide
        {
            PresentationId = pres.Id,
            SlideTitleAr = request.SlideTitleAr.Trim(),
            SlideTitleEn = request.SlideTitleEn.Trim(),
            ContentAr = request.ContentAr.Trim(),
            ContentEn = request.ContentEn.Trim(),
            KeyPointsArJson = request.KeyPointsArJson,
            KeyPointsEnJson = request.KeyPointsEnJson,
            ImageUrl = request.ImageUrl?.Trim(),
            Category = request.Category,
            DisplayOrder = request.DisplayOrder > 0 ? request.DisplayOrder : maxOrder + 1,
            IsEnabled = request.IsEnabled,
            Notes = request.Notes?.Trim()
        };

        pres.Slides.Add(slide);
        pres.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var dto = new PresentationSlideDto
        {
            Id = slide.Id,
            PresentationId = slide.PresentationId,
            SlideTitleAr = slide.SlideTitleAr,
            SlideTitleEn = slide.SlideTitleEn,
            ContentAr = slide.ContentAr,
            ContentEn = slide.ContentEn,
            KeyPointsArJson = slide.KeyPointsArJson,
            KeyPointsEnJson = slide.KeyPointsEnJson,
            ImageUrl = slide.ImageUrl,
            Category = slide.Category,
            DisplayOrder = slide.DisplayOrder,
            IsEnabled = slide.IsEnabled,
            Notes = slide.Notes
        };

        return ApiResponse<PresentationSlideDto>.Ok(dto, "Slide added.");
    }

    public async Task<ApiResponse<PresentationSlideDto>> UpdateSlideAsync(Guid slideId, UpdateSlideRequest request)
    {
        var slide = await _db.PresentationSlides.Include(s => s.Presentation).FirstOrDefaultAsync(s => s.Id == slideId);
        if (slide == null)
        {
            return ApiResponse<PresentationSlideDto>.Fail("Slide not found.");
        }

        slide.SlideTitleAr = request.SlideTitleAr.Trim();
        slide.SlideTitleEn = request.SlideTitleEn.Trim();
        slide.ContentAr = request.ContentAr.Trim();
        slide.ContentEn = request.ContentEn.Trim();
        slide.KeyPointsArJson = request.KeyPointsArJson;
        slide.KeyPointsEnJson = request.KeyPointsEnJson;
        slide.ImageUrl = request.ImageUrl?.Trim();
        slide.Category = request.Category;
        slide.DisplayOrder = request.DisplayOrder;
        slide.IsEnabled = request.IsEnabled;
        slide.Notes = request.Notes?.Trim();
        slide.UpdatedAtUtc = DateTime.UtcNow;

        slide.Presentation.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var dto = new PresentationSlideDto
        {
            Id = slide.Id,
            PresentationId = slide.PresentationId,
            SlideTitleAr = slide.SlideTitleAr,
            SlideTitleEn = slide.SlideTitleEn,
            ContentAr = slide.ContentAr,
            ContentEn = slide.ContentEn,
            KeyPointsArJson = slide.KeyPointsArJson,
            KeyPointsEnJson = slide.KeyPointsEnJson,
            ImageUrl = slide.ImageUrl,
            Category = slide.Category,
            DisplayOrder = slide.DisplayOrder,
            IsEnabled = slide.IsEnabled,
            Notes = slide.Notes
        };

        return ApiResponse<PresentationSlideDto>.Ok(dto, "Slide updated.");
    }

    public async Task<ApiResponse<bool>> DeleteSlideAsync(Guid slideId)
    {
        var slide = await _db.PresentationSlides.FindAsync(slideId);
        if (slide == null)
        {
            return ApiResponse<bool>.Fail("Slide not found.");
        }

        _db.PresentationSlides.Remove(slide);
        await _db.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "Slide removed.");
    }

    public async Task<ApiResponse<bool>> ReorderSlidesAsync(Guid presentationId, ReorderSlidesRequest request)
    {
        var slides = await _db.PresentationSlides.Where(s => s.PresentationId == presentationId).ToListAsync();
        if (!slides.Any())
        {
            return ApiResponse<bool>.Fail("No slides in presentation.");
        }

        for (int i = 0; i < request.SlideIds.Count; i++)
        {
            var s = slides.FirstOrDefault(x => x.Id == request.SlideIds[i]);
            if (s != null)
            {
                s.DisplayOrder = i + 1;
            }
        }

        await _db.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "Slide sequence updated.");
    }

    public async Task<ApiResponse<bool>> SaveVersionAsync(Guid presentationId)
    {
        var pres = await _db.Presentations
            .Include(p => p.Slides.OrderBy(s => s.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == presentationId);

        if (pres == null)
        {
            return ApiResponse<bool>.Fail("Presentation not found.");
        }

        pres.VersionNumber += 1;

        var snapshotJson = JsonSerializer.Serialize(new
        {
            pres.Title,
            pres.Description,
            pres.SelectedProducts,
            pres.VersionNumber,
            Slides = pres.Slides.Select(s => new
            {
                s.SlideTitleAr,
                s.SlideTitleEn,
                s.ContentAr,
                s.ContentEn,
                s.KeyPointsArJson,
                s.KeyPointsEnJson,
                s.ImageUrl,
                s.Category,
                s.DisplayOrder,
                s.IsEnabled
            })
        });

        var version = new PresentationVersion
        {
            PresentationId = pres.Id,
            VersionNumber = pres.VersionNumber,
            SnapshotJson = snapshotJson,
            CreatedByUserId = _currentUser.UserId ?? Guid.Empty
        };

        _db.PresentationVersions.Add(version);
        pres.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _audit.LogAsync("SavePresentationVersion", "Presentation", presentationId.ToString(), new { VersionNumber = pres.VersionNumber });

        return ApiResponse<bool>.Ok(true, $"Version {pres.VersionNumber} saved successfully.");
    }
}
