import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  X,
  GripVertical,
  Bell,
  User,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { QuestionCategoryDto, QuestionTemplateDto, ProductInterest, AnswerType } from '../types';

export const DiscoveryBankPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { isSuperAdmin, isSalesManager, user } = useAuth();

  const [categories, setCategories] = useState<QuestionCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductInterest>('Both');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuestionTemplateDto | null>(null);
  const [form, setForm] = useState({
    categoryId: '',
    product: 'SmartSchool' as ProductInterest,
    questionAr: '',
    questionEn: '',
    guidanceAr: '',
    guidanceEn: '',
    answerType: 'Text' as AnswerType,
    optionsJson: '',
    isRequired: true,
    displayOrder: 1,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [selectedProduct]);

  const loadQuestions = async () => {
    setLoading(true);
    const res = await api.getDiscoveryQuestions(selectedProduct === 'Both' ? undefined : selectedProduct);
    if (res.success && res.data) {
      setCategories(res.data);
      if (res.data && res.data.length > 0 && !form.categoryId) {
        setForm(prev => ({ ...prev, categoryId: res.data![0].id }));
      }
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setForm({
      categoryId: categories[0]?.id || '',
      product: selectedProduct === 'Both' ? 'SmartSchool' : selectedProduct,
      questionAr: '',
      questionEn: '',
      guidanceAr: '',
      guidanceEn: '',
      answerType: 'Text',
      optionsJson: '',
      isRequired: true,
      displayOrder: 1,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: QuestionTemplateDto) => {
    setEditingTemplate(q);
    setForm({
      categoryId: q.categoryId,
      product: q.product,
      questionAr: q.questionAr,
      questionEn: q.questionEn,
      guidanceAr: q.guidanceAr || '',
      guidanceEn: q.guidanceEn || '',
      answerType: q.answerType,
      optionsJson: q.optionsJson || '',
      isRequired: q.isRequired,
      displayOrder: q.displayOrder,
      isActive: q.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingTemplate) {
      await api.updateQuestionTemplate(editingTemplate.id, {
        categoryId: form.categoryId,
        product: form.product,
        questionAr: form.questionAr,
        questionEn: form.questionEn,
        guidanceAr: form.guidanceAr || undefined,
        guidanceEn: form.guidanceEn || undefined,
        answerType: form.answerType,
        optionsJson: form.optionsJson || undefined,
        isRequired: form.isRequired,
        displayOrder: Number(form.displayOrder),
        isActive: form.isActive
      });
    } else {
      await api.createQuestionTemplate({
        categoryId: form.categoryId,
        product: form.product,
        questionAr: form.questionAr,
        questionEn: form.questionEn,
        guidanceAr: form.guidanceAr || undefined,
        guidanceEn: form.guidanceEn || undefined,
        answerType: form.answerType,
        optionsJson: form.optionsJson || undefined,
        isRequired: form.isRequired,
        displayOrder: Number(form.displayOrder),
        isActive: form.isActive
      });
    }

    setSubmitting(false);
    setIsModalOpen(false);
    loadQuestions();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا السؤال؟' : 'Delete this question template?')) {
      await api.deleteQuestionTemplate(id);
      loadQuestions();
    }
  };

  const getAnswerTypeBadge = (type: AnswerType) => {
    switch (type) {
      case 'Number':
        return (
          <span className="bg-[#DCFCE7] text-[#16A34A] rounded-lg px-2.5 py-0.5 text-xs font-bold">
            {language === 'ar' ? 'رقم' : 'Number'}
          </span>
        );
      case 'YesNo':
        return (
          <span className="bg-[#F3E8FF] text-[#9333EA] rounded-lg px-2.5 py-0.5 text-xs font-bold">
            {language === 'ar' ? 'نعم / لا' : 'Yes / No'}
          </span>
        );
      case 'SingleChoice':
        return (
          <span className="bg-[#FEF3C7] text-[#D97706] rounded-lg px-2.5 py-0.5 text-xs font-bold">
            {language === 'ar' ? 'اختيار مفرد' : 'Single Choice'}
          </span>
        );
      case 'MultipleChoice':
        return (
          <span className="bg-blue-100 text-blue-700 rounded-lg px-2.5 py-0.5 text-xs font-bold">
            {language === 'ar' ? 'اختيار متعدد' : 'Multiple'}
          </span>
        );
      default:
        return (
          <span className="bg-[#E0F7FA] text-[#00B4D8] rounded-lg px-2.5 py-0.5 text-xs font-bold">
            {language === 'ar' ? 'نص' : 'Text'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-10">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER MATCHING REFERENCE IMAGE 3                 */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Right Title in RTL */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'بنك الاستكشاف والتقييم' : 'Discovery & Evaluation Bank'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {language === 'ar' ? 'بنك أسئلة الاستكشاف' : 'Configurable Discovery Questionnaire Repository'}
          </p>
        </div>

        {/* Left Action Controls */}
        <div className="flex items-center gap-2.5">
          {(isSuperAdmin || isSalesManager) && (
            <button
              onClick={handleOpenAdd}
              className="bg-[#00B4D8] hover:bg-[#0096b4] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'ar' ? 'إضافة سؤال جديد' : 'Add Question'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. NAVIGATION STRIP (TABS + SEARCH INPUT)                */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        {/* Right: Tabs matching Screenshot */}
        <div className="flex items-center gap-6 text-xs font-bold">
          <button
            onClick={() => setSelectedProduct('Both')}
            className={`pb-2.5 transition-colors relative cursor-pointer ${
              selectedProduct === 'Both'
                ? 'text-[#00B4D8] font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{language === 'ar' ? 'كلا المنتجين (الكل)' : 'Both Products (All)'}</span>
            {selectedProduct === 'Both' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00B4D8] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setSelectedProduct('SmartSchool')}
            className={`pb-2.5 transition-colors relative cursor-pointer ${
              selectedProduct === 'SmartSchool'
                ? 'text-[#00B4D8] font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{language === 'ar' ? 'المدرسة الذكية' : 'Smart School'}</span>
            {selectedProduct === 'SmartSchool' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00B4D8] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setSelectedProduct('Academy')}
            className={`pb-2.5 transition-colors relative cursor-pointer ${
              selectedProduct === 'Academy'
                ? 'text-[#00B4D8] font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{language === 'ar' ? 'الأكاديمية' : 'Academy'}</span>
            {selectedProduct === 'Academy' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00B4D8] rounded-full" />
            )}
          </button>
        </div>

        {/* Left: Search input matching Screenshot */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? '...بحث عن سؤال' : 'Search question...'}
            className="w-full bg-white border border-slate-200 rounded-2xl py-2 ps-4 pe-9 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00B4D8] shadow-xs transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute end-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN CARD: "محرر الأسئلة" WITH 2-COLUMN CATEGORIES    */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-5">
        <h2 className="text-base font-black text-slate-900">
          {language === 'ar' ? 'محرر الأسئلة' : 'Questions Editor'}
        </h2>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 font-bold">
            {t('common.loading')}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 font-bold">
            {t('common.empty')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categories.map((cat, cIdx) => {
              const filteredQuestions = (cat.questions || []).filter(
                q => !searchTerm || q.questionAr.includes(searchTerm) || q.questionEn.toLowerCase().includes(searchTerm.toLowerCase())
              );

              const isMintHeader = cIdx === 3; // soft mint highlight matching reference screenshot Card 4

              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-2xs flex flex-col justify-between"
                >
                  {/* Category Header Bar */}
                  <div className={`px-5 py-3 border-b border-slate-100 flex items-center justify-between ${
                    isMintHeader ? 'bg-[#E6FFFA]' : 'bg-slate-50/60'
                  }`}>
                    <h3 className="text-xs font-black text-slate-900">
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </h3>
                  </div>

                  {/* Questions List Inside Category */}
                  <div className="p-4 space-y-3 flex-1">
                    {filteredQuestions.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400 font-semibold">
                        {language === 'ar' ? 'لا توجد أسئلة مسجلة في هذه الفئة' : 'No questions in this section'}
                      </div>
                    ) : (
                      filteredQuestions.map((q, qIdx) => (
                        <div
                          key={q.id || qIdx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors"
                        >
                          {/* Right: Question Text & Asterisk */}
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {language === 'ar' ? q.questionAr : q.questionEn}
                              {q.isRequired && <span className="text-rose-500 ms-0.5">*</span>}
                            </span>
                          </div>

                          {/* Center: Badge */}
                          <div className="shrink-0">
                            {getAnswerTypeBadge(q.answerType)}
                          </div>

                          {/* Left: Actions (Edit, Delete, Drag Handle) */}
                          <div className="flex items-center gap-1 shrink-0 text-slate-400">
                            {(isSuperAdmin || isSalesManager) && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(q)}
                                  className="w-6 h-6 rounded hover:bg-slate-100 hover:text-blue-600 flex items-center justify-center transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(q.id)}
                                  className="w-6 h-6 rounded hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. ADD / EDIT QUESTION MODAL                             */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingTemplate 
                  ? (language === 'ar' ? 'تعديل السؤال الاستكشافي' : 'Edit Question') 
                  : (language === 'ar' ? 'إضافة سؤال استكشافي جديد' : 'Add New Question')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'المجموعة الاستكشافية *' : 'Category *'}
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
                    {language === 'ar' ? 'نوع الإجابة *' : 'Answer Type *'}
                  </label>
                  <select
                    value={form.answerType}
                    onChange={e => setForm({ ...form, answerType: e.target.value as AnswerType })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B4D8] focus:bg-white focus:outline-none font-bold"
                  >
                    <option value="Text">{language === 'ar' ? 'نص (Text)' : 'Text'}</option>
                    <option value="Number">{language === 'ar' ? 'رقم (Number)' : 'Number'}</option>
                    <option value="YesNo">{language === 'ar' ? 'نعم / لا (Yes / No)' : 'Yes / No'}</option>
                    <option value="SingleChoice">{language === 'ar' ? 'اختيار مفرد (Single)' : 'Single Choice'}</option>
                    <option value="MultipleChoice">{language === 'ar' ? 'اختيار متعدد (Multiple)' : 'Multiple'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'نص السؤال (عربي) *' : 'Question Text (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.questionAr}
                  onChange={e => setForm({ ...form, questionAr: e.target.value })}
                  placeholder="مثال: ما هو البرنامج الحالي لإدارة المدرسة؟"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B4D8] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'نص السؤال (إنجليزي) *' : 'Question Text (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.questionEn}
                  onChange={e => setForm({ ...form, questionEn: e.target.value })}
                  placeholder="e.g. What is the current SIS system used?"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B4D8] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'توجيه المندوب أثناء الاستكشاف' : 'Rep Discovery Guidance'}
                </label>
                <textarea
                  rows={2}
                  value={form.guidanceAr}
                  onChange={e => setForm({ ...form, guidanceAr: e.target.value })}
                  placeholder="ملاحظات تساعد المندوب على فهم متطلبات المدرسة بدقة..."
                  className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#00B4D8] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isRequired}
                    onChange={e => setForm({ ...form, isRequired: e.target.checked })}
                    className="rounded text-[#00B4D8] focus:ring-[#00B4D8]"
                  />
                  <span>{language === 'ar' ? 'سؤال إلزامي في تقرير الزيارة' : 'Required Question'}</span>
                </label>
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
