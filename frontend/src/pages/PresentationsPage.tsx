import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  SlideMultiImagesView,
  parseSlideImages,
  serializeSlideImages,
  SlideImageItem
} from '../components/presentation/SlideMultiImagesView';
import {
  Plus,
  Save,
  Maximize2,
  FileText,
  Search,
  MoreVertical,
  RotateCcw,
  RotateCw,
  Edit,
  Trash2,
  X,
  Play,
  Tv,
  CheckCircle2,
  Sparkles,
  Layout,
  Cog,
  Cloud,
  ShieldCheck,
  Calendar,
  GraduationCap,
  Users,
  Globe,
  Share2,
  Copy,
  ExternalLink,
  RefreshCw,
  BarChart2,
  Eye,
  Check,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ExecutivePresentationView } from '../components/presentation/ExecutivePresentationView';
import {
  parseSlideFooterMetadata,
  serializeSlideFooterMetadata,
  TwitterIcon,
  LinkedinIcon,
  FacebookIcon,
  InstagramIcon
} from '../components/presentation/SlideSocialFooter';
import { api } from '../services/api';
import {
  PresentationDto,
  PresentationSlideDto,
  SlideCategory,
  PresentationAnalyticsSummaryDto,
  SchoolDto,
  ProductInterest
} from '../types';

// Curated High-Resolution Default Slide Images matching the 8 Core Sales Deck topics
const DEFAULT_SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop', // Slide 1: About Rootaca
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop', // Slide 2: Challenges
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop', // Slide 3: Smart School
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop', // Slide 4: Mobile App
  JSON.stringify([
    { url: '/slides/connected-parent.png', title: 'Parent', subtitle: 'تجربة ولي الأمر', caption: 'Parent' },
    { url: '/slides/connected-student.png', title: 'Student', subtitle: 'تجربة الطالب', caption: 'Student' },
    { url: '/slides/connected-supervisor.png', title: 'Supervisor', subtitle: 'أدوات المشرف', caption: 'Supervisor' },
    { url: '/slides/connected-teacher.png', title: 'Teacher', subtitle: 'بيئة عمل المعلم', caption: 'Teacher' }
  ]), // Slide 5: One Connected School Community (4 Cards matching mockup)
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop', // Slide 6: Academy
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop', // Slide 7: Security & Cloud
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop', // Slide 8: Roadmap
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop', // Slide 9: Live Demo
];

// High-Fidelity Custom Artwork adapted to Main Dashboard Light Palette
const SlideArtIllustration: React.FC<{ index: number; title: string }> = ({ index, title }) => {
  const t = title.toLowerCase();

  // Slide 1: Company Overview
  if (index === 0 || t.includes('من نحن') || t.includes('rootaca') || t.includes('smartdevco')) {
    return (
      <div className="flex items-center justify-between w-full aspect-[16/10] min-h-[220px] sm:min-h-[235px] md:min-h-[245px] lg:min-h-[255px] xl:min-h-[270px] 2xl:min-h-[285px] px-4 py-3 mb-3 rounded-xl bg-slate-50/70 border border-slate-100">
        <div className="text-right">
          <div className="text-xs font-bold text-slate-600">من نحن — شركة</div>
          <div className="text-sm font-black text-[#00838F] tracking-tight">Rootaca</div>
        </div>
        <div className="relative w-28 h-20 flex items-center justify-center">
          <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible">
            <polygon points="50,5 85,75 15,75" fill="#00B4D8" opacity="0.3" />
            <polygon points="50,5 85,45 50,75" fill="#0D6EFD" opacity="0.25" />
            <circle cx="75" cy="35" r="14" fill="#00B4D8" opacity="0.4" />
            <circle cx="25" cy="65" r="10" fill="#00838F" opacity="0.3" />
          </svg>
          <div className="absolute w-11 h-11 rounded-xl bg-white shadow-md border border-slate-200 overflow-hidden flex items-center justify-center">
            <img src="/rootaca-logo.png" alt="Rootaca" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );
  }

  // Slide 2: Challenges
  if (index === 1 || t.includes('تحديات') || t.includes('مشاكل')) {
    return (
      <div className="flex items-center justify-between w-full aspect-[16/10] min-h-[220px] sm:min-h-[235px] md:min-h-[245px] lg:min-h-[255px] xl:min-h-[270px] 2xl:min-h-[285px] px-4 py-3 mb-3 rounded-xl bg-slate-50/70 border border-slate-100">
        <div className="text-right">
          <div className="text-xs font-bold text-slate-800">تحديات إدارة</div>
          <div className="text-xs font-bold text-slate-800">المدارس</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Warning Triangle */}
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 shadow-2xs">
            <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-amber-600 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          {/* Interlocking Cog Gears */}
          <div className="relative w-11 h-11 flex items-center justify-center">
            <Cog className="w-8 h-8 text-[#00B4D8] animate-spin-slow" />
            <Cog className="w-5 h-5 text-cyan-600 absolute -bottom-1 -left-1" />
          </div>
        </div>
      </div>
    );
  }

  // Slide 3: ROOTACA Smart School
  if (index === 2 || t.includes('مدرسة rootaca') || t.includes('smart school')) {
    return (
      <div className="flex items-center justify-between w-full aspect-[16/10] min-h-[220px] sm:min-h-[235px] md:min-h-[245px] lg:min-h-[255px] xl:min-h-[270px] 2xl:min-h-[285px] px-4 py-3 mb-3 rounded-xl bg-slate-50/70 border border-slate-100">
        <div className="text-right">
          <div className="text-xs font-black text-slate-800">نظام مدرسة</div>
          <div className="text-xs font-black text-[#00838F]">ROOTACA الذكية</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Classical School Building */}
          <div className="w-11 h-12 rounded-xl bg-white border border-cyan-400 p-1 flex flex-col justify-between items-center text-cyan-700 shadow-2xs">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[8px] border-b-cyan-500"></div>
            <div className="flex gap-1">
              <div className="w-1 h-5 bg-cyan-600 rounded-xs"></div>
              <div className="w-1 h-5 bg-cyan-600 rounded-xs"></div>
              <div className="w-1 h-5 bg-cyan-600 rounded-xs"></div>
            </div>
            <div className="w-full h-1 bg-cyan-500 rounded-xs"></div>
          </div>
          {/* Cylinder Database */}
          <div className="w-8 h-10 rounded-lg bg-cyan-50 border border-cyan-300 p-1 flex flex-col justify-between items-center shadow-2xs">
            <div className="w-6 h-2 rounded-full border border-cyan-400 bg-cyan-200"></div>
            <div className="w-6 h-2 rounded-full border border-cyan-400 bg-cyan-100"></div>
            <div className="w-6 h-2 rounded-full border border-cyan-400 bg-cyan-200"></div>
          </div>
          {/* Mini Dashboard Chart */}
          <div className="w-12 h-11 rounded-lg bg-blue-50 border border-blue-200 p-1 flex flex-col justify-between shadow-2xs">
            <div className="w-full h-1 bg-blue-400 rounded-xs"></div>
            <div className="flex gap-0.5 items-end h-4">
              <span className="w-1.5 h-2 bg-blue-400 rounded-xs"></span>
              <span className="w-1.5 h-3.5 bg-cyan-500 rounded-xs"></span>
              <span className="w-1.5 h-4 bg-[#00B4D8] rounded-xs"></span>
              <span className="w-1.5 h-2.5 bg-blue-600 rounded-xs"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slide 4: Parent & Teacher Apps
  if (index === 3 || t.includes('تطبيق') || t.includes('أولياء') || t.includes('معلمين')) {
    return (
      <div className="flex items-center justify-between w-full aspect-[16/10] min-h-[220px] sm:min-h-[235px] md:min-h-[245px] lg:min-h-[255px] xl:min-h-[270px] 2xl:min-h-[285px] px-4 py-3 mb-3 rounded-xl bg-slate-50/70 border border-slate-100">
        <div className="text-right">
          <div className="text-xs font-black text-slate-800">تطبيق أولياء</div>
          <div className="text-xs font-black text-slate-800">الأمور</div>
          <div className="text-xs font-black text-slate-800">والمعلمين</div>
        </div>
        {/* Two realistic smartphones */}
        <div className="flex items-center -space-x-2 space-x-reverse">
          <div className="w-10 h-16 rounded-xl bg-white border-2 border-cyan-400 p-1 shadow-md flex flex-col justify-between items-center">
            <div className="w-3 h-0.5 rounded-full bg-cyan-400"></div>
            <div className="w-5 h-5 rounded-full bg-cyan-100 border border-cyan-400 flex items-center justify-center text-[7px] text-cyan-800 font-bold">R</div>
            <div className="w-full space-y-0.5">
              <div className="h-0.5 w-full bg-cyan-400 rounded"></div>
              <div className="h-0.5 w-3/4 bg-cyan-300 rounded"></div>
            </div>
          </div>
          <div className="w-10 h-16 rounded-xl bg-blue-50 border-2 border-blue-400 p-1 shadow-lg z-10 flex flex-col justify-between items-center scale-105">
            <div className="w-3 h-0.5 rounded-full bg-blue-500"></div>
            <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[8px]">👨‍🎓</div>
            <div className="w-full space-y-0.5">
              <div className="h-0.5 w-full bg-blue-500 rounded"></div>
              <div className="h-0.5 w-2/3 bg-blue-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slide 5: ROOTACA Academy
  if (index === 4 || t.includes('أكاديمية') || t.includes('academy')) {
    return (
      <div className="flex items-center justify-between w-full aspect-[16/10] min-h-[220px] sm:min-h-[235px] md:min-h-[245px] lg:min-h-[255px] xl:min-h-[270px] 2xl:min-h-[285px] px-4 py-3 mb-3 rounded-xl bg-slate-50/70 border border-slate-100">
        <div className="text-right">
          <div className="text-xs font-black text-slate-800">نظام أكاديمية</div>
          <div className="text-xs font-black text-[#00838F]">ROOTACA</div>
        </div>
        <div className="relative">
          <div className="w-16 h-11 rounded-lg bg-white border-2 border-cyan-400 p-1 flex flex-col justify-between shadow-xs">
            <div className="text-[6px] text-cyan-700 font-bold">ONLINE Academy</div>
            <div className="w-full h-3 bg-cyan-50 rounded flex items-center px-1">
              <span className="text-[5px] text-emerald-600 font-mono font-bold">Courses 100%</span>
            </div>
          </div>
          <div className="w-20 h-1 bg-slate-300 rounded-b-md -mt-0.5 -mx-2"></div>
          <div className="absolute -bottom-1 -right-2 w-6 h-6 rounded-full bg-cyan-100 border border-cyan-400 flex items-center justify-center text-cyan-700 shadow-xs">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-700" />
          </div>
        </div>
      </div>
    );
  }

  // Slide 6: Cloud Security
  if (index === 5 || t.includes('أمن') || t.includes('سحاب') || t.includes('cloud')) {
    return (
      <div className="flex items-center justify-between w-full aspect-[16/10] min-h-[220px] sm:min-h-[235px] md:min-h-[245px] lg:min-h-[255px] xl:min-h-[270px] 2xl:min-h-[285px] px-4 py-3 mb-3 rounded-xl bg-slate-50/70 border border-slate-100">
        <div className="text-right">
          <div className="text-xs font-black text-slate-800">أمن وسرية</div>
          <div className="text-xs font-black text-[#00838F]">السحابة</div>
        </div>
        <div className="relative flex items-center justify-center w-20 h-16">
          <Cloud className="w-16 h-16 text-cyan-500 fill-cyan-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#00B4D8] text-white flex items-center justify-center shadow-md shadow-cyan-400/40">
              <ShieldCheck className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slide 7: Digital Transformation Roadmap
  if (index === 6 || t.includes('تحول') || t.includes('خطة') || t.includes('roadmap')) {
    return (
      <div className="flex items-center justify-between w-full aspect-[16/10] min-h-[220px] sm:min-h-[235px] md:min-h-[245px] lg:min-h-[255px] xl:min-h-[270px] 2xl:min-h-[285px] px-4 py-3 mb-3 rounded-xl bg-slate-50/70 border border-slate-100">
        <div className="text-right">
          <div className="text-xs font-black text-slate-800">خطة التحول الرقمي</div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="space-y-1.5 w-14">
            <div className="h-1.5 bg-[#00B4D8] rounded-full w-full"></div>
            <div className="h-1.5 bg-cyan-400 rounded-full w-3/4 mr-2"></div>
            <div className="h-1.5 bg-blue-300 rounded-full w-1/2 mr-4"></div>
          </div>
          <div className="w-11 h-11 rounded-full border-2 border-dashed border-[#00B4D8] bg-cyan-50 flex items-center justify-center text-cyan-700 shadow-2xs">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-cyan-600" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Slide 8: Next Steps & Closing
  return (
    <div className="flex items-center justify-between w-full aspect-[16/10] min-h-[220px] sm:min-h-[235px] md:min-h-[245px] lg:min-h-[255px] xl:min-h-[270px] 2xl:min-h-[285px] px-4 py-3 mb-3 rounded-xl bg-slate-50/70 border border-slate-100">
      <div className="text-right">
        <div className="text-xs font-black text-slate-800">الخطوة التالية —</div>
        <div className="text-xs font-black text-[#00838F]">موعد العرض التجريبي</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-11 h-11 rounded-xl bg-white border border-cyan-400 flex items-center justify-center text-cyan-700 relative shadow-2xs">
          <Calendar className="w-6 h-6 text-cyan-600" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00B4D8] flex items-center justify-center text-white shadow-xs">
            <span className="text-[9px] font-black">✓</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-300 flex items-center justify-center text-blue-700 shadow-2xs">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

export const PresentationsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, isSuperAdmin, isSalesManager } = useAuth();

  const [presentations, setPresentations] = useState<PresentationDto[]>([]);
  const [selectedPres, setSelectedPres] = useState<PresentationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);

  // Fullscreen Presentation Mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Slide Editor Modal
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<PresentationSlideDto | null>(null);
  const [slideForm, setSlideForm] = useState({
    slideTitleAr: '',
    slideTitleEn: '',
    contentAr: '',
    contentEn: '',
    pointsAr: '',
    pointsEn: '',
    images: [{ url: '', caption: '' }] as SlideImageItem[],
    category: 'CompanyOverview' as SlideCategory,
    isEnabled: true,
    notes: '',
    websiteUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    customChips: [
      { titleEn: '', titleAr: '' },
      { titleEn: '', titleAr: '' },
      { titleEn: '', titleAr: '' }
    ]
  });
  const [submitting, setSubmitting] = useState(false);

  // Schools for custom presentation binding
  const [schools, setSchools] = useState<SchoolDto[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // Create Presentation Modal
  const [isCreatePresModalOpen, setIsCreatePresModalOpen] = useState(false);
  const [createPresForm, setCreatePresForm] = useState({
    title: '',
    description: '',
    isTemplate: true,
    schoolId: '',
    selectedProducts: 'Both' as ProductInterest
  });
  const [isSubmittingCreatePres, setIsSubmittingCreatePres] = useState(false);

  // Duplicate Presentation Modal
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [presToDuplicate, setPresToDuplicate] = useState<PresentationDto | null>(null);
  const [duplicateForm, setDuplicateForm] = useState({
    newTitle: '',
    isCustomForSchool: false,
    schoolId: '',
    isTemplate: false
  });
  const [isSubmittingDuplicate, setIsSubmittingDuplicate] = useState(false);

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    setLoading(true);
    const res = await api.getPresentations();
    if (res.success && res.data) {
      setPresentations(res.data);
      if (res.data.length > 0) {
        // If current selected is still in list, keep it, else select first
        const currentId = selectedPres?.id;
        const target = res.data.find(p => p.id === currentId) || res.data[0];
        await loadFullPresentation(target.id);
      } else {
        setSelectedPres(null);
      }
    }
    setLoading(false);
  };

  const loadSchools = async () => {
    if (schools.length > 0) return;
    setLoadingSchools(true);
    try {
      const res = await api.getSchools({ pageSize: 100 });
      if (res.success && res.data) {
        setSchools(res.data.items);
      }
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleOpenCreatePres = () => {
    setCreatePresForm({
      title: '',
      description: '',
      isTemplate: true,
      schoolId: '',
      selectedProducts: 'Both'
    });
    setIsCreatePresModalOpen(true);
    loadSchools();
  };

  const handleCreatePresSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createPresForm.title.trim()) return;
    setIsSubmittingCreatePres(true);
    try {
      const payload = {
        title: createPresForm.title.trim(),
        description: createPresForm.description.trim() || undefined,
        isTemplate: createPresForm.isTemplate,
        schoolId: (!createPresForm.isTemplate && createPresForm.schoolId) ? createPresForm.schoolId : undefined,
        selectedProducts: createPresForm.selectedProducts
      };
      const res = await api.createPresentation(payload);
      if (res.success && res.data) {
        setIsCreatePresModalOpen(false);
        await loadPresentations();
        await loadFullPresentation(res.data.id);
        alert(language === 'ar' ? 'تم إنشاء العرض التقديمي بنجاح!' : 'Presentation created successfully!');
      } else {
        alert(res.message || (language === 'ar' ? 'حدث خطأ أثناء إنشاء العرض' : 'Failed to create presentation'));
      }
    } catch (err: any) {
      alert(err?.message || (language === 'ar' ? 'خطأ في الاتصال بالخادم' : 'Server error'));
    } finally {
      setIsSubmittingCreatePres(false);
    }
  };

  const handleOpenDuplicate = (pres: PresentationDto) => {
    setPresToDuplicate(pres);
    setDuplicateForm({
      newTitle: `${pres.title} (نسخة)`,
      isCustomForSchool: !pres.isTemplate && !!pres.schoolId,
      schoolId: pres.schoolId || '',
      isTemplate: pres.isTemplate
    });
    setIsDuplicateModalOpen(true);
    loadSchools();
  };

  const handleDuplicateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presToDuplicate || isSubmittingDuplicate) return;
    setIsSubmittingDuplicate(true);
    try {
      const payload = {
        newTitle: duplicateForm.newTitle.trim() || undefined,
        targetSchoolId: (duplicateForm.isCustomForSchool && duplicateForm.schoolId) ? duplicateForm.schoolId : undefined,
        isTemplate: duplicateForm.isTemplate && !duplicateForm.isCustomForSchool
      };
      const res = await api.duplicatePresentation(presToDuplicate.id, payload);
      if (res.success && res.data) {
        setIsDuplicateModalOpen(false);
        await loadPresentations();
        await loadFullPresentation(res.data.id);
        alert(
          language === 'ar' 
            ? `تم استنساخ العرض بنجاح مع كافة الشرائح (${res.data.slidesCount || res.data.slides?.length || 0} شريحة)!` 
            : 'Presentation and all slides duplicated successfully!'
        );
      } else {
        alert(res.message || (language === 'ar' ? 'حدث خطأ أثناء نسخ العرض' : 'Failed to duplicate presentation'));
      }
    } catch (err: any) {
      alert(err?.message || (language === 'ar' ? 'خطأ في الاتصال بالخادم' : 'Server error'));
    } finally {
      setIsSubmittingDuplicate(false);
    }
  };

  const handleDeletePresentation = async (pres: PresentationDto) => {
    if (pres.isTemplate && presentations.filter(p => p.isTemplate).length <= 1) {
      alert(language === 'ar' ? 'لا يمكن حذف القالب الرئيسي الوحيد في النظام.' : 'Cannot delete the only master template.');
      return;
    }
    if (!window.confirm(language === 'ar' ? `هل أنت متأكد من حذف العرض "${pres.title}" وكافة الشرائح التابعة له؟` : `Delete presentation "${pres.title}" and all its slides?`)) {
      return;
    }
    const res = await api.deletePresentation(pres.id);
    if (res.success) {
      await loadPresentations();
      alert(language === 'ar' ? 'تم حذف العرض بنجاح.' : 'Presentation deleted.');
    } else {
      alert(res.message || (language === 'ar' ? 'فشل حذف العرض.' : 'Failed to delete presentation.'));
    }
  };

  const loadFullPresentation = async (id: string, targetSlideId?: string, isSwitchingPresentation: boolean = false) => {
    const res = await api.getPresentationById(id);
    if (res.success && res.data) {
      setSelectedPres(res.data);
      if (res.data.slides.length > 0) {
        if (targetSlideId && res.data.slides.some(s => s.id === targetSlideId)) {
          setSelectedSlideId(targetSlideId);
        } else if (!isSwitchingPresentation && selectedSlideId && res.data.slides.some(s => s.id === selectedSlideId)) {
          // Keep current selected slide
          setSelectedSlideId(selectedSlideId);
        } else {
          setSelectedSlideId(res.data.slides[0].id);
        }
      } else {
        setSelectedSlideId(null);
      }
    }
  };

  const handleOpenAddSlide = () => {
    setEditingSlide(null);
    setSlideForm({
      slideTitleAr: '',
      slideTitleEn: '',
      contentAr: '',
      contentEn: '',
      pointsAr: '',
      pointsEn: '',
      images: [{ url: '', caption: '' }],
      category: 'CompanyOverview',
      isEnabled: true,
      notes: '',
      websiteUrl: 'www.helsinkischool.edu',
      twitterUrl: 'https://twitter.com',
      linkedinUrl: 'https://linkedin.com',
      facebookUrl: 'https://facebook.com',
      instagramUrl: 'https://instagram.com',
      customChips: [
        { titleEn: 'Inspiring Spaces', titleAr: 'مساحات ملهمة' },
        { titleEn: 'Smart Learning', titleAr: 'تعلم ذكي' },
        { titleEn: 'Active Lifestyle', titleAr: 'نمط حياة نشط' }
      ]
    });
    setIsSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: PresentationSlideDto) => {
    setEditingSlide(slide);
    let ptsAr = '';
    let ptsEn = '';
    try {
      if (slide.keyPointsArJson) {
        const parsed = JSON.parse(slide.keyPointsArJson);
        ptsAr = Array.isArray(parsed) ? parsed.join('\n') : '';
      }
      if (slide.keyPointsEnJson) {
        const parsed = JSON.parse(slide.keyPointsEnJson);
        ptsEn = Array.isArray(parsed) ? parsed.join('\n') : '';
      }
    } catch {
      // Ignored
    }

    const parsedImages = parseSlideImages(slide.imageUrl);
    const footerMeta = parseSlideFooterMetadata(slide.notes);

    setSlideForm({
      slideTitleAr: slide.slideTitleAr,
      slideTitleEn: slide.slideTitleEn,
      contentAr: slide.contentAr,
      contentEn: slide.contentEn,
      pointsAr: ptsAr,
      pointsEn: ptsEn,
      images: parsedImages.length > 0 ? parsedImages : [{ url: '', caption: '' }],
      category: slide.category,
      isEnabled: slide.isEnabled,
      notes: footerMeta.presenterNotes || '',
      websiteUrl: footerMeta.websiteUrl || '',
      twitterUrl: footerMeta.twitterUrl || '',
      linkedinUrl: footerMeta.linkedinUrl || '',
      facebookUrl: footerMeta.facebookUrl || '',
      instagramUrl: footerMeta.instagramUrl || '',
      customChips: (footerMeta.chips && footerMeta.chips.length > 0)
        ? footerMeta.chips.map(c => ({ titleEn: c.titleEn || '', titleAr: c.titleAr || '' }))
        : [
            { titleEn: 'Inspiring Spaces', titleAr: 'مساحات ملهمة' },
            { titleEn: 'Smart Learning', titleAr: 'تعلم ذكي' },
            { titleEn: 'Active Lifestyle', titleAr: 'نمط حياة نشط' }
          ]
    });
    setIsSlideModalOpen(true);
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPres) return;
    setSubmitting(true);

    const pointsArList = slideForm.pointsAr.split('\n').map(s => s.trim()).filter(Boolean);
    const pointsEnList = slideForm.pointsEn.split('\n').map(s => s.trim()).filter(Boolean);
    const serializedImages = serializeSlideImages(slideForm.images);

    const footerMeta = {
      websiteUrl: slideForm.websiteUrl.trim(),
      twitterUrl: slideForm.twitterUrl.trim(),
      linkedinUrl: slideForm.linkedinUrl.trim(),
      facebookUrl: slideForm.facebookUrl.trim(),
      instagramUrl: slideForm.instagramUrl.trim(),
      chips: slideForm.customChips.filter(c => c.titleAr?.trim() || c.titleEn?.trim()),
      presenterNotes: slideForm.notes.trim()
    };
    const serializedNotes = serializeSlideFooterMetadata(footerMeta);

    let preservedSlideId = editingSlide?.id;

    if (editingSlide) {
      await api.updateSlide(editingSlide.id, {
        slideTitleAr: slideForm.slideTitleAr,
        slideTitleEn: slideForm.slideTitleEn,
        contentAr: slideForm.contentAr,
        contentEn: slideForm.contentEn,
        keyPointsArJson: JSON.stringify(pointsArList),
        keyPointsEnJson: JSON.stringify(pointsEnList),
        imageUrl: serializedImages || undefined,
        category: slideForm.category,
        displayOrder: editingSlide.displayOrder,
        isEnabled: slideForm.isEnabled,
        notes: serializedNotes,
        presenterNotesAr: serializedNotes
      });
    } else {
      const addRes = await api.addSlide(selectedPres.id, {
        slideTitleAr: slideForm.slideTitleAr,
        slideTitleEn: slideForm.slideTitleEn,
        contentAr: slideForm.contentAr,
        contentEn: slideForm.contentEn,
        keyPointsArJson: JSON.stringify(pointsArList),
        keyPointsEnJson: JSON.stringify(pointsEnList),
        imageUrl: serializedImages || undefined,
        category: slideForm.category,
        isEnabled: slideForm.isEnabled,
        notes: serializedNotes,
        presenterNotesAr: serializedNotes
      });
      if (addRes?.success && addRes.data?.id) {
        preservedSlideId = addRes.data.id;
      }
    }

    setSubmitting(false);
    setIsSlideModalOpen(false);
    await loadFullPresentation(selectedPres.id, preservedSlideId);

    // Keep user view aligned to the edited slide card
    if (preservedSlideId) {
      setTimeout(() => {
        const el = document.getElementById(`slide-card-${preservedSlideId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!selectedPres) return;
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الشريحة؟' : 'Delete this slide?')) {
      let nextTargetId: string | undefined = undefined;
      if (selectedSlideId === slideId) {
        const remaining = selectedPres.slides.filter(s => s.id !== slideId);
        nextTargetId = remaining[0]?.id;
      } else {
        nextTargetId = selectedSlideId || undefined;
      }
      await api.deleteSlide(slideId);
      await loadFullPresentation(selectedPres.id, nextTargetId);
    }
  };

  const handleSaveVersion = async () => {
    if (!selectedPres) return;
    const res = await api.savePresentationVersion(selectedPres.id);
    if (res.success) {
      alert(language === 'ar' ? `تم حفظ النسخة v${selectedPres.versionNumber + 1} بنجاح!` : `Snapshot v${selectedPres.versionNumber + 1} saved!`);
      await loadFullPresentation(selectedPres.id, selectedSlideId || undefined);
    }
  };

  // Publishing & Analytics Handlers
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishExpiresAt, setPublishExpiresAt] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<PresentationAnalyticsSummaryDto | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const handlePublishDeck = async () => {
    if (!selectedPres) return;
    setPublishing(true);
    try {
      const res = await api.publishPresentation(selectedPres.id, {
        expiresAtUtc: publishExpiresAt ? new Date(publishExpiresAt).toISOString() : undefined,
        regenerateToken: false
      });
      if (res.success) {
        setIsPublishModalOpen(false);
        await loadFullPresentation(selectedPres.id, selectedSlideId || undefined);
        alert(language === 'ar' ? 'تم نشر العرض وتحديث الرابط العام بنجاح!' : 'Presentation published successfully!');
      } else {
        alert(res.message || 'فشل نشر العرض');
      }
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء نشر العرض');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublishDeck = async () => {
    if (!selectedPres) return;
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من إلغاء نشر العرض؟ سيتوقف الرابط العام عن العمل فوراً.' : 'Are you sure you want to revoke public access?')) {
      return;
    }
    const res = await api.unpublishPresentation(selectedPres.id);
    if (res.success) {
      await loadFullPresentation(selectedPres.id, selectedSlideId || undefined);
      alert(language === 'ar' ? 'تم إلغاء النشر وإيقاف الوصول العام.' : 'Presentation access revoked.');
    }
  };

  const handleRegenerateToken = async () => {
    if (!selectedPres) return;
    if (!window.confirm(language === 'ar' ? 'تجديد الرابط سيؤدي لإبطال الرابط السابق فوراً. هل تريد المتابعة؟' : 'Regenerating the link will invalidate previous links. Continue?')) {
      return;
    }
    const res = await api.regenerateShareToken(selectedPres.id);
    if (res.success) {
      await loadFullPresentation(selectedPres.id, selectedSlideId || undefined);
      alert(language === 'ar' ? 'تم تجديد الرابط العام بنجاح!' : 'Share link regenerated!');
    }
  };

  const handleCopyPublicLink = () => {
    if (!selectedPres?.shareToken) return;
    const url = `${window.location.origin}/p/${selectedPres.shareToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenAnalytics = async () => {
    if (!selectedPres) return;
    setLoadingAnalytics(true);
    setIsAnalyticsModalOpen(true);
    try {
      const res = await api.getPresentationAnalytics(selectedPres.id);
      if (res.success && res.data) {
        setAnalyticsData(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const filteredSlides = (selectedPres?.slides || [])
    .slice()
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .filter(s => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return s.slideTitleAr?.toLowerCase().includes(term) || s.slideTitleEn?.toLowerCase().includes(term);
    });

  return (
    <div className="min-h-screen bg-[#F0F4F9] text-slate-800 p-3 sm:p-6 space-y-4 sm:space-y-5 select-none font-sans w-full max-w-full overflow-x-hidden min-w-0" dir="ltr">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER IN MAIN DASHBOARD PALETTE                  */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 sm:gap-4 w-full max-w-full min-w-0 overflow-hidden">
        
        {/* LEFT: Rootaca Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            title="Rootaca - Back to Dashboard"
            className="hover:scale-105 transition-transform"
          >
            <img 
              src="/rootaca-logo.png" 
              alt="Rootaca" 
              className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" 
            />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
              نظام العرض والمبيعات
            </h1>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Rootaca Showcase & Sales System
            </p>
          </div>
        </div>

        {/* CENTER: Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Create New Presentation Button */}
          {(isSuperAdmin || isSalesManager) && (
            <button
              onClick={handleOpenCreatePres}
              className="bg-[#009688] hover:bg-[#00897B] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="إنشاء ملف عرض تقديمي جديد"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة عرض جديد</span>
            </button>
          )}

          {/* Duplicate Current Deck Button */}
          {(isSuperAdmin || isSalesManager) && selectedPres && (
            <button
              onClick={() => handleOpenDuplicate(selectedPres)}
              className="bg-white border border-cyan-300 hover:bg-cyan-50/60 text-[#00838F] font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title={`نسخ هذا العرض بالكامل مع كافة الشرائح التابعة له (${selectedPres.slidesCount} شريحة)`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ هذا العرض بالكامل</span>
            </button>
          )}

          {/* Add Slide Button */}
          {(isSuperAdmin || isSalesManager) && selectedPres && (
            <button
              onClick={handleOpenAddSlide}
              className="bg-[#00B4D8] hover:bg-cyan-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إضافة شريحة</span>
            </button>
          )}

          {/* Save Version Button */}
          {(isSuperAdmin || isSalesManager) && selectedPres && (
            <button
              onClick={handleSaveVersion}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ نسخة v{selectedPres.versionNumber + 1}</span>
            </button>
          )}

          {/* Publish / Share Button in Header */}
          {(isSuperAdmin || isSalesManager) && selectedPres && (
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className={`font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer border ${
                selectedPres.isPublished
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-600" />
              <span>{selectedPres.isPublished ? `منشور (v${selectedPres.publishedVersionNumber})` : 'نشر للجمهور'}</span>
            </button>
          )}

          {/* Analytics Button in Header if published */}
          {selectedPres?.isPublished && (
            <button
              onClick={handleOpenAnalytics}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>الإحصائيات</span>
            </button>
          )}

          {/* 4 Design Showcase & Fullscreen Launch Buttons */}
          {selectedPres && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const targetIdx = selectedPres.slides.findIndex(s => s.id === selectedSlideId);
                  setCurrentSlideIndex(targetIdx >= 0 ? targetIdx : 0);
                  setIsFullscreen(true);
                }}
                className="bg-[#0B1528] hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                title="بدء عرض العميل التفاعلي"
              >
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>عرض العميل</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Avatar + Zoom 75% + Undo/Redo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-[10px]">
              {user?.fullName?.slice(0, 2) || 'SA'}
            </div>
            <span className="text-xs font-mono text-slate-600 font-bold">75% ∨</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE (LEFT: SIDEBAR | RIGHT: SLIDES GRID)   */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full max-w-full min-w-0">
        
        {/* LEFT COLUMN: Presentations List matching Screenshot */}
        <div className="w-full lg:w-72 shrink-0 space-y-3.5" dir="rtl">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900">
              العروض التقديمية ({presentations.length})
            </h2>
            {(isSuperAdmin || isSalesManager) && (
              <button
                type="button"
                onClick={handleOpenCreatePres}
                className="text-xs font-bold text-[#00838F] hover:text-cyan-700 flex items-center gap-1 cursor-pointer bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg transition-colors"
                title="إضافة عرض تقديمي جديد"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>عرض جديد</span>
              </button>
            )}
          </div>

          {/* List of all presentations */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pe-1">
            {presentations.map(p => {
              const isSelected = selectedPres?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`w-full text-right p-3 rounded-2xl transition-all flex items-start gap-2.5 border ${
                    isSelected
                      ? 'border-2 border-[#00B4D8] bg-white text-slate-900 shadow-md shadow-cyan-500/10'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => loadFullPresentation(p.id, undefined, true)}
                    className="flex-1 text-right min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#00838F]' : 'text-slate-400'}`} />
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                        {p.title}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-2">
                      <span>{p.isTemplate ? 'قالب عام' : 'مخصص'}</span>
                      <span>•</span>
                      <span>{p.slidesCount} شريحة</span>
                      {p.isPublished && (
                        <span className="text-emerald-600 font-bold">منشور</span>
                      )}
                    </div>
                  </button>

                  {/* Actions: Duplicate & Delete */}
                  {(isSuperAdmin || isSalesManager) && (
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDuplicate(p);
                        }}
                        title={`نسخ العرض "${p.title}" بجميع الشرائح التابعة له`}
                        className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {(!p.isTemplate || presentations.filter(x => x.isTemplate).length > 1) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePresentation(p);
                          }}
                          title={`حذف العرض "${p.title}"`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

            {/* Public Sharing & Publishing Card */}
            {selectedPres && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-600" />
                    <span>النشر والرابط العام</span>
                  </span>
                  {selectedPres.isPublished ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>منشور (v{selectedPres.publishedVersionNumber})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      <span>مسودة غير منشورة</span>
                    </span>
                  )}
                </div>

                {selectedPres.isPublished ? (
                  <div className="space-y-2.5">
                    <div className="text-[11px] text-slate-500 leading-snug">
                      النسخة المنشورة حالياً معزولة وآمنة. التعديلات اللاحقة لا تظهر للجمهور إلا عند إعادة النشر.
                    </div>

                    {selectedPres.publishedAtUtc && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>آخر نشر: {new Date(selectedPres.publishedAtUtc).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    )}

                    {/* Share Link Field */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-600">رابط المشاركة الآمن:</span>
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-slate-700">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/p/${selectedPres.shareToken}`}
                          className="w-full bg-transparent px-2 text-[11px] font-mono select-all focus:outline-none text-slate-700 truncate"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPublicLink}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs font-bold flex items-center gap-1 transition shrink-0 cursor-pointer shadow-2xs"
                          title="نسخ الرابط"
                        >
                          {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span className="text-[10px]">{copiedLink ? 'تم النسخ' : 'نسخ'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <a
                        href={`/p/${selectedPres.shareToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3 text-cyan-600" />
                        <span>معاينة كزائر</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleOpenAnalytics}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <BarChart2 className="w-3 h-3 text-cyan-600" />
                        <span>الإحصائيات</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => setIsPublishModalOpen(true)}
                        className="w-full py-1.5 px-3 bg-[#00B4D8] hover:bg-cyan-600 text-white rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>نشر التعديلات كنسخة جديدة</span>
                      </button>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          type="button"
                          onClick={handleRegenerateToken}
                          className="text-slate-500 hover:text-cyan-700 underline cursor-pointer text-[10px]"
                        >
                          تجديد الرابط
                        </button>
                        <button
                          type="button"
                          onClick={handleUnpublishDeck}
                          className="text-rose-600 hover:text-rose-700 underline cursor-pointer text-[10px]"
                        >
                          إلغاء النشر
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      هذا العرض غير منشور حالياً. لن يتمكن أي شخص خارجي من الاطلاع على الشرائح حتى تقوم بنشره وتوليد رابط عام.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsPublishModalOpen(true)}
                      className="w-full py-2 px-3 bg-[#00B4D8] hover:bg-cyan-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>نشر العرض وتوليد الرابط العام</span>
                    </button>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* RIGHT COLUMN: Main Slides Grid Canvas */}
        <div className="flex-1 w-full space-y-3.5 min-w-0">
          
          {/* Top row of canvas: Search bar */}
          <div className="flex items-center justify-start w-full">
            <div className="relative w-full sm:w-80 max-w-full" dir="rtl">
              <input
                type="text"
                placeholder="...بحث في الشرائح"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200/90 rounded-xl ps-4 pe-9 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00B4D8] shadow-2xs transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3-Column Grid of Slide Cards in Light Mode (RTL ordering) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5" dir="rtl">
            {filteredSlides.map((slide, idx) => {
              const isSelected = selectedSlideId ? selectedSlideId === slide.id : idx === 0;
              const effectiveImgUrl = slide.imageUrl || DEFAULT_SLIDE_IMAGES[idx % DEFAULT_SLIDE_IMAGES.length];

              return (
                <div
                  key={slide.id}
                  id={`slide-card-${slide.id}`}
                  onClick={() => setSelectedSlideId(slide.id)}
                  className={`bg-white rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 group relative min-h-[300px] sm:min-h-[320px] md:min-h-[330px] lg:min-h-[345px] xl:min-h-[360px] cursor-pointer border ${
                    isSelected
                      ? 'border-2 border-[#00B4D8] shadow-md shadow-cyan-500/15'
                      : 'border-slate-200/90 hover:border-cyan-400 shadow-2xs'
                  }`}
                >
                  {/* Top Illustration or Real Multi-Image Area */}
                  {effectiveImgUrl ? (
                    <div className="w-full aspect-[16/10] min-h-[240px] sm:min-h-[260px] md:min-h-[280px] lg:min-h-[295px] xl:min-h-[310px] 2xl:min-h-[330px] rounded-xl overflow-hidden relative group/img mb-3 shadow-2xs flex flex-col">
                      <SlideMultiImagesView
                        images={parseSlideImages(slide.imageUrl, DEFAULT_SLIDE_IMAGES[idx % DEFAULT_SLIDE_IMAGES.length])}
                        headerTitle={slide.slideTitleEn || slide.slideTitleAr}
                        headerSubtitle={slide.slideTitleAr}
                        altTitle={slide.slideTitleAr}
                        isCardPreview={true}
                        className="w-full h-full flex-1 min-h-0"
                      />
                    </div>
                  ) : (
                    <SlideArtIllustration
                      index={idx}
                      title={slide.slideTitleAr || slide.slideTitleEn}
                    />
                  )}

                  {/* Card Bottom Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2 text-xs">
                    {/* More actions buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditSlide(slide);
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-cyan-50 text-slate-500 hover:text-cyan-700 border border-slate-200/60 flex items-center justify-center transition-colors"
                        title="Edit Slide"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlide(slide.id);
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/60 flex items-center justify-center transition-colors"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Slide Number Pill */}
                    <span className="text-xs font-bold text-slate-600 font-mono">
                      شريحة {idx + 1}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Slide 9 Placeholder Card */}
            {(isSuperAdmin || isSalesManager) && (
              <div
                onClick={handleOpenAddSlide}
                className="border-2 border-dashed border-slate-300 hover:border-[#00B4D8] rounded-2xl p-5 flex flex-col items-center justify-between cursor-pointer min-h-[300px] sm:min-h-[320px] md:min-h-[330px] lg:min-h-[345px] xl:min-h-[360px] bg-white/60 hover:bg-white text-slate-400 hover:text-[#00B4D8] transition-all group shadow-2xs"
              >
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-cyan-50 flex items-center justify-center mb-2 transition-colors">
                    <Plus className="w-5 h-5 text-slate-500 group-hover:text-[#00B4D8]" />
                  </div>
                  <span className="text-xs font-black text-slate-700 group-hover:text-[#00B4D8]">
                    + إضافة شريحة جديدة
                  </span>
                </div>
                <div className="w-full pt-3 border-t border-slate-200/60 text-center">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Placeholder {filteredSlides.length + 1} شريحة
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. ADD / EDIT SLIDE MODAL IN LIGHT DASHBOARD PALETTE     */}
      {/* ======================================================== */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingSlide ? 'تعديل الشريحة' : 'إضافة شريحة جديدة'}
              </h3>
              <button 
                onClick={() => setIsSlideModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSlideSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تصنيف الشريحة
                </label>
                <select
                  value={slideForm.category}
                  onChange={e => setSlideForm({ ...slideForm, category: e.target.value as SlideCategory })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:bg-white focus:outline-none"
                >
                  <option value="CompanyOverview">نظرة عامة على الشركة (Company Overview)</option>
                  <option value="SmartSchool">مدرسة ROOTACA الذكية (Smart School)</option>
                  <option value="Academy">أكاديمية ROOTACA (Academy)</option>
                  <option value="ValueProposition">القيمة المضافة والمميزات (Value Proposition)</option>
                  <option value="Closing">الخطوة القادمة والإغلاق (Closing)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان الشريحة (عربي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={slideForm.slideTitleAr}
                    onChange={e => setSlideForm({ ...slideForm, slideTitleAr: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    عنوان الشريحة (إنجليزي) *
                  </label>
                  <input
                    type="text"
                    required
                    value={slideForm.slideTitleEn}
                    onChange={e => setSlideForm({ ...slideForm, slideTitleEn: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المحتوى الرئيسي (عربي) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={slideForm.contentAr}
                  onChange={e => setSlideForm({ ...slideForm, contentAr: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المحتوى الرئيسي (إنجليزي) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={slideForm.contentEn}
                  onChange={e => setSlideForm({ ...slideForm, contentEn: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Multi-Image Section (Up to 4 images with individual captions) */}
              <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      صور الشريحة (حتى 4 صور مع عنوان مختصر لكل صورة)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      تتوزع المساحة تلقائياً: صورة واحدة (كامل العرض)، صورتان (جنباً إلى جنب)، 3 صور (ثلاثة أعمدة)، 4 صور (شبكة 2×2)
                    </span>
                  </div>

                  {slideForm.images.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setSlideForm({
                        ...slideForm,
                        images: [...slideForm.images, { url: '', caption: '' }]
                      })}
                      className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-[#00838F] border border-cyan-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة صورة ({slideForm.images.length}/4)</span>
                    </button>
                  )}
                </div>

                {/* Images list inputs */}
                <div className="space-y-2.5">
                  {slideForm.images.map((img, iIdx) => (
                    <div
                      key={iIdx}
                      className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-[11px] font-bold text-slate-700">
                        <span className="flex items-center gap-1.5 text-cyan-800">
                          <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[10px]">
                            {iIdx + 1}
                          </span>
                          <span>الصورة {iIdx + 1} {iIdx === 0 ? '(الرئيسية)' : ''}</span>
                        </span>

                        {slideForm.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = slideForm.images.filter((_, idx) => idx !== iIdx);
                              setSlideForm({ ...slideForm, images: updated.length > 0 ? updated : [{ url: '', caption: '' }] });
                            }}
                            className="text-slate-400 hover:text-rose-600 text-[10px] flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>حذف</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            رابط الصورة (URL) *
                          </label>
                          <input
                            type="url"
                            value={img.url}
                            onChange={e => {
                              const updated = [...slideForm.images];
                              updated[iIdx] = { ...updated[iIdx], url: e.target.value };
                              setSlideForm({ ...slideForm, images: updated });
                            }}
                            placeholder="https://... رابط الصورة المباشر"
                            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            عنوان مختصر يظهر أسفل الصورة
                          </label>
                          <input
                            type="text"
                            value={img.caption || ''}
                            onChange={e => {
                              const updated = [...slideForm.images];
                              updated[iIdx] = { ...updated[iIdx], caption: e.target.value };
                              setSlideForm({ ...slideForm, images: updated });
                            }}
                            placeholder="مثال: الواجهة الرئيسية، المختبر، الفصول..."
                            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Presets to fill current or new slot */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold">نماذج صور سريعة:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSlideForm({
                        ...slideForm,
                        images: [
                          { url: '/slides/connected-parent.png', title: 'Parent', subtitle: 'تجربة ولي الأمر', caption: 'Parent' },
                          { url: '/slides/connected-student.png', title: 'Student', subtitle: 'تجربة الطالب', caption: 'Student' },
                          { url: '/slides/connected-supervisor.png', title: 'Supervisor', subtitle: 'أدوات المشرف', caption: 'Supervisor' },
                          { url: '/slides/connected-teacher.png', title: 'Teacher', subtitle: 'بيئة عمل المعلم', caption: 'Teacher' }
                        ]
                      });
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 transition border border-cyan-300 cursor-pointer shadow-2xs"
                  >
                    🌟 طاقم المجتمع المدرسي (4 أدوار)
                  </button>
                  {[
                    { label: 'لوحة التحكم', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop', cap: 'لوحة القيادة المدرسية' },
                    { label: 'طلاب وفصول', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop', cap: 'الفصول التفاعلية' },
                    { label: 'تطبيق موبايل', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop', cap: 'تطبيق ولي الأمر' },
                    { label: 'معمل روبوتكس', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop', cap: 'أكاديمية الذكاء الاصطناعي' }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const emptyIdx = slideForm.images.findIndex(img => !img.url.trim());
                        if (emptyIdx >= 0) {
                          const updated = [...slideForm.images];
                          updated[emptyIdx] = { url: preset.url, caption: preset.cap };
                          setSlideForm({ ...slideForm, images: updated });
                        } else if (slideForm.images.length < 4) {
                          setSlideForm({
                            ...slideForm,
                            images: [...slideForm.images, { url: preset.url, caption: preset.cap }]
                          });
                        } else {
                          const updated = [...slideForm.images];
                          updated[updated.length - 1] = { url: preset.url, caption: preset.cap };
                          setSlideForm({ ...slideForm, images: updated });
                        }
                      }}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-white hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 transition border border-slate-200 cursor-pointer shadow-2xs"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>

                {/* Live Real-Time Multi-Image Layout Preview */}
                {slideForm.images.some(x => x.url.trim()) && (
                  <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span>معاينة تقسيم الصور المباشر داخل الشريحة:</span>
                      <span className="text-cyan-700 font-mono font-bold">
                        {slideForm.images.filter(x => x.url.trim()).length} صورة
                      </span>
                    </div>
                    <div className="h-52 w-full rounded-xl overflow-hidden relative flex flex-col">
                      <SlideMultiImagesView
                        images={slideForm.images.filter(x => x.url.trim())}
                        altTitle={slideForm.slideTitleAr || 'معاينة'}
                        isCardPreview={true}
                        className="w-full h-full flex-1 min-h-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Links & Social Media & 3 Highlight Chips Section */}
              <div className="space-y-4 p-4 bg-slate-50 border border-slate-200/90 rounded-2xl">
                <div className="border-b border-slate-200/70 pb-2">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-cyan-700" />
                    <span>تذييل الشريحة وروابط التواصل والموقع (Footer & Social Links)</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    الروابط ديناميكية بالكامل: لن تظهر أيقونة التواصل أو الموقع إلا إذا تم إدخال رابط لها. الحقول الفارغة تُخفى تلقائياً.
                  </p>
                </div>

                {/* Website URL */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    رابط الموقع الإلكتروني (Website URL)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: www.helsinkischool.edu"
                    value={slideForm.websiteUrl}
                    onChange={e => setSlideForm({ ...slideForm, websiteUrl: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Social Links 2x2 Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <TwitterIcon className="w-3.5 h-3.5 text-cyan-600" />
                      <span>رابط Twitter / X</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://twitter.com/..."
                      value={slideForm.twitterUrl}
                      onChange={e => setSlideForm({ ...slideForm, twitterUrl: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <LinkedinIcon className="w-3.5 h-3.5 text-blue-700" />
                      <span>رابط LinkedIn</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/company/..."
                      value={slideForm.linkedinUrl}
                      onChange={e => setSlideForm({ ...slideForm, linkedinUrl: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>رابط Facebook</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/..."
                      value={slideForm.facebookUrl}
                      onChange={e => setSlideForm({ ...slideForm, facebookUrl: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                      <span>رابط Instagram</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/..."
                      value={slideForm.instagramUrl}
                      onChange={e => setSlideForm({ ...slideForm, instagramUrl: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* 3 Custom Feature Chips */}
                <div className="pt-3 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-800">
                      البطاقات الترويجية الثلاث (3 Highlight Chips)
                    </label>
                    <span className="text-[10px] text-slate-400">تظهر أعلى روابط التواصل</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {slideForm.customChips.map((chip, cIdx) => (
                      <div key={cIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="text-[10px] font-black text-cyan-800">
                          البطاقة {cIdx + 1}
                        </div>
                        <input
                          type="text"
                          placeholder="العنوان (إنجليزي)"
                          value={chip.titleEn || ''}
                          onChange={e => {
                            const updated = [...slideForm.customChips];
                            updated[cIdx] = { ...updated[cIdx], titleEn: e.target.value };
                            setSlideForm({ ...slideForm, customChips: updated });
                          }}
                          className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500"
                        />
                        <input
                          type="text"
                          placeholder="العنوان (عربي)"
                          value={chip.titleAr || ''}
                          onChange={e => {
                            const updated = [...slideForm.customChips];
                            updated[cIdx] = { ...updated[cIdx], titleAr: e.target.value };
                            setSlideForm({ ...slideForm, customChips: updated });
                          }}
                          className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#009688] hover:bg-[#00897B] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ الشريحة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PUBLISH PRESENTATION MODAL                            */}
      {/* ======================================================== */}
      {isPublishModalOpen && selectedPres && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-black text-slate-900">
                  {selectedPres.isPublished ? 'إعادة نشر وتحديث العرض العام' : 'نشر العرض التقديمي للجمهور'}
                </h3>
              </div>
              <button 
                onClick={() => setIsPublishModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-2xl space-y-1.5 text-cyan-900">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-700" />
                  <span>عزل اللقطة المنشورة (Published Snapshot Isolation)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-cyan-800">
                  سيتم أخذ لقطة معزولة غير قابلة للتعديل من الشرائح النشطة الحالية (نسخة v{selectedPres.versionNumber + 1}). التعديلات الداخلية في لوحة التحكم لن تؤثر على ما يراه الزوار في الرابط العام إلا إذا قمت بالنشر مجدداً.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  تاريخ انتهاء صلاحية الرابط (اختياري)
                </label>
                <input
                  type="datetime-local"
                  value={publishExpiresAt}
                  onChange={e => setPublishExpiresAt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00B4D8]"
                />
                
                {/* Expiration Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">تحديد سريع:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 24 * 3600 * 1000);
                      const pad = (n: number) => String(n).padStart(2, '0');
                      setPublishExpiresAt(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition"
                  >
                    24 ساعة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 3 * 24 * 3600 * 1000);
                      const pad = (n: number) => String(n).padStart(2, '0');
                      setPublishExpiresAt(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition"
                  >
                    3 أيام
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
                      const pad = (n: number) => String(n).padStart(2, '0');
                      setPublishExpiresAt(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-cyan-100 hover:bg-cyan-200 text-cyan-800 text-[10px] font-bold cursor-pointer transition"
                  >
                    7 أيام (موصى به)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 14 * 24 * 3600 * 1000);
                      const pad = (n: number) => String(n).padStart(2, '0');
                      setPublishExpiresAt(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition"
                  >
                    14 يوم
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 30 * 24 * 3600 * 1000);
                      const pad = (n: number) => String(n).padStart(2, '0');
                      setPublishExpiresAt(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition"
                  >
                    30 يوم
                  </button>
                  <button
                    type="button"
                    onClick={() => setPublishExpiresAt('')}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-[10px] font-bold cursor-pointer transition"
                  >
                    دائم (بدون انتهاء)
                  </button>
                </div>

                <span className="text-[10px] text-slate-400 block pt-0.5">
                  سيظهر عداد تنازلي نشط للزوار في العرض العام يوضح الوقت المتبقي ثانية بثانية حتى انتهاء الصلاحية.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={publishing}
                onClick={handlePublishDeck}
                className="px-6 py-2.5 bg-[#00B4D8] hover:bg-cyan-600 text-white text-xs font-black rounded-xl shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Globe className="w-4 h-4" />
                <span>{publishing ? 'جاري النشر وتوليد اللقطة...' : 'تأكيد النشر للجمهور'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. PRESENTATION ANALYTICS MODAL                          */}
      {/* ======================================================== */}
      {isAnalyticsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    إحصائيات تفاعل الزوار مع العرض
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono" dir="ltr">
                    Public Engagement & Session Analytics
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAnalyticsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingAnalytics ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500">جاري تجميع المؤشرات...</span>
              </div>
            ) : analyticsData ? (
              <div className="space-y-4">
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                    <span className="text-[10px] text-slate-500 block font-bold">إجمالي المشاهدات</span>
                    <span className="text-xl font-black text-slate-900 font-mono">{analyticsData.totalViews}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                    <span className="text-[10px] text-slate-500 block font-bold">جلسات الزوار الفريدة</span>
                    <span className="text-xl font-black text-cyan-600 font-mono">{analyticsData.uniqueSessions}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                    <span className="text-[10px] text-slate-500 block font-bold">نقرات طلب الديمو</span>
                    <span className="text-xl font-black text-emerald-600 font-mono">{analyticsData.demoCtaClicks}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                    <span className="text-[10px] text-slate-500 block font-bold">متوسط وقت الجلسة</span>
                    <span className="text-xl font-black text-purple-600 font-mono">{analyticsData.averageDurationPerSessionSeconds}s</span>
                  </div>
                </div>

                {/* Slide by Slide Analytics */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black text-slate-800">
                    تفاعل الزوار حسب الشرائح
                  </h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px]">
                        <tr>
                          <th className="p-2.5 font-bold">#</th>
                          <th className="p-2.5 font-bold">الشريحة</th>
                          <th className="p-2.5 font-bold text-center">المشاهدات</th>
                          <th className="p-2.5 font-bold text-center">إجمالي الوقت</th>
                          <th className="p-2.5 font-bold text-center">متوسط التفاعل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analyticsData.slideStats.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-800 max-w-[200px] truncate">{s.slideTitleAr}</td>
                            <td className="p-2.5 font-mono text-center">{s.viewCount}</td>
                            <td className="p-2.5 font-mono text-center text-slate-500">{s.totalDurationSeconds} ثانية</td>
                            <td className="p-2.5 font-mono text-center font-bold text-cyan-700">{s.averageDurationSeconds} ثانية</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                لا توجد مشاهدات مسجلة لهذا العرض بعد.
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE NEW PRESENTATION MODAL                            */}
      {/* ======================================================== */}
      {isCreatePresModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 text-right" dir="rtl">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>إضافة عرض تقديمي جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatePresModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePresSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  عنوان العرض التقديمي *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عرض مدرسة النور الدولية أو العرض التعريفي الشامل"
                  value={createPresForm.title}
                  onChange={e => setCreatePresForm({ ...createPresForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#00B4D8]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  وصف العرض / الغرض منه
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات مختصرة حول الجمهور المستهدف أو سيناريو العرض..."
                  value={createPresForm.description}
                  onChange={e => setCreatePresForm({ ...createPresForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#00B4D8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    المنتجات المشمولة
                  </label>
                  <select
                    value={createPresForm.selectedProducts}
                    onChange={e => setCreatePresForm({ ...createPresForm, selectedProducts: e.target.value as ProductInterest })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-[#00B4D8]"
                  >
                    <option value="Both">كلا المنتجين (سمارت سكول + أكاديمية)</option>
                    <option value="SmartSchool">مدرسة ROOTACA الذكية فقط</option>
                    <option value="Academy">أكاديمية ROOTACA فقط</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    نوع العرض
                  </label>
                  <select
                    value={createPresForm.isTemplate ? 'template' : 'school'}
                    onChange={e => setCreatePresForm({ ...createPresForm, isTemplate: e.target.value === 'template' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-[#00B4D8]"
                  >
                    <option value="template">قالب رئيسي عام (Template)</option>
                    <option value="school">عرض مخصص لمدرسة محددة</option>
                  </select>
                </div>
              </div>

              {!createPresForm.isTemplate && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    المدرسة المستهدفة *
                  </label>
                  {loadingSchools ? (
                    <div className="text-slate-400 py-2">جاري تحميل قائمة المدارس...</div>
                  ) : (
                    <select
                      required={!createPresForm.isTemplate}
                      value={createPresForm.schoolId}
                      onChange={e => setCreatePresForm({ ...createPresForm, schoolId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#00B4D8]"
                    >
                      <option value="">-- اختر المدرسة --</option>
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.city || ''})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingCreatePres}
                  onClick={() => setIsCreatePresModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreatePres}
                  className="px-5 py-2 bg-[#009688] hover:bg-[#00897B] disabled:bg-slate-400 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingCreatePres && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isSubmittingCreatePres ? 'جاري الإنشاء...' : 'إنشاء العرض التقديمي'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DUPLICATE / CLONE PRESENTATION DECK MODAL                */}
      {/* ======================================================== */}
      {isDuplicateModalOpen && presToDuplicate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 text-right" dir="rtl">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Copy className="w-5 h-5 text-[#00838F]" />
                <span>استنساخ العرض بكافة الشرائح</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDuplicateSubmit} className="space-y-4 text-xs">
              <div className="bg-cyan-50/70 border border-cyan-200/80 rounded-xl p-3.5 text-cyan-900 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-cyan-700" />
                  <span>نسخ العرض بالكامل مع جميع الشرائح التابعة له</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  العرض الأصلي: <strong className="text-slate-900 font-bold">{presToDuplicate.title}</strong>
                  <br />
                  سيتم نسخ جميع الشرائح التابعة له (<strong>{presToDuplicate.slidesCount} شريحة</strong>) بالكامل مع نصوصها وصورها ونقاطها الأساسية إلى عرض جديد مستقل.
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  عنوان النسخة الجديدة *
                </label>
                <input
                  type="text"
                  required
                  value={duplicateForm.newTitle}
                  onChange={e => setDuplicateForm({ ...duplicateForm, newTitle: e.target.value })}
                  placeholder="عنوان العرض المنسوخ الجديد..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#00B4D8]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  وجهة النسخة
                </label>
                <select
                  value={duplicateForm.isCustomForSchool ? 'school' : 'template'}
                  onChange={e => setDuplicateForm({ ...duplicateForm, isCustomForSchool: e.target.value === 'school' })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-[#00B4D8]"
                >
                  <option value="template">نسخة قالب مستقلة (General Deck)</option>
                  <option value="school">تخصيص النسخة لمدرسة محددة</option>
                </select>
              </div>

              {duplicateForm.isCustomForSchool && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    المدرسة المستهدفة *
                  </label>
                  {loadingSchools ? (
                    <div className="text-slate-400 py-2">جاري تحميل قائمة المدارس...</div>
                  ) : (
                    <select
                      required={duplicateForm.isCustomForSchool}
                      value={duplicateForm.schoolId}
                      onChange={e => setDuplicateForm({ ...duplicateForm, schoolId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#00B4D8]"
                    >
                      <option value="">-- اختر المدرسة --</option>
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.city || ''})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingDuplicate}
                  onClick={() => setIsDuplicateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDuplicate}
                  className="px-5 py-2 bg-[#00838F] hover:bg-[#006978] disabled:bg-slate-400 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmittingDuplicate && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{isSubmittingDuplicate ? 'جاري الاستنساخ...' : `استنساخ العرض (${presToDuplicate.slidesCount} شريحة)`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. FULLSCREEN EXECUTIVE CLIENT PRESENTATION VIEWER       */}
      {/* ======================================================== */}
      {isFullscreen && selectedPres && (
        <ExecutivePresentationView
          presentation={selectedPres}
          initialSlideIndex={currentSlideIndex}
          onClose={() => setIsFullscreen(false)}
          defaultLanguage={language as 'ar' | 'en'}
          schoolName={selectedPres.schoolName}
        />
      )}

    </div>
  );
};
