using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;

namespace SmartDevCo.SchoolSales.Infrastructure.Data;

public partial class DbSeeder
{
    private async Task SeedOfficialDiscoveryQuestionnaireAsync()
    {
        // Check if the updated questionnaire is already seeded
        var currentVerCat = await _db.QuestionCategories.FirstOrDefaultAsync(c => c.NameAr.Contains("أولاً: معلومات المدرسة والتحقق من البيانات"));
        if (currentVerCat != null)
        {
            await SeedSchoolAnswersAsync();
            return;
        }

        // Deactivate all previous question templates to avoid conflicts
        var oldQuestions = await _db.QuestionTemplates.ToListAsync();
        foreach (var q in oldQuestions)
        {
            q.IsActive = false;
        }
        await _db.SaveChangesAsync();

        // 1. معلومات المدرسة والتحقق من البيانات
        var catBasic = new QuestionCategory
        {
            NameAr = "أولاً: معلومات المدرسة والتحقق من البيانات",
            NameEn = "I. School Information & Data Verification",
            DisplayOrder = 1
        };

        // 2. نظام إدارة المدرسة الحالي (SMS)
        var catSms = new QuestionCategory
        {
            NameAr = "ثانياً: نظام إدارة المدرسة الحالي (SMS)",
            NameEn = "II. Current School Management System (SMS)",
            DisplayOrder = 2
        };

        // 3. التواصل مع أولياء الأمور
        var catComm = new QuestionCategory
        {
            NameAr = "ثالثاً: التواصل مع أولياء الأمور",
            NameEn = "III. Parent-School Communication",
            DisplayOrder = 3
        };

        // 4. الحضور والنقل المدرسي
        var catTransport = new QuestionCategory
        {
            NameAr = "رابعاً: الحضور والنقل المدرسي",
            NameEn = "IV. Attendance & School Transportation",
            DisplayOrder = 4
        };

        // 5. الحسابات والمدفوعات
        var catFinance = new QuestionCategory
        {
            NameAr = "خامساً: الحسابات والمدفوعات",
            NameEn = "V. Finance & Electronic Payments",
            DisplayOrder = 5
        };

        // 6. البيانات والحجم التشغيلي
        var catVolume = new QuestionCategory
        {
            NameAr = "سادساً: البيانات والحجم التشغيلي",
            NameEn = "VI. Operational Volume & Capacities",
            DisplayOrder = 6
        };

        // 7. ROOTACA Academy
        var catAcademy = new QuestionCategory
        {
            NameAr = "سابعاً: أكاديمية البرمجة والذكاء الاصطناعي (ROOTACA Academy)",
            NameEn = "VII. ROOTACA Coding & AI Academy",
            DisplayOrder = 7
        };

        // 8. الميزانية والتعاقد
        var catBudget = new QuestionCategory
        {
            NameAr = "ثامناً: الميزانية والتعاقد",
            NameEn = "VIII. Budget, Procurement & Contracting",
            DisplayOrder = 8
        };

        // 9. أسئلة مخصصة لكل مدرسة - HSIS
        var catHsis = new QuestionCategory
        {
            NameAr = "تاسعاً: أسئلة مخصصة — مدرسة هلسنكي (HSIS Helsinki)",
            NameEn = "IX. Tailored Questions — HSIS Helsinki Semi International School",
            DisplayOrder = 9
        };

        // 10. أسئلة مخصصة لكل مدرسة - El Rowad
        var catRowad = new QuestionCategory
        {
            NameAr = "تاسعاً: أسئلة مخصصة — كلية الرواد (El Rowad College)",
            NameEn = "IX. Tailored Questions — El Rowad College (Nasr City)",
            DisplayOrder = 10
        };

        _db.QuestionCategories.AddRange(
            catBasic, catSms, catComm, catTransport, catFinance,
            catVolume, catAcademy, catBudget, catHsis, catRowad
        );
        await _db.SaveChangesAsync();

        var questions = new List<QuestionTemplate>
        {
            // ==========================================
            // 1. معلومات المدرسة والتحقق من البيانات (6)
            // ==========================================
            new() { CategoryId = catBasic.Id, Product = ProductInterest.Both, DisplayOrder = 1, AnswerType = AnswerType.Text,
                QuestionAr = "ما الاسم الرسمي للمدرسة كما يظهر في السجلات الرسمية؟", QuestionEn = "What is the official school name as it appears in official government registries?" },
            new() { CategoryId = catBasic.Id, Product = ProductInterest.Both, DisplayOrder = 2, AnswerType = AnswerType.Text,
                QuestionAr = "ما عنوان المدرسة والفرع الذي يشمله التقييم؟", QuestionEn = "What is the official address and specific campus evaluated?" },
            new() { CategoryId = catBasic.Id, Product = ProductInterest.Both, DisplayOrder = 3, AnswerType = AnswerType.Text,
                QuestionAr = "هل توجد فروع أخرى؟ وهل المطلوب تطبيق النظام على فرع واحد أم جميع الفروع؟", QuestionEn = "Are there other campuses? Is rollout intended for one campus or group-wide?" },
            new() { CategoryId = catBasic.Id, Product = ProductInterest.Both, DisplayOrder = 4, AnswerType = AnswerType.Text,
                QuestionAr = "من الشخص المسؤول عن التواصل والمتابعة؟", QuestionEn = "Who is the primary person responsible for ongoing liaison and coordination?" },
            new() { CategoryId = catBasic.Id, Product = ProductInterest.Both, DisplayOrder = 5, AnswerType = AnswerType.Text,
                QuestionAr = "من صاحب القرار النهائي في اعتماد النظام والميزانية؟", QuestionEn = "Who is the ultimate decision maker authorized to approve the system and budget?" },
            new() { CategoryId = catBasic.Id, Product = ProductInterest.Both, DisplayOrder = 6, AnswerType = AnswerType.Text,
                QuestionAr = "ما المسمى الوظيفي للأشخاص المشاركين في اتخاذ القرار؟", QuestionEn = "What are the job titles of the committee/leadership stakeholders involved?" },

            // ==========================================
            // 2. نظام إدارة المدرسة الحالي (SMS) (10)
            // ==========================================
            new() { CategoryId = catSms.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 7, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تستخدم المدرسة حالياً نظاماً لإدارة العمليات المدرسية؟", QuestionEn = "Does the school currently use a software system for school management?" },
            new() { CategoryId = catSms.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 8, AnswerType = AnswerType.Text,
                QuestionAr = "ما اسم النظام والشركة المقدمة له؟", QuestionEn = "What is the name of the system and its vendor/provider?" },
            new() { CategoryId = catSms.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 9, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل النظام Cloud-Based أم On-Premise أم يعمل من خلال شبكة داخلية؟", QuestionEn = "Is the current system Cloud-Based, On-Premise, or local intranet?" },
            new() { CategoryId = catSms.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 10, AnswerType = AnswerType.MultipleChoice,
                QuestionAr = "ما الوحدات المستخدمة حالياً؟ (بيانات الطلاب وأولياء الأمور، تسجيل الحضور والغياب، الدرجات والنتائج، المصروفات والمدفوعات، الجداول والحصص، التواصل والإشعارات، النقل المدرسي، التقارير والإحصائيات)",
                QuestionEn = "Which modules are currently active? (SIS, Attendance, Grading, Finance, Timetables, Comm, Transport, Reports)" },
            new() { CategoryId = catSms.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 11, AnswerType = AnswerType.Text,
                QuestionAr = "ما أكثر 3 مشكلات تواجه الإدارة في النظام الحالي؟", QuestionEn = "What are the top 3 critical operational bottlenecks with the current system?" },
            new() { CategoryId = catSms.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 12, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل توجد عمليات ما زالت تتم باستخدام Excel أو الورق؟", QuestionEn = "Are there operational processes still handled via Excel sheets or manual paper?" },
            new() { CategoryId = catSms.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 13, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تواجه المدرسة مشكلات في استخراج النتائج أو الشهادات؟", QuestionEn = "Does the school face delays or friction in calculating exam scores and generating report cards?" },
            new() { CategoryId = catSms.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 14, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يوجد تطبيق يستخدمه ولي الأمر أو الطالب أو المعلم؟", QuestionEn = "Is there an active native mobile app used by parents, students, or teachers?" },
            new() { CategoryId = catSms.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 15, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل ترغب المدرسة في استبدال النظام الحالي أم تطويره أو التكامل معه؟", QuestionEn = "Does the school want to completely replace the system, upgrade it, or integrate add-ons?" },
            new() { CategoryId = catSms.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 16, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل توجد إمكانية لتوفير API أو تصدير البيانات من النظام الحالي؟", QuestionEn = "Is there API access or full export capability (CSV/Excel/DB) from the current platform?" },

            // ==========================================
            // 3. التواصل مع أولياء الأمور (7)
            // ==========================================
            new() { CategoryId = catComm.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 17, AnswerType = AnswerType.Text,
                QuestionAr = "ما الوسائل المستخدمة حالياً للتواصل مع أولياء الأمور؟", QuestionEn = "What channels are currently used for parent-school communication?" },
            new() { CategoryId = catComm.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 18, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل يوجد تطبيق رسمي أم يتم الاعتماد على WhatsApp أو SMS أو البريد الإلكتروني؟", QuestionEn = "Is there an official app, or reliance on WhatsApp groups, SMS, or email?" },
            new() { CategoryId = catComm.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 19, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يمكن إرسال إشعارات فردية وجماعية؟", QuestionEn = "Can individual and mass broadcasts/push notifications be dispatched reliably?" },
            new() { CategoryId = catComm.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 20, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يستطيع ولي الأمر متابعة الحضور والغياب والدرجات؟", QuestionEn = "Can parents monitor daily attendance, absences, conduct, and marks in real time?" },
            new() { CategoryId = catComm.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 21, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل توجد شكاوى متكررة من أولياء الأمور بخصوص التواصل؟", QuestionEn = "Are there frequent complaints from parents regarding communication delays?" },
            new() { CategoryId = catComm.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 22, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تحتاج المدرسة إلى محادثات مباشرة بين ولي الأمر والمدرسة؟", QuestionEn = "Does the school require direct two-way structured chat between parents and staff?" },
            new() { CategoryId = catComm.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 23, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تحتاج إلى إشعارات فورية عند تسجيل الغياب أو التأخير؟", QuestionEn = "Does the school need automated instant alerts whenever absence or tardiness is recorded?" },

            // ==========================================
            // 4. الحضور والنقل المدرسي (9)
            // ==========================================
            new() { CategoryId = catTransport.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 24, AnswerType = AnswerType.Text,
                QuestionAr = "كيف يتم تسجيل حضور الطلاب حالياً؟", QuestionEn = "How is student attendance recorded in classrooms each morning?" },
            new() { CategoryId = catTransport.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 25, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل الحضور يدوي أم باستخدام أجهزة أو QR Code أو RFID؟", QuestionEn = "Is attendance manual on paper, or biometric / QR Code / RFID cards?" },
            new() { CategoryId = catTransport.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 26, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تحتاج المدرسة إلى إشعار ولي الأمر فور تسجيل حضور أو غياب الطالب؟", QuestionEn = "Does the school need instant notifications sent to parents upon arrival or absence?" },
            new() { CategoryId = catTransport.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 27, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل توفر المدرسة خدمة نقل مدرسي؟", QuestionEn = "Does the school provide student bus transportation services?" },
            new() { CategoryId = catTransport.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 28, AnswerType = AnswerType.Number,
                QuestionAr = "كم عدد الحافلات الفعلي؟", QuestionEn = "What is the actual active fleet size (number of buses)?" },
            new() { CategoryId = catTransport.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 29, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل الحافلات مملوكة للمدرسة أم تابعة لمقاول خارجي؟", QuestionEn = "Are the buses school-owned or contracted from a third-party fleet provider?" },
            new() { CategoryId = catTransport.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 30, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يوجد GPS Tracking حالياً؟", QuestionEn = "Is live GPS tracking currently installed on the fleet?" },
            new() { CategoryId = catTransport.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 31, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يحتاج ولي الأمر إلى معرفة موقع الحافلة ووقت الوصول المتوقع؟", QuestionEn = "Do parents need live map telemetry and estimated arrival times (ETA)?" },
            new() { CategoryId = catTransport.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 32, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تحتاج الإدارة إلى متابعة خطوط السير والسائقين والطلاب؟", QuestionEn = "Does management require dispatch dashboards for routes, drivers, and student manifests?" },

            // ==========================================
            // 5. الحسابات والمدفوعات (7)
            // ==========================================
            new() { CategoryId = catFinance.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 33, AnswerType = AnswerType.Text,
                QuestionAr = "كيف تتم إدارة المصروفات الدراسية؟", QuestionEn = "How are student tuition billing and installment schedules managed?" },
            new() { CategoryId = catFinance.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 34, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل توجد بوابة دفع إلكتروني حالياً؟", QuestionEn = "Is there an online digital payment gateway currently active?" },
            new() { CategoryId = catFinance.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 35, AnswerType = AnswerType.Text,
                QuestionAr = "ما وسائل الدفع المتاحة؟", QuestionEn = "What payment methods are supported (Cashier, Bank Wire, Fawry, Visa/Mastercard)?" },
            new() { CategoryId = catFinance.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 36, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تحتاج المدرسة إلى ربط المدفوعات بحساب الطالب؟", QuestionEn = "Does the school need automated ledger reconciliation tied to each student profile?" },
            new() { CategoryId = catFinance.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 37, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تحتاج إلى تنبيهات بمواعيد الاستحقاق والمتأخرات؟", QuestionEn = "Do you need automated reminders for due dates, past-due installments, and arrears?" },
            new() { CategoryId = catFinance.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 38, AnswerType = AnswerType.Text,
                QuestionAr = "هل توجد متطلبات تكامل مع بنك أو مزود دفع محدد؟", QuestionEn = "Are there specific partner bank or payment gateway integration mandates?" },
            new() { CategoryId = catFinance.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 39, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تحتاج الإدارة إلى تقارير مالية دورية؟", QuestionEn = "Does school leadership require recurring aging and cash collection dashboards?" },

            // ==========================================
            // 6. البيانات والحجم التشغيلي (10)
            // ==========================================
            new() { CategoryId = catVolume.Id, Product = ProductInterest.Both, DisplayOrder = 40, AnswerType = AnswerType.Number,
                QuestionAr = "إجمالي الطلاب (العدد الفعلي المقيد):", QuestionEn = "Total enrolled students:" },
            new() { CategoryId = catVolume.Id, Product = ProductInterest.Both, DisplayOrder = 41, AnswerType = AnswerType.Number,
                QuestionAr = "أولياء الأمور / الحسابات (العدد الفعلي):", QuestionEn = "Total parent profiles / accounts:" },
            new() { CategoryId = catVolume.Id, Product = ProductInterest.Both, DisplayOrder = 42, AnswerType = AnswerType.Number,
                QuestionAr = "المعلمون (إجمالي الكادر التعليمي):", QuestionEn = "Total teaching faculty:" },
            new() { CategoryId = catVolume.Id, Product = ProductInterest.Both, DisplayOrder = 43, AnswerType = AnswerType.Number,
                QuestionAr = "الإداريون (إجمالي الكادر الإداري والمالي):", QuestionEn = "Total administrative and operational staff:" },
            new() { CategoryId = catVolume.Id, Product = ProductInterest.Both, DisplayOrder = 44, AnswerType = AnswerType.Number,
                QuestionAr = "الفروع (عدد المقرات الفعلية المشمولة):", QuestionEn = "Total campuses included:" },
            new() { CategoryId = catVolume.Id, Product = ProductInterest.Both, DisplayOrder = 45, AnswerType = AnswerType.Text,
                QuestionAr = "المراحل الدراسية (رياض أطفال، ابتدائي، إعدادي، ثانوي):", QuestionEn = "Educational stages offered:" },
            new() { CategoryId = catVolume.Id, Product = ProductInterest.Both, DisplayOrder = 46, AnswerType = AnswerType.Number,
                QuestionAr = "الفصول الدراسية (عدد الفصول الإجمالي):", QuestionEn = "Total number of physical classrooms:" },
            new() { CategoryId = catVolume.Id, Product = ProductInterest.Both, DisplayOrder = 47, AnswerType = AnswerType.Number,
                QuestionAr = "الحافلات (عدد الباصات الفعلي):", QuestionEn = "Total active school buses:" },
            new() { CategoryId = catVolume.Id, Product = ProductInterest.Both, DisplayOrder = 48, AnswerType = AnswerType.Number,
                QuestionAr = "المعامل (عدد معامل الحاسب والعلوم):", QuestionEn = "Total computer and science laboratories:" },
            new() { CategoryId = catVolume.Id, Product = ProductInterest.Both, DisplayOrder = 49, AnswerType = AnswerType.Number,
                QuestionAr = "أجهزة الكمبيوتر (العدد الصالح للعمل):", QuestionEn = "Total functional computer workstations:" },

            // ==========================================
            // 7. ROOTACA Academy (10)
            // ==========================================
            new() { CategoryId = catAcademy.Id, Product = ProductInterest.Academy, DisplayOrder = 50, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تقدم المدرسة حالياً أنشطة أو برامج تعليمية إضافية؟", QuestionEn = "Does the school currently offer extra-curricular or after-school tech programs?" },
            new() { CategoryId = catAcademy.Id, Product = ProductInterest.Academy, DisplayOrder = 51, AnswerType = AnswerType.Text,
                QuestionAr = "هل يوجد معمل كمبيوتر؟ وما عدد الأجهزة الصالحة للاستخدام؟", QuestionEn = "Is there a computer lab? How many functional workstations are available?" },
            new() { CategoryId = catAcademy.Id, Product = ProductInterest.Academy, DisplayOrder = 52, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يتم تدريس البرمجة حالياً؟", QuestionEn = "Is real software programming actively taught in the school curriculum?" },
            new() { CategoryId = catAcademy.Id, Product = ProductInterest.Academy, DisplayOrder = 53, AnswerType = AnswerType.MultipleChoice,
                QuestionAr = "هل يوجد اهتمام بتدريس: Programming Fundamentals, Scratch, Python, Web Development, AI, Robotics & STEM؟",
                QuestionEn = "Interest in: Programming Fundamentals, Scratch, Python, Web, AI, Robotics & STEM?" },
            new() { CategoryId = catAcademy.Id, Product = ProductInterest.Academy, DisplayOrder = 54, AnswerType = AnswerType.Text,
                QuestionAr = "ما الفئات العمرية المستهدفة؟", QuestionEn = "What student age groups / stages are targeted for the Academy?" },
            new() { CategoryId = catAcademy.Id, Product = ProductInterest.Academy, DisplayOrder = 55, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل تفضل المدرسة أن تكون البرامج: ضمن الجدول الدراسي، أنشطة بعد اليوم الدراسي، برامج صيفية، مجموعات اختيارية مدفوعة؟",
                QuestionEn = "Delivery model preference: Timetable integration, After-school club, Summer camp, or Elective cohorts?" },
            new() { CategoryId = catAcademy.Id, Product = ProductInterest.Academy, DisplayOrder = 56, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل تفضل المدرسة الاشتراك السنوي أم الدفع لكل طالب أو مجموعة؟", QuestionEn = "Commercial model: Fixed institutional annual license or per-student tuition fee?" },
            new() { CategoryId = catAcademy.Id, Product = ProductInterest.Academy, DisplayOrder = 57, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تحتاج المدرسة إلى شهادات إتمام أو شهادات معتمدة من جهات خارجية؟", QuestionEn = "Does the school require verifiable completion certificates accredited by external bodies?" },
            new() { CategoryId = catAcademy.Id, Product = ProductInterest.Academy, DisplayOrder = 58, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل يوجد مدرسون متخصصون أم تحتاج المدرسة إلى مدربين من ROOTACA؟", QuestionEn = "Staffing: School computer teachers or certified ROOTACA expert trainers?" },
            new() { CategoryId = catAcademy.Id, Product = ProductInterest.Academy, DisplayOrder = 59, AnswerType = AnswerType.Number,
                QuestionAr = "ما عدد الطلاب المتوقع تسجيلهم في أول مرحلة؟", QuestionEn = "What is the expected student headcount for the initial rollout cohort?" },

            // ==========================================
            // 8. الميزانية والتعاقد (6)
            // ==========================================
            new() { CategoryId = catBudget.Id, Product = ProductInterest.Both, DisplayOrder = 60, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل توجد ميزانية معتمدة لتطوير الأنظمة الرقمية؟", QuestionEn = "Is there an approved capital budget for digital transformation systems?" },
            new() { CategoryId = catBudget.Id, Product = ProductInterest.Both, DisplayOrder = 61, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل الميزانية مخصصة لنظام إدارة المدرسة فقط أم تشمل التطبيقات والتكاملات؟", QuestionEn = "Scope: Core ERP only or full package including parent apps and hardware telemetry?" },
            new() { CategoryId = catBudget.Id, Product = ProductInterest.Both, DisplayOrder = 62, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل تفضل المدرسة: اشتراكاً سنوياً، تكلفة تأسيس + اشتراك سنوي، تسعيراً حسب عدد الطلاب، عرضاً مخصصاً حسب الوحدات المطلوبة؟",
                QuestionEn = "Pricing structure preference: Annual SaaS, Setup + Annual, Per-student fee, or Customized modular quotation?" },
            new() { CategoryId = catBudget.Id, Product = ProductInterest.Both, DisplayOrder = 63, AnswerType = AnswerType.Text,
                QuestionAr = "ما موعد التنفيذ المتوقع؟", QuestionEn = "What is the targeted operational go-live date?" },
            new() { CategoryId = catBudget.Id, Product = ProductInterest.Both, DisplayOrder = 64, AnswerType = AnswerType.Text,
                QuestionAr = "هل توجد دورة مشتريات أو موافقات داخلية يجب مراعاتها؟", QuestionEn = "Are there specific procurement cycles, board approvals, or tender windows?" },
            new() { CategoryId = catBudget.Id, Product = ProductInterest.Both, DisplayOrder = 65, AnswerType = AnswerType.Text,
                QuestionAr = "ما المعايير الأساسية التي ستعتمد عليها المدرسة في اختيار المورد؟", QuestionEn = "What primary evaluation criteria will govern vendor selection (Tech, Support, Cost, Reputation)?" },

            // ==========================================
            // 9. أسئلة مخصصة — HSIS Helsinki (8)
            // ==========================================
            new() { CategoryId = catHsis.Id, Product = ProductInterest.Both, DisplayOrder = 66, AnswerType = AnswerType.Text,
                QuestionAr = "هل تستخدم المدرسة حالياً منصة Skolera؟ وما الوحدات المفعلة منها؟", QuestionEn = "Does HSIS currently run Skolera? Which specific modules are enabled?" },
            new() { CategoryId = catHsis.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 67, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل ترغب المدرسة في الاستمرار باستخدام Skolera مع إضافة تكاملات، أم تبحث عن بديل؟", QuestionEn = "Does HSIS desire retaining Skolera with add-ons, or evaluating a complete replacement?" },
            new() { CategoryId = catHsis.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 68, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يوجد نظام GPS للحافلات؟ وإذا كان موجوداً، هل يغطي جميع الحافلات؟", QuestionEn = "Is there currently a bus GPS system? If yes, does it cover all 14 buses?" },
            new() { CategoryId = catHsis.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 69, AnswerType = AnswerType.Text,
                QuestionAr = "هل توجد بوابة دفع إلكتروني؟ وما الجهة المقدمة لها؟", QuestionEn = "Is there an online payment gateway, and who is the current payment partner?" },
            new() { CategoryId = catHsis.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 70, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يمكن ربط نظام المدرسة الحالي بمنصة خارجية من خلال API؟", QuestionEn = "Can Skolera at HSIS connect to external services via official API endpoints?" },
            new() { CategoryId = catHsis.Id, Product = ProductInterest.Academy, DisplayOrder = 71, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يوجد اهتمام بإطلاق برنامج ROOTACA Junior Coder داخل المدرسة؟", QuestionEn = "Is there active leadership appetite for launching the ROOTACA Junior Coder track?" },
            new() { CategoryId = catHsis.Id, Product = ProductInterest.Academy, DisplayOrder = 72, AnswerType = AnswerType.SingleChoice,
                QuestionAr = "هل تفضل المدرسة تقديم البرنامج كجزء من المنهج أم كنشاط إضافي؟", QuestionEn = "Curriculum integration vs after-school extracurricular club preference?" },
            new() { CategoryId = catHsis.Id, Product = ProductInterest.Academy, DisplayOrder = 73, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يمكن تخصيص معمل الكمبيوتر لتدريب الطلاب على البرمجة والروبوتكس؟", QuestionEn = "Can the existing computer lab be scheduled for robotics and coding cohorts?" },

            // ==========================================
            // 10. أسئلة مخصصة — El Rowad College (9)
            // ==========================================
            new() { CategoryId = catRowad.Id, Product = ProductInterest.Both, DisplayOrder = 74, AnswerType = AnswerType.Text,
                QuestionAr = "هل نطاق المشروع يشمل فرع مدينة نصر فقط أم فروعاً أخرى؟", QuestionEn = "Does the scope cover the Nasr City campus only or other El Rowad branches?" },
            new() { CategoryId = catRowad.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 75, AnswerType = AnswerType.Text,
                QuestionAr = "ما النظام المستخدم حالياً لإدارة المدرسة والكنترول؟", QuestionEn = "What software is currently used for school administration and exam control?" },
            new() { CategoryId = catRowad.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 76, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل تستخدم المراحل المختلفة نظاماً واحداً أم أن لكل مرحلة نظاماً منفصلاً؟", QuestionEn = "Do different sections use a single unified system or disjointed tools?" },
            new() { CategoryId = catRowad.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 77, AnswerType = AnswerType.Text,
                QuestionAr = "كيف تتم إدارة نتائج المناهج المختلفة، مثل National وBritish وAmerican؟", QuestionEn = "How are multi-curriculum grades handled (National, British IGCSE, American Diploma)?" },
            new() { CategoryId = catRowad.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 78, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يوجد نظام موحد لحساب الدرجات وإصدار الشهادات؟", QuestionEn = "Is there a centralized system for computing grades and generating certificates?" },
            new() { CategoryId = catRowad.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 79, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل توجد بوابة إلكترونية أو تطبيق لأولياء الأمور؟", QuestionEn = "Is there an active parent portal or mobile application?" },
            new() { CategoryId = catRowad.Id, Product = ProductInterest.SmartSchool, DisplayOrder = 80, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل ترغب المدرسة في نظام موحد لجميع المراحل والمناهج؟", QuestionEn = "Does El Rowad seek a unified ERP spanning all grades and curricula?" },
            new() { CategoryId = catRowad.Id, Product = ProductInterest.Academy, DisplayOrder = 81, AnswerType = AnswerType.YesNo,
                QuestionAr = "هل يوجد اهتمام بإنشاء مركز تدريبي داخلي للبرمجة والذكاء الاصطناعي والروبوتكس؟", QuestionEn = "Is there interest in establishing an on-campus Coding, AI & Robotics training center?" },
            new() { CategoryId = catRowad.Id, Product = ProductInterest.Both, DisplayOrder = 82, AnswerType = AnswerType.Text,
                QuestionAr = "من صاحب الصلاحية في اعتماد المشروع على مستوى المدرسة أو المجموعة؟", QuestionEn = "Who holds final signing authority at school and group board level?" }
        };

        _db.QuestionTemplates.AddRange(questions);
        await _db.SaveChangesAsync();

        await SeedSchoolAnswersAsync();
    }

    private async Task SeedSchoolAnswersAsync()
    {
        var helsinki = await _db.Schools.FirstOrDefaultAsync(s => s.Name.ToLower().Contains("helsinki"));
        if (helsinki != null)
        {
            var qList = await _db.QuestionTemplates.Where(q => q.IsActive).ToListAsync();
            var hDict = new Dictionary<string, string>();
            foreach (var q in qList)
            {
                if (q.QuestionAr.Contains("الاسم الرسمي")) hDict[q.Id.ToString()] = "مدرسة هلسنكي الدولية شبه الدولية (HSIS — Helsinki Semi International School)";
                else if (q.QuestionAr.Contains("عنوان المدرسة والفرع")) hDict[q.Id.ToString()] = "مدينة الشروق — المنطقة التاسعة، فيلات، محافظة القاهرة.";
                else if (q.QuestionAr.Contains("فروع أخرى")) hDict[q.Id.ToString()] = "فرع الشروق الرئيسي فقط المشمول بالمشروع.";
                else if (q.QuestionAr.Contains("الشخص المسؤول عن التواصل")) hDict[q.Id.ToString()] = "أ. محمد عبد الفتاح — منسق التطوير التكنولوجي.";
                else if (q.QuestionAr.Contains("صاحب القرار النهائي")) hDict[q.Id.ToString()] = "رئيس مجلس الإدارة بالاشتراك مع مدير عام المدرسة.";
                else if (q.QuestionAr.Contains("نظاماً لإدارة العمليات")) hDict[q.Id.ToString()] = "نعم، المدرسة تستخدم نظام Skolera LMS.";
                else if (q.QuestionAr.Contains("اسم النظام والشركة")) hDict[q.Id.ToString()] = "منصة Skolera LMS — شركة Skolera.";
                else if (q.QuestionAr.Contains("Cloud-Based")) hDict[q.Id.ToString()] = "نظام سحابي Cloud-Based مستضاف.";
                else if (q.QuestionAr.Contains("الوحدات المستخدمة حالياً")) hDict[q.Id.ToString()] = "بيانات الطلاب، الكنترول والدرجات، الواجبات المنزلية، والتقارير الأكاديمية.";
                else if (q.QuestionAr.Contains("أكثر 3 مشكلات")) hDict[q.Id.ToString()] = "1. غياب تتبع الحافلات المدرسية عبر GPS. 2. عدم وجود بوابة سداد إلكتروني للأقساط. 3. كثرة المكالمات الهاتفية من أولياء الأمور.";
                else if (q.QuestionAr.Contains("Excel أو الورق")) hDict[q.Id.ToString()] = "نعم، إدارة الأقساط والمصروفات ومطابقة الشيكات ما زالت تعتمد على ملفات إكسل يدوية.";
                else if (q.QuestionAr.Contains("استبدال النظام الحالي أم تطويره")) hDict[q.Id.ToString()] = "تطوير النظام الحالي والتكامل معه (إضافة وحدات الحافلات والدفع الإلكتروني من SmartDevCo).";
                else if (q.QuestionAr.Contains("تطبيق رسمي أم يتم الاعتماد")) hDict[q.Id.ToString()] = "تطبيق Skolera مع مجموعات واتساب موازية للأخبار السريعة.";
                else if (q.QuestionAr.Contains("إشعارات فورية عند تسجيل الغياب")) hDict[q.Id.ToString()] = "نعم، متطلب ذو أولوية قصوى لتخفيف الضغط على قسم شؤون الطلاب.";
                else if (q.QuestionAr.Contains("حضور الطلاب حالياً")) hDict[q.Id.ToString()] = "تسجيل يدوي ورقي في الفصول صباحاً ثم إدخاله يدوياً على الحاسب.";
                else if (q.QuestionAr.Contains("خدمة نقل مدرسي")) hDict[q.Id.ToString()] = "نعم، تتوفر خدمة حافلات مدرسية منظمة تغطي الشروق ومدينتي وبدر.";
                else if (q.QuestionAr.Contains("عدد الحافلات الفعلي")) hDict[q.Id.ToString()] = "14";
                else if (q.QuestionAr.Contains("الحافلات مملوكة للمدرسة")) hDict[q.Id.ToString()] = "أسطول مختلط (جزء مملوك وجزء مستأجر من شركة نقل).";
                else if (q.QuestionAr.Contains("GPS Tracking حالياً")) hDict[q.Id.ToString()] = "لا يوجد نظام تتبع GPS موحد؛ يتم التواصل مع المشرفات عبر الهاتف.";
                else if (q.QuestionAr.Contains("موقع الحافلة ووقت الوصول")) hDict[q.Id.ToString()] = "نعم، مطلب ملح وشكوى متكررة من أولياء الأمور.";
                else if (q.QuestionAr.Contains("إدارة المصروفات الدراسية")) hDict[q.Id.ToString()] = "أقساط سنوية مجدولة (تبدأ من 41,000 ج.م) تدفع بالخزينة أو بالتحويل البنكي اليدوي.";
                else if (q.QuestionAr.Contains("بوابة دفع إلكتروني حالياً")) hDict[q.Id.ToString()] = "لا توجد بوابة دفع إلكتروني مفعلة حالياً.";
                else if (q.QuestionAr.Contains("إجمالي الطلاب")) hDict[q.Id.ToString()] = "750";
                else if (q.QuestionAr.Contains("أولياء الأمور")) hDict[q.Id.ToString()] = "620";
                else if (q.QuestionAr.Contains("المعلمون")) hDict[q.Id.ToString()] = "68";
                else if (q.QuestionAr.Contains("الإداريون")) hDict[q.Id.ToString()] = "24";
                else if (q.QuestionAr.Contains("الفروع")) hDict[q.Id.ToString()] = "1";
                else if (q.QuestionAr.Contains("المراحل الدراسية")) hDict[q.Id.ToString()] = "رياض أطفال (KG1-2)، ابتدائي (1-6)، إعدادي (7-9)";
                else if (q.QuestionAr.Contains("الفصول الدراسية")) hDict[q.Id.ToString()] = "30";
                else if (q.QuestionAr.Contains("الحافلات")) hDict[q.Id.ToString()] = "14";
                else if (q.QuestionAr.Contains("المعامل")) hDict[q.Id.ToString()] = "2";
                else if (q.QuestionAr.Contains("أجهزة الكمبيوتر")) hDict[q.Id.ToString()] = "35";
                else if (q.QuestionAr.Contains("معمل كمبيوتر؟ وما عدد الأجهزة")) hDict[q.Id.ToString()] = "نعم، معملان بهما 35 جهازاً تعمل بكفاءة مناسبة.";
                else if (q.QuestionAr.Contains("تدريس البرمجة حالياً")) hDict[q.Id.ToString()] = "مناهج الحاسب الآلي الوزارية التقليدية فقط، دون لغات برمجة حقيقية.";
                else if (q.QuestionAr.Contains("Programming Fundamentals, Scratch, Python")) hDict[q.Id.ToString()] = "Python, Scratch, AI & Robotics";
                else if (q.QuestionAr.Contains("الفئات العمرية المستهدفة")) hDict[q.Id.ToString()] = "المرحلة الابتدائية العليا والإعدادية (من 8 إلى 14 سنة).";
                else if (q.QuestionAr.Contains("ضمن الجدول الدراسي، أنشطة بعد")) hDict[q.Id.ToString()] = "أنشطة اختيارية مدفوعة بعد اليوم الدراسي + معسكرات صيفية.";
                else if (q.QuestionAr.Contains("شهادات إتمام أو شهادات معتمدة")) hDict[q.Id.ToString()] = "نعم، شهادات موثقة ذات اعتماد معترف به مطلب تسويقي هام.";
                else if (q.QuestionAr.Contains("مدربون من ROOTACA")) hDict[q.Id.ToString()] = "المدرسة تطلب توفير مدربين معتمدين من ROOTACA للإشراف والتنفيذ.";
                else if (q.QuestionAr.Contains("الطلاب المتوقع تسجيلهم")) hDict[q.Id.ToString()] = "120";
                else if (q.QuestionAr.Contains("ميزانية معتمدة لتطوير")) hDict[q.Id.ToString()] = "نعم، توجد ميزانية مرصودة للتطوير الرقمي للعام الدراسي 2026/2027.";
                else if (q.QuestionAr.Contains("تفضل المدرسة: اشتراكاً سنوياً")) hDict[q.Id.ToString()] = "اشتراك سنوي شامل الدعم الفني والتحديثات.";
                else if (q.QuestionAr.Contains("موعد التنفيذ المتوقع")) hDict[q.Id.ToString()] = "البدء الفوري مع بداية الفصل الدراسي القادم.";
                else if (q.QuestionAr.Contains("المعايير الأساسية التي ستعتمد")) hDict[q.Id.ToString()] = "كفاءة الدعم الفني المحلي، سهولة استخدام تطبيق أولياء الأمور، وموثوقية النظام السحابي.";
                // Specific HSIS
                else if (q.QuestionAr.Contains("منصة Skolera؟ وما الوحدات")) hDict[q.Id.ToString()] = "نعم، منصة Skolera مفعلة لإدارة المحتوى التعليمي والدرجات والجداول.";
                else if (q.QuestionAr.Contains("الاستمرار باستخدام Skolera")) hDict[q.Id.ToString()] = "الاستمرار مع Skolera وإضافة تكاملات SmartDevCo للحافلات والدفع الإلكتروني وأكاديمية روتاكا.";
                else if (q.QuestionAr.Contains("يغطي جميع الحافلات")) hDict[q.Id.ToString()] = "لا يوجد نظام حالياً، والمطلوب تغطية كافة الـ 14 حافلة.";
                else if (q.QuestionAr.Contains("بوابة دفع إلكتروني؟ وما الجهة")) hDict[q.Id.ToString()] = "غير مفعلة؛ ويفضل التكامل مع فوري أو البنك الأهلي المصري.";
                else if (q.QuestionAr.Contains("ربط نظام المدرسة الحالي بمنصة خارجية")) hDict[q.Id.ToString()] = "نعم، إدارة Skolera توفر واجهات برمجة تطبيقات API.";
                else if (q.QuestionAr.Contains("ROOTACA Junior Coder")) hDict[q.Id.ToString()] = "نعم، تم إبداء اهتمام كبير بالبرنامج لطلاب الابتدائي والإعدادي.";
                else if (q.QuestionAr.Contains("جزء من المنهج أم كنشاط")) hDict[q.Id.ToString()] = "كنشاط مدفوع إضافي ومجموعات مسائية.";
                else if (q.QuestionAr.Contains("تخصيص معمل الكمبيوتر")) hDict[q.Id.ToString()] = "نعم، المعمل متاح بعد ساعات الدراسة الرسمية ويوم السبت.";
            }
            helsinki.DiscoveryAnswersJson = System.Text.Json.JsonSerializer.Serialize(hDict);
            await _db.SaveChangesAsync();
        }

        var rowad = await _db.Schools.FirstOrDefaultAsync(s => s.Name.ToLower().Contains("rowad") || s.Name.ToLower().Contains("رواد"));
        if (rowad != null)
        {
            var qList = await _db.QuestionTemplates.Where(q => q.IsActive).ToListAsync();
            var rDict = new Dictionary<string, string>();
            foreach (var q in qList)
            {
                if (q.QuestionAr.Contains("الاسم الرسمي")) rDict[q.Id.ToString()] = "كلية الرواد للغات — El Rowad College (فرع مدينة نصر)";
                else if (q.QuestionAr.Contains("عنوان المدرسة والفرع")) rDict[q.Id.ToString()] = "مدينة نصر — الحي السابع، محافظة القاهرة.";
                else if (q.QuestionAr.Contains("فروع أخرى")) rDict[q.Id.ToString()] = "التقييم يخص مجمع مدارس الرواد بمدينة نصر (المراحل الثلاث).";
                else if (q.QuestionAr.Contains("نظاماً لإدارة العمليات")) rDict[q.Id.ToString()] = "نعم، برامج محلية مجزأة ومتباينة بين الأقسام.";
                else if (q.QuestionAr.Contains("أكثر 3 مشكلات")) rDict[q.Id.ToString()] = "1. تشتت بيانات الطلاب بين برامج متعددة غير مترابطة. 2. صعوبة إصدار شهادات الكنترول للغات والعام. 3. بطء تحصيل وتتبع متأخرات المصروفات.";
                else if (q.QuestionAr.Contains("إجمالي الطلاب")) rDict[q.Id.ToString()] = "2200";
                else if (q.QuestionAr.Contains("المعلمون")) rDict[q.Id.ToString()] = "180";
                else if (q.QuestionAr.Contains("الإداريون")) rDict[q.Id.ToString()] = "45";
                else if (q.QuestionAr.Contains("الحافلات")) rDict[q.Id.ToString()] = "28";
                else if (q.QuestionAr.Contains("المعامل")) rDict[q.Id.ToString()] = "4";
                else if (q.QuestionAr.Contains("أجهزة الكمبيوتر")) rDict[q.Id.ToString()] = "75";
                else if (q.QuestionAr.Contains("فرع مدينة نصر فقط")) rDict[q.Id.ToString()] = "المشروع يشمل مجمع مدينة نصر كمرحلة أولى تمهيداً للتوسع.";
                else if (q.QuestionAr.Contains("المراحل المختلفة نظاماً واحداً")) rDict[q.Id.ToString()] = "لا، كل قسم يستخدم أدوات مستقلة، وهناك رغبة ملحة في التوحيد.";
                else if (q.QuestionAr.Contains("إدارة نتائج المناهج المختلفة")) rDict[q.Id.ToString()] = "عمليات يدوية معقدة عبر جداول إكسل منفصلة لكل نظام دراسي.";
                else if (q.QuestionAr.Contains("نظام موحد لجميع المراحل")) rDict[q.Id.ToString()] = "نعم، الهدف الأساسي للإدارة هو الحصول على نظام ERP مركزي سحابي موحد.";
                else if (q.QuestionAr.Contains("إنشاء مركز تدريبي داخلي للبرمجة")) rDict[q.Id.ToString()] = "نعم، توجد مساحة مخصصة لإنشاء مركز ROOTACA Academy التكنولوجي.";
                else if (q.QuestionAr.Contains("صاحب الصلاحية في اعتماد المشروع")) rDict[q.Id.ToString()] = "المدير التنفيذي لمجموعة مدارس الرواد بالتنسيق مع مجلس الإدارة.";
            }
            rowad.DiscoveryAnswersJson = System.Text.Json.JsonSerializer.Serialize(rDict);
            await _db.SaveChangesAsync();
        }
    }
}
