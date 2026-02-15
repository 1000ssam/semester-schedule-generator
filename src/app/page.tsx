'use client';

import { useState } from 'react';
import ScheduleForm from '@/components/ScheduleForm';
import DataTable from '@/components/DataTable';
import Toolbar from '@/components/Toolbar';
import Footer from '@/components/Footer';
import { generateSchedule } from '@/lib/generator';
import { GenerateResult, WeeklyEntry, ColumnDef } from '@/lib/types';

export default function Home() {
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [columns, setColumns] = useState<ColumnDef[]>([]);

  const handleGenerate = (startDate: string, endDate: string, entries: WeeklyEntry[], cols: ColumnDef[]) => {
    try {
      setError('');
      const result = generateSchedule(startDate, endDate, entries, cols);
      setGenerateResult(result);
      setColumns(cols);
      setSelectedRows(new Set());
    } catch (error) {
      console.error('생성 오류:', error);
      setError(error instanceof Error ? error.message : '시간표 생성 중 오류가 발생했습니다.');
      setGenerateResult(null);
    }
  };

  const handleReset = () => {
    setGenerateResult(null);
    setError('');
    setSelectedRows(new Set());
  };

  const handleRowSelect = (rowIndex: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && generateResult) {
      setSelectedRows(new Set(Array.from({ length: generateResult.rows.length }, (_, i) => i)));
    } else {
      setSelectedRows(new Set());
    }
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 - 중앙 정렬 */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-white/50 backdrop-blur-[10px] border border-[#e5e5e5] rounded-full text-xs font-light text-[#525252] mb-3 tracking-tight">
            학교 시간표 관리 도구
          </div>
          <h1 className="text-2xl font-light text-[#171717] leading-tight tracking-[-0.02em] mb-2 mx-auto">
            전체 학기 시간표 생성기
          </h1>
          <p className="text-sm font-light text-[#525252] leading-snug tracking-tight mx-auto max-w-2xl">
            주간 시간표에서 전체 학기 시간표를 자동 생성합니다
          </p>
        </div>

        {/* 폼 또는 결과 표시 - 중앙 정렬 */}
        {!generateResult ? (
          <div className="flex flex-col items-center">
            <ScheduleForm onGenerate={handleGenerate} />

            {/* 오류 메시지 */}
            {error && (
              <div className="mt-4 max-w-2xl w-full p-3 bg-white border border-red-300 rounded-lg shadow-sm">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-normal text-[#171717] mb-0.5 tracking-tight">
                      생성 오류
                    </h3>
                    <p className="text-xs font-light text-[#525252] leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 사용 안내 */}
            <div className="mt-4 max-w-2xl w-full p-3 bg-white border border-[#e5e5e5] rounded-lg shadow-sm">
              <h3 className="text-sm font-normal text-[#171717] mb-2 tracking-tight">
                사용 방법
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-xs font-light text-[#525252] leading-relaxed">
                <li>학기 시작일과 종료일을 입력하세요</li>
                <li>출력 컬럼을 설정하세요 (기본: 영역, 학급 / 추가·삭제·이름변경 가능)</li>
                <li>주간 시간표 항목을 추가하세요 (요일, 교시 + 설정한 컬럼)</li>
                <li>&quot;시간표 생성&quot; 버튼을 클릭하면 전체 학기 시간표가 CSV로 생성됩니다</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            {/* 결과 정보 및 리셋 버튼 */}
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-3 rounded-lg shadow-sm border border-[#e5e5e5]">
              <div>
                <h2 className="text-sm font-normal text-[#171717] tracking-tight">
                  전체 학기 시간표
                </h2>
                <p className="text-xs font-light text-[#525252] mt-0.5">
                  {generateResult.rows.length}행 생성 완료 ✓
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-white border border-[#e5e5e5] text-[#525252] text-xs font-normal rounded-lg hover:border-[#D2886F] hover:text-[#171717] transition-all tracking-tight whitespace-nowrap"
              >
                새 시간표 생성
              </button>
            </div>

            {/* 툴바 */}
            <Toolbar
              headers={generateResult.headers}
              rows={generateResult.rows}
              selectedRows={selectedRows}
              columns={columns}
            />

            {/* 데이터 테이블 */}
            <DataTable
              headers={generateResult.headers}
              rows={generateResult.rows}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
            />
          </>
        )}

        {/* 푸터 */}
        <Footer />
      </div>
    </div>
  );
}
