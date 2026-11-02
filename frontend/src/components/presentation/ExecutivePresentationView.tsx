import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  GraduationCap,
  Cpu,
  BarChart3,
  Rocket,
  Target,
  Lightbulb,
  TrendingUp,
  Lock,
  Cloud,
  Compass,
  CalendarCheck,
  MousePointer,
  PenTool,
  Timer,
  Tv,
  Bus,
  Clock,
  Award,
  Shield,
  FileCheck,
  Check,
  Smartphone
} from 'lucide-react';
import { PresentationDto } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface SlideCardItem {
  title: string;
  desc: string;
  icon: any;
  badge?: string;
  image?: string;
  chartType?: 'bars' | 'wave' | 'trend' | 'target';
}

interface SlideItem {
  id: string;
  type: string;
  tag: string;
  title: string;
  subtitle: string;
  numberAr: string;
  numberEn: string;
  shortTitleAr: string;
  shortTitleEn: string;
  heroImage?: string;
  thumbnailImage?: string;
  cards: SlideCardItem[];
}

interface ExecutivePresentationViewProps {
  presentation?: PresentationDto;
  initialSlideIndex?: number;
  onClose: () => void;
  onSelectAction?: (action: 'demo' | 'visit') => void;
  schoolName?: string;
  defaultLanguage?: 'ar' | 'en';
}

export const ExecutivePresentationView: React.FC<ExecutivePresentationViewProps> = ({
  presentation,
  initialSlideIndex = 0,
  onClose,
  schoolName,
  defaultLanguage
}) => {
  const { language: contextLang } = useLanguage();
  const [lang, setLang] = useState<'ar' | 'en'>(defaultLanguage || contextLang || 'ar');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timer counter
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Fullscreen support
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen?.();
        setIsBrowserFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsBrowserFullscreen(false);
      }
    } catch {
      // Gracefully ignore
    }
  };

  // Laser pointer mouse follower
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLaserActive) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
  };

  // 8 Curated Master Slides matching user's image exactly with Home Dashboard palette & Rich Imagery
  const masterSlides: SlideItem[] = [
    {
      id: 'about',
      type: 'company',
      tag: 'Rootaca',
      title: lang === 'ar' ? 'من نحن' : 'About Rootaca',
      subtitle: lang === 'ar' ? 'شركاء في الابتكار والتحول الرقمي التعليمي' : 'Partners in Educational Innovation & Digital Transformation',
      numberAr: '٠١',
      numberEn: '01',
      shortTitleAr: 'من نحن — Rootaca',
      shortTitleEn: 'About Rootaca',
      heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
      thumbnailImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=200&auto=format&fit=crop',
      cards: [
        {
          title: lang === 'ar' ? 'أهدافنا' : 'Our Goals',
          desc: lang === 'ar' ? 'تمكين الكوادر التعليمية وأولياء الأمور من خلال التقنية.' : 'Empowering educators and engaging parents seamlessly through cloud tech.',
          icon: Target,
          badge: 'Goals',
          chartType: 'target'
        },
        {
          title: lang === 'ar' ? 'رسالتنا' : 'Our Mission',
          desc: lang === 'ar' ? 'تقديم حلول تقنية وذكية ومبتكرة للمدارس.' : 'Delivering intelligent, cutting-edge software solutions tailored for schools.',
          icon: Rocket,
          badge: 'Mission',
          chartType: 'trend'
        },
        {
          title: lang === 'ar' ? 'رؤيتنا' : 'Our Vision',
          desc: lang === 'ar' ? 'قيادة التحول الرقمي في التعليم وبناء جيل المستقبل.' : 'Leading digital transformation in education and empowering future generations.',
          icon: Lightbulb,
          badge: 'Vision',
          chartType: 'wave'
        }
      ]
    },
    {
      id: 'challenges',
      type: 'challenges',
      tag: 'Challenges',
      title: lang === 'ar' ? 'تحديات إدارة المدارس' : 'School Challenges Today',
      subtitle: lang === 'ar' ? 'صعوبات الإدارة التقليدية وتأثيرها على كفاءة المدرسة' : 'Friction in legacy workflows and its impact on school productivity',
      numberAr: '٠٢',
      numberEn: '02',
      shortTitleAr: 'تحديات إدارة المدارس',
      shortTitleEn: 'Operational Challenges',
      heroImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop',
      thumbnailImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=200&auto=format&fit=crop',
      cards: [
        {
          title: lang === 'ar' ? 'تشتت البيانات الورقية' : 'Siloed Records',
          desc: lang === 'ar' ? 'صعوبة تتبع السجلات الموزعة بين ملفات إكسل ودفاتر غير مترابطة وضياع الوقت.' : 'Scattered student data across multiple disconnected sheets and paper folders.',
          icon: BarChart3,
          badge: 'Data'
        },
        {
          title: lang === 'ar' ? 'صعوبة تواصل أولياء الأمور' : 'Parent Friction',
          desc: lang === 'ar' ? 'تأخر وصول إشعارات الغياب والدرجات وملاحظات المعلمين وغياب التحديث اللحظي.' : 'Delayed notifications regarding attendance, behavioral notes, and marks.',
          icon: Users,
          badge: 'Comm'
        },
        {
          title: lang === 'ar' ? 'تأخر تحصيل المصروفات' : 'Tuition Delays',
          desc: lang === 'ar' ? 'غياب المتابعة الآلية للأقساط وتراكم المتأخرات المالية وضعف التدفق النقدي.' : 'Friction in fee installments, manual billing, and unclear cash flow visibility.',
          icon: Clock,
          badge: 'Finance'
        }
      ]
    },
    {
      id: 'smart-school',
      type: 'product',
      tag: 'ROOTACA Smart School',
      title: lang === 'ar' ? 'نظام ROOTACA للمدارس الذكية' : 'ROOTACA Smart School Platform',
      subtitle: lang === 'ar' ? 'منظومة سحابية متكاملة لإدارة شؤون الطلاب، الكنترول، والأقساط' : 'Unified core platform for admissions, curriculum, exams & finance',
      numberAr: '٠٣',
      numberEn: '03',
      shortTitleAr: 'نظام ROOTACA للمدارس الذكية',
      shortTitleEn: 'Smart School Platform',
      heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
      thumbnailImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=200&auto=format&fit=crop',
      cards: [
        {
          title: lang === 'ar' ? 'شؤون الطلاب والقبول' : 'Student Admissions',
          desc: lang === 'ar' ? 'تسجيل رقمي فوري، حفظ المستندات، وإدارة الملفات الأكاديمية بدقة تامة.' : 'Seamless enrollment, digital dossiers, and automated student profile management.',
          icon: Building2,
          badge: 'Admissions'
        },
        {
          title: lang === 'ar' ? 'الكنترول والشهادات' : 'Automated Grading',
          desc: lang === 'ar' ? 'حساب النتائج ورصد الدرجات وإصدار التقارير المعتمدة بضغطة زر دون أخطاء.' : 'Accurate curriculum-aligned grade sheets, report cards, and automated ranking.',
          icon: Award,
          badge: 'Exams'
        },
        {
          title: lang === 'ar' ? 'المالية والأقساط' : 'Tuition & Billing',
          desc: lang === 'ar' ? 'إدارة المصروفات، جدولة الأقساط، وإصدار الفواتير الإلكترونية المعتمدة آلياً.' : 'Automated installment schedules, electronic invoicing, and receipts.',
          icon: TrendingUp,
          badge: 'Billing'
        }
      ]
    },
    {
      id: 'parent-app',
      type: 'mobile',
      tag: 'Mobile Experience',
      title: lang === 'ar' ? 'تطبيق أولياء الأمور والمعلم' : 'Parent & Teacher Mobile App',
      subtitle: lang === 'ar' ? 'تواصل لحظي وتتبع مباشر يربط الأسرة باليوم الدراسي للطالب' : 'Real-time mobile updates connecting families with classroom life',
      numberAr: '٠٤',
      numberEn: '04',
      shortTitleAr: 'تطبيق أولياء الأمور',
      shortTitleEn: 'Parent Mobile App',
      heroImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop',
      thumbnailImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=200&auto=format&fit=crop',
      cards: [
        {
          title: lang === 'ar' ? 'إشعارات لحظية' : 'Live Notifications',
          desc: lang === 'ar' ? 'تنبيه فوري بحضور وغياب الطالب والواجبات اليومية والملاحظات السلوكية.' : 'Instant push notifications for attendance, homework, and behavioral updates.',
          icon: Sparkles,
          badge: 'Push Alerts'
        },
        {
          title: lang === 'ar' ? 'تتبع الحافلات المدرسية (GPS)' : 'Live Bus Tracking',
          desc: lang === 'ar' ? 'متابعة حية لمسار حافلة المدرسة ووقت الوصول لراحة واطمئنان أولياء الأمور.' : 'Live map tracking and arrival alerts for school bus routes.',
          icon: Bus,
          badge: 'GPS Active'
        },
        {
          title: lang === 'ar' ? 'سداد إلكتروني آمن' : 'Digital Payments',
          desc: lang === 'ar' ? 'دفع المصروفات المدرسية إلكترونياً بأمان تام مع استلام إيصال رسمي فوري.' : 'Secure card and gateway payments with automated digital receipts.',
          icon: CheckCircle2,
          badge: 'Pay Online'
        }
      ]
    },
    {
      id: 'academy',
      type: 'academy',
      tag: 'ROOTACA Academy',
      title: lang === 'ar' ? 'نظام أكاديمية ROOTACA' : 'ROOTACA Academy Platform',
      subtitle: lang === 'ar' ? 'إدارة مراكز التدريب، الكورسات، والشهادات المعتمدة' : 'Built for training centers, cohorts, curriculum & certification',
      numberAr: '٠٥',
      numberEn: '05',
      shortTitleAr: 'نظام أكاديمية ROOTACA',
      shortTitleEn: 'ROOTACA Academy',
      heroImage: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop',
      thumbnailImage: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=200&auto=format&fit=crop',
      cards: [
        {
          title: lang === 'ar' ? 'معامل البرمجة والروبوتات' : 'Coding & AI Tracks',
          desc: lang === 'ar' ? 'مناهج معتمدة في بايثون والروبوتات لتأهيل الطلاب بمهارات المستقبل.' : 'Hands-on tracks in Python, robotics, and future digital technologies.',
          icon: Cpu,
          badge: 'STEM'
        },
        {
          title: lang === 'ar' ? 'شهادات إلكترونية موثقة (QR)' : 'QR Certificates',
          desc: lang === 'ar' ? 'إصدار شهادات إتمام معتمدة بباركود موثوق لمنع التزييف وسهولة التحقق.' : 'Tamper-proof verifiable digital certificates with instant scan authentication.',
          icon: FileCheck,
          badge: 'Verified'
        },
        {
          title: lang === 'ar' ? 'إدارة المجموعات والقاعات' : 'Cohort Scheduling',
          desc: lang === 'ar' ? 'جدولة مواعيد المحاضرين وحجوزات القاعات ومتابعة اشتراكات المتدربين.' : 'Instructor timetables, room capacity allocation, and cohort CRM.',
          icon: GraduationCap,
          badge: 'Cohorts'
        }
      ]
    },
    {
      id: 'security',
      type: 'security',
      tag: 'Enterprise Security',
      title: lang === 'ar' ? 'الأمان والحوسبة السحابية' : 'Security & Cloud Reliability',
      subtitle: lang === 'ar' ? 'بنية سحابية موثوقة بنسبة تشغيل 99.9% وتشفير كامل' : '99.9% uptime SLA, automated backups and bank-grade data encryption',
      numberAr: '٠٦',
      numberEn: '06',
      shortTitleAr: 'الأمان والحوسبة السحابية',
      shortTitleEn: 'Security & Cloud',
      heroImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
      thumbnailImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=200&auto=format&fit=crop',
      cards: [
        {
          title: lang === 'ar' ? 'تشفير شامل للبيانات' : 'End-to-End Encryption',
          desc: lang === 'ar' ? 'تشفير كامل للبيانات أثناء النقل والتخزين بأعلى معايير الأمان المصرفية.' : 'Industry-standard AES-256 and TLS encryption for all data.',
          icon: Lock,
          badge: 'AES-256'
        },
        {
          title: lang === 'ar' ? 'نسخ احتياطي واستعادة فورية' : 'Automated Backups',
          desc: lang === 'ar' ? 'نسخ احتياطي يومي مستمر مع خطة استعادة فورية عند الطوارئ دون انقطاع.' : 'Multi-region automated snapshots with instant recovery guarantees.',
          icon: Cloud,
          badge: 'Daily'
        },
        {
          title: lang === 'ar' ? 'صلاحيات وأدوار دقيقة' : 'Granular Permissions',
          desc: lang === 'ar' ? 'تحكم كامل في صلاحيات كل موظف ومعلم ومدير لمنع أي وصول غير مصرح.' : 'Role-based access controls ensuring strict operational compliance.',
          icon: Shield,
          badge: 'RBAC'
        }
      ]
    },
    {
      id: 'roadmap',
      type: 'roadmap',
      tag: 'Rollout Roadmap',
      title: lang === 'ar' ? 'خطة التحول الرقمي' : 'Implementation Roadmap',
      subtitle: lang === 'ar' ? 'خطوات عملية واضحة من نقل البيانات والتدريب حتى الانطلاق الناجح' : 'Proven transition methodology: data migration, training to go-live',
      numberAr: '٠٧',
      numberEn: '07',
      shortTitleAr: 'خطة التحول الرقمي',
      shortTitleEn: 'Transformation Plan',
      heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop',
      thumbnailImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=200&auto=format&fit=crop',
      cards: [
        {
          title: lang === 'ar' ? 'استيراد البيانات بأمان' : 'Data Migration',
          desc: lang === 'ar' ? 'نقل سجلات الطلاب والمعلمين السابقة دون فقدان أو توقف لسير العمل المدرسي.' : 'Clean data extraction, validation, and zero-downtime historical import.',
          icon: Compass,
          badge: 'Phase 1'
        },
        {
          title: lang === 'ar' ? 'ورش عمل وتدريب الفريق' : 'Staff Workshops',
          desc: lang === 'ar' ? 'تدريب عملي متكامل للموظفين والمعلمين لضمان سهولة الاستخدام من اليوم الأول.' : 'Interactive hands-on coaching for administrators, accountants, and teachers.',
          icon: Users,
          badge: 'Phase 2'
        },
        {
          title: lang === 'ar' ? 'دعم مستمر 24/7' : '24/7 Dedicated Support',
          desc: lang === 'ar' ? 'فريق دعم محلي واستشاري مخصص لمتابعة احتياجات مدرستكم دوماً.' : 'Dedicated customer success manager and instant hotline assistance.',
          icon: ShieldCheck,
          badge: 'Phase 3'
        }
      ]
    },
    {
      id: 'closing',
      type: 'closing',
      tag: 'Next Steps',
      title: lang === 'ar' ? 'موعد العرض التجريبي' : 'Schedule Your Live Demo',
      subtitle: lang === 'ar' ? 'يسعدنا تنظيم جلسة تجريبية حية مخصصة لمجلس إدارة مدرستكم' : 'Let us tailor an interactive hands-on demo for your school leadership',
      numberAr: '٠٨',
      numberEn: '08',
      shortTitleAr: 'موعد العرض التجريبي',
      shortTitleEn: 'Schedule Live Demo',
      heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop',
      thumbnailImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=200&auto=format&fit=crop',
      cards: [
        {
          title: lang === 'ar' ? 'جلسة عرض حي (Live Demo)' : 'Live Interactive Demo',
          desc: lang === 'ar' ? 'تجربة المنظومة والتطبيقات عملياً على بيانات ونماذج مطابقة لمدرستكم.' : 'Live test-drive of web dashboards and parent apps tailored to your curriculum.',
          icon: Tv,
          badge: 'Interactive'
        },
        {
          title: lang === 'ar' ? 'دراسة جدوى وعرض مالي' : 'Feasibility & Proposal',
          desc: lang === 'ar' ? 'تقديم باقة تسعير مخصصة تناسب حجم المدرسة وعدد الطلاب بدقة.' : 'Transparent pricing package tailored specifically to your student capacity.',
          icon: CalendarCheck,
          badge: 'Financials'
        },
        {
          title: lang === 'ar' ? 'استشارات فنية مجانية' : 'Technical Consultation',
          desc: lang === 'ar' ? 'الإجابة على كافة المتطلبات التقنية واللوائح الرسمية الخاصة بمدرستكم.' : 'Direct Q&A with our education architecture and compliance engineers.',
          icon: Award,
          badge: 'Consulting'
        }
      ]
    }
  ];

  const currentSlide = masterSlides[currentIndex] || masterSlides[0];

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => Math.min(masterSlides.length - 1, prev + 1));
  }, [masterSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (dir === 'rtl') prevSlide();
        else nextSlide();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (dir === 'rtl') nextSlide();
        else prevSlide();
        e.preventDefault();
      } else if (e.key === ' ' || e.key === 'Enter') {
        nextSlide();
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        prevSlide();
        e.preventDefault();
      } else if (e.key === 'Home') {
        setCurrentIndex(0);
      } else if (e.key === 'End') {
        setCurrentIndex(masterSlides.length - 1);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'l') {
        setIsLaserActive(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir, nextSlide, prevSlide, onClose, masterSlides.length]);

  return (
    <div
      ref={containerRef}
      dir={dir}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[100] bg-[#F0F4F9] text-slate-800 flex flex-col justify-between overflow-hidden select-none font-sans antialiased ${
        isLaserActive ? 'cursor-none' : ''
      }`}
    >
      {/* Laser Pointer Dot */}
      {isLaserActive && (
        <div
          className="pointer-events-none fixed z-[200] w-5 h-5 rounded-full bg-rose-500/90 shadow-[0_0_15px_6px_rgba(244,63,94,0.7)] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
          style={{ left: laserPos.x, top: laserPos.y }}
        />
      )}

      {/* ======================================================== */}
      {/* 1. TOP HEADER (SaaS Light Dashboard Header)              */}
      {/* ======================================================== */}
      <header className="h-16 px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-2xs z-30">
        <div className="flex items-center gap-3.5">
          <img
            src="/rootaca-logo.png"
            alt="Rootaca"
            className="w-8 h-8 rounded-xl object-contain shadow-xs border border-slate-200"
          />
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm tracking-tight">
              Rootaca
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              {lang === 'ar' ? 'العرض التقديمي التنفيذي للمدارس' : 'Executive School Sales Deck'}
            </span>
          </div>

          {schoolName && (
            <span className="text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200/90 px-3 py-1 rounded-full ms-2 shadow-2xs">
              {schoolName}
            </span>
          )}
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5">
          {/* Presentation Timer */}
          <div
            onClick={() => setIsTimerRunning(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 cursor-pointer shadow-2xs transition"
            title={lang === 'ar' ? 'إيقاف / تشغيل مؤقت الاجتماع' : 'Pause / Resume Timer'}
          >
            <Timer className="w-3.5 h-3.5 text-cyan-600" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(l => (l === 'ar' ? 'en' : 'ar'))}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition"
            title="Toggle Language"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-pointer shadow-2xs transition"
            title={lang === 'ar' ? 'وضع ملء الشاشة' : 'Fullscreen'}
          >
            {isBrowserFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close / Exit Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
            title={lang === 'ar' ? 'إنهاء العرض (ESC)' : 'Exit (ESC)'}
          >
            <X className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إغلاق' : 'Close'}</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN PRESENTATION VIEWPORT (Canvas + Sidebar)        */}
      {/* ======================================================== */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 flex gap-4 lg:gap-5 overflow-hidden items-stretch relative">
        
        {/* ------------------------------------------------------ */}
        {/* MAIN SLIDE CANVAS (Center Stage - Expanded)            */}
        {/* ------------------------------------------------------ */}
        <section className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-5 sm:p-7 lg:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300">
          
          {/* TOP SECTION: Expanded Hero Visual & Title (Takes most space) */}
          <div className="flex-1 flex flex-col md:flex-row items-stretch justify-between gap-5 sm:gap-7 pb-3 min-h-0">
            
            {/* Title & Subtitle column */}
            <div className="w-full md:w-1/3 lg:w-5/12 flex flex-col justify-center space-y-3 shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-xs font-bold font-mono w-fit">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>{currentSlide.tag}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {currentSlide.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* EXPANDED HERO IMAGE: Takes up all the remaining width and height! */}
            <div className="flex-1 w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 relative group min-h-[250px] sm:min-h-[290px] lg:min-h-[340px]">
              <img
                src={currentSlide.heroImage}
                alt={currentSlide.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {/* Overlay Glass Badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-4 sm:p-5">
                <div className="flex items-center justify-between w-full text-white text-xs">
                  <span className="font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm sm:text-base font-bold">Rootaca Live Platform</span>
                  </span>
                  <span className="text-xs font-mono bg-cyan-500/40 text-cyan-100 px-3 py-1 rounded-lg border border-cyan-400/50 backdrop-blur-xs font-semibold">
                    2026 Enterprise Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: 3 Compact Cards (Reduced to half height) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 shrink-0 pt-2">
            {currentSlide.cards.map((card, cIdx) => {
              const Icon = card.icon;
              return (
                <div
                  key={cIdx}
                  className="rounded-2xl bg-gradient-to-b from-white to-[#F8FAFC] border border-slate-200/90 hover:border-cyan-400 shadow-xs hover:shadow-md transition-all duration-300 p-3.5 sm:p-4 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Compact Header: Icon badge + Title + Mini Tag */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-sm shadow-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight group-hover:text-cyan-700 transition leading-snug">
                          {card.title}
                        </h3>
                      </div>

                      <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded border border-cyan-200/80 shrink-0">
                        {card.badge || `#0${cIdx + 1}`}
                      </span>
                    </div>

                    {/* Compact Description */}
                    <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-medium line-clamp-2 mt-1">
                      {card.desc}
                    </p>
                  </div>

                  {/* Compact Bottom Verification */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'معتمد للمدارس' : 'School Certified'}</span>
                    </span>
                    <span className="font-mono text-[10px]">Rootaca Cloud</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------ */}
        {/* RIGHT SIDEBAR: CONTENTS (المحتويات - 8 شرائح)          */}
        {/* ------------------------------------------------------ */}
        <aside className="w-72 lg:w-80 bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-4 sm:p-5 flex flex-col justify-between shrink-0 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600" />
              <span>
                {lang === 'ar'
                  ? `المحتويات (${masterSlides.length} شرائح)`
                  : `Contents (${masterSlides.length} Slides)`}
              </span>
            </h2>
            <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
              Deck 2026
            </span>
          </div>

          {/* Slide List with Real Thumbnails matching reference */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pe-1 py-1">
            {masterSlides.map((slide, sIdx) => {
              const isActive = sIdx === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(sIdx)}
                  className={`w-full text-start p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isActive
                      ? 'bg-cyan-50/90 border-cyan-500 text-cyan-950 font-bold shadow-xs'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {lang === 'ar' ? slide.numberAr : slide.numberEn}
                    </span>
                    <span className="text-xs truncate font-semibold">
                      {lang === 'ar' ? slide.shortTitleAr : slide.shortTitleEn}
                    </span>
                  </div>

                  {/* Thumbnail Image inside List Item (As in user reference image) */}
                  {slide.thumbnailImage && (
                    <img
                      src={slide.thumbnailImage}
                      alt={slide.shortTitleAr}
                      className="w-8 h-6 rounded-md object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Down Chevron Button (As in reference image) */}
          <div className="pt-2 border-t border-slate-100 flex justify-center">
            <button
              onClick={nextSlide}
              disabled={currentIndex === masterSlides.length - 1}
              className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition cursor-pointer disabled:opacity-20"
              title={lang === 'ar' ? 'الشريحة التالية' : 'Next slide'}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </aside>
      </main>

      {/* ======================================================== */}
      {/* 3. BOTTOM FLOATING CONTROL PILL (As in reference image)  */}
      {/* ======================================================== */}
      <footer className="h-16 flex items-center justify-center shrink-0 pb-3 pointer-events-none z-40">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-300/40 rounded-full px-4 py-2 flex items-center gap-3">
          
          {/* Previous Arrow */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
            title={lang === 'ar' ? 'السابق' : 'Previous'}
          >
            {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Next Arrow */}
          <button
            onClick={nextSlide}
            disabled={currentIndex === masterSlides.length - 1}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
            title={lang === 'ar' ? 'التالي' : 'Next'}
          >
            {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Slide Counter */}
          <div className="text-xs font-bold text-slate-700 font-mono px-2">
            {lang === 'ar'
              ? `شريحة ${currentIndex + 1} من ${masterSlides.length}`
              : `Slide ${currentIndex + 1} of ${masterSlides.length}`}
          </div>

          <div className="w-px h-5 bg-slate-200" />

          {/* Laser Pointer Tool */}
          <button
            onClick={() => setIsLaserActive(prev => !prev)}
            className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isLaserActive
                ? 'bg-cyan-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={lang === 'ar' ? 'مؤشر الليزر التفاعلي (L)' : 'Interactive Laser Pointer (L)'}
          >
            <MousePointer className="w-4 h-4" />
          </button>

          {/* Pen / Highlighter Tool */}
          <button
            onClick={() => setIsLaserActive(prev => !prev)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title={lang === 'ar' ? 'قلم العرض' : 'Presentation Pen'}
          >
            <PenTool className="w-4 h-4" />
          </button>

          {/* Timer Toggle */}
          <button
            onClick={() => setIsTimerRunning(prev => !prev)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title={lang === 'ar' ? 'المؤقت الزمني' : 'Timer'}
          >
            <Timer className="w-4 h-4" />
          </button>

          {/* Fullscreen Tool */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title={lang === 'ar' ? 'تكبير ملء الشاشة' : 'Fullscreen'}
          >
            <Tv className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
