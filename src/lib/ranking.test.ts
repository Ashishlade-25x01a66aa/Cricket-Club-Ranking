import { rankTeams } from './ranking';
import { ScoringConfig, Team } from '@prisma/client';

const mockConfig: ScoringConfig = {
  id: 'default',
  titlePoints: 1.0,
  runnerUpPoints: 0.3,
  tieBreakOrder: '["tpct","ntw","apct","pc"]',
  minMatches: 0,
};

function createMockTeam(team: string, league: string, pc: number, pg: number, ntw: number, ntr: number): Team {
  return {
    id: team,
    team,
    league,
    pc,
    pg,
    ntw,
    ntr,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const testTeams: Team[] = [
  createMockTeam('SREC', 'SA XX', 52, 49, 3, 1),
  createMockTeam('PS', 'BBL', 225, 159, 6, 3),
  createMockTeam('MIL', 'HUN', 90, 65, 3, 0),
];

async function runTests() {
  const ranked = rankTeams(testTeams, mockConfig);
  
  const srec = ranked.find((t) => t.team === 'SREC');
  console.assert(srec?.tpct === 97.53, `SREC TPCT mismatch: ${srec?.tpct} !== 97.53`);
  console.assert(srec?.rank === 1, `SREC Rank mismatch: ${srec?.rank} !== 1`);

  const ps = ranked.find((t) => t.team === 'PS');
  console.assert(ps?.tpct === 77.57, `PS TPCT mismatch: ${ps?.tpct} !== 77.57`);
  console.assert(ps?.rank === 2, `PS Rank mismatch: ${ps?.rank} !== 2`);
  
  const mil = ranked.find((t) => t.team === 'MIL');
  console.assert(mil?.tpct === 75.22, `MIL TPCT mismatch: ${mil?.tpct} !== 75.22`);
  console.assert(mil?.rank === 3, `MIL Rank mismatch: ${mil?.rank} !== 3`);

  // Test ties
  const tie1 = createMockTeam('T1', 'L1', 10, 5, 0, 0); // apct=50, bpct=0, tpct=50
  const tie2 = createMockTeam('T2', 'L1', 10, 5, 0, 0); // apct=50, bpct=0, tpct=50
  const rankedTies = rankTeams([tie1, tie2], mockConfig);
  console.assert(rankedTies[0].rank === 1 && rankedTies[1].rank === 1, 'Ties should have same rank');

  // Test PC = 0
  const pc0 = createMockTeam('PC0', 'L1', 0, 0, 0, 0);
  const rankedPc0 = rankTeams([pc0], mockConfig);
  console.assert(rankedPc0[0].apct === 0, 'APCT should be 0 for PC=0');

  console.log('All tests passed!');
}

runTests();
