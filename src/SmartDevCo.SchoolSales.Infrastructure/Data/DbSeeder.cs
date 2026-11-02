using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;

namespace SmartDevCo.SchoolSales.Infrastructure.Data;

public class DbSeeder
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
        if (await _db.Presentations.AnyAsync(p => p.IsTemplate)) return;

        var superAdmin = await _db.Users.FirstAsync();

        var presentation = new Presentation
        {
            Title = "Rootaca Sales Deck: ROOTACA Smart School & Academy",
            Description = "العرض التقديمي الشامل لتعريف المدارس والمراكز التعليمية بحلول روتاكا Rootaca",
            IsTemplate = true,
            SelectedProducts = ProductInterest.Both,
            VersionNumber = 1,
            CreatedByUserId = superAdmin.Id
        };
        _db.Presentations.Add(presentation);
        await _db.SaveChangesAsync();

        var slides = new List<PresentationSlide>
        {
            new()
            {
                PresentationId = presentation.Id,
                Category = SlideCategory.CompanyOverview,
                SlideTitleAr = "من نحن — شركة روتاكا Rootaca",
                SlideTitleEn = "About Rootaca — Empowering Education",
                ContentAr = "شركة رائدة في تطوير الحلول البرمجية التعليمية المتكاملة، نساعد المدارس والمؤسسات الأكاديمية في الشرق الأوسط وشمال أفريقيا على تحقيق التحول الرقمي الكامل.",
                ContentEn = "A leading educational software engineering house providing next-generation ERP and digital learning platforms for schools and academies across the MENA region.",
                KeyPointsArJson = "[\"حلول سحابية حديثة وآمنة\", \"فريق دعم واستشارات متخصص\", \"خبرة عميقة باللوائح التعليمية المحلية\"]",
                KeyPointsEnJson = "[\"Modern cloud-native architecture\", \"Dedicated local support & consulting team\", \"Deep alignment with regional education standards\"]",
                DisplayOrder = 1,
                IsEnabled = true
            },
            new()
            {
                PresentationId = presentation.Id,
                Category = SlideCategory.CompanyOverview,
                SlideTitleAr = "تحديات الإدارة المدرسية التقليدية",
                SlideTitleEn = "Challenges in Legacy School Operations",
                ContentAr = "معظم المدارس تعاني من تشتت البيانات بين ملفات إكسل وبرامج قديمة غير مترابطة، وصعوبة التواصل مع أولياء الأمور وتأخر تحصيل المصروفات.",
                ContentEn = "Most schools suffer from siloed records in Excel sheets, disconnected desktop software, cumbersome parent communication, and delayed tuition collections.",
                KeyPointsArJson = "[\"أخطاء متكررة في رصد الدرجات والغياب\", \"غياب لوحات المؤشرات الفورية للإدارة\", \"ضعف التواصل الآني مع أولياء الأمور\"]",
                KeyPointsEnJson = "[\"Frequent manual errors in attendance and grading\", \"Lack of real-time executive analytics for principals\", \"Friction in parent engagement and updates\"]",
                DisplayOrder = 2,
                IsEnabled = true
            },
            new()
            {
                PresentationId = presentation.Id,
                Category = SlideCategory.SmartSchool,
                SlideTitleAr = "منظومة ROOTACA Smart School",
                SlideTitleEn = "ROOTACA Smart School Platform",
                ContentAr = "نظام متكامل لإدارة المدارس يغطي كل تفاصيل الدورة التعليمية والإدارية والمالية في منصة موحدة فائقة السهولة.",
                ContentEn = "An all-in-one unified school management system seamlessly integrating student records, academics, timetable, finance, and parent portals.",
                KeyPointsArJson = "[\"شؤون الطلاب والقبول والتسجيل\", \"الجداول المدرسية وتوزيع الحصص\", \"الشهادات والتقارير الأكاديمية المطابقة للمناهج\", \"إدارة الأقساط والمصروفات المدرسية\"]",
                KeyPointsEnJson = "[\"Student admissions and enrollment\", \"Automated timetabling & schedule management\", \"Curriculum-aligned grading and report cards\", \"Tuition fees, billing, and installment tracking\"]",
                DisplayOrder = 3,
                IsEnabled = true
            },
            new()
            {
                PresentationId = presentation.Id,
                Category = SlideCategory.SmartSchool,
                SlideTitleAr = "تطبيق ولي الأمر والمعلم الذكي",
                SlideTitleEn = "Parent & Teacher Mobile Experience",
                ContentAr = "تطبيقات هواتف ذكية تتيح لولي الأمر متابعة الحضور والواجبات والملاحظات والدرجات فوريًا واستلام الإشعارات المدرسية.",
                ContentEn = "Dedicated mobile apps empowering parents to monitor attendance, assignments, behavioral notes, and grades in real time with push notifications.",
                KeyPointsArJson = "[\"إشعارات فورية بالحضور والغياب\", \"سداد المصروفات إلكترونياً بأمان\", \"تواصل مباشر ومقنن مع إدارة المدرسة والمدرسين\"]",
                KeyPointsEnJson = "[\"Instant attendance and bus tracking alerts\", \"Secure digital payment integration\", \"Compliant, direct communication channels\"]",
                DisplayOrder = 4,
                IsEnabled = true
            },
            new()
            {
                PresentationId = presentation.Id,
                Category = SlideCategory.Academy,
                SlideTitleAr = "منظومة ROOTACA Academy للمراكز التدريبية",
                SlideTitleEn = "ROOTACA Academy for Training Centers",
                ContentAr = "حل مخصص للأكاديميات ومراكز اللغات والتدريب، يدير الدورات التدريبية والقاعات، المدربين، وإصدار الشهادات المعتمدة.",
                ContentEn = "Engineered specifically for training institutes, test prep centers, and academies managing courses, instructors, cohorts, and certification.",
                KeyPointsArJson = "[\"إدارة الدورات التدريبية والمجموعات (Cohorts)\", \"حجز القاعات وجداول المدربين\", \"إصدار شهادات إلكترونية بباركود التحقق (QR Code)\", \"متابعة الاشتراكات وسداد الرسوم\"]",
                KeyPointsEnJson = "[\"Course and cohort lifecycle management\", \"Room scheduling & instructor allocation\", \"Automated QR-verified certificate issuance\", \"Registration fee management and CRM\"]",
                DisplayOrder = 5,
                IsEnabled = true
            },
            new()
            {
                PresentationId = presentation.Id,
                Category = SlideCategory.ValueProposition,
                SlideTitleAr = "الأمان، السحابة، والامتثال للوائح",
                SlideTitleEn = "Security, Cloud Reliability & Compliance",
                ContentAr = "تعتمد حلولنا أعلى معايير الحماية والتشفير والنسخ الاحتياطي، مع الامتثال الكامل لقوانين حماية البيانات والجهات التعليمية الرسمية.",
                ContentEn = "Built with end-to-end encryption, automated backups, and 99.9% uptime SLAs in strict compliance with education governance regulations.",
                KeyPointsArJson = "[\"تشفير كامل للبيانات (At-Rest & In-Transit)\", \"صلاحيات دقيقة لكل مستخدم ودور وظيفي\", \"نسخ احتياطي يومي واستعادة فورية عند الطوارئ\"]",
                KeyPointsEnJson = "[\"Enterprise-grade encryption (TLS & AES-256)\", \"Granular role-based access control\", \"Automated multi-region backups and disaster recovery\"]",
                DisplayOrder = 6,
                IsEnabled = true
            },
            new()
            {
                PresentationId = presentation.Id,
                Category = SlideCategory.ValueProposition,
                SlideTitleAr = "خطة التحول الرقمي والتدريب",
                SlideTitleEn = "Implementation & Onboarding Roadmap",
                ContentAr = "نرافقك خطوة بخطوة: من استيراد البيانات التاريخية وتدريب الفريق، إلى الإطلاق الناجح وتقديم دعم فني مستمر على مدار الساعة.",
                ContentEn = "A proven phased rollout: seamless data migration, hands-on staff training workshops, go-live supervision, and dedicated 24/7 technical support.",
                KeyPointsArJson = "[\"نقل آمن لبيانات الطلاب السابقة بدون انقطاع\", \"ورش عمل تدريبية تفاعلية للموظفين والمعلمين\", \"مدير حساب مخصص لمتابعة احتياجات مدرستكم\"]",
                KeyPointsEnJson = "[\"Zero-loss historical data import\", \"Interactive training workshops for admin and teaching staff\", \"Dedicated account manager and SLA-backed support\"]",
                DisplayOrder = 7,
                IsEnabled = true
            },
            new()
            {
                PresentationId = presentation.Id,
                Category = SlideCategory.Closing,
                SlideTitleAr = "الخطوة التالية — موعد العرض التجريبي (Demo)",
                SlideTitleEn = "Next Steps — Schedule Your Custom Demo",
                ContentAr = "يسعدنا تنظيم جلسة عرض حي (Live Interactive Demo) مخصصة لمجلس إدارة المدرسة لعرض المنظومة بالإعدادات المناسبة لطبيعة مدرستكم.",
                ContentEn = "We would love to schedule a live, personalized demonstration tailored to your school's unique academic structure and operational requirements.",
                KeyPointsArJson = "[\"عرض تفاعلي مباشر للمنظومة والتطبيقات\", \"تقديم دراسة جدوى وعرض مالي مخصص\", \"الإجابة على كافة الاستفسارات الفنية والإدارية\"]",
                KeyPointsEnJson = "[\"Live hands-on system and mobile app walk-through\", \"Tailored feasibility proposal and quote\", \"Q&A with our education solutions architects\"]",
                DisplayOrder = 8,
                IsEnabled = true
            }
        };

        _db.PresentationSlides.AddRange(slides);
        await _db.SaveChangesAsync();
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
}
