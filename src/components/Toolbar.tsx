'use client';

import { useState, useCallback } from 'react';
import { ScheduleRow, ColumnDef } from '@/lib/types';
import { convertToTSV, exportToCSV } from '@/lib/export';

const CHUNK_SIZE = 100;

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

  // 분할 복사 상태
  const [chunkIndex, setChunkIndex] = useState(0);
  const [showChunkModal, setShowChunkModal] = useState(false);

  const totalChunks = Math.ceil(rows.length / CHUNK_SIZE);

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

  // 분할 복사: 모달 열기
  const handleOpenChunkCopy = useCallback(() => {
    setChunkIndex(0);
    setShowChunkModal(true);
  }, []);

  // 분할 복사: 현재 묶음 복사
  const handleCopyChunk = useCallback(async () => {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, rows.length);
    const chunk = rows.slice(start, end);
    const includeHeader = chunkIndex === 0;

    try {
      const tsv = convertToTSV(headers, chunk, includeHeader);
      await navigator.clipboard.writeText(tsv);
    } catch (error) {
      console.error('복사 오류:', error);
      alert('클립보드 복사에 실패했습니다.');
    }
  }, [chunkIndex, rows, headers]);

  // 분할 복사: 다음 묶음
  const handleNextChunk = useCallback(async () => {
    // 먼저 현재 묶음 복사
    await handleCopyChunk();
    if (chunkIndex + 1 < totalChunks) {
      setChunkIndex(prev => prev + 1);
    } else {
      setShowChunkModal(false);
    }
  }, [handleCopyChunk, chunkIndex, totalChunks]);

  const chunkStart = chunkIndex * CHUNK_SIZE + 1;
  const chunkEnd = Math.min((chunkIndex + 1) * CHUNK_SIZE, rows.length);
  const isLastChunk = chunkIndex + 1 >= totalChunks;

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

        {/* 분할 복사 (행이 CHUNK_SIZE 초과 시에만 표시) */}
        {rows.length > CHUNK_SIZE && (
          <button
            onClick={handleOpenChunkCopy}
            className="px-3 py-1.5 bg-white border border-[#e5e5e5] text-[#171717] text-xs font-normal rounded-lg hover:border-[#D2886F] hover:shadow-md transition-all flex items-center gap-1.5 tracking-tight"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            분할 복사
          </button>
        )}

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

      {/* 분할 복사 모달 */}
      {showChunkModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg border border-[#e5e5e5] p-6 max-w-sm w-full mx-4">
            <h3 className="text-sm font-normal text-[#171717] tracking-tight mb-1">
              분할 복사
            </h3>
            <p className="text-xs font-light text-[#525252] tracking-tight mb-4">
              전체 복사 시 데이터가 너무 커서 노션 등에 붙여넣기가 실패할 수 있습니다.
              {CHUNK_SIZE}행씩 나누어 복사합니다. 붙여넣은 뒤 다음 버튼을 누르세요.
            </p>

            {/* 진행 표시 */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-light text-[#525252] mb-1">
                <span>{chunkIndex + 1} / {totalChunks} 묶음</span>
                <span>{chunkStart}~{chunkEnd}행</span>
              </div>
              <div className="w-full bg-[#e5e5e5] rounded-full h-1.5">
                <div
                  className="bg-[#D2886F] h-1.5 rounded-full transition-all"
                  style={{ width: `${((chunkIndex + 1) / totalChunks) * 100}%` }}
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowChunkModal(false)}
                className="flex-1 px-3 py-2 bg-white border border-[#e5e5e5] text-[#525252] text-xs font-normal rounded-lg hover:border-[#D2886F] transition-all tracking-tight"
              >
                닫기
              </button>
              <button
                onClick={handleNextChunk}
                className="flex-1 px-3 py-2 bg-[#D2886F] text-white text-xs font-normal rounded-lg hover:bg-[#C17760] transition-all tracking-tight"
              >
                {isLastChunk
                  ? `${chunkStart}~${chunkEnd}행 복사 후 완료`
                  : `${chunkStart}~${chunkEnd}행 복사 → 다음`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
