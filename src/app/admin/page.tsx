import { PrismaClient } from '@prisma/client';
import AdminDashboard from './AdminDashboard';
import { auth } from '../../../auth';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export const revalidate = 0;

export default async function AdminPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/admin/login');
  }

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

  return <AdminDashboard initialTeams={teams} initialConfig={activeConfig} />;
}
