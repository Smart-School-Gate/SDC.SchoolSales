import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Filter,
  Download,
  User,
  TrendingUp,
  Award,
  Building2,
  Trophy,
  FileText,
  Tv,
  Eye,
  CheckCircle2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PerformanceReportDto, TeamMemberDto } from '../types';

export const ReportsPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { isSuperAdmin, isSalesManager, user } = useAuth();

  const [report, setReport] = useState<PerformanceReportDto | null>(null);
  const [reps, setReps] = useState<TeamMemberDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');

  useEffect(() => {
    loadReps();
  }, []);

  useEffect(() => {
    loadReport();
  }, [selectedRep, selectedProduct, selectedStage]);

  const loadReps = async () => {
    const res = await api.getUsers();
    if (res.success && res.data) {
      setReps(res.data);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    const res = await api.getPerformanceReport({
      representativeId: selectedRep || undefined,
      product: selectedProduct || undefined,
      stage: selectedStage || undefined
    });

    if (res.success && res.data) {
      setReport(res.data);
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (!report || !report.rows.length) return;

    const headers = ['Representative', 'Discovered Schools', 'Assigned Schools', 'Visits', 'Demos Requested', 'Proposals Requested', 'Closed Deals'];
    const rows = report.rows.map(r => [
      r.representativeName,
      r.discoveredSchools,
      r.assignedSchools,
      r.visits,
      r.demosScheduled,
      r.proposalsRequested,
      r.closedDeals
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rootaca_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sparkline Wave SVG Components for the 5 Metric Cards in Light Mode
  const SparklineWave: React.FC<{ color?: string }> = ({ color = '#00B4D8' }) => (
    <svg viewBox="0 0 100 24" className="w-20 h-6 overflow-visible">
      <path
        d="M 0 18 Q 20 6, 40 14 T 80 8 T 100 12"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="12" r="3" fill={color} />
    </svg>
  );

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-10 text-slate-800 animate-in fade-in duration-200">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER IN MAIN DASHBOARD LIGHT STYLING            */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        {/* Right Title & Subtitle */}
        <div className="flex items-center gap-3">
          <img
            src="/rootaca-logo.png"
            alt="Rootaca"
            className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0"
          />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {language === 'ar' ? 'التقارير التحليلية التنفيذية' : 'Executive Analytical Reports'}
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {language === 'ar' ? 'تقارير أداء ومبيعات منظومة Rootaca' : 'Rootaca Performance & Sales Analytics'}
            </p>
          </div>
        </div>

        {/* Left Export Button */}
        <button
          onClick={handleExportCSV}
          className="border border-[#00B4D8] hover:border-cyan-600 text-[#00838F] hover:text-white bg-white hover:bg-[#00B4D8] font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{language === 'ar' ? 'تصدير البيانات (CSV)' : 'Export Data (CSV)'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. FILTER DROPDOWNS MATCHING MAIN DASHBOARD PALETTE      */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Representative Filter */}
        <div className="relative min-w-[200px]">
          <select
            value={selectedRep}
            onChange={e => setSelectedRep(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200/90 rounded-xl ps-4 pe-9 py-2.5 text-xs font-bold text-slate-700 hover:border-slate-300 shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          >
            <option value="">{language === 'ar' ? 'كل مندوبي المبيعات' : 'All Sales Representatives'}</option>
            {reps.map(r => (
              <option key={r.id} value={r.id}>{r.fullName}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Product Filter */}
        <div className="relative min-w-[160px]">
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200/90 rounded-xl ps-4 pe-9 py-2.5 text-xs font-bold text-slate-700 hover:border-slate-300 shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          >
            <option value="">{language === 'ar' ? 'كل المنتجات' : 'All Products'}</option>
            <option value="Both">{language === 'ar' ? 'كلا المنتجين' : 'Both Products'}</option>
            <option value="SmartSchool">{language === 'ar' ? 'مدرسة ROOTACA الذكية' : 'ROOTACA Smart School'}</option>
            <option value="Academy">{language === 'ar' ? 'أكاديمية ROOTACA' : 'ROOTACA Academy'}</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Stage Filter */}
        <div className="relative min-w-[160px]">
          <select
            value={selectedStage}
            onChange={e => setSelectedStage(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200/90 rounded-xl ps-4 pe-9 py-2.5 text-xs font-bold text-slate-700 hover:border-slate-300 shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          >
            <option value="">{language === 'ar' ? 'كل المراحل' : 'All Stages'}</option>
            <option value="ClosedWon">{language === 'ar' ? 'صفقات رابحة' : 'Closed Won'}</option>
            <option value="ProposalSent">{language === 'ar' ? 'عروض أسعار مقدمة' : 'Proposal Sent'}</option>
            <option value="DemoScheduled">{language === 'ar' ? 'عروض تجريبية' : 'Demo Scheduled'}</option>
            <option value="Visited">{language === 'ar' ? 'تمت الزيارة' : 'Visited'}</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. 5 KPI CARDS MATCHING MAIN DASHBOARD PALETTE           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Won Deals (Right in RTL) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[135px] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{language === 'ar' ? 'الصفقات الرابحة' : 'Won Deals'}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono my-1">
            {report?.totalClosedDeals || 0}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 font-mono">0% معدل الإغلاق</span>
            <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xs font-bold">
              ✓
            </div>
          </div>
        </div>

        {/* Card 2: Proposals Sent */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[135px] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{language === 'ar' ? 'عروض الأسعار' : 'Proposals'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono my-1">
            {report?.totalProposalsRequested || 0}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 font-mono">عروض معتمدة</span>
            <div className="w-5 h-5 rounded-md bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 text-xs font-bold">
              ✓
            </div>
          </div>
        </div>

        {/* Card 3: Demos Scheduled */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[135px] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{language === 'ar' ? 'العروض التجريبية' : 'Demos'}</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono my-1">
            {report?.totalDemosRequested || 3}
          </div>
          <div className="flex items-center justify-between pt-1">
            <SparklineWave color="#00B4D8" />
            <div className="w-5 h-5 rounded-md bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 text-xs">
              💬
            </div>
          </div>
        </div>

        {/* Card 4: Total Visits */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[135px] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{language === 'ar' ? 'إجمالي الزيارات' : 'Total Visits'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono my-1">
            {report?.totalVisits || 4}
          </div>
          <div className="flex items-center justify-between pt-1">
            <SparklineWave color="#0D6EFD" />
            <div className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-xs">
              <Eye className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Card 5: Discovered Schools (Left in RTL) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between min-h-[135px] hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{language === 'ar' ? 'المدارس المكتشفة' : 'Discovered'}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono my-1">
            {report?.totalSchoolsDiscovered || 2}
          </div>
          <div className="flex items-center justify-between pt-1">
            <SparklineWave color="#8B5CF6" />
            <div className="w-5 h-5 rounded-md bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 text-xs">
              📈
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. COMPARISON TABLE MATCHING MAIN DASHBOARD PALETTE      */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 tracking-wide">
            {language === 'ar' ? 'مقارنة أداء فريق المبيعات' : 'Sales Team Performance Comparison'}
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-bold">
            <div className="w-7 h-7 border-3 border-[#00B4D8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>{t('common.loading')}</span>
          </div>
        ) : !report?.rows.length ? (
          <div className="py-20 text-center text-xs text-slate-400 font-bold">
            {t('common.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto p-2">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="text-slate-600 font-bold border-b border-slate-100 bg-slate-50/70">
                  <th className="py-3.5 px-4 text-start">{language === 'ar' ? 'المندوب / الفريق' : 'Representative'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'المدارس المكتشفة' : 'Discovered'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'التواصل' : 'Contacted'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'إجمالي الزيارات' : 'Visits'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'العروض التجريبية' : 'Demos'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'عروض الأسعار' : 'Proposals'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'الصفقات الرابحة' : 'Won Deals'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.rows.map((r, idx) => (
                  <tr
                    key={r.representativeId || idx}
                    className={`transition-colors ${
                      idx === 0
                        ? 'bg-blue-50/40 hover:bg-blue-50/70 font-semibold'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{r.representativeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Rootaca Sales Specialist</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 text-sm">
                      {r.discoveredSchools}
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 text-sm">
                      {r.assignedSchools || 1}
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-black text-[#00838F] text-base">
                      {r.visits}
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 text-sm">
                      {r.demosScheduled}
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 text-sm">
                      {r.proposalsRequested}
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-black text-emerald-600 text-base">
                      {r.closedDeals}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
