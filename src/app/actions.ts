'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '../../auth';

const prisma = new PrismaClient();

async function checkAuth() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
}

export async function updateScoringConfig(data: any) {
  await checkAuth();
  await prisma.scoringConfig.update({
    where: { id: 'default' },
    data: {
      titlePoints: parseFloat(data.titlePoints),
      runnerUpPoints: parseFloat(data.runnerUpPoints),
      tieBreakOrder: JSON.stringify(data.tieBreakOrder),
      minMatches: parseInt(data.minMatches, 10),
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function updateTeam(id: string, data: any) {
  await checkAuth();
  await prisma.team.update({
    where: { id },
    data: {
      team: data.team,
      league: data.league,
      pc: parseInt(data.pc, 10),
      pg: parseInt(data.pg, 10),
      ntw: parseInt(data.ntw, 10),
      ntr: parseInt(data.ntr, 10),
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function deleteTeam(id: string) {
  await checkAuth();
  await prisma.team.delete({
    where: { id },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function addTeam(data: any) {
  await checkAuth();
  await prisma.team.create({
    data: {
      team: data.team,
      league: data.league,
      pc: parseInt(data.pc, 10) || 0,
      pg: parseInt(data.pg, 10) || 0,
      ntw: parseInt(data.ntw, 10) || 0,
      ntr: parseInt(data.ntr, 10) || 0,
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function bulkImportTeams(teams: any[]) {
  await checkAuth();
  
  for (const team of teams) {
    if (!team.team || !team.league) continue;
    
    await prisma.team.upsert({
      where: {
        team_league: {
          team: team.team,
          league: team.league,
        }
      },
      update: {
        pc: parseInt(team.pc) || 0,
        pg: parseInt(team.pg) || 0,
        ntw: parseInt(team.ntw) || 0,
        ntr: parseInt(team.ntr) || 0,
      },
      create: {
        team: team.team,
        league: team.league,
        pc: parseInt(team.pc) || 0,
        pg: parseInt(team.pg) || 0,
        ntw: parseInt(team.ntw) || 0,
        ntr: parseInt(team.ntr) || 0,
      },
    });
  }

  revalidatePath('/');
  revalidatePath('/admin');
}
