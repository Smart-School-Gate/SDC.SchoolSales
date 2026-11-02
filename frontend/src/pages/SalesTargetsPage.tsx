import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Building2,
  CalendarDays,
  Tv,
  FileText,
  Handshake,
  User,
  X,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SalesTargetDto, PeriodType, TeamMemberDto } from '../types';

export const SalesTargetsPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { isSuperAdmin, isSalesManager, user } = useAuth();

  const [targets, setTargets] = useState<SalesTargetDto[]>([]);
  const [reps, setReps] = useState<TeamMemberDto[]>([]);
  const [selectedRepId, setSelectedRepId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedPeriodType, setSelectedPeriodType] = useState<PeriodType>('Monthly');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    periodType: 'Monthly' as PeriodType,
    periodYear: new Date().getFullYear(),
    periodNumber: new Date().getMonth() + 1,
    targetNewSchools: 10,
    targetVisits: 20,
    targetDecisionMakersReached: 15,
    targetDemosScheduled: 5,
    targetProposalsRequested: 4,
    targetClosedDeals: 2,
    notes: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTargets();
  }, [selectedYear, selectedPeriodType]);

  useEffect(() => {
    if (isSuperAdmin || isSalesManager) {
      loadReps();
    }
  }, []);

  const loadReps = async () => {
    const res = await api.getUsers();
    if (res.success && res.data) {
      const active = res.data.filter(u => u.isActive);
      setReps(active);
      if (active.length > 0 && !selectedRepId) {
        setSelectedRepId(active[0].id);
      }
      if (active.length > 0 && !form.userId) {
        setForm(prev => ({ ...prev, userId: active[0].id }));
      }
    }
  };

  const loadTargets = async () => {
    setLoading(true);
    try {
      const res = await api.getTargets(selectedYear, selectedPeriodType);
      if (res.success && res.data) {
        setTargets(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const res = await api.createTarget({
      userId: form.userId,
      periodType: form.periodType,
      periodYear: Number(form.periodYear),
      periodNumber: Number(form.periodNumber),
      targetNewSchools: Number(form.targetNewSchools),
      targetVisits: Number(form.targetVisits),
      targetDecisionMakersReached: Number(form.targetDecisionMakersReached),
      targetDemosScheduled: Number(form.targetDemosScheduled),
      targetProposalsRequested: Number(form.targetProposalsRequested),
      targetClosedDeals: Number(form.targetClosedDeals),
      notes: form.notes || undefined
    });

    setSubmitting(false);
    if (res.success) {
      setIsModalOpen(false);
      loadTargets();
    } else {
      setFormError(res.message || 'Failed to create target');
    }
  };

  // Find active target for display (or fallbacks matching Image 2)
  const activeTarget = (selectedRepId ? targets.find(t => t.userId === selectedRepId) : targets[0]) || null;

  const targetSchools = activeTarget?.targetNewSchools || 10;
  const actualSchools = activeTarget?.actualNewSchools || 0;
  const pctSchools = targetSchools > 0 ? Math.min(100, Math.round((actualSchools / targetSchools) * 100)) : 0;

  const targetVisits = activeTarget?.targetVisits || 20;
  const actualVisits = activeTarget?.actualVisits || 0;
  const pctVisits = targetVisits > 0 ? Math.min(100, Math.round((actualVisits / targetVisits) * 100)) : 0;

  const targetDemos = activeTarget?.targetDemosScheduled || 5;
  const actualDemos = activeTarget?.actualDemosScheduled || 0;
  const pctDemos = targetDemos > 0 ? Math.min(100, Math.round((actualDemos / targetDemos) * 100)) : 0;

  const targetProposals = activeTarget?.targetProposalsRequested || 4;
  const actualProposals = activeTarget?.actualProposalsRequested || 0;
  const pctProposals = targetProposals > 0 ? Math.min(100, Math.round((actualProposals / targetProposals) * 100)) : 0;

  const targetClosed = activeTarget?.targetClosedDeals || 2;
  const actualClosed = activeTarget?.actualClosedDeals || 0;
  const pctClosed = targetClosed > 0 ? Math.min(100, Math.round((actualClosed / targetClosed) * 100)) : 0;

  const overallPct = activeTarget?.overallAchievementRate || Math.round((pctSchools + pctVisits + pctDemos + pctProposals + pctClosed) / 5);

  return (
    <div className="space-y-6">
      {/* Top Header Matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Right side in RTL (or left in LTR) */}
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-500 tracking-wider">
            {language === 'ar' ? 'مبيعات Rootaca' : 'Rootaca Sales'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'لوحة متابعة الأداء الشهري' : 'Monthly Performance Dashboard'}
          </h1>
        </div>

        {/* Left side in RTL (Month Amber Badge & Rep Picker) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {(isSuperAdmin || isSalesManager) && reps.length > 0 && (
            <select
              value={selectedRepId}
              onChange={e => setSelectedRepId(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 shadow-2xs"
            >
              {reps.map(r => (
                <option key={r.id} value={r.id}>{r.fullName}</option>
              ))}
            </select>
          )}

          {/* Golden Amber Month Badge Matching Image 2 */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDF6B2] text-[#B45309] border border-[#FDE047] font-bold text-xs shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
            <span>{language === 'ar' ? 'نوفمبر 2026' : 'November 2026'}</span>
          </div>

          {(isSuperAdmin || isSalesManager) && (
            <button
              onClick={() => { setFormError(null); setIsModalOpen(true); }}
              className="px-3.5 py-1.5 bg-[#00B4D8] hover:bg-[#0096C7] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 inline me-1" />
              <span>{language === 'ar' ? 'تحديد هدف' : 'Set Target'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 Metric Cards Grid Matching Image 2 (3 Columns, 2 Rows) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Semi-Circle Gauge: معدل إنجاز الحصة الشهرية */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <h3 className="font-bold text-sm text-slate-900">
            {language === 'ar' ? 'معدل إنجاز الحصة الشهرية' : 'Monthly Quota Achievement Rate'}
          </h3>

          {/* Semi-Circle SVG Radial Gauge */}
          <div className="relative w-48 h-28 mx-auto mt-2 flex items-center justify-center">
            <svg viewBox="0 0 160 90" className="w-full h-full overflow-visible">
              {/* Background Arch */}
              <path
                d="M 15 80 A 65 65 0 0 1 145 80"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Progress Arch */}
              <path
                d="M 15 80 A 65 65 0 0 1 145 80"
                fill="none"
                stroke="#00B4D8"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="204"
                strokeDashoffset={204 - (204 * overallPct) / 100}
              />
            </svg>

            {/* Gauge Center Text */}
            <div className="absolute bottom-1 inset-x-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black font-mono text-slate-900 leading-none">
                {overallPct}%
              </span>
              <span className="text-[11px] font-bold text-slate-400 mt-1">
                {language === 'ar' ? 'نسبة الإنجاز' : 'Achievement'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: المدارس المكتشفة */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              {language === 'ar' ? 'المدارس المكتشفة' : 'Discovered Schools'}
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-mono text-slate-900">
                {actualSchools}/{targetSchools}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">{pctSchools}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B4D8] rounded-full transition-all duration-500"
                style={{ width: `${pctSchools}%` }}
              />
            </div>

            <div className="text-xs font-bold text-slate-500 pt-1">
              {language === 'ar'
                ? `الهدف: ${targetSchools} • الحالي: ${actualSchools}`
                : `Target: ${targetSchools} • Current: ${actualSchools}`}
            </div>
          </div>
        </div>

        {/* Card 3: الزيارات المنجزة */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              {language === 'ar' ? 'الزيارات المنجزة' : 'Completed Visits'}
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shadow-2xs">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-mono text-slate-900">
                {actualVisits}/{targetVisits}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">{pctVisits}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B4D8] rounded-full transition-all duration-500"
                style={{ width: `${pctVisits}%` }}
              />
            </div>

            <div className="text-xs font-bold text-slate-500 pt-1">
              {language === 'ar'
                ? `الهدف: ${targetVisits} • الحالي: ${actualVisits}`
                : `Target: ${targetVisits} • Current: ${actualVisits}`}
            </div>
          </div>
        </div>

        {/* Card 4: طلبات العرض التفاعلي */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              {language === 'ar' ? 'طلبات العرض التفاعلي' : 'Interactive Demo Requests'}
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shadow-2xs">
              <Tv className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-mono text-slate-900">
                {actualDemos}/{targetDemos}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">{pctDemos}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B4D8] rounded-full transition-all duration-500"
                style={{ width: `${pctDemos}%` }}
              />
            </div>

            <div className="text-xs font-bold text-slate-500 pt-1">
              {language === 'ar'
                ? `الهدف: ${targetDemos} • الحالي: ${actualDemos}`
                : `Target: ${targetDemos} • Current: ${actualDemos}`}
            </div>
          </div>
        </div>

        {/* Card 5: طلبات تقديم العروض الفنية والمالية */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              {language === 'ar' ? 'طلبات تقديم العروض الفنية والمالية' : 'Proposals & Quotes Requested'}
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-mono text-slate-900">
                {actualProposals}/{targetProposals}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">{pctProposals}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B4D8] rounded-full transition-all duration-500"
                style={{ width: `${pctProposals}%` }}
              />
            </div>

            <div className="text-xs font-bold text-slate-500 pt-1">
              {language === 'ar'
                ? `الهدف: ${targetProposals} • الحالي: ${actualProposals}`
                : `Target: ${targetProposals} • Current: ${actualProposals}`}
            </div>
          </div>
        </div>

        {/* Card 6: الصفقات المغلقة والناجحة */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              {language === 'ar' ? 'الصفقات المغلقة والناجحة' : 'Closed Deals Won'}
            </h3>
            <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shadow-2xs">
              <Handshake className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-mono text-slate-900">
                {actualClosed}/{targetClosed}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">{pctClosed}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B4D8] rounded-full transition-all duration-500"
                style={{ width: `${pctClosed}%` }}
              />
            </div>

            <div className="text-xs font-bold text-slate-500 pt-1">
              {language === 'ar'
                ? `الهدف: ${targetClosed} • الحالي: ${actualClosed}`
                : `Target: ${targetClosed} • Current: ${actualClosed}`}
            </div>
          </div>
        </div>
      </div>

      {/* Set Target Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00B4D8]" />
                <span>{language === 'ar' ? 'تحديد هدف مبيعات شهري' : 'Set Sales Target'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'المندوب *' : 'Representative *'}</label>
                  <select
                    value={form.userId}
                    onChange={e => setForm({ ...form, userId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    {reps.map(r => (
                      <option key={r.id} value={r.id}>{r.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'السنة' : 'Year'}</label>
                  <input
                    type="number"
                    value={form.periodYear}
                    onChange={e => setForm({ ...form, periodYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'مستهدف المدارس' : 'Schools Target'}</label>
                  <input
                    type="number"
                    value={form.targetNewSchools}
                    onChange={e => setForm({ ...form, targetNewSchools: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'مستهدف الزيارات' : 'Visits Target'}</label>
                  <input
                    type="number"
                    value={form.targetVisits}
                    onChange={e => setForm({ ...form, targetVisits: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'مستهدف العروض الحية' : 'Demos Target'}</label>
                  <input
                    type="number"
                    value={form.targetDemosScheduled}
                    onChange={e => setForm({ ...form, targetDemosScheduled: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'مستهدف عروض الأسعار' : 'Proposals Target'}</label>
                  <input
                    type="number"
                    value={form.targetProposalsRequested}
                    onChange={e => setForm({ ...form, targetProposalsRequested: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'مستهدف الصفقات' : 'Deals Target'}</label>
                  <input
                    type="number"
                    value={form.targetClosedDeals}
                    onChange={e => setForm({ ...form, targetClosedDeals: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#00B4D8] hover:bg-[#0096C7] text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {submitting ? t('common.loading') : (language === 'ar' ? 'حفظ المستهدف' : 'Save Target')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
