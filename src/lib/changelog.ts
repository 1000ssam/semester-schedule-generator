export interface ChangelogEntry {
  version: string;
  date: string;
  sections: {
    type: 'added' | 'changed' | 'fixed';
    label: string;
    items: string[];
  }[];
}

export const APP_VERSION = 'v1.1.1';

export const changelog: ChangelogEntry[] = [
  {
    version: 'v1.1.1',
    date: '2026-03-06',
    sections: [
      {
        type: 'fixed',
        label: '버그 수정',
        items: [
          'CSV 다운로드 시 UTF-8 인코딩을 명시 적용하여 안정성 향상',
          '날짜값에 quote 접두사가 붙어 스프레드시트 붙여넣기가 안 되던 문제 수정',
        ],
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026-02-15',
    sections: [
      {
        type: 'changed',
        label: '개선',
        items: [
          '모바일 전반 UI/UX 개선',
          '날짜 입력 필드 너비 및 overflow 문제 해결',
          '결과화면 첫 로드 시 가로 흔들림 제거',
          '재설정 버튼 모바일 대응',
          '모바일 자동 zoom 방지',
        ],
      },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2026-02-14',
    sections: [
      {
        type: 'added',
        label: '새 기능',
        items: [
          '주간 시간표 입력으로 전체 학기 시간표 자동 생성',
          'CSV/TSV 내보내기 (BOM UTF-8)',
          '클립보드 복사 (100행 단위 분할 복사)',
          '요일/교시 선택, 커스텀 컬럼 지원',
          'OG 이미지 및 메타데이터 설정',
        ],
      },
    ],
  },
];
