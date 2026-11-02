using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Core.Entities;

namespace SmartDevCo.SchoolSales.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<School> Schools => Set<School>();
    public DbSet<SchoolContact> SchoolContacts => Set<SchoolContact>();
    public DbSet<SalesTeam> SalesTeams => Set<SalesTeam>();
    public DbSet<SalesTeamMember> SalesTeamMembers => Set<SalesTeamMember>();
    public DbSet<SchoolAssignment> SchoolAssignments => Set<SchoolAssignment>();
    public DbSet<SalesTarget> SalesTargets => Set<SalesTarget>();

    public DbSet<QuestionCategory> QuestionCategories => Set<QuestionCategory>();
    public DbSet<QuestionTemplate> QuestionTemplates => Set<QuestionTemplate>();
    public DbSet<VisitAnswer> VisitAnswers => Set<VisitAnswer>();

    public DbSet<Visit> Visits => Set<Visit>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<FollowUp> FollowUps => Set<FollowUp>();

    public DbSet<Presentation> Presentations => Set<Presentation>();
    public DbSet<PresentationSlide> PresentationSlides => Set<PresentationSlide>();
    public DbSet<PresentationVersion> PresentationVersions => Set<PresentationVersion>();

    public DbSet<QACategory> QACategories => Set<QACategory>();
    public DbSet<QATemplate> QATemplates => Set<QATemplate>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Identity
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(50);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("permissions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("user_roles");
            entity.HasKey(ur => new { ur.UserId, ur.RoleId });

            entity.HasOne(ur => ur.User)
                  .WithMany(u => u.UserRoles)
                  .HasForeignKey(ur => ur.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ur => ur.Role)
                  .WithMany(r => r.UserRoles)
                  .HasForeignKey(ur => ur.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("role_permissions");
            entity.HasKey(rp => new { rp.RoleId, rp.PermissionId });

            entity.HasOne(rp => rp.Role)
                  .WithMany(r => r.RolePermissions)
                  .HasForeignKey(rp => rp.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(rp => rp.Permission)
                  .WithMany(p => p.RolePermissions)
                  .HasForeignKey(rp => rp.PermissionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);

            entity.HasOne(rt => rt.User)
                  .WithMany(u => u.RefreshTokens)
                  .HasForeignKey(rt => rt.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // CRM: Schools
        modelBuilder.Entity<School>(entity =>
        {
            entity.ToTable("schools");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(256);
            entity.Property(e => e.City).IsRequired().HasMaxLength(100);
            entity.Property(e => e.District).HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.Website).HasMaxLength(256);
            entity.Property(e => e.Address).HasMaxLength(500);

            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.City);
            entity.HasIndex(e => e.SalesStatus);
            entity.HasIndex(e => e.AssignedToUserId);
            entity.HasIndex(e => e.CreatedByUserId);

            entity.HasOne(s => s.CreatedByUser)
                  .WithMany(u => u.CreatedSchools)
                  .HasForeignKey(s => s.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(s => s.AssignedToUser)
                  .WithMany(u => u.AssignedSchools)
                  .HasForeignKey(s => s.AssignedToUserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SchoolContact>(entity =>
        {
            entity.ToTable("school_contacts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(256);
            entity.Property(e => e.JobTitle).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(256);

            entity.HasIndex(e => e.SchoolId);

            entity.HasOne(c => c.School)
                  .WithMany(s => s.Contacts)
                  .HasForeignKey(c => c.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SalesTeam>(entity =>
        {
            entity.ToTable("sales_teams");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);

            entity.HasOne(st => st.Manager)
                  .WithMany()
                  .HasForeignKey(st => st.ManagerId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SalesTeamMember>(entity =>
        {
            entity.ToTable("sales_team_members");
            entity.HasKey(m => new { m.SalesTeamId, m.UserId });

            entity.HasOne(m => m.SalesTeam)
                  .WithMany(t => t.Members)
                  .HasForeignKey(m => m.SalesTeamId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.User)
                  .WithMany(u => u.TeamMemberships)
                  .HasForeignKey(m => m.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SchoolAssignment>(entity =>
        {
            entity.ToTable("school_assignments");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SchoolId);
            entity.HasIndex(e => e.AssignedToUserId);

            entity.HasOne(sa => sa.School)
                  .WithMany(s => s.Assignments)
                  .HasForeignKey(sa => sa.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(sa => sa.AssignedToUser)
                  .WithMany(u => u.ReceivedAssignments)
                  .HasForeignKey(sa => sa.AssignedToUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(sa => sa.AssignedByUser)
                  .WithMany(u => u.GivenAssignments)
                  .HasForeignKey(sa => sa.AssignedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SalesTarget>(entity =>
        {
            entity.ToTable("sales_targets");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.PeriodType, e.PeriodYear, e.PeriodNumber }).IsUnique();

            entity.HasOne(st => st.User)
                  .WithMany(u => u.SalesTargets)
                  .HasForeignKey(st => st.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(st => st.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(st => st.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<QuestionCategory>(entity =>
        {
            entity.ToTable("question_categories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NameAr).IsRequired().HasMaxLength(200);
            entity.Property(e => e.NameEn).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<QuestionTemplate>(entity =>
        {
            entity.ToTable("question_templates");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuestionAr).IsRequired().HasMaxLength(500);
            entity.Property(e => e.QuestionEn).IsRequired().HasMaxLength(500);

            entity.HasOne(qt => qt.Category)
                  .WithMany(c => c.Questions)
                  .HasForeignKey(qt => qt.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Visit>(entity =>
        {
            entity.ToTable("visits");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ContactPerson).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ContactPosition).HasMaxLength(150);

            entity.HasIndex(e => e.SchoolId);
            entity.HasIndex(e => e.RepresentativeId);
            entity.HasIndex(e => e.VisitDate);

            entity.HasOne(v => v.School)
                  .WithMany(s => s.Visits)
                  .HasForeignKey(v => v.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(v => v.Representative)
                  .WithMany(u => u.Visits)
                  .HasForeignKey(v => v.RepresentativeId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<VisitAnswer>(entity =>
        {
            entity.ToTable("visit_answers");
            entity.HasKey(e => e.Id);

            entity.HasIndex(e => e.VisitId);
            entity.HasIndex(e => e.SchoolId);

            entity.HasOne(va => va.Visit)
                  .WithMany(v => v.Answers)
                  .HasForeignKey(va => va.VisitId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(va => va.School)
                  .WithMany(s => s.VisitAnswers)
                  .HasForeignKey(va => va.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(va => va.QuestionTemplate)
                  .WithMany()
                  .HasForeignKey(va => va.QuestionTemplateId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Activity>(entity =>
        {
            entity.ToTable("activities");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(256);

            entity.HasIndex(e => e.SchoolId);
            entity.HasIndex(e => e.UserId);

            entity.HasOne(a => a.School)
                  .WithMany(s => s.Activities)
                  .HasForeignKey(a => a.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.User)
                  .WithMany(u => u.Activities)
                  .HasForeignKey(a => a.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<FollowUp>(entity =>
        {
            entity.ToTable("follow_ups");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(256);

            entity.HasIndex(e => e.SchoolId);
            entity.HasIndex(e => e.AssignedToUserId);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => e.Status);

            entity.HasOne(f => f.School)
                  .WithMany(s => s.FollowUps)
                  .HasForeignKey(f => f.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(f => f.AssignedToUser)
                  .WithMany(u => u.FollowUps)
                  .HasForeignKey(f => f.AssignedToUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Presentation>(entity =>
        {
            entity.ToTable("presentations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(256);

            entity.HasIndex(e => e.SchoolId);

            entity.HasOne(p => p.School)
                  .WithMany(s => s.Presentations)
                  .HasForeignKey(p => p.SchoolId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(p => p.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PresentationSlide>(entity =>
        {
            entity.ToTable("presentation_slides");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SlideTitleAr).IsRequired().HasMaxLength(256);
            entity.Property(e => e.SlideTitleEn).IsRequired().HasMaxLength(256);

            entity.HasIndex(e => e.PresentationId);

            entity.HasOne(s => s.Presentation)
                  .WithMany(p => p.Slides)
                  .HasForeignKey(s => s.PresentationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PresentationVersion>(entity =>
        {
            entity.ToTable("presentation_versions");
            entity.HasKey(e => e.Id);

            entity.HasOne(v => v.Presentation)
                  .WithMany(p => p.Versions)
                  .HasForeignKey(v => v.PresentationId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(v => v.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(v => v.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<QACategory>(entity =>
        {
            entity.ToTable("qa_categories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NameAr).IsRequired().HasMaxLength(200);
            entity.Property(e => e.NameEn).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<QATemplate>(entity =>
        {
            entity.ToTable("qa_templates");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuestionAr).IsRequired().HasMaxLength(500);
            entity.Property(e => e.QuestionEn).IsRequired().HasMaxLength(500);

            entity.HasOne(qa => qa.Category)
                  .WithMany(c => c.Items)
                  .HasForeignKey(qa => qa.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
            entity.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.CreatedAtUtc);
        });
    }
}
