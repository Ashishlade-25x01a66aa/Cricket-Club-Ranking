import { Team, ScoringConfig } from '@prisma/client';

export type RankedTeam = Team & {
  apct: number;
  bpct: number;
  tpct: number;
  rank: number;
  previousRank?: number;
};

export function rankTeams(teams: Team[], config: ScoringConfig): RankedTeam[] {
  let tieBreakOrder = ["tpct", "ntw", "apct", "pc"];
  try {
    tieBreakOrder = JSON.parse(config.tieBreakOrder || '["tpct","ntw","apct","pc"]');
  } catch (e) {
    // default
  }

  const computedTeams = teams.map((t) => {
    // APCT = (PG / PC) × 100, rounded to 2 decimals (0 if PC = 0)
    let apct = t.pc > 0 ? (t.pg / t.pc) * 100 : 0;
    apct = Math.round(apct * 100) / 100;

    // BPCT = (NTW × title_points) + (NTR × runner_up_points), rounded to 2 decimals
    let bpct = t.ntw * config.titlePoints + t.ntr * config.runnerUpPoints;
    bpct = Math.round(bpct * 100) / 100;

    // TPCT = APCT + BPCT, rounded to 2 decimals
    let tpct = apct + bpct;
    tpct = Math.round(tpct * 100) / 100;

    return {
      ...t,
      apct,
      bpct,
      tpct,
    };
  });

  const eligibleTeams = computedTeams.filter((t) => t.pc >= config.minMatches);
  const ineligibleTeams = computedTeams.filter((t) => t.pc < config.minMatches);

  eligibleTeams.sort((a, b) => {
    for (const criterion of tieBreakOrder) {
      const aVal = a[criterion as keyof typeof a];
      const bVal = b[criterion as keyof typeof b];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        if (bVal !== aVal) {
          return bVal - aVal; // descending
        }
      }
    }
    // If still tied, tie break on Team Name alphabetically
    return a.team.localeCompare(b.team);
  });

  let currentRank = 1;
  const rankedEligible = eligibleTeams.map((t, index) => {
    if (index > 0) {
      const prev = eligibleTeams[index - 1];
      let isEqual = true;
      for (const criterion of tieBreakOrder) {
        if (t[criterion as keyof typeof t] !== prev[criterion as keyof typeof prev]) {
          isEqual = false;
          break;
        }
      }
      if (!isEqual) {
        currentRank = index + 1;
      }
    }
    return {
      ...t,
      rank: currentRank,
    };
  });

  // Sort ineligible teams alphabetically and set rank to a high number or -1
  ineligibleTeams.sort((a, b) => a.team.localeCompare(b.team));
  const rankedIneligible = ineligibleTeams.map((t) => ({ ...t, rank: -1 }));

  return [...rankedEligible, ...rankedIneligible];
}
