import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserCheck, CheckSquare, Square, Building2, User, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SchoolDto, TeamMemberDto } from '../types';

export const AssignmentsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { isSuperAdmin, isSalesManager } = useAuth();
  const [searchParams] = useSearchParams();
  const queryRepId = searchParams.get('repId');

  const [unassignedSchools, setUnassignedSchools] = useState<SchoolDto[]>([]);
  const [reps, setReps] = useState<TeamMemberDto[]>([]);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [targetUserId, setTargetUserId] = useState<string>(queryRepId || '');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [unassignedRes, repsRes] = await Promise.all([
      api.getUnassignedSchools(),
      api.getUsers()
    ]);

    if (unassignedRes.success && unassignedRes.data) {
      setUnassignedSchools(unassignedRes.data);
    }

    if (repsRes.success && repsRes.data) {
      const activeReps = repsRes.data.filter(u => u.isActive);
      setReps(activeReps);
      if (activeReps.length > 0 && !targetUserId) {
        setTargetUserId(queryRepId || activeReps[0].id);
      }
    }

    setLoading(false);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedSchoolIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSchoolIds.length === unassignedSchools.length) {
      setSelectedSchoolIds([]);
    } else {
      setSelectedSchoolIds(unassignedSchools.map(s => s.id));
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSchoolIds.length === 0 || !targetUserId) return;

    setSubmitting(true);
    setSuccessMessage(null);

    const res = await api.bulkAssign({
      schoolIds: selectedSchoolIds,
      assignedToUserId: targetUserId,
      notes: assignmentNotes || undefined
    });

    setSubmitting(false);
    if (res.success) {
      setSuccessMessage(res.message || 'Schools assigned successfully!');
      setSelectedSchoolIds([]);
      setAssignmentNotes('');
      loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      alert(res.message || 'Assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {language === 'ar' ? 'توزيع المحافظ والحصص البيعية' : 'Territory & Account Distribution'}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
          <UserCheck className="w-5 h-5 text-blue-600" />
          <span>{t('nav.assignments')}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'ar' ? 'توزيع المدارس غير المسندة على مسؤولي المبيعات الميدانية والتوجيه الإداري' : 'Assign unassigned schools to sales representatives and manage team account distribution.'}
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Assignment Control Box */}
      <div className="editorial-panel p-5">
        <form onSubmit={handleAssignSubmit} className="flex flex-col md:flex-row items-end gap-4">
          <div className="w-full md:w-72">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'ar' ? 'المندوب المستهدف *' : 'Target Sales Representative *'}
            </label>
            <select
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-900"
            >
              {reps.map(r => (
                <option key={r.id} value={r.id}>
                  {r.fullName} ({r.assignedSchoolsCount} {language === 'ar' ? 'مدرسة مسندة' : 'assigned'})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {language === 'ar' ? 'ملاحظات التوزيع والتوجيه (اختياري)' : 'Assignment Directives (Optional)'}
            </label>
            <input
              type="text"
              value={assignmentNotes}
              onChange={e => setAssignmentNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded"
              placeholder={language === 'ar' ? 'أهداف الزيارة الأولى أو توجيهات المتابعة...' : 'Visit goals or directives...'}
            />
          </div>

          <div className="w-full md:w-auto">
            <button
              type="submit"
              disabled={selectedSchoolIds.length === 0 || submitting}
              className="w-full md:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {language === 'ar' ? `تأكيد توزيع (${selectedSchoolIds.length}) مدرسة` : `Assign (${selectedSchoolIds.length}) Schools`}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Unassigned Schools Table */}
      <div className="editorial-panel overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer"
            >
              {selectedSchoolIds.length === unassignedSchools.length && unassignedSchools.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{language === 'ar' ? 'تحديد الكل' : 'Select All'}</span>
            </button>
            <span className="text-xs text-slate-400">
              ({selectedSchoolIds.length} {language === 'ar' ? 'محدد' : 'selected'})
            </span>
          </div>

          <span className="text-xs font-bold text-slate-700">
            {language === 'ar' ? `المدارس غير الموزعة: ${unassignedSchools.length}` : `Unassigned: ${unassignedSchools.length}`}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">{t('common.loading')}</div>
        ) : unassignedSchools.length === 0 ? (
          <div className="py-16 text-center text-xs text-emerald-700 font-semibold flex flex-col items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{language === 'ar' ? 'رائع! تم توزيع جميع المدارس ولا توجد مدارس معلقة' : 'All schools are currently assigned.'}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3 px-4 w-10 text-center"></th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'المدرسة' : 'School'}</th>
                  <th className="py-3 px-4 text-start">{t('common.city')}</th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'نوع المدرسة' : 'Type'}</th>
                  <th className="py-3 px-4 text-start">{t('workspace.creator')}</th>
                  <th className="py-3 px-4 text-start">{language === 'ar' ? 'تاريخ الإضافة' : 'Added On'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unassignedSchools.map(s => {
                  const isChecked = selectedSchoolIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => handleToggleSelect(s.id)}
                      className={`cursor-pointer transition-colors ${isChecked ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'}`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-blue-600"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4 text-slate-600">{s.city}</td>
                      <td className="py-3 px-4 text-slate-600">{t(`schoolType.${s.schoolType}`)}</td>
                      <td className="py-3 px-4 font-medium text-blue-700">{s.createdByUserName}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{new Date(s.createdAtUtc).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
