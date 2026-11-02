import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Bell } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, dir } = useLanguage();
  const location = useLocation();

  const isRtl = dir === 'rtl';
  const isPresentations = location.pathname.startsWith('/presentations');
  const isReports = location.pathname.startsWith('/reports');

  // When on dedicated presentation studio, render edge-to-edge light workspace
  if (isPresentations) {
    return (
      <div className="min-h-screen bg-[#F0F4F9] text-slate-800 font-sans" dir={dir}>
        <Outlet />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors bg-[#F0F4F9] text-slate-800" 
      dir={dir}
    >
      {/* Sidebar - Positioned Right in RTL, Left in LTR */}
      <Sidebar isOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      {/* Main Content Area with appropriate offset for Sidebar */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-200 ${
          isRtl ? 'lg:pr-64 lg:pl-0' : 'lg:pl-64 lg:pr-0'
        }`}
      >
        <Header onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-6">
          <Outlet />
        </main>

        {/* Status Bar / Footer */}
        <footer 
          className="mt-auto py-3 px-6 sm:px-8 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs border-t transition-colors bg-white border-slate-200/80 text-slate-600"
        >
          {/* Brand Ribbon */}
          <div className="flex items-center gap-2.5">
            <img 
              src="/rootaca-logo.png" 
              alt="Rootaca" 
              className="w-5 h-5 rounded-md object-cover shadow-2xs" 
            />
            <span className="font-bold text-slate-900">Rootaca</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-600 font-medium">
              {language === 'ar' ? '2026 | إدارة المبيعات التعليمية' : '2026 | Educational Sales CRM'}
            </span>
          </div>

          {/* Live Status Telemetry */}
          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-mono">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'ar' ? 'آخر تحديث: 10:45 ص' : 'Last sync: 10:45 AM'}</span>
            </div>

            <div className="flex items-center gap-2 bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{language === 'ar' ? 'النظام متصل' : 'System Online'}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
