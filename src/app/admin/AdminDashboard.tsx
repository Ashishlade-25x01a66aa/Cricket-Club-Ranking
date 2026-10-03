'use client';

import { useState } from 'react';
import { Team, ScoringConfig } from '@prisma/client';
import { updateScoringConfig, updateTeam, deleteTeam, addTeam } from '../actions';
import { rankTeams } from '@/lib/ranking';
import { LogOut, Save, Plus, Trash2, Upload, FileDown, Copy } from 'lucide-react';
import { signOut } from 'next-auth/react';
import * as XLSX from 'xlsx';

export default function AdminDashboard({ 
  initialTeams, 
  initialConfig 
}: { 
  initialTeams: Team[], 
  initialConfig: ScoringConfig 
}) {
  const [teams, setTeams] = useState(initialTeams);
  const [config, setConfig] = useState(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Live ranking computation for preview
  const rankedTeams = rankTeams(teams, config);

  const handleConfigChange = (key: keyof ScoringConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      await updateScoringConfig(config);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Error saving settings.');
    }
    setIsSaving(false);
  };

  const handleTeamEdit = (index: number, key: keyof Team, value: any) => {
    const newTeams = [...teams];
    (newTeams[index] as any)[key] = value;
    setTeams(newTeams);
  };

  const saveTeam = async (index: number) => {
    setIsSaving(true);
    try {
      await updateTeam(teams[index].id, teams[index]);
      setMessage('Team updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Error updating team.');
    }
    setIsSaving(false);
  };

  const handleAddTeam = async () => {
    const newTeam = {
      team: 'New Team',
      league: 'New League',
      pc: 0,
      pg: 0,
      ntw: 0,
      ntr: 0,
    };
    try {
      await addTeam(newTeam);
      window.location.reload();
    } catch (e) {
      alert('Error adding team');
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(id);
        setTeams(teams.filter(t => t.id !== id));
      } catch (e) {
        alert('Error deleting team');
      }
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const formattedData = data.map((row: any) => ({
        team: row.TEAM || row.Team || row.team,
        league: row.LEAGUE || row.League || row.league,
        pc: parseInt(row.PC || row.pc || '0'),
        pg: parseInt(row.PG || row.pg || '0'),
        ntw: parseInt(row.NTW || row.ntw || '0'),
        ntr: parseInt(row.NTR || row.ntr || '0'),
      }));

      try {
        setIsSaving(true);
        const { bulkImportTeams } = await import('../actions');
        await bulkImportTeams(formattedData);
        setMessage('Import successful! Reloading...');
        window.location.reload();
      } catch (err) {
        alert('Error importing data');
        setIsSaving(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })} 
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </header>

        {message && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg flex items-center justify-between">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Scoring Settings</h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Title Points (NTW weight)</label>
                  <input 
                    type="number" step="0.1" 
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700" 
                    value={config.titlePoints} 
                    onChange={e => handleConfigChange('titlePoints', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Runner-up Points (NTR weight)</label>
                  <input 
                    type="number" step="0.1" 
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700" 
                    value={config.runnerUpPoints} 
                    onChange={e => handleConfigChange('runnerUpPoints', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Minimum Matches</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700" 
                    value={config.minMatches} 
                    onChange={e => handleConfigChange('minMatches', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Tie Break Order (JSON Array)</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 font-mono text-xs" 
                    value={config.tieBreakOrder} 
                    onChange={e => handleConfigChange('tieBreakOrder', e.target.value)}
                  />
                </div>
                <button 
                  onClick={saveConfig}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save Config'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4">Bulk Actions</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-lg font-medium cursor-pointer transition-colors">
                  <Upload size={18} /> Import Excel/CSV
                  <input type="file" className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleImport} />
                </label>
                <p className="text-xs text-gray-500 text-center">Required columns: TEAM, LEAGUE, PC, PG, NTW, NTR</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Teams Data Grid</h2>
              <button 
                onClick={handleAddTeam}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Add Team
              </button>
            </div>
            
            <div className="overflow-x-auto flex-grow max-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 dark:bg-gray-900/80 sticky top-0 uppercase font-semibold text-gray-600 dark:text-gray-400 z-10 shadow-sm">
                  <tr>
                    <th className="px-3 py-2">Rank (Live)</th>
                    <th className="px-3 py-2">Team</th>
                    <th className="px-3 py-2">League</th>
                    <th className="px-3 py-2">PC</th>
                    <th className="px-3 py-2">PG</th>
                    <th className="px-3 py-2">NTW</th>
                    <th className="px-3 py-2">NTR</th>
                    <th className="px-3 py-2">TPCT (Live)</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {teams.map((team, index) => {
                    const rankedVersion = rankedTeams.find(t => t.id === team.id);
                    return (
                      <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 py-2 font-bold text-center">
                          {rankedVersion?.rank}
                        </td>
                        <td className="px-2 py-1">
                          <input 
                            type="text" 
                            className="w-full px-2 py-1 border rounded bg-transparent border-gray-300 dark:border-gray-600 focus:ring-1 focus:border-blue-500" 
                            value={team.team} 
                            onChange={e => handleTeamEdit(index, 'team', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input 
                            type="text" 
                            className="w-full px-2 py-1 border rounded bg-transparent border-gray-300 dark:border-gray-600 focus:ring-1 focus:border-blue-500" 
                            value={team.league} 
                            onChange={e => handleTeamEdit(index, 'league', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-1 w-16">
                          <input 
                            type="number" 
                            className="w-full px-1 py-1 border rounded bg-transparent border-gray-300 dark:border-gray-600" 
                            value={team.pc} 
                            onChange={e => handleTeamEdit(index, 'pc', parseInt(e.target.value))}
                          />
                        </td>
                        <td className="px-2 py-1 w-16">
                          <input 
                            type="number" 
                            className="w-full px-1 py-1 border rounded bg-transparent border-gray-300 dark:border-gray-600" 
                            value={team.pg} 
                            onChange={e => handleTeamEdit(index, 'pg', parseInt(e.target.value))}
                          />
                        </td>
                        <td className="px-2 py-1 w-16">
                          <input 
                            type="number" 
                            className="w-full px-1 py-1 border rounded bg-transparent border-gray-300 dark:border-gray-600" 
                            value={team.ntw} 
                            onChange={e => handleTeamEdit(index, 'ntw', parseInt(e.target.value))}
                          />
                        </td>
                        <td className="px-2 py-1 w-16">
                          <input 
                            type="number" 
                            className="w-full px-1 py-1 border rounded bg-transparent border-gray-300 dark:border-gray-600" 
                            value={team.ntr} 
                            onChange={e => handleTeamEdit(index, 'ntr', parseInt(e.target.value))}
                          />
                        </td>
                        <td className="px-3 py-2 font-mono text-blue-600 font-bold">
                          {rankedVersion?.tpct.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => saveTeam(index)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Save Team">
                              <Save size={16} />
                            </button>
                            <button onClick={() => handleDeleteTeam(team.id)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Delete Team">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
