import React from 'react';
import {
  Building2,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Bus,
  Users,
  Award,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { SlideCategory } from '../../types';

interface SlideVisualPreviewProps {
  category: SlideCategory;
  imageUrl?: string;
  slideTitle: string;
}

export const SlideVisualPreview: React.FC<SlideVisualPreviewProps> = ({
  category,
  imageUrl,
  slideTitle
}) => {
  if (imageUrl) {
    return (
      <div className="relative group overflow-hidden rounded-xl border border-slate-200/90 shadow-2xs bg-white p-2">
        <img
          src={imageUrl}
          alt={slideTitle}
          className="w-full h-56 sm:h-72 object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute bottom-3 start-3 end-3 bg-white/95 backdrop-blur-md p-2.5 rounded-lg border border-slate-200/90 flex items-center justify-between text-xs text-slate-700 shadow-xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span className="truncate">{slideTitle}</span>
          </span>
          <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded font-bold border border-cyan-200 shrink-0">
            Rootaca
          </span>
        </div>
      </div>
    );
  }

  // Purpose-built SaaS Light visual mockups matching Dashboard / Home page palette:
  switch (category) {
    case 'SmartSchool':
      return (
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5 text-start h-full flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200/80 flex items-center justify-center text-cyan-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">ROOTACA Smart School</div>
                <div className="text-[10px] text-slate-500">Live SIS & School Control</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
              Active Cloud
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 block font-medium">إجمالي الطلاب</span>
              <span className="text-lg font-black text-slate-900 font-mono">1,840</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">↑ 100% رقمي</span>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 block font-medium">نسبة الحضور اليومي</span>
              <span className="text-lg font-black text-emerald-600 font-mono">98.6%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">تحديث لحظي</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Bus className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium text-xs">تتبع الحافلات المدرسية (GPS)</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">14 مسار مفعل</span>
            </div>
            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-medium text-xs">تطبيق أولياء الأمور والواجبات</span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">iOS & Android</span>
            </div>
          </div>
        </div>
      );

    case 'Academy':
      return (
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5 text-start h-full flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">ROOTACA Academy</div>
                <div className="text-[10px] text-slate-500">معمل المستقبل للذكاء الاصطناعي</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
              STEM Ready
            </span>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span className="font-bold text-slate-900">المسار الأكاديمي المعتمد</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200">Level 1 - 4</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 flex-1 bg-emerald-500 rounded-full" />
              <div className="h-1.5 flex-1 bg-emerald-500 rounded-full" />
              <div className="h-1.5 flex-1 bg-emerald-500 rounded-full" />
              <div className="h-1.5 flex-1 bg-slate-200 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200/80 text-center">
              <div className="text-sm font-bold text-slate-900">Python & AI</div>
              <div className="text-[10px] text-slate-500 mt-0.5">مشاريع وتطبيقات عملية</div>
            </div>
            <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200/80 text-center">
              <div className="text-sm font-bold text-slate-900">Robotics Lab</div>
              <div className="text-[10px] text-slate-500 mt-0.5">معامل ومسابقات معتمدة</div>
            </div>
          </div>
        </div>
      );

    case 'CompanyOverview':
    case 'ValueProposition':
    case 'Closing':
    default:
      return (
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5 text-start h-full flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Rootaca Architecture</div>
                <div className="text-[10px] text-slate-500">بنية سحابية آمنة وموثوقة</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              99.9% Uptime SLA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
              <div className="text-xs font-bold text-slate-900">أمان وتشفير كامل</div>
              <div className="text-[10px] text-slate-500">نسخ احتياطي يومي مشفر</div>
            </div>
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <Award className="w-5 h-5 text-blue-600 mb-1" />
              <div className="text-xs font-bold text-slate-900">دعم واستشارات 24/7</div>
              <div className="text-[10px] text-slate-500">مرافقة خطوة بخطوة</div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">توفير 70% من وقت الكنترول والإدارة</span>
            </span>
            <span className="text-emerald-700 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">ROI إيجابي</span>
          </div>
        </div>
      );
  }
};
