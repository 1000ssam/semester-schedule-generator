/** 컬럼 정의 */
export interface ColumnDef {
  id: string;
  label: string;
}

/** 디폴트 컬럼 */
export const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'subject', label: '영역' },
  { id: 'className', label: '학급' },
];

/** 시간표 항목 */
export interface WeeklyEntry {
  id: string;
  dayOfWeek: number;  // 0=Sun, 1=Mon, ..., 6=Sat
  period: number;
  customFields: Record<string, string>;  // columnDef.id → value
}

/** 출력 행 */
export type ScheduleRow = Record<string, string | number>;

/** 생성 결과 */
export interface GenerateResult {
  headers: string[];
  rows: ScheduleRow[];
}
