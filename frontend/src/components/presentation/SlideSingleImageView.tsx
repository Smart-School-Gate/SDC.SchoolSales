import React from 'react';
import {
  Eye,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Maximize2
} from 'lucide-react';
import { SlideSocialFooter } from './SlideSocialFooter';

interface SlideSingleImageViewProps {
  titleEn?: string;
  titleAr?: string;
  badges?: string[];
  imageUrl?: string;
  imageAlt?: string;
  visionTitle?: string;
  visionDesc?: string;
  overviewTitle?: string;
  overviewDesc?: string;
  currentSlideNum?: number;
  totalSlides?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onToggleFullscreen?: () => void;
  lang?: 'ar' | 'en';
  websiteUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  className?: string;
}

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1600&auto=format&fit=crop';

export const SlideSingleImageView: React.FC<SlideSingleImageViewProps> = ({
  titleEn = 'Welcome to Modern Platform',
  titleAr = 'مرحباً بكم في المنصة الحديثة',
  badges = ['VISION', 'OVERVIEW'],
  imageUrl = FALLBACK_HERO,
  imageAlt = 'Slide Hero Photo',
  visionTitle,
  visionDesc,
  overviewTitle,
  overviewDesc,
  currentSlideNum = 1,
  totalSlides = 12,
  onPrev,
  onNext,
  onToggleFullscreen,
  lang = 'ar',
  websiteUrl,
  twitterUrl,
  linkedinUrl,
  facebookUrl,
  instagramUrl,
  className = ''
}) => {
  const isAr = lang === 'ar';
  const effectiveTitle = isAr ? (titleAr || titleEn) : (titleEn || titleAr);
  const effectiveVisionTitle = visionTitle || (isAr ? 'الرؤية والهدف' : 'Our Vision');
  const effectiveVisionDesc = visionDesc || (isAr ? 'دعم الاستدامة والتطوير التكنولوجي الذكي لمدرستكم.' : 'Supporting sustainability, growth, and forward-thinking futures.');
  const effectiveOverviewTitle = overviewTitle || (isAr ? 'نظرة عامة على المنصة' : 'Platform Overview');
  const effectiveOverviewDesc = overviewDesc || (isAr ? 'حلول رقمية متكاملة لربط إدارة العمليات بالمدرسة.' : 'Integrating smart digital solutions and innovative spaces.');

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`w-full max-w-[1360px] mx-auto bg-white rounded-[28px] sm:rounded-[36px] border border-slate-200/90 shadow-2xl shadow-cyan-950/5 p-5 sm:p-8 lg:p-10 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${className}`}
    >
      
      {/* ---------------------------------------------------- */}
      {/* 1. TOP HEADER: Single Language Title + Badges        */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100/80">
        
        {/* Title strictly in selected language */}
        <div className="min-w-0 flex-1">
          <h1 className={`font-black text-slate-900 tracking-tight leading-tight whitespace-pre-line ${
            isAr ? 'text-2xl sm:text-3xl lg:text-4xl' : 'font-serif text-2xl sm:text-3xl lg:text-[40px]'
          }`}>
            {effectiveTitle}
          </h1>
        </div>

        {/* Badges Pill Tags */}
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
          {badges.map((badge, idx) => (
            <span
              key={idx}
              className="text-[10px] sm:text-[11px] font-bold font-mono tracking-wider uppercase px-3 py-1 rounded-full bg-[#E0F4F7] text-[#0891B2] border border-[#BCE7EF]"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. MIDDLE HERO IMAGE (Single Wide Landscape)         */}
      {/* ---------------------------------------------------- */}
      <div className="my-5 sm:my-6 relative w-full aspect-[21/9] sm:aspect-[2.2/1] min-h-[220px] max-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200/70 group bg-slate-100">
        <img
          src={imageUrl || FALLBACK_HERO}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== FALLBACK_HERO) target.src = FALLBACK_HERO;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. BOTTOM SECTION: Two Feature Summary Cards         */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-1">
        
        {/* Card 1: Vision / Objective */}
        <div className="flex items-start gap-3.5 p-3 rounded-2xl transition hover:bg-slate-50/80 border border-transparent hover:border-slate-100">
          <div className="w-10 h-10 rounded-full bg-[#E0F4F7] text-[#0891B2] flex items-center justify-center shrink-0 shadow-2xs border border-[#BCE7EF]">
            <Eye className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              {effectiveVisionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {effectiveVisionDesc}
            </p>
          </div>
        </div>

        {/* Card 2: Overview / Scope */}
        <div className="flex items-start gap-3.5 p-3 rounded-2xl transition hover:bg-slate-50/80 border border-transparent hover:border-slate-100">
          <div className="w-10 h-10 rounded-full bg-[#E0F4F7] text-[#0891B2] flex items-center justify-center shrink-0 shadow-2xs border border-[#BCE7EF]">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              {effectiveOverviewTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {effectiveOverviewDesc}
            </p>
          </div>
        </div>

      </div>

      {/* FOOTER: Website Link & Social Media Icons */}
      <SlideSocialFooter
        websiteUrl={websiteUrl}
        twitterUrl={twitterUrl}
        linkedinUrl={linkedinUrl}
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
        dir="ltr"
      />

      {/* ---------------------------------------------------- */}
      {/* 4. BOTTOM FLOATING BAR: Slide Counter + Fullscreen   */}
      {/* ---------------------------------------------------- */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between" dir="ltr">
        <div className="w-8 hidden sm:block" />

        {/* Centered Pill */}
        <div className="mx-auto bg-slate-100/90 border border-slate-200/90 rounded-full px-3 py-1 flex items-center gap-2.5 shadow-2xs">
          <button
            onClick={onPrev}
            disabled={!onPrev || currentSlideNum <= 1}
            className="p-1 text-slate-500 hover:text-slate-900 transition disabled:opacity-30 cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-slate-700 font-mono whitespace-nowrap">
            Slide {currentSlideNum} of {totalSlides}
          </span>
          <button
            onClick={onNext}
            disabled={!onNext || currentSlideNum >= totalSlides}
            className="p-1 text-slate-500 hover:text-slate-900 transition disabled:opacity-30 cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Corner Buttons */}
        <div className="flex items-center gap-1 text-slate-400">
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
