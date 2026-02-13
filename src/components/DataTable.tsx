'use client';

import { ScheduleRow } from '@/lib/types';

interface DataTableProps {
  headers: string[];
  rows: ScheduleRow[];
  selectedRows: Set<number>;
  onRowSelect: (rowIndex: number) => void;
  onSelectAll: (selected: boolean) => void;
}

export default function DataTable({
  headers,
  rows,
  selectedRows,
  onRowSelect,
  onSelectAll
}: DataTableProps) {
  if (headers.length === 0 || rows.length === 0) {
    return null;
  }

  const allSelected = selectedRows.size === rows.length && rows.length > 0;
  const someSelected = selectedRows.size > 0 && selectedRows.size < rows.length;

  return (
    <div className="w-full overflow-auto border border-[#e5e5e5] rounded-lg shadow-sm bg-white">
      <div className="max-h-[500px] overflow-auto">
        <table className="w-full table-fixed divide-y divide-[#e5e5e5]">
          <thead className="bg-[#fafafa] sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 w-12 border-r border-[#e5e5e5]">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = someSelected;
                      }
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#e5e5e5] text-[#D2886F] focus:ring-[#D2886F] focus:ring-offset-0 cursor-pointer"
                  />
                </div>
              </th>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-3 py-2 text-left text-xs font-normal text-[#525252] tracking-tight whitespace-nowrap border-r border-[#e5e5e5] last:border-r-0"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#e5e5e5]">
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`transition-colors ${
                  selectedRows.has(rowIdx)
                    ? 'bg-[#D2886F]/10'
                    : 'hover:bg-[#fafafa]'
                }`}
              >
                <td className="px-3 py-2 w-12 border-r border-[#e5e5e5]">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIdx)}
                      onChange={() => onRowSelect(rowIdx)}
                      className="w-3.5 h-3.5 rounded border-[#e5e5e5] text-[#D2886F] focus:ring-[#D2886F] focus:ring-offset-0 cursor-pointer"
                    />
                  </div>
                </td>
                {headers.map((header, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-3 py-2 text-xs font-light text-[#171717] whitespace-nowrap border-r border-[#e5e5e5] last:border-r-0 select-text tracking-tight"
                  >
                    {row[header] !== undefined && row[header] !== null
                      ? String(row[header])
                      : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
