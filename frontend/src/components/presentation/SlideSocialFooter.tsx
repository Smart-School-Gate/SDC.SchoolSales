import React from 'react';

export interface SlideSocialFooterProps {
  websiteUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export const TwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

export const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export interface SlideFooterMetadata {
  websiteUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  chips?: Array<{
    titleEn?: string;
    titleAr?: string;
  }>;
  presenterNotes?: string;
}

export const parseSlideFooterMetadata = (notesRaw?: string | null): SlideFooterMetadata => {
  if (!notesRaw || !notesRaw.trim()) return {};
  try {
    const parsed = JSON.parse(notesRaw.trim());
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    return { presenterNotes: notesRaw };
  }
  return {};
};

export const serializeSlideFooterMetadata = (meta: SlideFooterMetadata): string => {
  return JSON.stringify(meta);
};

export const SlideSocialFooter: React.FC<SlideSocialFooterProps> = ({
  websiteUrl,
  twitterUrl,
  linkedinUrl,
  facebookUrl,
  instagramUrl,
  className = '',
  dir = 'ltr'
}) => {
  const hasAnyLink = Boolean(
    websiteUrl?.trim() ||
    twitterUrl?.trim() ||
    linkedinUrl?.trim() ||
    facebookUrl?.trim() ||
    instagramUrl?.trim()
  );

  // If no links provided, do not render anything
  if (!hasAnyLink) return null;

  return (
    <div
      dir={dir}
      className={`flex items-center justify-between pt-2.5 text-xs text-slate-500 border-t border-slate-100 ${className}`}
    >
      {/* Website Link (Left) */}
      <div>
        {websiteUrl?.trim() ? (
          <a
            href={websiteUrl.trim().startsWith('http') ? websiteUrl.trim() : `https://${websiteUrl.trim()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-700 font-medium tracking-wide transition hover:underline"
          >
            {websiteUrl.trim().replace(/^https?:\/\//i, '')}
          </a>
        ) : (
          <div />
        )}
      </div>

      {/* Social Media Icons (Right) - Strictly only rendered when link is not empty! */}
      <div className="flex items-center gap-3 text-slate-600">
        {twitterUrl?.trim() && (
          <a
            href={twitterUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-600 transition p-1 hover:scale-110"
            title="Twitter / X"
          >
            <TwitterIcon className="w-4 h-4 fill-current" />
          </a>
        )}
        {linkedinUrl?.trim() && (
          <a
            href={linkedinUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-700 transition p-1 hover:scale-110"
            title="LinkedIn"
          >
            <LinkedinIcon className="w-4 h-4 fill-current" />
          </a>
        )}
        {facebookUrl?.trim() && (
          <a
            href={facebookUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition p-1 hover:scale-110"
            title="Facebook"
          >
            <FacebookIcon className="w-4 h-4 fill-current" />
          </a>
        )}
        {instagramUrl?.trim() && (
          <a
            href={instagramUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-600 transition p-1 hover:scale-110"
            title="Instagram"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};
