import { ScoringConfig } from '@prisma/client';
import { Info, Calculator, Trophy, Medal, Hash, Activity } from 'lucide-react';

export default function HowItWorks({ config }: { config: ScoringConfig }) {
  const tieBreakOrder = JSON.parse(config.tieBreakOrder || '["tpct","ntw","apct","pc"]');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-6">
      <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 font-bold text-lg flex items-center gap-2">
        <Info size={20} />
        How It Works
      </div>
      
      <div className="p-5 space-y-6 text-sm text-gray-700 dark:text-gray-300">
        
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mb-2">
            <Calculator size={16} className="text-blue-500" />
            Live Formulas
          </h3>
          <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <div className="font-semibold text-blue-600 dark:text-blue-400">APCT (Win Percentage)</div>
              <div className="font-mono text-xs mt-1 bg-gray-200 dark:bg-gray-800 p-1.5 rounded">
                (PG ÷ PC) × 100
              </div>
            </div>
            <div>
              <div className="font-semibold text-purple-600 dark:text-purple-400">BPCT (Bonus Points)</div>
              <div className="font-mono text-xs mt-1 bg-gray-200 dark:bg-gray-800 p-1.5 rounded">
                (NTW × {config.titlePoints}) + (NTR × {config.runnerUpPoints})
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-600 dark:text-green-400">TPCT (Total Score)</div>
              <div className="font-mono text-xs mt-1 bg-gray-200 dark:bg-gray-800 p-1.5 rounded">
                APCT + BPCT
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mb-2">
            <Activity size={16} className="text-blue-500" />
            Column Glossary
          </h3>
          <ul className="space-y-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">
            <li className="flex gap-2 items-start"><Hash size={14} className="mt-0.5 shrink-0" /> <b>PC:</b> Matches Played</li>
            <li className="flex gap-2 items-start"><Trophy size={14} className="mt-0.5 shrink-0" /> <b>PG:</b> Matches Won</li>
            <li className="flex gap-2 items-start"><Medal size={14} className="mt-0.5 shrink-0 text-yellow-500" /> <b>NTW:</b> Titles Won</li>
            <li className="flex gap-2 items-start"><Medal size={14} className="mt-0.5 shrink-0 text-gray-400" /> <b>NTR:</b> Runner-up</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mb-2">
            <Info size={16} className="text-blue-500" />
            Rules
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Minimum Matches:</b> {config.minMatches}</li>
            <li><b>Tie-Breaks:</b> {tieBreakOrder.map((o: string) => o.toUpperCase()).join(' → ')}</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
