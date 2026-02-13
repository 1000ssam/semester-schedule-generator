import { ScheduleRow, ColumnDef } from './types';

/**
 * CSV 값 이스케이프 (표준)
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
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
 */
export function convertToTSV(headers: string[], rows: ScheduleRow[]): string {
  const lines: string[] = [];

  // Header
  lines.push(headers.join('\t'));

  // Data
  rows.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return value !== undefined && value !== null ? String(value) : '';
    });
    lines.push(values.join('\t'));
  });

  return lines.join('\n');
}
