import React from 'react';
import {
  Building2,
  Laptop,
  Activity,
  ZoomIn
} from 'lucide-react';
import { SlideImageItem } from './SlideMultiImagesView';
import { SlideSocialFooter } from './SlideSocialFooter';

interface SlideFourImagesViewProps {
  titleAr?: string;
  titleEn?: string;
  badges?: Array<{ label: string; colorClass: string }>;
  images?: SlideImageItem[];
  chips?: Array<{
    titleEn: string;
    titleAr: string;
    icon: any;
    bgColor: string;
    textColor: string;
  }>;
  onImageClick?: (index: number) => void;
  lang?: 'ar' | 'en';
  websiteUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  className?: string;
}

const DEFAULT_CAMPUS_IMAGES: SlideImageItem[] = [
  {
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1200&auto=format&fit=crop',
    title: 'Campus Aerial View',
    subtitle: 'لقطة جوية'
  },
  {
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop',
    title: 'Modern Classroom',
    subtitle: 'الفصول الحديثة'
  },
  {
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop',
    title: 'Digital Library',
    subtitle: 'المكتبة الرقمية'
  },
  {
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    title: 'Sports Complex',
    subtitle: 'المجمع الرياضي'
  }
];

const DEFAULT_BADGES_AR = [
  { label: 'التعليم الذكي', colorClass: 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]' },
  { label: 'المدرسة المتصلة', colorClass: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' },
  { label: 'نظرة عامة', colorClass: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]' }
];

const DEFAULT_BADGES_EN = [
  { label: 'EDUCATION', colorClass: 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]' },
  { label: 'CAMPUS', colorClass: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' },
  { label: 'Overview', colorClass: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]' }
];

const DEFAULT_CHIPS = [
  {
    titleEn: 'Inspiring Spaces',
    titleAr: 'مساحات ملهمة',
    icon: Building2,
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-700'
  },
  {
    titleEn: 'Smart Learning',
    titleAr: 'تعلم ذكي',
    icon: Laptop,
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700'
  },
  {
    titleEn: 'Active Lifestyle',
    titleAr: 'نمط حياة نشط',
    icon: Activity,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700'
  }
];

export const SlideFourImagesView: React.FC<SlideFourImagesViewProps> = ({
  titleAr = 'الحرم المدرسي ومرافقنا الحديثة',
  titleEn = 'OUR CAMPUS & MODERN FACILITIES',
  badges,
  images = DEFAULT_CAMPUS_IMAGES,
  chips = DEFAULT_CHIPS,
  onImageClick,
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
  const effectiveBadges = badges || (isAr ? DEFAULT_BADGES_AR : DEFAULT_BADGES_EN);
  const effectiveImages = images && images.length >= 2 ? images.slice(0, 4) : DEFAULT_CAMPUS_IMAGES;

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`w-full max-w-[1360px] mx-auto bg-white rounded-[28px] sm:rounded-[36px] border border-slate-200/90 shadow-2xl shadow-cyan-950/5 p-5 sm:p-7 lg:p-9 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${className}`}
    >
      
      {/* ---------------------------------------------------- */}
      {/* 1. TOP HEADER: Single Language Title + Badges        */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100/90">
        
        {/* Title strictly in selected language */}
        <div className="min-w-0 flex-1">
          <h1 className={`font-black text-slate-900 tracking-tight leading-snug ${
            isAr ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl uppercase tracking-wider'
          }`}>
            {effectiveTitle}
          </h1>
        </div>

        {/* Badges Pill Tags */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-start sm:self-center shrink-0">
          {effectiveBadges.map((b, idx) => (
            <span
              key={idx}
              className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${b.colorClass}`}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. MIDDLE 2x2 IMAGE GRID WITH FROSTED PILL BADGES    */}
      {/* ---------------------------------------------------- */}
      <div className="my-4 sm:my-5 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full flex-1 min-h-[300px] max-h-[560px]">
        {effectiveImages.map((img, idx) => {
          const caption = isAr ? (img.subtitle || img.title) : (img.title || img.subtitle);

          return (
            <div
              key={idx}
              onClick={() => onImageClick && onImageClick(idx)}
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] bg-slate-100 border border-slate-200/80 shadow-2xs group cursor-pointer"
            >
              <img
                src={img.url}
                alt={caption || `Campus Photo ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== DEFAULT_CAMPUS_IMAGES[idx % 4].url) {
                    target.src = DEFAULT_CAMPUS_IMAGES[idx % 4].url;
                  }
                }}
              />

              {/* Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Center Bottom Frosted Pill Overlay Badge in selected language */}
              {caption && (
                <div className="absolute bottom-2.5 sm:bottom-3.5 inset-x-2 flex justify-center pointer-events-none z-10">
                  <div className="bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 rounded-full border border-white/20 shadow-lg truncate max-w-[90%] text-center">
                    <span>{caption}</span>
                  </div>
                </div>
              )}

              {/* Hover Zoom Icon */}
              <div className="absolute top-2.5 end-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs text-white p-1 rounded-lg text-xs shadow-md">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. BOTTOM SECTION: 3 Highlight Chips in Language     */}
      {/* ---------------------------------------------------- */}
      {chips && chips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
          {chips.map((chip, idx) => {
            const Icon = chip.icon || Building2;
            const chipLabel = (chip.titleEn && chip.titleAr)
              ? `${chip.titleEn} • ${chip.titleAr}`
              : (isAr ? chip.titleAr || chip.titleEn : chip.titleEn || chip.titleAr);

            return (
              <div
                key={idx}
                className="bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs p-3 sm:p-3.5 flex items-center gap-3 transition hover:shadow-xs hover:border-cyan-300"
              >
                <div className={`w-9 h-9 rounded-xl ${chip.bgColor || 'bg-cyan-100'} ${chip.textColor || 'text-cyan-800'} flex items-center justify-center shrink-0 shadow-2xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-800 truncate">
                  {chipLabel}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. FOOTER: Website & Social Media Icons Links         */}
      {/* ---------------------------------------------------- */}
      <SlideSocialFooter
        websiteUrl={websiteUrl}
        twitterUrl={twitterUrl}
        linkedinUrl={linkedinUrl}
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
        dir="ltr"
      />

    </div>
  );
};
