import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // App & Brand
    'app.title': 'Rootaca — إدارة مبيعات المدارس والزيارات',
    'app.subtitle': 'منظومة مبيعات حلول ROOTACA Smart School & ROOTACA Academy',
    'app.short': 'SDC مبيعات المدارس',
    'common.search': 'بحث...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.create': 'إضافة جديدة',
    'common.actions': 'الإجراءات',
    'common.status': 'الحالة',
    'common.all': 'الكل',
    'common.loading': 'جاري التحميل...',
    'common.empty': 'لا توجد بيانات متاحة',
    'common.confirmDelete': 'هل أنت متأكد من رغبتك في الحذف؟ لا يمكن التراجع عن هذا الإجراء.',
    'common.notes': 'ملاحظات',
    'common.date': 'التاريخ',
    'common.phone': 'الهاتف',
    'common.email': 'البريد الإلكتروني',
    'common.city': 'المدينة',
    'common.district': 'الحي / المنطقة',
    'common.address': 'العنوان التفصيلي',
    'common.view': 'عرض التفاصيل',
    'common.refresh': 'تحديث',
    'common.export': 'تصدير البيانات',

    // Navigation
    'nav.dashboard': 'لوحة المؤشرات',
    'nav.schools': 'المدارس والعملاء',
    'nav.assignments': 'توزيع المدارس',
    'nav.visits': 'تقارير الزيارات',
    'nav.targets': 'الأهداف والمبيعات',
    'nav.presentations': 'العروض التقديمية',
    'nav.discovery': 'بنك الأسئلة الاستكشافية',
    'nav.knowledgeBase': 'الاعتراضات والأسئلة الشائعة',
    'nav.team': 'فريق المبيعات',
    'nav.reports': 'تقارير الأداء',
    'nav.logout': 'تسجيل الخروج',

    // Roles
    'role.SuperAdmin': 'مدير النظام (SuperAdmin)',
    'role.SalesManager': 'مدير مبيعات (SalesManager)',
    'role.SalesRepresentative': 'مندوب مبيعات (Representative)',

    // Sales Statuses
    'status.New': 'جديدة',
    'status.Assigned': 'موزعة للمندوب',
    'status.Contacted': 'تم التواصل',
    'status.VisitScheduled': 'تم جدولة زيارة',
    'status.Visited': 'تمت الزيارة',
    'status.DemoScheduled': 'تم طلب ديمو',
    'status.ProposalSent': 'تم إرسال عرض سعر',
    'status.Negotiation': 'مفاوضات جارية',
    'status.ClosedWon': 'تم التعاقد بنجاح',
    'status.ClosedLost': 'لم يتم التعاقد',
    'status.Inactive': 'غير نشطة',

    // School Types
    'schoolType.National': 'حكومي / عربي',
    'schoolType.International': 'دولي (International)',
    'schoolType.Private': 'خاص (Private)',
    'schoolType.Language': 'لغات (Language)',
    'schoolType.Experimental': 'تجريبي / متميز',
    'schoolType.Other': 'أخرى',

    // Sources
    'source.FieldVisit': 'زيارة ميدانية',
    'source.Referral': 'ترشيح ومعارف',
    'source.SocialMedia': 'منصات التواصل',
    'source.InboundCall': 'اتصال وارد',
    'source.Website': 'الموقع الإلكتروني',
    'source.Exhibition': 'معرض تعليمي',
    'source.Other': 'أخرى',

    // Products
    'product.SmartSchool': 'ROOTACA Smart School',
    'product.Academy': 'ROOTACA Academy',
    'product.Both': 'كلا المنتجين (الكل)',
    'product.Neither': 'لا شيء منها',

    // Visit Outcomes
    'outcome.DemoRequested': 'طلب عرض ديمو تفاعلي',
    'outcome.MeetingScheduled': 'تم جدولة اجتماع مجلس إدارة',
    'outcome.NextMeetingScheduled': 'تم جدولة اجتماع مجلس إدارة',
    'outcome.ProposalRequested': 'طلب عرض فني ومالي',
    'outcome.DetailsRequested': 'طلب كتيبات ومعلومات إضافية',
    'outcome.InformationSent': 'طلب كتيبات ومعلومات إضافية',
    'outcome.DecisionMakerNotReached': 'لم يتم مقابلة صانع القرار',
    'outcome.NotInterested': 'غير مهتم حالياً',
    'outcome.FollowUpLater': 'متابعة لاحقة',
    'outcome.FollowUpRequired': 'متابعة لاحقة',
    'outcome.ClosedWon': 'إغلاق الصفقة (تعاقد)',
    'outcome.ClosedLost': 'إلغاء الصفقة',

    // Activities
    'activity.Call': 'مكالمة هاتفية',
    'activity.Visit': 'زيارة ميدانية',
    'activity.Meeting': 'اجتماع عمل',
    'activity.Email': 'بريد إلكتروني',
    'activity.WhatsApp': 'محادثة واتساب',
    'activity.Note': 'ملاحظة داخلية',
    'activity.Reminder': 'تذكير بموعد',
    'activity.Demo': 'جلسة ديمو حية',

    // Priorities
    'priority.Low': 'منخفضة',
    'priority.Medium': 'متوسطة',
    'priority.High': 'مرتفعة',
    'priority.Urgent': 'عاجلة جداً',

    // Follow Up Status
    'followUpStatus.Pending': 'قيد الانتظار',
    'followUpStatus.InProgress': 'جاري العمل',
    'followUpStatus.Completed': 'مكتملة',
    'followUpStatus.Cancelled': 'ملغاة',

    // Answer Types
    'answerType.Text': 'إجابة نصية',
    'answerType.Number': 'قيمة رقمية',
    'answerType.YesNo': 'نعم / لا',
    'answerType.SingleChoice': 'اختيار واحد',
    'answerType.MultipleChoice': 'اختيارات متعددة',

    // Slide Categories
    'category.CompanyOverview': 'نبذة عن الشركة',
    'category.SmartSchool': 'منظومة Smart School',
    'category.Academy': 'روتاكا أكاديمي',
    'category.ValueProposition': 'القيمة المضافة والأمان',
    'category.Closing': 'الخطوات القادمة',

    // Periods
    'period.Monthly': 'شهري',
    'period.Quarterly': 'ربع سنوي',

    // Dashboard
    'dashboard.totalSchools': 'إجمالي المدارس',
    'dashboard.newSchools': 'مدارس جديدة',
    'dashboard.visitedSchools': 'مدارس تمت زيارتها',
    'dashboard.unassignedSchools': 'مدارس غير موزعة',
    'dashboard.mySchools': 'مدارسي المسجلة',
    'dashboard.myAssigned': 'المدارس الموكلة إليّ',
    'dashboard.totalVisits': 'الزيارات المنفذة',
    'dashboard.demosRequested': 'عروض ديمو مطلوبة',
    'dashboard.proposalsRequested': 'عروض أسعار مطلوبة',
    'dashboard.followUpsDue': 'متابعات قادمة',
    'dashboard.followUpsOverdue': 'متابعات متأخرة',
    'dashboard.targetAchievement': 'متوسط تحقيق الأهداف',
    'dashboard.pipeline': 'مراحل المبيعات والمتابعة',
    'dashboard.topReps': 'أداء مندوبي المبيعات',
    'dashboard.upcomingVisits': 'الزيارات الميدانية القادمة',
    'dashboard.overdueList': 'تنبيه: متابعات متأخرة تتطلب التدخل',

    // Workspace Tabs
    'workspace.title': 'مساحة عمل المدرسة',
    'workspace.profile': 'ملف المدرسة والملكية',
    'workspace.contacts': 'جهات الاتصال',
    'workspace.discovery': 'الأسئلة الاستكشافية',
    'workspace.presentation': 'العرض التقديمي',
    'workspace.objections': 'الأسئلة والاعتراضات',
    'workspace.visits': 'سجل الزيارات',
    'workspace.activities': 'الأنشطة والمتابعات',
    'workspace.creator': 'المندوب المكتشف الأصلي',
    'workspace.assignedTo': 'المندوب المسؤول حالياً',
    'workspace.reassign': 'إعادة توزيع المدرسة',

    // Presentation Mode
    'pres.fullscreen': 'عرض ملء الشاشة للعميل',
    'pres.exitFullscreen': 'خروج من العرض',
    'pres.customerMode': 'وضع العميل (إخفاء الملاحظات الداخلية)',
    'pres.internalMode': 'وضع المبيعات الداخلي',
    'pres.prev': 'الشريحة السابقة (السهم الأيمن)',
    'pres.next': 'الشريحة التالية (السهم الأيسر)',
    'pres.slide': 'شريحة'
  },
  en: {
    // App & Brand
    'app.title': 'Rootaca — School Sales & Visit Manager',
    'app.subtitle': 'Sales CRM for ROOTACA Smart School & ROOTACA Academy',
    'app.short': 'SDC School Sales',
    'common.search': 'Search...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Add New',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.all': 'All',
    'common.loading': 'Loading...',
    'common.empty': 'No data available',
    'common.confirmDelete': 'Are you sure you want to delete this record? This action cannot be undone.',
    'common.notes': 'Notes',
    'common.date': 'Date',
    'common.phone': 'Phone',
    'common.email': 'Email',
    'common.city': 'City',
    'common.district': 'District',
    'common.address': 'Address',
    'common.view': 'View Details',
    'common.refresh': 'Refresh',
    'common.export': 'Export Data',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.schools': 'Schools CRM',
    'nav.assignments': 'Assignments',
    'nav.visits': 'Visits Log',
    'nav.targets': 'Sales Targets',
    'nav.presentations': 'Presentations',
    'nav.discovery': 'Discovery Bank',
    'nav.knowledgeBase': 'Objections & FAQs',
    'nav.team': 'Sales Team',
    'nav.reports': 'Performance Reports',
    'nav.logout': 'Sign Out',

    // Roles
    'role.SuperAdmin': 'Super Administrator',
    'role.SalesManager': 'Sales Manager',
    'role.SalesRepresentative': 'Sales Representative',

    // Sales Statuses
    'status.New': 'New',
    'status.Assigned': 'Assigned',
    'status.Contacted': 'Contacted',
    'status.VisitScheduled': 'Visit Scheduled',
    'status.Visited': 'Visited',
    'status.DemoScheduled': 'Demo Scheduled',
    'status.ProposalSent': 'Proposal Sent',
    'status.Negotiation': 'Negotiation',
    'status.ClosedWon': 'Closed Won',
    'status.ClosedLost': 'Closed Lost',
    'status.Inactive': 'Inactive',

    // School Types
    'schoolType.National': 'National',
    'schoolType.International': 'International',
    'schoolType.Private': 'Private',
    'schoolType.Language': 'Language',
    'schoolType.Experimental': 'Experimental',
    'schoolType.Other': 'Other',

    // Sources
    'source.FieldVisit': 'Field Visit',
    'source.Referral': 'Referral',
    'source.SocialMedia': 'Social Media',
    'source.InboundCall': 'Inbound Call',
    'source.Website': 'Website',
    'source.Exhibition': 'Exhibition',
    'source.Other': 'Other',

    // Products
    'product.SmartSchool': 'ROOTACA Smart School',
    'product.Academy': 'ROOTACA Academy',
    'product.Both': 'Both Products',
    'product.Neither': 'Neither',

    // Visit Outcomes
    'outcome.DemoRequested': 'Demo Requested',
    'outcome.MeetingScheduled': 'Meeting Scheduled',
    'outcome.NextMeetingScheduled': 'Meeting Scheduled',
    'outcome.ProposalRequested': 'Proposal Requested',
    'outcome.DetailsRequested': 'Details Requested',
    'outcome.InformationSent': 'Details Requested',
    'outcome.DecisionMakerNotReached': 'Decision Maker Not Reached',
    'outcome.NotInterested': 'Not Interested',
    'outcome.FollowUpLater': 'Follow-up Later',
    'outcome.FollowUpRequired': 'Follow-up Later',
    'outcome.ClosedWon': 'Closed Won',
    'outcome.ClosedLost': 'Closed Lost',

    // Activities
    'activity.Call': 'Phone Call',
    'activity.Visit': 'Field Visit',
    'activity.Meeting': 'Meeting',
    'activity.Email': 'Email',
    'activity.WhatsApp': 'WhatsApp Message',
    'activity.Note': 'Internal Note',
    'activity.Reminder': 'Reminder',
    'activity.Demo': 'Live Demo Session',

    // Priorities
    'priority.Low': 'Low',
    'priority.Medium': 'Medium',
    'priority.High': 'High',
    'priority.Urgent': 'Urgent',

    // Follow Up Status
    'followUpStatus.Pending': 'Pending',
    'followUpStatus.InProgress': 'In Progress',
    'followUpStatus.Completed': 'Completed',
    'followUpStatus.Cancelled': 'Cancelled',

    // Answer Types
    'answerType.Text': 'Text Response',
    'answerType.Number': 'Numeric',
    'answerType.YesNo': 'Yes / No',
    'answerType.SingleChoice': 'Single Choice',
    'answerType.MultipleChoice': 'Multiple Choice',

    // Slide Categories
    'category.CompanyOverview': 'Company Overview',
    'category.SmartSchool': 'Smart School Platform',
    'category.Academy': 'Rootaca Academy',
    'category.ValueProposition': 'Value Proposition & Cloud',
    'category.Closing': 'Next Steps & Closing',

    // Periods
    'period.Monthly': 'Monthly',
    'period.Quarterly': 'Quarterly',

    // Dashboard
    'dashboard.totalSchools': 'Total Schools',
    'dashboard.newSchools': 'New Schools',
    'dashboard.visitedSchools': 'Visited Schools',
    'dashboard.unassignedSchools': 'Unassigned Schools',
    'dashboard.mySchools': 'My Discovered',
    'dashboard.myAssigned': 'My Assigned',
    'dashboard.totalVisits': 'Total Visits',
    'dashboard.demosRequested': 'Demos Requested',
    'dashboard.proposalsRequested': 'Proposals Requested',
    'dashboard.followUpsDue': 'Upcoming Follow-ups',
    'dashboard.followUpsOverdue': 'Overdue Follow-ups',
    'dashboard.targetAchievement': 'Avg Target Achievement',
    'dashboard.pipeline': 'Sales Pipeline Breakdown',
    'dashboard.topReps': 'Sales Team Performance',
    'dashboard.upcomingVisits': 'Upcoming Scheduled Visits',
    'dashboard.overdueList': 'Alert: Overdue Follow-ups Requiring Attention',

    // Workspace Tabs
    'workspace.title': 'School Workspace',
    'workspace.profile': 'School Profile',
    'workspace.contacts': 'Contacts',
    'workspace.discovery': 'Discovery Questions',
    'workspace.presentation': 'Presentation Deck',
    'workspace.objections': 'Questions & Objections',
    'workspace.visits': 'Visit Reports',
    'workspace.activities': 'Activities & Follow-ups',
    'workspace.creator': 'Discovered By',
    'workspace.assignedTo': 'Assigned Representative',
    'workspace.reassign': 'Reassign School',

    // Presentation Mode
    'pres.fullscreen': 'Customer Presentation Mode',
    'pres.exitFullscreen': 'Exit Fullscreen',
    'pres.customerMode': 'Customer Mode (Hidden Internal Notes)',
    'pres.internalMode': 'Internal Rep Mode',
    'pres.prev': 'Previous Slide (Left Arrow)',
    'pres.next': 'Next Slide (Right Arrow)',
    'pres.slide': 'Slide'
  }
};

// Common word dictionary fallback for Arabic translations:
const arabicWordDictionary: Record<string, string> = {
  'Verified': 'معتمد وموثق',
  'Not recorded': 'غير مسجل',
  'Unassigned': 'غير مسند حالياً',
  'visits': 'زيارات',
  'tasks': 'أنشطة ومتابعات',
  'contacts': 'جهات اتصال',
  'Schools': 'قائمة المدارس',
  'Keynote': 'العرض التقديمي',
  'Log Visit': 'تسجيل زيارة',
  'Task': 'مهمة متابعة',
  'Reassign': 'تغيير الإسناد',
  'Decision Maker': 'صانع القرار',
  'Assigned Rep': 'المسؤول الميداني',
  'School Administration': 'إدارة المدرسة',
  'SDC Enterprise Representative': 'ممثل معتمد لمؤسسة SDC',
  'Awaiting Assignment': 'في انتظار الإسناد',
  'Reached': 'تمت مقابلته',
  'Not Reached': 'لم تتم مقابلته',
  'Target School': 'المدرسة المستهدفة',
  'Current Rep': 'المندوب الحالي',
  'All': 'الكل',
  'Call': 'مكالمة هاتفية',
  'Meeting': 'اجتماع عمل',
  'Email': 'بريد إلكتروني',
  'Demo': 'عرض ديمو تفاعلي',
  'Note': 'ملاحظة',
  'Reminder': 'تذكير بموعد',
  'WhatsApp': 'واتساب',
  'High': 'مرتفعة',
  'Medium': 'متوسطة',
  'Low': 'منخفضة',
  'Urgent': 'عاجلة جداً',
  'Pending': 'قيد الانتظار',
  'Completed': 'مكتملة',
  'Cancelled': 'ملغاة',
  'InProgress': 'قيد المتابعة',
  'Both': 'كلا المنتجين',
  'SmartSchool': 'ROOTACA Smart School',
  'Academy': 'ROOTACA Academy',
  'Neither': 'لا شيء منها',
  'National': 'حكومي / عربي',
  'International': 'دولي (International)',
  'Private': 'خاص (Private)',
  'Language': 'لغات (Language)',
  'Experimental': 'تجريبي / متميز',
  'Other': 'أخرى',
  'FieldVisit': 'زيارة ميدانية',
  'Referral': 'ترشيح ومعارف',
  'SocialMedia': 'منصات التواصل',
  'InboundCall': 'اتصال وارد',
  'Website': 'الموقع الإلكتروني',
  'Exhibition': 'معرض تعليمي',
  'DemoRequested': 'طلب عرض ديمو تفاعلي',
  'MeetingScheduled': 'تم جدولة اجتماع مجلس إدارة',
  'NextMeetingScheduled': 'تم جدولة اجتماع مجلس إدارة',
  'ProposalRequested': 'طلب عرض فني ومالي',
  'DetailsRequested': 'طلب كتيبات ومعلومات إضافية',
  'InformationSent': 'طلب كتيبات ومعلومات إضافية',
  'DecisionMakerNotReached': 'لم يتم مقابلة صانع القرار',
  'NotInterested': 'غير مهتم حالياً',
  'FollowUpLater': 'متابعة لاحقة',
  'FollowUpRequired': 'متابعة لاحقة',
  'ClosedWon': 'تم التعاقد بنجاح',
  'ClosedLost': 'لم يتم التعاقد',
  'New': 'جديدة',
  'Assigned': 'موزعة للمندوب',
  'Contacted': 'تم التواصل',
  'VisitScheduled': 'تم جدولة زيارة',
  'Visited': 'تمت الزيارة',
  'DemoScheduled': 'تم طلب ديمو',
  'ProposalSent': 'تم إرسال عرض سعر',
  'Negotiation': 'مفاوضات جارية',
  'Inactive': 'غير نشطة',
  'CompanyOverview': 'نبذة عن الشركة',
  'ValueProposition': 'القيمة المضافة والأمان',
  'Closing': 'الخطوات القادمة',
  'Monthly': 'شهري',
  'Quarterly': 'ربع سنوي',
  'SuperAdmin': 'مدير النظام (SuperAdmin)',
  'SalesManager': 'مدير مبيعات (SalesManager)',
  'SalesRepresentative': 'مندوب مبيعات (Representative)',
  'Cairo': 'القاهرة',
  'Giza': 'الجيزة',
  'Alexandria': 'الإسكندرية',
  'Mansoura': 'المنصورة',
  'Tanta': 'طنطا',
  'Principal': 'مدير المدرسة',
  'Vice Principal': 'وكيل المدرسة',
  'IT Director': 'مسؤول تقنية المعلومات',
  'Direct WhatsApp': 'واتساب مباشر'
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'ar';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('lang', language);
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', dir);
  }, [language, dir]);

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, defaultText?: string): string => {
    if (!key) return defaultText || '';

    // 1. Exact key match in translations
    if (translations[language][key]) {
      return translations[language][key];
    }

    // 2. Prefixed fallback checks
    const prefixes = [
      'status.',
      'outcome.',
      'product.',
      'schoolType.',
      'source.',
      'activity.',
      'priority.',
      'role.',
      'category.',
      'followUpStatus.',
      'answerType.',
      'period.'
    ];

    for (const prefix of prefixes) {
      const candidate = prefix + key;
      if (translations[language][candidate]) {
        return translations[language][candidate];
      }
    }

    // 3. Arabic dictionary fallback for commonly used terms
    if (language === 'ar' && arabicWordDictionary[key]) {
      return arabicWordDictionary[key];
    }

    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, dir, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
