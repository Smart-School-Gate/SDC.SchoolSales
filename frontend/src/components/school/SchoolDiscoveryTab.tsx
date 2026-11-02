import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  Edit2,
  Save,
  X,
  Search,
  Sparkles,
  Layers,
  Code2,
  Briefcase,
  DollarSign,
  Clock,
  Shield,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
  Phone,
  FileCheck,
  CheckCircle,
  Database,
  Server,
  Smartphone,
  Bus,
  Users,
  Award,
  AlertTriangle,
  Building2,
  GraduationCap
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  SchoolDetailDto,
  QuestionCategoryDto,
  QuestionTemplateDto
} from '../../types';

interface SchoolDiscoveryTabProps {
  school: SchoolDetailDto;
  onSchoolUpdated: (updatedSchool: SchoolDetailDto) => void;
}

export const SchoolDiscoveryTab: React.FC<SchoolDiscoveryTabProps> = ({
  school,
  onSchoolUpdated
}) => {
  const { language, dir } = useLanguage();
  const { isSuperAdmin } = useAuth();

  const [categories, setCategories] = useState<QuestionCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionFilter, setActiveSectionFilter] = useState<
    'all' | 'basic' | 'sms' | 'comm' | 'transport' | 'finance' | 'volume' | 'academy' | 'budget' | 'specific' | 'verification' | 'outcome'
  >('all');

  // Answers State: map of questionId -> answer string
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savingAnswerId, setSavingAnswerId] = useState<string | null>(null);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [tempAnswerText, setTempAnswerText] = useState('');

  // SuperAdmin Question Edit Modal
  const [editingQuestion, setEditingQuestion] = useState<QuestionTemplateDto | null>(null);
  const [editQuestionAr, setEditQuestionAr] = useState('');
  const [editQuestionEn, setEditQuestionEn] = useState('');
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [editQuestionError, setEditQuestionError] = useState<string | null>(null);

  // Visit Outcome State (Section 11)
  const [isEditingOutcome, setIsEditingOutcome] = useState(false);
  const [savingOutcome, setSavingOutcome] = useState(false);
  const [outcomeForm, setOutcomeForm] = useState({
    problems: '',
    products: '',
    solution: '',
    academyOpportunities: '',
    integrations: '',
    missingData: '',
    decisionMakerNextStep: '',
    expectedDate: '',
    opportunityStage: 'Qualified'
  });

  // Check which school is open for tailored questions
  const schoolNameLower = (school.name || '').toLowerCase();
  const isHelsinki = schoolNameLower.includes('helsinki') || schoolNameLower.includes('hsis');
  const isRowad = schoolNameLower.includes('rowad') || schoolNameLower.includes('رواد');

  // Load questions categories and school answers
  useEffect(() => {
    loadDiscoveryData();
  }, [school.id]);

  const loadDiscoveryData = async () => {
    setLoading(true);
    try {
      const res = await api.getDiscoveryQuestions();
      if (res.success && res.data) {
        setCategories(res.data);
      }

      // Parse school answers from school.discoveryAnswersJson
      if (school.discoveryAnswersJson) {
        try {
          const parsed = JSON.parse(school.discoveryAnswersJson);
          setAnswers(parsed);

          // Populate outcome form if saved
          setOutcomeForm({
            problems: parsed['_outcome_problems'] || '',
            products: parsed['_outcome_products'] || '',
            solution: parsed['_outcome_solution'] || '',
            academyOpportunities: parsed['_outcome_academy'] || '',
            integrations: parsed['_outcome_integrations'] || '',
            missingData: parsed['_outcome_missing'] || '',
            decisionMakerNextStep: parsed['_outcome_next_step'] || '',
            expectedDate: parsed['_outcome_date'] || '',
            opportunityStage: parsed['_outcome_stage'] || 'Qualified'
          });
        } catch (e) {
          console.error('Failed to parse discoveryAnswersJson', e);
        }
      }
    } catch (err) {
      console.error('Error fetching discovery questions', err);
    } finally {
      setLoading(false);
    }
  };

  // Save answer handler (Rep and SuperAdmin)
  const handleSaveAnswer = async (questionId: string, answerValue: string) => {
    setSavingAnswerId(questionId);
    try {
      const updatedAnswers = {
        ...answers,
        [questionId]: answerValue.trim()
      };

      const res = await api.updateSchoolDiscoveryAnswers(
        school.id,
        JSON.stringify(updatedAnswers)
      );

      if (res.success && res.data) {
        setAnswers(updatedAnswers);
        onSchoolUpdated(res.data);
        setEditingAnswerId(null);
      }
    } catch (err) {
      console.error('Error saving discovery answer', err);
    } finally {
      setSavingAnswerId(null);
    }
  };

  // Save Visit Outcome handler
  const handleSaveOutcome = async () => {
    setSavingOutcome(true);
    try {
      const updatedAnswers = {
        ...answers,
        _outcome_problems: outcomeForm.problems,
        _outcome_products: outcomeForm.products,
        _outcome_solution: outcomeForm.solution,
        _outcome_academy: outcomeForm.academyOpportunities,
        _outcome_integrations: outcomeForm.integrations,
        _outcome_missing: outcomeForm.missingData,
        _outcome_next_step: outcomeForm.decisionMakerNextStep,
        _outcome_date: outcomeForm.expectedDate,
        _outcome_stage: outcomeForm.opportunityStage
      };

      const res = await api.updateSchoolDiscoveryAnswers(
        school.id,
        JSON.stringify(updatedAnswers)
      );

      if (res.success && res.data) {
        setAnswers(updatedAnswers);
        onSchoolUpdated(res.data);
        setIsEditingOutcome(false);
      }
    } catch (err) {
      console.error('Error saving visit outcome', err);
    } finally {
      setSavingOutcome(false);
    }
  };

  // SuperAdmin Edit Question handler
  const handleSaveQuestionTemplate = async () => {
    if (!editingQuestion) return;
    if (!editQuestionAr.trim()) {
      setEditQuestionError(language === 'ar' ? 'نص السؤال بالعربية مطلوب' : 'Arabic question text is required');
      return;
    }

    setSavingQuestion(true);
    setEditQuestionError(null);
    try {
      const res = await api.updateQuestionTemplate(editingQuestion.id, {
        categoryId: editingQuestion.categoryId,
        product: editingQuestion.product,
        questionAr: editQuestionAr.trim(),
        questionEn: editQuestionEn.trim() || editingQuestion.questionEn,
        guidanceAr: editingQuestion.guidanceAr,
        guidanceEn: editingQuestion.guidanceEn,
        answerType: editingQuestion.answerType,
        optionsJson: editingQuestion.optionsJson,
        isRequired: editingQuestion.isRequired,
        displayOrder: editingQuestion.displayOrder,
        isActive: editingQuestion.isActive
      });

      if (res.success) {
        setCategories(prev =>
          prev.map(cat => ({
            ...cat,
            questions: cat.questions.map(q =>
              q.id === editingQuestion.id
                ? { ...q, questionAr: editQuestionAr.trim(), questionEn: editQuestionEn.trim() }
                : q
            )
          }))
        );
        setEditingQuestion(null);
      } else {
        setEditQuestionError(res.message || 'Error updating question');
      }
    } catch (err: any) {
      setEditQuestionError(err?.message || 'Error updating question');
    } finally {
      setSavingQuestion(false);
    }
  };

  // Filter Categories by section & by school tailoring
  const visibleCategories = categories.filter(cat => {
    const name = cat.nameAr.toLowerCase();

    // Hide Helsinki questions if we are viewing El Rowad
    if (name.includes('هلسنكي') && isRowad) return false;
    // Hide El Rowad questions if we are viewing Helsinki
    if (name.includes('الرواد') && isHelsinki) return false;

    if (activeSectionFilter === 'basic') {
      return name.includes('معلومات المدرسة') || name.includes('التحقق من البيانات');
    }
    if (activeSectionFilter === 'sms') {
      return name.includes('نظام إدارة المدرسة الحالي') || name.includes('(sms)');
    }
    if (activeSectionFilter === 'comm') {
      return name.includes('التواصل مع أولياء الأمور');
    }
    if (activeSectionFilter === 'transport') {
      return name.includes('الحضور والنقل المدرسي');
    }
    if (activeSectionFilter === 'finance') {
      return name.includes('الحسابات والمدفوعات');
    }
    if (activeSectionFilter === 'volume') {
      return name.includes('البيانات والحجم التشغيلي');
    }
    if (activeSectionFilter === 'academy') {
      return name.includes('أكاديمية') || name.includes('rootaca academy');
    }
    if (activeSectionFilter === 'budget') {
      return name.includes('الميزانية والتعاقد');
    }
    if (activeSectionFilter === 'specific') {
      return name.includes('أسئلة مخصصة');
    }
    return true;
  });

  // Calculate Progress Stats
  const allActiveQuestions = visibleCategories.flatMap(c => c.questions);
  const totalQuestionsCount = allActiveQuestions.length || 70;
  const answeredQuestionsCount = allActiveQuestions.filter(q => !!answers[q.id]?.trim()).length;
  const progressPercentage = Math.round((answeredQuestionsCount / (totalQuestionsCount || 1)) * 100);

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <div className="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">
          {language === 'ar' ? 'جارٍ تحميل استبيان استكشاف المدرسة والتحقق من البيانات...' : 'Loading School Discovery & Verification Questionnaire...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. HEADER BANNER & PROGRESS OVERVIEW                      */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#0F223D] to-[#003B46] text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
                School Discovery & Verification Questionnaire
              </span>
              <span className="text-xs text-cyan-300 font-medium">
                SmartDevCo SMS & ROOTACA Academy
              </span>
              {school.name && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-cyan-400/20 text-cyan-100 border border-cyan-300/40">
                  {school.name}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {language === 'ar' ? 'استبيان استكشاف المدرسة والتحقق من البيانات' : 'School Discovery & Verification Questionnaire'}
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'الهدف: فهم الوضع الحالي للمدرسة، تحديد احتياجاتها الفعلية، واستخراج متطلبات فنية وتجارية دقيقة لبناء عرض مناسب وتسعير صحيح.'
                : 'Objective: Understand current school workflows, verify operational volume, identify acute business pain points, and extract exact technical inputs for tailored quotation.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-center min-w-[180px]">
            <div className="text-[11px] text-slate-300 font-medium mb-1">
              {language === 'ar' ? 'نسبة اكتمال الاستكشاف' : 'Discovery Progress'}
            </div>
            <div className="text-2xl font-black text-cyan-300">
              {progressPercentage}%
            </div>
            <div className="text-[11px] text-slate-200 mt-0.5 font-semibold">
              {answeredQuestionsCount} / {totalQuestionsCount} {language === 'ar' ? 'سؤال مجاب' : 'answered'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FILTER & SEARCH TOOLBAR                                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Section Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {[
            { id: 'all', label: language === 'ar' ? `الكل (${totalQuestionsCount})` : `All (${totalQuestionsCount})` },
            { id: 'basic', label: language === 'ar' ? 'أولاً: معلومات المدرسة' : '1. Basic Info' },
            { id: 'sms', label: language === 'ar' ? 'ثانياً: نظام SMS' : '2. Current SMS' },
            { id: 'comm', label: language === 'ar' ? 'ثالثاً: التواصل' : '3. Communication' },
            { id: 'transport', label: language === 'ar' ? 'رابعاً: النقل والحضور' : '4. Transport' },
            { id: 'finance', label: language === 'ar' ? 'خامساً: المدفوعات' : '5. Finance' },
            { id: 'volume', label: language === 'ar' ? 'سادساً: الحجم التشغيلي' : '6. Volume' },
            { id: 'academy', label: language === 'ar' ? 'سابعاً: أكاديمية ROOTACA' : '7. Academy' },
            { id: 'budget', label: language === 'ar' ? 'ثامناً: الميزانية' : '8. Budget' },
            { id: 'specific', label: language === 'ar' ? (isHelsinki ? 'تاسعاً: هلسنكي' : isRowad ? 'تاسعاً: الرواد' : 'تاسعاً: مخصصة') : '9. Tailored' },
            { id: 'verification', label: language === 'ar' ? 'عاشراً: التحقق CRM' : '10. CRM Verification' },
            { id: 'outcome', label: language === 'ar' ? 'الحادي عشر: نتيجة الزيارة' : '11. Visit Outcome' }
          ].map(tab => {
            const isActive = activeSectionFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSectionFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B1528] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[210px] shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث في الأسئلة...' : 'Search questions...'}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl ps-9 pe-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SECTION 10: CRM VERIFICATION STANDARD (WHEN ACTIVE)    */}
      {/* ======================================================== */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'verification') && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
            <Shield className="w-5 h-5 text-amber-600" />
            <span>{language === 'ar' ? 'عاشراً: معايير التحقق من المعلومات داخل CRM' : 'X. CRM Information Verification Standard'}</span>
          </div>

          <div className="p-3 bg-amber-100/70 border border-amber-300/80 rounded-xl text-xs font-black text-amber-950 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {language === 'ar'
                ? 'قاعدة مهمة: لا يتم تحويل أي رقم تقديري أو معلومة من بحث خارجي إلى Verified إلا بعد تأكيدها من المدرسة أو من مصدر موثوق يدعمها.'
                : 'Golden Rule: Never convert any estimated number or external research into Verified without school confirmation or verifiable evidence.'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-bold">الحقل</span>
              <span className="font-bold text-slate-800">Information</span>
              <span className="text-[10px] text-slate-500 block">نص المعلومة الدقيق</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-bold">الحقل</span>
              <span className="font-bold text-slate-800">Source</span>
              <span className="text-[10px] text-slate-500 block">مصدر المعلومة ومسؤوله</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-bold">الحقل</span>
              <span className="font-bold text-emerald-700">Verification Status</span>
              <span className="text-[10px] text-slate-500 block">Verified / Unverified / Estimated</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-bold">الحقل</span>
              <span className="font-bold text-slate-800">Verified By</span>
              <span className="text-[10px] text-slate-500 block">مسؤول المبيعات المؤكد</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-bold">الحقل</span>
              <span className="font-bold text-slate-800">Verification Date</span>
              <span className="text-[10px] text-slate-500 block">تاريخ الزيارة والتوثيق</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-bold">الحقل</span>
              <span className="font-bold text-slate-800">Notes</span>
              <span className="text-[10px] text-slate-500 block">شروط وتفاصيل التعاقد</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MAIN QUESTIONNAIRE CATEGORIES & CARDS                  */}
      {/* ======================================================== */}
      <div className="space-y-6">
        {visibleCategories.map((category) => {
          // Filter questions inside category by search query
          const categoryQuestions = category.questions.filter(q => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
              q.questionAr.toLowerCase().includes(query) ||
              q.questionEn.toLowerCase().includes(query) ||
              (answers[q.id] && answers[q.id].toLowerCase().includes(query))
            );
          });

          if (categoryQuestions.length === 0) return null;

          // Header styling
          const isVolume = category.nameAr.includes('الحجم التشغيلي');
          const isAcademy = category.nameAr.includes('أكاديمية');
          const isSpecific = category.nameAr.includes('أسئلة مخصصة');

          return (
            <div key={category.id} className="space-y-3.5">
              {/* Category Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isAcademy
                        ? 'bg-indigo-100 text-indigo-800'
                        : isVolume
                        ? 'bg-emerald-100 text-emerald-800'
                        : isSpecific
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-cyan-100 text-cyan-800'
                    }`}
                  >
                    {isAcademy && <Code2 className="w-4 h-4" />}
                    {isVolume && <Database className="w-4 h-4" />}
                    {isSpecific && <Sparkles className="w-4 h-4" />}
                    {!isAcademy && !isVolume && !isSpecific && <Layers className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {language === 'ar' ? category.nameAr : (category.nameEn || category.nameAr)}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {categoryQuestions.length} {language === 'ar' ? 'أسئلة' : 'questions'}
                </span>
              </div>

              {/* Grid of Question Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryQuestions.map((q) => {
                  const savedAnswer = answers[q.id] || '';
                  const hasAnswer = !!savedAnswer.trim();
                  const isEditingThisAnswer = editingAnswerId === q.id;

                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all p-4 sm:p-5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Top: Number, Status, Edit Question (SuperAdmin) */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-slate-900 text-white">
                              {language === 'ar' ? `سؤال ${q.displayOrder}` : `Q ${q.displayOrder}`}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {q.product}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {hasAnswer ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {language === 'ar' ? 'تم التحقق' : 'Verified'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                                <Clock className="w-2.5 h-2.5" />
                                {language === 'ar' ? 'بانتظار الإجابة' : 'Pending'}
                              </span>
                            )}

                            {/* SuperAdmin ONLY: Edit Question Button */}
                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuestion(q);
                                  setEditQuestionAr(q.questionAr);
                                  setEditQuestionEn(q.questionEn || '');
                                  setEditQuestionError(null);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                title={language === 'ar' ? 'تعديل نص السؤال (صلاحية مدير النظام)' : 'Edit Question Text (SuperAdmin)'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Question Text */}
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-2">
                          {language === 'ar' ? q.questionAr : (q.questionEn || q.questionAr)}
                        </h4>
                      </div>

                      {/* Answer Section */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        {isEditingThisAnswer ? (
                          <div className="space-y-2">
                            {/* Quick selection buttons for YesNo questions */}
                            {q.answerType === 'YesNo' && (
                              <div className="flex items-center gap-2 mb-2">
                                <button
                                  type="button"
                                  onClick={() => setTempAnswerText('نعم')}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    tempAnswerText === 'نعم'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                  }`}
                                >
                                  {language === 'ar' ? 'نعم' : 'Yes'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTempAnswerText('لا')}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    tempAnswerText === 'لا'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                                  }`}
                                >
                                  {language === 'ar' ? 'لا' : 'No'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTempAnswerText('جزئياً / قيد التقييم')}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                    tempAnswerText.includes('جزئياً')
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                  }`}
                                >
                                  {language === 'ar' ? 'جزئياً' : 'Partially'}
                                </button>
                              </div>
                            )}

                            <textarea
                              value={tempAnswerText}
                              onChange={(e) => setTempAnswerText(e.target.value)}
                              placeholder={language === 'ar' ? 'اكتب إجابة المدرسة بالتفصيل هنا...' : 'Enter school response details here...'}
                              rows={3}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 leading-relaxed"
                              autoFocus
                            />

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingAnswerId(null)}
                                disabled={savingAnswerId === q.id}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              >
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveAnswer(q.id, tempAnswerText)}
                                disabled={savingAnswerId === q.id}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#00838F] hover:bg-[#00695C] text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-50"
                              >
                                {savingAnswerId === q.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                <span>{language === 'ar' ? 'حفظ الإجابة' : 'Save Answer'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {hasAnswer ? (
                              <div
                                onClick={() => {
                                  setEditingAnswerId(q.id);
                                  setTempAnswerText(savedAnswer);
                                }}
                                className="p-3 rounded-xl bg-cyan-50/70 hover:bg-cyan-50 border border-cyan-100/90 text-xs text-cyan-950 font-medium leading-relaxed transition cursor-pointer group flex items-start justify-between gap-2"
                                title={language === 'ar' ? 'انقر لتعديل الإجابة' : 'Click to edit answer'}
                              >
                                <span className="break-words">{savedAnswer}</span>
                                <Edit2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 opacity-40 group-hover:opacity-100 transition mt-0.5" />
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAnswerId(q.id);
                                  setTempAnswerText('');
                                }}
                                className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 hover:border-cyan-500 hover:bg-cyan-50/40 text-xs text-slate-400 hover:text-cyan-700 font-medium transition text-start flex items-center justify-between cursor-pointer"
                              >
                                <span>
                                  {language === 'ar' ? 'لم يتم تسجيل إجابة بعد - انقر لإدخال الإجابة...' : 'No answer recorded yet - click to enter...'}
                                </span>
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 5. SECTION 11: POST-VISIT OUTCOME & DISCOVERY REPORT      */}
      {/* ======================================================== */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'outcome') && (
        <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-md p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-cyan-600 text-white">
                  Executive Discovery Report
                </span>
                <span className="text-xs font-mono text-slate-400">Section 11</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                {language === 'ar' ? 'الحادي عشر: نتيجة الزيارة والمخرج النهائي' : 'XI. Visit Outcome & Final Deliverables'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar'
                  ? 'يسجل مسؤول المبيعات بعد انتهاء الاجتماع الخلاصة التنفيذية لإعداد العرض المالي والفني والتسعير الدقيق.'
                  : 'Sales representative records executive takeaways, qualified scope, and next steps for proposal and pricing.'}
              </p>
            </div>

            {!isEditingOutcome && (
              <button
                type="button"
                onClick={() => setIsEditingOutcome(true)}
                className="px-4 py-2 bg-[#0B1528] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تعديل نتيجة الزيارة' : 'Edit Outcome'}</span>
              </button>
            )}
          </div>

          {/* Form Fields */}
          {isEditingOutcome ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? '1. أهم 3 مشكلات مؤكدة لدى المدرسة *' : '1. Top 3 Verified Problems *'}
                  </label>
                  <textarea
                    rows={3}
                    value={outcomeForm.problems}
                    onChange={e => setOutcomeForm({ ...outcomeForm, problems: e.target.value })}
                    placeholder="e.g. 1. تتبع الحافلات 2. بوابة الدفع الإلكتروني 3. تشتت بيانات الكنترول"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? '2. المنتجات أو الوحدات المطلوبة فعلياً *' : '2. Exact Modules Required *'}
                  </label>
                  <textarea
                    rows={3}
                    value={outcomeForm.products}
                    onChange={e => setOutcomeForm({ ...outcomeForm, products: e.target.value })}
                    placeholder="e.g. SmartDevCo Bus GPS + Online Payment Integration + ROOTACA Junior Coder"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? '3. الحل المقترح من SmartDevCo' : '3. Proposed Solution'}
                  </label>
                  <textarea
                    rows={2}
                    value={outcomeForm.solution}
                    onChange={e => setOutcomeForm({ ...outcomeForm, solution: e.target.value })}
                    placeholder="e.g. ربط نظام المدرسة الحالي بوحدات السحابة الذكية لتفادي تكلفة الاستبدال الشامل."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? '4. فرص ROOTACA Academy' : '4. ROOTACA Academy Opportunities'}
                  </label>
                  <textarea
                    rows={2}
                    value={outcomeForm.academyOpportunities}
                    onChange={e => setOutcomeForm({ ...outcomeForm, academyOpportunities: e.target.value })}
                    placeholder="e.g. تجهيز معمل الروبوتكس + مسار بايثون لـ 120 طالباً كنشاط مسائي اختياري."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? '5. التكاملات المطلوبة (Integrations)' : '5. Required Integrations'}
                  </label>
                  <input
                    type="text"
                    value={outcomeForm.integrations}
                    onChange={e => setOutcomeForm({ ...outcomeForm, integrations: e.target.value })}
                    placeholder="e.g. Skolera API, Fawry Gateway, NBE Payment"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? '6. البيانات الناقصة التي تحتاج متابعة' : '6. Missing Data Needing Follow-up'}
                  </label>
                  <input
                    type="text"
                    value={outcomeForm.missingData}
                    onChange={e => setOutcomeForm({ ...outcomeForm, missingData: e.target.value })}
                    placeholder="e.g. تأكيد عدد خطوط السير للحافلات والموافقة النهائية لمجلس الإدارة."
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? '7. صاحب القرار وخطوة التواصل التالية *' : '7. Decision Maker & Next Sales Action *'}
                  </label>
                  <input
                    type="text"
                    value={outcomeForm.decisionMakerNextStep}
                    onChange={e => setOutcomeForm({ ...outcomeForm, decisionMakerNextStep: e.target.value })}
                    placeholder="e.g. د. عبد الرحمن (المدير العام) — موعد العرض التجريبي Live Demo يوم الأحد."
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? '8. الموعد المتوقع لاتخاذ القرار' : '8. Expected Decision Date'}
                    </label>
                    <input
                      type="date"
                      value={outcomeForm.expectedDate}
                      onChange={e => setOutcomeForm({ ...outcomeForm, expectedDate: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? '9. حالة الفرصة *' : '9. Opportunity Stage *'}
                    </label>
                    <select
                      value={outcomeForm.opportunityStage}
                      onChange={e => setOutcomeForm({ ...outcomeForm, opportunityStage: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 focus:bg-white focus:outline-none font-bold text-cyan-900"
                    >
                      <option value="Qualified">Qualified (مؤهلة)</option>
                      <option value="Proposal">Proposal (إعداد العرض الفني والمالي)</option>
                      <option value="Negotiation">Negotiation (مفاوضات واعتماد)</option>
                      <option value="Won">Closed Won (تم التعاقد)</option>
                      <option value="Lost">Closed Lost (فرصة ملغاة)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingOutcome(false)}
                  disabled={savingOutcome}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveOutcome}
                  disabled={savingOutcome}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingOutcome ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{language === 'ar' ? 'حفظ نتيجة الزيارة' : 'Save Outcome'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">1. أهم المشكلات المؤكدة</span>
                <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                  {outcomeForm.problems || (language === 'ar' ? 'لم يتم التسجيل بعد' : 'Not recorded yet')}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">2. المنتجات المطلوبة</span>
                <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                  {outcomeForm.products || (language === 'ar' ? 'لم يتم التسجيل بعد' : 'Not recorded yet')}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">3. الحل المقترح</span>
                <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                  {outcomeForm.solution || (language === 'ar' ? 'لم يتم التسجيل بعد' : 'Not recorded yet')}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">4. فرص الأكاديمية</span>
                <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                  {outcomeForm.academyOpportunities || (language === 'ar' ? 'لم يتم التسجيل بعد' : 'Not recorded yet')}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">7. صاحب القرار والخطوة القادمة</span>
                <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                  {outcomeForm.decisionMakerNextStep || (language === 'ar' ? 'لم يتم التسجيل بعد' : 'Not recorded yet')}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">9. حالة الفرصة الحالية</span>
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-cyan-100 text-cyan-900 border border-cyan-200 mt-1">
                    {outcomeForm.opportunityStage}
                  </span>
                </div>
                {outcomeForm.expectedDate && (
                  <span className="text-[10px] font-mono text-slate-400 mt-2 block">
                    {language === 'ar' ? 'الموعد المستهدف: ' : 'Target: '} {outcomeForm.expectedDate}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Final Deliverables Checklist Pill */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">
                {language === 'ar' ? 'المخرج النهائي الجاهز للرفع:' : 'Final Deliverables Package:'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                Discovery Report
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                Verified School Profile
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                Technical Scope
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                Pricing Inputs
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Next Sales Action
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. SUPER ADMIN EDIT QUESTION MODAL                        */}
      {/* ======================================================== */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">
                  {language === 'ar' ? 'تعديل نص السؤال في بنك الأسئلة' : 'Edit Question Template (SuperAdmin)'}
                </h3>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                {language === 'ar'
                  ? 'هذه الميزة متاحة لمدير النظام فقط. تعديل نص السؤال سيتم تحديثه في بنك الأسئلة الرسمي ويظهر لكافة مسؤولي المبيعات.'
                  : 'SuperAdmin exclusive action: modifying this question will update the official question bank for all sales representatives.'}
              </div>

              {editQuestionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                  {editQuestionError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'نص السؤال بالعربية *' : 'Question in Arabic *'}
                </label>
                <textarea
                  value={editQuestionAr}
                  onChange={(e) => setEditQuestionAr(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-semibold"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'نص السؤال بالإنجليزية (اختياري)' : 'Question in English (Optional)'}
                </label>
                <textarea
                  value={editQuestionEn}
                  onChange={(e) => setEditQuestionEn(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                disabled={savingQuestion}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveQuestionTemplate}
                disabled={savingQuestion}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingQuestion ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تحديث السؤال' : 'Update Question'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
