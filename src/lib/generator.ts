import { WeeklyEntry, ScheduleRow, GenerateResult, ColumnDef } from './types';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function generateSchedule(
  startDateStr: string,
  endDateStr: string,
  entries: WeeklyEntry[],
  columns: ColumnDef[]
): GenerateResult {
  // Validate inputs
  if (!startDateStr || !endDateStr) {
    throw new Error('시작일과 종료일을 입력해주세요.');
  }

  // Parse as local date (not UTC) by using YYYY-MM-DDT00:00:00 format
  const startDate = new Date(startDateStr + 'T00:00:00');
  const endDate = new Date(endDateStr + 'T00:00:00');

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('유효한 날짜를 입력해주세요.');
  }

  if (startDate > endDate) {
    throw new Error('시작일이 종료일보다 늦을 수 없습니다.');
  }

  if (entries.length === 0) {
    throw new Error('최소 하나의 시간표 항목을 추가해주세요.');
  }

  const headers = ['교시', '날짜', '요일', ...columns.map(c => c.label)];
  const rows: ScheduleRow[] = [];

  // Iterate through each day in the range
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Find entries that match this day of week
    const matchingEntries = entries.filter(entry => entry.dayOfWeek === dayOfWeek);

    // Sort by period
    matchingEntries.sort((a, b) => a.period - b.period);

    // Generate rows for each matching entry
    matchingEntries.forEach(entry => {
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const dayName = DAY_NAMES[dayOfWeek];

      const row: ScheduleRow = {
        교시: `${entry.period}교시`,
        날짜: dateStr,
        요일: dayName,
      };

      columns.forEach(col => {
        row[col.label] = entry.customFields[col.id] || '';
      });

      rows.push(row);
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (rows.length === 0) {
    throw new Error('생성된 일정이 없습니다. 시간표 항목을 확인해주세요.');
  }

  return { headers, rows };
}
