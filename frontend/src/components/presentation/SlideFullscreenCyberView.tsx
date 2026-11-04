import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Sparkles,
  Globe
} from 'lucide-react';
import { SlideImageItem } from './SlideMultiImagesView';

interface SlideFullscreenCyberViewProps {
  tag?: string;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  pointsAr?: string[];
  pointsEn?: string[];
  images?: SlideImageItem[];
  currentSlideNum?: number;
  totalSlides?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onExitFullscreen: () => void;
  lang?: 'ar' | 'en';
  onToggleLang?: () => void;
  className?: string;
}

const DEFAULT_CYBER_IMAGES: SlideImageItem[] = [
  {
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1200&auto=format&fit=crop',
    title: 'Campus Architecture',
    subtitle: 'العمارة المدرسية'
  },
  {
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop',
    title: 'Tiered Atrium Library',
    subtitle: 'مدرج المكتبة الحديثة'
  },
  {
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop',
    title: 'Nordic Classrooms',
    subtitle: 'الفصول الدراسية الذكية'
  },
  {
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop',
    title: 'STEM & Robotics Lab',
    subtitle: 'معامل الابتكار والروبوت'
  }
];

export const SlideFullscreenCyberView: React.FC<SlideFullscreenCyberViewProps> = ({
  tag = 'CAMPUS OVERVIEW',
  titleAr = 'أهلاً بكم في مدرستكم',
  titleEn = 'Welcome to Your School',
  descriptionAr = 'مدرستكم أولاً — نبذة تعريفية ورؤية ورسالة وترحيب مخصص بمدرستكم الكريمة.',
  descriptionEn = 'Your School First — Dedicated introduction, campus overview, vision & mission.',
  pointsAr = [],
  pointsEn = [],
  images,
  currentSlideNum = 1,
  totalSlides = 12,
  onPrev,
  onNext,
  onExitFullscreen,
  lang = 'ar',
  onToggleLang,
  className = ''
}) => {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const effectiveTitle = isAr ? (titleAr || titleEn) : (titleEn || titleAr);
  const effectiveDesc = isAr ? (descriptionAr || descriptionEn) : (descriptionEn || descriptionAr);
  const effectivePoints = isAr
    ? (pointsAr && pointsAr.length > 0 ? pointsAr : pointsEn)
    : (pointsEn && pointsEn.length > 0 ? pointsEn : pointsAr);

  const effectiveImages = images && images.length > 0 ? images.slice(0, 4) : DEFAULT_CYBER_IMAGES;
  const slideNumStr = String(currentSlideNum).padStart(2, '0');
  const totalSlidesStr = String(totalSlides).padStart(2, '0');

  return (
    <div
      dir={dir}
      className={`relative w-full h-full min-h-screen bg-[#040C1A] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden select-none font-sans ${className}`}
    >
      
      {/* ----------------------------------------------------------------- */}
      {/* AMBIENT CYBER LIGHT EFFECTS & GRID PATTERNS                       */}
      {/* ----------------------------------------------------------------- */}
      {/* Top right cyan radial bloom */}
      <div className="absolute -top-32 -end-32 w-[550px] h-[550px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
      {/* Bottom left blue radial bloom */}
      <div className="absolute -bottom-32 -start-32 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      
      {/* Subtle tech dots background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* ----------------------------------------------------------------- */}
      {/* MAIN CONTENT STAGE (Split 2 Columns: Story & Visuals)             */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 my-auto">
        
        {/* STORY COLUMN: Typography & Content Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-5 text-start">
          
          {/* Glowing Pill Tag */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{tag}</span>
            </span>
            <div className="flex gap-1 opacity-60">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/30" />
            </div>
          </div>

          {/* Title in selected language ONLY */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-200 tracking-tight leading-tight whitespace-pre-line drop-shadow-[0_0_25px_rgba(6,182,212,0.35)]">
              {effectiveTitle}
            </h1>
          </div>

          {/* Content Card strictly in selected language */}
          <div className="relative rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-cyan-500/30 p-5 sm:p-6 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
            <div className={`absolute top-0 ${isAr ? 'end-4' : 'start-4'} -translate-y-1/2 flex gap-1`}>
              <span className="w-8 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </div>
            
            <div className="space-y-3">
              {/* Main Content / Objective */}
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                <strong className="text-cyan-300 font-bold me-1.5 drop-shadow-xs">
                  {isAr ? 'الهدف الرئيسي:' : 'Key Objective:'}
                </strong>
                <span>{effectiveDesc}</span>
              </p>

              {/* Bullet Key Points list */}
              {effectivePoints && effectivePoints.length > 0 && (
                <ul className="space-y-2 pt-2.5 border-t border-cyan-500/20">
                  {effectivePoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
                      <span className="leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Futuristic bottom line */}
          <div className="flex items-center gap-2 pt-1 text-cyan-500/40 font-mono text-xs">
            <span>● ● ● ● ●</span>
            <div className="flex-1 h-px bg-cyan-500/20" />
            <span>ROOTACA SYS 2.0</span>
          </div>
        </div>

        {/* VISUALS COLUMN: Single Hero or 2x2 Grid (7 cols) */}
        <div className="lg:col-span-7 w-full h-full flex items-center justify-center">
          {effectiveImages.length === 1 ? (
            <div className="relative w-full aspect-[16/10] max-h-[580px] rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/20 shadow-[0_0_25px_rgba(0,0,0,0.6)] group bg-slate-900">
              <img
                src={effectiveImages[0].url}
                alt={effectiveTitle}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 border border-cyan-400/0 group-hover:border-cyan-400/40 rounded-2xl sm:rounded-3xl transition-all duration-300 pointer-events-none shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full aspect-[4/3] sm:aspect-[16/11] max-h-[580px]">
              {effectiveImages.map((img, idx) => {
                const label = isAr ? (img.subtitle || img.title) : (img.title || img.subtitle);
                return (
                  <div
                    key={idx}
                    className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] group bg-slate-900"
                  >
                    <img
                      src={img.url}
                      alt={label || `Visual ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== DEFAULT_CYBER_IMAGES[idx % 4].url) {
                          target.src = DEFAULT_CYBER_IMAGES[idx % 4].url;
                        }
                      }}
                    />
                    
                    {/* Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Bottom frosted pill caption */}
                    {label && (
                      <div className="absolute bottom-2.5 inset-x-2 flex justify-center pointer-events-none z-10">
                        <div className="bg-black/65 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-white/20 shadow-md truncate max-w-[90%] text-center">
                          <span>{label}</span>
                        </div>
                      </div>
                    )}

                    {/* Cyber corner accents */}
                    <div className="absolute inset-0 border border-cyan-400/0 group-hover:border-cyan-400/40 rounded-2xl sm:rounded-3xl transition-all duration-300 pointer-events-none shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ----------------------------------------------------------------- */}
      {/* BOTTOM FLOATING CONTROL BAR (Glass Pill Dock)                     */}
      {/* ----------------------------------------------------------------- */}
      <div className="z-20 pt-4 flex items-center justify-center" dir="ltr">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/40 rounded-full px-4 sm:px-5 py-2 flex items-center gap-3 sm:gap-4 shadow-[0_0_25px_rgba(6,182,212,0.25)] text-slate-200">
          
          {/* Previous Arrow */}
          <button
            onClick={onPrev}
            disabled={!onPrev || currentSlideNum <= 1}
            className="p-1 sm:p-1.5 text-cyan-300 hover:text-white hover:bg-cyan-500/20 rounded-full transition disabled:opacity-20 cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Slide Numbers: 01 / 12 */}
          <div className="font-mono text-xs sm:text-sm font-bold text-cyan-300 tracking-widest px-1 sm:px-2">
            <span>{slideNumStr}</span>
            <span className="text-slate-500 mx-1.5">/</span>
            <span className="text-slate-400">{totalSlidesStr}</span>
          </div>

          {/* Next Arrow */}
          <button
            onClick={onNext}
            disabled={!onNext || currentSlideNum >= totalSlides}
            className="p-1 sm:p-1.5 text-cyan-300 hover:text-white hover:bg-cyan-500/20 rounded-full transition disabled:opacity-20 cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Vertical Separator */}
          <div className="w-px h-5 bg-cyan-500/30 mx-1" />

          {/* Language Switcher Button in Fullscreen */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-bold transition cursor-pointer"
              title="Toggle Language (عربي / English)"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>
          )}

          {/* Exit Fullscreen Button */}
          <button
            onClick={onExitFullscreen}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold transition cursor-pointer"
            title="Exit Fullscreen"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Fullscreen</span>
          </button>

        </div>
      </div>

    </div>
  );
};
