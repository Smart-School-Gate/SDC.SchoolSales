import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Globe, ChevronDown, Bell, Search, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();

  return (
    <header 
      className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-8 border-b bg-white border-slate-100 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.04)]"
    >
      {/* Start: Mobile Hamburger + Brand Logo + Search Input */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1 max-w-2xl">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl lg:hidden cursor-pointer text-slate-600 hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo in Header */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img 
            src="/rootaca-logo.png" 
            alt="Rootaca" 
            className="w-9 h-9 rounded-xl object-cover shadow-md shadow-blue-500/25" 
          />
          <div className="hidden sm:flex flex-col">
            <span className="font-black text-sm tracking-tight leading-none text-slate-900">
              Rootaca
            </span>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5">School Management</span>
          </div>
        </div>

        {/* Search Pill Input */}
        <div className="relative flex-1 max-w-md ms-2">
          <input
            type="text"
            placeholder={language === 'ar' ? 'البحث في المدارس أو الأنشطة...' : 'Search schools or activities...'}
            className="w-full text-xs rounded-full py-2.5 ps-10 pe-4 border font-sans bg-[#F1F5F9] hover:bg-[#EBF0F7] focus:bg-white text-slate-800 placeholder-slate-400 border-transparent focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* End: Language + Notification Bell + User Profile Badge */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {/* Language Switcher Pill */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
          title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{language === 'ar' ? 'العربية' : 'English'}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Notification Bell with Red Badge */}
        <div className="relative cursor-pointer p-1.5 transition-colors text-slate-600 hover:text-slate-900">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 end-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
            3
          </span>
        </div>

        {/* User Profile Info & Avatar */}
        <div className="flex items-center gap-3 ps-3 border-s border-slate-100">
          <div className="hidden md:flex flex-col text-end">
            <span className="text-xs font-bold leading-tight text-slate-900">
              {user?.fullName || 'أحمد عبد الستار'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {language === 'ar' ? 'مدير المبيعات' : 'Sales Manager'}
            </span>
          </div>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-cyan-500/30 overflow-hidden shrink-0 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
              alt={user?.fullName || 'Profile'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="w-full h-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              {user?.fullName?.charAt(0) || <UserIcon className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
