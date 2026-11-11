'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '../../auth';
import path from 'path';
import fs from 'fs';

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
      logo: data.logo !== undefined ? (data.logo ? data.logo.trim() : null) : undefined,
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
      logo: data.logo ? data.logo.trim() : null,
      pc: parseInt(data.pc, 10) || 0,
      pg: parseInt(data.pg, 10) || 0,
      ntw: parseInt(data.ntw, 10) || 0,
      ntr: parseInt(data.ntr, 10) || 0,
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function uploadTeamLogo(formData: FormData): Promise<string> {
  await checkAuth();
  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    throw new Error('No file provided');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image file must be under 5MB');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const safeExt = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext) ? ext : 'png';
  const filename = `logo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${safeExt}`;
  const filePath = path.join(uploadsDir, filename);

  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
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
        ...(team.logo !== undefined ? { logo: team.logo || null } : {}),
        pc: parseInt(team.pc) || 0,
        pg: parseInt(team.pg) || 0,
        ntw: parseInt(team.ntw) || 0,
        ntr: parseInt(team.ntr) || 0,
      },
      create: {
        team: team.team,
        league: team.league,
        logo: team.logo || null,
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
