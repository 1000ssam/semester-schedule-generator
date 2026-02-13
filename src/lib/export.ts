import { ScheduleRow, ColumnDef } from './types';

/**
 * 엑셀이 날짜로 오인하는 숫자-하이픈 패턴 감지
 * 예: "1-7", "01-07", "3-4-5"
 */
const DIGIT_HYPHEN_RE = /^\d+(-\d+)+$/;

/**
 * CSV 값 이스케이프 (표준 + 숫자보호)
 * 숫자-하이픈 패턴 앞에 ' 접두사를 붙여 엑셀 날짜 변환 방지
 */
function escapeCSVValue(value: string): string {
  let v = value;
  if (DIGIT_HYPHEN_RE.test(v)) {
    v = "'" + v;
  }
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/**
 * 데이터를 CSV 형식으로 변환
 */
export function convertToCSV(headers: string[], rows: ScheduleRow[], columns: ColumnDef[]): string {
  const lines: string[] = [];

  // Header row
  lines.push(headers.join(','));

  // Data rows
  rows.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      const strValue = value !== undefined && value !== null ? String(value) : '';
      return escapeCSVValue(strValue);
    });
    lines.push(values.join(','));
  });

  return lines.join('\n');
}

/**
 * CSV 파일로 내보내기 (BOM 포함)
 */
export function exportToCSV(
  headers: string[],
  rows: ScheduleRow[],
  filename: string = '학기시간표.csv',
  columns: ColumnDef[]
) {
  const csv = convertToCSV(headers, rows, columns);

  // BOM for UTF-8
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * TSV 형식으로 변환 (클립보드 복사용)
 * includeHeader: 첫 묶음에만 헤더를 포함하고 이후 묶음에는 생략할 때 false
 */
export function convertToTSV(
  headers: string[],
  rows: ScheduleRow[],
  includeHeader: boolean = true
): string {
  const lines: string[] = [];

  if (includeHeader) {
    lines.push(headers.join('\t'));
  }

  rows.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return value !== undefined && value !== null ? String(value) : '';
    });
    lines.push(values.join('\t'));
  });

  return lines.join('\n');
}
