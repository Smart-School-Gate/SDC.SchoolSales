import React, { useState } from 'react';
import {
  ShieldCheck,
  Globe,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  FileQuestion,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ExternalLink,
  Cpu,
  Layers,
  GraduationCap,
  Bus,
  CreditCard,
  Code2,
  DollarSign,
  Edit2,
  Save,
  X,
  Check,
  Building,
  School as SchoolIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Compass,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  SchoolDetailDto,
  SchoolIntelligenceProfile,
  FactItem,
  FactVerificationStatus,
  CapabilityStatus,
  BusinessOpportunityItem,
  DiscoveryQuestionItem
} from '../../types';

interface SchoolIntelligenceTabProps {
  school: SchoolDetailDto;
  intelligenceProfile: SchoolIntelligenceProfile | null;
  canEdit: boolean;
  onUpdateIntelligence: (json: string) => Promise<boolean>;
}

export const SchoolIntelligenceTab: React.FC<SchoolIntelligenceTabProps> = ({
  school,
  intelligenceProfile,
  canEdit,
  onUpdateIntelligence
}) => {
  const { language, dir } = useLanguage();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rawJson, setRawJson] = useState(
    intelligenceProfile ? JSON.stringify(intelligenceProfile, null, 2) : ''
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Status Badge Component
  const renderVerificationBadge = (status: FactVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {language === 'ar' ? 'موثق رسمياً' : 'VERIFIED'}
          </span>
        );
      case 'PUBLICLY_FOUND':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Globe className="w-3 h-3 text-blue-600" />
            {language === 'ar' ? 'منشور علنياً' : 'PUBLICLY FOUND'}
          </span>
        );
      case 'NEEDS_CONFIRMATION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <HelpCircle className="w-3 h-3 text-amber-600" />
            {language === 'ar' ? 'يحتاج تأكيد مباشر' : 'NEEDS CONFIRMATION'}
          </span>
        );
      case 'SALES_HYPOTHESIS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            {language === 'ar' ? 'فرصة مبيعات تجارية' : 'SALES HYPOTHESIS'}
          </span>
        );
      case 'CONFLICTING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            {language === 'ar' ? 'بيانات متضاربة' : 'CONFLICTING SOURCES'}
          </span>
        );
      case 'NOT_FOUND':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <MinusCircle className="w-3 h-3 text-slate-500" />
            {language === 'ar' ? 'غير متوفر' : 'NOT FOUND'}
          </span>
        );
    }
  };

  const renderCapabilityBadge = (status: CapabilityStatus) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            {language === 'ar' ? 'متاح ومفعل' : 'Available'}
          </span>
        );
      case 'Partially Available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <MinusCircle className="w-3 h-3" />
            {language === 'ar' ? 'متاح جزئياً' : 'Partially Available'}
          </span>
        );
      case 'Not Available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            {language === 'ar' ? 'غير متوفر' : 'Not Available'}
          </span>
        );
      case 'Not Applicable':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            {language === 'ar' ? 'لا ينطبق' : 'Not Applicable'}
          </span>
        );
      case 'Unknown':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            <HelpCircle className="w-3 h-3" />
            {language === 'ar' ? 'قيد التحقق' : 'Unknown'}
          </span>
        );
    }
  };

  const renderFactCard = (
    title: string,
    fact?: FactItem,
    icon?: React.ReactNode
  ) => {
    if (!fact) return null;
    return (
      <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            {icon}
            <span>{title}</span>
          </div>
          {renderVerificationBadge(fact.status)}
        </div>
        <div className="text-sm font-bold text-slate-900 mb-1 leading-snug">
          {fact.value || (
            <span className="text-slate-400 font-normal italic">
              {language === 'ar' ? 'غير مسجل' : 'Not recorded'}
            </span>
          )}
        </div>
        {(fact.sourceName || fact.sourceUrl || fact.notes) && (
          <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <div className="flex items-center gap-1">
              <span>{fact.sourceName || (language === 'ar' ? 'مصدر موثق' : 'Source')}</span>
              {fact.sourceUrl && (
                <a
                  href={fact.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5 ml-1"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
            {fact.confidenceLevel && (
              <span className="text-slate-400">
                {language === 'ar' ? 'الثقة:' : 'Confidence:'}{' '}
                <span className="font-medium text-slate-600">
                  {fact.confidenceLevel}
                </span>
              </span>
            )}
          </div>
        )}
        {fact.notes && (
          <div className="mt-1 text-[11px] text-amber-700 bg-amber-50/70 rounded px-2 py-1 border border-amber-100/80">
            {fact.notes}
          </div>
        )}
      </div>
    );
  };

  const handleSaveJson = async () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(rawJson);
      setIsSaving(true);
      const ok = await onUpdateIntelligence(JSON.stringify(parsed));
      setIsSaving(false);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setIsEditModalOpen(false);
        }, 1200);
      } else {
        setJsonError(
          language === 'ar'
            ? 'حدث خطأ أثناء حفظ التحديثات في الخادم.'
            : 'Error saving intelligence dossier to server.'
        );
      }
    } catch (err: any) {
      setJsonError(
        language === 'ar'
          ? `صيغة JSON غير صالحة: ${err.message}`
          : `Invalid JSON syntax: ${err.message}`
      );
      setIsSaving(false);
    }
  };

  if (!intelligenceProfile) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {language === 'ar' ? 'لا يتوفر ملف استخباراتي موثق بعد' : 'No Intelligence Profile Available'}
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
          {language === 'ar'
            ? 'لم يتم تدقيق أو إدراج ملف الاستخبارات المدرسية لهذه المدرسة حتى الآن. يمكنك تفعيل الملف يدconfياً.'
            : 'School intelligence profile has not been audited or generated yet.'}
        </p>
        {canEdit && (
          <button
            onClick={() => {
              setRawJson('{}');
              setIsEditModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {language === 'ar' ? 'إنشاء ملف استخباراتي' : 'Initialize Intelligence Dossier'}
          </button>
        )}
      </div>
    );
  }

  const { basicInfo, smsAssessment, academyAssessment, businessOpportunities, pricingInputs, discoveryQuestions, researchMeta } = intelligenceProfile;

  return (
    <div className="space-y-6">
      {/* 1. RESEARCH & INTELLIGENCE OVERVIEW BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                SDC Intelligence Dossier
              </span>
              {renderVerificationBadge(researchMeta?.verificationStatus || 'NEEDS_CONFIRMATION')}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              {basicInfo.officialName?.value || school.name}
              {basicInfo.brandName?.value && (
                <span className="text-sm font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-200">
                  {basicInfo.brandName.value}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-4 flex-wrap">
              <span>
                {language === 'ar' ? 'الباحث الموثق:' : 'Audited By:'}{' '}
                <strong className="text-slate-100">{researchMeta?.researchedBy || 'SDC Intelligence'}</strong>
              </span>
              <span>•</span>
              <span>
                {language === 'ar' ? 'تاريخ آخر تدقيق:' : 'Last Audit:'}{' '}
                <strong className="text-slate-100">{researchMeta?.lastResearchDate || '2026-11-02'}</strong>
              </span>
              <span>•</span>
              <span>
                {language === 'ar' ? 'نسبة اكتمال التحقق:' : 'Completeness:'}{' '}
                <strong className="text-emerald-400">{researchMeta?.researchCompletionPercentage || 85}%</strong>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                onClick={() => {
                  setRawJson(JSON.stringify(intelligenceProfile, null, 2));
                  setIsEditModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {language === 'ar' ? 'تعديل وتحديث الملف' : 'Edit Intelligence Data'}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
            <span>{language === 'ar' ? 'مؤشر جاهزية المعلومات للتسعير والعرض' : 'Pitch & Pricing Data Readiness'}</span>
            <span>{researchMeta?.researchCompletionPercentage || 85}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${researchMeta?.researchCompletionPercentage || 85}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. SECTION A: BASIC SCHOOL INFORMATION & LEGAL IDENTITY */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              {language === 'ar' ? 'القسم أ: البيانات الأساسية والهوية الموثقة' : 'Section A: Verified Basic Information & Identity'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {language === 'ar' ? 'البيانات غير المؤكدة تم وسمها بوضوح' : 'All facts carry source verification badges'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {renderFactCard(language === 'ar' ? 'الاسم الرسمي' : 'Official Name', basicInfo.officialName, <Building className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name', basicInfo.arabicName, <SchoolIcon className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'نوع المدرسة' : 'School Type', basicInfo.schoolType, <Compass className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'المنهج التعليمي' : 'Curriculum', basicInfo.curriculum, <GraduationCap className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'المراحل الدراسية' : 'Educational Stages', basicInfo.educationalStages, <Layers className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'سياسة النوع' : 'Gender Policy', basicInfo.genderPolicy, <Users className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'سنة التأسيس' : 'Established Year', basicInfo.establishedYear, <Calendar className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'عدد الطلاب التقديري' : 'Student Count', basicInfo.studentCount, <Users className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'عدد المعلمين' : 'Teacher Count', basicInfo.teacherCount, <Users className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'عدد الإداريين' : 'Admin Staff Count', basicInfo.adminStaffCount, <Briefcase className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'عدد الفروع والمقرات' : 'Campus Count', basicInfo.campusCount, <Building className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'العنوان الموثق' : 'Official Address', basicInfo.address, <MapPin className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'الموقع الإلكتروني' : 'Official Website', basicInfo.website, <Globe className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'أرقام الهواتف الموثقة' : 'Verified Phone Numbers', basicInfo.phones, <Phone className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'البريد الإلكتروني الموثق' : 'Verified Email Addresses', basicInfo.emails, <Mail className="w-3.5 h-3.5 text-slate-500" />)}
          {renderFactCard(language === 'ar' ? 'قنوات التواصل الاجتماعي' : 'Official Social Media', basicInfo.socialMedia, <Globe className="w-3.5 h-3.5 text-slate-500" />)}
        </div>
      </div>

      {/* 3. SECTION B: CURRENT SCHOOL MANAGEMENT SYSTEM (SMS) EVALUATION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              {language === 'ar' ? 'القسم ب: تدقيق نظام إدارة المدرسة الحالي (SMS)' : 'Section B: Current School Management System (SMS)'}
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {smsAssessment.currentProvider?.value || 'Unknown Provider'}
          </span>
        </div>

        {/* Current Provider Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">
                {language === 'ar' ? 'المزود الحالي للنظام' : 'Current Platform / Provider'}
              </span>
              {renderVerificationBadge(smsAssessment.currentProvider.status)}
            </div>
            <div className="text-sm font-bold text-slate-900">
              {smsAssessment.currentProvider.value}
            </div>
            {smsAssessment.currentProvider.sourceUrl && (
              <a
                href={smsAssessment.currentProvider.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
              >
                <span>{smsAssessment.currentProvider.sourceName || smsAssessment.currentProvider.sourceUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {smsAssessment.currentProvider.notes && (
              <p className="text-xs text-slate-500 mt-1">{smsAssessment.currentProvider.notes}</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">
                {language === 'ar' ? 'نموذج الاستضافة والتشغيل' : 'Hosting & Infrastructure'}
              </span>
              {renderVerificationBadge(smsAssessment.hosting.status)}
            </div>
            <div className="text-sm font-bold text-slate-900">
              {smsAssessment.hosting.value}
            </div>
            {smsAssessment.hosting.notes && (
              <p className="text-xs text-slate-500 mt-1">{smsAssessment.hosting.notes}</p>
            )}
          </div>
        </div>

        {/* 15-Point Capability Matrix */}
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          {language === 'ar' ? 'مصفوفة القدرات والخصائص الفنية (15 معياراً)' : '15-Point Technical Capabilities Assessment Grid'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(smsAssessment.capabilities || {}).map(([key, item]) => {
            const formatCapabilityTitle = (k: string) => {
              const titles: Record<string, { ar: string; en: string }> = {
                studentInformationSystem: { ar: 'نظام إدارة الطلاب (SIS)', en: 'Student Information System' },
                admissionRegistration: { ar: 'القبول والتسجيل الإلكتروني', en: 'Admission & Registration' },
                attendanceAbsence: { ar: 'متابعة الحضور والغياب', en: 'Attendance & Absence' },
                gradesExams: { ar: 'الدرجات والكنترول والامتحانات', en: 'Grades & Examinations' },
                reportCardsCertificates: { ar: 'الشهادات والتقارير الأكاديمية', en: 'Report Cards & Certificates' },
                feesPayments: { ar: 'المصروفات والمدفوعات الإلكترونية', en: 'Fees & Online Payments' },
                parentMobileApp: { ar: 'تطبيق الهاتف لولي الأمر', en: 'Parent Mobile App' },
                teacherApp: { ar: 'تطبيق المعلم والمشرف', en: 'Teacher & Staff App' },
                adminDashboard: { ar: 'لوحة تحكم الإدارة المدرسية', en: 'Admin & Executive Dashboard' },
                transportationManagement: { ar: 'إدارة أسطول الحافلات', en: 'Transportation Management' },
                busTracking: { ar: 'التتبع الحي للحافلات (GPS)', en: 'Real-Time Bus GPS Tracking' },
                parentCommunication: { ar: 'التواصل والرسائل مع أولياء الأمور', en: 'Parent-School Communication' },
                pushNotifications: { ar: 'الإشعارات الفورية (Push)', en: 'Push Notifications' },
                libraryManagement: { ar: 'إدارة المكتبة والاستعارة', en: 'Library Management' },
                homeworkAssignments: { ar: 'الواجبات والمهام المدرسية', en: 'Homework & Assignments' },
                timetableManagement: { ar: 'إدارة الجداول والحصص', en: 'Timetable & Scheduling' },
                existingIntegrations: { ar: 'التكاملات البرمجية القائمة', en: 'Existing Integrations' },
                knownLimitations: { ar: 'القصور والقيود التقنية المعروفة', en: 'Known Technical Limitations' }
              };
              return titles[k] ? (language === 'ar' ? titles[k].ar : titles[k].en) : k;
            };

            return (
              <div
                key={key}
                className="p-3 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {formatCapabilityTitle(key)}
                    </span>
                    {renderCapabilityBadge(item.status)}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    {item.notes || (language === 'ar' ? 'لا توجد ملاحظات مسجلة' : 'No notes available')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECTION C: PROGRAMMING & AI ACADEMY ASSESSMENT (ROOTACA) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              {language === 'ar' ? 'القسم ج: تقييم جاهزية أكاديمية البرمجة والذكاء الاصطناعي (ROOTACA)' : 'Section C: Programming & AI Academy Assessment (ROOTACA)'}
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
            {academyAssessment.computerCount}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-5">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 mb-1">
              {language === 'ar' ? 'جاهزية معمل الحاسب الآلي' : 'Computer Lab Availability'}
            </div>
            <div className="text-sm font-bold text-slate-900">{academyAssessment.computerLabAvailable}</div>
            <div className="text-xs text-slate-500 mt-1">{academyAssessment.computerCount}</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 mb-1">
              {language === 'ar' ? 'مواصفات الأجهزة والشاشات' : 'Lab Workstation Specs'}
            </div>
            <div className="text-xs font-medium text-slate-800 leading-relaxed">
              {academyAssessment.labSpecifications}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 mb-1">
              {language === 'ar' ? 'سرعة الاتصال بالإنترنت' : 'Internet Connectivity'}
            </div>
            <div className="text-sm font-bold text-slate-900">{academyAssessment.internetConnectivity}</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 mb-1">
              {language === 'ar' ? 'المنهج القائم للحاسب' : 'Current Computer Curriculum'}
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">{academyAssessment.existingCurriculum}</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 mb-1">
              {language === 'ar' ? 'أنشطة الروبوتكس والـ STEM' : 'Robotics & STEM Activities'}
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              {academyAssessment.roboticsActivities} • {academyAssessment.stemPrograms}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 mb-1">
              {language === 'ar' ? 'الشريك التدريبي والشهادات المعتمدة' : 'Training Partner & Certifications'}
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              {academyAssessment.trainingPartners} | {academyAssessment.internationalCertifications}
            </div>
          </div>
        </div>

        {/* ROOTACA Academy Opportunities */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            {language === 'ar' ? 'فرص روتاكا أكاديمي المقترحة للمدرسة' : 'Targeted ROOTACA Academy Tracks'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-indigo-950">
            {academyAssessment.rootacaOpportunities?.map((opp, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-indigo-100/60 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{opp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. SECTION D: COMMERCIAL BUSINESS OPPORTUNITIES */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              {language === 'ar' ? 'القسم د: تقييم الفرص التجارية المتاحة (Business Opportunities)' : 'Section D: Qualified Commercial Business Opportunities'}
            </h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            {businessOpportunities?.length || 0} {language === 'ar' ? 'فرص مؤهلة' : 'Opportunities'}
          </span>
        </div>

        <div className="space-y-4">
          {businessOpportunities?.map((opp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
                    {opp.type}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{opp.title}</h4>
                </div>
                {renderVerificationBadge(opp.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-rose-700 block mb-0.5">
                    {language === 'ar' ? 'المشكلة / الاحتياج المؤكد:' : 'Verified Problem / Need:'}
                  </span>
                  <p className="text-slate-600">{opp.verifiedProblem}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                  <span className="font-semibold text-emerald-700 block mb-0.5">
                    {language === 'ar' ? 'الحل المقترح من سمارت ديف كو / روتاكا:' : 'Proposed Solution:'}
                  </span>
                  <p className="text-slate-600">{opp.proposedSolution}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <div>
                  <strong className="text-slate-800">{language === 'ar' ? 'القيمة المتوقعة:' : 'Expected Value:'} </strong>
                  <span>{opp.expectedBusinessValue}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>
                    {language === 'ar' ? 'التعقيد:' : 'Complexity:'}{' '}
                    <strong className="text-slate-800">{opp.implementationComplexity}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {language === 'ar' ? 'الجمهور المستهدف:' : 'Target Audience:'}{' '}
                    <strong className="text-slate-800">{opp.estimatedTargetAudience}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. SECTION E: PRICING ESTIMATION INPUTS & DISCOVERY QUESTIONNAIRE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pricing Inputs Grid (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'مدخلات تسعير العرض (Pricing Inputs)' : 'Pricing Estimation Inputs'}
              </h3>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                pricingInputs?.pricingStatus === 'ReadyForQuotation'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {pricingInputs?.pricingStatus === 'ReadyForQuotation'
                ? (language === 'ar' ? 'جاهز للتسعير' : 'Ready For Quote')
                : (language === 'ar' ? 'نواقص تسعير مطلوبة' : 'Missing Inputs')}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* SMS Inputs */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">
                {language === 'ar' ? 'مدخلات تسعير نظام المدرسة (SMS):' : 'SMS Pricing Drivers:'}
              </span>
              <ul className="space-y-1 text-slate-600">
                <li>• {language === 'ar' ? 'عدد الطلاب:' : 'Students:'} <strong>{pricingInputs?.smsPricing?.studentCount || 'N/A'}</strong></li>
                <li>• {language === 'ar' ? 'عدد الحرم/الفروع:' : 'Campuses:'} <strong>{pricingInputs?.smsPricing?.campusesCount || '1'}</strong></li>
                <li>• {language === 'ar' ? 'الإداريين والمعلمين:' : 'Staff/Teachers:'} <strong>{pricingInputs?.smsPricing?.adminsCount || 'N/A'} / {pricingInputs?.smsPricing?.teachersCount || 'N/A'}</strong></li>
                <li>• {language === 'ar' ? 'نقل البيانات السابقة:' : 'Data Migration:'} <strong>{pricingInputs?.smsPricing?.dataMigrationRequired ? (language === 'ar' ? 'مطلوب' : 'Yes') : (language === 'ar' ? 'غير مطلوب' : 'No')}</strong></li>
                <li>• {language === 'ar' ? 'مستوى الدعم الفني (SLA):' : 'SLA Tier:'} <strong>{pricingInputs?.smsPricing?.slaRequirement || 'Gold 24/7'}</strong></li>
              </ul>
            </div>

            {/* Academy Inputs */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">
                {language === 'ar' ? 'مدخلات تسعير الأكاديمية (Academy):' : 'Academy Pricing Drivers:'}
              </span>
              <ul className="space-y-1 text-slate-600">
                <li>• {language === 'ar' ? 'أجهزة المعمل المتاحة:' : 'Available PCs:'} <strong>{pricingInputs?.academyPricing?.availableComputers || 'N/A'}</strong></li>
                <li>• {language === 'ar' ? 'الطلاب لكل مجموعة:' : 'Students per class:'} <strong>{pricingInputs?.academyPricing?.studentsPerClass || '16'}</strong></li>
                <li>• {language === 'ar' ? 'عدد المجموعات والمدربين:' : 'Cohorts / Trainers:'} <strong>{pricingInputs?.academyPricing?.classesCount || 'N/A'} / {pricingInputs?.academyPricing?.instructorsCount || 'N/A'}</strong></li>
                <li>• {language === 'ar' ? 'حقائب الروبوتكس:' : 'Robotics Kits:'} <strong>{pricingInputs?.academyPricing?.roboticsKitsRequired ? (language === 'ar' ? 'مطلوبة' : 'Required') : (language === 'ar' ? 'غير مطلوبة' : 'None')}</strong></li>
                <li>• {language === 'ar' ? 'مسار الشهادات:' : 'Certification Track:'} <strong>{pricingInputs?.academyPricing?.certificationTrack || 'Python & AI Junior'}</strong></li>
              </ul>
            </div>

            {pricingInputs?.missingPricingFields && pricingInputs.missingPricingFields.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold block mb-1">
                  {language === 'ar' ? 'حقول متبقية قبل التسعير النهائي:' : 'Pending Discovery Gaps:'}
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {pricingInputs.missingPricingFields.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Discovery Questions (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'أسئلة الاستكشاف المخصصة للمدرسة (Tailored Discovery)' : 'School-Specific Discovery Questions'}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {discoveryQuestions?.length || 0} {language === 'ar' ? 'أسئلة حرجة' : 'Questions'}
            </span>
          </div>

          <div className="space-y-3">
            {discoveryQuestions?.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-slate-800">
                    {q.relatedSection}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {q.affectsPricing && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {language === 'ar' ? 'يؤثر على السعر' : 'Affects Pricing'}
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        q.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : q.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {q.priority}
                    </span>
                  </div>
                </div>

                <p className="font-semibold text-slate-900 text-sm mb-1 leading-snug">
                  {language === 'ar' ? q.questionAr : q.questionEn}
                </p>

                <p className="text-[11px] text-slate-500 leading-normal">
                  <strong className="text-slate-600">{language === 'ar' ? 'سبب السؤال:' : 'Why needed:'} </strong>
                  {q.whyNeeded}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. RAW JSON / ADVANCED EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">
                  {language === 'ar' ? 'تعديل وتحديث الملف الاستخباراتي' : 'Edit School Intelligence Profile'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                {language === 'ar'
                  ? 'تنبيه: يمكنك تعديل القيم ومصادر التدقيق وحالات التحقق (VERIFIED, PUBLICLY_FOUND, NEEDS_CONFIRMATION, SALES_HYPOTHESIS, CONFLICTING) مباشرة بصيغة JSON. تأكد من صحة التنسيق البرمجي.'
                  : 'Notice: You can directly modify facts, sources, confidence levels, and verification statuses in JSON. Ensure valid JSON syntax.'}
              </div>

              {jsonError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{jsonError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    {language === 'ar'
                      ? 'تم تحديث الملف الاستخباراتي بنجاح في قاعدة البيانات!'
                      : 'Intelligence profile updated successfully!'}
                  </span>
                </div>
              )}

              <div className="font-mono text-xs">
                <textarea
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  className="w-full h-96 p-3 bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs leading-relaxed"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveJson}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'حفظ التحديثات' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
