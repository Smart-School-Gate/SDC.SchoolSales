import React, { useState, useEffect } from 'react';
import {
  ShieldQuestion,
  Plus,
  Search,
  Lock,
  Unlock,
  Edit,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Folder,
  Shield,
  ArrowLeftRight,
  Headphones,
  Settings,
  Lightbulb,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { QACategoryDto, QATemplateDto, ProductInterest } from '../types';

export const KnowledgeBasePage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { isSuperAdmin, isSalesManager } = useAuth();

  const [categories, setCategories] = useState<QACategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCustomerMode, setIsCustomerMode] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'categories'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QATemplateDto | null>(null);
  const [form, setForm] = useState({
    categoryId: '',
    product: 'Both' as ProductInterest,
    questionAr: '',
    questionEn: '',
    answerAr: '',
    answerEn: '',
    internalNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQA();
  }, []);

  const loadQA = async () => {
    setLoading(true);
    const res = await api.getQA();
    if (res.success && res.data) {
      setCategories(res.data);
      if (res.data.length > 0) {
        // Expand first category by default matching reference image
        setExpandedCategories({ [res.data[0].id]: true });
        if (!form.categoryId) {
          setForm(prev => ({ ...prev, categoryId: res.data![0].id }));
        }
      }
    }
    setLoading(false);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      categoryId: categories[0]?.id || '',
      product: 'Both',
      questionAr: '',
      questionEn: '',
      answerAr: '',
      answerEn: '',
      internalNotes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: QATemplateDto) => {
    setEditingItem(item);
    setForm({
      categoryId: item.categoryId,
      product: item.product,
      questionAr: item.questionAr,
      questionEn: item.questionEn,
      answerAr: item.answerAr,
      answerEn: item.answerEn,
      internalNotes: item.internalNotes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingItem) {
      await api.updateQA(editingItem.id, {
        categoryId: form.categoryId,
        product: form.product,
        questionAr: form.questionAr,
        questionEn: form.questionEn,
        answerAr: form.answerAr,
        answerEn: form.answerEn,
        internalNotes: form.internalNotes || undefined,
        isActive: true,
        displayOrder: editingItem.displayOrder
      });
    } else {
      await api.createQA({
        categoryId: form.categoryId,
        product: form.product,
        questionAr: form.questionAr,
        questionEn: form.questionEn,
        answerAr: form.answerAr,
        answerEn: form.answerEn,
        internalNotes: form.internalNotes || undefined,
        isActive: true,
        displayOrder: 1
      });
    }

    setSubmitting(false);
    setIsModalOpen(false);
    loadQA();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا السؤال؟' : 'Delete this Q&A item?')) {
      await api.deleteQA(id);
      loadQA();
    }
  };

  const getCategoryIcon = (index: number) => {
    switch (index % 5) {
      case 0:
        return <Folder className="w-4 h-4 text-slate-700" />;
      case 1:
        return <Lock className="w-4 h-4 text-slate-700" />;
      case 2:
        return <ArrowLeftRight className="w-4 h-4 text-slate-700" />;
      case 3:
        return <Headphones className="w-4 h-4 text-slate-700" />;
      default:
        return <Settings className="w-4 h-4 text-slate-700" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-10">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER MATCHING REFERENCE IMAGE 1                 */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Right Title in RTL */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'بنك المعرفة والاعتراضات' : 'Objection Handling & Battlecards'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {language === 'ar' ? 'الاعتراضات والأسئلة الشائعة' : 'Frequently Asked Questions & Sales Battlecards'}
          </p>
        </div>

        {/* Left Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Mode Pill Badge */}
          <button
            onClick={() => setIsCustomerMode(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1528] text-amber-400 border border-slate-700 font-bold text-xs shadow-xs hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isCustomerMode 
                ? (language === 'ar' ? 'وضع العرض للعميل' : 'Customer View Mode') 
                : (language === 'ar' ? 'وضع المبيعات الداخلي' : 'Internal Sales Mode')}
            </span>
          </button>

          {/* Add Item Button */}
          {(isSuperAdmin || isSalesManager) && (
            <button
              onClick={handleOpenAdd}
              className="bg-[#00B4D8] hover:bg-[#0096b4] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'ar' ? 'إضافة سؤال واعتراض' : 'Add Q&A Item'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SEARCH BAR & FILTER PILLS                             */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search input with rounded pill styling matching screenshot */}
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'البحث في الأسئلة النموذجية...' : 'Search model questions...'}
            className="w-full bg-white border border-slate-200 rounded-full py-2.5 ps-4 pe-10 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00B4D8] shadow-xs transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilterTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              activeFilterTab === 'all'
                ? 'bg-slate-200/90 text-slate-800'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'ar' ? 'البحث في الأسئلة' : 'All Questions'}
          </button>
          <button
            onClick={() => setActiveFilterTab('categories')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              activeFilterTab === 'categories'
                ? 'bg-slate-200/90 text-slate-800'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'ar' ? 'المجموعات' : 'Categories'}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. ACCORDION CATEGORIES & CARDS MATCHING REFERENCE 1     */}
      {/* ======================================================== */}
      {loading ? (
        <div className="bg-white rounded-2xl p-20 text-center text-xs font-bold text-slate-400 border border-slate-100">
          <div className="w-8 h-8 border-3 border-[#00B4D8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>{t('common.loading')}</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center text-xs font-bold text-slate-400 border border-slate-100">
          <ShieldQuestion className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <span>{t('common.empty')}</span>
        </div>
      ) : (
        <div className="space-y-3.5">
          {categories.map((cat, idx) => {
            const isExpanded = !!expandedCategories[cat.id];
            const catItems = cat.items.filter(
              i => !search || 
                   i.questionAr.includes(search) || 
                   i.questionEn.toLowerCase().includes(search.toLowerCase()) || 
                   i.answerAr.includes(search)
            );

            if (catItems.length === 0 && search) return null;

            const categoryCode = `0${idx + 1}.`;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-start cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {getCategoryIcon(idx)}
                    <span className="text-sm font-black text-slate-900">
                      {categoryCode} {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isExpanded && (
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold font-mono text-[11px] flex items-center justify-center">
                        {catItems.length}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Accordion Expanded Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
                    {catItems.map((qa, qIdx) => (
                      <div key={qa.id || qIdx} className="space-y-3 pt-2 first:pt-0">
                        {/* Question */}
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-black text-slate-900">
                            س: {qa.questionAr}
                          </h4>

                          {/* Manager Actions */}
                          {(isSuperAdmin || isSalesManager) && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleOpenEdit(qa)}
                                className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 flex items-center justify-center"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(qa.id)}
                                className="w-6 h-6 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Proposed Script Response */}
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-slate-800">
                            {language === 'ar' ? 'الرد المقترح للعميل:' : 'Proposed Client Script:'}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {qa.answerAr}
                          </p>
                        </div>

                        {/* Rep Strategy Highlight Box (Yellow Box matching screenshot) */}
                        {qa.internalNotes && !isCustomerMode && (
                          <div className="bg-[#FEF9C3] border border-[#FDE047] rounded-xl p-3.5 text-xs text-slate-800 space-y-1 shadow-2xs">
                            <div className="font-black text-amber-900 flex items-center gap-1.5">
                              <span>💡</span>
                              <span>{language === 'ar' ? 'طريقة المندوب' : 'Sales Rep Strategy'}</span>
                            </div>
                            <p className="text-xs font-semibold text-amber-950">
                              {qa.internalNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. ADD / EDIT Q&A ITEM MODAL                             */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingItem 
                  ? (language === 'ar' ? 'تعديل السؤال والاعتراض' : 'Edit Q&A Item') 
                  : (language === 'ar' ? 'إضافة سؤال واعتراض جديد' : 'Add New Q&A Item')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'المجموعة التصنيفية *' : 'Category *'}
                </label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B4D8] focus:bg-white focus:outline-none font-bold"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {language === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'نص السؤال / الاعتراض المتوقع (عربي) *' : 'Question (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.questionAr}
                  onChange={e => setForm({ ...form, questionAr: e.target.value })}
                  placeholder="مثال: الخدمة غالية جداً مقارنة بالمنافسين؟"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B4D8] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'نص السؤال (إنجليزي) *' : 'Question (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.questionEn}
                  onChange={e => setForm({ ...form, questionEn: e.target.value })}
                  placeholder="e.g. Your solution is more expensive than competitors?"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B4D8] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الرد المقترح للعميل (عربي) *' : 'Suggested Answer (Arabic) *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.answerAr}
                  onChange={e => setForm({ ...form, answerAr: e.target.value })}
                  placeholder="نص الإجابة النموذجية الموجهة لمسؤول المدرسة..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B4D8] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الرد المقترح (إنجليزي) *' : 'Suggested Answer (English) *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.answerEn}
                  onChange={e => setForm({ ...form, answerEn: e.target.value })}
                  placeholder="Client response script in English..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B4D8] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-800 mb-1">
                  {language === 'ar' ? '💡 طريقة المندوب / التوجيه الداخلي للمبيعات' : 'Sales Rep Strategy'}
                </label>
                <textarea
                  rows={2}
                  value={form.internalNotes}
                  onChange={e => setForm({ ...form, internalNotes: e.target.value })}
                  placeholder="مثال: ركز على العائد على الاستثمار (ROI) وقيمة الميزات الحصرية التي نوفرها..."
                  className="w-full text-xs px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl focus:border-amber-400 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#00B4D8] hover:bg-[#0096b4] text-white text-xs font-black rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? t('common.loading') : (language === 'ar' ? 'حفظ السؤال' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
