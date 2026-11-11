'use client';

import { RankedTeam } from '@/lib/ranking';
import { motion } from 'framer-motion';

export default function Podium({ topTeams }: { topTeams: RankedTeam[] }) {
  const getPodiumOrder = () => {
    if (!topTeams || topTeams.length === 0) return [];
    const first = topTeams.find((t) => t.rank === 1) || topTeams[0];
    const second = topTeams.find((t) => t.rank === 2) || topTeams[1];
    const third = topTeams.find((t) => t.rank === 3) || topTeams[2];
    return [second, first, third].filter(Boolean) as RankedTeam[];
  };

  const orderedTeams = getPodiumOrder();

  const getHeight = (rank: number) => {
    if (rank === 1) return 'h-48 md:h-56';
    if (rank === 2) return 'h-40 md:h-48';
    return 'h-32 md:h-40';
  };

  const getColors = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-t from-yellow-600 to-yellow-400 border-yellow-300';
    if (rank === 2) return 'bg-gradient-to-t from-gray-400 to-gray-300 border-gray-200';
    return 'bg-gradient-to-t from-amber-700 to-amber-600 border-amber-500';
  };

  if (orderedTeams.length === 0) return null;

  return (
    <div className="flex justify-center items-end gap-2 md:gap-6 mt-8 mb-12">
      {orderedTeams.map((team) => (
        <motion.div
          key={team.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: team.rank * 0.1 }}
          className="flex flex-col items-center w-28 md:w-40"
        >
          <div className="text-center mb-2 flex flex-col items-center">
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.team}
                className="w-12 h-12 rounded-full object-contain bg-white shadow-md border-2 border-gray-100 dark:border-gray-700 p-1 mb-1.5"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-black text-sm flex items-center justify-center mb-1.5 shadow-xs ${team.logo ? 'hidden' : ''}`}>
              {team.team.slice(0, 2).toUpperCase()}
            </div>
            <div className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate w-full px-2" title={team.team}>
              {team.team}
            </div>
            <div className="text-xs text-gray-500 font-semibold bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5 mt-1 mx-auto max-w-fit">
              {team.league}
            </div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
              {team.tpct.toFixed(2)}
            </div>
          </div>
          <div
            className={`w-full rounded-t-lg shadow-lg border-t-4 flex items-start justify-center pt-4 ${getHeight(
              team.rank
            )} ${getColors(team.rank)}`}
          >
            <span className="text-3xl font-black text-white/90 drop-shadow-md">
              {team.rank}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
