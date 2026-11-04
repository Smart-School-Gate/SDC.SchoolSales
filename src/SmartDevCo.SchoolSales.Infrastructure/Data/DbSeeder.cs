using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;

namespace SmartDevCo.SchoolSales.Infrastructure.Data;

public partial class DbSeeder
{
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<DbSeeder> _logger;

    public DbSeeder(ApplicationDbContext db, IConfiguration config, ILogger<DbSeeder> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        await SeedRolesAndPermissionsAsync();
        await SeedSuperAdminAsync();
        await SeedQuestionBankAsync();
        await SeedKnowledgeBaseAsync();
        await SeedPresentationTemplateAsync();
        await UpdateBrandingAsync();
        await UpdateSlide5FourCardsAsync();
        await SeedSchoolIntelligenceAsync();
        await SeedOfficialDiscoveryQuestionnaireAsync();
    }

    private async Task SeedRolesAndPermissionsAsync()
    {
        var roleNames = new[]
        {
            (UserRoleType.SuperAdmin.ToString(), "Full system access and administrator oversight"),
            (UserRoleType.SalesManager.ToString(), "Sales team leadership, targets, assignments, and reports"),
            (UserRoleType.SalesRepresentative.ToString(), "Field sales representative, school visits, and follow-ups")
        };

        foreach (var (name, desc) in roleNames)
        {
            if (!await _db.Roles.AnyAsync(r => r.Name == name))
            {
                _db.Roles.Add(new Role
                {
                    Name = name,
                    Description = desc
                });
            }
        }
        await _db.SaveChangesAsync();

        var permissions = new[]
        {
            ("Schools.View", "View school profiles and records"),
            ("Schools.Create", "Create new school prospects"),
            ("Schools.Edit", "Edit school details"),
            ("Schools.Delete", "Delete school profiles"),
            ("Schools.Assign", "Assign schools to sales representatives"),
            ("Visits.View", "View school visits and answers"),
            ("Visits.Create", "Record new school visits"),
            ("Visits.Edit", "Update school visit records"),
            ("Targets.Manage", "Manage representative sales targets"),
            ("Team.Manage", "Manage sales team members and roles"),
            ("Presentations.Manage", "Edit sales presentations"),
            ("QA.Manage", "Manage knowledge base and objection handling"),
            ("Reports.View", "View sales and performance reports")
        };

        foreach (var (code, desc) in permissions)
        {
            if (!await _db.Permissions.AnyAsync(p => p.Code == code))
            {
                _db.Permissions.Add(new Permission
                {
                    Code = code,
                    Description = desc
                });
            }
        }
        await _db.SaveChangesAsync();

        // Assign permissions to roles
        var superAdminRole = await _db.Roles.FirstAsync(r => r.Name == UserRoleType.SuperAdmin.ToString());
        var allPerms = await _db.Permissions.ToListAsync();
        foreach (var p in allPerms)
        {
            if (!await _db.RolePermissions.AnyAsync(rp => rp.RoleId == superAdminRole.Id && rp.PermissionId == p.Id))
            {
                _db.RolePermissions.Add(new RolePermission { RoleId = superAdminRole.Id, PermissionId = p.Id });
            }
        }

        var managerRole = await _db.Roles.FirstAsync(r => r.Name == UserRoleType.SalesManager.ToString());
        var managerPermCodes = new[]
        {
            "Schools.View", "Schools.Create", "Schools.Edit", "Schools.Assign",
            "Visits.View", "Visits.Create", "Visits.Edit",
            "Targets.Manage", "Team.Manage", "Presentations.Manage", "QA.Manage", "Reports.View"
        };
        foreach (var p in allPerms.Where(x => managerPermCodes.Contains(x.Code)))
        {
            if (!await _db.RolePermissions.AnyAsync(rp => rp.RoleId == managerRole.Id && rp.PermissionId == p.Id))
            {
                _db.RolePermissions.Add(new RolePermission { RoleId = managerRole.Id, PermissionId = p.Id });
            }
        }

        var repRole = await _db.Roles.FirstAsync(r => r.Name == UserRoleType.SalesRepresentative.ToString());
        var repPermCodes = new[]
        {
            "Schools.View", "Schools.Create", "Schools.Edit",
            "Visits.View", "Visits.Create", "Visits.Edit"
        };
        foreach (var p in allPerms.Where(x => repPermCodes.Contains(x.Code)))
        {
            if (!await _db.RolePermissions.AnyAsync(rp => rp.RoleId == repRole.Id && rp.PermissionId == p.Id))
            {
                _db.RolePermissions.Add(new RolePermission { RoleId = repRole.Id, PermissionId = p.Id });
            }
        }

        await _db.SaveChangesAsync();
    }

    private async Task SeedSuperAdminAsync()
    {
        var email = _config["Bootstrap:SuperAdminEmail"] ?? "admin@smartdevco.com";
        var password = _config["Bootstrap:SuperAdminPassword"] ?? "Admin@SmartDevCo2026!";
        var fullName = _config["Bootstrap:SuperAdminFullName"] ?? "Rootaca SuperAdmin";

        var existingUser = await _db.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        var superAdminRole = await _db.Roles.FirstAsync(r => r.Name == UserRoleType.SuperAdmin.ToString());

        if (existingUser == null)
        {
            var user = new User
            {
                Email = email.ToLower(),
                FullName = fullName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Phone = "+201000000001",
                IsActive = true
            };
            user.UserRoles.Add(new UserRole { RoleId = superAdminRole.Id, User = user });
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            _logger.LogInformation("SuperAdmin bootstrap created for {Email}", email);
        }
        else
        {
            if (!existingUser.UserRoles.Any(ur => ur.RoleId == superAdminRole.Id))
            {
                existingUser.UserRoles.Add(new UserRole { RoleId = superAdminRole.Id, UserId = existingUser.Id });
                await _db.SaveChangesAsync();
            }
        }
    }

    private async Task SeedQuestionBankAsync()
    {
        if (await _db.QuestionCategories.AnyAsync()) return;

        // Categories
        var catSmartSchoolGeneral = new QuestionCategory
        {
            NameAr = "المعلومات العامة والبنية التقنية - سمارت سكول",
            NameEn = "General Information & Infrastructure - Smart School",
            DisplayOrder = 1
        };
        var catSmartSchoolAcademic = new QuestionCategory
        {
            NameAr = "العمليات الأكاديمية والطلاب - سمارت سكول",
            NameEn = "Academic Operations & Students - Smart School",
            DisplayOrder = 2
        };
        var catSmartSchoolFinance = new QuestionCategory
        {
            NameAr = "المالية والأقساط - سمارت سكول",
            NameEn = "Finance & Installments - Smart School",
            DisplayOrder = 3
        };
        var catAcademyGeneral = new QuestionCategory
        {
            NameAr = "معلومات الأكاديمية والمراكز - أكاديمي",
            NameEn = "General Information & Centers - Academy",
            DisplayOrder = 4
        };
        var catAcademyOps = new QuestionCategory
        {
            NameAr = "الدورات والشهادات - أكاديمي",
            NameEn = "Courses & Certifications - Academy",
            DisplayOrder = 5
        };

        _db.QuestionCategories.AddRange(
            catSmartSchoolGeneral,
            catSmartSchoolAcademic,
            catSmartSchoolFinance,
            catAcademyGeneral,
            catAcademyOps
        );
        await _db.SaveChangesAsync();

        // Question Templates for ROOTACA Smart School
        _db.QuestionTemplates.AddRange(
            new QuestionTemplate
            {
                CategoryId = catSmartSchoolGeneral.Id,
                Product = ProductInterest.SmartSchool,
                QuestionAr = "ما هو النظام الحالي المستخدم لإدارة المدرسة؟",
                QuestionEn = "What is the current system used for school management?",
                GuidanceAr = "تحديد إن كان برنامج قديم، ملفات إكسل، أو نظام سحابي منافس",
                GuidanceEn = "Identify if legacy desktop app, Excel sheets, or cloud competitor",
                AnswerType = AnswerType.Text,
                IsRequired = true,
                DisplayOrder = 1
            },
            new QuestionTemplate
            {
                CategoryId = catSmartSchoolGeneral.Id,
                Product = ProductInterest.SmartSchool,
                QuestionAr = "كم عدد الطلاب المقيدين بجميع المراحل التعليمية؟",
                QuestionEn = "How many enrolled students across all educational stages?",
                GuidanceAr = "لتحديد فئة التسعير وحجم الخادم المطلوب",
                GuidanceEn = "To determine pricing tier and server capacity",
                AnswerType = AnswerType.Number,
                IsRequired = true,
                DisplayOrder = 2
            },
            new QuestionTemplate
            {
                CategoryId = catSmartSchoolGeneral.Id,
                Product = ProductInterest.SmartSchool,
                QuestionAr = "هل توجد فروع أخرى أو مجمعات تعليمية تابعة؟",
                QuestionEn = "Are there other branches or affiliated educational campuses?",
                AnswerType = AnswerType.YesNo,
                IsRequired = true,
                DisplayOrder = 3
            },
            new QuestionTemplate
            {
                CategoryId = catSmartSchoolAcademic.Id,
                Product = ProductInterest.SmartSchool,
                QuestionAr = "هل تعتمد المدرسة نظام الشهادات الوطنية، الأمريكية، أم البريطانية؟",
                QuestionEn = "Does the school follow National, American, or British curriculum?",
                GuidanceAr = "يؤثر على حساب المعدلات والدرجات ونظام التقارير الأكاديمية",
                GuidanceEn = "Affects grading scale and academic reporting",
                AnswerType = AnswerType.SingleChoice,
                OptionsJson = "[\"National / عربي أو لغات\", \"American Diploma\", \"British / IGCSE\", \"IB / International Baccalaureate\", \"Combined / مشترك\"]",
                IsRequired = true,
                DisplayOrder = 1
            },
            new QuestionTemplate
            {
                CategoryId = catSmartSchoolAcademic.Id,
                Product = ProductInterest.SmartSchool,
                QuestionAr = "هل يوجد تطبيق للهاتف متاح لأولياء الأمور والمعلمين حالياً؟",
                QuestionEn = "Is there currently a mobile application for parents and teachers?",
                AnswerType = AnswerType.YesNo,
                IsRequired = false,
                DisplayOrder = 2
            },
            new QuestionTemplate
            {
                CategoryId = catSmartSchoolFinance.Id,
                Product = ProductInterest.SmartSchool,
                QuestionAr = "كيف تتم إدارة المصروفات المدرسية والأقساط؟",
                QuestionEn = "How are school tuition fees and installments managed?",
                AnswerType = AnswerType.SingleChoice,
                OptionsJson = "[\"نظام مالي إلكتروني مدمج\", \"شيتات إكسل يدوية\", \"دفع كاش بالخزينة فقط\", \"بوابات دفع إلكتروني بنكية\"]",
                IsRequired = true,
                DisplayOrder = 1
            },
            // Question Templates for ROOTACA Academy
            new QuestionTemplate
            {
                CategoryId = catAcademyGeneral.Id,
                Product = ProductInterest.Academy,
                QuestionAr = "ما هي التخصصات التدريبية الرئيسية التي يقدمها المركز أو الأكاديمية؟",
                QuestionEn = "What are the main training tracks offered by the center/academy?",
                GuidanceAr = "لغات، برمجة، إدارة أعمال، تقوية مدرسية، إلخ",
                GuidanceEn = "Languages, coding, business, school tutoring, etc.",
                AnswerType = AnswerType.Text,
                IsRequired = true,
                DisplayOrder = 1
            },
            new QuestionTemplate
            {
                CategoryId = catAcademyGeneral.Id,
                Product = ProductInterest.Academy,
                QuestionAr = "كم عدد المتدربين النشطين شهرياً؟",
                QuestionEn = "How many active trainees per month?",
                AnswerType = AnswerType.Number,
                IsRequired = true,
                DisplayOrder = 2
            },
            new QuestionTemplate
            {
                CategoryId = catAcademyOps.Id,
                Product = ProductInterest.Academy,
                QuestionAr = "هل يتم تقديم الدورات حضورياً، أونلاين، أم بنظام مدمج (Hybrid)؟",
                QuestionEn = "Are courses delivered in-person, online, or hybrid?",
                AnswerType = AnswerType.SingleChoice,
                OptionsJson = "[\"حضوري فقط (In-Person)\", \"أونلاين بالكامل (Online)\", \"نظام مدمج (Hybrid)\"]",
                IsRequired = true,
                DisplayOrder = 1
            },
            new QuestionTemplate
            {
                CategoryId = catAcademyOps.Id,
                Product = ProductInterest.Academy,
                QuestionAr = "هل تقدم الأكاديمية شهادات معتمدة أو اختبارات تقييم دورية؟",
                QuestionEn = "Does the academy issue accredited certificates or periodic quizzes?",
                AnswerType = AnswerType.YesNo,
                IsRequired = false,
                DisplayOrder = 2
            }
        );
        await _db.SaveChangesAsync();
    }

    private async Task SeedKnowledgeBaseAsync()
    {
        if (await _db.QACategories.AnyAsync()) return;

        var catPricing = new QACategory { NameAr = "التسعير والاشتراكات", NameEn = "Pricing & Subscriptions", DisplayOrder = 1 };
        var catSecurity = new QACategory { NameAr = "الأمان والخصوصية", NameEn = "Security & Privacy", DisplayOrder = 2 };
        var catMigration = new QACategory { NameAr = "نقل البيانات والتحول", NameEn = "Data Migration & Transition", DisplayOrder = 3 };
        var catTraining = new QACategory { NameAr = "التدريب والدعم الفني", NameEn = "Training & Ongoing Support", DisplayOrder = 4 };
        var catTech = new QACategory { NameAr = "المتطلبات التقنية والتكامل", NameEn = "Technical Requirements & Integration", DisplayOrder = 5 };

        _db.QACategories.AddRange(catPricing, catSecurity, catMigration, catTraining, catTech);
        await _db.SaveChangesAsync();

        _db.QATemplates.AddRange(
            new QATemplate
            {
                CategoryId = catPricing.Id,
                Product = ProductInterest.Both,
                QuestionAr = "ما هي خطة التسعير؟ وهل يوجد دفع سنوي أم شهري؟",
                QuestionEn = "What is the pricing model? Is payment annual or monthly?",
                AnswerAr = "نوفر خطط اشتراك سنوية مرنة تحتسب بحسب عدد الطلاب والميزات المفعلة، مع خصومات للمجمعات والفروع المتعددة.",
                AnswerEn = "We offer flexible annual subscription plans calculated based on enrolled students and enabled modules, with tier discounts for multi-campus schools.",
                InternalNotes = "الحد الأدنى للتعاقد هو 500 طالب. يمكن تقديم خصم 10% بقرار من مدير المبيعات.",
                DisplayOrder = 1
            },
            new QATemplate
            {
                CategoryId = catSecurity.Id,
                Product = ProductInterest.Both,
                QuestionAr = "أين تُحفظ بيانات الطلاب والمدرسة؟ وما هي إجراءات الحماية؟",
                QuestionEn = "Where are school and student records stored? What are the security measures?",
                AnswerAr = "البيانات مشفرة بالكامل ومعزولة سحابياً على خوادم فائقة الأمان مع نسخ احتياطي دوري آلي وتوافق كامل مع لوائح حماية البيانات.",
                AnswerEn = "All data is encrypted in transit and at rest on secure cloud servers with automated daily backups and strict tenant isolation.",
                InternalNotes = "يتم استخدام مراكز بيانات إقليمية سريعة مع ضمان تشغيل 99.9%.",
                DisplayOrder = 2
            },
            new QATemplate
            {
                CategoryId = catMigration.Id,
                Product = ProductInterest.SmartSchool,
                QuestionAr = "لدينا بيانات طلاب وسجلات على إكسل أو برنامج قديم، كيف ننقلها؟",
                QuestionEn = "We have student records on Excel or a legacy system. How do we migrate?",
                AnswerAr = "يقوم فريق الدعم الفني والتحول الرقمي بتهيئة قوالب استيراد سهلة ونقل جميع بيانات الطلاب والمعلمين والدرجات بدون أي فقد أو انقطاع في العمل.",
                AnswerEn = "Our implementation specialists provide simple Excel import templates and oversee full historical student and staff data migration with zero downtime.",
                InternalNotes = "يستغرق نقل البيانات المكتملة ما بين 3 إلى 7 أيام عمل.",
                DisplayOrder = 3
            },
            new QATemplate
            {
                CategoryId = catTraining.Id,
                Product = ProductInterest.Both,
                QuestionAr = "هل توفرون تدريباً للإداريين والمعلمين على استخدام النظام؟",
                QuestionEn = "Do you provide hands-on training for admin staff and teachers?",
                AnswerAr = "نعم، يشمل العقد برنامجاً تدريبياً مكثفاً حضورياً وعبر الإنترنت لجميع الكوادر الإدارية والأكاديمية مع أدلة إرشادية وفيديوهات توضيحية.",
                AnswerEn = "Yes, the onboarding contract includes comprehensive training workshops (on-site & online) for all administrative and teaching staff, complete with guides and tutorial videos.",
                InternalNotes = "جلسات التدريب تكتمل خلال أسبوعين من تاريخ تشغيل الحساب التجريبي.",
                DisplayOrder = 4
            },
            new QATemplate
            {
                CategoryId = catTech.Id,
                Product = ProductInterest.Both,
                QuestionAr = "هل يتطلب النظام شراء سيرفرات خاصة داخل المدرسة؟",
                QuestionEn = "Does the system require purchasing on-premise hardware servers?",
                AnswerAr = "لا، المنظومة سحابية بالكامل (Cloud-native) تعمل عبر متصفحات الويب وتطبيقات الهواتف الذكية دون الحاجة لأي خوادم محلية باهظة التكلفة.",
                AnswerEn = "No, the platform is 100% cloud-native, accessible via modern web browsers and smartphone apps without any expensive on-premise servers.",
                InternalNotes = "يكفي اتصال إنترنت مستقر وأجهزة حاسوب عادية للموظفين.",
                DisplayOrder = 5
            }
        );
        await _db.SaveChangesAsync();
    }

    private async Task SeedPresentationTemplateAsync()
    {
        var superAdmin = await _db.Users.FirstAsync();

        var presentation = await _db.Presentations
            .Include(p => p.Slides)
            .FirstOrDefaultAsync(p => p.IsTemplate);

        if (presentation == null)
        {
            presentation = new Presentation
            {
                Title = "هيكل عرض ROOTACA للمدارس — العرض الأساسي الشامل",
                Description = "العرض التقديمي الأساسي الشامل لشركة SmartDevCo ومنظومة ROOTACA للمدارس الذكية والأكاديمية، يتم استنساخه وتخصيصه لكل مدرسة.",
                IsTemplate = true,
                SelectedProducts = ProductInterest.Both,
                VersionNumber = 1,
                CreatedByUserId = superAdmin.Id
            };
            _db.Presentations.Add(presentation);
            await _db.SaveChangesAsync();
        }
        else
        {
            presentation.Title = "هيكل عرض ROOTACA للمدارس — العرض الأساسي الشامل";
            presentation.Description = "العرض التقديمي الأساسي الشامل لشركة SmartDevCo ومنظومة ROOTACA للمدارس الذكية والأكاديمية، يتم استنساخه وتخصيصه لكل مدرسة.";
        }

        // If template slides count is not 12, replace with the complete 12 master slides
        if (presentation.Slides.Count != 12)
        {
            if (presentation.Slides.Any())
            {
                _db.PresentationSlides.RemoveRange(presentation.Slides);
                await _db.SaveChangesAsync();
            }

            var slides = new List<PresentationSlide>
            {
                // Slide 01: Welcome to [School Name]
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.CompanyOverview,
                    SlideTitleAr = "01 — مرحبًا بكم في [School Name]",
                    SlideTitleEn = "01 — Welcome to [School Name]",
                    ContentAr = "مدرستكم أولًا — نبذة تعريفية ورؤية ورسالة وترحيب مخصص بمدرستكم الكريمة.",
                    ContentEn = "Your School First — Dedicated introduction, campus overview, vision & mission.",
                    KeyPointsArJson = "[\"اسم المدرسة وشعارها وصورة للمبنى\", \"نبذة تعريفية عن المدرسة ورؤيتها ورسالتها ومراحلها التعليمية\", \"رسالة ترحيبية مخصصة باسم المدرسة\"]",
                    KeyPointsEnJson = "[\"Official school branding, crest & campus imagery\", \"Comprehensive academic overview, vision & mission\", \"Personalized welcome message for school leadership\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/zdIDzNsblg48nKskjWY0_bFTW8ewWu95dun81z_7NT6IEXSyKdPkQwLFr1fDaVm1eCEdpE4SVwcPU-C2-FtkqFYaZmH6fTt-XjoeQWpKDxjFfxnHfEmNL3PokOXyfKB-ei8YndVmfmykjvvJylNzRnuYZX4ekdj3T640nzNujM0?purpose=inline",
                    DisplayOrder = 1,
                    IsEnabled = true
                },
                // Slide 02: Why We Chose Your School
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.CompanyOverview,
                    SlideTitleAr = "02 — لماذا اخترنا مدرستكم؟",
                    SlideTitleEn = "02 — Why We Chose Your School",
                    ContentAr = "تقدير مكانة المدرسة واهتمامها بالتطوير والريادة التعليمية والتكنولوجية.",
                    ContentEn = "Appreciating your school's educational standing and commitment to innovation.",
                    KeyPointsArJson = "[\"ما الذي لفت انتباهنا في المدرسة وتميزها؟\", \"فرصة حقيقية للتعاون الاستراتيجي المشترك\", \"كيف يمكن للتكنولوجيا أن تدعم رؤية مدرستكم؟\"]",
                    KeyPointsEnJson = "[\"Distinct qualities and achievements that stood out\", \"A genuine opportunity for strategic collaboration\", \"How modern technology empowers your school vision\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/dPg-qhYNO7PpNud9v0fcw3b1EX-szY5YEzDwuADzjPqMFkfReeKSRdOBLvh997D51cqGUfVFbTTE7xIBa1ASJjc1G-CCrZnLhKEzTgymaQYH2YXDGJcYNDRGvGHUWfWDaAT9D6N5uzKmXB4ZZ4f7XEmHiIdjngOxPI2qJ6RKktY?purpose=inline",
                    DisplayOrder = 2,
                    IsEnabled = true
                },
                // Slide 03: About SmartDevCo
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.CompanyOverview,
                    SlideTitleAr = "03 — من نحن؟ شركة SmartDevCo",
                    SlideTitleEn = "03 — About SmartDevCo",
                    ContentAr = "شركة متخصصة في الحلول الرقمية، تطوير الأنظمة والتطبيقات السحابية وحلول SaaS والتحول الرقمي.",
                    ContentEn = "Specialized digital engineering firm delivering enterprise SaaS, cloud systems, and digital transformation.",
                    KeyPointsArJson = "[\"تطوير الأنظمة والتطبيقات السحابية الحديثة\", \"حلول SaaS المتكاملة للتحول الرقمي للتعليم\", \"خبرتنا في بناء حلول مترابطة وقابلة للتوسع\"]",
                    KeyPointsEnJson = "[\"Cloud-native systems and specialized mobile app development\", \"Comprehensive SaaS platforms for educational transformation\", \"Deep expertise in interconnected, highly scalable architectures\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/5PZD-ABLe7DXcpbKcZboKvivy0RHRkPHtlGbFT7nu_Jie2hjV1eh7yOcdvoxMZF4j_GCpfuYZptWZvAwvfMqaRuBg2THaoE8VCfP_FqZZljXvBT33Hwi5kC01TaGVQEFHrKFAhnG68RmdZ1QnPy-nru8-eTl-xOdsbh5cTXBKu0?purpose=inline",
                    DisplayOrder = 3,
                    IsEnabled = true
                },
                // Slide 04: Introducing ROOTACA SMS
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.SmartSchool,
                    SlideTitleAr = "04 — نقدم لكم ROOTACA Smart School",
                    SlideTitleEn = "04 — Introducing ROOTACA SMS",
                    ContentAr = "نظام متكامل لإدارة العمليات المدرسية والتواصل الأكاديمي والإداري الشامل.",
                    ContentEn = "An all-in-one unified school management system for operations, academics, and communication.",
                    KeyPointsArJson = "[\"تطبيقات تفاعلية للطلاب وأولياء الأمور\", \"تطبيقات للمعلمين والمشرفين الأكاديميين\", \"لوحة قيادة وتحكم لإدارة المدرسة والعمليات\"]",
                    KeyPointsEnJson = "[\"Interactive mobile apps for students and parents\", \"Dedicated workflow apps for teachers and supervisors\", \"Central executive dashboard for live school operations\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/0J5dGgUpa5AyEy-dMF1oPnj1cqpvQ-EXHG3nXf8DuEdn5ktKPYhbKjlU9475_jDcV5u0QhNycbR5LNPa5OQYfqkWPTtp19GuaEKmesW2OG1Gvyoon-oxEiK_KmJ0SIMorgBfDTj0wxl_UJBDeyOYFD0koU1VuCPITPX5pfrd8pM?purpose=inline",
                    DisplayOrder = 4,
                    IsEnabled = true
                },
                // Slide 05: One Connected School Community
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.SmartSchool,
                    SlideTitleAr = "05 — مدرسة واحدة.. تواصل أفضل",
                    SlideTitleEn = "05 — One Connected School Community",
                    ContentAr = "مجتمع مدرسي متصل: ولي الأمر يتابع ابنه، الطالب يصل لخدماته، المعلم يدير مهامه، والإدارة برؤية شاملة.",
                    ContentEn = "A unified platform connecting parents, students, teachers, supervisors, and executive leadership.",
                    KeyPointsArJson = "[\"ولي الأمر يتابع ابنه لحظة بلحظة والطالب يصل لخدماته\", \"المعلم والمشرف يديران الحصص والتقييم بسلاسة\", \"الإدارة تحصل على رؤية أوضح للعمليات وتقارير فورية\"]",
                    KeyPointsEnJson = "[\"Parents monitor live progress, students access digital learning\", \"Teachers & supervisors conduct grading and attendance effortlessly\", \"School leadership gains 360-degree real-time operational clarity\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/0J5dGgUpa5AyEy-dMF1oPnj1cqpvQ-EXHG3nXf8DuEdn5ktKPYhbKjlU9475_jDcV5u0QhNycbR5LNPa5OQYfqkWPTtp19GuaEKmesW2OG1Gvyoon-oxEiK_KmJ0SIMorgBfDTj0wxl_UJBDeyOYFD0koU1VuCPITPX5pfrd8pM?purpose=inline",
                    DisplayOrder = 5,
                    IsEnabled = true
                },
                // Slide 06: ROOTACA Academy
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.Academy,
                    SlideTitleAr = "06 — أكاديمية روتاكا ROOTACA Academy",
                    SlideTitleEn = "06 — ROOTACA Academy",
                    ContentAr = "تعليم البرمجة والتكنولوجيا وتنمية مهارات التفكير المنطقي وحل المشكلات لطلاب المدرسة.",
                    ContentEn = "Teaching coding, technology, and analytical problem-solving for school students.",
                    KeyPointsArJson = "[\"تعليم البرمجة والذكاء الاصطناعي وتكنولوجيا المستقبل\", \"تنمية مهارات التفكير المنطقي وحل المشكلات العملية\", \"برامج ومعسكرات تدريبية مخصصة لطلاب المدرسة\"]",
                    KeyPointsEnJson = "[\"Modern curriculum in coding, AI, and emerging technologies\", \"Fostering computational thinking and practical problem solving\", \"Tailored student camps, bootcamps and certification cohorts\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/TywsGedcNPLComAkQPUNDNkW8jU0z44kVRbqMGJzrXbG45v_4P9J2TT18firAO0kP_qMdlY_xb9aEtfzGXSAVZnazA3YJuq4MI9V7GnAhC0uP9vZtsjURCPScXXSTQfTQrYlkMi4D1WIgQcNb9Hlbok_UpDRgTTaIYdWV8MVF1c?purpose=inline",
                    DisplayOrder = 6,
                    IsEnabled = true
                },
                // Slide 07: Technology & Security
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.ValueProposition,
                    SlideTitleAr = "07 — أمان من البداية.. وبنية سحابية جاهزة للتوسع",
                    SlideTitleEn = "07 — Secure by Design. Built for the Cloud.",
                    ContentAr = "Your School's Data. Your School's Environment. بيانات مدرستكم في بيئة تشغيل مستقلة.",
                    ContentEn = "Your School's Data. Your School's Environment. Dedicated isolated tenant architecture.",
                    KeyPointsArJson = "[\"بنية سحابية تتيح الوصول للنظام من أي مكان مع حماية فائقة\", \"تحكم دقيق في الصلاحيات (Role-Based Access Control)\", \"قاعدة بيانات وبيئة تشغيل مستقلة لكل مدرسة ومراقبة مستمرة\"]",
                    KeyPointsEnJson = "[\"Cloud infrastructure accessible everywhere with zero downtime\", \"Fine-grained role-based access permissions for staff\", \"Dedicated database tenant isolation and 24/7 reliability monitoring\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/7UlmiSHdaQgDZD8fdVMRkCuN3CjeU0TcblPvCxGrOmlrNgq1MNNgO0kb64p68n-UaVgOrThlUviTl7mX8_toPyzmkDhe6v_Ql2WwUJfmyCIMq2xEobe2JGOr1IkSgdjCJHt-jamQ8I7JDMza_GLM3NNRd8hyANMFgqdVoUqHXiM?purpose=inline",
                    DisplayOrder = 7,
                    IsEnabled = true
                },
                // Slide 08: Challenges We Solve
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.ValueProposition,
                    SlideTitleAr = "08 — إيه المشكلات اللي هنحلها؟",
                    SlideTitleEn = "08 — Challenges We Solve",
                    ContentAr = "نربط كل تحدٍ إداري وتشغيلي بحل فعلي وملموس داخل النظام.",
                    ContentEn = "Connecting every school administrative pain point to a concrete automated solution.",
                    KeyPointsArJson = "[\"القضاء على تشتت البيانات بين الأنظمة والإكسل والملفات\", \"تسهيل التواصل اللحظي مع أولياء الأمور وحل شكاوى التأخير\", \"أتمتة الإجراءات الإدارية اليدوية وتوفير تقارير فورية دقيقة\"]",
                    KeyPointsEnJson = "[\"Eliminating scattered data across Excel sheets and paper files\", \"Overcoming parent communication friction and attendance tracking\", \"Automating manual workflows with instant executive analytics\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/ab34Yop7EJs2B4RTctRE-UWvR-JSQD6A_o7kB-l3sSuMkihIUtwogUBehat5mcMkz4tbcHWG2RvkeZUWqksSBMI9fmwnZbEMIXOxDVu92DbE6AN_XZFBjOaBLaWl6m3SE_ZlbRby9oWPDOjlsjQDFVU6hF_DcU0PFXcc8OWP6e8?purpose=inline",
                    DisplayOrder = 8,
                    IsEnabled = true
                },
                // Slide 09: What We Bring to Your School
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.ValueProposition,
                    SlideTitleAr = "09 — إيه اللي هنقدمه لمدرستكم؟",
                    SlideTitleEn = "09 — What We Bring to Your School",
                    ContentAr = "تعاون مستمر وشراكة استراتيجية ممتدة وليس مجرد بيع برنامج جاهز.",
                    ContentEn = "An enduring strategic partnership and ongoing enablement, not just a software license.",
                    KeyPointsArJson = "[\"نظام رقمي مناسب مخصص للهوية البصرية لمدرستكم\", \"إعداد وتشغيل كامل ونقل البيانات وتدريب الكوادر المدرسية\", \"دعم فني مستمر وإمكانية إضافة وتطوير خصائص مستقبلية\"]",
                    KeyPointsEnJson = "[\"Tailored digital platform customized to your school visual identity\", \"Full onboarding, turnkey migration & staff training workshops\", \"Ongoing technical support and custom roadmap feature evolution\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/bZY2cn8Pzra9Wm_Syxrbkwd0LWjJefABwCdEBmJorkZjt8E08qesjSWgWG-HBNUO6MG3TEwXQNaLq9Qh-YlNrZ8UcJM-wtarYLuYYvj3ON1ZDwwM2IZGJQoisVUsrNLswAiK9Qs-CQQVfizQDnAjDL-vny8NOWYRpxqAABT0ZAs?purpose=inline",
                    DisplayOrder = 9,
                    IsEnabled = true
                },
                // Slide 10: The Value of Partnership
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.ValueProposition,
                    SlideTitleAr = "10 — إيه المكسب اللي هتحققه المدرسة من الشراكة؟",
                    SlideTitleEn = "10 — The Value of Partnership",
                    ContentAr = "تحسين تجربة ولي الأمر، تقليل الوقت والمجهود الإداري، ودعم صورة المدرسة التنافسية.",
                    ContentEn = "Elevating parent & student satisfaction, cutting admin overhead, and boosting competitiveness.",
                    KeyPointsArJson = "[\"تحسين تجربة ولي الأمر والطالب ورفع كفاءة التواصل\", \"تقليل الوقت والمجهود الإداري والتكلفة التشغيلية\", \"دعم صورة المدرسة الرقمية وتنمية مهارات الطلاب بالأكاديمية\"]",
                    KeyPointsEnJson = "[\"Superior parent-student engagement and instant response\", \"Drastic reduction in routine manual effort and overhead costs\", \"Strengthening school digital prestige with student academy training\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/iBKCCvMSUO9PWSpcRIDnoYAQUUfNy2r9O3F5AhbZUXoBayGYj2zrWk2aEB82SWJXEyBIhf6NXhVux_hvl_5jDnRLCLYEd3EREvPlNLHjOhIARXpX8cWQoVi2CQUZOKvI5SK-vzyQhH4AS5DlayndzkKb2wZnn5Btv-eQ_zG9LO4GoHzDuRd5VIerfKnclTFZ?purpose=inline",
                    DisplayOrder = 10,
                    IsEnabled = true
                },
                // Slide 11: Your School's Digital Growth Roadmap
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.ValueProposition,
                    SlideTitleAr = "11 — خارطة طريق التحول والنمو الرقمي لمدرستكم",
                    SlideTitleEn = "11 — Your School's Digital Growth Roadmap",
                    ContentAr = "مراحل واضحة ومدروسة للتعاون لضمان انطلاق سلس وناجح لمنظومة مدرستكم.",
                    ContentEn = "Five structured collaboration phases ensuring smooth launch and sustainable growth.",
                    KeyPointsArJson = "[\"فهم احتياجات المدرسة وتحديد الحلول المناسبة\", \"التخصيص والتجهيز ونقل البيانات التاريخية\", \"التشغيل والتدريب العملي والدعم والتطوير المستمر\"]",
                    KeyPointsEnJson = "[\"Discovery session & tailoring features to school requirements\", \"Customization, brand styling & seamless historical data import\", \"Go-live supervision, staff training & continuous support\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/5PZD-ABLe7DXcpbKcZboKvivy0RHRkPHtlGbFT7nu_Jie2hjV1eh7yOcdvoxMZF4j_GCpfuYZptWZvAwvfMqaRuBg2THaoE8VCfP_FqZZljXvBT33Hwi5kC01TaGVQEFHrKFAhnG68RmdZ1QnPy-nru8-eTl-xOdsbh5cTXBKu0?purpose=inline",
                    DisplayOrder = 11,
                    IsEnabled = true
                },
                // Slide 12: Thank You, [School Name]
                new()
                {
                    PresentationId = presentation.Id,
                    Category = SlideCategory.Closing,
                    SlideTitleAr = "12 — شكرًا لمدرستكم [School Name]",
                    SlideTitleEn = "12 — Thank You, [School Name]",
                    ContentAr = "Let's Build a Smarter School Together — شكر خاص لإدارة المدرسة على وقتها واهتمامها، ونتطلع لفرصة التعاون.",
                    ContentEn = "Let's Build a Smarter School Together — Sincere gratitude to school leadership; looking forward to partnering.",
                    KeyPointsArJson = "[\"شكر خاص لإدارة المدرسة على وقتها واهتمامها بالابتكار\", \"تحديد موعد جلسة العرض التجريبي المباشر (Demo Session)\", \"بيانات التواصل وقنوات التنسيق المشترك والخطوات التالية\"]",
                    KeyPointsEnJson = "[\"Special appreciation to school leadership for their time and vision\", \"Schedule live interactive demo session tailored to your school\", \"Direct contact info, QR Code, and next collaboration steps\"]",
                    ImageUrl = "https://images.openai.com/static-rsc-4/ssCrEsti-ICEippNp6uki73r5hsDJbsq25hIGGNaFMelDoV2wsFaUwsFeBYFEPbL9gA_IDINz7493P2CN_Az9xgi4z1lv_gulem6MZyZaXGrw7DIxJZTOXu8rEiH3OkESKB0-3PtkY7Bc3k3IDGmMeoeRd-jAxLXlu32TIPrSDE?purpose=inline",
                    DisplayOrder = 12,
                    IsEnabled = true
                }
            };

            _db.PresentationSlides.AddRange(slides);
            await _db.SaveChangesAsync();
        }
    }

    private async Task UpdateBrandingAsync()
    {
        var users = await _db.Users.Where(u => u.FullName.Contains("SmartDevCo")).ToListAsync();
        foreach (var u in users)
        {
            u.FullName = u.FullName.Replace("SmartDevCo", "Rootaca");
        }

        var presentations = await _db.Presentations
            .Where(p => p.Title.Contains("SmartDevCo") || p.Description.Contains("SmartDevCo") || p.Description.Contains("سمارت ديف"))
            .ToListAsync();
        foreach (var p in presentations)
        {
            p.Title = p.Title.Replace("SmartDevCo", "Rootaca");
            p.Description = p.Description.Replace("سمارت ديف كو", "روتاكا").Replace("سمارت ديف", "روتاكا").Replace("SmartDevCo", "Rootaca");
        }

        var slides = await _db.PresentationSlides
            .Where(s => s.SlideTitleAr.Contains("SmartDevCo") || s.SlideTitleAr.Contains("سمارت ديف") ||
                        s.SlideTitleEn.Contains("SmartDevCo") ||
                        s.ContentAr.Contains("SmartDevCo") || s.ContentAr.Contains("سمارت ديف") ||
                        s.ContentEn.Contains("SmartDevCo"))
            .ToListAsync();

        foreach (var s in slides)
        {
            s.SlideTitleAr = s.SlideTitleAr.Replace("سمارت ديف كو", "روتاكا").Replace("سمارت ديف", "روتاكا").Replace("SmartDevCo", "روتاكا Rootaca");
            s.SlideTitleEn = s.SlideTitleEn.Replace("SmartDevCo", "Rootaca");
            s.ContentAr = s.ContentAr.Replace("سمارت ديف كو", "روتاكا").Replace("سمارت ديف", "روتاكا").Replace("SmartDevCo", "Rootaca");
            s.ContentEn = s.ContentEn.Replace("SmartDevCo", "Rootaca");
        }

        await _db.SaveChangesAsync();
    }

    private async Task UpdateSlide5FourCardsAsync()
    {
        var slide5List = await _db.PresentationSlides
            .Where(s => s.DisplayOrder == 5 || s.SlideTitleAr.Contains("مدرسة واحدة") || s.SlideTitleEn.Contains("One Connected") || s.SlideTitleEn.Contains("Connected Experience"))
            .ToListAsync();

        string fourCardsJson = "[{\"url\":\"/slides/connected-parent.png\",\"title\":\"Parent\",\"subtitle\":\"تجربة ولي الأمر\"},{\"url\":\"/slides/connected-student.png\",\"title\":\"Student\",\"subtitle\":\"تجربة الطالب\"},{\"url\":\"/slides/connected-supervisor.png\",\"title\":\"Supervisor\",\"subtitle\":\"أدوات المشرف\"},{\"url\":\"/slides/connected-teacher.png\",\"title\":\"Teacher\",\"subtitle\":\"بيئة عمل المعلم\"}]";

        foreach (var s in slide5List)
        {
            if (string.IsNullOrWhiteSpace(s.ImageUrl) || s.ImageUrl.Contains("images.openai.com") || !s.ImageUrl.StartsWith("["))
            {
                s.ImageUrl = fourCardsJson;
                s.SlideTitleAr = "05 — مدرسة واحدة.. تجربة رقمية مترابطة";
                s.SlideTitleEn = "05 — .One School. One Connected Experience";
                s.ContentAr = "مدرسة واحدة.. تجربة رقمية مترابطة لولي الأمر والطالب والمشرف والمعلم.";
                s.ContentEn = ".One School. One Connected Experience for Parents, Students, Supervisors and Teachers.";
            }
        }

        await _db.SaveChangesAsync();
    }
}
