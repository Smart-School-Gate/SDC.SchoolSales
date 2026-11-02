import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Globe,
  Eye,
  EyeOff,
  Building2,
  GraduationCap,
  MapPin,
  TrendingUp,
  BarChart3,
  Cog,
  Search,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { t, language, dir, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || (language === 'ar' ? 'فشل تسجيل الدخول. يرجى التأكد من البيانات.' : 'Login failed. Please check credentials.'));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-[#00B4D8] selection:text-white" dir={dir}>
      
      {/* ======================================================== */}
      {/* 1. LEFT SIDE: BRANDED TECH VISUAL (DEEP NAVY / CYAN ART) */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#060D1E] text-white flex-col justify-between p-10 xl:p-14 relative overflow-hidden select-none border-e border-slate-800/80">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-[#00B4D8]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Rootaca Logo */}
        <div className="relative z-10 flex items-center justify-start">
          <div className="flex items-center gap-3">
            <img 
              src="/rootaca-logo.png" 
              alt="Rootaca" 
              className="w-12 h-12 rounded-xl object-cover shadow-lg shadow-blue-500/40 shrink-0" 
            />
            <span className="font-black text-2xl tracking-tight text-white font-sans">
              Rootaca
            </span>
          </div>
        </div>

        {/* Top Tech Illustration: Glowing Blueprint Artwork */}
        <div className="relative z-10 w-full max-w-lg mx-auto py-2">
          <svg viewBox="0 0 500 180" className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="cyanLineGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#007791" stopOpacity="0.5" />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Left Building with Pediment and Columns */}
            <g transform="translate(40, 20)" stroke="#00E5FF" strokeWidth="1.8" fill="none" filter="url(#neonGlow)">
              {/* Roof */}
              <polygon points="60,20 110,50 10,50" stroke="#00E5FF" fill="#00E5FF" fillOpacity="0.05" />
              <line x1="60" y1="20" x2="60" y2="10" />
              <circle cx="60" cy="8" r="3" fill="#00E5FF" />
              {/* Pediment border */}
              <rect x="15" y="50" width="90" height="60" rx="3" stroke="#00E5FF" fill="#06162B" />
              {/* Columns */}
              <rect x="25" y="60" width="12" height="15" rx="1" fill="#00E5FF" fillOpacity="0.2" />
              <rect x="43" y="60" width="12" height="15" rx="1" fill="#00E5FF" fillOpacity="0.2" />
              <rect x="63" y="60" width="12" height="15" rx="1" fill="#00E5FF" fillOpacity="0.2" />
              <rect x="81" y="60" width="12" height="15" rx="1" fill="#00E5FF" fillOpacity="0.2" />
              {/* Door */}
              <path d="M 50 110 L 50 85 A 10 10 0 0 1 70 85 L 70 110 Z" fill="#00E5FF" fillOpacity="0.2" />
            </g>

            {/* Floating Graduation Cap */}
            <g transform="translate(190, 15)" stroke="#00E5FF" strokeWidth="2" fill="none" filter="url(#neonGlow)">
              <polygon points="60,15 110,35 60,55 10,35" fill="#00E5FF" fillOpacity="0.15" />
              <path d="M 25 42 L 25 65 Q 60 85, 95 65 L 95 42" stroke="#00E5FF" fill="#00E5FF" fillOpacity="0.1" />
              <line x1="110" y1="35" x2="110" y2="70" stroke="#38BDF8" />
              <circle cx="110" cy="72" r="3" fill="#38BDF8" />
            </g>

            {/* Glowing Map Location Pin */}
            <g transform="translate(260, 50)" filter="url(#neonGlow)">
              <circle cx="20" cy="20" r="16" fill="#00E5FF" fillOpacity="0.2" />
              <path d="M 20 6 C 12 6, 6 12, 6 20 C 6 29, 20 44, 20 44 C 20 44, 34 29, 34 20 C 34 12, 28 6, 20 6 Z" fill="#00B4D8" stroke="#00E5FF" strokeWidth="1.5" />
              <circle cx="20" cy="18" r="5" fill="#060D1E" />
            </g>

            {/* Secondary Gray Pin */}
            <g transform="translate(320, 60)">
              <path d="M 15 4 C 9 4, 4 9, 4 15 C 4 22, 15 33, 15 33 C 15 33, 26 22, 26 15 C 26 9, 21 4, 15 4 Z" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
              <circle cx="15" cy="13" r="4" fill="#060D1E" />
            </g>

            {/* Right Classical School Building */}
            <g transform="translate(360, 25)" stroke="#00E5FF" strokeWidth="1.8" fill="none" filter="url(#neonGlow)">
              <polygon points="60,15 105,45 15,45" stroke="#00E5FF" fill="#00E5FF" fillOpacity="0.05" />
              <rect x="20" y="45" width="80" height="65" rx="3" stroke="#00E5FF" fill="#06162B" />
              <rect x="30" y="55" width="14" height="18" rx="1" fill="#00E5FF" fillOpacity="0.2" />
              <rect x="76" y="55" width="14" height="18" rx="1" fill="#00E5FF" fillOpacity="0.2" />
              <rect x="48" y="75" width="24" height="35" rx="2" fill="#00E5FF" fillOpacity="0.25" />
            </g>

            {/* Analytics Window Card in upper left */}
            <g transform="translate(10, 10)" stroke="#00E5FF" strokeWidth="1.5" fill="none">
              <rect x="0" y="0" width="55" height="40" rx="4" stroke="#00E5FF" strokeOpacity="0.6" fill="#08182B" />
              <polyline points="8,30 20,20 32,25 46,12" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Gear Cog on upper right */}
            <g transform="translate(450, 20)" stroke="#00E5FF" strokeWidth="1.5" fill="none">
              <circle cx="15" cy="15" r="9" stroke="#00E5FF" strokeOpacity="0.5" />
              <path d="M 15 2 L 15 6 M 15 24 L 15 28 M 2 15 L 6 15 M 24 15 L 28 15" stroke="#00E5FF" strokeOpacity="0.6" />
            </g>
          </svg>
        </div>

        {/* Center Brand Headline matching Reference Screenshot */}
        <div className="relative z-10 text-center my-6 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            نظام روتاكا Rootaca
          </h1>
          <p className="text-lg sm:text-xl font-bold text-[#00E5FF] tracking-tight">
            لإدارة مبيعات وزيارات المدارس
          </p>
        </div>

        {/* Bottom Tech Blueprint Illustration matching Reference Screenshot */}
        <div className="relative z-10 w-full max-w-lg mx-auto py-2">
          <svg viewBox="0 0 500 200" className="w-full h-auto overflow-visible">
            {/* Analytics Bar Chart Card on Left */}
            <g transform="translate(20, 30)" stroke="#00E5FF" strokeWidth="1.5" fill="none">
              <rect x="0" y="0" width="50" height="40" rx="4" stroke="#00E5FF" strokeOpacity="0.6" fill="#08182B" />
              <line x1="12" y1="30" x2="12" y2="22" stroke="#00E5FF" strokeWidth="3" />
              <line x1="22" y1="30" x2="22" y2="15" stroke="#00E5FF" strokeWidth="3" />
              <line x1="32" y1="30" x2="32" y2="8" stroke="#00E5FF" strokeWidth="3" />
            </g>

            {/* Central School Building with Graduation Cap */}
            <g transform="translate(80, 25)" stroke="#00E5FF" strokeWidth="1.8" fill="none" filter="url(#neonGlow)">
              <polygon points="65,20 120,55 10,55" stroke="#00E5FF" fill="#00E5FF" fillOpacity="0.08" />
              <rect x="20" y="55" width="90" height="70" rx="3" stroke="#00E5FF" fill="#06162B" />
              <rect x="32" y="68" width="14" height="18" rx="1" fill="#00E5FF" fillOpacity="0.2" />
              <rect x="84" y="68" width="14" height="18" rx="1" fill="#00E5FF" fillOpacity="0.2" />
              <path d="M 54 125 L 54 95 A 11 11 0 0 1 76 95 L 76 125 Z" fill="#00E5FF" fillOpacity="0.25" />
            </g>

            {/* Graduation Cap hovering over building */}
            <g transform="translate(110, 0)" stroke="#00E5FF" strokeWidth="2" fill="none" filter="url(#neonGlow)">
              <polygon points="50,15 90,32 50,48 10,32" fill="#00E5FF" fillOpacity="0.2" />
              <path d="M 22 38 L 22 55 Q 50 70, 78 55 L 78 38" stroke="#00E5FF" fill="#00E5FF" fillOpacity="0.15" />
              <line x1="90" y1="32" x2="90" y2="60" stroke="#38BDF8" />
              <circle cx="90" cy="62" r="2.5" fill="#38BDF8" />
            </g>

            {/* Glowing Map Pin in center */}
            <g transform="translate(225, 60)" filter="url(#neonGlow)">
              <path d="M 18 5 C 10 5, 5 10, 5 18 C 5 26, 18 39, 18 39 C 18 39, 31 26, 31 18 C 31 10, 26 5, 18 5 Z" fill="#00B4D8" stroke="#00E5FF" strokeWidth="1.5" />
              <circle cx="18" cy="16" r="4.5" fill="#060D1E" />
            </g>

            {/* Interconnecting Circuitry and Gears */}
            <g transform="translate(270, 50)" stroke="#00E5FF" strokeWidth="1.8" fill="none" filter="url(#neonGlow)">
              {/* Circuit lines */}
              <line x1="0" y1="20" x2="35" y2="20" />
              <circle cx="35" cy="20" r="3" fill="#00E5FF" />
              <line x1="35" y1="20" x2="60" y2="45" />
              {/* Main Glowing Gear Cog */}
              <g transform="translate(60, 10)">
                <circle cx="25" cy="25" r="14" stroke="#00E5FF" strokeWidth="2.5" fill="#081E36" />
                <circle cx="25" cy="25" r="6" fill="#00E5FF" />
              </g>
              <g transform="translate(30, 70)">
                <circle cx="15" cy="15" r="9" stroke="#38BDF8" strokeWidth="2" fill="#08182B" />
                <circle cx="15" cy="15" r="3.5" fill="#38BDF8" />
              </g>
            </g>

            {/* Analytics Metric Bar Chart on Right */}
            <g transform="translate(400, 55)" stroke="#00E5FF" strokeWidth="1.5" fill="none" filter="url(#neonGlow)">
              <rect x="0" y="0" width="70" height="55" rx="5" stroke="#00E5FF" fill="#08182B" />
              <line x1="12" y1="45" x2="12" y2="30" stroke="#00E5FF" strokeWidth="4" />
              <line x1="22" y1="45" x2="22" y2="20" stroke="#00E5FF" strokeWidth="4" />
              <line x1="32" y1="45" x2="32" y2="35" stroke="#00E5FF" strokeWidth="4" />
              <line x1="42" y1="45" x2="42" y2="15" stroke="#00E5FF" strokeWidth="4" />
              <line x1="52" y1="45" x2="52" y2="10" stroke="#00E5FF" strokeWidth="4" />
              {/* Upward arrow */}
              <polyline points="10,25 25,12 38,20 55,6" stroke="#38BDF8" strokeWidth="2" />
            </g>
          </svg>
        </div>

        {/* Footer in Left Pane */}
        <div className="relative z-10 text-xs text-slate-500 font-mono">
          Rootaca Enterprise Educational CRM v3.2
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. RIGHT SIDE: CLEAN WHITE EDITORIAL LOGIN FORM          */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white relative">
        
        {/* Top Bar: Language Switcher Button matching Screenshot */}
        <div className="flex items-center justify-between w-full">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-2">
            <img 
              src="/rootaca-logo.png" 
              alt="Rootaca" 
              className="w-8 h-8 rounded-lg object-cover" 
            />
            <span className="font-bold text-slate-900 text-sm">Rootaca</span>
          </div>

          <button
            onClick={toggleLanguage}
            className="ms-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'ar' ? 'العربية' : 'English'}</span>
          </button>
        </div>

        {/* Center Main Form */}
        <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
          {/* Header Title & Subtitle matching Screenshot */}
          <div className="text-center space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              {language === 'ar' ? 'مرحباً بك! يرجى تسجيل الدخول إلى حسابك' : 'Welcome back! Please enter your details.'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1 text-right">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@rootaca.com"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/10 transition-all text-right"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1 text-right">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/10 transition-all text-right pe-10 ps-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options Row: Remember Me & Forgot Password matching Screenshot */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#00B4D8] focus:ring-[#00B4D8] cursor-pointer"
                />
                <span>{language === 'ar' ? 'تذكرني' : 'Remember me'}</span>
              </label>

              <button
                type="button"
                onClick={() => alert(language === 'ar' ? 'يرجى التواصل مع مدير النظام لإعادة ضبط كلمة المرور.' : 'Please contact your administrator to reset your password.')}
                className="text-[#00B4D8] hover:text-[#0096b4] font-bold transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'هل نسيت كلمة المرور؟' : 'Forgot Password?'}
              </button>
            </div>

            {/* Submit Button matching Screenshot */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#00B4D8] hover:bg-[#0096b4] text-white text-sm font-black rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('common.loading')}</span>
                  </span>
                ) : (
                  <span>{language === 'ar' ? 'تسجيل الدخول إلى النظام' : 'Sign In to System'}</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Footer Copyright matching Screenshot */}
        <div className="text-center text-xs text-slate-400 font-medium py-2">
          {language === 'ar' ? 'Rootaca كافة الحقوق محفوظة ©' : '© Rootaca. All rights reserved.'}
        </div>

      </div>

    </div>
  );
};
