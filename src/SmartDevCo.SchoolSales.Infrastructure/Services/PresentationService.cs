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
                IsPublished = p.IsPublished,
                PublishedAtUtc = p.PublishedAtUtc,
                PublishedVersionNumber = p.PublishedVersionNumber,
                ShareToken = p.ShareToken,
                ShareTokenExpiresAtUtc = p.ShareTokenExpiresAtUtc,
                CreatedAtUtc = p.CreatedAtUtc,
                UpdatedAtUtc = p.UpdatedAtUtc
            })
            .ToListAsync();

        return ApiResponse<List<PresentationDto>>.Ok(list);
    }

    private static int InferDisplayOrder(string? titleAr, string? titleEn, int fallbackOrder)
    {
        var combined = $"{titleAr} {titleEn}".Trim();
        for (int i = 1; i <= 12; i++)
        {
            var prefix = $"{i:D2} —";
            var altPrefix = $"{i:D2} -";
            if (combined.StartsWith(prefix, StringComparison.OrdinalIgnoreCase) || 
                combined.StartsWith(altPrefix, StringComparison.OrdinalIgnoreCase) || 
                combined.StartsWith($"{i:D2} ", StringComparison.OrdinalIgnoreCase) ||
                combined.Contains($"Slide {i:D2}", StringComparison.OrdinalIgnoreCase))
            {
                return i;
            }
        }
        return fallbackOrder;
    }

    public async Task<ApiResponse<PresentationDto>> GetPresentationByIdAsync(Guid id)
    {
        var presentation = await _db.Presentations
            .Include(p => p.School)
            .Include(p => p.Slides)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (presentation == null)
        {
            return ApiResponse<PresentationDto>.Fail("Presentation not found.");
        }

        // Self-heal corrupted DisplayOrders (e.g. from previous edit bug where displayOrder became 0)
        bool needSave = false;
        foreach (var s in presentation.Slides)
        {
            if (s.DisplayOrder <= 0)
            {
                s.DisplayOrder = InferDisplayOrder(s.SlideTitleAr, s.SlideTitleEn, 99);
                needSave = true;
            }
        }
        if (needSave)
        {
            var sorted = presentation.Slides.OrderBy(s => s.DisplayOrder).ThenBy(s => s.CreatedAtUtc).ToList();
            for (int i = 0; i < sorted.Count; i++)
            {
                sorted[i].DisplayOrder = i + 1;
            }
            await _db.SaveChangesAsync();
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
            IsPublished = presentation.IsPublished,
            PublishedAtUtc = presentation.PublishedAtUtc,
            PublishedVersionNumber = presentation.PublishedVersionNumber,
            ShareToken = presentation.ShareToken,
            ShareTokenExpiresAtUtc = presentation.ShareTokenExpiresAtUtc,
            CreatedAtUtc = presentation.CreatedAtUtc,
            UpdatedAtUtc = presentation.UpdatedAtUtc,
            Slides = presentation.Slides
                .OrderBy(s => s.DisplayOrder)
                .Select(s => new PresentationSlideDto
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
        School? school = null;
        if (request.SchoolId.HasValue && request.SchoolId != Guid.Empty)
        {
            school = await _db.Schools.FindAsync(request.SchoolId.Value);
        }

        var pres = new Presentation
        {
            SchoolId = request.SchoolId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            IsTemplate = request.IsTemplate,
            SelectedProducts = request.SelectedProducts,
            CreatedByUserId = _currentUser.UserId ?? Guid.Empty
        };

        // If creating a school presentation, automatically copy and customize slides from the master template
        if (!request.IsTemplate)
        {
            var masterTemplate = await _db.Presentations
                .Include(p => p.Slides.OrderBy(s => s.DisplayOrder))
                .FirstOrDefaultAsync(p => p.IsTemplate);

            if (masterTemplate != null && masterTemplate.Slides.Any())
            {
                foreach (var s in masterTemplate.Slides)
                {
                    var titleAr = s.SlideTitleAr;
                    var titleEn = s.SlideTitleEn;
                    var contentAr = s.ContentAr;
                    var contentEn = s.ContentEn;
                    var keyPointsAr = s.KeyPointsArJson;
                    var keyPointsEn = s.KeyPointsEnJson;

                    if (school != null)
                    {
                        titleAr = titleAr?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);
                        titleEn = titleEn?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);
                        contentAr = contentAr?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);
                        contentEn = contentEn?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);
                        keyPointsAr = keyPointsAr?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);
                        keyPointsEn = keyPointsEn?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);

                        if (s.DisplayOrder == 2)
                        {
                            ApplySchoolCustomizationAngle(school.Name, ref contentAr, ref keyPointsAr);
                        }
                    }

                    pres.Slides.Add(new PresentationSlide
                    {
                        SlideTitleAr = titleAr ?? string.Empty,
                        SlideTitleEn = titleEn ?? string.Empty,
                        ContentAr = contentAr ?? string.Empty,
                        ContentEn = contentEn ?? string.Empty,
                        KeyPointsArJson = keyPointsAr,
                        KeyPointsEnJson = keyPointsEn,
                        ImageUrl = s.ImageUrl,
                        Category = s.Category,
                        DisplayOrder = s.DisplayOrder,
                        IsEnabled = s.IsEnabled,
                        Notes = s.Notes
                    });
                }
            }
        }

        _db.Presentations.Add(pres);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CreatePresentation", "Presentation", pres.Id.ToString(), new { pres.Title, pres.IsTemplate });

        return await GetPresentationByIdAsync(pres.Id);
    }

    public async Task<ApiResponse<PresentationDto>> DuplicatePresentationAsync(Guid id, DuplicatePresentationRequest? request)
    {
        var source = await _db.Presentations
            .Include(p => p.Slides.OrderBy(s => s.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == id);

        if (source == null)
        {
            return ApiResponse<PresentationDto>.Fail("Source presentation not found.");
        }

        School? school = null;
        if (request?.TargetSchoolId.HasValue == true && request.TargetSchoolId != Guid.Empty)
        {
            school = await _db.Schools.FindAsync(request.TargetSchoolId.Value);
            if (school == null)
            {
                return ApiResponse<PresentationDto>.Fail("Target school not found.");
            }
        }

        string newTitle;
        if (!string.IsNullOrWhiteSpace(request?.NewTitle))
        {
            newTitle = request.NewTitle.Trim();
        }
        else if (school != null)
        {
            newTitle = $"{school.Name} — {source.Title}";
        }
        else
        {
            newTitle = $"{source.Title} (نسخة)";
        }

        var isTemplate = request?.IsTemplate ?? (school != null ? false : source.IsTemplate);

        var copy = new Presentation
        {
            SchoolId = school?.Id ?? (request?.TargetSchoolId ?? source.SchoolId),
            Title = newTitle,
            Description = !string.IsNullOrWhiteSpace(source.Description) ? source.Description : $"نسخة من {source.Title}",
            IsTemplate = isTemplate,
            SelectedProducts = source.SelectedProducts,
            VersionNumber = 1,
            CreatedByUserId = _currentUser.UserId ?? source.CreatedByUserId
        };

        foreach (var s in source.Slides)
        {
            var titleAr = s.SlideTitleAr;
            var titleEn = s.SlideTitleEn;
            var contentAr = s.ContentAr;
            var contentEn = s.ContentEn;
            var keyPointsAr = s.KeyPointsArJson;
            var keyPointsEn = s.KeyPointsEnJson;

            if (school != null)
            {
                titleAr = titleAr?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);
                titleEn = titleEn?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);
                contentAr = contentAr?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);
                contentEn = contentEn?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);
                keyPointsAr = keyPointsAr?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);
                keyPointsEn = keyPointsEn?.Replace("[School Name]", school.Name).Replace("[اسم المدرسة]", school.Name);

                if (s.DisplayOrder == 2)
                {
                    ApplySchoolCustomizationAngle(school.Name, ref contentAr, ref keyPointsAr);
                }
            }

            copy.Slides.Add(new PresentationSlide
            {
                SlideTitleAr = titleAr,
                SlideTitleEn = titleEn,
                ContentAr = contentAr,
                ContentEn = contentEn,
                KeyPointsArJson = keyPointsAr,
                KeyPointsEnJson = keyPointsEn,
                ImageUrl = s.ImageUrl,
                Category = s.Category,
                DisplayOrder = s.DisplayOrder,
                IsEnabled = s.IsEnabled,
                Notes = s.Notes
            });
        }

        _db.Presentations.Add(copy);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("DuplicatePresentation", "Presentation", copy.Id.ToString(), new
        {
            SourcePresentationId = id,
            copy.Title,
            copy.IsTemplate,
            TargetSchoolId = copy.SchoolId,
            SlidesCount = copy.Slides.Count
        });

        return await GetPresentationByIdAsync(copy.Id);
    }

    public async Task<ApiResponse<PresentationDto>> DuplicateForSchoolAsync(Guid templateId, Guid schoolId)
    {
        return await DuplicatePresentationAsync(templateId, new DuplicatePresentationRequest
        {
            TargetSchoolId = schoolId,
            IsTemplate = false
        });
    }

    public async Task<ApiResponse<bool>> DeletePresentationAsync(Guid id)
    {
        var pres = await _db.Presentations.Include(p => p.Slides).FirstOrDefaultAsync(p => p.Id == id);
        if (pres == null)
        {
            return ApiResponse<bool>.Fail("Presentation not found.");
        }

        var templateCount = await _db.Presentations.CountAsync(p => p.IsTemplate);
        if (pres.IsTemplate && templateCount <= 1)
        {
            return ApiResponse<bool>.Fail("Cannot delete the only master template in the system.");
        }

        _db.Presentations.Remove(pres);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("DeletePresentation", "Presentation", id.ToString(), new { pres.Title });
        return ApiResponse<bool>.Ok(true, "Presentation deleted successfully.");
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
        if (request.DisplayOrder > 0)
        {
            slide.DisplayOrder = request.DisplayOrder;
        }
        else if (slide.DisplayOrder <= 0)
        {
            slide.DisplayOrder = InferDisplayOrder(slide.SlideTitleAr, slide.SlideTitleEn, 1);
        }
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

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    private static string GenerateSecureToken()
    {
        return Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(16)).ToLowerInvariant();
    }

    public async Task<ApiResponse<PublishResultDto>> PublishAsync(Guid presentationId, PublishPresentationRequest request)
    {
        var pres = await _db.Presentations
            .Include(p => p.School)
            .Include(p => p.Slides.OrderBy(s => s.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == presentationId);

        if (pres == null)
        {
            return ApiResponse<PublishResultDto>.Fail("Presentation not found.");
        }

        pres.VersionNumber += 1;
        pres.PublishedVersionNumber = pres.VersionNumber;
        pres.IsPublished = true;
        pres.PublishedAtUtc = DateTime.UtcNow;

        if (request.ExpiresAtUtc.HasValue)
        {
            pres.ShareTokenExpiresAtUtc = request.ExpiresAtUtc.Value;
        }

        if (string.IsNullOrWhiteSpace(pres.ShareToken) || request.RegenerateToken)
        {
            pres.ShareToken = GenerateSecureToken();
        }

        // Build the immutable published snapshot strictly sanitized
        var publicDto = new PublicPresentationDto
        {
            ShareToken = pres.ShareToken,
            Title = pres.Title,
            Description = pres.Description,
            SchoolName = pres.School?.Name,
            SelectedProducts = pres.SelectedProducts,
            VersionNumber = pres.VersionNumber,
            PublishedAtUtc = pres.PublishedAtUtc.Value,
            ExpiresAtUtc = pres.ShareTokenExpiresAtUtc,
            Slides = pres.Slides
                .Where(s => s.IsEnabled)
                .OrderBy(s => s.DisplayOrder)
                .Select(s => new PublicSlideDto
                {
                    Id = s.Id,
                    SlideTitleAr = s.SlideTitleAr,
                    SlideTitleEn = s.SlideTitleEn,
                    ContentAr = s.ContentAr,
                    ContentEn = s.ContentEn,
                    KeyPointsArJson = s.KeyPointsArJson,
                    KeyPointsEnJson = s.KeyPointsEnJson,
                    ImageUrl = s.ImageUrl,
                    Category = s.Category,
                    DisplayOrder = s.DisplayOrder
                }).ToList()
        };

        pres.PublishedSnapshotJson = JsonSerializer.Serialize(publicDto, JsonOptions);

        // Also record a PresentationVersion history record
        var version = new PresentationVersion
        {
            PresentationId = pres.Id,
            VersionNumber = pres.VersionNumber,
            SnapshotJson = pres.PublishedSnapshotJson,
            CreatedByUserId = _currentUser.UserId ?? Guid.Empty
        };
        _db.PresentationVersions.Add(version);

        pres.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync("PublishPresentation", "Presentation", pres.Id.ToString(), new
        {
            pres.Title,
            pres.ShareToken,
            Version = pres.PublishedVersionNumber
        });

        var result = new PublishResultDto
        {
            PresentationId = pres.Id,
            ShareToken = pres.ShareToken,
            PublicUrl = $"/p/{pres.ShareToken}",
            IsPublished = true,
            PublishedAtUtc = pres.PublishedAtUtc,
            PublishedVersionNumber = pres.PublishedVersionNumber,
            ExpiresAtUtc = pres.ShareTokenExpiresAtUtc
        };

        return ApiResponse<PublishResultDto>.Ok(result, "Presentation published successfully.");
    }

    public async Task<ApiResponse<bool>> UnpublishAsync(Guid presentationId)
    {
        var pres = await _db.Presentations.FindAsync(presentationId);
        if (pres == null)
        {
            return ApiResponse<bool>.Fail("Presentation not found.");
        }

        pres.IsPublished = false;
        pres.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync("UnpublishPresentation", "Presentation", pres.Id.ToString(), new { pres.Title });

        return ApiResponse<bool>.Ok(true, "Presentation access revoked.");
    }

    public async Task<ApiResponse<PublishResultDto>> RegenerateShareTokenAsync(Guid presentationId)
    {
        var pres = await _db.Presentations.FindAsync(presentationId);
        if (pres == null)
        {
            return ApiResponse<PublishResultDto>.Fail("Presentation not found.");
        }

        pres.ShareToken = GenerateSecureToken();

        if (!string.IsNullOrEmpty(pres.PublishedSnapshotJson))
        {
            try
            {
                var snapshot = JsonSerializer.Deserialize<PublicPresentationDto>(pres.PublishedSnapshotJson, JsonOptions);
                if (snapshot != null)
                {
                    snapshot.ShareToken = pres.ShareToken;
                    pres.PublishedSnapshotJson = JsonSerializer.Serialize(snapshot, JsonOptions);
                }
            }
            catch
            {
                // In case of parsing error, ignore
            }
        }

        pres.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync("RegenerateShareToken", "Presentation", pres.Id.ToString(), new { NewToken = pres.ShareToken });

        var result = new PublishResultDto
        {
            PresentationId = pres.Id,
            ShareToken = pres.ShareToken,
            PublicUrl = $"/p/{pres.ShareToken}",
            IsPublished = pres.IsPublished,
            PublishedAtUtc = pres.PublishedAtUtc,
            PublishedVersionNumber = pres.PublishedVersionNumber,
            ExpiresAtUtc = pres.ShareTokenExpiresAtUtc
        };

        return ApiResponse<PublishResultDto>.Ok(result, "Public link regenerated successfully.");
    }

    public async Task<ApiResponse<PresentationAnalyticsSummaryDto>> GetAnalyticsAsync(Guid presentationId)
    {
        var pres = await _db.Presentations
            .AsNoTracking()
            .Include(p => p.Slides.OrderBy(s => s.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == presentationId);

        if (pres == null)
        {
            return ApiResponse<PresentationAnalyticsSummaryDto>.Fail("Presentation not found.");
        }

        var events = await _db.PresentationViewEvents
            .AsNoTracking()
            .Where(e => e.PresentationId == presentationId)
            .ToListAsync();

        var totalViews = events.Count;
        var uniqueSessions = events.Select(e => e.SessionId).Distinct().Count();
        var demoCtaClicks = events.Count(e => e.IsDemoCtaClick);
        var totalEngagementDuration = events.Sum(e => e.DurationSeconds);
        var avgDurationPerSession = uniqueSessions > 0 ? (double)totalEngagementDuration / uniqueSessions : 0;
        var lastViewedAt = events.OrderByDescending(e => e.CreatedAtUtc).Select(e => (DateTime?)e.CreatedAtUtc).FirstOrDefault();

        var slideStats = new List<SlideAnalyticsDto>();
        var slidesList = pres.Slides.OrderBy(s => s.DisplayOrder).ToList();
        for (int i = 0; i < slidesList.Count; i++)
        {
            var s = slidesList[i];
            var slideEvents = events.Where(e => e.SlideIndex == i).ToList();
            var slideViews = slideEvents.Count;
            var slideDur = slideEvents.Sum(e => e.DurationSeconds);
            slideStats.Add(new SlideAnalyticsDto
            {
                SlideIndex = i,
                SlideTitleAr = s.SlideTitleAr,
                SlideTitleEn = s.SlideTitleEn,
                ViewCount = slideViews,
                TotalDurationSeconds = slideDur,
                AverageDurationSeconds = slideViews > 0 ? Math.Round((double)slideDur / slideViews, 1) : 0
            });
        }

        var summary = new PresentationAnalyticsSummaryDto
        {
            PresentationId = pres.Id,
            Title = pres.Title,
            ShareToken = pres.ShareToken,
            IsPublished = pres.IsPublished,
            TotalViews = totalViews,
            UniqueSessions = uniqueSessions,
            DemoCtaClicks = demoCtaClicks,
            TotalEngagementDurationSeconds = totalEngagementDuration,
            AverageDurationPerSessionSeconds = Math.Round(avgDurationPerSession, 1),
            LastViewedAtUtc = lastViewedAt,
            SlideStats = slideStats
        };

        return ApiResponse<PresentationAnalyticsSummaryDto>.Ok(summary);
    }

    public async Task<ApiResponse<PublicPresentationDto>> GetPublicPresentationAsync(string shareToken)
    {
        if (string.IsNullOrWhiteSpace(shareToken))
        {
            return ApiResponse<PublicPresentationDto>.Fail("Invalid share token.");
        }

        var pres = await _db.Presentations
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.ShareToken == shareToken);

        if (pres == null || !pres.IsPublished || string.IsNullOrEmpty(pres.PublishedSnapshotJson))
        {
            return ApiResponse<PublicPresentationDto>.Fail("This presentation is not published or the link is invalid.");
        }

        if (pres.ShareTokenExpiresAtUtc.HasValue && pres.ShareTokenExpiresAtUtc.Value < DateTime.UtcNow)
        {
            return ApiResponse<PublicPresentationDto>.Fail("This presentation link has expired.");
        }

        PublicPresentationDto? dto;
        try
        {
            dto = JsonSerializer.Deserialize<PublicPresentationDto>(pres.PublishedSnapshotJson, JsonOptions);
        }
        catch
        {
            return ApiResponse<PublicPresentationDto>.Fail("Failed to load published snapshot.");
        }

        if (dto == null)
        {
            return ApiResponse<PublicPresentationDto>.Fail("Published presentation data is unavailable.");
        }

        // Keep expiration time synchronized with live DB state
        dto.ExpiresAtUtc = pres.ShareTokenExpiresAtUtc;

        return ApiResponse<PublicPresentationDto>.Ok(dto);
    }

    public async Task<ApiResponse<bool>> RecordViewEventAsync(string shareToken, RecordViewEventRequest request)
    {
        if (string.IsNullOrWhiteSpace(shareToken))
        {
            return ApiResponse<bool>.Fail("Invalid share token.");
        }

        var pres = await _db.Presentations
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.ShareToken == shareToken && p.IsPublished);

        if (pres == null)
        {
            return ApiResponse<bool>.Fail("Presentation not available.");
        }

        var viewEvent = new PresentationViewEvent
        {
            PresentationId = pres.Id,
            ShareToken = shareToken,
            SessionId = string.IsNullOrWhiteSpace(request.SessionId) ? Guid.NewGuid().ToString("N") : request.SessionId.Trim(),
            SlideIndex = request.SlideIndex,
            DurationSeconds = Math.Clamp(request.DurationSeconds, 0, 3600),
            IsDemoCtaClick = request.IsDemoCtaClick,
            Language = request.Language != null && request.Language.Length > 16 ? request.Language[..16] : request.Language,
            ReferrerDomain = request.ReferrerDomain != null && request.ReferrerDomain.Length > 256 ? request.ReferrerDomain[..256] : request.ReferrerDomain
        };

        _db.PresentationViewEvents.Add(viewEvent);
        await _db.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true);
    }

    public async Task<ApiResponse<PublicLeadInquiryResultDto>> SubmitPublicInquiryAsync(string shareToken, PublicLeadInquiryRequest request)
    {
        if (!string.IsNullOrEmpty(request.Honeypot))
        {
            return ApiResponse<PublicLeadInquiryResultDto>.Ok(new PublicLeadInquiryResultDto
            {
                Success = true,
                MessageAr = "تم استلام طلبكم بنجاح وسيتواصل معكم فريقنا قريباً.",
                MessageEn = "Your inquiry has been received. Our team will contact you shortly."
            });
        }

        if (string.IsNullOrWhiteSpace(request.SchoolName) ||
            string.IsNullOrWhiteSpace(request.ContactName) ||
            string.IsNullOrWhiteSpace(request.ContactPhone))
        {
            return ApiResponse<PublicLeadInquiryResultDto>.Fail("School name, contact name, and phone number are required.");
        }

        var pres = await _db.Presentations
            .Include(p => p.School)
            .FirstOrDefaultAsync(p => p.ShareToken == shareToken && p.IsPublished);

        if (pres == null)
        {
            return ApiResponse<PublicLeadInquiryResultDto>.Fail("Presentation not available.");
        }

        Guid? targetSchoolId = pres.SchoolId;

        if (!targetSchoolId.HasValue)
        {
            var newSchool = new School
            {
                Name = request.SchoolName.Trim(),
                Phone = request.ContactPhone.Trim(),
                Email = request.ContactEmail?.Trim(),
                SchoolType = SchoolType.Private,
                Source = LeadSource.Website,
                SalesStatus = SalesStatus.New,
                GeneralNotes = $"تم تسجيل المدرسة تلقائياً عبر طلب ديمو من الرابط العام للبرزنتيشن: {pres.Title}. المنسق: {request.ContactName} ({request.JobTitle}). الرسالة: {request.Message}",
                CreatedByUserId = pres.CreatedByUserId
            };
            _db.Schools.Add(newSchool);
            await _db.SaveChangesAsync();
            targetSchoolId = newSchool.Id;
        }

        var inquiry = new PresentationPublicInquiry
        {
            PresentationId = pres.Id,
            SchoolId = targetSchoolId,
            ShareToken = shareToken,
            SchoolName = request.SchoolName.Trim(),
            ContactName = request.ContactName.Trim(),
            ContactPhone = request.ContactPhone.Trim(),
            ContactEmail = request.ContactEmail?.Trim(),
            JobTitle = request.JobTitle?.Trim(),
            Message = request.Message?.Trim(),
            InterestedProduct = request.InterestedProduct,
            IsReviewed = false
        };
        _db.PresentationPublicInquiries.Add(inquiry);

        var activity = new Activity
        {
            SchoolId = targetSchoolId.Value,
            UserId = pres.CreatedByUserId,
            Type = ActivityType.Meeting,
            Subject = "طلب عرض توضيحي (Demo) عبر الرابط العام للبرزنتيشن",
            Description = $"طلب ديمو مرسل من الرابط العام:\nالاسم: {request.ContactName} ({request.JobTitle})\nالهاتف: {request.ContactPhone}\nالبريد: {request.ContactEmail}\nالاهتمام: {request.InterestedProduct}\nالرسالة: {request.Message}",
            IsCompleted = false
        };
        _db.Activities.Add(activity);

        var followUp = new FollowUp
        {
            SchoolId = targetSchoolId.Value,
            AssignedToUserId = pres.School?.AssignedToUserId ?? pres.CreatedByUserId,
            DueDate = DateTime.UtcNow.AddDays(1),
            Priority = FollowUpPriority.High,
            Status = FollowUpStatus.Pending,
            Title = $"متابعة طلب ديمو جديد: {request.ContactName} ({request.SchoolName})",
            Notes = $"تم إرسال الطلب عبر رابط العرض العام: {pres.Title}.\nهاتف للتواصل: {request.ContactPhone}"
        };
        _db.FollowUps.Add(followUp);

        await _db.SaveChangesAsync();

        return ApiResponse<PublicLeadInquiryResultDto>.Ok(new PublicLeadInquiryResultDto
        {
            Success = true,
            MessageAr = "شكراً لكم! تم استلام طلبكم بنجاح وسيتواصل معكم مستشار الحلول التعليمية في أقرب وقت.",
            MessageEn = "Thank you! Your demo request has been received, and our educational solutions consultant will contact you shortly."
        });
    }

    private static void ApplySchoolCustomizationAngle(string schoolName, ref string contentAr, ref string? keyPointsAr)
    {
        if (schoolName.Contains("Helsinki", StringComparison.OrdinalIgnoreCase) || schoolName.Contains("هلسنكي", StringComparison.OrdinalIgnoreCase))
        {
            contentAr = "التركيز على تجربة أولياء الأمور وتطوير قنوات التواصل والخدمات الرقمية للمدرسة.";
            keyPointsAr = "[\"تطوير شامل لتجربة أولياء الأمور والطلاب\", \"قنوات تواصل رقمية فورية مع الإدارة والمعلمين\", \"خدمات دفع ومتابعة أكاديمية متكاملة\"]";
        }
        else if (schoolName.Contains("Alyan", StringComparison.OrdinalIgnoreCase) || schoolName.Contains("عليان", StringComparison.OrdinalIgnoreCase))
        {
            contentAr = "تطوير نظام إدارة العمليات المدرسية الشامل وربط الخدمات بأكاديمية روتاكا للبرمجة وتنمية مهارات الطلاب.";
            keyPointsAr = "[\"أتمتة العمليات المدرسية والكنترول والقبول\", \"ربط برامج المدرسة بأكاديمية روتاكا لتعليم التكنولوجيا\", \"تنمية مهارات التفكير المنطقي لطلاب المدرسة\"]";
        }
        else if (schoolName.Contains("Smart", StringComparison.OrdinalIgnoreCase) || schoolName.Contains("الذكية", StringComparison.OrdinalIgnoreCase))
        {
            contentAr = "الانتقال السلس من مجرد نظام LMS محدود إلى منظومة إدارة مدرسية ومجتمعية شاملة.";
            keyPointsAr = "[\"تكامل سلس يفوق نظم LMS المحدودة\", \"إدارة مالية وإدارية وأكاديمية في منصة موحدة\", \"ربط كافة أطراف المجتمع المدرسي\"]";
        }
    }
}
