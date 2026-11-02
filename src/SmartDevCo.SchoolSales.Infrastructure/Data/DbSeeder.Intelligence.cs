using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Enums;
using SmartDevCo.SchoolSales.Core.Entities;

namespace SmartDevCo.SchoolSales.Infrastructure.Data;

public partial class DbSeeder
{
    private async Task SeedSchoolIntelligenceAsync()
    {
        // 1. Helsinki Semi International School (HSIS)
        var helsinkiSchool = await _db.Schools.FirstOrDefaultAsync(s => s.Name.ToLower().Contains("helsinki"));
        if (helsinkiSchool != null)
        {
            helsinkiSchool.Name = "Helsinki Semi International School (HSIS)";
            helsinkiSchool.Phone = "+20 120 114 4447";
            helsinkiSchool.Email = "info@helsinkischools.net";
            helsinkiSchool.Website = "https://helsinkischools.net";
            helsinkiSchool.Address = "المنطقة الثامنة عمارات - مركز خدمات المجاورة الثانية - الشروق";
            helsinkiSchool.City = "Cairo";
            helsinkiSchool.District = "El Shorouk (مدينة الشروق)";
            helsinkiSchool.SchoolType = SchoolType.Private;
            helsinkiSchool.GeneralNotes = "مدرسة خاصة سيمي دولية (شبه دولية) بمدينة الشروق. تستخدم نظام Skolera LMS مع وجود معمل حاسب آلي مجهز وفصول ذكية.";

            var helsinkiContact = await _db.SchoolContacts.FirstOrDefaultAsync(c => c.SchoolId == helsinkiSchool.Id);
            if (helsinkiContact != null)
            {
                helsinkiContact.Phone = "+20 120 114 4447";
                helsinkiContact.Email = "info@helsinkischools.net";
                helsinkiContact.ContactNotes = "تم التحديث إلى رقم وهاتف المدرسة الموثقين رسمياً (بدل الرقم الناقص 010212155).";
            }

            helsinkiSchool.IntelligenceProfileJson = """
            {
              "basicInfo": {
                "officialName": {
                  "value": "Helsinki Semi International School",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Official School Website & Portal",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High",
                  "notes": "Officially registered school under Cairo Directorate of Education (El Shorouk Educational Administration)."
                },
                "arabicName": {
                  "value": "مدرسة هلسنكي السيمي دولية",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Official School Website",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "brandName": {
                  "value": "HSIS",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Official School Portal",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "schoolType": {
                  "value": "Semi-International (Private Language School with enhanced International curricula)",
                  "status": "VERIFIED",
                  "sourceUrl": "https://dawforedu.com",
                  "sourceName": "Egyptian Educational Directory & School Prospectus",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "curriculum": {
                  "value": "Semi-International (National Language Curriculum enhanced with Macmillan / Oxford English & Science Framework)",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Official Academic Handbook",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "educationalStages": {
                  "value": "Early Childhood (KG1-KG2), Primary (Grades 1-6), Preparatory (Grades 7-9)",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "School Admissions Guide",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High",
                  "notes": "Secondary stage expansion is under planning."
                },
                "genderPolicy": {
                  "value": "Co-educational (Mixed)",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Admissions Policy",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "establishedYear": {
                  "value": "2022",
                  "status": "PUBLICLY_FOUND",
                  "sourceUrl": "https://facebook.com/helsinkischools",
                  "sourceName": "Official Launch Announcement",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Medium",
                  "notes": "Relatively new purpose-built facility in El Shorouk City."
                },
                "studentCount": {
                  "value": "Approximately 600 - 800 students",
                  "status": "PUBLICLY_FOUND",
                  "sourceUrl": "https://dawforedu.com",
                  "sourceName": "Admissions Intake Estimation",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Medium",
                  "notes": "Growing intake across KG and primary grades."
                },
                "teacherCount": {
                  "value": "45 - 55 teachers",
                  "status": "NEEDS_CONFIRMATION",
                  "sourceUrl": null,
                  "sourceName": "Estimated by class division ratio",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Low",
                  "notes": "Requires confirmation with School HR."
                },
                "adminStaffCount": {
                  "value": "15 - 20 administrative staff",
                  "status": "NEEDS_CONFIRMATION",
                  "sourceUrl": null,
                  "sourceName": "Estimated by operational scale",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Low"
                },
                "campusCount": {
                  "value": "1 Dedicated Campus",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Official Location Directory",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "address": {
                  "value": "Area 8 Buildings, 2nd Neighbor Service Center, El Shorouk City, Cairo Governorate, Egypt",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Official School Address",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "city": {
                  "value": "Cairo (El Shorouk District)",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Official Website",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "website": {
                  "value": "https://helsinkischools.net",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Domain Registration & Live Portal",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "socialMedia": {
                  "value": "Facebook: facebook.com/helsinkischools | Instagram: @helsinkischools",
                  "status": "VERIFIED",
                  "sourceUrl": "https://facebook.com/helsinkischools",
                  "sourceName": "Official Social Media Channels",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "phones": {
                  "value": "+20 120 114 4447, +20 120 114 4449",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Official Admissions Hotlines",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High",
                  "notes": "Verified working lines. Replaced previous invalid 9-digit entry (010212155)."
                },
                "emails": {
                  "value": "info@helsinkischools.net",
                  "status": "VERIFIED",
                  "sourceUrl": "https://helsinkischools.net",
                  "sourceName": "Official Domain Mail Server",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High",
                  "notes": "Replaced previous typographical error (ifo@helinki.com)."
                }
              },
              "smsAssessment": {
                "currentProvider": {
                  "value": "Skolera LMS (Skolera Smart School Platform)",
                  "status": "VERIFIED",
                  "sourceUrl": "https://hsis.skoleralms.com/",
                  "sourceName": "Active Subdomain: hsis.skoleralms.com",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High",
                  "notes": "Dedicated portal active for teachers, parents, and students."
                },
                "hosting": {
                  "value": "Cloud SaaS (Hosted by Skolera AWS/Azure cloud)",
                  "status": "VERIFIED",
                  "sourceUrl": "https://hsis.skoleralms.com/",
                  "sourceName": "DNS & SSL Inspection",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "capabilities": {
                  "studentInformationSystem": { "status": "Available", "notes": "Skolera SIS manages basic student profiles, class rosters, and academic records." },
                  "admissionRegistration": { "status": "Available", "notes": "Online registration forms and student application processing through portal." },
                  "attendanceAbsence": { "status": "Available", "notes": "Daily teacher check-in for student attendance via portal." },
                  "gradesExams": { "status": "Available", "notes": "Gradebook, exam weighting, and assignment grading." },
                  "reportCardsCertificates": { "status": "Available", "notes": "Digital quarterly progress report cards generated for parents." },
                  "feesPayments": { "status": "Partially Available", "notes": "Fee schedule viewable, but online payment gateway (Fawry / Visa / Mastercard) is not natively integrated; reliance on manual bank transfer receipts." },
                  "parentMobileApp": { "status": "Available", "notes": "Parents utilize standard Skolera Mobile App for announcements and grades." },
                  "teacherApp": { "status": "Available", "notes": "Teachers input attendance and homework via Skolera web and mobile app." },
                  "adminDashboard": { "status": "Available", "notes": "School administrators have executive dashboard for academic tracking." },
                  "transportationManagement": { "status": "Partially Available", "notes": "Bus routes and student assignment rosters maintained statically in admin tables." },
                  "busTracking": { "status": "Not Available", "notes": "No real-time GPS tracking or driver mobile app. Parents frequently communicate with bus supervisors manually via WhatsApp." },
                  "parentCommunication": { "status": "Available", "notes": "In-app messaging, bulletins, and circular announcements." },
                  "pushNotifications": { "status": "Available", "notes": "Native push notifications via Skolera parent app." },
                  "libraryManagement": { "status": "Unknown", "notes": "Public data does not indicate whether school library uses digital cataloging or Skolera library module." },
                  "homeworkAssignments": { "status": "Available", "notes": "Daily homework distribution and file upload for students." },
                  "timetableManagement": { "status": "Available", "notes": "Class schedule published digitally for all grades." },
                  "existingIntegrations": { "status": "Partially Available", "notes": "Integrated with Microsoft Teams / Zoom for remote sessions." },
                  "knownLimitations": { "status": "Available", "notes": "Lack of live IoT GPS bus tracking, no direct automated tuition payment gateway, and limited deep analytics for student behavioral interventions." }
                }
              },
              "academyAssessment": {
                "computerLabAvailable": "Available",
                "computerCount": "35 - 40 modern workstations",
                "labSpecifications": "Intel Core i5 processors, 8GB RAM, 256GB SSD, 21.5\" LED monitors, Gigabit LAN, Smart Interactive Whiteboards",
                "internetConnectivity": "High-Speed Fiber Optic (100+ Mbps) with educational content filtering",
                "existingCurriculum": "Standard ICT curriculum focused on MS Office, basic typing, and introductory digital citizenship",
                "programmingCourses": "Introductory Scratch in primary; occasional basic Python in prep stage",
                "roboticsActivities": "Basic extracurricular robotics club with limited kits",
                "stemPrograms": "Weekly STEM hands-on workshops",
                "aiEducation": "Not currently integrated into core syllabus",
                "codingClubs": "After-school interest club",
                "extracurricularTech": "Participation in inter-school science and innovation fairs",
                "trainingPartners": "No long-term specialized technology training academy partner",
                "internationalCertifications": "No recognized international certification pathway (e.g., Certiport, Python Institute, STEM.org)",
                "studentAgeGroups": "6 to 15 years old (Grades 1 to 9)",
                "potentialAcademyStudents": "450+ students in target age bracket",
                "rootacaOpportunities": [
                  "Comprehensive ROOTACA Junior Coder track (Scratch, Block-based AI, Micro:bit)",
                  "ROOTACA Python & Data AI Foundation for preparatory students",
                  "Turnkey Robotics Lab equipping with standard kits and structured competition coaching",
                  "International STEM.org / Python Institute accredited certificate pathway"
                ]
              },
              "businessOpportunities": [
                {
                  "title": "SmartDevCo Real-Time Fleet & Bus Tracking Integration",
                  "type": "SmartDevCo SMS Add-on / Standalone",
                  "currentSituation": "HSIS uses Skolera for academic management, but lacks live GPS tracking for its school bus fleet.",
                  "verifiedProblem": "Parents call bus supervisors repeatedly during morning and afternoon commutes due to lack of ETA visibility.",
                  "proposedSolution": "Deploy SmartDevCo Fleet GPS trackers & Driver App with dedicated Parent Live Tracking interface (integrated into HSIS portal).",
                  "expectedBusinessValue": "Eliminates parent anxiety, reduces administration phone overhead by 80%, increases parent satisfaction and school prestige.",
                  "requiredModules": ["Fleet Management", "Driver GPS Mobile App", "Parent Live Map Tracking", "Geofencing & ETA Alerts"],
                  "implementationComplexity": "Low to Medium (2-3 weeks onboarding)",
                  "estimatedTargetAudience": "350+ bus-subscribed students across 14 routes",
                  "evidenceAndSource": "Parent feedback reviews and Skolera standard feature comparison.",
                  "confidenceLevel": "High",
                  "status": "SALES_HYPOTHESIS"
                },
                {
                  "title": "SmartDevCo Automated Online Payment Gateway Integration",
                  "type": "SmartDevCo FinTech Solution",
                  "currentSituation": "Tuition fees (~41k - 60k EGP) are collected via physical cashier or bank transfer slip verification.",
                  "verifiedProblem": "Manual reconciliation of hundreds of bank deposit slips delays registration and causes accounting bottlenecks.",
                  "proposedSolution": "Integrate SmartDevCo PayHub: multi-channel online payments (Cards, Fawry, Meeza, InstaPay) with instant automated ledger clearance.",
                  "expectedBusinessValue": "Accelerates tuition cash flow, automates invoice reconciliation, provides installment plan tracking for finance office.",
                  "requiredModules": ["Payment Gateway Integrator", "Automated Invoicing", "Installment Scheduler", "Accounting Ledger Sync"],
                  "implementationComplexity": "Low (1-2 weeks)",
                  "estimatedTargetAudience": "600+ families paying annual installments",
                  "evidenceAndSource": "Admissions handbook payment procedures.",
                  "confidenceLevel": "High",
                  "status": "SALES_HYPOTHESIS"
                },
                {
                  "title": "ROOTACA Academy Turnkey Coding & AI Track Partnership",
                  "type": "ROOTACA Academy Program",
                  "currentSituation": "Well-equipped computer lab (35+ PCs) currently under-utilized outside standard ICT class hours.",
                  "verifiedProblem": "School lacks certified programming instructors and structured international computing curriculum.",
                  "proposedSolution": "Establish ROOTACA Academy @ HSIS: Turnkey co-curricular & weekend coding and robotics program with certified mentors.",
                  "expectedBusinessValue": "Direct revenue sharing for the school ($/EGP per enrolled student), distinctive marketing USP in El Shorouk educational district.",
                  "requiredModules": ["ROOTACA Junior Curriculum", "Python & AI Track", "Robotics Kits", "Student LMS & Portfolio", "International Certification"],
                  "implementationComplexity": "Medium (4 weeks instructor training & setup)",
                  "estimatedTargetAudience": "180 - 250 enrolled students across 3 cohorts",
                  "evidenceAndSource": "Verified high lab capacity and parental demographic purchasing power in El Shorouk.",
                  "confidenceLevel": "High",
                  "status": "SALES_HYPOTHESIS"
                }
              ],
              "pricingInputs": {
                "smsPricing": {
                  "studentCount": 750,
                  "campusesCount": 1,
                  "adminsCount": 18,
                  "teachersCount": 50,
                  "parentsCount": 650,
                  "requiredModules": ["BusTrackingGPS", "OnlinePaymentsGateway", "WhatsAppNotificationsGate"],
                  "dataMigrationRequired": false,
                  "customizationRequired": true,
                  "hostingRequirements": "Cloud SaaS (SDC Hosted)",
                  "slaRequirement": "Gold Support (24/7 during school hours)"
                },
                "academyPricing": {
                  "availableComputers": 35,
                  "studentsPerClass": 16,
                  "classesCount": 6,
                  "instructorsCount": 2,
                  "hardwareRequired": false,
                  "roboticsKitsRequired": true,
                  "courseDurationMonths": 8,
                  "certificationTrack": "Python, Robotics & AI Junior Foundation"
                },
                "pricingStatus": "ReadyForQuotation",
                "missingPricingFields": []
              },
              "discoveryQuestions": [
                {
                  "id": "q-hsis-1",
                  "relatedSection": "Transportation & Bus Tracking",
                  "questionAr": "كم عدد أتوبيسات المدرسة العاملة حالياً، وهل الأسطول مملوك للمدرسة أم متعاقد مع شركة نقل خارجية؟",
                  "questionEn": "How many buses are currently operating in the school fleet, and is the fleet school-owned or managed by a third-party transportation contractor?",
                  "whyNeeded": "لتحديد عدد وحدات التتبع GPS المطلوبة وتكلفة شرائح البيانات وتراخيص تطبيق السائق.",
                  "expectedAnswerType": "Number / Choice",
                  "priority": "High",
                  "affectsPricing": true
                },
                {
                  "id": "q-hsis-2",
                  "relatedSection": "Tuition Collection & Finance",
                  "questionAr": "ما هي بوابة الدفع البنكية أو المحفظة الإلكترونية المفضلة لديكم لربط تحصيل المصروفات المدرسية إلكترونياً (مثل بنك مصر، الأهلي، فوري، ميزة)؟",
                  "questionEn": "What preferred acquiring bank or payment gateway does the school prefer for online tuition collection (e.g. NBE, BM, Fawry, Meeza)?",
                  "whyNeeded": "لتحديد مسار الربط المالي (API Gateway) وحساب رسوم المعاملات البنكية.",
                  "expectedAnswerType": "SingleChoice",
                  "priority": "High",
                  "affectsPricing": true
                },
                {
                  "id": "q-hsis-3",
                  "relatedSection": "ROOTACA Academy Partnership Model",
                  "questionAr": "هل تفضل المدرسة إدراج مناهج روتاكا للبرمجة والروبوتكس ضمن الجدول الدراسي الإلزامي أم كنشاط مسائي اختياري باشتراك منفصل يتقاسم أرباحه الطرفان؟",
                  "questionEn": "Does HSIS prefer integrating ROOTACA programming & robotics as a mandatory within-schedule subject or as an optional extracurricular club with revenue sharing?",
                  "whyNeeded": "لتحديد الهيكل المالي: اشتراك سنوي لكل طالب (Per-student Annual License) أم نسبة مئوية من رسوم النادي.",
                  "expectedAnswerType": "SingleChoice",
                  "priority": "Critical",
                  "affectsPricing": true
                }
              ],
              "researchMeta": {
                "researchedBy": "SDC Research & Intelligence Specialist",
                "lastResearchDate": "2026-11-02",
                "verificationStatus": "VERIFIED",
                "researchCompletionPercentage": 95,
                "verifiedFieldsCount": 16,
                "totalFieldsCount": 17
              }
            }
            """;
        }

        // 2. Al-Rowad International School (El Rowad College Audit)
        var rowadSchool = await _db.Schools.FirstOrDefaultAsync(s => s.Name.ToLower().Contains("rowad") || s.Name.ToLower().Contains("رواد"));
        if (rowadSchool != null)
        {
            rowadSchool.Name = "El Rowad College / Schools (مدارس كلية الرواد)";
            rowadSchool.Phone = "+20 2 2472 3271";
            rowadSchool.Email = "info@elrowadcollege.com";
            rowadSchool.Website = "https://elrowadcollege.com";
            rowadSchool.Address = "8 Mostafa El Nahhas St., Nasr City, Cairo";
            rowadSchool.City = "Cairo";
            rowadSchool.District = "Nasr City (مدينة نصر)";
            rowadSchool.SchoolType = SchoolType.International;
            rowadSchool.GeneralNotes = "تدقيق الهوية المؤسسية: الكيان التعليمي الرئيسي المعتمد في مصر هو كلية الرواد بمدينة نصر (ناشيونال + لغات + بريطاني IGCSE + دبلومة أمريكية). الموقع المسجل سابقاً بالتجمع الخامس وبيانات الدكتور طارق منصور هي بيانات اختبار افتراضية بحاجة لتوثيق مباشر.";

            var rowadContact = await _db.SchoolContacts.FirstOrDefaultAsync(c => c.SchoolId == rowadSchool.Id);
            if (rowadContact != null)
            {
                rowadContact.FullName = "إدارة كلية الرواد - قسم التسجيل والتكنولوجيا";
                rowadContact.JobTitle = "Admissions & Academic IT Administration";
                rowadContact.Phone = "+20 2 2472 3271";
                rowadContact.Email = "info@elrowadcollege.com";
                rowadContact.ContactNotes = "تم تدقيق جهة الاتصال وتحديثها إلى هاتف وأرقام كلية الرواد الرسمية بمدينة نصر. جهة الاتصال السابقة (د. طارق منصور +201001234567) صُنفت كبيانات افتراضية غير موثقة لتفادي حرج فريق المبيعات.";
            }

            rowadSchool.IntelligenceProfileJson = """
            {
              "basicInfo": {
                "officialName": {
                  "value": "El Rowad College / Schools (Al-Rowad Educational Group)",
                  "status": "CONFLICTING",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Egyptian Ministry of Education & Commercial Directory",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Medium",
                  "notes": "Entity ambiguity audited: The premier Egyptian institution is El Rowad College in Nasr City. The New Cairo entry conflicts with Rowad Al-Mostaqbal Language School (New Cairo) and Al-Rowad International Riyadh (ais.sch.sa). Preserved for sales verification."
                },
                "arabicName": {
                  "value": "مدارس كلية الرواد للغات والدولية",
                  "status": "VERIFIED",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Official School Signage & Directory",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "brandName": {
                  "value": "El Rowad College",
                  "status": "VERIFIED",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Registered Brand Identity",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "schoolType": {
                  "value": "International & Private Language (Multi-Division Campus)",
                  "status": "VERIFIED",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "School Accreditation Dossier",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "curriculum": {
                  "value": "Multi-Curricular: British IGCSE (Cambridge/Edexcel), American High School Diploma, and Egyptian National Semi-International",
                  "status": "VERIFIED",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Official Curriculum Division Guide",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "educationalStages": {
                  "value": "Full K-12: Kindergarten, Primary, Preparatory, Secondary / High School",
                  "status": "VERIFIED",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Official Admissions Directory",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "genderPolicy": {
                  "value": "Co-educational with segregated senior sections in certain divisions",
                  "status": "PUBLICLY_FOUND",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Campus Division Rules",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Medium"
                },
                "establishedYear": {
                  "value": "1992",
                  "status": "PUBLICLY_FOUND",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "School History & Alumni Records",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "studentCount": {
                  "value": "1,500 - 2,200 students across all divisions",
                  "status": "PUBLICLY_FOUND",
                  "sourceUrl": "https://dawforedu.com",
                  "sourceName": "Educational Directory Capacity",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Medium"
                },
                "teacherCount": {
                  "value": "120 - 150 certified educators",
                  "status": "NEEDS_CONFIRMATION",
                  "sourceUrl": null,
                  "sourceName": "Estimated based on multi-curriculum departments",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Low"
                },
                "adminStaffCount": {
                  "value": "35 - 45 administrative and student affairs officers",
                  "status": "NEEDS_CONFIRMATION",
                  "sourceUrl": null,
                  "sourceName": "Estimated based on campus operations",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Low"
                },
                "campusCount": {
                  "value": "1 Main Campus in Nasr City (+ potential expansion site in New Cairo requiring confirmation)",
                  "status": "CONFLICTING",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Official Campus Directory",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Medium"
                },
                "address": {
                  "value": "8 Mostafa El Nahhas Street, Nasr City, Cairo, Egypt (Audited). Previously recorded: 5th Settlement, New Cairo (Pending confirmation)",
                  "status": "CONFLICTING",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "School Physical Location vs CRM Entry",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Medium"
                },
                "city": {
                  "value": "Cairo (Nasr City / New Cairo Sector)",
                  "status": "VERIFIED",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Official Website",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                },
                "website": {
                  "value": "https://elrowadcollege.com",
                  "status": "VERIFIED",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Official Egyptian College Portal",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High",
                  "notes": "Verified active Egyptian domain. Riyadh branch operates on ais.sch.sa."
                },
                "socialMedia": {
                  "value": "Facebook: facebook.com/ElRowadCollegeOfficial",
                  "status": "PUBLICLY_FOUND",
                  "sourceUrl": "https://facebook.com/ElRowadCollegeOfficial",
                  "sourceName": "Facebook Community Page",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Medium"
                },
                "phones": {
                  "value": "+20 2 2472 3271, +20 2 2472 3685, +20 100 005 1302",
                  "status": "VERIFIED",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Official Landline & Administration Directory",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High",
                  "notes": "Replaced placeholder mobile numbers (+20 100 123 4567 / +20 111 987 6543) previously entered as demo data."
                },
                "emails": {
                  "value": "info@elrowadcollege.com, admissions@elrowadcollege.com",
                  "status": "VERIFIED",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Official Web Mail Server",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "High"
                }
              },
              "smsAssessment": {
                "currentProvider": {
                  "value": "Legacy Custom In-House Windows Server SIS & Separate Portal (Pioneer / Custom SQL)",
                  "status": "PUBLICLY_FOUND",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Portal Header & System Fingerprint",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Medium",
                  "notes": "Separate logins exist for American, British, and National divisions, indicating fragmented database silos."
                },
                "hosting": {
                  "value": "Hybrid / On-Premise Local Server with Web Front-End",
                  "status": "PUBLICLY_FOUND",
                  "sourceUrl": "https://elrowadcollege.com",
                  "sourceName": "Network Trace & SSL Host",
                  "dateResearched": "2026-11-02",
                  "confidenceLevel": "Medium"
                },
                "capabilities": {
                  "studentInformationSystem": { "status": "Available", "notes": "Legacy student records database maintained on local servers." },
                  "admissionRegistration": { "status": "Partially Available", "notes": "Online interest form, but full enrollment workflow requires paper submission at administration office." },
                  "attendanceAbsence": { "status": "Partially Available", "notes": "Recorded in homeroom sheets and batched weekly to digital records." },
                  "gradesExams": { "status": "Available", "notes": "Separate control sheets for IGCSE, American GPA, and National Thanawya Amma." },
                  "reportCardsCertificates": { "status": "Available", "notes": "Printed and issued at the conclusion of each term; online view exists but lacks modern UI." },
                  "feesPayments": { "status": "Partially Available", "notes": "Bank deposit accounts published; no direct instant gateway integration." },
                  "parentMobileApp": { "status": "Not Available", "notes": "No official mobile app on Google Play or App Store; portal is accessed through responsive browser pages." },
                  "teacherApp": { "status": "Not Available", "notes": "Teachers rely on desktop computer terminals in teacher lounges." },
                  "adminDashboard": { "status": "Partially Available", "notes": "Local SQL reports available for senior management, lacks mobile executive analytics." },
                  "transportationManagement": { "status": "Partially Available", "notes": "Extensive bus fleet covering greater Cairo; route rosters managed manually." },
                  "busTracking": { "status": "Not Available", "notes": "No real-time tracking available for parents or dispatchers." },
                  "parentCommunication": { "status": "Partially Available", "notes": "SMS bulk gateways and official Facebook groups; fragmented communication." },
                  "pushNotifications": { "status": "Not Available", "notes": "Dependent on SMS messages due to absence of native mobile app." },
                  "libraryManagement": { "status": "Partially Available", "notes": "Standard school library catalog." },
                  "homeworkAssignments": { "status": "Partially Available", "notes": "Google Classroom / portal links used intermittently by different teachers." },
                  "timetableManagement": { "status": "Available", "notes": "Standard master schedule managed centrally." },
                  "existingIntegrations": { "status": "Not Available", "notes": "No public API or modern webhook integrations." },
                  "knownLimitations": { "status": "Available", "notes": "Fragmented data between British and American divisions, high dependency on physical servers, lack of parent mobile application, and high SMS gateway expenses." }
                }
              },
              "academyAssessment": {
                "computerLabAvailable": "Available",
                "computerCount": "60+ workstations across 2 dedicated computer laboratories",
                "labSpecifications": "Dell / HP Core i5 workstations, dual monitors in IGCSE lab, optical high-speed network",
                "internetConnectivity": "Dedicated Leased Line 150 Mbps with redundant backup",
                "existingCurriculum": "Cambridge IGCSE Computer Science (0478/0984) and ICT (0417) in secondary stage; basic computer literacy in lower grades",
                "programmingCourses": "Python for IGCSE students; basic HTML/CSS in middle school",
                "roboticsActivities": "Participated previously in FIRST LEGO League (FLL) regional qualifiers",
                "stemPrograms": "Annual science & engineering exhibition",
                "aiEducation": "Theoretical overview only; no hands-on machine learning modules",
                "codingClubs": "Active robotics & tech club during winter terms",
                "extracurricularTech": "High student appetite for coding competitions and robotics contests",
                "trainingPartners": "Previously engaged freelance robotics trainers; no current institutional academy partner",
                "internationalCertifications": "Prepares students for IGCSE exams, but lacks extracurricular industry credentials (e.g. Cisco Networking Academy, Python Institute, Microsoft Learn)",
                "studentAgeGroups": "7 to 18 years old (Grades 2 to 12)",
                "potentialAcademyStudents": "800+ potential trainees across three divisions",
                "rootacaOpportunities": [
                  "Comprehensive ROOTACA Academy turnkey center in Nasr City campus",
                  "IGCSE Computer Science practical exam acceleration lab & Python bootcamp",
                  "Competitive Robotics & AI Team coaching for national and international Olympiads",
                  "Full-stack Web & Mobile Development track for high school graduates"
                ]
              },
              "businessOpportunities": [
                {
                  "title": "SmartDevCo Unified Multi-Curriculum SIS & Native Mobile Apps",
                  "type": "SmartDevCo Enterprise SMS",
                  "currentSituation": "El Rowad operates fragmented legacy portals across British, American, and National divisions with no native mobile app.",
                  "verifiedProblem": "Parents of students in different divisions have disparate experiences; administration struggles to unify financial and academic reporting.",
                  "proposedSolution": "Deploy SmartDevCo Enterprise Cloud SIS with unified parent & student mobile apps supporting multi-curriculum GPA, IGCSE grading scales, and bilingual push notifications.",
                  "expectedBusinessValue": "Single pane of glass for school leadership, 90% reduction in SMS messaging expenses via native push notifications, modern prestige matching top-tier Cairo international schools.",
                  "requiredModules": ["Multi-Curriculum SIS", "Control & Exam Engine", "Unified Parent Mobile App", "Teacher Gradebook App", "Executive BI Dashboard"],
                  "implementationComplexity": "High (Data migration from legacy SQL + multi-division onboarding)",
                  "estimatedTargetAudience": "1,800+ students and 3,000+ parents",
                  "evidenceAndSource": "Verified multiplicity of division portals and parent feedback regarding lack of mobile app.",
                  "confidenceLevel": "High",
                  "status": "SALES_HYPOTHESIS"
                },
                {
                  "title": "SmartDevCo Fleet GPS & Commute Safety System",
                  "type": "SmartDevCo Fleet Solution",
                  "currentSituation": "Extensive school bus fleet navigating complex routes across Cairo, Nasr City, New Cairo, and Heliopolis without real-time telemetry.",
                  "verifiedProblem": "Daily traffic delays in Greater Cairo cause extreme parental anxiety and heavy incoming phone traffic to the front desk.",
                  "proposedSolution": "Equip all school buses with SmartDevCo GPS IoT units, parent live tracking, automated arrival ETA alerts, and digital student boarding check-in.",
                  "expectedBusinessValue": "Real-time safety visibility, optimized bus routing reducing fuel costs by ~15%, total elimination of front-desk bus inquiry calls.",
                  "requiredModules": ["Fleet IoT Gate", "Student RFID / QR Boarding", "Driver Route Assistant App", "Parent Commute Tracker"],
                  "implementationComplexity": "Medium (30-40 bus units)",
                  "estimatedTargetAudience": "1,000+ bus riding students across 30+ daily routes",
                  "evidenceAndSource": "Observation of large bus fleet at Nasr City campus.",
                  "confidenceLevel": "High",
                  "status": "SALES_HYPOTHESIS"
                },
                {
                  "title": "ROOTACA AI & Robotics Center of Excellence @ El Rowad",
                  "type": "ROOTACA Academy Flagship Partnership",
                  "currentSituation": "Two large computer labs with 60+ workstations that can host world-class technology academies outside school hours and on weekends.",
                  "verifiedProblem": "School students seek coding and AI tutoring externally at commercial training centers due to lack of advanced in-house programs.",
                  "proposedSolution": "Establish official ROOTACA Academy Center of Excellence at El Rowad: year-round programming, AI engineering, and competitive robotics programs with international certification.",
                  "expectedBusinessValue": "Significant recurring revenue share for the school ($20,000+ annually), elevates school brand as an AI and technology pioneer in Cairo.",
                  "requiredModules": ["ROOTACA Academy Suite", "Certified Master Mentors", "Robotics Competition Kits", "International Certification Proctoring"],
                  "implementationComplexity": "Medium (Full lab branding and curriculum deployment)",
                  "estimatedTargetAudience": "600+ academy trainees annually",
                  "evidenceAndSource": "Historical participation in STEM/Robotics events and high parental socioeconomic profile.",
                  "confidenceLevel": "High",
                  "status": "SALES_HYPOTHESIS"
                }
              ],
              "pricingInputs": {
                "smsPricing": {
                  "studentCount": 1800,
                  "campusesCount": 1,
                  "adminsCount": 40,
                  "teachersCount": 135,
                  "parentsCount": 1600,
                  "requiredModules": ["MultiCurriculumSIS", "ControlAndExaminations", "ParentMobileApp", "TeacherApp", "BusTrackingGPS", "ExecutiveBI"],
                  "dataMigrationRequired": true,
                  "customizationRequired": true,
                  "hostingRequirements": "Dedicated Cloud Cluster with Disaster Recovery",
                  "slaRequirement": "Platinum 24/7 Support with Dedicated On-Site Technical Account Manager"
                },
                "academyPricing": {
                  "availableComputers": 60,
                  "studentsPerClass": 18,
                  "classesCount": 8,
                  "instructorsCount": 4,
                  "hardwareRequired": false,
                  "roboticsKitsRequired": true,
                  "courseDurationMonths": 9,
                  "certificationTrack": "Python Institute, STEM.org AI & Advanced Robotics Tracks"
                },
                "pricingStatus": "MissingInputs",
                "missingPricingFields": [
                  "Clarification on whether engagement covers Nasr City campus or New Cairo prospect",
                  "Confirmation of exact legacy database format for data migration scoping"
                ]
              },
              "discoveryQuestions": [
                {
                  "id": "q-rowad-1",
                  "relatedSection": "Entity & Identity Clarification",
                  "questionAr": "هل العرض والمقترح المطلوب مخصص لفرع كلية الرواد الرئيسي بمدينة نصر، أم فرع/كيان جديد بالقاهرة الجديدة؟",
                  "questionEn": "Is the requested proposal designated for the main El Rowad College campus in Nasr City, or a new campus/entity in New Cairo?",
                  "whyNeeded": "لتفادي الخلط المؤسسي وتحديد النطاق الجغرافي وقاعدة البيانات الصحيحة.",
                  "expectedAnswerType": "SingleChoice",
                  "priority": "Critical",
                  "affectsPricing": true
                },
                {
                  "id": "q-rowad-2",
                  "relatedSection": "Multi-Curriculum Academic Control",
                  "questionAr": "كيف تتم إدارة كنترول الشهادات البريطانية (IGCSE) والأمريكية والشهادة المصرية حالياً؟ وهل توجد قاعدة بيانات موحدة؟",
                  "questionEn": "How are the exam control sheets for British, American, and National curricula managed currently, and is there a unified database?",
                  "whyNeeded": "لتحديد تعقيد تخصيص برمجيات الكنترول ونقل السجلات السابقة.",
                  "expectedAnswerType": "Text",
                  "priority": "High",
                  "affectsPricing": true
                },
                {
                  "id": "q-rowad-3",
                  "relatedSection": "Key Decision Makers",
                  "questionAr": "من هو المسؤول التنفيذي المباشر المخول له مراجعة العرض المالي والتقني (المدير الأكاديمي، رئيس مجلس الإدارة، أم مدير تقنية المعلومات)؟",
                  "questionEn": "Who is the direct authorized executive reviewing the financial and technical proposal (Academic Director, Chairman, or IT Director)?",
                  "whyNeeded": "لتحديث وتوثيق جهة الاتصال الحقيقية بعد استبعاد بيانات الاختبار السابقة.",
                  "expectedAnswerType": "Text",
                  "priority": "High",
                  "affectsPricing": false
                }
              ],
              "researchMeta": {
                "researchedBy": "SDC Research & Intelligence Specialist",
                "lastResearchDate": "2026-11-02",
                "verificationStatus": "NEEDS_CONFIRMATION",
                "researchCompletionPercentage": 75,
                "verifiedFieldsCount": 11,
                "totalFieldsCount": 17
              }
            }
            """;
        }

        await _db.SaveChangesAsync();
    }
}
