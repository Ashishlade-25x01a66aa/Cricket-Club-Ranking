import { ScoringConfig } from '@prisma/client';
import { Table, Trophy, Medal, Calculator } from 'lucide-react';

interface PointsMatrixProps {
  config?: ScoringConfig;
}

const matrixData = [
  { pos: '1st', t10: 16, t9: 15, t8: 15, t7: 14, t6: 13, t5: 12 },
  { pos: '2nd', t10: 12, t9: 12, t8: 11, t7: 10, t6: 10, t5: 9 },
  { pos: '3rd', t10: 10, t9: 9,  t8: 8,  t7: 7,  t6: 6,  t5: 5 },
  { pos: '4th', t10: 9,  t9: 8,  t8: 7,  t7: 6,  t6: 5,  t5: 3 },
  { pos: '5th', t10: 8,  t9: 7,  t8: 6,  t7: 5,  t6: 3,  t5: 1 },
  { pos: '6th', t10: 7,  t9: 6,  t8: 5,  t7: 3,  t6: 1,  t5: null },
  { pos: '7th', t10: 6,  t9: 5,  t8: 3,  t7: 1,  t6: null, t5: null },
  { pos: '8th', t10: 5,  t9: 3,  t8: 1,  t7: null, t6: null, t5: null },
  { pos: '9th', t10: 3,  t9: 1,  t8: null, t7: null, t6: null, t5: null },
  { pos: '10th', t10: 1, t9: null, t8: null, t7: null, t6: null, t5: null },
];

export default function PointsMatrix({ config }: PointsMatrixProps) {
  const titlePoints = config?.titlePoints ?? 1.0;
  const runnerUpPoints = config?.runnerUpPoints ?? 0.3;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white p-4 font-bold text-base flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table size={18} />
          <span>Points Allocation Matrix</span>
        </div>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
          League Matrix
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Table Container */}
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xs">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700">
                <th className="py-2.5 px-2 text-left font-bold text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700">
                  Team pos.
                </th>
                <th className="py-2.5 px-1.5 border-r border-gray-200 dark:border-gray-700">10 teams</th>
                <th className="py-2.5 px-1.5 border-r border-gray-200 dark:border-gray-700">9 teams</th>
                <th className="py-2.5 px-1.5 border-r border-gray-200 dark:border-gray-700">8 teams</th>
                <th className="py-2.5 px-1.5 border-r border-gray-200 dark:border-gray-700">7 teams</th>
                <th className="py-2.5 px-1.5 border-r border-gray-200 dark:border-gray-700">6 teams</th>
                <th className="py-2.5 px-1.5">5 teams</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200 font-medium">
              {matrixData.map((row, idx) => {
                const isFirst = row.pos === '1st';
                const isSecond = row.pos === '2nd';
                const isThird = row.pos === '3rd';
                return (
                  <tr 
                    key={row.pos}
                    className={`transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/20 ${
                      idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/60 dark:bg-gray-800/60'
                    }`}
                  >
                    <td className="py-2 px-2 text-left font-semibold border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isFirst && <span className="w-4 h-4 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-[10px] font-bold">1</span>}
                        {isSecond && <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-bold">2</span>}
                        {isThird && <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">3</span>}
                        {!isFirst && !isSecond && !isThird && <span className="w-4 text-center text-gray-400 text-[11px]">•</span>}
                        <span className={isFirst ? 'font-bold text-yellow-700 dark:text-yellow-400' : isSecond ? 'font-bold text-gray-700 dark:text-gray-300' : isThird ? 'font-bold text-amber-700 dark:text-amber-400' : ''}>
                          {row.pos}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-1.5 border-r border-gray-200 dark:border-gray-700 font-mono font-bold text-blue-600 dark:text-blue-400">{row.t10 ?? '-'}</td>
                    <td className="py-2 px-1.5 border-r border-gray-200 dark:border-gray-700 font-mono font-bold text-blue-600 dark:text-blue-400">{row.t9 ?? '-'}</td>
                    <td className="py-2 px-1.5 border-r border-gray-200 dark:border-gray-700 font-mono font-bold text-blue-600 dark:text-blue-400">{row.t8 ?? '-'}</td>
                    <td className="py-2 px-1.5 border-r border-gray-200 dark:border-gray-700 font-mono font-bold text-blue-600 dark:text-blue-400">{row.t7 ?? '-'}</td>
                    <td className="py-2 px-1.5 border-r border-gray-200 dark:border-gray-700 font-mono font-bold text-blue-600 dark:text-blue-400">{row.t6 ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono font-bold text-blue-600 dark:text-blue-400">{row.t5 ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Scoring Notes Below Table */}
        <div className="bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
          <div>
            <span className="font-bold text-blue-600 dark:text-blue-400">APCT:</span>{' '}
            <span className="text-gray-600 dark:text-gray-300 font-mono">No. points gain / total no. of points contested for</span>
          </div>

          <div className="pt-1.5 border-t border-gray-200 dark:border-gray-700">
            <span className="font-bold text-purple-600 dark:text-purple-400">BPCT:</span>
            <div className="pl-3 mt-1 space-y-0.5 text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>Champions = <strong className="text-gray-800 dark:text-gray-100 font-mono">{titlePoints.toFixed(1)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>Runners up = <strong className="text-gray-800 dark:text-gray-100 font-mono">{runnerUpPoints.toFixed(1)}</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-1.5 border-t border-gray-200 dark:border-gray-700">
            <span className="font-bold text-green-600 dark:text-green-400">TPCT:</span>{' '}
            <span className="font-mono font-semibold text-gray-800 dark:text-gray-100">APCT + BPCT</span>
          </div>
        </div>
      </div>
    </div>
  );
}

