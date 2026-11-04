import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SlideSingleImageView } from './SlideSingleImageView';
import { SlideFourImagesView } from './SlideFourImagesView';
import { SlideFullscreenCyberView } from './SlideFullscreenCyberView';
import { SlideMobileResponsiveView } from './SlideMobileResponsiveView';
import { SlideImageItem, parseSlideImages } from './SlideMultiImagesView';
import { parseSlideFooterMetadata } from './SlideSocialFooter';
import {
  X,
  Search,
  MoreHorizontal,
  Play,
  RotateCcw,
  RotateCw,
  BookOpen,
  LayoutGrid,
  Columns,
  Sparkles,
  Check,
  Building2,
  Laptop,
  Activity,
  Users,
  ShieldCheck,
  Award,
  Rocket,
  Target,
  Globe
} from 'lucide-react';
import { PresentationDto } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export interface ExecutivePresentationViewProps {
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

interface DynamicSlide {
  id: string;
  numberAr: string;
  numberEn: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  tagAr: string;
  tagEn: string;
  pointsAr: string[];
  pointsEn: string[];
  images: SlideImageItem[];
  thumbnailUrl: string;
  visionTitleAr: string;
  visionTitleEn: string;
  visionDescAr: string;
  visionDescEn: string;
  overviewTitleAr: string;
  overviewTitleEn: string;
  overviewDescAr: string;
  overviewDescEn: string;
  chips: Array<{
    titleEn: string;
    titleAr: string;
    icon: any;
    bgColor: string;
    textColor: string;
  }>;
  highlights: Array<{
    titleEn: string;
    titleAr: string;
    dateBadge?: string;
  }>;
  websiteUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
}

// 12 canonical seeded slides fallback matching database exactly
const CANONICAL_SLIDES: DynamicSlide[] = [
  {
    id: 's-1',
    numberAr: '٠١',
    numberEn: '01',
    titleAr: 'مرحباً بكم في مدرستكم',
    titleEn: 'Welcome to Your School',
    subtitleAr: 'مدرستكم أولاً — نبذة تعريفية ورؤية ورسالة وترحيب مخصص بمدرستكم الكريمة.',
    subtitleEn: 'Your School First — Dedicated introduction, campus overview, vision & mission.',
    tagAr: 'الرؤية والرسالة',
    tagEn: 'VISION & MISSION',
    pointsAr: [
      'اسم المدرسة وشعارها وهوية مرئية متوافقة بالكامل',
      'نبذة تعريفية شاملة عن الرؤية والرسالة والمراحل التعليمية',
      'رسالة ترحيبية مخصصة وموجهة لقيادة المدرسة'
    ],
    pointsEn: [
      'Official school branding, crest & tailored visual identity',
      'Comprehensive academic overview, vision & mission milestones',
      'Personalized welcome address for school executive leadership'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1200&auto=format&fit=crop',
        title: 'Modern Architectural Campus',
        subtitle: 'الحرم المعماري الحديث'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'الرؤية والهدف',
    visionTitleEn: 'Our Vision',
    visionDescAr: 'مدرستكم أولاً — نبذة تعريفية ورؤية ورسالة وترحيب مخصص بمدرستكم الكريمة.',
    visionDescEn: 'Your School First — Dedicated introduction, campus overview, vision & mission.',
    overviewTitleAr: 'نظرة عامة على المنصة',
    overviewTitleEn: 'Platform Overview',
    overviewDescAr: 'الهوية المدرسية الرسمية ونظرة أكاديمية متكاملة للتحول الرقمي.',
    overviewDescEn: 'Official school branding, crest & comprehensive academic overview.',
    chips: [
      { titleEn: 'Inspiring Spaces', titleAr: 'مساحات ملهمة', icon: Building2, bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
      { titleEn: 'Smart Learning', titleAr: 'تعلم ذكي', icon: Laptop, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
      { titleEn: 'Active Lifestyle', titleAr: 'نمط حياة نشط', icon: Activity, bgColor: 'bg-amber-100', textColor: 'text-amber-700' }
    ],
    highlights: [
      { titleEn: 'Official Branding', titleAr: 'الهوية المدرسية الرسمية', dateBadge: 'Identity' },
      { titleEn: 'Academic Overview', titleAr: 'الرؤية والرسالة الأكاديمية', dateBadge: 'Vision' }
    ]
  },
  {
    id: 's-2',
    numberAr: '٠٢',
    numberEn: '02',
    titleAr: 'لماذا اخترنا مدرستكم؟',
    titleEn: 'Why We Chose Your School',
    subtitleAr: 'تقدير مكانة المدرسة واهتمامها بالتطوير والريادة التعليمية والتكنولوجية.',
    subtitleEn: 'Appreciating your school educational standing and commitment to innovation.',
    tagAr: 'الشراكة الاستراتيجية',
    tagEn: 'STRATEGIC ALIGNMENT',
    pointsAr: [
      'ما الذي لفت انتباهنا في مدرستكم وتميزها الأكاديمي والتربوي',
      'فرصة حقيقية لبناء شراكة تعاون استراتيجي مستدامة',
      'كيف يمكن للتكنولوجيا الحديثة أن تعزز رؤية مدرستكم وسمعتها'
    ],
    pointsEn: [
      'Distinct academic qualities and accomplishments that stood out',
      'A genuine opportunity for enduring strategic collaboration',
      'How modern technology directly empowers your school vision'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop',
        title: 'Academic Excellence',
        subtitle: 'التميز الأكاديمي'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'الريادة المدرسية',
    visionTitleEn: 'Educational Leadership',
    visionDescAr: 'مكانة المدرسة واهتمامها بالتطوير والريادة التعليمية والتكنولوجية.',
    visionDescEn: 'Distinct qualities and educational standing that stood out in your school.',
    overviewTitleAr: 'التعاون المستقبلي',
    overviewDescAr: 'فرصة حقيقية للتعاون المشترك وتمكين أدوات تكنولوجية تدعم المعلمين والطلاب.',
    overviewTitleEn: 'Mutual Enablement',
    overviewDescEn: 'A genuine opportunity for strategic and enduring collaboration.',
    chips: [
      { titleEn: 'Distinct Qualities', titleAr: 'مكانة المدرسة', icon: Award, bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
      { titleEn: 'Collaboration', titleAr: 'فرصة تعاون', icon: Target, bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
      { titleEn: 'Digital Growth', titleAr: 'الريادة الرقمية', icon: Rocket, bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' }
    ],
    highlights: [
      { titleEn: 'Educational Leadership', titleAr: 'الريادة التعليمية', dateBadge: 'Leadership' }
    ]
  },
  {
    id: 's-3',
    numberAr: '٠٣',
    numberEn: '03',
    titleAr: 'من نحن؟ شركة روتاكا Rootaca',
    titleEn: 'About Rootaca & Digital Engineering',
    subtitleAr: 'شركة متخصصة في الحلول الرقمية، تطوير الأنظمة والتطبيقات السحابية وحلول SaaS والتحول الرقمي.',
    subtitleEn: 'Specialized digital engineering firm delivering enterprise SaaS and cloud platforms.',
    tagAr: 'عن روتاكا',
    tagEn: 'ABOUT ROOTACA',
    pointsAr: [
      'تطوير الأنظمة والتطبيقات السحابية المتقدمة لقطاع التعليم',
      'حلول SaaS المتكاملة للتحول الرقمي الشامل للمدارس',
      'خبرتنا في بناء حلول هندسية مترابطة، فائقة الأمان وقابلة للتوسع'
    ],
    pointsEn: [
      'Cloud-native systems and specialized mobile app development for schools',
      'Comprehensive enterprise SaaS platforms for educational transformation',
      'Deep expertise in interconnected, secure and scalable architectures'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
        title: 'Engineering Team',
        subtitle: 'فريق هندسة البرمجيات'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'البنية السحابية',
    visionTitleEn: 'Cloud-Native Systems',
    visionDescAr: 'تطوير الأنظمة والتطبيقات السحابية الحديثة لقطاع التعليم.',
    visionDescEn: 'Cloud-native systems and specialized mobile app development for education.',
    overviewTitleAr: 'الهندسة والتوسع',
    overviewTitleEn: 'Scalable Architecture',
    overviewDescAr: 'خبرتنا في بناء حلول مترابطة وقابلة للتوسع بأعلى معايير الاستقرار.',
    overviewDescEn: 'Deep expertise in interconnected, highly scalable enterprise architectures.',
    chips: [
      { titleEn: 'Enterprise Cloud', titleAr: 'أنظمة سحابية', icon: Laptop, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
      { titleEn: 'Scalable SaaS', titleAr: 'حلول SaaS', icon: Building2, bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
      { titleEn: 'Security & SLA', titleAr: 'حماية متقدمة', icon: ShieldCheck, bgColor: 'bg-teal-100', textColor: 'text-teal-700' }
    ],
    highlights: [
      { titleEn: 'SaaS Platforms', titleAr: 'أنظمة إدارة متطورة', dateBadge: 'SaaS' }
    ]
  },
  {
    id: 's-4',
    numberAr: '٠٤',
    numberEn: '04',
    titleAr: 'نقدم لكم ROOTACA Smart School',
    titleEn: 'Introducing ROOTACA Smart School',
    subtitleAr: 'نظام متكامل لإدارة العمليات المدرسية والتواصل الأكاديمي والإداري الشامل.',
    subtitleEn: 'An all-in-one unified school management system for operations, academics, and communication.',
    tagAr: 'المدرسة الذكية',
    tagEn: 'SMART SCHOOL',
    pointsAr: [
      'تطبيقات تفاعلية متطورة للطلاب وأولياء الأمور للربط اللحظي',
      'تطبيقات مخصصة للمعلمين والمشرفين الأكاديميين لرصد الحصص والدرجات',
      'لوحة قيادة وتحكم تنفيذية لإدارة العمليات والمالية ومؤشرات الأداء'
    ],
    pointsEn: [
      'Interactive mobile apps for students and parents with instant notifications',
      'Dedicated workflow apps for teachers and supervisors for daily tasks',
      'Central executive dashboard for live school operations and finances'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
        title: 'Smart School Management',
        subtitle: 'إدارة المدرسة الذكية'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'بوابات تفاعلية',
    visionTitleEn: 'Interactive Portals',
    visionDescAr: 'تطبيقات تفاعلية للطلاب وأولياء الأمور والمعلمين لربط كافة أطراف العملية التعليمية.',
    visionDescEn: 'Interactive mobile apps for students and parents with instant engagement.',
    overviewTitleAr: 'لوحة التحكم المركزية',
    overviewTitleEn: 'Executive Dashboard',
    overviewDescAr: 'لوحة قيادة وتحكم موحدة لإدارة العمليات المدرسية والتقارير الفورية.',
    overviewDescEn: 'Central executive dashboard for live school operations and attendance.',
    chips: [
      { titleEn: 'Parent App', titleAr: 'تطبيق الأولياء', icon: Users, bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
      { titleEn: 'Teacher Suite', titleAr: 'تطبيق المعلم', icon: Laptop, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
      { titleEn: 'Admin Dashboard', titleAr: 'لوحة القيادة', icon: Building2, bgColor: 'bg-amber-100', textColor: 'text-amber-700' }
    ],
    highlights: [
      { titleEn: 'Live Operations', titleAr: 'إدارة العمليات المدرسية', dateBadge: 'Operations' }
    ]
  },
  {
    id: 's-5',
    numberAr: '٠٥',
    numberEn: '05',
    titleAr: 'مدرسة واحدة.. تجربة رقمية مترابطة',
    titleEn: 'ONE SCHOOL & CONNECTED COMMUNITY',
    subtitleAr: 'مجتمع مدرسي متصل: ولي الأمر يتابع ابنه، الطالب يصل لخدماته، المعلم يدير مهامه، والإدارة برؤية شاملة.',
    subtitleEn: 'A unified platform connecting parents, students, teachers, supervisors, and executive leadership.',
    tagAr: 'المجتمع المدرسي',
    tagEn: 'COMMUNITY',
    pointsAr: [
      'ولي الأمر يتابع مستوى ابنه وسلوكه لحظة بلحظة مع رسائل فورية',
      'المعلم والمشرف يديران الحصص والتحضير والواجبات بدون أوراق',
      'الإدارة تمتلك رؤية 360 درجة لجميع الأقسام وتقارير فورية مؤتمتة'
    ],
    pointsEn: [
      'Parents monitor real-time academic progress and instant announcements',
      'Teachers & supervisors manage grades, attendance and lessons paperlessly',
      'School leadership gains 360-degree real-time operational clarity'
    ],
    images: [
      { url: '/slides/connected-parent.png', title: 'Parent Experience', subtitle: 'تجربة ولي الأمر' },
      { url: '/slides/connected-student.png', title: 'Student Portal', subtitle: 'بوابة الطالب' },
      { url: '/slides/connected-supervisor.png', title: 'Supervisor Hub', subtitle: 'أدوات المشرف' },
      { url: '/slides/connected-teacher.png', title: 'Teacher Suite', subtitle: 'منصة المعلم' }
    ],
    thumbnailUrl: '/slides/connected-parent.png',
    visionTitleAr: 'مجتمع مدرسي متصل',
    visionTitleEn: 'Connected Community',
    visionDescAr: 'ولي الأمر يتابع ابنه لحظة بلحظة والطالب يصل لخدماته الأكاديمية بسلاسة.',
    visionDescEn: 'Parents monitor live progress, students access digital learning directly.',
    overviewTitleAr: 'رؤية تشغيلية شاملة',
    overviewTitleEn: '360 Operational Clarity',
    overviewDescAr: 'الإدارة تحصل على رؤية أوضح للعمليات وتقارير فورية لرفع الكفاءة.',
    overviewDescEn: 'School leadership gains real-time operational clarity and analytics.',
    chips: [
      { titleEn: 'Parent Real-time', titleAr: 'متابعة لحظية للأولياء', icon: Users, bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
      { titleEn: 'Teacher & Staff', titleAr: 'الحصص والتقييم بسلاسة', icon: Laptop, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
      { titleEn: '360 Leadership', titleAr: 'رؤية شاملة للإدارة', icon: Building2, bgColor: 'bg-amber-100', textColor: 'text-amber-700' }
    ],
    highlights: [
      { titleEn: 'Connected Parents', titleAr: 'تطبيق ولي الأمر المباشر', dateBadge: 'Parent' },
      { titleEn: 'Teacher Gradebook', titleAr: 'رصد الدرجات والحضور', dateBadge: 'Teacher' }
    ]
  },
  {
    id: 's-6',
    numberAr: '٠٦',
    numberEn: '06',
    titleAr: 'أكاديمية روتاكا ROOTACA Academy',
    titleEn: 'ROOTACA Tech & Coding Academy',
    subtitleAr: 'تعليم البرمجة والتكنولوجيا وتنمية مهارات التفكير المنطقي وحل المشكلات لطلاب المدرسة.',
    subtitleEn: 'Teaching coding, technology, AI, and analytical problem-solving for school students.',
    tagAr: 'أكاديمية البرمجة',
    tagEn: 'ACADEMY',
    pointsAr: [
      'مناهج حديثة في البرمجة والذكاء الاصطناعي وتكنولوجيا المستقبل',
      'تنمية التفكير الحاسوبي وحل المشكلات العملية من خلال مشاريع حقيقية',
      'برامج تدريبية ومعسكرات متخصصة تؤهل الطلاب للبطولات العالمية'
    ],
    pointsEn: [
      'Modern curriculum in coding, AI, and emerging technologies',
      'Fostering computational thinking and practical problem solving',
      'Tailored student camps and international competition cohorts'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop',
        title: 'Robotics & STEM Lab',
        subtitle: 'معمل الروبوتات والبرمجة'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'مهارات المستقبل',
    visionTitleEn: 'Future Skills',
    visionDescAr: 'تعليم البرمجة وتنمية مهارات التفكير المنطقي وحل المشكلات لدى الطلاب.',
    visionDescEn: 'Empowering students with real-world Python, AI, and competitive robotics.',
    overviewTitleAr: 'شراكة الأكاديمية',
    overviewDescAr: 'برامج ومعسكرات تدريبية مخصصة لطلاب مدرستكم تحت إشراف مدربين معتمدين.',
    overviewTitleEn: 'Academy Partnership',
    overviewDescEn: 'Tailored student camps, bootcamps and certification cohorts at your school.',
    chips: [
      { titleEn: 'Python & AI', titleAr: 'الذكاء الاصطناعي', icon: Laptop, bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
      { titleEn: 'Robotics Labs', titleAr: 'الروبوتات العملية', icon: Activity, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
      { titleEn: 'Hackathons', titleAr: 'مسابقات معتمدة', icon: Award, bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' }
    ],
    highlights: [
      { titleEn: 'Coding Bootcamp', titleAr: 'معسكرات البرمجة للطلاب', dateBadge: 'Coding' }
    ]
  },
  {
    id: 's-7',
    numberAr: '٠٧',
    numberEn: '07',
    titleAr: 'أمان من البداية.. وبنية سحابية للتوسع',
    titleEn: 'Secure by Design. Built for Cloud.',
    subtitleAr: 'بيانات مدرستكم في بيئة تشغيل مستقلة مع حماية فائقة وتحكم دقيق بالصلاحيات.',
    subtitleEn: 'Your School Data. Your Environment. Dedicated isolated tenant architecture.',
    tagAr: 'الحماية والأمان',
    tagEn: 'SECURITY',
    pointsAr: [
      'بنية سحابية تتيح الوصول من أي مكان مع حماية فائقة مشفرة',
      'تحكم دقيق ومتقدم في الصلاحيات لكافة الكوادر الإدارية والتعليمية',
      'قاعدة بيانات وبيئة تشغيل مستقلة لكل مدرسة ومراقبة مستمرة على مدار الساعة'
    ],
    pointsEn: [
      'Encrypted cloud infrastructure accessible everywhere with zero downtime',
      'Fine-grained role-based access permissions for administrative staff',
      'Dedicated database tenant isolation and 24/7 reliability monitoring'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
        title: 'Encrypted Cloud Infrastructure',
        subtitle: 'البنية السحابية المشفرة'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'خصوصية واستقلالية',
    visionTitleEn: 'Data Privacy & Isolation',
    visionDescAr: 'بيانات مدرستكم في بيئة تشغيل مستقلة ومعزولة تضمن كامل الخصوصية.',
    visionDescEn: 'Your school data hosted in isolated tenant architecture with complete privacy.',
    overviewTitleAr: 'صلاحيات دقيقة RBAC',
    overviewTitleEn: 'Granular Access Control',
    overviewDescAr: 'نظام أمني متكامل للتحكم في صلاحيات الوصول لكافة الموظفين والمعلمين.',
    overviewDescEn: 'Enterprise security standards with fine-grained access control.',
    chips: [
      { titleEn: 'Data Privacy', titleAr: 'حماية كاملة للبيانات', icon: ShieldCheck, bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
      { titleEn: 'Tenant Isolation', titleAr: 'بيئة مستقلة', icon: Building2, bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
      { titleEn: 'High Availability', titleAr: 'وصول دون توقف', icon: Laptop, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' }
    ],
    highlights: [
      { titleEn: 'Enterprise Security', titleAr: 'معايير أمان مصرفية', dateBadge: 'Security' }
    ]
  },
  {
    id: 's-8',
    numberAr: '٠٨',
    numberEn: '08',
    titleAr: 'إيه المشكلات اللي هنحلها؟',
    titleEn: 'Challenges We Solve For School Teams',
    subtitleAr: 'نربط كل تحدٍ إداري وتشغيلي بحل فعلي وملموس داخل النظام والقضاء على تشتت البيانات.',
    subtitleEn: 'Connecting every administrative pain point to a concrete automated solution.',
    tagAr: 'الحلول التشغيلية',
    tagEn: 'SOLUTIONS',
    pointsAr: [
      'القضاء النهائي على تشتت البيانات بين ملفات الإكسل والأوراق المبعثرة',
      'تسهيل التواصل اللحظي مع أولياء الأمور وحل شكاوى التأخير والمتابعة',
      'أتمتة الإجراءات اليدوية المرهقة وتوفير تقارير وإحصائيات فورية دقيقة'
    ],
    pointsEn: [
      'Permanently eliminating scattered data across Excel files and paperwork',
      'Overcoming parent communication delays and attendance follow-up hurdles',
      'Automating tedious manual workflows with instant, accurate analytics'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
        title: 'Operational Solutions',
        subtitle: 'الحلول التشغيلية'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'مركزية البيانات',
    visionTitleEn: 'Centralized Records',
    visionDescAr: 'القضاء على تشتت السجلات بين ملفات الإكسل والأوراق المتفرقة.',
    visionDescEn: 'Eliminating scattered data across Excel sheets and paper files permanently.',
    overviewTitleAr: 'سرعة التواصل',
    overviewTitleEn: 'Instant Notifications',
    overviewDescAr: 'تسهيل التواصل الفوري المباشر مع أولياء الأمور وحل مشكلات المتابعة.',
    overviewDescEn: 'Overcoming parent communication friction and attendance tracking delays.',
    chips: [
      { titleEn: 'No Spreadsheets', titleAr: 'إنهاء فوضى الإكسل', icon: Target, bgColor: 'bg-rose-100', textColor: 'text-rose-700' },
      { titleEn: 'Direct Alerts', titleAr: 'تواصل فوري بالأولياء', icon: Users, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
      { titleEn: 'Automation', titleAr: 'أتمتة العمل اليدوي', icon: Rocket, bgColor: 'bg-teal-100', textColor: 'text-teal-700' }
    ],
    highlights: [
      { titleEn: 'Efficiency Boost', titleAr: 'رفع الكفاءة التشغيلية 60%', dateBadge: 'Efficiency' }
    ]
  },
  {
    id: 's-9',
    numberAr: '٠٩',
    numberEn: '09',
    titleAr: 'إيه اللي هنقدمه لمدرستكم؟',
    titleEn: 'What We Deliver To Your School',
    subtitleAr: 'تعاون مستمر وشراكة استراتيجية ممتدة ونظام مخصص للهوية البصرية لمدرستكم.',
    subtitleEn: 'An enduring strategic partnership and ongoing enablement, not just a software license.',
    tagAr: 'المخرجات والخدمات',
    tagEn: 'DELIVERABLES',
    pointsAr: [
      'نظام رقمي مناسب مخصص بالكامل للهوية البصرية لمدرستكم',
      'إعداد وتشغيل كامل ونقل البيانات وتدريب شامل لكافة الكوادر',
      'دعم فني مستمر وإمكانية إضافة وتطوير خصائص مستقبلية حسب احتياجكم'
    ],
    pointsEn: [
      'Tailored digital platform customized strictly to your school visual identity',
      'Full onboarding, turnkey migration & staff training workshops included',
      'Continuous dedicated technical support and custom roadmap feature evolution'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop',
        title: 'Turnkey Onboarding',
        subtitle: 'التشغيل والتدريب المتكامل'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'هوية مخصصة',
    visionTitleEn: 'Custom School Identity',
    visionDescAr: 'نظام رقمي مخصص بالكامل ليتوافق مع الهوية البصرية لمدرستكم وشعارها.',
    visionDescEn: 'Tailored digital platform customized strictly to your school visual identity.',
    overviewTitleAr: 'تدريب وتشغيل شامل',
    overviewTitleEn: 'Turnkey Setup & Training',
    overviewDescAr: 'نقل آمن للبيانات وتدريب شامل لكافة الكوادر الإدارية والتعليمية.',
    overviewDescEn: 'Full onboarding, turnkey migration & staff training workshops included.',
    chips: [
      { titleEn: 'Branded Portal', titleAr: 'تخصيص الهوية والشعار', icon: Award, bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
      { titleEn: 'Data Migration', titleAr: 'نقل البيانات والتشغيل', icon: Laptop, bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
      { titleEn: 'Staff Training', titleAr: 'تدريب شامل للكوادر', icon: Users, bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' }
    ],
    highlights: [
      { titleEn: 'Turnkey Setup', titleAr: 'تشغيل كامل ومدروس', dateBadge: 'Turnkey' }
    ]
  },
  {
    id: 's-10',
    numberAr: '١٠',
    numberEn: '10',
    titleAr: 'المكسب اللي هتحققه المدرسة من الشراكة',
    titleEn: 'The Value of Partnership',
    subtitleAr: 'زيادة رضا أولياء الأمور، خفض الهدر الإداري، وتعزيز سمعة المدرسة في المجتمع التعليمي.',
    subtitleEn: 'Higher parent satisfaction, reduced administrative overhead, and elevated reputation.',
    tagAr: 'القيمة المضافة',
    tagEn: 'VALUE PROPOSITION',
    pointsAr: [
      'رفع رضا وثقة أولياء الأمور عبر الشفافية وسهولة المتابعة الفورية',
      'توفير مئات الساعات التشغيلية وتقليل التكاليف الورقية والإدارية',
      'ترسيخ مكانة المدرسة كصرح تعليمي ذكي ورائد تكنولوجياً في المنطقة'
    ],
    pointsEn: [
      'Elevated parent satisfaction and trust through instant transparent engagement',
      'Saving hundreds of operational hours each semester and eliminating paper costs',
      'Strengthening your school position as a forward-thinking digital beacon'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
        title: 'Educational Growth',
        subtitle: 'النمو والريادة'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'ثقة مجتمعية أعلى',
    visionTitleEn: 'Community Trust',
    visionDescAr: 'زيادة ملحوظة في رضا أولياء الأمور وثقتهم في الإدارة المدرسية.',
    visionDescEn: 'Significantly elevated parent trust through transparency and mobile engagement.',
    overviewTitleAr: 'وفر في التكاليف',
    overviewTitleEn: 'Operational Savings',
    overviewDescAr: 'توفير ساعات عمل هائلة للأطقم الإدارية والتركيز على جودة التعليم.',
    overviewDescEn: 'Saving hundreds of operational staff hours each semester with automation.',
    chips: [
      { titleEn: 'Parent Satisfaction', titleAr: 'رضا تام للأولياء', icon: Users, bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
      { titleEn: 'Administrative Savings', titleAr: 'توفير التكاليف والهدر', icon: Building2, bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
      { titleEn: 'Smart Brand Presence', titleAr: 'ريادة وسمعة رقمية', icon: Award, bgColor: 'bg-amber-100', textColor: 'text-amber-700' }
    ],
    highlights: [
      { titleEn: 'Measurable ROI', titleAr: 'عائد مباشر على الاستثمار', dateBadge: 'ROI' }
    ]
  },
  {
    id: 's-11',
    numberAr: '١١',
    numberEn: '11',
    titleAr: 'خارطة طريق التحول والنمو المشترك',
    titleEn: 'Roadmap to Mutual Digital Growth',
    subtitleAr: 'خطوات واضحة ومدروسة من التأسيس إلى الانطلاق، ثم التطوير المستمر.',
    subtitleEn: 'Structured clear milestones from discovery and rollout to long-term innovation.',
    tagAr: 'خارطة الطريق',
    tagEn: 'ROADMAP',
    pointsAr: [
      'المرحلة الأولى: تهيئة المنظومة وربط الهوية واستيراد بيانات المدرسة',
      'المرحلة الثانية: تدريب مكثف وتأهيل المعلمين والمشرفين الأكاديميين',
      'المرحلة الثالثة: الإطلاق الرسمي وبدء تفاعل أولياء الأمور مع دعم تقني مستمر'
    ],
    pointsEn: [
      'Phase 1: Platform branding, school data import, and tenant provisioning',
      'Phase 2: Comprehensive staff training and administrator certification workshops',
      'Phase 3: Formal go-live for parents and students with 24/7 technical support'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
        title: 'Project Roadmap',
        subtitle: 'خارطة المشروع'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'المرحلة ١: التهيئة والربط',
    visionTitleEn: 'Phase 1: Setup & Import',
    visionDescAr: 'تهيئة النظام ونقل البيانات وتخصيص الهوية المدرسية بدقة.',
    visionDescEn: 'Platform branding, school data import, and staff workshop certification.',
    overviewTitleAr: 'المرحلة ٢: الانطلاق والتدريب',
    overviewTitleEn: 'Phase 2: Training & Launch',
    overviewDescAr: 'إطلاق المنظومة للطلاب والأولياء وتوفير دعم فني مستمر للكوادر.',
    overviewDescEn: 'Go-live for students and parents with continuous dedicated technical support.',
    chips: [
      { titleEn: 'Week 1: Setup', titleAr: 'الأسبوع ١: التهيئة والربط', icon: Target, bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
      { titleEn: 'Week 2: Training', titleAr: 'الأسبوع ٢: التدريب المباشر', icon: Laptop, bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
      { titleEn: 'Go-Live Launch', titleAr: 'الانطلاق الرسمي للمنظومة', icon: Rocket, bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' }
    ],
    highlights: [
      { titleEn: 'Rapid Onboarding', titleAr: 'خطة تشغيل دقيقة ومجدولة', dateBadge: 'Plan' }
    ]
  },
  {
    id: 's-12',
    numberAr: '١٢',
    numberEn: '12',
    titleAr: 'شكرًا لمدرستكم الكريمة',
    titleEn: 'Thank You for Your Time',
    subtitleAr: 'نثمن وقتكم واهتمامكم بالاطلاع على حلولنا لتطوير صرحكم التعليمي، ويسعدنا بدء التنسيق المشترك.',
    subtitleEn: 'Deep gratitude to school leadership. Ready to answer questions and launch collaboration.',
    tagAr: 'الخطوة التالية',
    tagEn: 'NEXT STEPS',
    pointsAr: [
      'تحديد موعد جلسة العرض الحي (Demo) بنماذج بيانات مخصصة لمدرستكم',
      'الإجابة عن كافة التساؤلات التقنية والإدارية من فريق قيادة المدرسة',
      'تجهيز مذكرة التفاهم وبدء التهيئة الفورية للتحول الرقمي'
    ],
    pointsEn: [
      'Scheduling an interactive walkthrough with test data simulating your school',
      'Answering all technical, financial and operational queries from leadership',
      'Finalizing kickoff agreements and initiating immediate platform onboarding'
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
        title: 'Partnership & Next Steps',
        subtitle: 'الخطوة التالية والشراكة'
      }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop',
    visionTitleAr: 'جلسة العرض التجريبي Demo',
    visionTitleEn: 'Live Demo Walkthrough',
    visionDescAr: 'استعراض عملي للمنظومة والتطبيقات بنماذج بيانات مخصصة لمدرستكم.',
    visionDescEn: 'Interactive walkthrough with live test data simulating your school operations.',
    overviewTitleAr: 'انطلاق الشراكة',
    overviewDescAr: 'يسعدنا تلقي استفساراتكم وبدء التنسيق المشترك للانطلاق الرقمي السلس.',
    overviewTitleEn: 'Seamless Onboarding',
    overviewDescEn: 'Ready to answer all technical questions and initiate dedicated onboarding.',
    chips: [
      { titleEn: 'Schedule Demo', titleAr: 'جلسة عرض تفاعلي Demo', icon: Award, bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
      { titleEn: 'Leadership Q&A', titleAr: 'استفسارات الإدارة', icon: Users, bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
      { titleEn: 'Kickoff Agreement', titleAr: 'بدء التنسيق والتشغيل', icon: Target, bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' }
    ],
    highlights: [
      { titleEn: 'Demo Ready', titleAr: 'تجهيز بيئة تجريبية للمدرسة', dateBadge: 'Demo' }
    ]
  }
];

export const ExecutivePresentationView: React.FC<ExecutivePresentationViewProps> = ({
  presentation,
  initialSlideIndex = 0,
  onClose,
  schoolName,
  defaultLanguage,
  isPublicMode,
  shareToken
}) => {
  const { language: contextLang, toggleLanguage: contextToggleLang } = useLanguage();
  const [lang, setLang] = useState<'ar' | 'en'>(defaultLanguage || contextLang || 'ar');
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Responsive mobile detection (screen width < 768px)
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveSchoolName = schoolName || presentation?.schoolName || (isAr ? 'مدرستكم' : 'Your School');

  // Listen to window resize for seamless dynamic mobile adaptation
  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  // Map presentation slides dynamically from the database
  const slides: DynamicSlide[] = useMemo(() => {
    if (presentation?.slides && presentation.slides.length > 0) {
      return presentation.slides.map((s, idx) => {
        const canonical = CANONICAL_SLIDES[idx % CANONICAL_SLIDES.length];
        const parsedImgs = parseSlideImages(s.imageUrl);
        const effectiveImgs = parsedImgs.length > 0 ? parsedImgs : canonical.images;

        let titleEn = s.slideTitleEn || s.slideTitleAr || canonical.titleEn;
        let titleAr = s.slideTitleAr || s.slideTitleEn || canonical.titleAr;
        titleEn = titleEn.replace(/\[School Name\]/gi, effectiveSchoolName).replace(/\[اسم المدرسة\]/gi, effectiveSchoolName);
        titleAr = titleAr.replace(/\[School Name\]/gi, effectiveSchoolName).replace(/\[اسم المدرسة\]/gi, effectiveSchoolName);

        let subtitleEn = s.contentEn || s.contentAr || canonical.subtitleEn;
        let subtitleAr = s.contentAr || s.contentEn || canonical.subtitleAr;
        subtitleEn = subtitleEn.replace(/\[School Name\]/gi, effectiveSchoolName).replace(/\[اسم المدرسة\]/gi, effectiveSchoolName);
        subtitleAr = subtitleAr.replace(/\[School Name\]/gi, effectiveSchoolName).replace(/\[اسم المدرسة\]/gi, effectiveSchoolName);

        // Parse key points from json
        let pointsAr: string[] = [];
        let pointsEn: string[] = [];
        try {
          if (s.keyPointsArJson) pointsAr = JSON.parse(s.keyPointsArJson);
          if (s.keyPointsEnJson) pointsEn = JSON.parse(s.keyPointsEnJson);
        } catch {}

        const effectivePointsAr = pointsAr.length > 0 ? pointsAr : canonical.pointsAr;
        const effectivePointsEn = pointsEn.length > 0 ? pointsEn : canonical.pointsEn;

        const chipIcons = [Building2, Laptop, Activity, Users, ShieldCheck, Award, Rocket, Target];
        const chipBgs = ['bg-sky-100', 'bg-cyan-100', 'bg-amber-100'];
        const chipTexts = ['text-sky-700', 'text-cyan-700', 'text-amber-700'];

        const chips = effectivePointsAr.slice(0, 3).map((pt, cIdx) => ({
          titleEn: effectivePointsEn[cIdx] || `Feature ${cIdx + 1}`,
          titleAr: pt,
          icon: chipIcons[cIdx % chipIcons.length],
          bgColor: chipBgs[cIdx % chipBgs.length],
          textColor: chipTexts[cIdx % chipTexts.length]
        }));

        // Parse footer links & custom chips metadata from notes
        const footerMeta = parseSlideFooterMetadata(s.notes);
        const websiteUrl = footerMeta.websiteUrl !== undefined ? footerMeta.websiteUrl : (canonical.websiteUrl || 'www.helsinkischool.edu');
        const twitterUrl = footerMeta.twitterUrl !== undefined ? footerMeta.twitterUrl : (canonical.twitterUrl || 'https://twitter.com');
        const linkedinUrl = footerMeta.linkedinUrl !== undefined ? footerMeta.linkedinUrl : (canonical.linkedinUrl || 'https://linkedin.com');
        const facebookUrl = footerMeta.facebookUrl !== undefined ? footerMeta.facebookUrl : (canonical.facebookUrl || 'https://facebook.com');
        const instagramUrl = footerMeta.instagramUrl !== undefined ? footerMeta.instagramUrl : (canonical.instagramUrl || 'https://instagram.com');

        let effectiveChips = chips;
        if (footerMeta.chips && footerMeta.chips.length > 0) {
          effectiveChips = footerMeta.chips.map((c, cIdx) => ({
            titleEn: c.titleEn || `Feature ${cIdx + 1}`,
            titleAr: c.titleAr || c.titleEn || `ميزة ${cIdx + 1}`,
            icon: chipIcons[cIdx % chipIcons.length],
            bgColor: chipBgs[cIdx % chipBgs.length],
            textColor: chipTexts[cIdx % chipTexts.length]
          }));
        } else if (canonical.chips && canonical.chips.length > 0) {
          effectiveChips = canonical.chips;
        }

        return {
          id: s.id || `slide-${idx}`,
          numberAr: (idx + 1).toLocaleString('ar-EG', { minimumIntegerDigits: 2 }),
          numberEn: String(idx + 1).padStart(2, '0'),
          titleAr,
          titleEn,
          subtitleAr,
          subtitleEn,
          tagAr: String(s.category || canonical.tagAr),
          tagEn: String(s.category || canonical.tagEn).toUpperCase(),
          pointsAr: effectivePointsAr,
          pointsEn: effectivePointsEn,
          images: effectiveImgs,
          thumbnailUrl: effectiveImgs[0]?.url || canonical.thumbnailUrl,
          visionTitleAr: effectivePointsAr[0] ? 'الهدف الرئيسي' : canonical.visionTitleAr,
          visionTitleEn: effectivePointsEn[0] ? 'Key Objective' : canonical.visionTitleEn,
          visionDescAr: effectivePointsAr[0] || subtitleAr,
          visionDescEn: effectivePointsEn[0] || subtitleEn,
          overviewTitleAr: effectivePointsAr[1] ? 'النطاق والمخرجات' : canonical.overviewTitleAr,
          overviewTitleEn: effectivePointsEn[1] ? 'Strategic Scope' : canonical.overviewTitleEn,
          overviewDescAr: effectivePointsAr[1] || subtitleAr,
          overviewDescEn: effectivePointsEn[1] || subtitleEn,
          chips: effectiveChips,
          highlights: effectivePointsEn.map((p, pIdx) => ({
            titleEn: p,
            titleAr: effectivePointsAr[pIdx] || p,
            dateBadge: `0${pIdx + 1}`
          })),
          websiteUrl,
          twitterUrl,
          linkedinUrl,
          facebookUrl,
          instagramUrl
        };
      });
    }
    return CANONICAL_SLIDES;
  }, [presentation, effectiveSchoolName]);

  const currentSlide = slides[currentIndex] || slides[0];

  // Dynamic Content Check: Does current slide have 4 / multi images?
  const isMultiImageSlide = (currentSlide.images?.length || 0) > 1;

  // Filtered slides for search input
  const filteredSlides = useMemo(() => {
    if (!searchQuery.trim()) return slides;
    const q = searchQuery.toLowerCase();
    return slides.filter(
      s => s.titleAr.toLowerCase().includes(q) || s.titleEn.toLowerCase().includes(q)
    );
  }, [slides, searchQuery]);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => Math.min(slides.length - 1, prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  // Safe Fullscreen Handler: Escape key exits fullscreen WITHOUT closing the deck
  const handleExitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsBrowserFullscreen(false);
  }, []);

  const handleEnterFullscreen = useCallback(async () => {
    try {
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      }
    } catch {}
    setIsBrowserFullscreen(true);
  }, []);

  // Sync native fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsBrowserFullscreen(false);
    if (onClose) {
      onClose();
    }
    if (isPublicMode || (typeof window !== 'undefined' && window.location.pathname.startsWith('/p/'))) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/presentations';
      }
    }
  }, [onClose, isPublicMode]);

  // Keyboard navigation: Escape key NEVER closes accidentally when in fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) return;

      if (e.key === 'Escape') {
        if (document.fullscreenElement || isBrowserFullscreen) {
          handleExitFullscreen();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        handleClose();
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
      } else if (e.key.toLowerCase() === 'f') {
        if (isBrowserFullscreen) handleExitFullscreen();
        else handleEnterFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir, nextSlide, prevSlide, onClose, isBrowserFullscreen, handleExitFullscreen, handleEnterFullscreen]);

  const handleShareClick = () => {
    const url = shareToken ? `${window.location.origin}/p/${shareToken}` : window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }).catch(() => {});
  };

  // =================================================================
  // 1. FULLSCREEN CYBER VIEW (Dynamically shown when in Fullscreen)
  // Matches Image 3 ("لو في عرض كامل الشاشة")
  // =================================================================
  if (isBrowserFullscreen) {
    return (
      <div ref={containerRef} className="fixed inset-0 z-[100] bg-[#040C1A] text-white">
        <SlideFullscreenCyberView
          tag={isAr ? currentSlide.tagAr : currentSlide.tagEn}
          titleAr={currentSlide.titleAr}
          titleEn={currentSlide.titleEn}
          descriptionAr={currentSlide.subtitleAr}
          descriptionEn={currentSlide.subtitleEn}
          pointsAr={currentSlide.pointsAr}
          pointsEn={currentSlide.pointsEn}
          images={currentSlide.images}
          currentSlideNum={currentIndex + 1}
          totalSlides={slides.length}
          onPrev={prevSlide}
          onNext={nextSlide}
          onExitFullscreen={handleExitFullscreen}
          lang={lang}
          onToggleLang={toggleLanguage}
        />
      </div>
    );
  }

  // =================================================================
  // 2. MOBILE RESPONSIVE VIEW (Dynamically shown on screens < 768px)
  // Matches Image 4 ("لو موبيل responsive")
  // =================================================================
  if (isMobileViewport) {
    return (
      <div dir={dir} className="fixed inset-0 z-[100] bg-[#eef5f8] flex flex-col justify-between overflow-hidden">
        {/* Top Mobile Bar with Close and Language */}
        <div className="h-12 px-4 bg-white/95 border-b border-slate-200/80 flex items-center justify-between text-slate-800 shrink-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-cyan-800">{effectiveSchoolName}</span>
            <span className="text-[10px] text-slate-400 font-mono">({currentIndex + 1}/{slides.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 active:bg-rose-100 text-slate-600 hover:text-rose-600 active:text-rose-700 flex items-center justify-center transition cursor-pointer shrink-0 shadow-2xs"
              title={isAr ? 'إغلاق العرض' : 'Close Presentation'}
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SlideMobileResponsiveView
            schoolNameEn={effectiveSchoolName.toUpperCase()}
            schoolNameAr={effectiveSchoolName}
            tagline={isAr ? currentSlide.subtitleAr : currentSlide.subtitleEn}
            facilities={currentSlide.images}
            highlights={currentSlide.highlights}
            asPhoneMockup={false}
            websiteUrl={currentSlide.websiteUrl}
            twitterUrl={currentSlide.twitterUrl}
            linkedinUrl={currentSlide.linkedinUrl}
            facebookUrl={currentSlide.facebookUrl}
            instagramUrl={currentSlide.instagramUrl}
            onClose={handleClose}
            lang={lang}
          />
        </div>

        {/* Bottom Mobile Navigation */}
        <div className="h-12 bg-white/95 border-t border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-lg" dir="ltr">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-30"
          >
            {isAr ? 'السابق' : 'Previous'}
          </button>
          <span className="text-xs font-mono font-bold text-slate-600">
            {currentIndex + 1} / {slides.length}
          </span>
          <button
            onClick={nextSlide}
            disabled={currentIndex === slides.length - 1}
            className="px-3 py-1 bg-[#29b6a4] text-white rounded-lg text-xs font-bold disabled:opacity-30"
          >
            {isAr ? 'التالي' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // =================================================================
  // 3 & 4. DESKTOP PRESENTATION DECK (Dynamically switches 1 vs 4 images)
  // Background: Soft Ice Blue (#eef5f8)
  // =================================================================
  return (
    <div
      ref={containerRef}
      dir={dir}
      className="fixed inset-0 z-[100] bg-[#eef5f8] text-slate-800 flex flex-col justify-between overflow-hidden select-none font-sans antialiased"
    >
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-5 end-6 z-[250] bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{isAr ? 'تم نسخ رابط العرض بنجاح!' : 'Presentation link copied successfully!'}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER:                                                   */}
      {/* If current slide is multi-image -> macOS Window Header (Image 2) */}
      {/* If current slide is single-image -> Clean Action Bar (Image 1)  */}
      {/* ------------------------------------------------------------- */}
      {isMultiImageSlide ? (
        /* DESIGN 2 macOS TOP WINDOW HEADER (Image 2) */
        <header className="h-14 px-4 bg-[#eef5f8] border-b border-slate-200/70 flex items-center justify-between shrink-0 select-none">
          {/* Left / Start: macOS Window Traffic Dots */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 me-3" dir="ltr">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-2xs cursor-pointer hover:opacity-80" onClick={handleClose} title="Close" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-2xs" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-2xs cursor-pointer" onClick={handleEnterFullscreen} title="Fullscreen" />
            </div>
          </div>

          {/* Center Toolbar: Search & Tools */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-400">
              <BookOpen className="w-4 h-4 text-slate-500" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder={isAr ? 'بحث في الشرائح...' : 'Search slides...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white/80 border border-slate-200/80 rounded-xl px-3 py-1 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white w-48 shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button className="p-1 hover:text-slate-700 rounded transition"><RotateCcw className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:text-slate-700 rounded transition"><RotateCw className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white/80 border border-slate-200/80 px-2 py-0.5 rounded-lg shadow-2xs">
              <Search className="w-3 h-3 text-slate-400" />
              <span>85% ▾</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button className="p-1 hover:text-slate-700 rounded"><LayoutGrid className="w-3.5 h-3.5" /></button>
              <button className="p-1 hover:text-slate-700 rounded"><Columns className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Right / End: Language Switcher, Present, Share & Avatar */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-slate-700 text-xs font-bold border border-slate-200/80 shadow-2xs flex items-center gap-1 cursor-pointer transition"
              title="تغيير اللغة / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-600" />
              <span>{isAr ? 'English' : 'عربي'}</span>
            </button>

            <button
              onClick={handleEnterFullscreen}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-sm cursor-pointer transition"
              title={isAr ? 'بدء العرض ملء الشاشة (Present)' : 'Present'}
            >
              <Play className="w-3.5 h-3.5 fill-current text-white" />
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer ms-1"
              title="Close Deck"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>
      ) : (
        /* DESIGN 1 TOP RIGHT ACTIONS (Image 1) */
        <header className="h-14 px-6 bg-[#eef5f8] flex items-center justify-end gap-3 shrink-0 select-none">
          {/* Language Switcher Pill */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/80 shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
            title="تغيير اللغة / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>{isAr ? 'English' : 'عربي'}</span>
          </button>

          <button
            onClick={handleEnterFullscreen}
            className="w-9 h-9 rounded-full bg-[#29b6a4] hover:bg-[#239f8f] text-white flex items-center justify-center shadow-sm cursor-pointer transition"
            title={isAr ? 'بدء العرض ملء الشاشة (Present)' : 'Present'}
          >
            <Play className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer ms-1"
            title="Close Deck"
          >
            <X className="w-4 h-4" />
          </button>
        </header>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN VIEWPORT: Sidebar + Center Stage Card                     */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden w-full min-h-0">

        {/* SLIDES DRAWER / THUMBNAILS LIST */}
        <div className="w-64 sm:w-72 bg-[#eef5f8] border-e border-slate-200/70 flex flex-col justify-between p-3.5 shrink-0 overflow-y-auto">
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={isAr ? 'بحث في الشرائح...' : 'Search slides...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/70 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Heading */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-xs font-black text-slate-800">
                {isAr ? 'شرائح العرض التقديمي' : 'Presentation Decks'}
              </span>
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </div>

            {/* Real Slide thumbnails list */}
            <div className="space-y-2.5">
              {filteredSlides.map((slide, sIdx) => {
                const isActive = sIdx === currentIndex;
                const slideHasMulti = (slide.images?.length || 0) > 1;
                const slideTitle = isAr ? slide.titleAr : slide.titleEn;
                const slideNum = isAr ? slide.numberAr : slide.numberEn;

                return (
                  <div
                    key={slide.id}
                    onClick={() => setCurrentIndex(sIdx)}
                    className={`rounded-2xl p-2.5 transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-white border-2 border-[#29b6a4] shadow-md shadow-teal-500/10'
                        : 'bg-white/70 hover:bg-white border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    {/* Miniature preview */}
                    <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 mb-2 border border-slate-100 relative">
                      <img
                        src={slide.thumbnailUrl}
                        alt={slideTitle}
                        className="w-full h-full object-cover"
                      />
                      {slideHasMulti && (
                        <div className="absolute top-1.5 end-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          {isAr ? '٤ صور' : '4 Images'}
                        </div>
                      )}
                    </div>
                    {/* Slide label */}
                    <div className="flex items-center gap-1.5 text-start">
                      <span className="text-[11px] font-bold text-slate-700 truncate">
                        {slideNum}. {slideTitle.split('\n')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CENTER MAIN STAGE CANVAS: Dynamically renders Design 1 vs 2   */}
        {/* ------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-w-0">
          {isMultiImageSlide ? (
            /* DESIGN 2: 4 Images 2x2 Grid Slide (e.g. Slide 05 - One Connected School) */
            <SlideFourImagesView
              titleAr={currentSlide.titleAr}
              titleEn={currentSlide.titleEn.replace('\n', ' ')}
              images={currentSlide.images}
              chips={currentSlide.chips}
              websiteUrl={currentSlide.websiteUrl}
              twitterUrl={currentSlide.twitterUrl}
              linkedinUrl={currentSlide.linkedinUrl}
              facebookUrl={currentSlide.facebookUrl}
              instagramUrl={currentSlide.instagramUrl}
              lang={lang}
              className="w-full"
            />
          ) : (
            /* DESIGN 1: Single Wide Image Slide (e.g. Slide 01, 02, etc.) */
            <SlideSingleImageView
              titleEn={currentSlide.titleEn}
              titleAr={currentSlide.titleAr}
              badges={[isAr ? currentSlide.tagAr : currentSlide.tagEn, isAr ? 'نظرة عامة' : 'OVERVIEW']}
              imageUrl={currentSlide.images[0]?.url}
              visionTitle={isAr ? currentSlide.visionTitleAr : currentSlide.visionTitleEn}
              visionDesc={isAr ? currentSlide.visionDescAr : currentSlide.visionDescEn}
              overviewTitle={isAr ? currentSlide.overviewTitleAr : currentSlide.overviewTitleEn}
              overviewDesc={isAr ? currentSlide.overviewDescAr : currentSlide.overviewDescEn}
              websiteUrl={currentSlide.websiteUrl}
              twitterUrl={currentSlide.twitterUrl}
              linkedinUrl={currentSlide.linkedinUrl}
              facebookUrl={currentSlide.facebookUrl}
              instagramUrl={currentSlide.instagramUrl}
              currentSlideNum={currentIndex + 1}
              totalSlides={slides.length}
              onPrev={prevSlide}
              onNext={nextSlide}
              onToggleFullscreen={handleEnterFullscreen}
              lang={lang}
              className="w-full"
            />
          )}
        </main>

      </div>
    </div>
  );
};
