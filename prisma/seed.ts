import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seedData = `SREC,SA XX,52,49,3,1 | PS,BBL,225,159,6,3 | MIL,HUN,90,65,3,0 | WF,MLC,52,38,1,2 | HKM,PSL,15,11,0,1 | JKM,CPL,14,10,0,1 | CSK,IPL,261,170,5,5 | MINY,MLC,52,36,2,0 | DV,ILT,52,36,1,2 | GT,IPL,80,54,1,2 | GAW,CPL,183,119,1,7 | SS,BBL,225,140,3,5 | MIE,ILT,52,34,1,1 | TKR,CPL,183,110,5,1 | TR,HUN,90,57,1,2 | DC,ILT,52,33,1,1 | PZ,PSL,143,87,2,3 | MI,IPL,291,163,5,1 | ISU,PSL,143,79,3,0 | SRH,IPL,215,119,1,2 | ABF,CPL,40,22,1,0 | SB,HUN,90,49,1,1 | MSG,HUN,90,48,1,2 | MS,PSL,119,63,1,3 | KKR,IPL,291,146,3,2 | RCB,IPL,291,148,2,3 | PC,SA XX,52,26,0,2 | GG,ILT,52,25,1,0 | HH,BBL,225,106,1,2 | LQ,PSL,143,63,3,1 | SFU,MLC,52,24,0,1 | BH,BBL,225,99,2,1 | BR,CPL,183,79,2,2 | QG,PSL,143,62,1,3 | RR,IPL,261,114,1,1 | MS,BBL,225,98,0,3 | BF,HUN,90,38,0,1 | JSK,SA XX,52,22,0,0 | PR,SA XX,52,22,0,0 | STLK,CPL,183,73,1,2 | AS,BBL,225,89,1,0 | SRL,HUN,90,35,0,0 | LSG,IPL,80,31,0,0 | KK,PSL,143,54,1,0 | DC,IPL,291,108,0,1 | TSK,MLC,52,19,0,0 | WF,HUN,90,27,0,0 | LAKR,MLC,52,18,1,0 | PBKS,IPL,291,100,0,2 | MR,BBL,225,76,1,0 | ST,BBL,225,73,1,1 | SO,MLC,52,17,0,1 | DSG,SA XX,52,17,0,1 | STNP,CPL,157,48,1,2 | MICT,SA XX,52,16,1,0 | LS,HUN,90,19,0,0 | ADKR,ILT,52,13,0,0 | SW,ILT,52,11,0,0 | RWP,PSL,15,1,0,0`;

async function main() {
  // Add Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@cricket.com' },
    update: {},
    create: {
      email: 'admin@cricket.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Add Default Scoring Config
  await prisma.scoringConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      titlePoints: 1.0,
      runnerUpPoints: 0.3,
      tieBreakOrder: '["tpct","ntw","apct","pc"]',
      minMatches: 0,
    },
  });

  // Add Teams
  const teamsRaw = seedData.split('|').map((s) => s.trim());
  for (const t of teamsRaw) {
    const [team, league, pcStr, pgStr, ntwStr, ntrStr] = t.split(',');
    const pc = parseInt(pcStr, 10);
    const pg = parseInt(pgStr, 10);
    const ntw = parseInt(ntwStr, 10);
    const ntr = parseInt(ntrStr, 10);

    await prisma.team.upsert({
      where: {
        team_league: {
          team,
          league,
        },
      },
      update: {
        pc,
        pg,
        ntw,
        ntr,
      },
      create: {
        team,
        league,
        pc,
        pg,
        ntw,
        ntr,
      },
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
