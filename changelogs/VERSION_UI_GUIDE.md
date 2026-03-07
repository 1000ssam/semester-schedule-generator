# 버전 표시 & Changelog 모달 UI 가이드

동일한 디자인 언어를 사용하는 앱에 버전 표시 + 업데이트 내역 모달을 추가하기 위한 구현 가이드.

---

## 구성 요소 (총 4개)

| 파일 | 역할 |
|------|------|
| `src/lib/changelog.ts` | 버전 상수 + changelog 데이터 |
| `src/components/ChangelogModal.tsx` | 모달 컴포넌트 |
| `Footer.tsx` (기존 수정) | 버전 버튼 배치 |
| `globals.css` (기존 수정) | 슬라이드업 애니메이션 |

---

## 1. changelog.ts - 데이터 모듈

버전 상수와 changelog 배열을 한 파일에서 관리한다. 새 버전 출시 시 이 파일만 수정하면 된다.

```ts
// src/lib/changelog.ts

export interface ChangelogEntry {
  version: string;
  date: string;         // YYYY-MM-DD
  sections: {
    type: 'added' | 'changed' | 'fixed';
    label: string;      // 한글 라벨: '새 기능' | '개선' | '버그 수정'
    items: string[];    // 변경 사항 목록 (사용자 관점으로 작성)
  }[];
}

export const APP_VERSION = 'v1.0.0';   // <- 출시 시 갱신

export const changelog: ChangelogEntry[] = [
  // 최신 버전이 배열 맨 앞
  {
    version: 'v1.0.0',
    date: '2026-01-01',
    sections: [
      {
        type: 'added',
        label: '새 기능',
        items: [
          '첫 번째 기능 설명',
          '두 번째 기능 설명',
        ],
      },
    ],
  },
];
```

### 새 버전 추가 시

1. `APP_VERSION` 값 갱신
2. `changelog` 배열 **맨 앞**에 새 항목 추가
3. `package.json`의 `version` 필드도 동일하게 갱신
4. (선택) `changelogs/` 디렉토리에 `vX.Y.Z.md` 파일도 작성

### section type별 의미

| type | label | 용도 |
|------|-------|------|
| `added` | 새 기능 | 완전히 새로운 기능 추가 |
| `changed` | 개선 | 기존 기능의 UX/성능 개선 |
| `fixed` | 버그 수정 | 기존 버그 수정 |

---

## 2. ChangelogModal.tsx - 모달 컴포넌트

아래 코드를 그대로 복사하여 사용한다. 디자인 토큰은 앱 공통 컬러를 따른다.

```tsx
// src/components/ChangelogModal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { changelog, APP_VERSION, type ChangelogEntry } from '@/lib/changelog';

const typeStyles: Record<
  ChangelogEntry['sections'][number]['type'],
  { bg: string; text: string }
> = {
  added:   { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  changed: { bg: 'bg-blue-50 border-blue-200',       text: 'text-blue-700'    },
  fixed:   { bg: 'bg-amber-50 border-amber-200',     text: 'text-amber-700'   },
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
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
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
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${style.bg} ${style.text} mb-1.5`}
                    >
                      {section.label}
                    </span>
                    <ul className="space-y-1">
                      {section.items.map((item, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-xs font-light text-[#525252] leading-relaxed"
                        >
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
```

---

## 3. Footer 버전 버튼

기존 Footer 컴포넌트에 아래 패턴을 적용한다.

### 핵심 변경점

- Footer를 `'use client'` 컴포넌트로 전환 (useState 사용)
- copyright 아래에 버전 버튼 배치
- 버튼 클릭 시 ChangelogModal 렌더

### 버전 버튼 마크업

```tsx
import { useState } from 'react';
import { APP_VERSION } from '@/lib/changelog';
import ChangelogModal from './ChangelogModal';

// Footer 컴포넌트 내부:
const [showChangelog, setShowChangelog] = useState(false);

// JSX - copyright 아래에 배치:
<button
  onClick={() => setShowChangelog(true)}
  className="group flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[#737373] hover:text-[#D2886F] transition-all border border-[#e5e5e5] hover:border-[#D2886F]/40 rounded-full hover:bg-[#D2886F]/5"
>
  <span className="font-medium">{APP_VERSION}</span>
  <span className="hidden sm:inline text-[#a3a3a3] group-hover:text-[#D2886F]/70">|</span>
  <span className="hidden sm:inline">업데이트 내역</span>
  <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
</button>

// Footer 닫는 태그 바깥, fragment 안:
{showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
```

### 반응형 동작

| 화면 | 버튼 표시 |
|------|-----------|
| 모바일 (`< sm`) | `v1.0.0 >` |
| 데스크톱 (`>= sm`) | `v1.0.0 \| 업데이트 내역 >` |

### 인터랙션

- hover 시 텍스트 색상 `#737373` -> `#D2886F` (accent)
- hover 시 테두리 `#e5e5e5` -> `#D2886F/40`
- hover 시 배경 투명 -> `#D2886F/5`
- hover 시 화살표 `>` 가 오른쪽으로 0.5 이동

---

## 4. CSS 애니메이션

`globals.css`에 아래를 추가한다 (`@layer utilities` 위):

```css
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.2s ease-out;
}
```

---

## 5. 디자인 토큰 요약

이 UI에서 사용하는 색상 값. 앱의 accent 색상이 다르면 `#D2886F` 부분만 교체한다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| accent | `#D2886F` | hover 텍스트, "최신" 배지, 버튼 hover 배경/테두리 |
| text-main | `#171717` | 모달 제목, 버전명 |
| text-sub | `#525252` | 모달 부제, 항목 텍스트 |
| text-light | `#a3a3a3` | 날짜, 구분선, 닫기 버튼 |
| border | `#e5e5e5` | 모달/버튼 테두리 |
| divider | `#f0f0f0` | 버전 간 구분선 |
| section-added | emerald-50/200/700 | "새 기능" 배지 |
| section-changed | blue-50/200/700 | "개선" 배지 |
| section-fixed | amber-50/200/700 | "버그 수정" 배지 |

---

## 6. 체크리스트

새 앱에 적용할 때 순서:

1. [ ] `src/lib/changelog.ts` 생성 - APP_VERSION과 changelog 데이터 작성
2. [ ] `src/components/ChangelogModal.tsx` 복사
3. [ ] `globals.css`에 `slide-up` 애니메이션 추가
4. [ ] Footer 컴포넌트에 버전 버튼 + 모달 토글 추가
5. [ ] `package.json` version 필드 갱신
6. [ ] (선택) `changelogs/` 디렉토리에 버전별 `.md` 파일 작성
7. [ ] accent 색상이 다른 경우 `#D2886F`를 앱 고유 accent로 치환
