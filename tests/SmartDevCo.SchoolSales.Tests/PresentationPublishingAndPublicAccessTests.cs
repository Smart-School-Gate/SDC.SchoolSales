using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;
using SmartDevCo.SchoolSales.Infrastructure.Services;
using Xunit;

namespace SmartDevCo.SchoolSales.Tests;

public class MockCurrentUserService : ICurrentUserService
{
    public Guid? UserId { get; set; } = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public string? Email { get; set; } = "admin@rootaca.com";
    public IReadOnlyList<string> Roles => new List<string> { "SuperAdmin" };
    public bool IsAuthenticated => true;
    public bool IsSuperAdmin => true;
    public bool IsSalesManager => false;
    public bool IsSalesRepresentative => false;
}

public class MockAuditService : IAuditService
{
    public Task LogAsync(string action, string entityType, string? entityId = null, object? details = null, string? ipAddress = null)
    {
        return Task.CompletedTask;
    }
}

public class PresentationPublishingAndPublicAccessTests
{
    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new ApplicationDbContext(options);
        return context;
    }

    [Fact]
    public async Task PublishAsync_CreatesImmutableSnapshot_AndDraftEditsDoNotAffectPublicView()
    {
        // Arrange
        using var db = CreateInMemoryDbContext();
        var currentUserService = new MockCurrentUserService();
        var auditService = new MockAuditService();
        var service = new PresentationService(db, currentUserService, auditService);

        var school = new School
        {
            Id = Guid.NewGuid(),
            Name = "Al-Rowad International School",
            City = "Cairo",
            CreatedByUserId = currentUserService.UserId!.Value
        };
        db.Schools.Add(school);

        var presentation = new Presentation
        {
            Id = Guid.NewGuid(),
            SchoolId = school.Id,
            Title = "Rootaca Smart School Deck",
            Description = "Initial Pitch",
            IsTemplate = false,
            CreatedByUserId = currentUserService.UserId!.Value,
            VersionNumber = 1
        };
        db.Presentations.Add(presentation);

        var slide1 = new PresentationSlide
        {
            Id = Guid.NewGuid(),
            PresentationId = presentation.Id,
            SlideTitleAr = "العنوان العربي الأصلي",
            SlideTitleEn = "Original English Title",
            ContentAr = "محتوى عربي أصلي",
            ContentEn = "Original English Content",
            Notes = "CONFIDENTIAL INTERNAL SALES NOTES",
            DisplayOrder = 1,
            IsEnabled = true
        };
        db.PresentationSlides.Add(slide1);
        await db.SaveChangesAsync();

        // Act 1: Publish the presentation
        var publishRes = await service.PublishAsync(presentation.Id, new PublishPresentationRequest());

        // Assert 1: Successful publication
        Assert.True(publishRes.Success);
        Assert.NotNull(publishRes.Data);
        Assert.True(publishRes.Data.IsPublished);
        Assert.False(string.IsNullOrWhiteSpace(publishRes.Data.ShareToken));
        Assert.Equal(2, publishRes.Data.PublishedVersionNumber);

        var shareToken = publishRes.Data.ShareToken;

        // Act 2: Perform draft modifications in Admin
        slide1.SlideTitleAr = "العنوان المعدل في المسودة (غير معتمد)";
        slide1.Notes = "SECRET COMMISSION INFO";
        await db.SaveChangesAsync();

        // Act 3: Public visitor retrieves presentation via share token
        var publicRes = await service.GetPublicPresentationAsync(shareToken);

        // Assert 3: Public view reflects ONLY the published immutable snapshot
        Assert.True(publicRes.Success);
        Assert.NotNull(publicRes.Data);
        Assert.Equal("Rootaca Smart School Deck", publicRes.Data.Title);
        Assert.Equal("Al-Rowad International School", publicRes.Data.SchoolName);
        Assert.Single(publicRes.Data.Slides);

        var publicSlide = publicRes.Data.Slides[0];
        // Must match original published title, NOT the modified draft title!
        Assert.Equal("العنوان العربي الأصلي", publicSlide.SlideTitleAr);
        Assert.Equal("Original English Title", publicSlide.SlideTitleEn);
    }

    [Fact]
    public async Task PublicPresentation_NeverExposesInternalNotesOrSensitiveCRMData()
    {
        // Arrange
        using var db = CreateInMemoryDbContext();
        var currentUserService = new MockCurrentUserService();
        var auditService = new MockAuditService();
        var service = new PresentationService(db, currentUserService, auditService);

        var pres = new Presentation
        {
            Id = Guid.NewGuid(),
            Title = "Public Sales Deck",
            IsTemplate = true,
            CreatedByUserId = currentUserService.UserId!.Value
        };
        db.Presentations.Add(pres);

        var slide = new PresentationSlide
        {
            Id = Guid.NewGuid(),
            PresentationId = pres.Id,
            SlideTitleAr = "من نحن",
            SlideTitleEn = "About Us",
            ContentAr = "محتوى",
            ContentEn = "Content",
            Notes = "INTERNAL ONLY: Do not discount more than 15%. Target budget 500,000 EGP.",
            DisplayOrder = 1,
            IsEnabled = true
        };
        db.PresentationSlides.Add(slide);
        await db.SaveChangesAsync();

        // Act
        var publishRes = await service.PublishAsync(pres.Id, new PublishPresentationRequest());
        var publicRes = await service.GetPublicPresentationAsync(publishRes.Data!.ShareToken);

        // Assert
        Assert.True(publicRes.Success);
        var json = JsonSerializer.Serialize(publicRes.Data);

        // Verify strictly that internal notes and secrets do not leak
        Assert.DoesNotContain("INTERNAL ONLY", json);
        Assert.DoesNotContain("discount", json);
        Assert.DoesNotContain("500,000", json);
        Assert.DoesNotContain("Notes", json);
        Assert.DoesNotContain(currentUserService.UserId.ToString()!, json);
    }

    [Fact]
    public async Task UnpublishAsync_ImmediatelyRevokesPublicAccess()
    {
        // Arrange
        using var db = CreateInMemoryDbContext();
        var service = new PresentationService(db, new MockCurrentUserService(), new MockAuditService());

        var pres = new Presentation
        {
            Id = Guid.NewGuid(),
            Title = "Deck to Revoke",
            CreatedByUserId = Guid.NewGuid()
        };
        db.Presentations.Add(pres);
        await db.SaveChangesAsync();

        var pubRes = await service.PublishAsync(pres.Id, new PublishPresentationRequest());
        var token = pubRes.Data!.ShareToken;

        // Verify accessible
        var checkBefore = await service.GetPublicPresentationAsync(token);
        Assert.True(checkBefore.Success);

        // Act: Unpublish
        var unpubRes = await service.UnpublishAsync(pres.Id);
        Assert.True(unpubRes.Success);

        // Assert: Public link is immediately revoked
        var checkAfter = await service.GetPublicPresentationAsync(token);
        Assert.False(checkAfter.Success);
    }

    [Fact]
    public async Task RegenerateShareTokenAsync_InvalidatesPreviousToken()
    {
        // Arrange
        using var db = CreateInMemoryDbContext();
        var service = new PresentationService(db, new MockCurrentUserService(), new MockAuditService());

        var pres = new Presentation
        {
            Id = Guid.NewGuid(),
            Title = "Deck for Token Regen",
            CreatedByUserId = Guid.NewGuid()
        };
        db.Presentations.Add(pres);
        await db.SaveChangesAsync();

        var pubRes = await service.PublishAsync(pres.Id, new PublishPresentationRequest());
        var oldToken = pubRes.Data!.ShareToken;

        // Act: Regenerate token
        var regenRes = await service.RegenerateShareTokenAsync(pres.Id);
        Assert.True(regenRes.Success);
        var newToken = regenRes.Data!.ShareToken;

        Assert.NotEqual(oldToken, newToken);

        // Assert: Old token is dead, new token works
        var oldCheck = await service.GetPublicPresentationAsync(oldToken);
        Assert.False(oldCheck.Success);

        var newCheck = await service.GetPublicPresentationAsync(newToken);
        Assert.True(newCheck.Success);
    }

    [Fact]
    public async Task Analytics_RecordsAndAggregatesSessions_AndDemoClicksAccurately()
    {
        // Arrange
        using var db = CreateInMemoryDbContext();
        var service = new PresentationService(db, new MockCurrentUserService(), new MockAuditService());

        var pres = new Presentation
        {
            Id = Guid.NewGuid(),
            Title = "Analytics Deck",
            CreatedByUserId = Guid.NewGuid()
        };
        db.Presentations.Add(pres);
        db.PresentationSlides.Add(new PresentationSlide
        {
            Id = Guid.NewGuid(),
            PresentationId = pres.Id,
            SlideTitleAr = "الشريحة 1",
            SlideTitleEn = "Slide 1",
            ContentAr = "C1",
            ContentEn = "E1",
            DisplayOrder = 1,
            IsEnabled = true
        });
        db.PresentationSlides.Add(new PresentationSlide
        {
            Id = Guid.NewGuid(),
            PresentationId = pres.Id,
            SlideTitleAr = "الشريحة 2",
            SlideTitleEn = "Slide 2",
            ContentAr = "C2",
            ContentEn = "E2",
            DisplayOrder = 2,
            IsEnabled = true
        });
        await db.SaveChangesAsync();

        var pubRes = await service.PublishAsync(pres.Id, new PublishPresentationRequest());
        var token = pubRes.Data!.ShareToken;

        // Act: Simulate telemetry events
        await service.RecordViewEventAsync(token, new RecordViewEventRequest
        {
            SessionId = "session_A",
            SlideIndex = 0,
            DurationSeconds = 15,
            IsDemoCtaClick = false
        });

        await service.RecordViewEventAsync(token, new RecordViewEventRequest
        {
            SessionId = "session_A",
            SlideIndex = 1,
            DurationSeconds = 25,
            IsDemoCtaClick = true // User clicked CTA on slide 2
        });

        await service.RecordViewEventAsync(token, new RecordViewEventRequest
        {
            SessionId = "session_B",
            SlideIndex = 0,
            DurationSeconds = 20,
            IsDemoCtaClick = false
        });

        // Assert Analytics summary
        var analyticsRes = await service.GetAnalyticsAsync(pres.Id);
        Assert.True(analyticsRes.Success);
        var stats = analyticsRes.Data!;

        Assert.Equal(3, stats.TotalViews);
        Assert.Equal(2, stats.UniqueSessions); // session_A and session_B
        Assert.Equal(1, stats.DemoCtaClicks);
        Assert.Equal(60, stats.TotalEngagementDurationSeconds); // 15 + 25 + 20
        Assert.Equal(30.0, stats.AverageDurationPerSessionSeconds); // 60 / 2
        Assert.Equal(2, stats.SlideStats.Count);
        Assert.Equal(2, stats.SlideStats[0].ViewCount); // slide 0 viewed twice
        Assert.Equal(1, stats.SlideStats[1].ViewCount); // slide 1 viewed once
    }

    [Fact]
    public async Task SubmitPublicInquiry_CreatesInquiry_Activity_AndHighPriorityFollowUpInCrm()
    {
        // Arrange
        using var db = CreateInMemoryDbContext();
        var currentUserService = new MockCurrentUserService();
        var service = new PresentationService(db, currentUserService, new MockAuditService());

        var school = new School
        {
            Id = Guid.NewGuid(),
            Name = "Manarat Cairo School",
            CreatedByUserId = currentUserService.UserId!.Value
        };
        db.Schools.Add(school);

        var pres = new Presentation
        {
            Id = Guid.NewGuid(),
            SchoolId = school.Id,
            Title = "School Specific Pitch",
            CreatedByUserId = currentUserService.UserId!.Value
        };
        db.Presentations.Add(pres);
        await db.SaveChangesAsync();

        var pubRes = await service.PublishAsync(pres.Id, new PublishPresentationRequest());
        var token = pubRes.Data!.ShareToken;

        // Act: Submit public inquiry from viewer
        var inquiryRes = await service.SubmitPublicInquiryAsync(token, new PublicLeadInquiryRequest
        {
            SchoolName = "Manarat Cairo School",
            ContactName = "Dr. Ahmed Mansour",
            ContactPhone = "01012345678",
            ContactEmail = "a.mansour@manarat.edu.eg",
            JobTitle = "School General Director",
            InterestedProduct = ProductInterest.Both,
            Message = "We would like a full system live demonstration next Tuesday."
        });

        // Assert
        Assert.True(inquiryRes.Success);

        // Verify PresentationPublicInquiry record
        var inquiryRecord = await db.PresentationPublicInquiries.FirstOrDefaultAsync(i => i.ShareToken == token);
        Assert.NotNull(inquiryRecord);
        Assert.Equal("Dr. Ahmed Mansour", inquiryRecord.ContactName);
        Assert.Equal(school.Id, inquiryRecord.SchoolId);
        Assert.False(inquiryRecord.IsReviewed);

        // Verify CRM Activity
        var activity = await db.Activities.FirstOrDefaultAsync(a => a.SchoolId == school.Id);
        Assert.NotNull(activity);
        Assert.Contains("Dr. Ahmed Mansour", activity.Description);
        Assert.False(activity.IsCompleted);

        // Verify Pending High-Priority Follow-Up
        var followUp = await db.FollowUps.FirstOrDefaultAsync(f => f.SchoolId == school.Id);
        Assert.NotNull(followUp);
        Assert.Equal(FollowUpPriority.High, followUp.Priority);
        Assert.Equal(FollowUpStatus.Pending, followUp.Status);
        Assert.Contains("Dr. Ahmed Mansour", followUp.Title);
    }

    [Fact]
    public async Task SubmitPublicInquiry_SilentlySuppressesSpam_WhenHoneypotIsFilled()
    {
        // Arrange
        using var db = CreateInMemoryDbContext();
        var service = new PresentationService(db, new MockCurrentUserService(), new MockAuditService());

        var pres = new Presentation
        {
            Id = Guid.NewGuid(),
            Title = "Bot Protected Deck",
            CreatedByUserId = Guid.NewGuid()
        };
        db.Presentations.Add(pres);
        await db.SaveChangesAsync();

        var pubRes = await service.PublishAsync(pres.Id, new PublishPresentationRequest());
        var token = pubRes.Data!.ShareToken;

        // Act: Bot fills honeypot
        var inquiryRes = await service.SubmitPublicInquiryAsync(token, new PublicLeadInquiryRequest
        {
            SchoolName = "Spam Academy",
            ContactName = "Spam Bot",
            ContactPhone = "123456",
            Honeypot = "http://spam-link.ru"
        });

        // Assert: Returns success message to avoid alerting bot, but saves NO records
        Assert.True(inquiryRes.Success);
        var count = await db.PresentationPublicInquiries.CountAsync();
        Assert.Equal(0, count);
        var activitiesCount = await db.Activities.CountAsync();
        Assert.Equal(0, activitiesCount);
    }

    [Fact]
    public async Task CreateVisitAsync_SuccessfullyCreatesVisit_WithUtcDatesAndNullableFollowUp()
    {
        // Arrange
        using var db = CreateInMemoryDbContext();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "rep@rootaca.com",
            FullName = "Ahmed Rep",
            PasswordHash = "hash"
        };
        db.Users.Add(user);

        var school = new School
        {
            Id = Guid.NewGuid(),
            Name = "New Horizon School",
            CreatedByUserId = user.Id,
            SalesStatus = SalesStatus.New
        };
        db.Schools.Add(school);
        await db.SaveChangesAsync();

        var mockUser = new MockCurrentUserService { UserId = user.Id };
        var visitService = new VisitService(db, mockUser, new MockAuditService());

        // Act: Create visit with Unspecified Kind DateTime and null follow-up date
        var req = new CreateVisitRequest
        {
            SchoolId = school.Id,
            VisitDate = new DateTime(2026, 11, 3, 10, 30, 0, DateTimeKind.Unspecified),
            ContactPerson = "Mr. Yasser",
            ContactPosition = "Principal",
            DecisionMakerReached = true,
            InterestedProducts = ProductInterest.Both,
            VisitOutcome = VisitOutcomeType.DemoRequested,
            Notes = "Requested comprehensive demo for department heads",
            NextAction = "Prepare demo deck",
            NextFollowUpDate = null
        };

        var result = await visitService.CreateVisitAsync(req);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Mr. Yasser", result.Data.ContactPerson);
        Assert.Equal(DateTimeKind.Utc, result.Data.VisitDate.Kind);

        // Check DB records
        var visit = await db.Visits.FirstOrDefaultAsync(v => v.SchoolId == school.Id);
        Assert.NotNull(visit);
        Assert.Equal(DateTimeKind.Utc, visit.VisitDate.Kind);
        Assert.Equal(user.Id, visit.RepresentativeId);

        // School status auto updated
        var updatedSchool = await db.Schools.FindAsync(school.Id);
        Assert.Equal(SalesStatus.DemoScheduled, updatedSchool!.SalesStatus);

        // Activity logged
        var activity = await db.Activities.FirstOrDefaultAsync(a => a.SchoolId == school.Id);
        Assert.NotNull(activity);
        Assert.Equal(ActivityType.Visit, activity.Type);
        Assert.Equal(DateTimeKind.Utc, activity.CompletedAtUtc.Value.Kind);
    }

    [Fact]
    public async Task CreateVisitAsync_WithFollowUpDate_CreatesFollowUpTaskWithUtcDueDate()
    {
        // Arrange
        using var db = CreateInMemoryDbContext();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "manager@rootaca.com",
            FullName = "Sara Manager",
            PasswordHash = "hash"
        };
        db.Users.Add(user);

        var school = new School
        {
            Id = Guid.NewGuid(),
            Name = "Al-Amal Private School",
            CreatedByUserId = user.Id,
            SalesStatus = SalesStatus.New
        };
        db.Schools.Add(school);
        await db.SaveChangesAsync();

        var visitService = new VisitService(db, new MockCurrentUserService { UserId = null }, new MockAuditService());

        var req = new CreateVisitRequest
        {
            SchoolId = school.Id,
            VisitDate = new DateTime(2026, 11, 4, 9, 0, 0, DateTimeKind.Unspecified),
            ContactPerson = "Eng. Tarek",
            ContactPosition = "IT Director",
            DecisionMakerReached = true,
            InterestedProducts = ProductInterest.SmartSchool,
            VisitOutcome = VisitOutcomeType.ProposalRequested,
            Notes = "Requested commercial proposal",
            NextAction = "Send proposal email",
            NextFollowUpDate = new DateTime(2026, 11, 10, 12, 0, 0, DateTimeKind.Unspecified)
        };

        var result = await visitService.CreateVisitAsync(req);

        // Assert
        Assert.True(result.Success);
        var followUp = await db.FollowUps.FirstOrDefaultAsync(f => f.SchoolId == school.Id);
        Assert.NotNull(followUp);
        Assert.Equal(DateTimeKind.Utc, followUp.DueDate.Kind);
        Assert.Equal(user.Id, followUp.AssignedToUserId);
        Assert.Equal(FollowUpStatus.Pending, followUp.Status);
    }

    [Fact]
    public async Task DuplicatePresentationAsync_ClonesPresentation_WithAllSlidesAndNewTitle()
    {
        // Arrange
        using var db = CreateInMemoryDbContext();
        var user = new User { Id = Guid.NewGuid(), Email = "admin@rootaca.com", FullName = "Admin" };
        db.Users.Add(user);

        var originalPres = new Presentation
        {
            Id = Guid.NewGuid(),
            Title = "Master Sales Deck",
            Description = "Full product overview",
            IsTemplate = true,
            SelectedProducts = ProductInterest.Both,
            CreatedByUserId = user.Id
        };
        db.Presentations.Add(originalPres);

        db.PresentationSlides.Add(new PresentationSlide
        {
            Id = Guid.NewGuid(),
            PresentationId = originalPres.Id,
            SlideTitleAr = "من نحن",
            SlideTitleEn = "About Us",
            ContentAr = "محتوى تعريفي",
            DisplayOrder = 1,
            IsEnabled = true
        });

        db.PresentationSlides.Add(new PresentationSlide
        {
            Id = Guid.NewGuid(),
            PresentationId = originalPres.Id,
            SlideTitleAr = "المنتجات والمزايا",
            SlideTitleEn = "Features",
            ContentAr = "شرح المزايا",
            DisplayOrder = 2,
            IsEnabled = true
        });

        await db.SaveChangesAsync();

        var service = new PresentationService(db, new MockCurrentUserService { UserId = user.Id }, new MockAuditService());

        // Act: Duplicate presentation
        var dupResult = await service.DuplicatePresentationAsync(originalPres.Id, new DuplicatePresentationRequest
        {
            NewTitle = "Custom Deck - Q4 2026",
            IsTemplate = false
        });

        // Assert
        Assert.True(dupResult.Success);
        Assert.NotNull(dupResult.Data);
        Assert.Equal("Custom Deck - Q4 2026", dupResult.Data.Title);
        Assert.False(dupResult.Data.IsTemplate);
        Assert.Equal(2, dupResult.Data.Slides.Count);
        Assert.Equal("من نحن", dupResult.Data.Slides[0].SlideTitleAr);
        Assert.Equal("المنتجات والمزايا", dupResult.Data.Slides[1].SlideTitleAr);

        // Verify distinct IDs in database
        var copiedPres = await db.Presentations.Include(p => p.Slides).FirstOrDefaultAsync(p => p.Id == dupResult.Data.Id);
        Assert.NotNull(copiedPres);
        Assert.NotEqual(originalPres.Id, copiedPres.Id);
        Assert.Equal(2, copiedPres.Slides.Count);
        Assert.All(copiedPres.Slides, s => Assert.Equal(copiedPres.Id, s.PresentationId));
    }
}
