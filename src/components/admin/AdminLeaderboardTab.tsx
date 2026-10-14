"use client";

import React, { useState, useEffect } from 'react';
import { LeaderboardPlayer, Department } from '@/types/leaderboard';
import { 
  Crown, 
  Trophy, 
  Zap, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  TrendingUp,
  X,
  Swords,
  Medal
} from 'lucide-react';

const DEPARTMENTS = ['All', 'CSE', 'IT', 'ECE', 'ME', 'CE', 'EE'];

export default function AdminLeaderboardTab() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<LeaderboardPlayer | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Chess.com Sync State
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: 'CSE',
    year: '1st Year',
    fideId: '',
    chessUsername: '',
    chessComUsername: '',
    title: 'Club Member',
    rapid: 1200,
    blitz: 1200,
    classical: 1200,
    peak: 1200,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    tournamentsWon: 0,
    chessPiece: 'Knight'
  });

  // Load players
  const loadPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard?sortBy=rapid');
      const data = await res.json();
      if (data.success && Array.isArray(data.players)) {
        setPlayers(data.players);
      }
    } catch (err) {
      console.error('Failed to load leaderboard players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  // Filter players
  const filteredPlayers = players.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(q) ||
      p.rollNumber.toLowerCase().includes(q) ||
      (p.chessUsername && p.chessUsername.toLowerCase().includes(q)) ||
      (p.chessComUsername && p.chessComUsername.toLowerCase().includes(q));

    const matchesDept = selectedDept === 'All' || p.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPlayer(null);
    setFormError('');
    setFormData({
      name: '',
      rollNumber: '',
      department: 'CSE',
      year: '1st Year',
      fideId: '',
      chessUsername: '',
      chessComUsername: '',
      title: 'Club Member',
      rapid: 1200,
      blitz: 1200,
      classical: 1200,
      peak: 1200,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      tournamentsWon: 0,
      chessPiece: 'Knight'
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (player: LeaderboardPlayer) => {
    setEditingPlayer(player);
    setFormError('');
    setFormData({
      name: player.name,
      rollNumber: player.rollNumber,
      department: player.department,
      year: player.year,
      fideId: player.fideId === 'Unrated' ? '' : (player.fideId || ''),
      chessUsername: player.chessUsername || '',
      chessComUsername: player.chessComUsername || player.chessUsername || '',
      title: player.title || 'Club Member',
      rapid: player.rating.rapid,
      blitz: player.rating.blitz,
      classical: player.rating.classical,
      peak: player.rating.peak,
      matchesPlayed: player.stats.matchesPlayed,
      wins: player.stats.wins,
      draws: player.stats.draws,
      losses: player.stats.losses,
      tournamentsWon: player.stats.tournamentsWon,
      chessPiece: player.chessPiece || 'Knight'
    });
    setIsModalOpen(true);
  };

  // Save Player (Create or Update)
  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rollNumber.trim()) {
      setFormError('Player name and roll number are mandatory.');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      name: formData.name.trim(),
      rollNumber: formData.rollNumber.trim(),
      department: formData.department,
      year: formData.year,
      fideId: formData.fideId.trim() || 'Unrated',
      chessUsername: formData.chessUsername.trim() || formData.chessComUsername.trim(),
      chessComUsername: formData.chessComUsername.trim() || formData.chessUsername.trim(),
      title: formData.title,
      rating: {
        rapid: Number(formData.rapid),
        blitz: Number(formData.blitz),
        classical: Number(formData.classical),
        peak: Math.max(Number(formData.peak), Number(formData.rapid), Number(formData.blitz))
      },
      stats: {
        matchesPlayed: Number(formData.matchesPlayed),
        wins: Number(formData.wins),
        draws: Number(formData.draws),
        losses: Number(formData.losses),
        winRate: Number(formData.matchesPlayed) > 0 
          ? Math.round(((Number(formData.wins) + 0.5 * Number(formData.draws)) / Number(formData.matchesPlayed)) * 1000) / 10
          : 0,
        tournamentsWon: Number(formData.tournamentsWon)
      },
      chessPiece: formData.chessPiece
    };

    try {
      if (editingPlayer) {
        const res = await fetch('/api/leaderboard', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPlayer.id, ...payload })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to update player');
      } else {
        const res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to create player');
      }

      setIsModalOpen(false);
      await loadPlayers();
      setSyncNotice({ type: 'success', text: `Player "${payload.name}" saved successfully!` });
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Error saving player');
    } finally {
      setSaving(false);
    }
  };

  // Delete Player
  const handleDeletePlayer = async (player: LeaderboardPlayer) => {
    if (!confirm(`Are you sure you want to remove "${player.name}" (${player.rollNumber}) from the official leaderboard?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/leaderboard?id=${encodeURIComponent(player.id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPlayers(prev => prev.filter(p => p.id !== player.id));
        setSyncNotice({ type: 'success', text: `Player ${player.name} removed from leaderboard.` });
        setTimeout(() => setSyncNotice(null), 3000);
      } else {
        alert(data.error || 'Failed to delete player.');
      }
    } catch (err) {
      console.error('Delete player failed:', err);
    }
  };

  // Sync Single Player with Chess.com
  const handleSyncPlayerChess = async (player: LeaderboardPlayer) => {
    const handle = player.chessComUsername || player.chessUsername;
    if (!handle || handle === 'N/A' || handle.trim() === '') {
      alert(`Player "${player.name}" does not have a Chess.com handle saved. Edit their profile to add a username.`);
      return;
    }

    setSyncingId(player.id);
    setSyncNotice(null);

    try {
      const res = await fetch('/api/leaderboard/sync-chess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id })
      });
      const data = await res.json();

      if (data.success && data.player) {
        setPlayers(prev => prev.map(p => p.id === player.id ? data.player : p));
        setSyncNotice({ 
          type: 'success', 
          text: `⚡ Successfully synced ${player.name}'s live rating from Chess.com! Rapid: ${data.player.rating.rapid}, Blitz: ${data.player.rating.blitz}` 
        });
      } else {
        setSyncNotice({ type: 'error', text: data.error || 'Failed to sync with Chess.com.' });
      }
    } catch (err: any) {
      setSyncNotice({ type: 'error', text: err.message || 'Error contacting Chess.com API.' });
    } finally {
      setSyncingId(null);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  // Sync ALL Eligible Players with Chess.com
  const handleSyncAllChess = async () => {
    setSyncingAll(true);
    setSyncNotice(null);

    try {
      const res = await fetch('/api/leaderboard/sync-chess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncAll: true })
      });
      const data = await res.json();

      if (data.success) {
        await loadPlayers();
        setSyncNotice({ 
          type: 'success', 
          text: `⚡ Batch Sync Complete: ${data.summary.synced} players updated from Chess.com live statistics!` 
        });
      } else {
        setSyncNotice({ type: 'error', text: data.error || 'Batch sync failed.' });
      }
    } catch (err: any) {
      setSyncNotice({ type: 'error', text: err.message || 'Error during batch sync.' });
    } finally {
      setSyncingAll(false);
      setTimeout(() => setSyncNotice(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action Hub */}
      <div className="p-6 rounded-3xl bg-[#10141C] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>COLLEGIATE ELO RATINGS & LEADERBOARD</span>
          </div>
          <h2 className="font-['Montserrat',sans-serif] text-xl sm:text-2xl font-black text-[#F5F5F5]">
            Player Database & Live Chess.com Sync
          </h2>
          <p className="text-xs text-[#A0A6B0] mt-1 max-w-2xl font-['Poppins',sans-serif]">
            Directly manage ranked club players, edit Elo ratings, and synchronize with live Chess.com statistics in one click without touching code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sync All Button */}
          <button
            type="button"
            onClick={handleSyncAllChess}
            disabled={syncingAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition cursor-pointer disabled:opacity-50 shadow-md shadow-cyan-500/10"
            title="Fetch latest Blitz & Rapid ratings from Chess.com for all players with handles"
          >
            <Zap className={`w-4 h-4 text-cyan-400 ${syncingAll ? 'animate-bounce' : ''}`} />
            <span>{syncingAll ? 'Syncing with Chess.com...' : 'Sync All with Chess.com'}</span>
          </button>

          {/* Add Player Button */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer shadow-md shadow-[#D4AF7C]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rated Player</span>
          </button>
        </div>
      </div>

      {/* Sync / Notification Alert */}
      {syncNotice && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fadeIn ${
          syncNotice.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {syncNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
            <span className="font-semibold">{syncNotice.text}</span>
          </div>
          <button onClick={() => setSyncNotice(null)} className="p-1 hover:opacity-70 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#10141C] border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#A0A6B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search players by name, roll, chess handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/50 focus:outline-none focus:border-[#D4AF7C]"
          />
        </div>

        {/* Department Filter */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedDept === dept
                  ? 'bg-[#D4AF7C]/20 border border-[#D4AF7C]/50 text-[#D4AF7C]'
                  : 'bg-[#080B0F] border border-white/10 text-[#A0A6B0] hover:text-[#F5F5F5]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Swipe Notice */}
      <div className="sm:hidden text-[10px] text-[#A0A6B0] flex items-center gap-1.5 px-4 py-1.5 bg-black/40 border border-white/5 rounded-xl">
        <span>← Swipe horizontally to view full Elo ratings and Chess.com status →</span>
      </div>

      {/* Leaderboard Players Table */}
      <div className="p-1 rounded-3xl bg-[#10141C] border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs text-[#F5F5F5]">
            <thead className="bg-[#080B0F]/70 text-[#A0A6B0] uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Rank &amp; Player</th>
                <th className="py-3 px-4">Roll &amp; Dept</th>
                <th className="py-3 px-4 text-center">Rapid Elo</th>
                <th className="py-3 px-4 text-center">Blitz Elo</th>
                <th className="py-3 px-4 text-center">Peak</th>
                <th className="py-3 px-4 text-center">Matches / Win Rate</th>
                <th className="py-3 px-4">Chess.com Handle</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#A0A6B0]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF7C]" />
                    <span>Loading club leaderboard...</span>
                  </td>
                </tr>
              ) : filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#A0A6B0]">
                    No players found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player, index) => {
                  const isSyncingThis = syncingId === player.id;
                  const hasChessHandle = Boolean(player.chessComUsername || player.chessUsername);

                  return (
                    <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Rank & Player Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            index === 0 ? 'bg-[#D4AF7C] text-[#0B0F14]' :
                            index === 1 ? 'bg-slate-300 text-[#0B0F14]' :
                            index === 2 ? 'bg-amber-600 text-white' :
                            'bg-white/5 text-[#A0A6B0]'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-bold text-sm text-[#F5F5F5] flex items-center gap-2">
                              <span>{player.name}</span>
                              {player.title && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#D4AF7C]/15 text-[#D4AF7C] border border-[#D4AF7C]/30">
                                  {player.title}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#A0A6B0]">
                              {player.year} • FIDE: {player.fideId || 'Unrated'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roll & Dept */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-[#F5F5F5]">{player.rollNumber}</div>
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          {player.department}
                        </span>
                      </td>

                      {/* Rapid Elo */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold font-mono text-sm text-[#D4AF7C]">
                          {player.rating.rapid}
                        </span>
                      </td>

                      {/* Blitz Elo */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs text-amber-300">
                          {player.rating.blitz}
                        </span>
                      </td>

                      {/* Peak Elo */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs text-emerald-400 font-bold">
                          {player.rating.peak}
                        </span>
                      </td>

                      {/* Matches / Win Rate */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-xs text-[#F5F5F5]">{player.stats.winRate}%</div>
                        <div className="text-[10px] text-[#A0A6B0]">{player.stats.matchesPlayed} games • {player.stats.tournamentsWon} 🏆</div>
                      </td>

                      {/* Chess.com Status */}
                      <td className="py-3.5 px-4">
                        {hasChessHandle ? (
                          <div className="space-y-1">
                            <a
                              href={`https://www.chess.com/member/${player.chessComUsername || player.chessUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
                            >
                              <span>{player.chessComUsername || player.chessUsername}</span>
                              <ExternalLink className="w-3 h-3 text-[#A0A6B0]" />
                            </a>
                            {player.chessComLastSyncedAt && (
                              <div className="text-[9px] text-[#A0A6B0]">
                                Synced {new Date(player.chessComLastSyncedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#A0A6B0]/50 italic">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sync Chess.com Button */}
                          {hasChessHandle && (
                            <button
                              type="button"
                              onClick={() => handleSyncPlayerChess(player)}
                              disabled={isSyncingThis}
                              className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                              title="Sync live ratings from Chess.com"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingThis ? 'animate-spin' : ''}`} />
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(player)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F5F5F5] border border-white/10 transition cursor-pointer"
                            title="Edit player ratings and info"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#D4AF7C]" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeletePlayer(player)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                            title="Delete player from leaderboard"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PLAYER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#10141C] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C]">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Montserrat',sans-serif] text-lg font-bold text-[#F5F5F5]">
                    {editingPlayer ? 'Edit Rated Player & Statistics' : 'Add New Rated Player'}
                  </h3>
                  <p className="text-xs text-[#A0A6B0]">
                    Configured ratings and handles are stored directly in Supabase PostgreSQL.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePlayer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aritra Sen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">College Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    placeholder="e.g. 22101104012"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Department / Branch</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  >
                    {['CSE', 'IT', 'ECE', 'ME', 'CE', 'EE'].map(d => (
                      <option key={d} value={d} className="bg-[#10141C]">{d}</option>
                    ))}
                  </select>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Academic Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  >
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'].map(y => (
                      <option key={y} value={y} className="bg-[#10141C]">{y}</option>
                    ))}
                  </select>
                </div>

                {/* Chess.com Username */}
                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">
                    Chess.com Handle (For Live Sync)
                  </label>
                  <input
                    type="text"
                    value={formData.chessComUsername}
                    onChange={(e) => setFormData({ ...formData, chessComUsername: e.target.value })}
                    placeholder="e.g. aritra_gambit"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                {/* FIDE ID */}
                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Official FIDE ID</label>
                  <input
                    type="text"
                    value={formData.fideId}
                    onChange={(e) => setFormData({ ...formData, fideId: e.target.value })}
                    placeholder="e.g. 50291844 or Unrated"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                {/* Club Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Honorary Club Title</label>
                  <select
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  >
                    {['Club Champion', 'Candidate Master', 'Collegiate Master', 'Arbiter', 'Club Expert', 'Club Member'].map(t => (
                      <option key={t} value={t} className="bg-[#10141C]">{t}</option>
                    ))}
                  </select>
                </div>

                {/* Chess Piece Icon */}
                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Chess Piece Badge</label>
                  <select
                    value={formData.chessPiece}
                    onChange={(e) => setFormData({ ...formData, chessPiece: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  >
                    {['King', 'Queen', 'Rook', 'Bishop', 'Knight'].map(p => (
                      <option key={p} value={p} className="bg-[#10141C]">{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RATINGS SECTION */}
              <div className="p-4 rounded-2xl bg-[#080B0F] border border-white/10 space-y-3">
                <div className="text-xs font-bold text-[#D4AF7C] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Calibrated Ratings</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#A0A6B0] mb-1">Rapid Elo</label>
                    <input
                      type="number"
                      value={formData.rapid}
                      onChange={(e) => setFormData({ ...formData, rapid: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#10141C] border border-white/10 text-xs text-[#F5F5F5] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A0A6B0] mb-1">Blitz Elo</label>
                    <input
                      type="number"
                      value={formData.blitz}
                      onChange={(e) => setFormData({ ...formData, blitz: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#10141C] border border-white/10 text-xs text-[#F5F5F5] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A0A6B0] mb-1">Classical Elo</label>
                    <input
                      type="number"
                      value={formData.classical}
                      onChange={(e) => setFormData({ ...formData, classical: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#10141C] border border-white/10 text-xs text-[#F5F5F5] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A0A6B0] mb-1">Peak Rating</label>
                    <input
                      type="number"
                      value={formData.peak}
                      onChange={(e) => setFormData({ ...formData, peak: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#10141C] border border-white/10 text-xs text-[#F5F5F5] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* STATS SECTION */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-[#A0A6B0] mb-1">Matches</label>
                  <input
                    type="number"
                    value={formData.matchesPlayed}
                    onChange={(e) => setFormData({ ...formData, matchesPlayed: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A0A6B0] mb-1">Wins</label>
                  <input
                    type="number"
                    value={formData.wins}
                    onChange={(e) => setFormData({ ...formData, wins: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A0A6B0] mb-1">Draws</label>
                  <input
                    type="number"
                    value={formData.draws}
                    onChange={(e) => setFormData({ ...formData, draws: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A0A6B0] mb-1">Losses</label>
                  <input
                    type="number"
                    value={formData.losses}
                    onChange={(e) => setFormData({ ...formData, losses: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#A0A6B0] mb-1">Titles Won</label>
                  <input
                    type="number"
                    value={formData.tournamentsWon}
                    onChange={(e) => setFormData({ ...formData, tournamentsWon: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] font-mono"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A0A6B0] hover:text-white bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer shadow-md shadow-[#D4AF7C]/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingPlayer ? 'Update Player' : 'Create Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
