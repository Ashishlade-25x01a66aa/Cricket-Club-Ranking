import { PrismaClient } from '@prisma/client';
import { rankTeams } from '@/lib/ranking';
import Podium from '@/components/Podium';
import LeaderboardTable from '@/components/LeaderboardTable';
import HowItWorks from '@/components/HowItWorks';
import Link from 'next/link';

const prisma = new PrismaClient();

export const revalidate = 0; // Dynamic rendering for live updates

export default async function Home() {
  const [teams, config] = await Promise.all([
    prisma.team.findMany(),
    prisma.scoringConfig.findUnique({ where: { id: 'default' } }),
  ]);

  const activeConfig = config || {
    id: 'default',
    titlePoints: 1.0,
    runnerUpPoints: 0.3,
    tieBreakOrder: '["tpct","ntw","apct","pc"]',
    minMatches: 0,
  };

  const rankedTeams = rankTeams(teams, activeConfig);

  const numTeams = teams.length;
  const numLeagues = new Set(teams.map(t => t.league)).size;
  const lastUpdated = new Date().toLocaleString('en-US', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 selection:bg-blue-500 selection:text-white">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl italic">
              C
            </div>
            <h1 className="font-bold text-xl tracking-tight">
              BEST CLUB <span className="text-blue-600 dark:text-blue-400">Leaderboard</span>
            </h1>
          </div>
          <Link 
            href="/admin" 
            className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-1">Global Club Rankings</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Tracking performance across {numLeagues} global T20 leagues.
            </p>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0 text-center">
            <div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{numTeams}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Teams Ranked</div>
            </div>
            <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
            <div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{numLeagues}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Active Leagues</div>
            </div>
          </div>
        </div>

        {/* Podium */}
        <Podium topTeams={rankedTeams} />

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Table Area */}
          <div className="w-full lg:w-3/4">
            <LeaderboardTable teams={rankedTeams} />
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-1/4">
            <HowItWorks config={activeConfig} />
          </div>

        </div>
      </main>

    </div>
  );
}
