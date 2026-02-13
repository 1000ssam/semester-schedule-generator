'use client';

import { ScheduleRow, ColumnDef } from '@/lib/types';
import { convertToTSV, exportToCSV } from '@/lib/export';

interface ToolbarProps {
  headers: string[];
  rows: ScheduleRow[];
  selectedRows: Set<number>;
  columns: ColumnDef[];
}

export default function Toolbar({ headers, rows, selectedRows, columns }: ToolbarProps) {
  const selectedRowsArray = Array.from(selectedRows).sort((a, b) => a - b);
  const selectedData = selectedRowsArray.map(idx => rows[idx]);
  const hasSelection = selectedRows.size > 0;

  const handleCopyAll = async () => {
    try {
      const tsv = convertToTSV(headers, rows);
      await navigator.clipboard.writeText(tsv);
      alert('전체 데이터가 클립보드에 복사되었습니다. 엑셀에 붙여넣을 수 있습니다.');
    } catch (error) {
      console.error('복사 오류:', error);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  const handleCopySelected = async () => {
    if (!hasSelection) {
      alert('복사할 행을 선택해주세요.');
      return;
    }

    try {
      const tsv = convertToTSV(headers, selectedData);
      await navigator.clipboard.writeText(tsv);
      alert(`선택된 ${selectedRows.size}개 행이 클립보드에 복사되었습니다.`);
    } catch (error) {
      console.error('복사 오류:', error);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  const handleDownloadAll = () => {
    try {
      exportToCSV(headers, rows, '학기시간표.csv', columns);
    } catch (error) {
      console.error('다운로드 오류:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  const handleDownloadSelected = () => {
    if (!hasSelection) {
      alert('다운로드할 행을 선택해주세요.');
      return;
    }

    try {
      exportToCSV(headers, selectedData, '학기시간표_선택.csv', columns);
    } catch (error) {
      console.error('다운로드 오류:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {/* 버튼 그룹 */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* 전체 복사/다운로드 */}
        <button
          onClick={handleCopyAll}
          className="px-3 py-1.5 bg-white border border-[#e5e5e5] text-[#171717] text-xs font-normal rounded-lg hover:border-[#D2886F] hover:shadow-md transition-all flex items-center gap-1.5 tracking-tight"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          전체 복사
        </button>

        <button
          onClick={handleDownloadAll}
          className="px-3 py-1.5 bg-[#D2886F] text-white text-xs font-normal rounded-lg hover:bg-[#C17760] transition-all hover:shadow-md flex items-center gap-1.5 tracking-tight"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          전체 다운로드
        </button>

        {/* 선택 복사/다운로드 */}
        {hasSelection && (
          <>
            <div className="w-px h-6 bg-[#e5e5e5]" />

            <button
              onClick={handleCopySelected}
              className="px-3 py-1.5 bg-white border-2 border-[#D2886F] text-[#D2886F] text-xs font-normal rounded-lg hover:bg-[#D2886F] hover:text-white transition-all flex items-center gap-1.5 tracking-tight"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              선택 복사 ({selectedRows.size})
            </button>

            <button
              onClick={handleDownloadSelected}
              className="px-3 py-1.5 bg-white border-2 border-[#D2886F] text-[#D2886F] text-xs font-normal rounded-lg hover:bg-[#D2886F] hover:text-white transition-all flex items-center gap-1.5 tracking-tight"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              선택 다운로드 ({selectedRows.size})
            </button>
          </>
        )}

        <div className="ml-auto text-xs text-[#525252] font-light tracking-tight">
          총 {rows.length}행
          {hasSelection && <span className="ml-2 text-[#D2886F]">({selectedRows.size}개 선택)</span>}
        </div>
      </div>
    </div>
  );
}
