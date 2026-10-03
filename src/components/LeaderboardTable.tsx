'use client';

import { useState } from 'react';
import { RankedTeam } from '@/lib/ranking';
import { ChevronUp, ChevronDown, ChevronsUpDown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeaderboardTable({ teams }: { teams: RankedTeam[] }) {
  const [sortCol, setSortCol] = useState<keyof RankedTeam>('rank');
  const [sortDesc, setSortDesc] = useState(false);
  const [search, setSearch] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('All');

  const leagues = ['All', ...Array.from(new Set(teams.map(t => t.league))).sort()];

  const handleSort = (col: keyof RankedTeam) => {
    if (sortCol === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortCol(col);
      // Default numeric to desc, text to asc
      setSortDesc(['rank', 'team', 'league'].includes(col) ? false : true);
    }
  };

  const filteredTeams = teams.filter(t => 
    (leagueFilter === 'All' || t.league === leagueFilter) &&
    (t.team.toLowerCase().includes(search.toLowerCase()))
  );

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    const aVal = a[sortCol];
    const bVal = b[sortCol];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDesc ? bVal - aVal : aVal - bVal;
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDesc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
    return 0;
  });

  const exportCSV = () => {
    const headers = ['Rank', 'Team', 'League', 'PC', 'PG', 'NTW', 'NTR', 'APCT', 'BPCT', 'TPCT'];
    const rows = sortedTeams.map(t => [
      t.rank, t.team, t.league, t.pc, t.pg, t.ntw, t.ntr, t.apct, t.bpct, t.tpct
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'leaderboard.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ col }: { col: keyof RankedTeam }) => {
    if (sortCol !== col) return <ChevronsUpDown size={14} className="text-gray-400 opacity-50" />;
    return sortDesc ? <ChevronDown size={14} className="text-blue-500" /> : <ChevronUp size={14} className="text-blue-500" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <div className="flex w-full md:w-auto gap-4">
          <input 
            type="text" 
            placeholder="Search teams..." 
            className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow md:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
          >
            {leagues.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 text-sm bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors w-full md:w-auto justify-center"
        >
          <Download size={16} /> Download CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-900/80 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {[
                { k: 'rank', l: 'Rank', title: 'Current Rank' },
                { k: 'team', l: 'Team', title: 'Team Name' },
                { k: 'league', l: 'League', title: 'League Name' },
                { k: 'pc', l: 'PC', title: 'Matches Played (Played Count)' },
                { k: 'pg', l: 'PG', title: 'Matches Won (Played Good)' },
                { k: 'ntw', l: 'NTW', title: 'Number of Titles Won' },
                { k: 'ntr', l: 'NTR', title: 'Number of Runner-up finishes' },
                { k: 'apct', l: 'APCT', title: 'Win Percentage (PG/PC*100)' },
                { k: 'bpct', l: 'BPCT', title: 'Bonus Points (Titles & Runner-ups)' },
                { k: 'tpct', l: 'TPCT', title: 'Total Percentage Score (APCT+BPCT)' },
              ].map((col) => (
                <th 
                  key={col.k} 
                  scope="col" 
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${col.k === 'tpct' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' : ''}`}
                  onClick={() => handleSort(col.k as keyof RankedTeam)}
                  title={col.title}
                >
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    {col.l}
                    <SortIcon col={col.k as keyof RankedTeam} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sortedTeams.map((team, index) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={team.id} 
                  className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/80'}`}
                >
                  <td className="px-4 py-3 font-bold">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full ${team.rank === 1 ? 'bg-yellow-100 text-yellow-700' : team.rank === 2 ? 'bg-gray-200 text-gray-700' : team.rank === 3 ? 'bg-orange-100 text-orange-800' : ''}`}>
                        {team.rank > 0 ? team.rank : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{team.team}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded">
                      {team.league}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{team.pc}</td>
                  <td className="px-4 py-3 text-gray-500">{team.pg}</td>
                  <td className="px-4 py-3 font-medium">{team.ntw}</td>
                  <td className="px-4 py-3 font-medium">{team.ntr}</td>
                  <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">{team.apct.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono text-purple-600 dark:text-purple-400">{team.bpct.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">
                    {team.tpct.toFixed(2)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {sortedTeams.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No teams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
