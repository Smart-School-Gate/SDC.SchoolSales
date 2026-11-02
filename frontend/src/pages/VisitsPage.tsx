import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, 
  Search, 
  Download, 
  ChevronDown, 
  Calendar, 
  User, 
  Clock, 
  Bell, 
  ChevronsRight, 
  ChevronRight, 
  ChevronLeft, 
  ChevronsLeft 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { VisitSummaryDto, VisitOutcomeType } from '../types';

export const VisitsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [visits, setVisits] = useState<VisitSummaryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadVisits();
  }, [pageIndex, selectedOutcome, selectedProduct]);

  const loadVisits = async () => {
    setLoading(true);
    const res = await api.getVisits({
      pageIndex,
      pageSize: 25,
      outcome: selectedOutcome || undefined,
      product: selectedProduct || undefined
    });

    if (res.success && res.data) {
      setVisits(res.data.items);
      setTotalCount(res.data.totalCount);
    }
    setLoading(false);
  };

  const getOutcomeBadge = (outcome: VisitOutcomeType) => {
    switch (outcome) {
      case 'DemoRequested':
        return 'bg-[#00B4D8] text-white';
      case 'MeetingScheduled':
        return 'bg-[#F59E0B] text-white';
      case 'ProposalRequested':
        return 'bg-[#0284C7] text-white';
      case 'ClosedWon':
        return 'bg-[#10B981] text-white';
      case 'ClosedLost':
        return 'bg-[#EF4444] text-white';
      default:
        return 'bg-[#64748B] text-white';
    }
  };

  const getOutcomeLabel = (outcome: VisitOutcomeType) => {
    switch (outcome) {
      case 'DemoRequested':
        return language === 'ar' ? 'طلب عرض تفاعلي' : 'Interactive Demo Requested';
      case 'MeetingScheduled':
        return language === 'ar' ? 'تم جدولة اجتماع مجلس الإدارة' : 'Board Meeting Scheduled';
      case 'ProposalRequested':
        return language === 'ar' ? 'طلب عرض فني ومالي' : 'Proposal Requested';
      case 'ClosedWon':
        return language === 'ar' ? 'تم توقيع العقد بنجاح' : 'Closed Won';
      case 'ClosedLost':
        return language === 'ar' ? 'صفقة ملغاة' : 'Closed Lost';
      case 'FollowUpLater':
        return language === 'ar' ? 'متابعة لاحقة' : 'Follow Up Later';
      default:
        return outcome;
    }
  };

  const getProductLabel = (prod?: string) => {
    if (prod === 'SmartSchool') return language === 'ar' ? 'مدرسة ROOTACA الذكية' : 'ROOTACA Smart School';
    if (prod === 'Academy') return language === 'ar' ? 'أكاديمية ROOTACA' : 'ROOTACA Academy';
    return language === 'ar' ? 'كلا المنتجين' : 'Both Products';
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === visits.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visits.map(v => v.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredVisits = visits.filter(v => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.contactPerson?.toLowerCase().includes(term) ||
      v.representativeName?.toLowerCase().includes(term) ||
      v.nextAction?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-10">
      {/* Top Header matching reference image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'سجلات الأنشطة الميدانية' : 'Field Operations Log'}
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-0.5">
            {language === 'ar' ? 'تقارير الزيارات' : 'Visit Reports'}
          </p>
        </div>
      </div>

      {/* Top Filter and Highlight Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Filter Bar Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-3 shadow-sm border border-slate-200/70 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button 
            onClick={() => alert(language === 'ar' ? 'جاري تصدير التقرير بصيغة Excel...' : 'Exporting Excel...')}
            className="bg-[#00B4D8] hover:bg-[#0096b4] text-white font-bold text-xs px-5 sm:px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <span>{language === 'ar' ? 'تصدير' : 'Export'}</span>
          </button>

          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl ps-9 pe-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00B4D8] focus:bg-white transition-all"
            />
          </div>

          <div className="relative flex-1 sm:flex-none min-w-[130px]">
            <select
              value={selectedProduct}
              onChange={e => { setSelectedProduct(e.target.value); setPageIndex(1); }}
              className="w-full appearance-none bg-slate-50/80 border border-slate-200 rounded-xl ps-3 pe-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:border-[#00B4D8]"
            >
              <option value="">{language === 'ar' ? 'كل المنتجات' : 'All Products'}</option>
              <option value="SmartSchool">{language === 'ar' ? 'مدرسة ROOTACA الذكية' : 'ROOTACA Smart School'}</option>
              <option value="Academy">{language === 'ar' ? 'أكاديمية ROOTACA' : 'ROOTACA Academy'}</option>
              <option value="Both">{language === 'ar' ? 'كلا المنتجين' : 'Both Products'}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative flex-1 sm:flex-none min-w-[130px]">
            <select
              value={selectedOutcome}
              onChange={e => { setSelectedOutcome(e.target.value); setPageIndex(1); }}
              className="w-full appearance-none bg-slate-50/80 border border-slate-200 rounded-xl ps-3 pe-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus:border-[#00B4D8]"
            >
              <option value="">{language === 'ar' ? 'كل النتائج' : 'All Outcomes'}</option>
              <option value="DemoRequested">{language === 'ar' ? 'طلب عرض تفاعلي' : 'Demo Requested'}</option>
              <option value="MeetingScheduled">{language === 'ar' ? 'اجتماع مجلس الإدارة' : 'Meeting Scheduled'}</option>
              <option value="ProposalRequested">{language === 'ar' ? 'طلب عرض فني ومالي' : 'Proposal Requested'}</option>
              <option value="ClosedWon">{language === 'ar' ? 'صفقة رابحة' : 'Closed Won'}</option>
              <option value="ClosedLost">{language === 'ar' ? 'صفقة ملغاة' : 'Closed Lost'}</option>
              <option value="FollowUpLater">{language === 'ar' ? 'متابعة لاحقة' : 'Follow Up Later'}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Cyan Highlight Card matching reference image 3 */}
        <div className="lg:col-span-4 bg-[#00B4D8] rounded-2xl p-4 shadow-sm text-white flex items-center justify-between">
          <div className="text-3xl sm:text-4xl font-black tracking-tight">
            {totalCount || (visits.length > 0 ? visits.length : 4)}
          </div>
          <div className="flex items-center gap-3 text-right">
            <div className="text-xs sm:text-sm font-bold leading-snug">
              {language === 'ar' 
                ? `إجمالي الزيارات الميدانية التي تم إجراؤها وتسجيلها (${totalCount || visits.length})` 
                : `Total recorded field visits (${totalCount || visits.length})`}
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card matching reference image 3 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">
            {language === 'ar' ? 'سجل الزيارات الميدانية' : 'Field Visits Log'}
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm font-medium text-slate-400">
            {t('common.loading')}
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="py-20 text-center text-sm font-medium text-slate-400">
            {language === 'ar' ? 'لا توجد زيارات مسجلة تطابق معايير البحث' : 'No visits match your criteria'}
          </div>
        ) : (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[760px] text-xs text-start">
              <thead>
                <tr className="border-b border-slate-100 text-slate-700 font-bold bg-slate-50/50">
                  <th className="py-3.5 px-4 text-center w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === visits.length && visits.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-[#00B4D8] focus:ring-[#00B4D8] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 text-right">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="py-3.5 px-4 text-right">{language === 'ar' ? 'المقابل / متخذ القرار' : 'Contact / Decision Maker'}</th>
                  <th className="py-3.5 px-4 text-right">{language === 'ar' ? 'الممثل' : 'Representative'}</th>
                  <th className="py-3.5 px-4 text-right">{language === 'ar' ? 'المنتجات' : 'Products'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'النتيجة' : 'Outcome'}</th>
                  <th className="py-3.5 px-4 text-right">{language === 'ar' ? 'الإجراء التالي' : 'Next Action'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'ملف المدرسة' : 'Workspace'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.map((v, idx) => (
                  <tr key={v.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(v.id)}
                        onChange={() => toggleSelectOne(v.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#00B4D8] focus:ring-[#00B4D8] cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {new Date(v.visitDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-black text-xs shrink-0">
                          {v.contactPerson ? v.contactPerson.slice(0, 2) : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {v.contactPerson || (language === 'ar' ? 'إدارة المدرسة' : 'School Management')}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                            {v.decisionMakerReached 
                              ? (language === 'ar' ? 'متخذ القرار' : 'Decision Maker') 
                              : (language === 'ar' ? 'ممثل المدرسة' : 'Representative')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">Rootaca</div>
                      <div className="text-[11px] text-slate-400">{v.representativeName || 'SuperAdmin'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      {getProductLabel(v.interestedProducts)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold shadow-sm ${getOutcomeBadge(v.visitOutcome)}`}>
                        {getOutcomeLabel(v.visitOutcome)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {v.nextAction || (language === 'ar' ? 'متابعة هاتفية' : 'Phone Follow-up')}
                      </div>
                      {v.nextFollowUpDate && (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {new Date(v.nextFollowUpDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Link
                        to={`/schools/${v.schoolId}`}
                        className="inline-block bg-[#007791] hover:bg-[#005f73] text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        {language === 'ar' ? 'ملف المدرسة' : 'Workspace'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination matching reference image 3 */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-600">
          <button 
            disabled={pageIndex <= 1}
            onClick={() => setPageIndex(1)}
            className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
          <button 
            disabled={pageIndex <= 1}
            onClick={() => setPageIndex(p => Math.max(1, p - 1))}
            className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span className="w-7 h-7 rounded bg-[#00B4D8] text-white font-bold flex items-center justify-center shadow-sm">
            {pageIndex}
          </span>
          <button 
            onClick={() => setPageIndex(p => p + 1)}
            className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setPageIndex(Math.max(1, Math.ceil(totalCount / 25)))}
            className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
