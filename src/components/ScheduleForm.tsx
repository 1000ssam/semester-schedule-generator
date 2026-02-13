'use client';

import { useState, useCallback } from 'react';
import { WeeklyEntry, ColumnDef, DEFAULT_COLUMNS } from '@/lib/types';

interface ScheduleFormProps {
  onGenerate: (startDate: string, endDate: string, entries: WeeklyEntry[], columns: ColumnDef[]) => void;
}

const PERIOD_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

function createEmptyEntry(columns: ColumnDef[]): WeeklyEntry {
  const customFields: Record<string, string> = {};
  columns.forEach(c => { customFields[c.id] = ''; });
  return {
    id: crypto.randomUUID(),
    dayOfWeek: 1,
    period: 1,
    customFields,
  };
}

export default function ScheduleForm({ onGenerate }: ScheduleFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [columns, setColumns] = useState<ColumnDef[]>(
    DEFAULT_COLUMNS.map(c => ({ ...c }))
  );
  const [entries, setEntries] = useState<WeeklyEntry[]>([
    createEmptyEntry(DEFAULT_COLUMNS.map(c => ({ ...c })))
  ]);

  const handleAddEntry = useCallback(() => {
    setEntries(prev => [...prev, createEmptyEntry(columns)]);
  }, [columns]);

  const handleRemoveEntry = useCallback((id: string) => {
    setEntries(prev => {
      if (prev.length === 1) {
        alert('최소 하나의 항목이 필요합니다.');
        return prev;
      }
      return prev.filter(entry => entry.id !== id);
    });
  }, []);

  const handleEntryChange = useCallback((id: string, field: 'dayOfWeek' | 'period', value: number) => {
    setEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  }, []);

  const handleCustomFieldChange = useCallback((entryId: string, columnId: string, value: string) => {
    setEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, customFields: { ...entry.customFields, [columnId]: value } }
        : entry
    ));
  }, []);

  const handleAddColumn = useCallback(() => {
    const newCol: ColumnDef = {
      id: crypto.randomUUID(),
      label: '',
    };
    setColumns(prev => [...prev, newCol]);
    setEntries(prev => prev.map(entry => ({
      ...entry,
      customFields: { ...entry.customFields, [newCol.id]: '' }
    })));
  }, []);

  const handleRemoveColumn = useCallback((columnId: string) => {
    setColumns(prev => prev.filter(c => c.id !== columnId));
    setEntries(prev => prev.map(entry => {
      const newFields = { ...entry.customFields };
      delete newFields[columnId];
      return { ...entry, customFields: newFields };
    }));
  }, []);

  const handleColumnLabelChange = useCallback((columnId: string, newLabel: string) => {
    setColumns(prev => prev.map(c =>
      c.id === columnId ? { ...c, label: newLabel } : c
    ));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      alert('학기 시작일과 종료일을 입력해주세요.');
      return;
    }

    const hasEmptyFields = entries.some(entry =>
      columns.some(col => col.label && !entry.customFields[col.id])
    );
    if (hasEmptyFields) {
      alert('모든 시간표 항목의 필드를 입력해주세요.');
      return;
    }

    onGenerate(startDate, endDate, entries, columns);
  };

  const dayOptions = [
    { value: 1, label: '월' },
    { value: 2, label: '화' },
    { value: 3, label: '수' },
    { value: 4, label: '목' },
    { value: 5, label: '금' },
    { value: 6, label: '토' },
    { value: 0, label: '일' }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white border border-[#e5e5e5] rounded-lg shadow-sm p-6">
        {/* 학기 기간 */}
        <div className="mb-6">
          <h3 className="text-sm font-normal text-[#171717] tracking-tight mb-2">
            학기 기간
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-light text-[#525252] mb-1">
                시작일
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm font-light text-[#171717] focus:border-[#D2886F] focus:ring-1 focus:ring-[#D2886F] outline-none transition-all tracking-tight"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-light text-[#525252] mb-1">
                종료일
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm font-light text-[#171717] focus:border-[#D2886F] focus:ring-1 focus:ring-[#D2886F] outline-none transition-all tracking-tight"
                required
              />
            </div>
          </div>
        </div>

        {/* 출력 컬럼 설정 */}
        <div className="mb-6">
          <h3 className="text-sm font-normal text-[#171717] tracking-tight mb-2">
            출력 컬럼 설정
          </h3>
          <div className="space-y-2">
            {columns.map((col) => (
              <div key={col.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={col.label}
                  onChange={(e) => handleColumnLabelChange(col.id, e.target.value)}
                  className="w-40 border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-xs font-light text-[#171717] focus:border-[#D2886F] focus:ring-1 focus:ring-[#D2886F] outline-none transition-all tracking-tight"
                  placeholder="컬럼 이름"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveColumn(col.id)}
                  className="p-1.5 text-[#a3a3a3] hover:text-red-500 transition-colors"
                  aria-label="컬럼 삭제"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddColumn}
            className="w-full border border-dashed border-[#e5e5e5] rounded-lg px-3 py-1.5 text-xs text-[#525252] hover:border-[#D2886F] hover:text-[#D2886F] transition-all mt-2"
          >
            + 컬럼 추가
          </button>
        </div>

        {/* 주간 시간표 */}
        <div className="mb-6">
          <h3 className="text-sm font-normal text-[#171717] tracking-tight mb-2">
            주간 시간표
          </h3>

          {/* 헤더 라벨 행 */}
          <div className="flex items-center gap-2 mb-1 overflow-x-auto">
            <span className="w-16 flex-shrink-0 text-xs font-light text-[#a3a3a3] tracking-tight">요일</span>
            <span className="w-16 flex-shrink-0 text-xs font-light text-[#a3a3a3] tracking-tight">교시</span>
            {columns.map((col) => (
              <span key={col.id} className="flex-1 min-w-[100px] text-xs font-light text-[#a3a3a3] tracking-tight">
                {col.label || '(미지정)'}
              </span>
            ))}
            {/* 삭제 버튼 자리 */}
            <span className="w-8 flex-shrink-0" />
          </div>

          {/* 항목 행들 */}
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2 overflow-x-auto">
                <select
                  value={entry.dayOfWeek}
                  onChange={(e) => handleEntryChange(entry.id, 'dayOfWeek', Number(e.target.value))}
                  className="w-16 flex-shrink-0 border border-[#e5e5e5] rounded-lg px-2 py-2 text-sm font-light text-[#171717] focus:border-[#D2886F] focus:ring-1 focus:ring-[#D2886F] outline-none transition-all tracking-tight"
                >
                  {dayOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={entry.period}
                  onChange={(e) => handleEntryChange(entry.id, 'period', Number(e.target.value))}
                  className="w-16 flex-shrink-0 border border-[#e5e5e5] rounded-lg px-2 py-2 text-sm font-light text-[#171717] focus:border-[#D2886F] focus:ring-1 focus:ring-[#D2886F] outline-none transition-all tracking-tight"
                >
                  {PERIOD_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                {columns.map((col) => (
                  <input
                    key={col.id}
                    type="text"
                    value={entry.customFields[col.id] ?? ''}
                    onChange={(e) => handleCustomFieldChange(entry.id, col.id, e.target.value)}
                    placeholder={col.label}
                    className="flex-1 min-w-[100px] border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm font-light text-[#171717] focus:border-[#D2886F] focus:ring-1 focus:ring-[#D2886F] outline-none transition-all tracking-tight"
                  />
                ))}

                <button
                  type="button"
                  onClick={() => handleRemoveEntry(entry.id)}
                  className="p-2 flex-shrink-0 text-[#a3a3a3] hover:text-red-500 transition-colors"
                  aria-label="삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddEntry}
            className="w-full border border-dashed border-[#e5e5e5] rounded-lg px-3 py-2 text-xs text-[#525252] hover:border-[#D2886F] hover:text-[#D2886F] transition-all mt-2"
          >
            + 항목 추가
          </button>
        </div>

        {/* 생성 버튼 */}
        <button
          type="submit"
          className="w-full py-3 bg-[#D2886F] text-white rounded-lg hover:bg-[#C17760] transition-all hover:shadow-md font-normal tracking-tight text-sm mt-4"
        >
          시간표 생성
        </button>
      </form>
    </div>
  );
}
