import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SlideMultiImagesView, parseSlideImages } from './SlideMultiImagesView';
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
  Smartphone,
  Send,
  Phone,
  Mail,
  User,
  Globe
} from 'lucide-react';
import { PresentationDto, ProductInterest } from '../../types';
import { api } from '../../services/api';
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
  isPublicMode?: boolean;
  shareToken?: string;
  expiresAtUtc?: string;
}

export const ExecutivePresentationView: React.FC<ExecutivePresentationViewProps> = ({
  presentation,
  initialSlideIndex = 0,
  onClose,
  schoolName,
  defaultLanguage,
  isPublicMode = false,
  shareToken,
  expiresAtUtc
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
  const [showMobileContents, setShowMobileContents] = useState(false);
  const [mobileActiveCard, setMobileActiveCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live Countdown Timer for Public Presentation Link Expiration
  const effectiveExpiresAt = expiresAtUtc || (presentation as any)?.expiresAtUtc || (presentation as any)?.shareTokenExpiresAtUtc;
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!effectiveExpiresAt) {
      setCountdown(null);
      return;
    }

    const compute = () => {
      const target = new Date(effectiveExpiresAt).getTime();
      const diff = Math.floor((target - Date.now()) / 1000);
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true });
        return;
      }
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setCountdown({ days, hours, minutes, seconds, totalSeconds: diff, isExpired: false });
    };

    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [effectiveExpiresAt]);

  // Demo Inquiry Modal State for Public Viewers
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({
    schoolName: schoolName || presentation?.schoolName || '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    jobTitle: '',
    message: '',
    interestedProduct: 'Both' as ProductInterest,
    honeypot: ''
  });
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSuccessMsg, setDemoSuccessMsg] = useState<string | null>(null);
  const [demoErrorMsg, setDemoErrorMsg] = useState<string | null>(null);

  // Slide duration tracking in public mode
  const slideStartTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    slideStartTimeRef.current = Date.now();
    return () => {
      if (isPublicMode && shareToken) {
        const duration = Math.round((Date.now() - slideStartTimeRef.current) / 1000);
        if (duration > 0) {
          const sid = sessionStorage.getItem('sdc_pres_sid') || 'anon';
          api.recordPublicViewEvent(shareToken, {
            sessionId: sid,
            slideIndex: currentIndex,
            durationSeconds: Math.min(duration, 300),
            isDemoCtaClick: false,
            language: lang
          }).catch(() => {});
        }
      }
    };
  }, [currentIndex, isPublicMode, shareToken, lang]);

  const handleOpenDemoModal = () => {
    setIsDemoModalOpen(true);
    if (isPublicMode && shareToken) {
      const sid = sessionStorage.getItem('sdc_pres_sid') || 'anon';
      api.recordPublicViewEvent(shareToken, {
        sessionId: sid,
        slideIndex: currentIndex,
        durationSeconds: 0,
        isDemoCtaClick: true,
        language: lang
      }).catch(() => {});
    }
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareToken) return;
    setDemoSubmitting(true);
    setDemoErrorMsg(null);
    setDemoSuccessMsg(null);

    try {
      const res = await api.submitPublicInquiry(shareToken, demoForm);
      if (res.success) {
        setDemoSuccessMsg(lang === 'ar' ? res.data?.messageAr || 'تم استلام طلبكم بنجاح!' : res.data?.messageEn || 'Inquiry submitted successfully!');
      } else {
        setDemoErrorMsg(res.message || 'حدث خطأ أثناء إرسال الطلب.');
      }
    } catch (err: any) {
      setDemoErrorMsg(err.message || 'تعذر إرسال الطلب.');
    } finally {
      setDemoSubmitting(false);
    }
  };

  // Reset active card on slide change
  useEffect(() => {
    setMobileActiveCard(0);
  }, [currentIndex]);

  // Mobile swipe gestures: calibrated to prevent accidental wobble / unintended flipping
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const touchEndYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Do not intercept swipe inside horizontally scrollable areas, buttons, or inputs
    if (target.closest('.overflow-x-auto') || target.closest('button') || target.closest('input') || target.closest('textarea')) {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      return;
    }
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
    touchEndXRef.current = null;
    touchEndYRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    touchEndXRef.current = e.targetTouches[0].clientX;
    touchEndYRef.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diffX = touchStartXRef.current - touchEndXRef.current;
    const diffY = (touchStartYRef.current ?? 0) - (touchEndYRef.current ?? 0);

    // Only switch slide if:
    // 1. Horizontal movement is substantial (at least 80px)
    // 2. Horizontal movement is significantly greater than vertical movement (ratio > 1.8) to distinguish from vertical scrolling
    if (Math.abs(diffX) > 80 && Math.abs(diffX) > Math.abs(diffY) * 1.8) {
      if (diffX > 0) {
        if (dir === 'rtl') prevSlide();
        else nextSlide();
      } else {
        if (dir === 'rtl') nextSlide();
        else prevSlide();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchEndXRef.current = null;
    touchEndYRef.current = null;
  };

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

  // 12 Curated Master Slides matching user's complete ROOTACA school structure & OpenAI high-res imagery
  const effectiveSchoolName = schoolName || (lang === 'ar' ? 'مدرستكم' : 'Your School');

  const masterSlides: SlideItem[] = [
    // 01 — Welcome to [School Name]
    {
      id: 'welcome',
      type: 'school-identity',
      tag: 'School Identity',
      title: lang === 'ar' ? `مرحبًا بكم في ${effectiveSchoolName}` : `Welcome to ${effectiveSchoolName}`,
      subtitle: lang === 'ar' ? 'مدرستكم أولًا — نبذة تعريفية ورؤية ورسالة وترحيب مخصص بمدرستكم الكريمة' : 'Your School First — Dedicated introduction, campus overview, vision & mission',
      numberAr: '٠١',
      numberEn: '01',
      shortTitleAr: `مرحبًا بكم في ${effectiveSchoolName}`,
      shortTitleEn: `Welcome to ${effectiveSchoolName}`,
      heroImage: 'https://images.openai.com/static-rsc-4/zdIDzNsblg48nKskjWY0_bFTW8ewWu95dun81z_7NT6IEXSyKdPkQwLFr1fDaVm1eCEdpE4SVwcPU-C2-FtkqFYaZmH6fTt-XjoeQWpKDxjFfxnHfEmNL3PokOXyfKB-ei8YndVmfmykjvvJylNzRnuYZX4ekdj3T640nzNujM0?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/zdIDzNsblg48nKskjWY0_bFTW8ewWu95dun81z_7NT6IEXSyKdPkQwLFr1fDaVm1eCEdpE4SVwcPU-C2-FtkqFYaZmH6fTt-XjoeQWpKDxjFfxnHfEmNL3PokOXyfKB-ei8YndVmfmykjvvJylNzRnuYZX4ekdj3T640nzNujM0?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'الهوية والصرح التعليمي' : 'School Identity & Campus',
          desc: lang === 'ar' ? 'اسم المدرسة وشعارها وتاريخها ومبناها التعليمي العريق.' : 'School crest, official identity, and modern educational campus.',
          icon: Building2,
          badge: '01'
        },
        {
          title: lang === 'ar' ? 'الرؤية والرسالة والمراحل' : 'Vision, Mission & Stages',
          desc: lang === 'ar' ? 'نبذة تعريفية شاملة عن المراحل الأكاديمية ورسالة المدرسة السامية.' : 'Comprehensive overview of academic stages and core vision.',
          icon: GraduationCap,
          badge: '02'
        },
        {
          title: lang === 'ar' ? 'رسالة ترحيبية مخصصة' : 'Personalized Welcome',
          desc: lang === 'ar' ? 'تحية تقدير خاصة لمجلس إدارة المدرسة وفريقها القيادي.' : 'Dedicated welcome message honoring school leadership and educators.',
          icon: Sparkles,
          badge: '03'
        }
      ]
    },
    // 02 — Why We Chose Your School
    {
      id: 'why-your-school',
      type: 'school-identity',
      tag: 'School Identity',
      title: lang === 'ar' ? 'لماذا اخترنا مدرستكم؟' : 'Why We Chose Your School',
      subtitle: (() => {
        if (effectiveSchoolName.toLowerCase().includes('helsinki') || effectiveSchoolName.includes('هلسنكي')) {
          return lang === 'ar' ? 'التركيز على تجربة أولياء الأمور وتطوير قنوات التواصل والخدمات الرقمية لمدرستكم' : 'Focusing on parent experience and digital communication channels for your school';
        }
        if (effectiveSchoolName.toLowerCase().includes('alyan') || effectiveSchoolName.includes('عليان')) {
          return lang === 'ar' ? 'تطوير نظام إدارة العمليات المدرسية الشامل وربط الخدمات بأكاديمية روتاكا للبرمجة' : 'Advancing school operations management integrated with Rootaca tech academy';
        }
        if (effectiveSchoolName.toLowerCase().includes('smart') || effectiveSchoolName.includes('الذكية')) {
          return lang === 'ar' ? 'الانتقال السلس من مجرد نظام LMS محدود إلى منظومة إدارة مدرسية ومجتمعية شاملة' : 'Seamless transition from basic LMS to an enterprise school ecosystem';
        }
        return lang === 'ar' ? 'تقدير مكانة المدرسة واهتمامها بالريادة التعليمية والتطوير التكنولوجي' : 'Appreciating your educational standing and passion for technology & growth';
      })(),
      numberAr: '٠٢',
      numberEn: '02',
      shortTitleAr: 'لماذا اخترنا مدرستكم؟',
      shortTitleEn: 'Why We Chose Your School',
      heroImage: 'https://images.openai.com/static-rsc-4/dPg-qhYNO7PpNud9v0fcw3b1EX-szY5YEzDwuADzjPqMFkfReeKSRdOBLvh997D51cqGUfVFbTTE7xIBa1ASJjc1G-CCrZnLhKEzTgymaQYH2YXDGJcYNDRGvGHUWfWDaAT9D6N5uzKmXB4ZZ4f7XEmHiIdjngOxPI2qJ6RKktY?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/dPg-qhYNO7PpNud9v0fcw3b1EX-szY5YEzDwuADzjPqMFkfReeKSRdOBLvh997D51cqGUfVFbTTE7xIBa1ASJjc1G-CCrZnLhKEzTgymaQYH2YXDGJcYNDRGvGHUWfWDaAT9D6N5uzKmXB4ZZ4f7XEmHiIdjngOxPI2qJ6RKktY?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'تميز لفت انتباهنا' : 'What Caught Our Attention',
          desc: lang === 'ar' ? 'إنجازات المدرسة الأكاديمية وحرصها الدائم على تقديم تجربة استثنائية.' : 'Outstanding achievements and commitment to modern learning.',
          icon: Award,
          badge: 'Standing'
        },
        {
          title: lang === 'ar' ? 'فرصة تعاون حقيقية' : 'Real Partnership Opportunity',
          desc: lang === 'ar' ? 'تطابق استراتيجي بين طموحات المدرسة وقدراتنا التقنية وحلولنا السحابية.' : 'Perfect strategic alignment between your goals and our solutions.',
          icon: Target,
          badge: 'Synergy'
        },
        {
          title: lang === 'ar' ? 'تمكين رؤية المدرسة' : 'Empowering Your Vision',
          desc: lang === 'ar' ? 'تسخير أحدث أدوات التكنولوجيا لتكون مدرستكم سباقة في منطقتها.' : 'Leveraging next-gen cloud tools to keep your school ahead.',
          icon: Lightbulb,
          badge: 'Vision'
        }
      ]
    },
    // 03 — About SmartDevCo
    {
      id: 'about-smartdevco',
      type: 'ecosystem',
      tag: 'SmartDevCo Ecosystem',
      title: lang === 'ar' ? 'من نحن؟ شركة SmartDevCo' : 'About SmartDevCo',
      subtitle: lang === 'ar' ? 'شركة متخصصة في الحلول الرقمية، تطوير الأنظمة والتطبيقات وحلول SaaS والتحول الرقمي' : 'Specialized engineering house for enterprise SaaS, mobile solutions & cloud transformation',
      numberAr: '٠٣',
      numberEn: '03',
      shortTitleAr: 'من نحن؟ SmartDevCo',
      shortTitleEn: 'About SmartDevCo',
      heroImage: 'https://images.openai.com/static-rsc-4/5PZD-ABLe7DXcpbKcZboKvivy0RHRkPHtlGbFT7nu_Jie2hjV1eh7yOcdvoxMZF4j_GCpfuYZptWZvAwvfMqaRuBg2THaoE8VCfP_FqZZljXvBT33Hwi5kC01TaGVQEFHrKFAhnG68RmdZ1QnPy-nru8-eTl-xOdsbh5cTXBKu0?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/5PZD-ABLe7DXcpbKcZboKvivy0RHRkPHtlGbFT7nu_Jie2hjV1eh7yOcdvoxMZF4j_GCpfuYZptWZvAwvfMqaRuBg2THaoE8VCfP_FqZZljXvBT33Hwi5kC01TaGVQEFHrKFAhnG68RmdZ1QnPy-nru8-eTl-xOdsbh5cTXBKu0?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'تطوير الأنظمة والتطبيقات' : 'Custom Software & Mobile Apps',
          desc: lang === 'ar' ? 'بناء أنظمة برمجية متطورة وتطبيقات تفاعلية للهواتف والويب بأعلى المعايير.' : 'Engineering robust web platforms and native mobile apps.',
          icon: Cpu,
          badge: 'Engineering'
        },
        {
          title: lang === 'ar' ? 'حلول SaaS والتحول الرقمي' : 'Enterprise SaaS & Cloud',
          desc: lang === 'ar' ? 'منصات سحابية متكاملة تقود المؤسسات نحو الأتمتة الكاملة والاستغناء عن الورقيات.' : 'Comprehensive cloud suites automating end-to-end workflows.',
          icon: Cloud,
          badge: 'SaaS'
        },
        {
          title: lang === 'ar' ? 'بنية مترابطة وقابلة للتوسع' : 'Scalable Architecture',
          desc: lang === 'ar' ? 'خبرة عميقة في هندسة حلول تخدم آلاف المستخدمين والطلاب بكفاءة وسرعة فائقة.' : 'Architectures designed to scale effortlessly to tens of thousands of users.',
          icon: TrendingUp,
          badge: 'Scalability'
        }
      ]
    },
    // 04 — Introducing ROOTACA SMS
    {
      id: 'introducing-rootaca',
      type: 'ecosystem',
      tag: 'SmartDevCo Ecosystem',
      title: lang === 'ar' ? 'نقدم لكم ROOTACA Smart School' : 'Introducing ROOTACA SMS',
      subtitle: lang === 'ar' ? 'نظام متكامل لإدارة العمليات المدرسية، شؤون الطلاب، الكنترول، وتطبيقات المجتمع المدرسي' : 'Unified core platform for school operations, admissions, curriculum, exams & finance',
      numberAr: '٠٤',
      numberEn: '04',
      shortTitleAr: 'منظومة ROOTACA SMS',
      shortTitleEn: 'ROOTACA SMS Platform',
      heroImage: 'https://images.openai.com/static-rsc-4/0J5dGgUpa5AyEy-dMF1oPnj1cqpvQ-EXHG3nXf8DuEdn5ktKPYhbKjlU9475_jDcV5u0QhNycbR5LNPa5OQYfqkWPTtp19GuaEKmesW2OG1Gvyoon-oxEiK_KmJ0SIMorgBfDTj0wxl_UJBDeyOYFD0koU1VuCPITPX5pfrd8pM?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/0J5dGgUpa5AyEy-dMF1oPnj1cqpvQ-EXHG3nXf8DuEdn5ktKPYhbKjlU9475_jDcV5u0QhNycbR5LNPa5OQYfqkWPTtp19GuaEKmesW2OG1Gvyoon-oxEiK_KmJ0SIMorgBfDTj0wxl_UJBDeyOYFD0koU1VuCPITPX5pfrd8pM?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'تطبيقات الطلاب وأولياء الأمور' : 'Parent & Student Mobile Apps',
          desc: lang === 'ar' ? 'متابعة الحضور والغياب، الواجبات، السداد الإلكتروني، والدرجات فوريًا.' : 'Push notifications for attendance, homework, exams, and tuition fees.',
          icon: Smartphone,
          badge: 'Mobile'
        },
        {
          title: lang === 'ar' ? 'تطبيقات المعلمين والمشرفين' : 'Teacher & Staff Workflows',
          desc: lang === 'ar' ? 'رصد الغياب، تسجيل الملاحظات اليومية، وخطة الدروس والجداول في ثوانٍ.' : 'Instant attendance marking, lesson planning, and direct grading.',
          icon: Users,
          badge: 'Staff'
        },
        {
          title: lang === 'ar' ? 'لوحة تحكم إدارة المدرسة' : 'Central Admin Dashboard',
          desc: lang === 'ar' ? 'متابعة لحظية ومؤشرات أداء شاملة لجميع الأقسام والعمليات المدرسية.' : 'Real-time school pulse, analytics, tuition tracking, and control.',
          icon: BarChart3,
          badge: 'Dashboard'
        }
      ]
    },
    // 05 — One Connected School Community (4 Cards: Parent, Student, Supervisor, Teacher)
    {
      id: 'connected-community',
      type: 'ecosystem',
      tag: 'SmartDevCo Ecosystem',
      title: '.One School. One Connected Experience',
      subtitle: lang === 'ar' ? 'مدرسة واحدة.. تجربة رقمية مترابطة' : 'A unified digital platform connecting parents, students, teachers & supervisors',
      numberAr: '٠٥',
      numberEn: '05',
      shortTitleAr: 'مدرسة واحدة.. تجربة مترابطة',
      shortTitleEn: 'Connected Experience',
      heroImage: JSON.stringify([
        { url: '/slides/connected-parent.png', title: 'Parent', subtitle: 'تجربة ولي الأمر', caption: 'Parent' },
        { url: '/slides/connected-student.png', title: 'Student', subtitle: 'تجربة الطالب', caption: 'Student' },
        { url: '/slides/connected-supervisor.png', title: 'Supervisor', subtitle: 'أدوات المشرف', caption: 'Supervisor' },
        { url: '/slides/connected-teacher.png', title: 'Teacher', subtitle: 'بيئة عمل المعلم', caption: 'Teacher' }
      ]),
      thumbnailImage: '/slides/connected-parent.png',
      cards: [
        {
          title: lang === 'ar' ? 'تجربة ولي الأمر' : 'Parent Experience',
          desc: lang === 'ar' ? 'متابعة لحظية وتواصل فوري وتجربة شفافة لولي الأمر.' : 'Continuous transparency empowering parents with peace of mind.',
          icon: Users,
          badge: 'Parent'
        },
        {
          title: lang === 'ar' ? 'تجربة الطالب' : 'Student Experience',
          desc: lang === 'ar' ? 'بوابة تعليمية متطورة وسهلة الاستخدام تصل الطالب بكل خدماته.' : 'Interactive digital learning environment built for modern learners.',
          icon: GraduationCap,
          badge: 'Student'
        },
        {
          title: lang === 'ar' ? 'المعلم والمشرف الأكاديمي' : 'Educator & Supervisor Sync',
          desc: lang === 'ar' ? 'بيئة تعاونية تقلل الأعباء الروتينية ليركز المعلم على جودة التعليم.' : 'Eliminating administrative drag so teachers focus on education.',
          icon: Target,
          badge: 'Staff'
        }
      ]
    },
    // 06 — ROOTACA Academy
    {
      id: 'rootaca-academy',
      type: 'ecosystem',
      tag: 'SmartDevCo Ecosystem',
      title: lang === 'ar' ? 'أكاديمية روتاكا ROOTACA Academy' : 'ROOTACA Academy',
      subtitle: lang === 'ar' ? 'تعليم البرمجة والتكنولوجيا وتنمية مهارات التفكير المنطقي وحل المشكلات لطلاب المدرسة' : 'Empowering school students with coding, AI, and logical problem-solving skills',
      numberAr: '٠٦',
      numberEn: '06',
      shortTitleAr: 'أكاديمية روتاكا',
      shortTitleEn: 'ROOTACA Academy',
      heroImage: 'https://images.openai.com/static-rsc-4/TywsGedcNPLComAkQPUNDNkW8jU0z44kVRbqMGJzrXbG45v_4P9J2TT18firAO0kP_qMdlY_xb9aEtfzGXSAVZnazA3YJuq4MI9V7GnAhC0uP9vZtsjURCPScXXSTQfTQrYlkMi4D1WIgQcNb9Hlbok_UpDRgTTaIYdWV8MVF1c?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/TywsGedcNPLComAkQPUNDNkW8jU0z44kVRbqMGJzrXbG45v_4P9J2TT18firAO0kP_qMdlY_xb9aEtfzGXSAVZnazA3YJuq4MI9V7GnAhC0uP9vZtsjURCPScXXSTQfTQrYlkMi4D1WIgQcNb9Hlbok_UpDRgTTaIYdWV8MVF1c?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'تعليم البرمجة وتكنولوجيا المستقبل' : 'Coding & Future Tech',
          desc: lang === 'ar' ? 'مناهج تفاعلية حديثة في علوم الحاسب والروبوت والذكاء الاصطناعي للأجيال القادمة.' : 'Engaging curricula in computer science, robotics, and generative AI.',
          icon: Rocket,
          badge: 'Curriculum'
        },
        {
          title: lang === 'ar' ? 'التفكير المنطقي وحل المشكلات' : 'Computational Logic',
          desc: lang === 'ar' ? 'بناء عقلية هندسية ومهارات تحليلية تساعد الطالب في مسيرته الدراسية والحياتية.' : 'Fostering analytical problem-solving and algorithmic thinking.',
          icon: Lightbulb,
          badge: 'Skills'
        },
        {
          title: lang === 'ar' ? 'معسكرات وبرامج لطلاب المدرسة' : 'Tailored Student Cohorts',
          desc: lang === 'ar' ? 'إمكانية إطلاق برامج إثرائية ومسابقات برمجية حصرية باسم مدرستكم الكريمة.' : 'Exclusive training tracks, hackathons, and certifications for your students.',
          icon: Award,
          badge: 'Cohorts'
        }
      ]
    },
    // 07 — Technology & Security
    {
      id: 'tech-security',
      type: 'proposal',
      tag: 'SmartDevCo Ecosystem',
      title: lang === 'ar' ? 'أمان من البداية.. وبنية سحابية جاهزة للتوسع' : 'Secure by Design. Built for the Cloud.',
      subtitle: lang === 'ar' ? "Your School's Data. Your School's Environment. بيانات مدرستكم في بيئة تشغيل مستقلة" : "Your School's Data. Your School's Environment. Enterprise multi-tenant isolation",
      numberAr: '٠٧',
      numberEn: '07',
      shortTitleAr: 'الأمان والبنية السحابية',
      shortTitleEn: 'Technology & Security',
      heroImage: 'https://images.openai.com/static-rsc-4/7UlmiSHdaQgDZD8fdVMRkCuN3CjeU0TcblPvCxGrOmlrNgq1MNNgO0kb64p68n-UaVgOrThlUviTl7mX8_toPyzmkDhe6v_Ql2WwUJfmyCIMq2xEobe2JGOr1IkSgdjCJHt-jamQ8I7JDMza_GLM3NNRd8hyANMFgqdVoUqHXiM?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/7UlmiSHdaQgDZD8fdVMRkCuN3CjeU0TcblPvCxGrOmlrNgq1MNNgO0kb64p68n-UaVgOrThlUviTl7mX8_toPyzmkDhe6v_Ql2WwUJfmyCIMq2xEobe2JGOr1IkSgdjCJHt-jamQ8I7JDMza_GLM3NNRd8hyANMFgqdVoUqHXiM?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'بنية سحابية وحماية البيانات' : 'Cloud Infra & Data Protection',
          desc: lang === 'ar' ? 'بنية سحابية تتيح الوصول من أي مكان مع تشفير متكامل للبيانات (AES-256).' : 'Cloud-native architecture with end-to-end encryption at-rest & in-transit.',
          icon: ShieldCheck,
          badge: 'Security'
        },
        {
          title: lang === 'ar' ? 'تحكم دقيق بالصلاحيات' : 'Role-Based Access Control',
          desc: lang === 'ar' ? 'كل مستخدم يصل فقط إلى الوظائف والبيانات المسموح له بها وفق دوره الوظيفي.' : 'Granular permission sets strictly aligned with organizational roles.',
          icon: Lock,
          badge: 'Permissions'
        },
        {
          title: lang === 'ar' ? 'عزل البيانات والمراقبة المستمرة' : 'Data Isolation & Uptime',
          desc: lang === 'ar' ? 'قاعدة بيانات وبيئة تشغيل مستقلة لكل مدرسة مع مراقبة أداء وتوافر 99.9%.' : 'Dedicated tenant database isolation with 24/7 reliability monitoring.',
          icon: Cloud,
          badge: 'Isolation'
        }
      ]
    },
    // 08 — Challenges We Solve
    {
      id: 'challenges-solve',
      type: 'proposal',
      tag: 'Partnership Proposal',
      title: lang === 'ar' ? 'إيه المشكلات اللي هنحلها؟' : 'Challenges We Solve',
      subtitle: lang === 'ar' ? 'نربط كل تحدٍ تشغيلي وإداري بحل رقمي فعلي وملموس داخل النظام' : 'Connecting everyday operational hurdles to automated, reliable system solutions',
      numberAr: '٠٨',
      numberEn: '08',
      shortTitleAr: 'المشكلات والحلول',
      shortTitleEn: 'Challenges We Solve',
      heroImage: 'https://images.openai.com/static-rsc-4/ab34Yop7EJs2B4RTctRE-UWvR-JSQD6A_o7kB-l3sSuMkihIUtwogUBehat5mcMkz4tbcHWG2RvkeZUWqksSBMI9fmwnZbEMIXOxDVu92DbE6AN_XZFBjOaBLaWl6m3SE_ZlbRby9oWPDOjlsjQDFVU6hF_DcU0PFXcc8OWP6e8?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/ab34Yop7EJs2B4RTctRE-UWvR-JSQD6A_o7kB-l3sSuMkihIUtwogUBehat5mcMkz4tbcHWG2RvkeZUWqksSBMI9fmwnZbEMIXOxDVu92DbE6AN_XZFBjOaBLaWl6m3SE_ZlbRby9oWPDOjlsjQDFVU6hF_DcU0PFXcc8OWP6e8?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'تشتت البيانات والملفات' : 'Data Fragmentation',
          desc: lang === 'ar' ? 'إنهاء الاعتماد على ملفات إكسل المتفرقة وتوحيد سجلات الطلاب في قاعدة واحدة.' : 'Eliminating scattered sheets by consolidating records into one single source of truth.',
          icon: BarChart3,
          badge: 'Unified'
        },
        {
          title: lang === 'ar' ? 'صعوبة التواصل والمتابعة' : 'Parent Communication Friction',
          desc: lang === 'ar' ? 'تجاوز ضعف التواصل التقليدي عبر إشعارات فورية ورسائل موثقة على الهاتف.' : 'Instant push notifications replacing paper notes and delayed phone calls.',
          icon: Smartphone,
          badge: 'Real-Time'
        },
        {
          title: lang === 'ar' ? 'الإجراءات اليدوية المتكررة' : 'Manual Administrative Drag',
          desc: lang === 'ar' ? 'أتمتة رصد الغياب والشهادات والأقساط وتوفير ساعات عمل يومية للإدارة.' : 'Automating grading, fees, and attendance to save hundreds of work hours.',
          icon: Clock,
          badge: 'Automation'
        }
      ]
    },
    // 09 — What We Bring to Your School
    {
      id: 'what-we-bring',
      type: 'proposal',
      tag: 'Partnership Proposal',
      title: lang === 'ar' ? 'إيه اللي هنقدمه لمدرستكم؟' : 'What We Bring to Your School',
      subtitle: lang === 'ar' ? 'تعاون مستمر وشراكة استراتيجية ممتدة وليس مجرد بيع برنامج جاهز' : 'An enduring strategic partnership, not an off-the-shelf software license',
      numberAr: '٠٩',
      numberEn: '09',
      shortTitleAr: 'ما سنقدمه لمدرستكم',
      shortTitleEn: 'What We Bring',
      heroImage: 'https://images.openai.com/static-rsc-4/bZY2cn8Pzra9Wm_Syxrbkwd0LWjJefABwCdEBmJorkZjt8E08qesjSWgWG-HBNUO6MG3TEwXQNaLq9Qh-YlNrZ8UcJM-wtarYLuYYvj3ON1ZDwwM2IZGJQoisVUsrNLswAiK9Qs-CQQVfizQDnAjDL-vny8NOWYRpxqAABT0ZAs?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/bZY2cn8Pzra9Wm_Syxrbkwd0LWjJefABwCdEBmJorkZjt8E08qesjSWgWG-HBNUO6MG3TEwXQNaLq9Qh-YlNrZ8UcJM-wtarYLuYYvj3ON1ZDwwM2IZGJQoisVUsrNLswAiK9Qs-CQQVfizQDnAjDL-vny8NOWYRpxqAABT0ZAs?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'تخصيص الهوية البصرية' : 'Brand Customization',
          desc: lang === 'ar' ? 'منظومة وتطبيقات تحمل اسم وشعار وألوان مدرستكم الكريمة بشكل رسمي.' : 'Web portal and mobile apps fully skinned with your school crest and identity.',
          icon: Building2,
          badge: 'Branding'
        },
        {
          title: lang === 'ar' ? 'إعداد وتشغيل وتدريب شامل' : 'Turnkey Setup & Training',
          desc: lang === 'ar' ? 'نقل البيانات وتجهيز النظام وورش تدريبية تفاعلية لكل معلم وموظف.' : 'Historical data migration, role-based hands-on training workshops.',
          icon: GraduationCap,
          badge: 'Onboarding'
        },
        {
          title: lang === 'ar' ? 'دعم فني وتطوير مستمر' : '24/7 Support & Evolution',
          desc: lang === 'ar' ? 'فريق دعم محلي مرافق وتحديثات دورية تلبي متطلباتكم المستقبلية دائمًا.' : 'Dedicated local support team and continuous roadmap enhancements.',
          icon: ShieldCheck,
          badge: 'Continuous'
        }
      ]
    },
    // 10 — The Value of Partnership
    {
      id: 'value-partnership',
      type: 'proposal',
      tag: 'Partnership Proposal',
      title: lang === 'ar' ? 'إيه المكسب اللي هتحققه المدرسة من الشراكة؟' : 'The Value of Partnership',
      subtitle: lang === 'ar' ? 'تحسين تجربة ولي الأمر والطالب، تقليل المجهود الإداري، ودعم صورة المدرسة التنافسية' : 'Elevating parent satisfaction, slashing administrative effort, and fueling school prestige',
      numberAr: '١٠',
      numberEn: '10',
      shortTitleAr: 'مكاسب الشراكة والقيمة',
      shortTitleEn: 'Value of Partnership',
      heroImage: 'https://images.openai.com/static-rsc-4/iBKCCvMSUO9PWSpcRIDnoYAQUUfNy2r9O3F5AhbZUXoBayGYj2zrWk2aEB82SWJXEyBIhf6NXhVux_hvl_5jDnRLCLYEd3EREvPlNLHjOhIARXpX8cWQoVi2CQUZOKvI5SK-vzyQhH4AS5DlayndzkKb2wZnn5Btv-eQ_zG9LO4GoHzDuRd5VIerfKnclTFZ?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/iBKCCvMSUO9PWSpcRIDnoYAQUUfNy2r9O3F5AhbZUXoBayGYj2zrWk2aEB82SWJXEyBIhf6NXhVux_hvl_5jDnRLCLYEd3EREvPlNLHjOhIARXpX8cWQoVi2CQUZOKvI5SK-vzyQhH4AS5DlayndzkKb2wZnn5Btv-eQ_zG9LO4GoHzDuRd5VIerfKnclTFZ?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'رضا أولياء الأمور والطلاب' : 'Parent & Student Delight',
          desc: lang === 'ar' ? 'تجربة رقمية رفيعة المستوى تعزز ولاء الأسر ومشاركتهم الإيجابية مع المدرسة.' : 'Superior user experience that builds parent trust and community loyalty.',
          icon: Sparkles,
          badge: 'Experience'
        },
        {
          title: lang === 'ar' ? 'وفر كبير في الوقت والتكاليف' : 'Time & Operational Savings',
          desc: lang === 'ar' ? 'خفض استهلاك الورق والمطبوعات وتقليص ساعات المهام الإدارية الروتينية.' : 'Substantial reduction in paper costs and hours spent on manual tracking.',
          icon: TrendingUp,
          badge: 'ROI'
        },
        {
          title: lang === 'ar' ? 'ريادة رقمية وشريك للمستقبل' : 'Digital Prestige & Future Partner',
          desc: lang === 'ar' ? 'ترسيخ مكانة مدرستكم كصرح تعليمي حديث يواكب أرقى المعايير العالمية.' : 'Positioning your school as an innovative, digitally empowered beacon.',
          icon: Award,
          badge: 'Prestige'
        }
      ]
    },
    // 11 — Your School's Digital Growth Roadmap
    {
      id: 'growth-roadmap',
      type: 'proposal',
      tag: 'Partnership Proposal',
      title: lang === 'ar' ? `خارطة طريق التحول الرقمي لمدرسة ${effectiveSchoolName}` : `Digital Growth Roadmap for ${effectiveSchoolName}`,
      subtitle: lang === 'ar' ? 'خمس مراحل واضحة ومدروسة للتعاون لضمان انطلاق سلس وناجح ومستدام' : 'Five structured collaboration milestones ensuring smooth deployment and lasting success',
      numberAr: '١١',
      numberEn: '11',
      shortTitleAr: 'خارطة طريق النمو الرقمي',
      shortTitleEn: 'Digital Growth Roadmap',
      heroImage: 'https://images.openai.com/static-rsc-4/5PZD-ABLe7DXcpbKcZboKvivy0RHRkPHtlGbFT7nu_Jie2hjV1eh7yOcdvoxMZF4j_GCpfuYZptWZvAwvfMqaRuBg2THaoE8VCfP_FqZZljXvBT33Hwi5kC01TaGVQEFHrKFAhnG68RmdZ1QnPy-nru8-eTl-xOdsbh5cTXBKu0?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/5PZD-ABLe7DXcpbKcZboKvivy0RHRkPHtlGbFT7nu_Jie2hjV1eh7yOcdvoxMZF4j_GCpfuYZptWZvAwvfMqaRuBg2THaoE8VCfP_FqZZljXvBT33Hwi5kC01TaGVQEFHrKFAhnG68RmdZ1QnPy-nru8-eTl-xOdsbh5cTXBKu0?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'المرحلة ١: الاستكشاف وتحديد الاحتياجات' : 'Phase 1: Needs Discovery',
          desc: lang === 'ar' ? 'جلسة معمقة لفهم دورات العمل الخاصة بمدرستكم وتحديد الوحدات المطلوبة.' : 'Detailed session to assess your operational workflows and modules.',
          icon: Compass,
          badge: 'Step 1'
        },
        {
          title: lang === 'ar' ? 'المرحلة ٢: التخصيص واستيراد البيانات' : 'Phase 2: Customization & Migration',
          desc: lang === 'ar' ? 'تجهيز الهوية البصرية ونقل سجلات الطلاب السابقة بأمان ودقة تامة.' : 'Setting up school branding and securely importing historical student data.',
          icon: Building2,
          badge: 'Step 2'
        },
        {
          title: lang === 'ar' ? 'المرحلة ٣: التدريب والإطلاق والدعم' : 'Phase 3: Launch & Continuous SLA',
          desc: lang === 'ar' ? 'تدريب الفريق والإطلاق الرسمي مع تقديم دعم فني واستشارات متواصلة.' : 'Staff workshops, smooth go-live supervision, and ongoing SLA support.',
          icon: CheckCircle2,
          badge: 'Step 3'
        }
      ]
    },
    // 12 — Thank You, [School Name]
    {
      id: 'thank-you',
      type: 'closing',
      tag: 'Closing',
      title: lang === 'ar' ? `شكرًا لإدارة ${effectiveSchoolName}` : `Thank You, ${effectiveSchoolName}`,
      subtitle: lang === 'ar' ? "Let's Build a Smarter School Together — شكر خاص لإدارة المدرسة على وقتها واهتمامها، ونتطلع لفرصة التعاون" : "Let's Build a Smarter School Together — Sincere gratitude to school leadership; looking forward to partnering",
      numberAr: '١٢',
      numberEn: '12',
      shortTitleAr: `شكرًا لمدرستكم`,
      shortTitleEn: `Thank You`,
      heroImage: 'https://images.openai.com/static-rsc-4/ssCrEsti-ICEippNp6uki73r5hsDJbsq25hIGGNaFMelDoV2wsFaUwsFeBYFEPbL9gA_IDINz7493P2CN_Az9xgi4z1lv_gulem6MZyZaXGrw7DIxJZTOXu8rEiH3OkESKB0-3PtkY7Bc3k3IDGmMeoeRd-jAxLXlu32TIPrSDE?purpose=inline',
      thumbnailImage: 'https://images.openai.com/static-rsc-4/ssCrEsti-ICEippNp6uki73r5hsDJbsq25hIGGNaFMelDoV2wsFaUwsFeBYFEPbL9gA_IDINz7493P2CN_Az9xgi4z1lv_gulem6MZyZaXGrw7DIxJZTOXu8rEiH3OkESKB0-3PtkY7Bc3k3IDGmMeoeRd-jAxLXlu32TIPrSDE?purpose=inline',
      cards: [
        {
          title: lang === 'ar' ? 'شكر خاص لإدارة المدرسة' : 'Appreciation to Leadership',
          desc: lang === 'ar' ? 'نثمن وقتكم واهتمامكم بالاطلاع على حلولنا لتطوير صرحكم التعليمي.' : 'Deep thanks to school leadership for their time, vision, and engagement.',
          icon: Award,
          badge: 'Gratitude'
        },
        {
          title: lang === 'ar' ? 'حجز جلسة العرض الحي (Demo)' : 'Schedule Live Demo Session',
          desc: lang === 'ar' ? 'استعراض عملي للمنظومة والتطبيقات بنماذج بيانات مخصصة لمدرستكم.' : 'Interactive walkthrough with live test data simulating your school operations.',
          icon: Tv,
          badge: 'Demo'
        },
        {
          title: lang === 'ar' ? 'الخطوة التالية والتواصل' : 'Next Collaborative Step',
          desc: lang === 'ar' ? 'يسعدنا تلقي استفساراتكم وبدء التنسيق المشترك للانطلاق الرقمي.' : 'Ready to answer all technical questions and initiate seamless onboarding.',
          icon: CalendarCheck,
          badge: 'Next Step'
        }
      ]
    }
  ];

  // Dynamically resolve presentation slides if provided, else use masterSlides
  const resolvedSlides: SlideItem[] = React.useMemo(() => {
    if (presentation?.slides && presentation.slides.length > 0) {
      const FALLBACK_SLIDE_IMAGES = [
        'https://images.openai.com/static-rsc-4/zdIDzNsblg48nKskjWY0_bFTW8ewWu95dun81z_7NT6IEXSyKdPkQwLFr1fDaVm1eCEdpE4SVwcPU-C2-FtkqFYaZmH6fTt-XjoeQWpKDxjFfxnHfEmNL3PokOXyfKB-ei8YndVmfmykjvvJylNzRnuYZX4ekdj3T640nzNujM0?purpose=inline',
        'https://images.openai.com/static-rsc-4/dPg-qhYNO7PpNud9v0fcw3b1EX-szY5YEzDwuADzjPqMFkfReeKSRdOBLvh997D51cqGUfVFbTTE7xIBa1ASJjc1G-CCrZnLhKEzTgymaQYH2YXDGJcYNDRGvGHUWfWDaAT9D6N5uzKmXB4ZZ4f7XEmHiIdjngOxPI2qJ6RKktY?purpose=inline',
        'https://images.openai.com/static-rsc-4/5PZD-ABLe7DXcpbKcZboKvivy0RHRkPHtlGbFT7nu_Jie2hjV1eh7yOcdvoxMZF4j_GCpfuYZptWZvAwvfMqaRuBg2THaoE8VCfP_FqZZljXvBT33Hwi5kC01TaGVQEFHrKFAhnG68RmdZ1QnPy-nru8-eTl-xOdsbh5cTXBKu0?purpose=inline',
        'https://images.openai.com/static-rsc-4/0J5dGgUpa5AyEy-dMF1oPnj1cqpvQ-EXHG3nXf8DuEdn5ktKPYhbKjlU9475_jDcV5u0QhNycbR5LNPa5OQYfqkWPTtp19GuaEKmesW2OG1Gvyoon-oxEiK_KmJ0SIMorgBfDTj0wxl_UJBDeyOYFD0koU1VuCPITPX5pfrd8pM?purpose=inline',
        JSON.stringify([
          { url: '/slides/connected-parent.png', title: 'Parent', subtitle: 'تجربة ولي الأمر', caption: 'Parent' },
          { url: '/slides/connected-student.png', title: 'Student', subtitle: 'تجربة الطالب', caption: 'Student' },
          { url: '/slides/connected-supervisor.png', title: 'Supervisor', subtitle: 'أدوات المشرف', caption: 'Supervisor' },
          { url: '/slides/connected-teacher.png', title: 'Teacher', subtitle: 'بيئة عمل المعلم', caption: 'Teacher' }
        ]),
        'https://images.openai.com/static-rsc-4/TywsGedcNPLComAkQPUNDNkW8jU0z44kVRbqMGJzrXbG45v_4P9J2TT18firAO0kP_qMdlY_xb9aEtfzGXSAVZnazA3YJuq4MI9V7GnAhC0uP9vZtsjURCPScXXSTQfTQrYlkMi4D1WIgQcNb9Hlbok_UpDRgTTaIYdWV8MVF1c?purpose=inline',
        'https://images.openai.com/static-rsc-4/7UlmiSHdaQgDZD8fdVMRkCuN3CjeU0TcblPvCxGrOmlrNgq1MNNgO0kb64p68n-UaVgOrThlUviTl7mX8_toPyzmkDhe6v_Ql2WwUJfmyCIMq2xEobe2JGOr1IkSgdjCJHt-jamQ8I7JDMza_GLM3NNRd8hyANMFgqdVoUqHXiM?purpose=inline',
        'https://images.openai.com/static-rsc-4/ab34Yop7EJs2B4RTctRE-UWvR-JSQD6A_o7kB-l3sSuMkihIUtwogUBehat5mcMkz4tbcHWG2RvkeZUWqksSBMI9fmwnZbEMIXOxDVu92DbE6AN_XZFBjOaBLaWl6m3SE_ZlbRby9oWPDOjlsjQDFVU6hF_DcU0PFXcc8OWP6e8?purpose=inline',
        'https://images.openai.com/static-rsc-4/bZY2cn8Pzra9Wm_Syxrbkwd0LWjJefABwCdEBmJorkZjt8E08qesjSWgWG-HBNUO6MG3TEwXQNaLq9Qh-YlNrZ8UcJM-wtarYLuYYvj3ON1ZDwwM2IZGJQoisVUsrNLswAiK9Qs-CQQVfizQDnAjDL-vny8NOWYRpxqAABT0ZAs?purpose=inline',
        'https://images.openai.com/static-rsc-4/iBKCCvMSUO9PWSpcRIDnoYAQUUfNy2r9O3F5AhbZUXoBayGYj2zrWk2aEB82SWJXEyBIhf6NXhVux_hvl_5jDnRLCLYEd3EREvPlNLHjOhIARXpX8cWQoVi2CQUZOKvI5SK-vzyQhH4AS5DlayndzkKb2wZnn5Btv-eQ_zG9LO4GoHzDuRd5VIerfKnclTFZ?purpose=inline',
        'https://images.openai.com/static-rsc-4/5PZD-ABLe7DXcpbKcZboKvivy0RHRkPHtlGbFT7nu_Jie2hjV1eh7yOcdvoxMZF4j_GCpfuYZptWZvAwvfMqaRuBg2THaoE8VCfP_FqZZljXvBT33Hwi5kC01TaGVQEFHrKFAhnG68RmdZ1QnPy-nru8-eTl-xOdsbh5cTXBKu0?purpose=inline',
        'https://images.openai.com/static-rsc-4/ssCrEsti-ICEippNp6uki73r5hsDJbsq25hIGGNaFMelDoV2wsFaUwsFeBYFEPbL9gA_IDINz7493P2CN_Az9xgi4z1lv_gulem6MZyZaXGrw7DIxJZTOXu8rEiH3OkESKB0-3PtkY7Bc3k3IDGmMeoeRd-jAxLXlu32TIPrSDE?purpose=inline'
      ];

      return presentation.slides.map((s, idx) => {
        const arabicNum = (idx + 1).toLocaleString('ar-EG', { minimumIntegerDigits: 2 });
        const englishNum = String(idx + 1).padStart(2, '0');
        
        let title = lang === 'ar' ? (s.slideTitleAr || s.slideTitleEn) : (s.slideTitleEn || s.slideTitleAr);
        let subtitle = lang === 'ar' ? (s.contentAr || s.contentEn) : (s.contentEn || s.contentAr);

        // Replace placeholder [School Name] or [اسم المدرسة]
        title = title.replace(/\[School Name\]/gi, effectiveSchoolName).replace(/\[اسم المدرسة\]/gi, effectiveSchoolName);
        subtitle = subtitle.replace(/\[School Name\]/gi, effectiveSchoolName).replace(/\[اسم المدرسة\]/gi, effectiveSchoolName);

        // Apply school specific angle on Slide 2 if not already customized
        if (s.displayOrder === 2 || idx === 1) {
          if (effectiveSchoolName.toLowerCase().includes('helsinki') || effectiveSchoolName.includes('هلسنكي')) {
            subtitle = lang === 'ar' ? 'التركيز على تجربة أولياء الأمور وتطوير قنوات التواصل والخدمات الرقمية للمدرسة.' : 'Focusing on parent experience and digital communication channels for the school.';
          } else if (effectiveSchoolName.toLowerCase().includes('alyan') || effectiveSchoolName.includes('عليان')) {
            subtitle = lang === 'ar' ? 'تطوير نظام إدارة العمليات المدرسية الشامل وربط الخدمات بأكاديمية روتاكا للبرمجة.' : 'Advancing school operations management integrated with Rootaca tech academy.';
          } else if (effectiveSchoolName.toLowerCase().includes('smart') || effectiveSchoolName.includes('الذكية')) {
            subtitle = lang === 'ar' ? 'الانتقال السلس من مجرد نظام LMS محدود إلى منظومة إدارة مدرسية ومجتمعية شاملة.' : 'Seamless transition from basic LMS to an enterprise school ecosystem.';
          }
        }

        let cardsList: SlideCardItem[] = [];
        try {
          const rawPoints = lang === 'ar'
            ? (s.keyPointsArJson || s.keyPointsEnJson)
            : (s.keyPointsEnJson || s.keyPointsArJson);
          if (rawPoints) {
            const parsed = JSON.parse(rawPoints);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const iconMap = [Target, Rocket, Lightbulb, BarChart3, Users, Clock, Building2, Award, TrendingUp, ShieldCheck, GraduationCap, Smartphone];
              cardsList = parsed.map((p: string, pIdx: number) => {
                const cleanedPoint = p.replace(/\[School Name\]/gi, effectiveSchoolName).replace(/\[اسم المدرسة\]/gi, effectiveSchoolName);
                return {
                  title: cleanedPoint,
                  desc: '',
                  icon: iconMap[(idx * 3 + pIdx) % iconMap.length],
                  badge: `0${pIdx + 1}`
                };
              });
            }
          }
        } catch {
          // ignore parsing error
        }

        if (cardsList.length === 0) {
          cardsList = [
            {
              title: title,
              desc: subtitle,
              icon: Building2,
              badge: String(s.category || 'Rootaca')
            }
          ];
        }

        const parsedHero = parseSlideImages(s.imageUrl, FALLBACK_SLIDE_IMAGES[idx % FALLBACK_SLIDE_IMAGES.length]);
        const effectiveHero = s.imageUrl || FALLBACK_SLIDE_IMAGES[idx % FALLBACK_SLIDE_IMAGES.length];
        const effectiveThumb = parsedHero[0]?.url || FALLBACK_SLIDE_IMAGES[idx % FALLBACK_SLIDE_IMAGES.length];

        return {
          id: s.id || `slide-${idx}`,
          type: String(s.category || 'slide').toLowerCase(),
          tag: String(s.category || 'Rootaca'),
          title,
          subtitle,
          numberAr: arabicNum,
          numberEn: englishNum,
          shortTitleAr: s.slideTitleAr ? s.slideTitleAr.replace(/\[School Name\]/gi, effectiveSchoolName).replace(/\[اسم المدرسة\]/gi, effectiveSchoolName) : title,
          shortTitleEn: s.slideTitleEn ? s.slideTitleEn.replace(/\[School Name\]/gi, effectiveSchoolName).replace(/\[اسم المدرسة\]/gi, effectiveSchoolName) : title,
          heroImage: effectiveHero,
          thumbnailImage: effectiveThumb,
          cards: cardsList
        };
      });
    }

    return masterSlides;
  }, [presentation, lang, effectiveSchoolName]);

  const currentSlide = resolvedSlides[currentIndex] || resolvedSlides[0];

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => Math.min(resolvedSlides.length - 1, prev + 1));
  }, [resolvedSlides.length]);

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
        setCurrentIndex(resolvedSlides.length - 1);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'l') {
        setIsLaserActive(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir, nextSlide, prevSlide, onClose, resolvedSlides.length]);

  return (
    <div
      ref={containerRef}
      dir={dir}
      onMouseMove={handleMouseMove}
      style={{ touchAction: 'pan-y' }}
      className={`fixed inset-0 z-[100] bg-[#F0F4F9] text-slate-800 flex flex-col justify-between overflow-hidden select-none font-sans antialiased w-full max-w-full overscroll-none ${
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
      <header className="h-13 sm:h-16 px-2 sm:px-5 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-2xs z-30 gap-1.5 sm:gap-3 overflow-hidden w-full max-w-full">
        
        {/* LEFT / START: Logo & Brand Identity */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink overflow-hidden max-w-[45%] sm:max-w-none">
          <a
            href="https://sms.rootaca.com"
            target="_blank"
            rel="noreferrer"
            title="Rootaca (https://sms.rootaca.com)"
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition cursor-pointer shrink-0"
          >
            <img
              src="/rootaca-logo.png"
              alt="Rootaca"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-contain shadow-xs border border-slate-200 shrink-0"
            />
            <span className="font-black text-slate-900 text-xs sm:text-sm tracking-tight hidden sm:inline shrink-0">
              Rootaca
            </span>
          </a>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-xs font-semibold text-slate-500 hidden xl:inline truncate">
            {lang === 'ar' ? 'العرض التقديمي التنفيذي للمدارس' : 'Executive School Sales Deck'}
          </span>

          {schoolName && (
            <span className="text-[10px] sm:text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200/90 px-2 py-0.5 rounded-full shadow-2xs truncate max-w-[90px] sm:max-w-[150px] hidden lg:inline">
              {schoolName}
            </span>
          )}
        </div>

        {/* RIGHT / END: Top Controls & Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-0">
          
          {/* Mobile Contents Toggle */}
          <button
            onClick={() => setShowMobileContents(prev => !prev)}
            className="flex lg:hidden items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-xl text-xs font-bold cursor-pointer transition shrink-0"
            title={lang === 'ar' ? 'قائمة الشرائح' : 'Slide Contents'}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden lg:inline ms-1">{lang === 'ar' ? 'المحتويات' : 'Slides'}</span>
          </button>

          {/* Presentation Timer or Public Link Expiration Countdown */}
          {isPublicMode ? (
            countdown ? (
              <div
                className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-[10px] sm:text-xs font-mono font-bold shadow-2xs transition-all shrink-0 ${
                  countdown.isExpired
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : countdown.totalSeconds < 3600
                    ? 'bg-rose-50/90 border-rose-300 text-rose-800 animate-pulse'
                    : countdown.totalSeconds < 86400
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-cyan-50 border-cyan-200 text-[#00838F]'
                }`}
                title={lang === 'ar' ? 'الوقت المتبقي حتى انتهاء صلاحية هذا الرابط العام' : 'Remaining time before link expires'}
              >
                <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${countdown.totalSeconds < 3600 && !countdown.isExpired ? 'text-rose-600 animate-spin' : 'text-cyan-600'} shrink-0`} />
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <span className="text-[10px] font-sans font-bold text-slate-500 hidden xl:inline">
                    {lang === 'ar' ? 'متبقي:' : 'Expires:'}
                  </span>
                  {countdown.isExpired ? (
                    <span className="text-rose-600 font-sans font-black text-[10px] sm:text-xs">
                      {lang === 'ar' ? 'انتهت الصلاحية' : 'Expired'}
                    </span>
                  ) : (
                    <span className="tracking-wide text-[10px] sm:text-xs">
                      {countdown.days > 0 && (
                        <span className="me-0.5 sm:me-1">
                          {countdown.days}
                          <span className="text-[9px] font-sans font-normal text-slate-500 ms-0.5">
                            {lang === 'ar' ? 'ي' : 'd'}
                          </span>
                        </span>
                      )}
                      <span>{String(countdown.hours).padStart(2, '0')}</span>
                      <span className="animate-pulse text-cyan-600">:</span>
                      <span>{String(countdown.minutes).padStart(2, '0')}</span>
                      <span className="animate-pulse text-cyan-600">:</span>
                      <span className="text-cyan-800 font-black">{String(countdown.seconds).padStart(2, '0')}</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 shadow-2xs shrink-0"
                title={lang === 'ar' ? 'هذا الرابط دائم ولا تنتهي صلاحيته' : 'Permanent Link'}
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-sans text-emerald-700">
                  {lang === 'ar' ? 'الرابط: دائم' : 'Link: Permanent'}
                </span>
              </div>
            )
          ) : (
            <div
              onClick={() => setIsTimerRunning(prev => !prev)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] sm:text-xs font-mono font-bold text-slate-700 cursor-pointer shadow-2xs transition shrink-0"
              title={lang === 'ar' ? 'إيقاف / تشغيل مؤقت الاجتماع' : 'Pause / Resume Timer'}
            >
              <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-600 shrink-0" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLang(l => (l === 'ar' ? 'en' : 'ar'))}
            className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] sm:text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition shrink-0"
            title="Toggle Language"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Fullscreen Button - Hidden on mobile/tablet (< lg) to prevent header overflow */}
          <button
            onClick={toggleFullscreen}
            className="hidden lg:flex items-center justify-center p-1.5 sm:p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-pointer shadow-2xs transition shrink-0"
            title={lang === 'ar' ? 'وضع ملء الشاشة' : 'Fullscreen'}
          >
            {isBrowserFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Action CTA / Close Button */}
          {isPublicMode ? (
            <button
              onClick={handleOpenDemoModal}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 bg-[#00B4D8] hover:bg-cyan-600 text-white rounded-xl text-[11px] sm:text-xs font-black shadow-sm cursor-pointer transition shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'طلب موعد ديمو' : 'Request Demo'}</span>
              <span className="sm:hidden">{lang === 'ar' ? 'ديمو' : 'Demo'}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[11px] sm:text-xs font-bold cursor-pointer transition shadow-2xs shrink-0"
              title={lang === 'ar' ? 'إنهاء العرض (ESC)' : 'Exit (ESC)'}
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'إغلاق' : 'Close'}</span>
            </button>
          )}
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN PRESENTATION VIEWPORT (Canvas + Sidebar)        */}
      {/* ======================================================== */}
      <main 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 p-2 sm:p-4 lg:p-6 flex gap-4 lg:gap-5 overflow-hidden items-stretch relative min-h-0 w-full max-w-full"
      >
        
        {/* ------------------------------------------------------ */}
        {/* MAIN SLIDE CANVAS (Center Stage - Expanded)            */}
        {/* ------------------------------------------------------ */}
        {(() => {
          const parsedHeroImages = parseSlideImages(currentSlide.heroImage);

          return (
            <section className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-3.5 sm:p-6 lg:p-8 flex flex-col justify-start md:justify-between relative overflow-y-auto overflow-x-hidden transition-all duration-300 pb-24 md:pb-8 w-full max-w-full min-w-0">
              {/* TOP SECTION: Title & Subtitle + Hero Visual */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-6 pb-2 min-h-0 shrink-0">
                
                {/* Title & Subtitle column */}
                <div className="w-full md:w-1/3 lg:w-5/12 flex flex-col justify-center space-y-1.5 sm:space-y-3 shrink-0">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-[11px] sm:text-xs font-bold font-mono w-fit">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{currentSlide.tag}</span>
                  </div>

                  <h1 className="text-xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {currentSlide.title}
                  </h1>

                  <p className="text-xs sm:text-sm lg:text-base text-slate-500 font-medium leading-relaxed line-clamp-2 md:line-clamp-none">
                    {currentSlide.subtitle}
                  </p>
                </div>

                {/* EXPANDED HERO VISUAL: Supports 1, 2, 3 or 4 dynamic split images - Image fills 100% to border */}
                <div className="w-full md:flex-1 aspect-[4/3] sm:aspect-[16/10] md:aspect-auto min-h-[260px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[440px] xl:min-h-[500px] max-h-[520px] lg:max-h-[600px] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden relative group shrink-0 flex flex-col">
                  <SlideMultiImagesView
                    images={parsedHeroImages}
                    altTitle={currentSlide.title}
                    className="w-full h-full flex-1 min-h-0"
                  />
                </div>
              </div>

          {/* BOTTOM SECTION: 3 Cards */}
          <div className="mt-2.5 pt-1.5 shrink-0">
            {/* ---------------------------------------------------- */}
            {/* MOBILE ONLY: Ultra-Clean Executive Interactive Cards */}
            {/* ---------------------------------------------------- */}
            <div className="flex md:hidden flex-col gap-2.5">
              {/* Card Switcher Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar scroll-smooth">
                {currentSlide.cards.map((card, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => setMobileActiveCard(cIdx)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center whitespace-nowrap shrink-0 cursor-pointer ${
                      mobileActiveCard === cIdx
                        ? 'bg-white text-cyan-800 shadow-xs border border-slate-200 font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {card.title}
                  </button>
                ))}
              </div>

              {/* Active Mobile Card Display */}
              {(() => {
                const activeCard = currentSlide.cards[mobileActiveCard] || currentSlide.cards[0];
                const Icon = activeCard.icon;
                return (
                  <div className="rounded-2xl bg-gradient-to-b from-white to-[#F8FAFC] border-2 border-cyan-500/30 p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-[#00B4D8] text-white flex items-center justify-center shadow-sm shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight line-clamp-2">
                              {activeCard.title}
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 inline-block mt-0.5">
                              {activeCard.badge || `#0${mobileActiveCard + 1}`}
                            </span>
                          </div>
                        </div>

                        {/* Navigation dots */}
                        <div className="flex items-center gap-1 shrink-0">
                          {currentSlide.cards.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              onClick={() => setMobileActiveCard(dotIdx)}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                mobileActiveCard === dotIdx ? 'w-4 bg-cyan-500' : 'w-2 bg-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium mt-2">
                        {activeCard.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'معتمد للمدارس' : 'School Certified'}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setMobileActiveCard(prev => Math.max(0, prev - 1))}
                          disabled={mobileActiveCard === 0}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 disabled:opacity-30 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          {dir === 'rtl' ? '›' : '‹'}
                        </button>
                        <button
                          onClick={() => setMobileActiveCard(prev => Math.min(currentSlide.cards.length - 1, prev + 1))}
                          disabled={mobileActiveCard === currentSlide.cards.length - 1}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 disabled:opacity-30 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          {dir === 'rtl' ? '‹' : '›'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ---------------------------------------------------- */}
            {/* DESKTOP ONLY: Full 3-Column Grid                     */}
            {/* ---------------------------------------------------- */}
            <div className="hidden md:grid md:grid-cols-3 gap-3 lg:gap-4 pb-1">
              {currentSlide.cards.map((card, cIdx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={cIdx}
                    className="rounded-2xl bg-gradient-to-b from-white to-[#F8FAFC] border border-slate-200/90 hover:border-cyan-400 shadow-xs hover:shadow-md transition-all duration-300 p-3.5 sm:p-4 flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-sm shadow-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight group-hover:text-cyan-700 transition leading-snug">
                            {card.title}
                          </h3>
                        </div>

                        <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded border border-cyan-200/80 shrink-0">
                          {card.badge || `#0${cIdx + 1}`}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 mt-1">
                        {card.desc}
                      </p>
                    </div>

                    {/* Bottom verification */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-400">
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
            </div>
          </section>
        );
      })()}

        {/* ------------------------------------------------------ */}
        {/* RIGHT SIDEBAR: CONTENTS (المحتويات - 8 شرائح)          */}
        {/* Desktop: standard aside, Mobile: overlay drawer       */}
        {/* ------------------------------------------------------ */}
        {/* Mobile Backdrop */}
        {showMobileContents && (
          <div
            className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
            onClick={() => setShowMobileContents(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 ${dir === 'rtl' ? 'start-0' : 'end-0'} z-50 w-72 sm:w-80 bg-white shadow-2xl p-4 flex flex-col justify-between transition-transform duration-200 lg:static lg:z-auto lg:w-72 lg:w-80 lg:rounded-3xl lg:border lg:border-slate-200/90 lg:shadow-xl lg:shadow-slate-200/60 lg:p-4 sm:lg:p-5 lg:translate-x-0 ${
            showMobileContents ? 'translate-x-0' : 'hidden lg:flex'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600" />
              <span>
                {lang === 'ar'
                  ? `المحتويات (${resolvedSlides.length} شرائح)`
                  : `Contents (${resolvedSlides.length} Slides)`}
              </span>
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                Deck 2026
              </span>
              <button
                onClick={() => setShowMobileContents(false)}
                className="p-1 text-slate-400 hover:text-slate-700 lg:hidden cursor-pointer"
                aria-label="Close contents"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slide List with Real Thumbnails matching reference */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pe-1 py-1">
            {resolvedSlides.map((slide, sIdx) => {
              const isActive = sIdx === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => {
                    setCurrentIndex(sIdx);
                    setShowMobileContents(false);
                  }}
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
              disabled={currentIndex === resolvedSlides.length - 1}
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
      <footer className="h-16 flex items-center justify-center shrink-0 pb-3 pointer-events-none z-40 px-3">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-300/40 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 max-w-[95vw]">
          
          {/* Previous Arrow */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
            title={lang === 'ar' ? 'السابق' : 'Previous'}
          >
            {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Next Arrow */}
          <button
            onClick={nextSlide}
            disabled={currentIndex === resolvedSlides.length - 1}
            className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
            title={lang === 'ar' ? 'التالي' : 'Next'}
          >
            {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Slide Counter */}
          <div className="text-[11px] sm:text-xs font-bold text-slate-700 font-mono px-1 sm:px-2 whitespace-nowrap">
            {lang === 'ar'
              ? `شريحة ${currentIndex + 1} من ${resolvedSlides.length}`
              : `Slide ${currentIndex + 1} of ${resolvedSlides.length}`}
          </div>

          {/* Desktop Presenter Tools (Hidden on mobile for clean remote experience) */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-px h-5 bg-slate-200 mx-1" />

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
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 4. PUBLIC DEMO INQUIRY MODAL                             */}
      {/* ======================================================== */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto" dir={dir}>
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {lang === 'ar' ? 'طلب عرض توضيحي (Live Demo)' : 'Request a Live Demo'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ar' ? 'جلسة مخصصة لمجلس إدارة مدرستكم' : 'Tailored for your school leadership'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {demoSuccessMsg ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900">
                    {lang === 'ar' ? 'تم استلام طلبكم بنجاح!' : 'Inquiry Received!'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed px-4">
                    {demoSuccessMsg}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    setDemoSuccessMsg(null);
                  }}
                  className="px-6 py-2 bg-[#00B4D8] hover:bg-cyan-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {lang === 'ar' ? 'العودة للعرض' : 'Back to Presentation'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3.5 text-xs">
                {demoErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {demoErrorMsg}
                  </div>
                )}

                {/* Honeypot field for bot suppression */}
                <input
                  type="text"
                  name="user_token_auth"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  value={demoForm.honeypot}
                  onChange={e => setDemoForm(f => ({ ...f, honeypot: e.target.value }))}
                />

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    {lang === 'ar' ? 'اسم المدرسة / المؤسسة التعليمية *' : 'School / Institution Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={demoForm.schoolName}
                    onChange={e => setDemoForm(f => ({ ...f, schoolName: e.target.value }))}
                    placeholder={lang === 'ar' ? 'مثال: مدارس الأندلس الدولية' : 'e.g. Al-Andalus Academy'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00B4D8]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      {lang === 'ar' ? 'اسم المسؤول أو المنسق *' : 'Contact Person Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={demoForm.contactName}
                      onChange={e => setDemoForm(f => ({ ...f, contactName: e.target.value }))}
                      placeholder={lang === 'ar' ? 'الاسم الثلاثي' : 'Full Name'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00B4D8]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      {lang === 'ar' ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={demoForm.contactPhone}
                      onChange={e => setDemoForm(f => ({ ...f, contactPhone: e.target.value }))}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00B4D8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      {lang === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                    </label>
                    <input
                      type="text"
                      value={demoForm.jobTitle}
                      onChange={e => setDemoForm(f => ({ ...f, jobTitle: e.target.value }))}
                      placeholder={lang === 'ar' ? 'مثال: مدير المدرسة / المدير الأكاديمي' : 'e.g. Principal / IT Director'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00B4D8]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={demoForm.contactEmail}
                      onChange={e => setDemoForm(f => ({ ...f, contactEmail: e.target.value }))}
                      placeholder="school@example.com"
                      dir="ltr"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00B4D8]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    {lang === 'ar' ? 'النظام المطلوب' : 'Interested Product'}
                  </label>
                  <select
                    value={demoForm.interestedProduct}
                    onChange={e => setDemoForm(f => ({ ...f, interestedProduct: e.target.value as ProductInterest }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00B4D8]"
                  >
                    <option value="SmartSchool">{lang === 'ar' ? 'نظام المدارس ROOTACA Smart School' : 'ROOTACA Smart School'}</option>
                    <option value="Academy">{lang === 'ar' ? 'منظومة الأكاديميات ROOTACA Academy' : 'ROOTACA Academy'}</option>
                    <option value="Both">{lang === 'ar' ? 'كلا النظامين (Smart School & Academy)' : 'Both Platforms'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">
                    {lang === 'ar' ? 'ملاحظات أو أسئلة إضافية' : 'Additional Notes / Message'}
                  </label>
                  <textarea
                    rows={2}
                    value={demoForm.message}
                    onChange={e => setDemoForm(f => ({ ...f, message: e.target.value }))}
                    placeholder={lang === 'ar' ? 'أي تفاصيل عن موعد مناسب أو متطلبات خاصة بمدرستكم...' : 'Any specific requirements or preferred time...'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-[#00B4D8]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(false)}
                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={demoSubmitting}
                    className="px-6 py-2.5 bg-[#00B4D8] hover:bg-cyan-600 text-white font-black rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{demoSubmitting ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (lang === 'ar' ? 'تأكيد إرسال الطلب' : 'Submit Demo Request')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Public Link Expired Overlay */}
      {isPublicMode && countdown?.isExpired && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none" dir={dir}>
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-slate-900">
                {lang === 'ar' ? 'انتهت صلاحية رابط هذا العرض' : 'This Presentation Link Has Expired'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {lang === 'ar'
                  ? 'لقد انتهت المدة المحددة لمشاركة هذا العرض التقديمي. يسعدنا تواصلكم لطلب عرض تفاعلي جديد لمدرستكم أو تجديد الرابط.'
                  : 'The validity period for this presentation share link has expired. You may request a new custom demo below.'}
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleOpenDemoModal}
                className="w-full py-3 px-4 bg-[#00B4D8] hover:bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'ar' ? 'طلب موعد ديمو جديد لمدرستنا' : 'Request a Custom Demo'}</span>
              </button>
              <a
                href="https://sms.rootaca.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>{lang === 'ar' ? 'زيارة موقع روتاكا Rootaca' : 'Visit Rootaca Website'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
