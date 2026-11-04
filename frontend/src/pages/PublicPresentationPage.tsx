import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, ArrowLeft, Globe } from 'lucide-react';
import { api } from '../services/api';
import { PublicPresentationDto } from '../types';
import { ExecutivePresentationView } from '../components/presentation/ExecutivePresentationView';

export const PublicPresentationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [presentation, setPresentation] = useState<PublicPresentationDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMessage('رابط العرض غير صالح / Invalid presentation link');
      setLoading(false);
      return;
    }

    // Generate or restore anonymous session ID
    let sid = sessionStorage.getItem('sdc_pres_sid');
    if (!sid) {
      sid = 's_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      sessionStorage.setItem('sdc_pres_sid', sid);
    }

    const fetchPresentation = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await api.getPublicPresentation(token);
        if (res.success && res.data) {
          setPresentation(res.data);

          // Record initial view event
          api.recordPublicViewEvent(token, {
            sessionId: sid,
            slideIndex: 0,
            durationSeconds: 1,
            isDemoCtaClick: false,
            language: 'ar',
            referrerDomain: document.referrer ? new URL(document.referrer).hostname : undefined
          }).catch(() => {
            // Ignore analytics errors
          });
        } else {
          setErrorMessage(res.message || 'عفواً، هذا العرض غير منشور أو أن الرابط منتهي الصلاحية.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'تعذر تحميل العرض التقديمي.');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentation();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F9] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center p-2">
              <img src="/rootaca-logo.png" alt="Rootaca" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-cyan-500/20 animate-pulse -z-10" />
          </div>
          <div className="w-8 h-8 border-3 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <h2 className="text-sm font-black text-slate-800">جاري تجهيز العرض التقديمي...</h2>
            <p className="text-xs text-slate-400 font-mono">Loading Rootaca Interactive Pitch Deck</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !presentation) {
    return (
      <div className="min-h-screen bg-[#F0F4F9] flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-black text-slate-900">
              العرض التقديمي غير متاح حالياً
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {errorMessage || 'عفواً، قد يكون هذا العرض غير منشور حالياً أو انتهت صلاحية الرابط المشترك.'}
            </p>
            <p className="text-[11px] text-slate-400 font-mono" dir="ltr">
              This presentation link is either unpublished, expired, or invalid.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="https://sms.rootaca.com"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-[#00B4D8] hover:bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>زيارة موقع روتاكا Rootaca</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ExecutivePresentationView
      presentation={presentation as any}
      schoolName={presentation.schoolName}
      defaultLanguage="ar"
      isPublicMode={true}
      shareToken={token}
      expiresAtUtc={presentation.expiresAtUtc}
      onClose={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/presentations');
        }
      }}
    />
  );
};
