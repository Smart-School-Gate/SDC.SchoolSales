import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  Target,
  BarChart2,
  Tv,
  HelpCircle,
  BarChart3,
  CheckSquare,
  Rocket,
  LogOut,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { language, dir } = useLanguage();
  const { logout, user } = useAuth();

  const isRtl = dir === 'rtl';

  const navItems = [
    { to: '/', labelAr: 'الرئيسية', labelEn: 'Dashboard', icon: Home },
    { to: '/schools', labelAr: 'المدارس', labelEn: 'Schools', icon: Building2 },
    { to: '/team', labelAr: 'فريق المبيعات والصلاحيات', labelEn: 'Sales Team & Roles', icon: Users },
    { to: '/targets', labelAr: 'الأهداف والأداء', labelEn: 'Sales Targets', icon: Target },
    { to: '/visits', labelAr: 'الأنشطة الميدانية', labelEn: 'Field Operations', icon: BarChart2 },
    { to: '/presentations', labelAr: 'العروض التقديمية', labelEn: 'Presentations', icon: Tv },
    { to: '/knowledge-base', labelAr: 'الأسئلة والاعتراضات', labelEn: 'Q&A & Objections', icon: HelpCircle },
    { to: '/reports', labelAr: 'التقارير والتحليلات', labelEn: 'Reports & Analytics', icon: BarChart3 },
    { to: '/discovery', labelAr: 'المتابعات والمهام', labelEn: 'Tasks & Activities', icon: CheckSquare },
  ];

  // Dynamic classes for RTL vs LTR placement
  const positionClasses = isRtl
    ? `right-0 border-l border-slate-800 ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`
    : `left-0 border-r border-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 z-50 flex flex-col w-64 bg-[#0B1528] text-slate-300 shadow-2xl transition-transform duration-200 ${positionClasses}`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <img 
              src="/rootaca-logo.png" 
              alt="Rootaca" 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-lg shadow-blue-500/30 shrink-0" 
            />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-white text-base tracking-tight leading-tight">Rootaca</span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">School Management</span>
            </div>
          </div>

          {/* Close button for mobile screens */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links with Cyan Highlight matching Screenshots */}
        <nav className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.labelAr}
              to={item.to}
              end={item.to === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#00B4D8] text-white shadow-lg shadow-cyan-500/35'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{language === 'ar' ? item.labelAr : item.labelEn}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Feature Card: "Together We Grow" with Rocket & City Skyline */}
        <div className="p-3.5 border-t border-slate-800/80">
          <div className="relative rounded-2xl bg-gradient-to-b from-[#102446] to-[#0D1B36] p-4 text-white overflow-hidden shadow-lg border border-slate-700/50">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00B4D8]/15 rounded-full blur-xl pointer-events-none" />

            {/* City Skyline Silhouette SVG Background */}
            <div className="absolute bottom-0 inset-x-0 h-16 opacity-20 pointer-events-none flex items-end justify-center">
              <svg viewBox="0 0 200 60" className="w-full h-full fill-cyan-400">
                <rect x="10" y="25" width="12" height="35" />
                <rect x="25" y="10" width="16" height="50" />
                <polygon points="33,2 25,10 41,10" />
                <rect x="45" y="30" width="10" height="30" />
                <rect x="60" y="18" width="14" height="42" />
                <rect x="78" y="5" width="18" height="55" />
                <polygon points="87,0 78,5 96,5" />
                <rect x="100" y="22" width="12" height="38" />
                <rect x="116" y="14" width="16" height="46" />
                <rect x="136" y="28" width="10" height="32" />
                <rect x="150" y="8" width="18" height="52" />
                <rect x="172" y="20" width="14" height="40" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#00B4D8]/20 border border-[#00B4D8]/40 flex items-center justify-center text-[#00B4D8] shadow-md shadow-cyan-500/20">
                <Rocket className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white tracking-wide">Together</h4>
                <p className="text-xs font-semibold text-cyan-200">We Grow</p>
              </div>
            </div>
          </div>

          {/* User Signout Button */}
          <button
            onClick={logout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
