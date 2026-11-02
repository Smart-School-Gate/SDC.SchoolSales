import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Zap,
  Plus,
  Calendar,
  Tv,
  BarChart3,
  BarChart2,
  PieChart,
  CalendarCheck,
  Phone,
  Users,
  Trophy,
  Handshake,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStatsDto } from '../types';

export const DashboardPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Values from API with fallbacks matching the exact design reference
  const wonDealsCount = stats?.schoolsByStage?.find(s => s.stage === 'ClosedWon')?.count ?? 5;
  const proposalsCount = stats?.proposalsRequested ?? 8;
  const totalSchools = stats?.totalSchools ?? 28;
  const monthlyVisits = stats?.totalVisits ?? 12;

  // Pipeline stage breakdown matching the donut chart in reference
  const newSchools = stats?.schoolsByStage?.find(s => s.stage === 'New')?.count ?? 7;
  const inFollowUp = (stats?.schoolsByStage?.find(s => s.stage === 'Contacted')?.count ?? 4) +
                     (stats?.schoolsByStage?.find(s => s.stage === 'Visited')?.count ?? 4); // 8
  const proposalSent = stats?.schoolsByStage?.find(s => s.stage === 'ProposalSent')?.count ?? 6;
  const closedWon = stats?.schoolsByStage?.find(s => s.stage === 'ClosedWon')?.count ?? 7;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP ROW: HERO PROMO BANNER + QUICK ACTIONS WIDGET     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left 8 Cols: Architectural Hero Banner */}
        <div className="lg:col-span-8 rounded-3xl bg-gradient-to-l from-[#D8E8FC] via-[#EEF5FE] to-[#F8FAFF] border border-blue-100 shadow-sm p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[220px]">
          {/* School Campus Photo with Soft Vignette Blend */}
          <div className="absolute inset-y-0 end-0 w-full sm:w-3/5 lg:w-[55%] pointer-events-none overflow-hidden opacity-25 sm:opacity-100">
            <img
              src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
              alt="School Campus"
              className="w-full h-full object-cover object-center"
              style={{
                maskImage: dir === 'rtl'
                  ? 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
                  : 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: dir === 'rtl'
                  ? 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
                  : 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
              }}
            />
          </div>

          {/* Banner Text Content */}
          <div className="relative z-10 space-y-2 max-w-sm sm:max-w-md">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {language === 'ar' ? 'إدارة المبيعات التعليمية' : 'Educational Sales Management'}
            </h1>
            <div className="text-2xl sm:text-4xl font-black text-[#0D6EFD] tracking-tight">
              Rootaca
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-600 pt-1">
              {language === 'ar' ? 'معاً .. نحو مستقبل تعليمي أفضل' : 'Together .. Towards a better educational future'}
            </p>

            <div className="pt-3 sm:pt-4">
              <Link
                to="/reports"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#0D6EFD] hover:bg-[#0b5ed7] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{language === 'ar' ? 'عرض الأداء التفصيلي' : 'View Detailed Performance'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Quick Actions Card */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
            <Zap className="w-4 h-4 text-[#0D6EFD] fill-current" />
            <span>{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {/* Quick Action 1: Add School */}
            <Link
              to="/schools"
              className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#EEF5FE] border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-[#0D6EFD] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                {language === 'ar' ? 'إضافة مدرسة' : 'Add School'}
              </span>
            </Link>

            {/* Quick Action 2: Log Visit */}
            <Link
              to="/visits"
              className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#EEF5FE] border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-[#0D6EFD] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                {language === 'ar' ? 'تسجيل زيارة' : 'Log Visit'}
              </span>
            </Link>

            {/* Quick Action 3: View Reports */}
            <Link
              to="/reports"
              className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#EEF5FE] border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-[#0D6EFD] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                {language === 'ar' ? 'عرض التقارير' : 'View Reports'}
              </span>
            </Link>

            {/* Quick Action 4: Presentation Deck */}
            <Link
              to="/presentations"
              className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-[#EEF5FE] border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-[#0D6EFD] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                <Tv className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                {language === 'ar' ? 'عرض تقديمي' : 'Presentation'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SECOND ROW: 4 STATS KPI CARDS                         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Won Deals (Rightmost in RTL) */}
        <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-start">
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none">
              {wonDealsCount}
            </div>
            <div className="text-xs font-bold text-slate-600">
              {language === 'ar' ? 'صفقات ناجحة' : 'Won Deals'}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑ +25%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#0D6EFD] flex items-center justify-center shrink-0 shadow-xs">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Proposals Sent */}
        <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-start">
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none">
              {proposalsCount}
            </div>
            <div className="text-xs font-bold text-slate-600">
              {language === 'ar' ? 'عروض مقدمة' : 'Proposals Sent'}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑ +33%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Interested Schools */}
        <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-start">
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none">
              {totalSchools}
            </div>
            <div className="text-xs font-bold text-slate-600">
              {language === 'ar' ? 'مدرسة مهتمة' : 'Interested Schools'}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑ +12%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Visits This Month (Leftmost in RTL) */}
        <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-start">
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 leading-none">
              {monthlyVisits}
            </div>
            <div className="text-xs font-bold text-slate-600">
              {language === 'ar' ? 'الزيارات هذا الشهر' : 'Visits This Month'}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <span>↑ +20%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
            <Handshake className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. THIRD ROW: CHARTS & UPCOMING TASKS (3 COLUMNS)        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Column 1: Sales Performance Trend Chart (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#0D6EFD]" />
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'أداء المبيعات' : 'Sales Performance'}
              </h3>
            </div>

            {/* Timeframe Segmented Pills */}
            <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-full text-[10px] sm:text-[11px] font-bold">
              <button
                onClick={() => setTimeframe('month')}
                className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
                  timeframe === 'month' ? 'bg-[#0D6EFD] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'هذا الشهر' : 'This Month'}
              </button>
              <button
                onClick={() => setTimeframe('quarter')}
                className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
                  timeframe === 'quarter' ? 'bg-[#0D6EFD] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'الربع الحالي' : 'Quarter'}
              </button>
              <button
                onClick={() => setTimeframe('year')}
                className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
                  timeframe === 'year' ? 'bg-[#0D6EFD] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ar' ? 'هذا العام' : 'Year'}
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-bold pt-3 px-1 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D6EFD]" />
              <span>{language === 'ar' ? 'الزيارات' : 'Visits'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>{language === 'ar' ? 'العروض' : 'Proposals'}</span>
            </div>
          </div>

          {/* SVG Smooth Curve Line Chart */}
          <div className="pt-2 relative flex-1 min-h-[190px]">
            <svg viewBox="0 0 460 170" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D6EFD" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0D6EFD" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="30" y1="20" x2="450" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="60" x2="450" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="100" x2="450" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="140" x2="450" y2="140" stroke="#F1F5F9" strokeWidth="1" />

              {/* Y Axis Numbers */}
              <text x="15" y="24" fontSize="10" fill="#94A3B8" fontFamily="monospace">20</text>
              <text x="15" y="64" fontSize="10" fill="#94A3B8" fontFamily="monospace">15</text>
              <text x="15" y="104" fontSize="10" fill="#94A3B8" fontFamily="monospace">10</text>
              <text x="15" y="144" fontSize="10" fill="#94A3B8" fontFamily="monospace">0</text>

              {/* Blue Curve Area & Line */}
              <path
                d="M 50 130 C 110 100, 150 110, 210 110 C 270 110, 310 95, 370 95 C 410 95, 430 40, 445 40 L 445 140 L 50 140 Z"
                fill="url(#blueGradient)"
              />
              <path
                d="M 50 130 C 110 100, 150 110, 210 110 C 270 110, 310 95, 370 95 C 410 95, 430 40, 445 40"
                fill="none"
                stroke="#0D6EFD"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Green Curve Area & Line */}
              <path
                d="M 50 138 C 110 120, 150 125, 210 125 C 270 125, 310 115, 370 115 C 410 115, 430 80, 445 80 L 445 140 L 50 140 Z"
                fill="url(#greenGradient)"
              />
              <path
                d="M 50 138 C 110 120, 150 125, 210 125 C 270 125, 310 115, 370 115 C 410 115, 430 80, 445 80"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Dots on Curves */}
              <circle cx="50" cy="130" r="3" fill="#0D6EFD" />
              <circle cx="130" cy="105" r="3" fill="#0D6EFD" />
              <circle cx="210" cy="110" r="3" fill="#0D6EFD" />
              <circle cx="290" cy="100" r="3" fill="#0D6EFD" />
              <circle cx="370" cy="95" r="3" fill="#0D6EFD" />
              <circle cx="445" cy="40" r="4.5" fill="#0D6EFD" stroke="#fff" strokeWidth="2" />

              <circle cx="50" cy="138" r="2.5" fill="#10B981" />
              <circle cx="130" cy="122" r="2.5" fill="#10B981" />
              <circle cx="210" cy="125" r="2.5" fill="#10B981" />
              <circle cx="290" cy="120" r="2.5" fill="#10B981" />
              <circle cx="370" cy="115" r="2.5" fill="#10B981" />
              <circle cx="445" cy="80" r="4" fill="#10B981" stroke="#fff" strokeWidth="2" />

              {/* Peak Badges */}
              <rect x="430" y="22" width="28" height="16" rx="8" fill="#0D6EFD" />
              <text x="444" y="34" fontSize="10" fill="#ffffff" fontWeight="bold" textAnchor="middle" fontFamily="monospace">18</text>

              <rect x="430" y="65" width="28" height="16" rx="8" fill="#10B981" />
              <text x="444" y="77" fontSize="10" fill="#ffffff" fontWeight="bold" textAnchor="middle" fontFamily="monospace">12</text>
            </svg>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-8 pt-1">
              <span>{language === 'ar' ? 'يناير' : 'Jan'}</span>
              <span>{language === 'ar' ? 'فبراير' : 'Feb'}</span>
              <span>{language === 'ar' ? 'مارس' : 'Mar'}</span>
              <span>{language === 'ar' ? 'أبريل' : 'Apr'}</span>
              <span>{language === 'ar' ? 'مايو' : 'May'}</span>
              <span>{language === 'ar' ? 'يونيو' : 'Jun'}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Pipeline Donut Chart (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <PieChart className="w-4 h-4 text-[#0D6EFD]" />
            <h3 className="font-bold text-sm text-slate-900">
              {language === 'ar' ? 'حالة المبيعات' : 'Sales Status Pipeline'}
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-3 flex-1">
            {/* Donut SVG with Center Counter */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />

                {/* Segment 1: Blue (New) 25% */}
                <circle
                  cx="50" cy="50" r="38"
                  fill="transparent"
                  stroke="#0D6EFD"
                  strokeWidth="12"
                  strokeDasharray="60 178"
                  strokeDashoffset="0"
                />
                {/* Segment 2: Orange (In FollowUp) 28% */}
                <circle
                  cx="50" cy="50" r="38"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="12"
                  strokeDasharray="68 170"
                  strokeDashoffset="-60"
                />
                {/* Segment 3: Purple (Proposal) 21% */}
                <circle
                  cx="50" cy="50" r="38"
                  fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth="12"
                  strokeDasharray="50 188"
                  strokeDashoffset="-128"
                />
                {/* Segment 4: Emerald (Closed) 25% */}
                <circle
                  cx="50" cy="50" r="38"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray="60 178"
                  strokeDashoffset="-178"
                />
              </svg>

              {/* Donut Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-mono text-slate-900 leading-none">
                  {totalSchools}
                </span>
                <span className="text-[11px] font-bold text-slate-500 mt-0.5">
                  {language === 'ar' ? 'مدرسة' : 'Schools'}
                </span>
              </div>
            </div>

            {/* Pipeline Stage Labels & Counts */}
            <div className="space-y-2 text-xs w-full sm:max-w-[170px] px-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D6EFD]" />
                  <span>{language === 'ar' ? 'جديدة' : 'New'}</span>
                </span>
                <span className="font-mono font-bold text-slate-700">{newSchools}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span>{language === 'ar' ? 'في المتابعة' : 'In Follow-up'}</span>
                </span>
                <span className="font-mono font-bold text-slate-700">{inFollowUp}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                  <span>{language === 'ar' ? 'عرض مقدم' : 'Proposal'}</span>
                </span>
                <span className="font-mono font-bold text-slate-700">{proposalSent}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span>{language === 'ar' ? 'مغلقة' : 'Closed Won'}</span>
                </span>
                <span className="font-mono font-bold text-slate-700">{closedWon}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Upcoming Tasks & Agenda (3 Cols) */}
        <div className="lg:col-span-3 rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#0D6EFD]" />
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'المهام القادمة' : 'Upcoming Tasks'}
              </h3>
            </div>
            <Link to="/visits" className="text-xs text-[#0D6EFD] font-bold hover:underline flex items-center gap-1">
              <span>{language === 'ar' ? 'عرض الكل' : 'View all'}</span>
              {dir === 'rtl' ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
            </Link>
          </div>

          {/* Agenda Task List Matching Reference Image */}
          <div className="space-y-3 pt-3 flex-1">
            {/* Task 1 */}
            <div className="flex items-start justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100/80">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-[#0D6EFD] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {language === 'ar' ? 'زيارة مدرسة النيل الدولية' : 'Nile International Visit'}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {language === 'ar' ? 'مع د. أحمد محمود' : 'With Dr. Ahmed Mahmoud'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-700 whitespace-nowrap shrink-0 bg-blue-50 px-2 py-0.5 rounded-md">
                {language === 'ar' ? 'غداً 10:00 ص' : 'Tmrw 10:00 AM'}
              </span>
            </div>

            {/* Task 2 */}
            <div className="flex items-start justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100/80">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {language === 'ar' ? 'متابعة عرض أكاديمية ROOTACA' : 'ROOTACA Academy Follow-up'}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {language === 'ar' ? 'مع أ. منى حسن' : 'With Ms. Mona Hassan'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-700 whitespace-nowrap shrink-0 bg-purple-50 px-2 py-0.5 rounded-md">
                {language === 'ar' ? 'غداً 02:00 م' : 'Tmrw 02:00 PM'}
              </span>
            </div>

            {/* Task 3 */}
            <div className="flex items-start justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition border border-slate-100/80">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {language === 'ar' ? 'اجتماع مع إدارة مدرسة المستقبل' : 'Al-Mustaqbal Board Meeting'}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {language === 'ar' ? 'عرض الحلول المقترحة' : 'Presenting Proposal'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 whitespace-nowrap shrink-0 bg-emerald-50 px-2 py-0.5 rounded-md">
                {language === 'ar' ? 'الخميس 11:00 ص' : 'Thu 11:00 AM'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
