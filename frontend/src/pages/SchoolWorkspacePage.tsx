import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Plus,
  Calendar,
  Play,
  CheckCircle2,
  HelpCircle,
  ShieldQuestion,
  Clock,
  Sparkles,
  Check,
  Globe,
  ExternalLink,
  GraduationCap,
  UserCheck,
  FileText,
  AlertTriangle,
  Send,
  X,
  Layers,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Award,
  ChevronDown,
  CheckCircle,
  MessageSquare,
  Search,
  MoreHorizontal,
  Edit2,
  Users,
  Compass
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SlideVisualPreview } from '../components/presentation/SlideVisualPreview';
import { ExecutivePresentationView } from '../components/presentation/ExecutivePresentationView';
import { api } from '../services/api';
import {
  SchoolDetailDto,
  SchoolContactDto,
  VisitDto,
  VisitSummaryDto,
  ActivityDto,
  FollowUpDto,
  QuestionCategoryDto,
  PresentationDto,
  QACategoryDto,
  ProductInterest,
  SalesStatus,
  SchoolType,
  LeadSource,
  VisitOutcomeType,
  ActivityType,
  TeamMemberDto
} from '../types';

export const SchoolWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language, dir } = useLanguage();
  const { isSuperAdmin, isSalesManager, user } = useAuth();

  const [school, setSchool] = useState<SchoolDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'contacts' | 'discovery' | 'presentation' | 'visits'
  >('profile');

  // Discovery State
  const [discoveryCategories, setDiscoveryCategories] = useState<QuestionCategoryDto[]>([]);
  const [activeProductFilter, setActiveProductFilter] = useState<ProductInterest>('Both');
  const [schoolAnswers, setSchoolAnswers] = useState<Record<string, string>>({});
  const [managementAnswers, setManagementAnswers] = useState<string[]>([
    'تستخدم المدرسة حالياً برنامج كنترول محلي قديم غير متصل بالسحابة، ويواجهون صعوبة في رصد الدرجات وإصدار الشهادات بدقة.',
    'التواصل مع أولياء الأمور يتم عبر مجموعات واتساب مبعثرة، وهناك شكاوى متكررة من عدم وصول التنبيهات ومواعيد الحافلات.',
    'الإدارة مهتمة للغاية بميكنة الحضور والغياب وربطه بتطبيق ذكي لولي الأمر لتقليل المكالمات اليومية.'
  ]);
  const [academyAnswers, setAcademyAnswers] = useState<string[]>([
    'يتوفر معمل حاسب آلي يضم 25 جهازاً، وتوجد رغبة في تجهيزه كمعمل برمجة وروبوتكس حديث.',
    'الأنشطة مقتصرة حالياً على مناهج الحاسب التقليدية (Word/Excel)، ولا تتوفر مسارات حقيقية للذكاء الاصطناعي أو البرمجة.',
    'مجلس الإدارة حريص جداً على تقديم مسارات معتمدة دولياً بشهادات موثقة كعامل جذب قوي لأولياء الأمور.'
  ]);
  const [savingAnswers, setSavingAnswers] = useState(false);
  const [answerSuccess, setAnswerSuccess] = useState(false);

  // Presentations State
  const [presentations, setPresentations] = useState<PresentationDto[]>([]);
  const [activePresentation, setActivePresentation] = useState<PresentationDto | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Quick activity search / add state
  const [activitySearchText, setActivitySearchText] = useState('');

  // Modals
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isLogVisitModalOpen, setIsLogVisitModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    fullName: '',
    jobTitle: '',
    phone: '',
    email: '',
    isDecisionMaker: true,
    isPrimaryContact: false,
    contactNotes: ''
  });

  // Visit Form State
  const [visitForm, setVisitForm] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    contactPerson: '',
    contactPosition: 'مدير المدرسة',
    decisionMakerReached: true,
    interestedProducts: 'Both' as ProductInterest,
    visitOutcome: 'DemoRequested' as VisitOutcomeType,
    notes: '',
    nextAction: '',
    nextFollowUpDate: ''
  });

  // Activity Form State
  const [activityForm, setActivityForm] = useState({
    type: 'Call' as ActivityType,
    subject: '',
    description: '',
    isCompleted: true
  });

  // Reassign State
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reps, setReps] = useState<TeamMemberDto[]>([]);
  const [selectedRepId, setSelectedRepId] = useState('');
  const [reassignNotes, setReassignNotes] = useState('');
  const [reassignSubmitting, setReassignSubmitting] = useState(false);

  // Edit School State
  const [isEditSchoolModalOpen, setIsEditSchoolModalOpen] = useState(false);
  const [editSchoolForm, setEditSchoolForm] = useState({
    name: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: 'Cairo',
    district: '',
    schoolType: 'Private' as SchoolType,
    source: 'FieldVisit' as LeadSource,
    salesStatus: 'New' as SalesStatus,
    generalNotes: ''
  });
  const [editSchoolError, setEditSchoolError] = useState<string | null>(null);
  const [editSchoolSubmitting, setEditSchoolSubmitting] = useState(false);

  const canEditSchool = (s: SchoolDetailDto | null) => {
    if (!s) return false;
    if (isSuperAdmin || isSalesManager) return true;
    if (!user) return false;
    if (s.createdByUserId && s.createdByUserId === user.id) return true;
    if (s.assignedToUserId && s.assignedToUserId === user.id) return true;
    if (!s.createdByUserId) return true;
    return false;
  };

  const handleOpenEditSchoolModal = () => {
    if (!school) return;
    setEditSchoolForm({
      name: school.name,
      phone: school.phone || '',
      email: school.email || '',
      website: school.website || '',
      address: school.address || '',
      city: school.city,
      district: school.district || '',
      schoolType: school.schoolType,
      source: school.source,
      salesStatus: school.salesStatus,
      generalNotes: school.generalNotes || ''
    });
    setEditSchoolError(null);
    setIsEditSchoolModalOpen(true);
  };

  const handleEditSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !school) return;
    setEditSchoolError(null);
    setEditSchoolSubmitting(true);
    const res = await api.updateSchool(id, editSchoolForm);
    setEditSchoolSubmitting(false);
    if (res.success) {
      setIsEditSchoolModalOpen(false);
      loadWorkspaceData();
    } else {
      setEditSchoolError(res.message || (language === 'ar' ? 'فشل تعديل بيانات المدرسة' : 'Failed to update school'));
    }
  };

  useEffect(() => {
    if (id) {
      loadWorkspaceData();
    }
  }, [id]);

  const loadWorkspaceData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [schoolRes, discRes, presRes] = await Promise.all([
        api.getSchoolById(id),
        api.getDiscoveryQuestions(),
        api.getPresentations(id)
      ]);

      if (schoolRes.success && schoolRes.data) {
        setSchool(schoolRes.data);
      }

      if (discRes.success && discRes.data) {
        setDiscoveryCategories(discRes.data);
      }

      if (presRes.success && presRes.data) {
        setPresentations(presRes.data);
        if (presRes.data.length > 0) {
          const fullPresRes = await api.getPresentationById(presRes.data[0].id);
          if (fullPresRes.success && fullPresRes.data) {
            setActivePresentation(fullPresRes.data);
          }
        }
      }
    } catch (err) {
      console.error('Error loading workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Contacts Submit
  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const res = await api.addContact(id, contactForm);
    if (res.success) {
      setIsAddContactModalOpen(false);
      setContactForm({
        fullName: '',
        jobTitle: '',
        phone: '',
        email: '',
        isDecisionMaker: true,
        isPrimaryContact: false,
        contactNotes: ''
      });
      loadWorkspaceData();
    }
  };

  // Visits Submit
  const handleLogVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const res = await api.createVisit({
      schoolId: id,
      ...visitForm
    });
    if (res.success) {
      setIsLogVisitModalOpen(false);
      setVisitForm({
        visitDate: new Date().toISOString().split('T')[0],
        contactPerson: '',
        contactPosition: 'مدير المدرسة',
        decisionMakerReached: true,
        interestedProducts: 'Both',
        visitOutcome: 'DemoRequested',
        notes: '',
        nextAction: '',
        nextFollowUpDate: ''
      });
      loadWorkspaceData();
    }
  };

  // Activities Submit
  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const res = await api.createActivity({
      schoolId: id,
      ...activityForm
    });
    if (res.success) {
      setIsAddActivityModalOpen(false);
      setActivityForm({
        type: 'Call',
        subject: '',
        description: '',
        isCompleted: true
      });
      loadWorkspaceData();
    }
  };

  // Quick Inline Activity Submit
  const handleQuickAddActivity = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activitySearchText.trim() && id) {
      await api.createActivity({
        schoolId: id,
        type: 'Call',
        subject: activitySearchText.trim(),
        description: 'مهمة مسجلة عبر شريط التحديث السريع',
        isCompleted: false
      });
      setActivitySearchText('');
      loadWorkspaceData();
    }
  };

  // Reassign Modal
  const handleOpenReassignModal = async () => {
    const res = await api.getUsers();
    if (res.success && res.data) {
      setReps(res.data);
      setSelectedRepId(school?.assignedToUserId || '');
      setIsReassignModalOpen(true);
    }
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedRepId) return;
    setReassignSubmitting(true);
    const res = await api.assignSchool({
      schoolId: id,
      assignedToUserId: selectedRepId,
      notes: reassignNotes
    });
    if (res.success) {
      setIsReassignModalOpen(false);
      setReassignNotes('');
      loadWorkspaceData();
    }
    setReassignSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-mono tracking-wider">
          {language === 'ar' ? 'جاري تحميل مساحة عمل المدرسة...' : 'Loading School Workspace...'}
        </p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="editorial-panel p-12 text-center space-y-4 max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">
          {language === 'ar' ? 'المدرسة غير موجودة أو تم حذفها' : 'School Not Found'}
        </h2>
        <Link
          to="/schools"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00B4D8] text-white rounded-md text-xs font-semibold"
        >
          {language === 'ar' ? 'العودة لقائمة المدارس' : 'Back to Schools'}
        </Link>
      </div>
    );
  }

  const decisionMaker = school.contacts.find(c => c.isDecisionMaker) || school.contacts[0];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & ACTIONS (Pixel-matched to agency image)   */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Right side: Breadcrumbs, Title, Badges */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/schools" className="hover:text-slate-700 transition">
              {language === 'ar' ? 'قائمة المدارس' : 'Schools List'}
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-500 font-medium">
              SCH-{school.id.substring(0, 4).toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {school.name}
            </h1>
            
            {/* Status Badge */}
            <span className="px-3 py-1 rounded-md bg-[#D1F4F9] text-[#00695C] text-xs font-bold">
              {school.salesStatus === 'Assigned' 
                ? (language === 'ar' ? 'موزعة على المندوب' : 'Assigned to Rep')
                : t(`status.${school.salesStatus}`)}
            </span>

            {/* School Type Badge */}
            <span className="px-3 py-1 rounded-md bg-[#E2E8F0] text-slate-700 text-xs font-semibold">
              {t(`schoolType.${school.schoolType}`)}
            </span>

            {/* Edit School Button */}
            {canEditSchool(school) && (
              <button
                type="button"
                onClick={handleOpenEditSchoolModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 border border-slate-200/90 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                title={language === 'ar' ? 'تعديل اسم وبيانات المدرسة' : 'Edit School Name & Details'}
              >
                <Edit2 className="w-3.5 h-3.5 text-cyan-600" />
                <span>{language === 'ar' ? 'تعديل المدرسة' : 'Edit School'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Left side: Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Keynote Launch Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-4 py-2.5 bg-[#0B1528] hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{language === 'ar' ? 'بدء العرض التقديمي (Keynote)' : 'Start Keynote Presentation'}</span>
          </button>

          {/* Log Visit Button */}
          <button
            onClick={() => setIsLogVisitModalOpen(true)}
            className="px-4 py-2.5 bg-white border border-[#00B4D8] hover:bg-cyan-50/40 text-[#00838F] rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>{language === 'ar' ? 'تسجيل زيارة' : 'Log Visit'}</span>
          </button>

          {/* Follow-up / Add Task Button */}
          <button
            onClick={() => setIsAddActivityModalOpen(true)}
            className="px-5 py-2.5 bg-[#009688] hover:bg-[#00897B] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>{language === 'ar' ? 'متابعة' : 'Follow Up'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SEARCH BAR (Right-aligned in RTL / Left in LTR)        */}
      {/* ======================================================== */}
      <div className="flex justify-start">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder={language === 'ar' ? '...بحث عن مدرسة' : 'Search school...'}
            className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 shadow-2xs transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TABS BAR (Right-aligned in RTL / Left in LTR)          */}
      {/* ======================================================== */}
      <div className="border-b border-slate-200/90 flex items-center justify-start gap-6 sm:gap-8 overflow-x-auto text-xs sm:text-sm font-semibold">
        {[
          { id: 'profile', label: language === 'ar' ? 'ملف المدرسة والملكية' : 'School Profile & Ownership' },
          { id: 'contacts', label: `${language === 'ar' ? 'جهات الاتصال' : 'Contacts'} (${school.contacts.length || 1})` },
          { id: 'discovery', label: language === 'ar' ? 'استكشاف المدرسة' : 'Discovery Questions' },
          { id: 'presentation', label: language === 'ar' ? 'معرض الشرائح' : 'Pitch Deck Showcase' },
          { id: 'visits', label: language === 'ar' ? 'سجل الزيارات' : 'Visit History' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-1 whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-slate-900 text-slate-900 font-bold -mb-[2px]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SCHOOL PROFILE & STRATEGIC OWNERSHIP              */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ------------------------------------------------------ */}
          {/* RIGHT COLUMN: Quick Indicators, Rep, Visits Summary    */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Quick Indicators Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'ar' ? 'المؤشرات السريعة' : 'Quick Metrics'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E0F7FA] text-[#00838F] flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {school.recentVisits.length} {language === 'ar' ? 'زيارة' : 'visits'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E0F7FA] text-[#00838F] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {school.contacts.length || 1} {language === 'ar' ? 'جهة اتصال' : 'contact'}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Rep Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'ar' ? 'المندوب المسؤول' : 'Assigned Representative'}
                </h3>
                <button
                  onClick={handleOpenReassignModal}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title={language === 'ar' ? 'تعديل الإسناد' : 'Reassign'}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {school.assignedToUserName ? school.assignedToUserName.replace(/SmartDevCo/gi, 'Rootaca') : 'Rootaca مبيعات'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {language === 'ar' ? 'فريق المبيعات' : 'Sales Team'}
                  </div>
                </div>

                {/* Overlapping Avatars */}
                <div className="flex items-center -space-x-2 rtl:space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-2xs">
                    SM
                  </div>
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Visit Summary Snapshot Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'ar' ? 'سجل الزيارات' : 'Visit Snapshot'}
                </h3>
                <button
                  onClick={() => setIsLogVisitModalOpen(true)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{school.city}{school.district ? ` - ${school.district}` : ' - الشروق'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{decisionMaker?.jobTitle || (language === 'ar' ? 'رئيس تكنولوجيا المعلومات' : 'IT Director')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{school.email || 'info@helsinki.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{language === 'ar' ? 'فريق المبيعات' : 'Sales Team'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------ */}
          {/* MIDDLE COLUMN: School Identity, Contacts, Ownership    */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* School Identity Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <GraduationCap className="w-4 h-4 text-slate-700" />
                  <span>{language === 'ar' ? 'هوية المدرسة' : 'School Identity'}</span>
                </div>
                {canEditSchool(school) && (
                  <button
                    type="button"
                    onClick={handleOpenEditSchoolModal}
                    className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition cursor-pointer"
                    title={language === 'ar' ? 'تعديل بيانات المدرسة' : 'Edit School'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{school.city}{school.district ? ` - ${school.district}` : ' - الشروق'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{school.phone || (language === 'ar' ? 'هاتف.' : 'Phone.')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{school.email || 'info@helsinki.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{school.website || (language === 'ar' ? 'موقع.' : 'Website.')}</span>
                </div>
              </div>
            </div>

            {/* Contacts (1) Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'ar' ? `جهات الاتصال (${school.contacts.length || 1})` : `Contacts (${school.contacts.length || 1})`}
                </h3>
                <button
                  onClick={() => setIsAddContactModalOpen(true)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Decision Maker Snapshot */}
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar & Details */}
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                      alt={decisionMaker?.fullName || 'Ahmed Hamdi'}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {decisionMaker?.fullName || 'أحمد حمدي'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {decisionMaker?.jobTitle || 'رئيس تكنولوجيا المعلومات'}
                      </div>
                    </div>
                  </div>

                  {/* Decision Maker Badge */}
                  <span className="px-3 py-1 rounded-md bg-[#FFECC8] text-[#C05621] text-xs font-bold">
                    {language === 'ar' ? 'صانع القرار' : 'Decision Maker'}
                  </span>
                </div>

                {/* Contact Rows */}
                <div className="space-y-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{decisionMaker?.phone || '+0212527870'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{decisionMaker?.email || 'info@helsinki.com'}</span>
                  </div>
                </div>

                {/* WhatsApp Button */}
                <div className="pt-1">
                  <a
                    href={`https://wa.me/${(decisionMaker?.phone || '2012527870').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Ownership Lifecycle History Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'ar' ? 'سجل ملكية العميل المحتمل' : 'Lead Ownership History'}
              </h3>

              <div className="relative border-s-2 border-cyan-500/30 ms-3 space-y-4 ps-4">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -start-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[#00B4D8] border-2 border-white" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        {language === 'ar' ? 'تم إنشاء العميل' : 'Lead Created'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {new Date(school.createdAtUtc).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) || '12 نوفمبر 2023'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {language === 'ar' ? 'اليوم' : 'Today'}
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -start-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[#00B4D8] border-2 border-white" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        {language === 'ar' ? 'تم الإسناد إلى Rootaca' : 'Assigned to Rootaca'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {language === 'ar' ? '13 نوفمبر 2023' : '13 Nov 2023'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {language === 'ar' ? 'أمس' : 'Yesterday'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------ */}
          {/* LEFT COLUMN: Activity & Tasks                          */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'ar' ? 'النشاط والمهام' : 'Activity & Tasks'}
                </h3>
                <button
                  onClick={() => setIsAddActivityModalOpen(true)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Input Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={language === 'ar' ? '...تحديث / الحوث' : 'Add quick update / task...'}
                  value={activitySearchText}
                  onChange={e => setActivitySearchText(e.target.value)}
                  onKeyDown={handleQuickAddActivity}
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl ps-9 pe-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <Edit2 className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Activity / Task Checklist Items with Connecting Guide Line */}
              <div className="relative border-s border-slate-200/90 ms-3 space-y-4 ps-4 pt-1">
                {/* Item 1: In Progress / Circle */}
                <div className="relative flex items-start justify-between gap-3 text-xs">
                  <div className="absolute -start-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white" />
                  <div className="space-y-0.5 pe-2">
                    <div className="font-bold text-slate-800">
                      {language === 'ar' ? 'تيوم تحصافة' : 'Interactive Demo Meeting'}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      {language === 'ar' ? 'في امعدمات حمدنا لقر الإسنة في المتاميس على المسترية العناء الكثير.' : 'Prepared presentation deck for board review'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium shrink-0">
                    {language === 'ar' ? 'اليوم' : 'Today'}
                  </span>
                </div>

                {/* Item 2: Completed / Teal Checked */}
                <div className="relative flex items-start justify-between gap-3 text-xs">
                  <div className="absolute -start-[23px] top-1 w-3.5 h-3.5 rounded bg-[#009688] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div className="space-y-0.5 pe-2">
                    <div className="font-bold text-slate-800">
                      {language === 'ar' ? 'تحديث البيانات' : 'Update Data'}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      {language === 'ar' ? 'العميل المصالح على قمي البيانات' : 'Client expressed strong interest in LMS & Cloud Control'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium shrink-0">
                    {language === 'ar' ? 'أمس' : 'Yesterday'}
                  </span>
                </div>

                {/* Item 3: Completed / Teal Checked */}
                <div className="relative flex items-start justify-between gap-3 text-xs">
                  <div className="absolute -start-[23px] top-1 w-3.5 h-3.5 rounded bg-[#009688] text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div className="space-y-0.5 pe-2">
                    <div className="font-bold text-slate-800">
                      {language === 'ar' ? 'تحديث البيانات' : 'Update Data'}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      {language === 'ar' ? 'العميل المصالح بدوافى قمي البيانات' : 'Sent technical pricing comparison matrix via email'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium shrink-0">
                    {language === 'ar' ? 'أمس' : 'Yesterday'}
                  </span>
                </div>

                {/* Item 4: Unchecked Box */}
                <div className="relative flex items-start justify-between gap-3 text-xs">
                  <div className="absolute -start-[23px] top-1 w-3.5 h-3.5 rounded border border-slate-300 bg-white" />
                  <div className="space-y-0.5 pe-2">
                    <div className="font-bold text-slate-800">
                      {language === 'ar' ? 'تم الإسناد إلى Rootaca' : 'Assigned to Rootaca'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {language === 'ar' ? '13 نوفمبر 2023' : '13 Nov 2023'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium shrink-0">
                    {language === 'ar' ? 'أمس' : 'Yesterday'}
                  </span>
                </div>

                {/* Item 5: Unchecked Box */}
                <div className="relative flex items-start justify-between gap-3 text-xs">
                  <div className="absolute -start-[23px] top-1 w-3.5 h-3.5 rounded border border-slate-300 bg-white" />
                  <div className="space-y-0.5 pe-2">
                    <div className="font-bold text-slate-800">
                      {language === 'ar' ? 'مكالمة متابعة' : 'Follow-up Call'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {language === 'ar' ? '12 نوفمبر 2023' : '12 Nov 2023'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium shrink-0">
                    {language === 'ar' ? 'اليوم' : 'Today'}
                  </span>
                </div>

                {/* Item 6: Unchecked Box */}
                <div className="relative flex items-start justify-between gap-3 text-xs">
                  <div className="absolute -start-[23px] top-1 w-3.5 h-3.5 rounded border border-slate-300 bg-white" />
                  <div className="space-y-0.5 pe-2">
                    <div className="font-bold text-slate-800">
                      {language === 'ar' ? 'تحديث البيانات' : 'Update Data'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {language === 'ar' ? '1 نوفمبر 2023' : '1 Nov 2023'}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium shrink-0">
                    {language === 'ar' ? 'أمس' : 'Yesterday'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CONTACTS & STAKEHOLDERS DIRECTORY                 */}
      {/* ======================================================== */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'دليل جهات الاتصال وصناع القرار' : 'School Contacts & Stakeholders'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'إدارة المسؤولين، الملاك، ومديري الحسابات مع إمكانية التواصل السريع' : 'Manage key decision makers, principals, and influencers.'}
              </p>
            </div>
            <button
              onClick={() => setIsAddContactModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#009688] hover:bg-[#00897B] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة جهة اتصال' : 'Add Contact'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {school.contacts.map(c => (
              <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {c.fullName.substring(0, 1)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{c.fullName}</div>
                      <div className="text-xs text-slate-400">{c.jobTitle}</div>
                    </div>
                  </div>
                  {c.isDecisionMaker && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FFF3E0] text-[#E65100] text-xs font-semibold">
                      {language === 'ar' ? 'صانع القرار' : 'Decision Maker'}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${c.phone}`} className="font-mono text-cyan-700 hover:underline">{c.phone}</a>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`mailto:${c.email}`} className="text-slate-600 hover:underline">{c.email}</a>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <a
                    href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition"
                  >
                    <MessageSquare className="w-3 h-3 fill-current" />
                    <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                  </a>
                  {c.isPrimaryContact && (
                    <span className="text-[11px] text-cyan-600 font-semibold">
                      {language === 'ar' ? 'جهة اتصال رئيسية' : 'Primary'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DISCOVERY & NEEDS ASSESSMENT                      */}
      {/* ======================================================== */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-xl text-cyan-950 text-xs sm:text-sm font-semibold flex items-center gap-3">
            <span className="text-xl shrink-0">💡</span>
            <span>
              {language === 'ar'
                ? 'استبيان استكشاف احتياجات المدرسة يساعد في تخصيص العرض التقديمي Keynote وحساب السعر بدقة.'
                : 'Discovery questions help tailor the presentation deck and offer accurate pricing.'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                {language === 'ar' ? '1. نظام إدارة المدرسة (SMS)' : '1. School Management System'}
              </h4>
              <div className="space-y-3">
                {managementAnswers.map((ans, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {ans}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                {language === 'ar' ? '2. أكاديمية البرمجة والذكاء الاصطناعي' : '2. Coding & AI Academy'}
              </h4>
              <div className="space-y-3">
                {academyAnswers.map((ans, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {ans}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SLIDESHOW & PRESENTATIONS SHOWCASE                */}
      {/* ======================================================== */}
      {activeTab === 'presentation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-600" />
                <span>{language === 'ar' ? 'معرض شرائح العرض التقديمي (Keynote)' : 'Slide Presentation Showcase'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'معاينة الشرائح المخصصة للمدرسة مع إمكانية إطلاق العرض للعميل' : 'Preview customized slides for this school or launch full-screen'}
              </p>
            </div>
            <button
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1528] hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'ar' ? 'عرض ملء الشاشة' : 'Launch Full Screen'}</span>
            </button>
          </div>

          {activePresentation ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePresentation.slides.map((slide, index) => (
                <div
                  key={slide.id}
                  onClick={() => {
                    setCurrentSlideIndex(index);
                    setIsFullscreen(true);
                  }}
                  className="group relative rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden cursor-pointer hover:border-cyan-500 hover:shadow-md transition-all p-3"
                >
                  <div className="aspect-[16/10] bg-[#F8FAFC] rounded-xl overflow-hidden relative mb-2.5 border border-slate-200/70">
                    <SlideVisualPreview 
                      category={slide.category} 
                      slideTitle={(language === 'ar' ? slide.slideTitleAr : slide.slideTitleEn).replace(/SmartDevCo/gi, 'Rootaca').replace(/سمارت ديف كو/gi, 'روتاكا')} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="font-bold text-slate-800 truncate">
                      {(language === 'ar' ? slide.slideTitleAr : slide.slideTitleEn).replace(/SmartDevCo/gi, 'Rootaca').replace(/سمارت ديف كو/gi, 'روتاكا')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              {language === 'ar' ? 'جاري تجهيز العرض التقديمي الخاص بالمدرسة...' : 'Loading presentations...'}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: FIELD VISIT LOG                                   */}
      {/* ======================================================== */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'سجل وتاريخ الزيارات الميدانية' : 'Field Visit History'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar' ? 'توثيق نتائج المقابلات، مخرجات الاجتماعات، ومواعيد المتابعة القادمة' : 'All past in-person sales visits and meeting minutes.'}
              </p>
            </div>
            <button
              onClick={() => setIsLogVisitModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#009688] hover:bg-[#00897B] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'تسجيل زيارة جديدة' : 'Log New Visit'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50/80 border-b border-slate-200/90 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 text-start">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                    <th className="px-5 py-3.5 text-start">{language === 'ar' ? 'المسؤول' : 'Contact Person'}</th>
                    <th className="px-5 py-3.5 text-start">{language === 'ar' ? 'المندوب' : 'Representative'}</th>
                    <th className="px-5 py-3.5 text-start">{language === 'ar' ? 'النتيجة' : 'Outcome'}</th>
                    <th className="px-5 py-3.5 text-start">{language === 'ar' ? 'الإجراء القادم' : 'Next Step'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {school.recentVisits.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4 font-mono font-medium text-slate-900">
                        {new Date(v.visitDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{v.contactPerson}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">{v.representativeName}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-100/70 text-cyan-800">
                          {t(`outcome.${v.visitOutcome}`)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{v.nextAction || '—'}</td>
                    </tr>
                  ))}
                  {school.recentVisits.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        {language === 'ar' ? 'لم يتم تسجيل أي زيارات ميدانية لهذه المدرسة بعد' : 'No field visits recorded yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FULLSCREEN KEYNOTE EXECUTIVE PRESENTATION                */}
      {/* ======================================================== */}
      {isFullscreen && activePresentation && (
        <ExecutivePresentationView
          presentation={activePresentation}
          initialSlideIndex={currentSlideIndex}
          onClose={() => setIsFullscreen(false)}
          onSelectAction={() => {
            setIsFullscreen(false);
            setActiveTab('visits');
            setIsLogVisitModalOpen(true);
          }}
          schoolName={school.name}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD CONTACT                                       */}
      {/* ======================================================== */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'إضافة جهة اتصال جديدة' : 'Add New Contact'}
              </h3>
              <button onClick={() => setIsAddContactModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}</label>
                <input
                  type="text"
                  required
                  value={contactForm.fullName}
                  onChange={e => setContactForm({ ...contactForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'المسمى الوظيفي *' : 'Job Title *'}</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: رئيس تكنولوجيا المعلومات، الناظر' : 'e.g. IT Director'}
                  value={contactForm.jobTitle}
                  onChange={e => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'رقم الهاتف *' : 'Phone *'}</label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('common.email')}</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={contactForm.isDecisionMaker}
                    onChange={e => setContactForm({ ...contactForm, isDecisionMaker: e.target.checked })}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>{language === 'ar' ? 'صانع قرار مباشر' : 'Decision Maker'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={contactForm.isPrimaryContact}
                    onChange={e => setContactForm({ ...contactForm, isPrimaryContact: e.target.checked })}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>{language === 'ar' ? 'جهة اتصال رئيسية' : 'Primary Contact'}</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('common.notes')}</label>
                <textarea
                  rows={2}
                  value={contactForm.contactNotes}
                  onChange={e => setContactForm({ ...contactForm, contactNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#009688] hover:bg-[#00897B] text-white rounded-xl font-bold shadow-xs"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: LOG VISIT                                         */}
      {/* ======================================================== */}
      {isLogVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'تسجيل زيارة ميدانية جديدة' : 'Log Field Visit'}
              </h3>
              <button onClick={() => setIsLogVisitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogVisitSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'تاريخ الزيارة *' : 'Visit Date *'}</label>
                  <input
                    type="date"
                    required
                    value={visitForm.visitDate}
                    onChange={e => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'المنتج المهتم به' : 'Product'}</label>
                  <select
                    value={visitForm.interestedProducts}
                    onChange={e => setVisitForm({ ...visitForm, interestedProducts: e.target.value as ProductInterest })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Both">{t('product.Both')}</option>
                    <option value="SmartSchool">{t('product.SmartSchool')}</option>
                    <option value="Academy">{t('product.Academy')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'المسؤول الذي قابلته *' : 'Met With *'}</label>
                  <input
                    type="text"
                    required
                    value={visitForm.contactPerson}
                    onChange={e => setVisitForm({ ...visitForm, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'منصب المسؤول' : 'Position'}</label>
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'مثال: مدير المدرسة، الناظر' : 'e.g. Principal'}
                    value={visitForm.contactPosition}
                    onChange={e => setVisitForm({ ...visitForm, contactPosition: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'نتيجة الزيارة *' : 'Outcome *'}</label>
                <select
                  value={visitForm.visitOutcome}
                  onChange={e => setVisitForm({ ...visitForm, visitOutcome: e.target.value as VisitOutcomeType })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  <option value="DemoRequested">{t('outcome.DemoRequested')}</option>
                  <option value="MeetingScheduled">{t('outcome.MeetingScheduled')}</option>
                  <option value="ProposalRequested">{t('outcome.ProposalRequested')}</option>
                  <option value="DetailsRequested">{t('outcome.DetailsRequested')}</option>
                  <option value="DecisionMakerNotReached">{t('outcome.DecisionMakerNotReached')}</option>
                  <option value="FollowUpLater">{t('outcome.FollowUpLater')}</option>
                  <option value="ClosedWon">{t('outcome.ClosedWon')}</option>
                  <option value="ClosedLost">{t('outcome.ClosedLost')}</option>
                  <option value="NotInterested">{t('outcome.NotInterested')}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'الإجراء التالي المتفق عليه' : 'Next Action / Step'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'مثال: إرسال عرض مالي، تنسيق اجتماع ديمو...' : 'e.g. Send proposal...'}
                    value={visitForm.nextAction}
                    onChange={e => setVisitForm({ ...visitForm, nextAction: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'موعد المتابعة القادم' : 'Next Follow-up Date'}
                  </label>
                  <input
                    type="date"
                    value={visitForm.nextFollowUpDate}
                    onChange={e => setVisitForm({ ...visitForm, nextFollowUpDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={visitForm.decisionMakerReached}
                    onChange={e => setVisitForm({ ...visitForm, decisionMakerReached: e.target.checked })}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>{language === 'ar' ? 'تمت مقابلة صاحب القرار الرئيسي في الجلسة' : 'Reached Key Decision Maker'}</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'ملاحظات تفصيلية عن الزيارة' : 'Visit Notes'}</label>
                <textarea
                  rows={2}
                  value={visitForm.notes}
                  onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogVisitModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#009688] hover:bg-[#00897B] text-white rounded-xl font-bold shadow-xs"
                >
                  {language === 'ar' ? 'توثيق الزيارة نهائياً' : 'Log Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD ACTIVITY                                      */}
      {/* ======================================================== */}
      {isAddActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'تسجيل نشاط أو مهمة متابعة' : 'Log Activity or Task'}
              </h3>
              <button onClick={() => setIsAddActivityModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivitySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'نوع النشاط' : 'Activity Type'}</label>
                <select
                  value={activityForm.type}
                  onChange={e => setActivityForm({ ...activityForm, type: e.target.value as ActivityType })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  <option value="Call">{language === 'ar' ? 'مكالمة هاتفية' : 'Phone Call'}</option>
                  <option value="Meeting">{language === 'ar' ? 'اجتماع' : 'Meeting'}</option>
                  <option value="Email">{language === 'ar' ? 'بريد إلكتروني' : 'Email'}</option>
                  <option value="Demo">{language === 'ar' ? 'عرض حي (Demo)' : 'Demo Session'}</option>
                  <option value="Note">{language === 'ar' ? 'ملاحظة' : 'Note'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'موضوع النشاط *' : 'Subject *'}</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: إرسال دراسة الجدوى لمدير المدرسة' : 'e.g. Send proposal'}
                  value={activityForm.subject}
                  onChange={e => setActivityForm({ ...activityForm, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'تفاصيل إضافية' : 'Description'}</label>
                <textarea
                  rows={2}
                  value={activityForm.description}
                  onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddActivityModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#009688] hover:bg-[#00897B] text-white rounded-xl font-bold shadow-xs"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REASSIGN REPRESENTATIVE                           */}
      {/* ======================================================== */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'إسناد المدرسة لمندوب مبيعات' : 'Reassign Sales Representative'}
              </h3>
              <button onClick={() => setIsReassignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {language === 'ar' ? 'اختر المندوب الجديد *' : 'Select Representative *'}
                </label>
                <select
                  required
                  value={selectedRepId}
                  onChange={e => setSelectedRepId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  <option value="">{language === 'ar' ? '-- اختر مندوب مبيعات --' : '-- Select Rep --'}</option>
                  {reps.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {language === 'ar' ? 'سبب أو ملاحظات إعادة الإسناد' : 'Reassignment Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'ar' ? 'توضيح سبب النقل أو التوجيهات للمندوب...' : 'Reason for transfer...'}
                  value={reassignNotes}
                  onChange={e => setReassignNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={reassignSubmitting}
                  className="px-5 py-2 bg-[#009688] hover:bg-[#00897B] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {reassignSubmitting ? t('common.loading') : (language === 'ar' ? 'تأكيد الإسناد' : 'Confirm Assignment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT SCHOOL DETAILS                               */}
      {/* ======================================================== */}
      {isEditSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-600" />
                <span>{language === 'ar' ? 'تعديل بيانات واسم المدرسة' : 'Edit School Name & Details'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditSchoolModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSchoolError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                {editSchoolError}
              </div>
            )}

            <form onSubmit={handleEditSchoolSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'اسم المدرسة *' : 'School Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editSchoolForm.name}
                  onChange={e => setEditSchoolForm({ ...editSchoolForm, name: e.target.value })}
                  placeholder="e.g. مدرسة الرواد الدولية"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'المدينة *' : 'City *'}
                  </label>
                  <select
                    value={editSchoolForm.city}
                    onChange={e => setEditSchoolForm({ ...editSchoolForm, city: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none font-medium"
                  >
                    <option value="Cairo">القاهرة (Cairo)</option>
                    <option value="Giza">الجيزة (Giza)</option>
                    <option value="Alexandria">الإسكندرية (Alexandria)</option>
                    <option value="Mansoura">المنصورة (Mansoura)</option>
                    <option value="Tanta">طنطا (Tanta)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'نوع المدرسة *' : 'School Type *'}
                  </label>
                  <select
                    value={editSchoolForm.schoolType}
                    onChange={e => setEditSchoolForm({ ...editSchoolForm, schoolType: e.target.value as SchoolType })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none font-medium"
                  >
                    <option value="Private">{language === 'ar' ? 'خاص (Private)' : 'Private'}</option>
                    <option value="International">{language === 'ar' ? 'دولي (International)' : 'International'}</option>
                    <option value="Language">{language === 'ar' ? 'تجريبي / لغات (Language)' : 'Language'}</option>
                    <option value="National">{language === 'ar' ? 'أهلي / قومي (National)' : 'National'}</option>
                    <option value="Experimental">{language === 'ar' ? 'رسمي متميز (Experimental)' : 'Experimental'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={editSchoolForm.phone}
                    onChange={e => setEditSchoolForm({ ...editSchoolForm, phone: e.target.value })}
                    placeholder="e.g. 01012345678"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={editSchoolForm.email}
                    onChange={e => setEditSchoolForm({ ...editSchoolForm, email: e.target.value })}
                    placeholder="info@school.edu.eg"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'العنوان' : 'Address'}
                </label>
                <input
                  type="text"
                  value={editSchoolForm.address}
                  onChange={e => setEditSchoolForm({ ...editSchoolForm, address: e.target.value })}
                  placeholder="e.g. التجمع الخامس، القاهرة الجديدة"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                  </label>
                  <input
                    type="text"
                    value={editSchoolForm.website}
                    onChange={e => setEditSchoolForm({ ...editSchoolForm, website: e.target.value })}
                    placeholder="https://school.edu.eg"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'المرحلة البيعية' : 'Sales Status'}
                  </label>
                  <select
                    value={editSchoolForm.salesStatus}
                    onChange={e => setEditSchoolForm({ ...editSchoolForm, salesStatus: e.target.value as SalesStatus })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none font-medium"
                  >
                    <option value="New">{t('status.New')}</option>
                    <option value="Assigned">{t('status.Assigned')}</option>
                    <option value="Contacted">{t('status.Contacted')}</option>
                    <option value="MeetingScheduled">{t('status.MeetingScheduled')}</option>
                    <option value="DemoCompleted">{t('status.DemoCompleted')}</option>
                    <option value="Negotiation">{t('status.Negotiation')}</option>
                    <option value="ContractSigned">{t('status.ContractSigned')}</option>
                    <option value="Disqualified">{t('status.Disqualified')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'ملاحظات عامة' : 'General Notes'}
                </label>
                <textarea
                  rows={2}
                  value={editSchoolForm.generalNotes}
                  onChange={e => setEditSchoolForm({ ...editSchoolForm, generalNotes: e.target.value })}
                  placeholder={language === 'ar' ? 'أي تفاصيل هامة عن إدارة المدرسة أو متطلباتهم...' : 'Important details about the school...'}
                  className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditSchoolModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={editSchoolSubmitting}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {editSchoolSubmitting ? t('common.loading') : (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
