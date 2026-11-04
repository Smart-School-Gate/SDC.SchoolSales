import React, { useState } from 'react';
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { SlideImageItem } from './SlideMultiImagesView';
import { SlideSocialFooter } from './SlideSocialFooter';

interface SlideMobileResponsiveViewProps {
  schoolNameEn?: string;
  schoolNameAr?: string;
  tagline?: string;
  facilities?: SlideImageItem[];
  highlights?: Array<{
    titleEn: string;
    titleAr: string;
    icon?: any;
    dateBadge?: string;
  }>;
  asPhoneMockup?: boolean;
  onClose?: () => void;
  lang?: 'ar' | 'en';
  websiteUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  className?: string;
}

const DEFAULT_FACILITIES: SlideImageItem[] = [
  {
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop',
    title: 'Library',
    subtitle: 'المكتبة'
  },
  {
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop',
    title: 'Classrooms',
    subtitle: 'الفصول'
  },
  {
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    title: 'Sports Hub',
    subtitle: 'الصالة الرياضية'
  },
  {
    url: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=800&auto=format&fit=crop',
    title: 'Green Courtyard',
    subtitle: 'الساحات الخارجية'
  }
];

const DEFAULT_HIGHLIGHTS = [
  {
    titleEn: 'Admissions Open 2024-25',
    titleAr: 'باب التسجيل مفتوح',
    dateBadge: 'New Cohort'
  },
  {
    titleEn: 'Finnish STEM Curriculum',
    titleAr: 'المنهج الفنلندي الذكي',
    dateBadge: 'Curriculum'
  },
  {
    titleEn: 'Smart Bus & IoT Tracking',
    titleAr: 'تتبع الحافلات الذكية',
    dateBadge: 'Smart Fleet'
  }
];

export const SlideMobileResponsiveView: React.FC<SlideMobileResponsiveViewProps> = ({
  schoolNameEn = 'HELSINKI SCHOOL',
  schoolNameAr = 'مدرسة هلسنكي',
  tagline = 'Empowering the next generation / تمكين جيل الغد',
  facilities = DEFAULT_FACILITIES,
  highlights = DEFAULT_HIGHLIGHTS,
  asPhoneMockup = false,
  onClose,
  lang = 'ar',
  websiteUrl,
  twitterUrl,
  linkedinUrl,
  facebookUrl,
  instagramUrl,
  className = ''
}) => {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const effectiveSchoolName = isAr ? schoolNameAr : schoolNameEn;

  const [highlightIdx, setHighlightIdx] = useState(0);

  const activeHighlight = highlights[highlightIdx] || highlights[0];
  const effectiveFacilities = facilities && facilities.length > 0 ? facilities.slice(0, 4) : DEFAULT_FACILITIES;

  const content = (
    <div
      dir={dir}
      className="w-full bg-[#EBF4FA] text-slate-800 flex flex-col justify-start min-h-full font-sans antialiased overflow-y-auto pb-10"
    >
      
      {/* ---------------------------------------------------- */}
      {/* PHONE STATUS BAR (When in phone mockup mode)         */}
      {/* ---------------------------------------------------- */}
      {asPhoneMockup && (
        <div className="w-full bg-white/80 backdrop-blur-md px-6 py-2 flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 shrink-0 select-none">
          <span>10:30</span>
          {/* Camera Punch Hole */}
          <div className="w-4 h-4 rounded-full bg-black shadow-inner mx-auto -me-4" />
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span>5G</span>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* APP TOP BAR: Brand Logo & School Name                */}
      {/* ---------------------------------------------------- */}
      <div className="w-full bg-white px-4 py-3 border-b border-slate-200/80 flex items-center justify-between shadow-2xs shrink-0 sticky top-0 z-20">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          {/* Geometric Cube Logo */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-700 flex items-center justify-center text-white shadow-xs">
            <span className="font-mono font-black text-xs">HS</span>
          </div>
          <div>
            <div className="text-xs font-black tracking-wider text-slate-900 leading-tight">
              {effectiveSchoolName}
            </div>
            <div className="text-[10px] font-bold text-cyan-700 leading-tight">
              {isAr ? 'منظومة المدارس الذكية' : 'Smart School Portal'}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN BODY CONTENT                                    */}
      {/* ---------------------------------------------------- */}
      <div className="p-4 space-y-4">
        
        {/* HERO WELCOME CARD */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs text-center space-y-1.5">
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
            {isAr ? `أهلاً بكم في ${schoolNameAr}` : `Welcome to ${schoolNameEn}`}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium pt-0.5">
            {tagline}
          </p>
        </div>

        {/* SECTION: CAMPUS FACILITIES (2x2 Grid) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              Campus Facilities
            </h3>
            <span className="text-xs sm:text-sm font-black text-slate-800" dir="rtl">
              مرافق الحرم المدرسي
            </span>
          </div>

          {/* Photo Grid or Single Hero with Centered Dark Frosted Overlay Pills */}
          <div className={effectiveFacilities.length === 1 ? 'w-full' : 'grid grid-cols-2 gap-2.5'}>
            {effectiveFacilities.map((facility, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl overflow-hidden bg-slate-200 shadow-2xs border border-slate-200/80 group ${
                  effectiveFacilities.length === 1 ? 'aspect-[16/10] w-full' : 'aspect-[4/3]'
                }`}
              >
                <img
                  src={facility.url}
                  alt={facility.title || `Facility ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== DEFAULT_FACILITIES[idx % 4].url) {
                      target.src = DEFAULT_FACILITIES[idx % 4].url;
                    }
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                {/* Bottom Center Frosted Pill Badge */}
                <div className="absolute bottom-2 inset-x-2 flex justify-center pointer-events-none">
                  <div className="bg-black/65 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 shadow-md truncate max-w-full text-center">
                    <span>{facility.title || `Facility ${idx + 1}`}</span>
                    {facility.subtitle && (
                      <span className="opacity-90"> | {facility.subtitle}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: HIGHLIGHTS (Carousel Card) */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              Highlights
            </h3>
            <span className="text-xs sm:text-sm font-black text-slate-800" dir="rtl">
              أبرز الأنشطة
            </span>
          </div>

          {/* Highlight Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
            
            {/* Left Content */}
            <div className="flex-1 space-y-0.5 text-start">
              <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                {activeHighlight.titleEn}
              </div>
              <div className="text-xs font-bold text-cyan-800" dir="rtl">
                {activeHighlight.titleAr}
              </div>
            </div>

            {/* Right: Calendar Icon Pill + Next Button */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#E0F4F7] text-[#0891B2] flex items-center justify-center border border-[#BCE7EF]">
                <Calendar className="w-4 h-4" />
              </div>
              
              <button
                onClick={() => setHighlightIdx(prev => (prev + 1) % highlights.length)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                title="Next highlight"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Dot Pagination Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {highlights.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setHighlightIdx(dotIdx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  highlightIdx === dotIdx ? 'w-4 bg-cyan-700' : 'w-1.5 bg-slate-300'
                }`}
                title={`Highlight ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Social & Website Footer */}
        <div className="px-2 pt-2">
          <SlideSocialFooter
            websiteUrl={websiteUrl}
            twitterUrl={twitterUrl}
            linkedinUrl={linkedinUrl}
            facebookUrl={facebookUrl}
            instagramUrl={instagramUrl}
            dir="ltr"
          />
        </div>

      </div>

    </div>
  );

  // If requested as a phone frame mockup on desktop:
  if (asPhoneMockup) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 w-full h-full ${className}`}>
        {/* Smartphone Shell with Realistic Borders & Shadow */}
        <div className="w-full max-w-[380px] sm:max-w-[400px] h-[780px] max-h-[92vh] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col relative overflow-hidden ring-1 ring-white/20">
          {/* Inner Screen */}
          <div className="w-full h-full rounded-[38px] overflow-hidden flex flex-col bg-[#EBF4FA] relative">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise standard mobile responsive layout:
  return <div className={`w-full h-full ${className}`}>{content}</div>;
};
