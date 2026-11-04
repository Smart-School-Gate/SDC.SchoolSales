import React, { useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  X,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  LayoutGrid,
  Maximize2
} from 'lucide-react';

export interface SlideImageItem {
  url: string;
  title?: string;
  subtitle?: string;
  caption?: string; // backwards compatibility
}

export const parseSlideImages = (imageUrlRaw?: string | null, fallbackUrl?: string): SlideImageItem[] => {
  if (!imageUrlRaw || !imageUrlRaw.trim()) {
    return fallbackUrl ? [{ url: fallbackUrl, title: '', subtitle: '', caption: '' }] : [];
  }
  const trimmed = imageUrlRaw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((item: any) => item && (typeof item === 'string' ? item.trim() : item.url?.trim()))
          .map((item: any) => {
            if (typeof item === 'string') {
              return { url: item.trim(), title: '', subtitle: '', caption: '' };
            }
            let title = (item.title || '').trim();
            let subtitle = (item.subtitle || '').trim();
            let caption = (item.caption || '').trim();
            if (!title && caption) {
              if (caption.includes('\n')) {
                const parts = caption.split('\n');
                title = parts[0].trim();
                subtitle = parts.slice(1).join(' ').trim();
              } else if (caption.includes(' - ')) {
                const parts = caption.split(' - ');
                title = parts[0].trim();
                subtitle = parts.slice(1).join(' - ').trim();
              } else {
                title = caption;
              }
            }
            return {
              url: (item.url || '').trim(),
              title: title || caption,
              subtitle,
              caption: caption || title
            };
          })
          .slice(0, 4);
      }
    } catch {
      // Not valid JSON, fallback to single URL
    }
  }
  return [{ url: trimmed, title: '', subtitle: '', caption: '' }];
};

export const serializeSlideImages = (images: SlideImageItem[]): string => {
  const valid = images.filter(img => img.url && img.url.trim().length > 0);
  if (valid.length === 0) return '';
  if (valid.length === 1 && !valid[0].title && !valid[0].subtitle && !valid[0].caption) {
    return valid[0].url.trim();
  }
  return JSON.stringify(valid.slice(0, 4).map(v => ({
    url: v.url.trim(),
    title: v.title?.trim() || v.caption?.trim() || '',
    subtitle: v.subtitle?.trim() || '',
    caption: v.caption?.trim() || v.title?.trim() || ''
  })));
};

interface SlideMultiImagesViewProps {
  images: SlideImageItem[];
  altTitle?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  className?: string;
  isCardPreview?: boolean;
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop';

export const SlideMultiImagesView: React.FC<SlideMultiImagesViewProps> = ({
  images,
  altTitle,
  headerTitle,
  headerSubtitle,
  className = '',
  isCardPreview = false
}) => {
  const validImages = images.filter(img => img.url && img.url.trim().length > 0);
  const count = validImages.length;

  // Lightbox Zoom Modal state
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [isScaleExpanded, setIsScaleExpanded] = useState(false);

  // View mode for 4 images: 'grid' (2x2 mosaic) or 'focus' (interactive spotlight)
  const [fourViewMode, setFourViewMode] = useState<'grid' | 'focus'>('grid');
  const [activeFocusIdx, setActiveFocusIdx] = useState(0);

  // Keyboard navigation for zoom lightbox
  useEffect(() => {
    if (zoomedIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedIndex(null);
      } else if (e.key === 'ArrowRight') {
        setIsScaleExpanded(false);
        setZoomedIndex(prev => (prev !== null ? (prev + 1) % validImages.length : 0));
      } else if (e.key === 'ArrowLeft') {
        setIsScaleExpanded(false);
        setZoomedIndex(prev => (prev !== null ? (prev - 1 + validImages.length) % validImages.length : 0));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomedIndex, validImages.length]);

  if (count === 0) {
    return null;
  }

  const handleOpenZoom = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setIsScaleExpanded(false);
    setZoomedIndex(index);
  };

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* 1. DYNAMIC GRID LAYOUT MATCHING USER'S PREMIUM MOCKUP             */}
      {/* ----------------------------------------------------------------- */}
      <div className={`w-full h-full flex flex-col ${className}`}>
        
        {/* 1 IMAGE: Full Width & Clean Aspect Ratio - Fills 100% to border */}
        {count === 1 && (
          <div
            onClick={(e) => handleOpenZoom(e, 0)}
            className="relative w-full h-full flex-1 min-h-0 rounded-2xl sm:rounded-3xl overflow-hidden group cursor-zoom-in border border-slate-200/80 shadow-xs"
            title="انقر لتكبير الصورة بكامل الحجم"
          >
            <img
              src={validImages[0].url}
              alt={validImages[0].title || validImages[0].caption || altTitle || 'Slide Visual'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== FALLBACK_IMG) target.src = FALLBACK_IMG;
              }}
            />
            {/* Hover zoom badge */}
            <div className="absolute top-2.5 end-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>تكبير</span>
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-2.5 sm:p-4 flex items-end justify-between">
              <div>
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow-xs block">
                  {validImages[0].title || validImages[0].caption || altTitle}
                </span>
                {validImages[0].subtitle && (
                  <span className="text-[10px] sm:text-xs text-slate-300 font-medium block mt-0.5">
                    {validImages[0].subtitle}
                  </span>
                )}
              </div>
              {!isCardPreview && (
                <span className="text-[10px] font-mono bg-cyan-500/40 text-cyan-100 px-2 py-0.5 rounded border border-cyan-400/50 backdrop-blur-xs font-semibold hidden sm:inline-block">
                  Rootaca
                </span>
              )}
            </div>
          </div>
        )}

        {/* 2 IMAGES: Side-by-side (2 columns) with clean text underneath */}
        {count === 2 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-3 sm:p-5 w-full h-full flex flex-col justify-between">
            {(headerTitle || headerSubtitle) && (
              <div className="text-center pb-2 shrink-0">
                {headerTitle && <h3 className="text-xs sm:text-sm font-black text-slate-900">{headerTitle}</h3>}
                {headerSubtitle && <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5">{headerSubtitle}</p>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full flex-1 min-h-0">
              {validImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={(e) => handleOpenZoom(e, idx)}
                  className="flex flex-col justify-between group cursor-zoom-in min-h-0"
                  title="انقر لتكبير الصورة بكامل الحجم"
                >
                  <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-2xs border border-slate-200/80 group-hover:border-cyan-400 transition-all flex-1 min-h-0">
                    <img
                      src={img.url}
                      alt={img.title || img.caption || `صورة ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== FALLBACK_IMG) target.src = FALLBACK_IMG;
                      }}
                    />
                    <div className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs text-white p-1 rounded-md text-[10px] shadow-sm">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="pt-1.5 sm:pt-2 text-right shrink-0">
                    <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                      {img.title || img.caption || `صورة ${idx + 1}`}
                    </div>
                    {img.subtitle && (
                      <div className="text-[10px] sm:text-xs font-semibold text-slate-500 leading-tight mt-0.5">
                        {img.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3 IMAGES: 3 Columns side-by-side with clean text underneath */}
        {count === 3 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-3 sm:p-5 w-full h-full flex flex-col justify-between">
            {(headerTitle || headerSubtitle) && (
              <div className="text-center pb-2 shrink-0">
                {headerTitle && <h3 className="text-xs sm:text-sm font-black text-slate-900">{headerTitle}</h3>}
                {headerSubtitle && <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5">{headerSubtitle}</p>}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full flex-1 min-h-0">
              {validImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={(e) => handleOpenZoom(e, idx)}
                  className="flex flex-col justify-between group cursor-zoom-in min-h-0"
                  title="انقر لتكبير الصورة بكامل الحجم"
                >
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-2xs border border-slate-200/80 group-hover:border-cyan-400 transition-all flex-1 min-h-0">
                    <img
                      src={img.url}
                      alt={img.title || img.caption || `صورة ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== FALLBACK_IMG) target.src = FALLBACK_IMG;
                      }}
                    />
                    <div className="absolute top-1.5 end-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs text-white p-1 rounded-md text-[10px] shadow-sm">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="pt-1.5 text-right shrink-0">
                    <div className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight truncate">
                      {img.title || img.caption || `صورة ${idx + 1}`}
                    </div>
                    {img.subtitle && (
                      <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight truncate mt-0.5">
                        {img.subtitle}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 IMAGES: 2x2 Grid matching User's Mockup, with interactive Focus mode */}
        {count === 4 && (
          <div className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs w-full h-full flex flex-col justify-between overflow-hidden ${
            isCardPreview ? 'p-2' : 'p-2.5 sm:p-3.5'
          }`}>
            {/* Top Bar: Title & View Mode Switcher */}
            {!isCardPreview && (
              <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-slate-100 shrink-0" dir="rtl">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] sm:text-xs font-black text-cyan-800 bg-cyan-50 border border-cyan-200/90 px-2 py-0.5 rounded-md shrink-0">
                    4 مكونات
                  </span>
                  {headerTitle && (
                    <span className="text-xs font-bold text-slate-700 truncate hidden md:inline">
                      {headerTitle}
                    </span>
                  )}
                </div>

                {/* View Mode Toggle: Grid 2x2 vs Focus Spotlight */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setFourViewMode('grid')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition cursor-pointer ${
                      fourViewMode === 'grid'
                        ? 'bg-white text-cyan-800 shadow-2xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="عرض الشبكة 2×2"
                  >
                    <LayoutGrid className="w-3 h-3" />
                    <span>شبكة 2×2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFourViewMode('focus')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition cursor-pointer ${
                      fourViewMode === 'focus'
                        ? 'bg-white text-cyan-800 shadow-2xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="عرض الشاشة المكبرة"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>تركيز</span>
                  </button>
                </div>
              </div>
            )}

            {/* A) GRID MODE: 2x2 Grid of Rounded Photos */}
            {fourViewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full flex-1 min-h-0" dir="ltr">
                {validImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => handleOpenZoom(e, idx)}
                    className="flex flex-col justify-between group cursor-zoom-in min-h-0"
                    title="انقر لتكبير الصورة بكامل الحجم"
                  >
                    {/* Rounded Image Box - Contain fit with background padding so UI screenshots are never cropped */}
                    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] bg-slate-50/90 border border-slate-200/80 group-hover:border-cyan-400 group-hover:shadow-xs transition-all flex-1 min-h-[105px] sm:min-h-[135px] flex items-center justify-center">
                      <img
                        src={img.url}
                        alt={img.title || img.caption || `صورة ${idx + 1}`}
                        className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== FALLBACK_IMG) target.src = FALLBACK_IMG;
                        }}
                      />
                      <div className="absolute top-1.5 end-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs text-white p-1 rounded-md text-[10px] shadow-sm">
                        <ZoomIn className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Text Below the Image (Clean white background, right-aligned) */}
                    <div className="pt-1 text-right shrink-0" dir="rtl">
                      <div className="text-[11px] sm:text-xs font-black text-slate-800 leading-tight truncate">
                        {img.title || img.caption || `صورة ${idx + 1}`}
                      </div>
                      {img.subtitle && (
                        <div className="text-[9px] sm:text-[10px] font-medium text-slate-500 leading-tight truncate mt-0.5">
                          {img.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* B) FOCUS SPOTLIGHT MODE: Interactive tabs for deep-dive demonstration */
              <div className="flex-1 w-full flex flex-col justify-between min-h-0 gap-2" dir="rtl">
                {/* 4 Interactive Role Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                  {validImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveFocusIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                        activeFocusIdx === idx
                          ? 'bg-cyan-500 text-white shadow-xs font-black'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{img.title || img.caption || `#0${idx + 1}`}</span>
                    </button>
                  ))}
                </div>

                {/* Big Focused Screen with Caption */}
                {(() => {
                  const focusedImg = validImages[activeFocusIdx] || validImages[0];
                  return (
                    <div
                      onClick={(e) => handleOpenZoom(e, activeFocusIdx)}
                      className="relative rounded-2xl overflow-hidden bg-slate-50/90 border border-slate-200 flex-1 min-h-[180px] flex items-center justify-center group cursor-zoom-in"
                      title="انقر لتكبير الصورة بكامل الحجم"
                    >
                      <img
                        src={focusedImg.url}
                        alt={focusedImg.title || focusedImg.caption}
                        className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-3 flex items-end justify-between">
                        <div>
                          <span className="text-xs sm:text-sm font-black text-white block">
                            {focusedImg.title || focusedImg.caption}
                          </span>
                          {focusedImg.subtitle && (
                            <span className="text-[10px] sm:text-xs text-slate-300 block mt-0.5">
                              {focusedImg.subtitle}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-cyan-200 bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-400/30">
                          {activeFocusIdx + 1} / 4
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. FULL-RESOLUTION INTERACTIVE LIGHTBOX & ZOOM MODAL             */}
      {/* ----------------------------------------------------------------- */}
      {zoomedIndex !== null && validImages[zoomedIndex] && (
        <div
          dir="rtl"
          onClick={() => setZoomedIndex(null)}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center justify-between"
          >
            {/* Top Bar inside modal */}
            <div className="w-full flex items-center justify-between text-white pb-3 px-1 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/90 px-2.5 py-0.5 rounded-full border border-cyan-800 shrink-0">
                  {zoomedIndex + 1} / {validImages.length}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                  {validImages[zoomedIndex]?.title || validImages[zoomedIndex]?.caption || altTitle || 'عرض الصورة بكامل الحجم'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsScaleExpanded(prev => !prev)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title={isScaleExpanded ? 'إعادة الحجم الافتراضي' : 'تكبير إضافي (Zoom In)'}
                >
                  {isScaleExpanded ? <ZoomOut className="w-4 h-4 text-cyan-400" /> : <ZoomIn className="w-4 h-4" />}
                </button>
                <a
                  href={validImages[zoomedIndex]?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="فتح الصورة في علامة تبويب جديدة"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setZoomedIndex(null)}
                  className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white transition cursor-pointer"
                  title="إغلاق (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Stage Image with Zoom & Navigation */}
            <div className="relative w-full flex items-center justify-center overflow-auto max-h-[72vh] my-3 rounded-2xl bg-black/60 border border-white/10 p-2">
              <img
                src={validImages[zoomedIndex]?.url}
                alt={validImages[zoomedIndex]?.title || 'Full resolution view'}
                className={`max-w-full max-h-[68vh] object-contain transition-transform duration-300 ${
                  isScaleExpanded ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                }`}
                onClick={() => setIsScaleExpanded(prev => !prev)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== FALLBACK_IMG) target.src = FALLBACK_IMG;
                }}
              />

              {/* Navigation Arrows if more than 1 image */}
              {validImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsScaleExpanded(false);
                      setZoomedIndex((zoomedIndex - 1 + validImages.length) % validImages.length);
                    }}
                    className="absolute start-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-cyan-600 text-white flex items-center justify-center border border-white/20 transition shadow-lg cursor-pointer"
                    title="الصورة السابقة"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsScaleExpanded(false);
                      setZoomedIndex((zoomedIndex + 1) % validImages.length);
                    }}
                    className="absolute end-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-cyan-600 text-white flex items-center justify-center border border-white/20 transition shadow-lg cursor-pointer"
                    title="الصورة التالية"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption Pill */}
            {(validImages[zoomedIndex]?.title || validImages[zoomedIndex]?.subtitle || validImages[zoomedIndex]?.caption) && (
              <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold max-w-2xl text-center shadow-lg">
                <span className="font-bold text-white block">
                  {validImages[zoomedIndex]?.title || validImages[zoomedIndex]?.caption}
                </span>
                {validImages[zoomedIndex]?.subtitle && (
                  <span className="text-xs text-slate-300 block mt-0.5">
                    {validImages[zoomedIndex]?.subtitle}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
