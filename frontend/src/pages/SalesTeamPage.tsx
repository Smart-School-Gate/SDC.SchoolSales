import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  X,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TeamMemberDto, UserRole } from '../types';

export const SalesTeamPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState<TeamMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'SalesRepresentative' as UserRole
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success && res.data) {
        setMembers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await api.createUser({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
      roles: [form.role]
    });

    setSubmitting(false);
    if (res.success) {
      setIsModalOpen(false);
      setForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'SalesRepresentative'
      });
      loadTeam();
    } else {
      setError(res.message || 'Failed to create user');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const res = await api.setUserActiveStatus(id, !currentActive);
    if (res.success) {
      loadTeam();
    } else {
      alert(res.message || 'Action failed');
    }
  };

  const getRoleLabelAr = (roles?: string[]) => {
    const r = roles?.[0];
    if (r === 'SuperAdmin') return 'مدير النظام المميز';
    if (r === 'SalesManager') return 'مدير مبيعات';
    return 'ممثل مبيعات';
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || m.roles?.includes(filterRole as any);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header Ribbon Matching Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Link to="/" className="hover:text-slate-700 transition">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <span>›</span>
            <span className="text-slate-600 font-bold">
              {language === 'ar' ? 'إدارة المستخدمين والصلاحيات' : 'Users & Roles Management'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'إدارة المستخدمين والصلاحيات' : 'Users & Roles Management'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {language === 'ar' ? 'فريق المبيعات والمستخدمين' : 'Sales Team & Active Users'}
          </p>
        </div>

        {/* Cyan Add User Button */}
        <div>
          <button
            onClick={() => { setError(null); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0096C7] text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة مستخدم جديد للنظام' : 'Add New System User'}</span>
          </button>
        </div>
      </div>

      {/* Main Table Card Matching Image 1 */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        {/* Filter Strip */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-end gap-3 border-b border-slate-100">
          {/* Search Box */}
          <div className="relative w-72 max-w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'بحث عن مستخدم...' : 'Search user...'}
              className="w-full bg-[#F8FAFC] text-xs text-slate-800 placeholder-slate-400 rounded-xl py-2 ps-9 pe-4 border border-slate-200 focus:outline-none focus:border-cyan-400 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Role Filter Dropdown */}
          <div className="relative">
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 pe-8 text-slate-700 font-bold appearance-none cursor-pointer focus:outline-none focus:border-cyan-400"
            >
              <option value="all">{language === 'ar' ? 'تصفية: الكل' : 'Filter: All'}</option>
              <option value="SuperAdmin">{language === 'ar' ? 'مدير النظام' : 'SuperAdmin'}</option>
              <option value="SalesManager">{language === 'ar' ? 'مدير مبيعات' : 'SalesManager'}</option>
              <option value="SalesRepresentative">{language === 'ar' ? 'ممثل مبيعات' : 'Sales Rep'}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-[#F8FAFC] text-slate-600 font-bold border-b border-slate-200/80">
                <th className="py-3.5 px-4 text-start">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                <th className="py-3.5 px-3 text-center">{language === 'ar' ? 'الدور' : 'Role'}</th>
                <th className="py-3.5 px-3 text-center">{language === 'ar' ? 'المكتشفة' : 'Discovered'}</th>
                <th className="py-3.5 px-3 text-center">{language === 'ar' ? 'المعينة' : 'Assigned'}</th>
                <th className="py-3.5 px-3 text-center">{language === 'ar' ? 'الزيارات' : 'Visits'}</th>
                <th className="py-3.5 px-3 text-center">{language === 'ar' ? 'العقود المبرمة' : 'Closed Deals'}</th>
                <th className="py-3.5 px-3 text-center">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="py-3.5 px-4 text-end">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-slate-400">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>{t('common.loading')}</span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-slate-400">
                    {t('common.empty')}
                  </td>
                </tr>
              ) : (
                filteredMembers.map(m => {
                  const initials = m.fullName.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#E2E8F0] text-slate-700 font-bold flex items-center justify-center text-xs font-mono shrink-0">
                            {initials || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{m.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                              {m.email} {m.phone ? `• ${m.phone}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-3 py-1 rounded-md text-[11px] font-bold bg-[#0284C7] text-white">
                          {language === 'ar' ? getRoleLabelAr(m.roles) : (m.roles?.[0] || 'SalesRep')}
                        </span>
                      </td>

                      {/* Discovered Count */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                        {m.discoveredSchoolsCount ?? 0}
                      </td>

                      {/* Assigned Count */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                        {m.assignedSchoolsCount ?? 0}
                      </td>

                      {/* Visits Count */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                        {m.visitsCount ?? 0}
                      </td>

                      {/* Closed Deals Count */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                        0
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {m.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{language === 'ar' ? 'نشط' : 'Active'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>{language === 'ar' ? 'معطل' : 'Inactive'}</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          {/* Assign Schools Button */}
                          <Link
                            to={`/assignments?repId=${m.id}`}
                            className="px-2.5 py-1 rounded-lg border border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8] hover:text-white text-[11px] font-bold transition cursor-pointer"
                          >
                            {language === 'ar' ? 'تعيين المدارس' : 'Assign Schools'}
                          </Link>

                          {/* Deactivate / Activate Button */}
                          <button
                            onClick={() => handleToggleActive(m.id, m.isActive)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                              m.isActive
                                ? 'border-rose-400 text-rose-500 hover:bg-rose-50'
                                : 'border-emerald-400 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {m.isActive
                              ? (language === 'ar' ? 'تعطيل' : 'Deactivate')
                              : (language === 'ar' ? 'تفعيل' : 'Activate')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination Matching Image 1 */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {/* Pagination Pills */}
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition cursor-pointer">
              {language === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <span className="w-7 h-7 rounded-lg bg-[#00B4D8] text-white font-bold flex items-center justify-center font-mono text-xs shadow-xs">
              1
            </span>
            <button className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition cursor-pointer">
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>

          {/* Counter info */}
          <div className="font-bold text-slate-500 text-[11px]">
            {language === 'ar'
              ? `عرض 1-${filteredMembers.length} من أصل ${filteredMembers.length} مستخدمين`
              : `Showing 1-${filteredMembers.length} of ${filteredMembers.length} users`}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00B4D8]" />
                <span>{language === 'ar' ? 'إضافة مستخدم جديد للنظام' : 'Add New User'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  placeholder={language === 'ar' ? 'مثال: أحمد سمير' : 'e.g. Ahmed Samir'}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'البريد الإلكتروني (لتسجيل الدخول) *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  placeholder="rep@rootaca.com"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'كلمة المرور الأولية *' : 'Initial Password *'}
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  placeholder={language === 'ar' ? 'على الأقل 6 خانات...' : 'Min 6 characters...'}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  placeholder="+20 100 000 0000"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الدور الوظيفي والصلاحيات *' : 'User Role *'}
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                >
                  <option value="SalesRepresentative">{language === 'ar' ? 'ممثل مبيعات ميداني (SalesRepresentative)' : 'Sales Representative'}</option>
                  <option value="SalesManager">{language === 'ar' ? 'مدير مبيعات (SalesManager)' : 'Sales Manager'}</option>
                  {isSuperAdmin && <option value="SuperAdmin">{language === 'ar' ? 'مدير عام النظام (SuperAdmin)' : 'Super Administrator'}</option>}
                </select>
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
                  {submitting ? t('common.loading') : (language === 'ar' ? 'إنشاء المستخدم' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
