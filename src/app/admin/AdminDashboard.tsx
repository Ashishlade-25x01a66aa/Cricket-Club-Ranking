'use client';

import { useState, useRef } from 'react';
import { Team, ScoringConfig } from '@prisma/client';
import { updateScoringConfig, updateTeam, deleteTeam, addTeam, uploadTeamLogo } from '../actions';
import { rankTeams } from '@/lib/ranking';
import { LogOut, Save, Plus, Trash2, Upload, FileDown, Copy, Image as ImageIcon, Camera, X, Check, Link as LinkIcon, RefreshCw } from 'lucide-react';
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

  // Logo editing modal state
  const [selectedTeamForLogo, setSelectedTeamForLogo] = useState<Team | null>(null);
  const [logoInput, setLogoInput] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      logo: null,
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

  const openLogoModal = (team: Team) => {
    setSelectedTeamForLogo(team);
    setLogoInput(team.logo || '');
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = await uploadTeamLogo(formData);
      setLogoInput(url);
    } catch (err) {
      // Fallback to data URL
      const reader = new FileReader();
      reader.onload = () => {
        setLogoInput(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveLogo = async () => {
    if (!selectedTeamForLogo) return;
    setIsSaving(true);
    try {
      const updatedLogo = logoInput.trim() || null;
      await updateTeam(selectedTeamForLogo.id, {
        ...selectedTeamForLogo,
        logo: updatedLogo,
      });

      setTeams(prev => prev.map(t => t.id === selectedTeamForLogo.id ? { ...t, logo: updatedLogo } : t));
      setMessage(`Logo updated for ${selectedTeamForLogo.team}!`);
      setTimeout(() => setMessage(''), 3000);
      setSelectedTeamForLogo(null);
    } catch (err) {
      alert('Failed to save team logo');
    } finally {
      setIsSaving(false);
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
        logo: row.LOGO || row.Logo || row.logo || undefined,
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
                <p className="text-xs text-gray-500 text-center">Required: TEAM, LEAGUE, PC, PG, NTW, NTR (Optional: LOGO)</p>
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
                    <th className="px-3 py-2">Logo</th>
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
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openLogoModal(team)}
                              className="relative group w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                              title="Click to manage team logo"
                            >
                              {team.logo ? (
                                <img 
                                  src={team.logo} 
                                  alt={team.team} 
                                  className="w-full h-full object-contain p-0.5" 
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                    (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <span className={`text-[11px] font-bold text-gray-600 dark:text-gray-300 ${team.logo ? 'hidden' : ''}`}>
                                {team.team.slice(0, 2).toUpperCase()}
                              </span>
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Camera size={13} />
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => openLogoModal(team)}
                              className="text-[11px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                            >
                              {team.logo ? 'Edit' : '+ Logo'}
                            </button>
                          </div>
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

      {/* Team Logo Modal */}
      {selectedTeamForLogo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Team Logo: {selectedTeamForLogo.team}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  League: {selectedTeamForLogo.league}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTeamForLogo(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Preview Box */}
              <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <div className="relative w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-inner mb-2">
                  {logoInput ? (
                    <img 
                      src={logoInput} 
                      alt="Logo preview" 
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`flex flex-col items-center justify-center text-gray-400 ${logoInput ? 'hidden' : ''}`}>
                    <ImageIcon size={32} />
                    <span className="text-[10px] mt-1 font-semibold">No Logo</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">Logo Preview</span>
              </div>

              {/* Upload from Computer */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Option 1: Upload Image File
                </label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                />
                <button
                  type="button"
                  disabled={isUploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  {isUploadingLogo ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Uploading image...
                    </>
                  ) : (
                    <>
                      <Upload size={16} /> Choose File from Computer (PNG, JPG, SVG)
                    </>
                  )}
                </button>
              </div>

              {/* Or URL input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Option 2: Image URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <LinkIcon size={16} />
                  </div>
                  <input 
                    type="url" 
                    placeholder="https://example.com/logo.png or /uploads/..."
                    value={logoInput}
                    onChange={(e) => setLogoInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Clear button if logo exists */}
              {logoInput && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setLogoInput('')}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Remove / Clear Logo
                  </button>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setSelectedTeamForLogo(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={isSaving || isUploadingLogo}
                onClick={handleSaveLogo}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                <Check size={16} /> {isSaving ? 'Saving...' : 'Save Logo'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
