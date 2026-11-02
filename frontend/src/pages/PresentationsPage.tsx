import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Users
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ExecutivePresentationView } from '../components/presentation/ExecutivePresentationView';
import { api } from '../services/api';
import { PresentationDto, PresentationSlideDto, SlideCategory } from '../types';

// High-Fidelity Custom Artwork adapted to Main Dashboard Light Palette
const SlideArtIllustration: React.FC<{ index: number; title: string }> = ({ index, title }) => {
  const t = title.toLowerCase();

  // Slide 1: Company Overview
  if (index === 0 || t.includes('من نحن') || t.includes('rootaca') || t.includes('smartdevco')) {
    return (
      <div className="flex items-center justify-between w-full h-24 px-2 py-1 rounded-xl bg-slate-50/70 border border-slate-100">
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
      <div className="flex items-center justify-between w-full h-24 px-2 py-1 rounded-xl bg-slate-50/70 border border-slate-100">
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
      <div className="flex items-center justify-between w-full h-24 px-2 py-1 rounded-xl bg-slate-50/70 border border-slate-100">
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
      <div className="flex items-center justify-between w-full h-24 px-2 py-1 rounded-xl bg-slate-50/70 border border-slate-100">
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
      <div className="flex items-center justify-between w-full h-24 px-2 py-1 rounded-xl bg-slate-50/70 border border-slate-100">
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
      <div className="flex items-center justify-between w-full h-24 px-2 py-1 rounded-xl bg-slate-50/70 border border-slate-100">
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
      <div className="flex items-center justify-between w-full h-24 px-2 py-1 rounded-xl bg-slate-50/70 border border-slate-100">
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
    <div className="flex items-center justify-between w-full h-24 px-2 py-1 rounded-xl bg-slate-50/70 border border-slate-100">
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
    imageUrl: '',
    category: 'CompanyOverview' as SlideCategory,
    isEnabled: true,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    setLoading(true);
    const res = await api.getPresentations();
    if (res.success && res.data) {
      setPresentations(res.data);
      if (res.data.length > 0) {
        await loadFullPresentation(res.data[0].id);
      }
    }
    setLoading(false);
  };

  const loadFullPresentation = async (id: string) => {
    const res = await api.getPresentationById(id);
    if (res.success && res.data) {
      setSelectedPres(res.data);
      if (res.data.slides.length > 0) {
        setSelectedSlideId(res.data.slides[0].id);
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
      imageUrl: '',
      category: 'CompanyOverview',
      isEnabled: true,
      notes: ''
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

    setSlideForm({
      slideTitleAr: slide.slideTitleAr,
      slideTitleEn: slide.slideTitleEn,
      contentAr: slide.contentAr,
      contentEn: slide.contentEn,
      pointsAr: ptsAr,
      pointsEn: ptsEn,
      imageUrl: slide.imageUrl || '',
      category: slide.category,
      isEnabled: slide.isEnabled,
      notes: slide.notes || ''
    });
    setIsSlideModalOpen(true);
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPres) return;
    setSubmitting(true);

    const pointsArList = slideForm.pointsAr.split('\n').map(s => s.trim()).filter(Boolean);
    const pointsEnList = slideForm.pointsEn.split('\n').map(s => s.trim()).filter(Boolean);

    if (editingSlide) {
      await api.updateSlide(editingSlide.id, {
        slideTitleAr: slideForm.slideTitleAr,
        slideTitleEn: slideForm.slideTitleEn,
        contentAr: slideForm.contentAr,
        contentEn: slideForm.contentEn,
        keyPointsArJson: JSON.stringify(pointsArList),
        keyPointsEnJson: JSON.stringify(pointsEnList),
        imageUrl: slideForm.imageUrl || undefined,
        category: slideForm.category,
        isEnabled: slideForm.isEnabled,
        presenterNotesAr: slideForm.notes || undefined
      });
    } else {
      await api.addSlide(selectedPres.id, {
        slideTitleAr: slideForm.slideTitleAr,
        slideTitleEn: slideForm.slideTitleEn,
        contentAr: slideForm.contentAr,
        contentEn: slideForm.contentEn,
        keyPointsArJson: JSON.stringify(pointsArList),
        keyPointsEnJson: JSON.stringify(pointsEnList),
        imageUrl: slideForm.imageUrl || undefined,
        category: slideForm.category,
        isEnabled: slideForm.isEnabled,
        presenterNotesAr: slideForm.notes || undefined
      });
    }

    setSubmitting(false);
    setIsSlideModalOpen(false);
    loadFullPresentation(selectedPres.id);
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!selectedPres) return;
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الشريحة؟' : 'Delete this slide?')) {
      await api.deleteSlide(slideId);
      loadFullPresentation(selectedPres.id);
    }
  };

  const handleSaveVersion = async () => {
    if (!selectedPres) return;
    const res = await api.savePresentationVersion(selectedPres.id);
    if (res.success) {
      alert(language === 'ar' ? `تم حفظ النسخة v${selectedPres.versionNumber + 1} بنجاح!` : `Snapshot v${selectedPres.versionNumber + 1} saved!`);
      loadFullPresentation(selectedPres.id);
    }
  };

  const filteredSlides = selectedPres?.slides.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return s.slideTitleAr?.toLowerCase().includes(term) || s.slideTitleEn?.toLowerCase().includes(term);
  }) || [];

  return (
    <div className="min-h-screen bg-[#F0F4F9] text-slate-800 p-4 sm:p-6 space-y-5 select-none font-sans" dir="ltr">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER IN MAIN DASHBOARD PALETTE                  */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        
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
          {/* Add Slide Button */}
          {(isSuperAdmin || isSalesManager) && (
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

          {/* Fullscreen Client Presentation Button */}
          {selectedPres && (
            <button
              onClick={() => {
                const targetIdx = selectedPres.slides.findIndex(s => s.id === selectedSlideId);
                setCurrentSlideIndex(targetIdx >= 0 ? targetIdx : 0);
                setIsFullscreen(true);
              }}
              className="bg-[#0B1528] hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>عرض ملء الشاشة للعميل</span>
            </button>
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
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        
        {/* LEFT COLUMN: Presentations List matching Screenshot */}
        <div className="w-full lg:w-72 shrink-0 space-y-3.5" dir="rtl">
          <h2 className="text-sm font-black text-slate-900 px-1">
            العروض التقديمية
          </h2>

          <div className="space-y-2">
            {/* Active Selected Presentation Card */}
            {selectedPres && (
              <button
                type="button"
                className="w-full text-right p-3.5 rounded-2xl transition-all cursor-pointer flex items-start gap-3 border-2 border-[#00B4D8] bg-white text-slate-900 shadow-md shadow-cyan-500/10"
              >
                <FileText className="w-5 h-5 text-[#00838F] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold leading-snug text-slate-900">
                    {selectedPres.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    {selectedPres.isTemplate ? 'قالب عام' : 'مخصص'} • {selectedPres.slidesCount} شريحة
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Main Slides Grid Canvas */}
        <div className="flex-1 w-full space-y-3.5 min-w-0">
          
          {/* Top row of canvas: Search bar */}
          <div className="flex items-center justify-start">
            <div className="relative w-80" dir="rtl">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" dir="rtl">
            {filteredSlides.map((slide, idx) => {
              const isFirst = idx === 0;
              const isSelected = selectedSlideId === slide.id || isFirst;

              return (
                <div
                  key={slide.id}
                  onClick={() => setSelectedSlideId(slide.id)}
                  className={`bg-white rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 group relative min-h-[220px] cursor-pointer border ${
                    isSelected
                      ? 'border-2 border-[#00B4D8] shadow-md shadow-cyan-500/15'
                      : 'border-slate-200/90 hover:border-cyan-400 shadow-2xs'
                  }`}
                >
                  {/* Top Illustration or Real Image Area */}
                  {slide.imageUrl ? (
                    <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-200/90 bg-slate-100 relative group/img mb-2 shadow-2xs">
                      <img
                        src={slide.imageUrl}
                        alt={slide.slideTitleAr}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[11px] font-bold text-white truncate">
                          {slide.slideTitleAr}
                        </span>
                      </div>
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
                className="border-2 border-dashed border-slate-300 hover:border-[#00B4D8] rounded-2xl p-5 flex flex-col items-center justify-between cursor-pointer min-h-[220px] bg-white/60 hover:bg-white text-slate-400 hover:text-[#00B4D8] transition-all group shadow-2xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-slate-800 space-y-4">
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

              {/* Image URL & Live Preview Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رابط صورة الشريحة (Image URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={slideForm.imageUrl}
                    onChange={e => setSlideForm({ ...slideForm, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... أو أدخل رابط الصورة"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:bg-white focus:outline-none font-mono"
                  />
                  {slideForm.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setSlideForm({ ...slideForm, imageUrl: '' })}
                      className="px-3 py-1 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                      title="إزالة الصورة"
                    >
                      إزالة
                    </button>
                  )}
                </div>

                {/* Live Image Preview */}
                {slideForm.imageUrl && (
                  <div className="mt-2.5 relative rounded-2xl overflow-hidden border border-slate-200 h-36 bg-slate-900 group">
                    <img
                      src={slideForm.imageUrl}
                      alt="معاينة الصورة"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute bottom-2 start-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-lg">
                      معاينة الصورة المحددة
                    </div>
                  </div>
                )}

                {/* Quick Sample Image Presets */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-semibold">نماذج سريعة:</span>
                  {[
                    { label: 'لوحة تحكم (Dashboard)', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop' },
                    { label: 'طلاب ومدرسة', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop' },
                    { label: 'تطبيق موبايل', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop' },
                    { label: 'معمل روبوتكس', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop' },
                    { label: 'سيرفر وأمان سحابي', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop' }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSlideForm({ ...slideForm, imageUrl: preset.url })}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 transition border border-slate-200 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
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
      {/* 4. FULLSCREEN EXECUTIVE CLIENT PRESENTATION VIEWER       */}
      {/* ======================================================== */}
      {isFullscreen && selectedPres && (
        <ExecutivePresentationView
          presentation={selectedPres}
          initialSlideIndex={currentSlideIndex}
          onClose={() => setIsFullscreen(false)}
          defaultLanguage={language as 'ar' | 'en'}
        />
      )}

    </div>
  );
};
