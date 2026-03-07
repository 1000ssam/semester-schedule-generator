'use client';

import { useEffect, useRef } from 'react';
import { changelog, APP_VERSION, type ChangelogEntry } from '@/lib/changelog';

const typeStyles: Record<ChangelogEntry['sections'][number]['type'], { bg: string; text: string }> = {
  added: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  changed: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  fixed: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
};

export default function ChangelogModal({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* modal */}
      <div className="relative w-full sm:max-w-md max-h-[80vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-[#e5e5e5] flex flex-col animate-slide-up">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
          <div>
            <h2 className="text-sm font-medium text-[#171717] tracking-tight">
              업데이트 내역
            </h2>
            <p className="text-xs font-light text-[#525252] mt-0.5">
              현재 버전 {APP_VERSION}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors text-[#a3a3a3] hover:text-[#525252]"
            aria-label="닫기"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto px-5 py-4 space-y-5">
          {changelog.map((entry, i) => (
            <div key={entry.version}>
              {/* version header */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-sm font-medium text-[#171717] tracking-tight">
                  {entry.version}
                </span>
                <span className="text-[11px] font-light text-[#a3a3a3]">
                  {entry.date}
                </span>
                {i === 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#D2886F]/10 text-[#D2886F] rounded-full leading-none">
                    최신
                  </span>
                )}
              </div>

              {/* sections */}
              {entry.sections.map((section) => {
                const style = typeStyles[section.type];
                return (
                  <div key={section.type} className="mb-2">
                    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${style.bg} ${style.text} mb-1.5`}>
                      {section.label}
                    </span>
                    <ul className="space-y-1">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs font-light text-[#525252] leading-relaxed">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#d4d4d4] flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* divider */}
              {i < changelog.length - 1 && (
                <div className="border-b border-[#f0f0f0] mt-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
