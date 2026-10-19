"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Tournament, Participant } from '@/types/tournament';
import { 
  Swords, 
  RefreshCw, 
  Flame, 
  X, 
  Search, 
  UserPlus, 
  Download, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Eye, 
  Check, 
  Trash2 
} from 'lucide-react';

export interface AdminParticipantsTabProps {
  tournaments: Tournament[];
  participants: Participant[];
  loadingParticipants?: boolean;
  onRefresh: () => void;
  onCheckIn: (ticketId: string, currentStatus: string) => Promise<void>;
  onDeletePlayer: (ticketId: string, name: string) => Promise<void>;
  onAddWalkIn: (playerData: any) => Promise<boolean>;
  selectedTournamentId?: string;
  onSelectTournamentId?: (id: string) => void;
}

export default function AdminParticipantsTab({
  tournaments,
  participants,
  loadingParticipants = false,
  onRefresh,
  onCheckIn,
  onDeletePlayer,
  onAddWalkIn,
  selectedTournamentId,
  onSelectTournamentId
}: AdminParticipantsTabProps) {
  const [internalSelectedTournament, setInternalSelectedTournament] = useState<string>('all');
  const selectedTournament = selectedTournamentId !== undefined ? selectedTournamentId : internalSelectedTournament;
  const setSelectedTournament = (id: string) => {
    if (onSelectTournamentId) {
      onSelectTournamentId(id);
    } else {
      setInternalSelectedTournament(id);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'confirmed'>('all');
  const [togglingTicketId, setTogglingTicketId] = useState<string | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);

  // Inspector Modal State
  const [inspectingPlayer, setInspectingPlayer] = useState<Participant | null>(null);

  // Walk-in Registration Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingWalkIn, setSavingWalkIn] = useState(false);
  const [walkInError, setWalkInError] = useState('');
  const [walkInImmediateCheckIn, setWalkInImmediateCheckIn] = useState(true);
  const [walkInCustomAnswers, setWalkInCustomAnswers] = useState<Record<string, string>>({});
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    rollNumber: '',
    college: 'Jalpaiguri Government Engineering College',
    department: 'Computer Science & Engineering',
    year: '2nd Year',
    email: '',
    phone: '',
    ratingCategory: 'Club Player (1200 - 1600)',
    chessUsername: '',
    fideId: '',
    tournamentId: tournaments[0]?.id || 'inter-college-2026'
  });

  // Filter participants
  const filteredParticipants = participants.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      p.name.toLowerCase().includes(q) ||
      p.rollNumber.toLowerCase().includes(q) ||
      p.ticketId.toLowerCase().includes(q) ||
      p.chessUsername.toLowerCase().includes(q) ||
      p.college.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    );

    const matchesTournament = 
      selectedTournament === 'all' || 
      p.tournamentId === selectedTournament ||
      p.tournament.toLowerCase() === selectedTournament.toLowerCase() ||
      (tournaments.find(t => t.id === selectedTournament)?.title.toLowerCase() === p.tournament.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'checked_in' && p.checkInStatus === 'checked_in') ||
      (statusFilter === 'confirmed' && p.checkInStatus !== 'checked_in');

    return matchesSearch && matchesTournament && matchesStatus;
  });

  // Export CSV (Swiss-Manager / FIDE pairing compatible)
  const handleExportCSV = () => {
    const isFiltered = selectedTournament !== 'all';
    const targetTournament = tournaments.find(t => t.id === selectedTournament || t.title === selectedTournament);
    const tournamentName = targetTournament ? targetTournament.title : 'All_Tournaments';
    const cleanFileName = tournamentName.replace(/[^a-zA-Z0-9_-]/g, '_');

    const headers = [
      'Ticket ID',
      'Full Name',
      'Roll Number',
      'Institution',
      'Department',
      'Academic Year',
      'Email',
      'Phone',
      'Rating Category',
      'Chess Username',
      'FIDE ID',
      'Tournament',
      'Check-in Status',
      'Registered Date',
      'Custom Answers'
    ];

    const dataRows = (isFiltered ? filteredParticipants : participants).map(p => {
      const customStr = p.customAnswers 
        ? Object.entries(p.customAnswers).map(([k, v]) => `${k}: ${v}`).join('; ')
        : '';
      return [
        p.ticketId,
        p.name,
        p.rollNumber,
        p.college,
        p.department,
        p.year || 'N/A',
        p.email || 'N/A',
        p.phone || 'N/A',
        p.ratingCategory,
        p.chessUsername && p.chessUsername !== 'N/A'
          ? `${p.chessUsername}${p.chessPlatform && !p.chessUsername.includes('(') ? ` (${p.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'})` : ''}`
          : 'N/A',
        p.fideId || 'Unrated',
        p.tournament,
        p.checkInStatus === 'checked_in' ? 'CHECKED_IN (PRESENT)' : 'CONFIRMED (AWAITING DESK)',
        p.registeredAt,
        customStr
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...dataRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chaturanga_${cleanFileName}_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCheckInToggle = async (ticketId: string, currentStatus: string) => {
    setTogglingTicketId(ticketId);
    try {
      await onCheckIn(ticketId, currentStatus);
    } finally {
      setTogglingTicketId(null);
    }
  };

  const handleDelete = async (ticketId: string, name: string) => {
    setDeletingTicketId(ticketId);
    try {
      await onDeletePlayer(ticketId, name);
    } finally {
      setDeletingTicketId(null);
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWalkIn(true);
    setWalkInError('');

    try {
      const targetTourn = tournaments.find(t => t.id === newPlayer.tournamentId) || tournaments[0];
      const payload = {
        ...newPlayer,
        tournament: targetTourn?.title || 'JGEC Chess Championship',
        customAnswers: walkInCustomAnswers,
        checkInStatus: walkInImmediateCheckIn ? 'checked_in' : 'confirmed'
      };

      const success = await onAddWalkIn(payload);
      if (success) {
        setIsAddModalOpen(false);
        setWalkInCustomAnswers({});
        setNewPlayer({
          name: '',
          rollNumber: '',
          college: 'Jalpaiguri Government Engineering College',
          department: 'Computer Science & Engineering',
          year: '2nd Year',
          email: '',
          phone: '',
          ratingCategory: 'Club Player (1200 - 1600)',
          chessUsername: '',
          fideId: '',
          tournamentId: tournaments[0]?.id || 'inter-college-2026'
        });
      }
    } catch (err: any) {
      setWalkInError(err.message || 'Error creating walk-in player');
    } finally {
      setSavingWalkIn(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Multi-Tournament Live Operations Grid (Top Overview Cards) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-['Montserrat',sans-serif] text-base sm:text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#D4AF7C]" />
              <span>Concurrent Tournaments • Live Registration Operations</span>
            </h2>
            <p className="text-xs text-[#A0A6B0]">
              Monitor capacity and arbiter desk check-ins across all simultaneously active tournament forms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loadingParticipants}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-[#A0A6B0] hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF7C] ${loadingParticipants ? 'animate-spin' : ''}`} />
              <span>Refresh Live Roster</span>
            </button>
          </div>
        </div>

        {/* Tournament Capacity & Operations Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {tournaments.filter(t => !t.isPast && t.status !== 'completed').map((tourn) => {
            const matchingPlayers = participants.filter(p => 
              p.tournamentId === tourn.id || 
              p.tournament.toLowerCase() === tourn.title.toLowerCase() ||
              tourn.title.toLowerCase().includes(p.tournament.toLowerCase())
            );
            const enrolledCount = Math.max(matchingPlayers.length, tourn.registeredCount || 0);
            const checkedInCount = matchingPlayers.filter(p => p.checkInStatus === 'checked_in').length;
            const maxSlots = tourn.maxSlots || 64;
            const capacityPercent = Math.min(100, Math.round((enrolledCount / maxSlots) * 100));
            const isSelected = selectedTournament === tourn.id || selectedTournament === tourn.title;

            const isOpen = tourn.status === 'open';
            const isClosingSoon = tourn.status === 'closing_soon';
            const isClosed = tourn.status === 'closed';

            return (
              <div
                key={tourn.id}
                onClick={() => setSelectedTournament(isSelected ? 'all' : tourn.id)}
                className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#141A24] via-[#10141C] to-[#0A0D12] border-[#D4AF7C] shadow-lg shadow-[#D4AF7C]/15 ring-1 ring-[#D4AF7C]'
                    : 'bg-[#10141C] border-white/10 hover:border-white/20 hover:bg-[#141924]'
                }`}
              >
                <div className="space-y-2">
                  {/* Status Chip & Format */}
                  <div className="flex items-center justify-between gap-2">
                    {isOpen ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>OPEN</span>
                      </span>
                    ) : isClosingSoon ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>CLOSING SOON</span>
                      </span>
                    ) : isClosed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30">
                        <X className="w-3 h-3 text-red-400" />
                        <span>CLOSED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 uppercase">
                        {tourn.status}
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-[#D4AF7C] font-semibold truncate max-w-[120px]">
                      {tourn.entryFee || 'Free'}
                    </span>
                  </div>

                  {/* Tournament Title */}
                  <div>
                    <h4 className="font-['Montserrat',sans-serif] font-bold text-xs sm:text-sm text-[#F5F5F5] line-clamp-1 leading-snug">
                      {tourn.title}
                    </h4>
                    <p className="text-[10px] text-[#A0A6B0] truncate mt-0.5">
                      {tourn.date} • {tourn.venue}
                    </p>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#A0A6B0]">
                        Capacity: <strong className="text-white font-mono">{enrolledCount}</strong>/{maxSlots}
                      </span>
                      <span className="font-mono font-bold text-[#D4AF7C]">
                        {capacityPercent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          capacityPercent >= 90
                            ? 'bg-gradient-to-r from-red-500 to-amber-500'
                            : capacityPercent >= 70
                            ? 'bg-gradient-to-r from-amber-500 to-[#D4AF7C]'
                            : 'bg-gradient-to-r from-emerald-500 to-[#D4AF7C]'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-[#A0A6B0]">
                      {Math.max(0, maxSlots - enrolledCount)} spots remaining
                    </p>
                  </div>
                </div>

                {/* Desk Check-in Breakdown & Focus Toggle */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      ✓ {checkedInCount} In
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-medium border border-amber-500/20">
                      ⏳ {Math.max(0, enrolledCount - checkedInCount)} Pending
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold ${isSelected ? 'text-[#D4AF7C]' : 'text-[#A0A6B0] hover:text-white'}`}>
                    {isSelected ? '★ Focused' : 'Focus →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter, Search & Arbiter Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#10141C] border border-white/10 space-y-4">
        
        {/* Row 1: Search & Action Buttons */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-[#A0A6B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search player name, roll no, ticket ID, chess handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/50 focus:outline-none focus:border-[#D4AF7C]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A0A6B0] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Arbiter Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            
            {/* Manual Walk-in Player */}
            <button
              onClick={() => {
                setWalkInError('');
                setWalkInCustomAnswers({});
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition shadow-md shadow-[#D4AF7C]/20 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Walk-in Registration</span>
            </button>

            {/* Export CSV for Swiss-Manager / FIDE */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#F5F5F5] bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 transition cursor-pointer"
              title="Export formatted CSV compatible with Swiss-Manager and Excel"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF7C]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Tournament Filter Tabs & Check-in Status Pills */}
        <div className="pt-2 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Tournament Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-[#A0A6B0] mr-1">Event:</span>
            
            <button
              type="button"
              onClick={() => setSelectedTournament('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                selectedTournament === 'all'
                  ? 'bg-[#D4AF7C] text-[#0B0F14] shadow'
                  : 'bg-[#080B0F] text-[#A0A6B0] hover:text-white border border-white/10'
              }`}
            >
              All Events ({participants.length})
            </button>

            {tournaments.filter(t => !t.isPast && t.status !== 'completed').map(t => {
              const count = participants.filter(p => 
                p.tournamentId === t.id || 
                p.tournament.toLowerCase() === t.title.toLowerCase() ||
                t.title.toLowerCase().includes(p.tournament.toLowerCase())
              ).length;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTournament(t.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs truncate max-w-[200px] ${
                    selectedTournament === t.id || selectedTournament === t.title
                      ? 'bg-[#D4AF7C] text-[#0B0F14] font-bold shadow'
                      : 'bg-[#080B0F] text-[#A0A6B0] hover:text-white border border-white/10'
                  }`}
                  title={t.title}
                >
                  {t.title.split(' ')[0]} {t.title.split(' ')[1] || ''} ({count})
                </button>
              );
            })}
          </div>

          {/* Check-in Status Filter Pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-[#A0A6B0] mr-1">Status:</span>

            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white/15 text-white'
                  : 'text-[#A0A6B0] hover:text-white'
              }`}
            >
              All ({filteredParticipants.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('checked_in')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'checked_in'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-[#A0A6B0] hover:text-emerald-400'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Checked In ({participants.filter(p => p.checkInStatus === 'checked_in').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('confirmed')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'confirmed'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-[#A0A6B0] hover:text-amber-400'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Awaiting Desk ({participants.filter(p => p.checkInStatus !== 'checked_in').length})</span>
            </button>
          </div>

        </div>

      </div>

      {/* Players Table */}
      <div className="rounded-2xl bg-[#10141C] border border-white/10 overflow-hidden shadow-xl">
        {/* Mobile Horizontal Scroll Hint */}
        <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 text-[11px] text-[#A0A6B0]">
          <span className="text-[#D4AF7C] font-medium">← Swipe to view arbiter actions & details →</span>
          <span className="font-mono text-[10px] text-white/50">{filteredParticipants.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-xs">
            <thead className="bg-[#090D12] text-[#A0A6B0] font-semibold border-b border-white/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Participant Details</th>
                <th className="py-3.5 px-4">Institution & Dept</th>
                <th className="py-3.5 px-4">Rating & Handle</th>
                <th className="py-3.5 px-4">Tournament Event</th>
                <th className="py-3.5 px-4 text-center">Custom Q&A</th>
                <th className="py-3.5 px-4 text-center">Desk Status</th>
                <th className="py-3.5 px-4 text-right">Arbiter Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-['Inter',sans-serif]">
              {loadingParticipants ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-[#A0A6B0]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 text-[#D4AF7C] animate-spin" />
                      <span className="text-xs">Synchronizing player registrations from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-[#A0A6B0]">
                    <p className="text-sm font-semibold text-[#F5F5F5]">No participants matching your filter criteria.</p>
                    <p className="text-xs text-[#A0A6B0] mt-1">Try clearing your search query or selecting &quot;All Events&quot;.</p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((player) => {
                  const hasCustomAnswers = player.customAnswers && Object.keys(player.customAnswers).length > 0;
                  const isCheckingThis = togglingTicketId === player.ticketId;
                  const isDeletingThis = deletingTicketId === player.ticketId;

                  return (
                    <tr key={player.id} className="hover:bg-white/[0.02] transition">
                      {/* Ticket ID */}
                      <td className="py-4 px-4 font-mono font-semibold text-[#D4AF7C] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{player.ticketId}</span>
                          <Link
                            href={`/my-ticket?ticketId=${encodeURIComponent(player.ticketId)}`}
                            target="_blank"
                            className="text-[#A0A6B0] hover:text-[#D4AF7C] transition"
                            title="Open Public Pass"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>

                      {/* Participant Name & Contact */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#F5F5F5]">{player.name}</div>
                        <div className="text-[11px] text-[#A0A6B0] font-mono">Roll: {player.rollNumber}</div>
                        {player.phone && (
                          <div className="text-[10px] text-[#A0A6B0]/80">Ph: {player.phone}</div>
                        )}
                      </td>

                      {/* Institution & Dept */}
                      <td className="py-4 px-4">
                        <div className="text-[#F5F5F5] font-medium">{player.department} ({player.year || 'UG'})</div>
                        <div className="text-[11px] text-[#A0A6B0] truncate max-w-[170px]" title={player.college}>
                          {player.college}
                        </div>
                      </td>

                      {/* Rating Category & Chess Handles */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.05] border border-white/10 text-[#F5F5F5]">
                            {player.ratingCategory}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#D4AF7C] font-mono mt-1">
                          {player.chessUsername && player.chessUsername !== 'N/A' ? (
                            <>
                              <span>@{player.chessUsername}</span>
                              {player.chessPlatform && !player.chessUsername.includes('(') && (
                                <span className="text-[#A0A6B0] text-[10px] ml-1">
                                  ({player.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'})
                                </span>
                              )}
                            </>
                          ) : ''}
                          {player.fideId && player.fideId !== 'Unrated' && (
                            <span className="text-[10px] text-[#A0A6B0] block">FIDE: {player.fideId}</span>
                          )}
                        </div>
                      </td>

                      {/* Tournament Event */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-medium bg-[#D4AF7C]/10 border border-[#D4AF7C]/20 text-[#D4AF7C] inline-block max-w-[160px] truncate" title={player.tournament}>
                          {player.tournament}
                        </span>
                      </td>

                      {/* Custom Q&A */}
                      <td className="py-4 px-4 text-center">
                        {hasCustomAnswers ? (
                          <button
                            type="button"
                            onClick={() => setInspectingPlayer(player)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition cursor-pointer"
                            title="View answers to custom tournament questions"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{Object.keys(player.customAnswers || {}).length} Answers</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#A0A6B0]/50">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {player.checkInStatus === 'checked_in' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Checked In</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Awaiting Desk</span>
                          </span>
                        )}
                      </td>

                      {/* Arbiter Action Button */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isCheckingThis}
                            onClick={() => handleCheckInToggle(player.ticketId, player.checkInStatus)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                              player.checkInStatus === 'checked_in'
                                ? 'text-[#A0A6B0] hover:text-red-300 bg-white/[0.04] hover:bg-red-500/10 border border-white/10 hover:border-red-500/30'
                                : 'text-[#0B0F14] bg-emerald-400 hover:bg-emerald-300 font-bold shadow-md shadow-emerald-500/20'
                            }`}
                          >
                            {isCheckingThis ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : player.checkInStatus === 'checked_in' ? (
                              'Revoke Desk'
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Check In Desk</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isDeletingThis}
                            onClick={() => handleDelete(player.ticketId, player.name)}
                            className="p-1.5 rounded-lg text-[#A0A6B0] hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            title="Delete Registration"
                          >
                            {isDeletingThis ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
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

      {/* MODAL: MANUAL ARBITER WALK-IN REGISTRATION */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#12161D] rounded-3xl border border-white/15 p-6 sm:p-8 space-y-5 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#D4AF7C]" />
                  <span>Manual Arbiter Walk-in Registration</span>
                </h3>
                <p className="text-xs text-[#A0A6B0] mt-0.5">
                  Register a walk-in player directly at the tournament reception desk.
                </p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs font-['Inter',sans-serif]">
              
              {walkInError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300">
                  {walkInError}
                </div>
              )}

              {/* Tournament Selector */}
              <div className="space-y-1">
                <label className="text-[#D4AF7C] font-bold uppercase tracking-wider text-[10px]">
                  Target Tournament Event *
                </label>
                <select
                  value={newPlayer.tournamentId}
                  onChange={(e) => setNewPlayer({ ...newPlayer, tournamentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs cursor-pointer"
                >
                  {tournaments.filter(t => !t.isPast && t.status !== 'completed').map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.status === 'open' ? 'Open' : t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name & Roll */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Roll Number / Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23101104018"
                    value={newPlayer.rollNumber}
                    onChange={(e) => setNewPlayer({ ...newPlayer, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>
              </div>

              {/* Institution & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Institution / College</label>
                  <input
                    type="text"
                    value={newPlayer.college}
                    onChange={(e) => setNewPlayer({ ...newPlayer, college: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Department & Year</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="CSE"
                      value={newPlayer.department}
                      onChange={(e) => setNewPlayer({ ...newPlayer, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                    />
                    <select
                      value={newPlayer.year}
                      onChange={(e) => setNewPlayer({ ...newPlayer, year: e.target.value })}
                      className="w-full px-2 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="player@jgec.ac.in"
                    value={newPlayer.email}
                    onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">WhatsApp / Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={newPlayer.phone}
                    onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>
              </div>

              {/* Chess Ratings & Handles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Rating Band</label>
                  <select
                    value={newPlayer.ratingCategory}
                    onChange={(e) => setNewPlayer({ ...newPlayer, ratingCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  >
                    <option>Beginner / Casual (&lt; 1200)</option>
                    <option>Club Player (1200 - 1600)</option>
                    <option>Intermediate / Rated (1600 - 1900)</option>
                    <option>Advanced / FIDE Master (&gt; 1900)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Chess Handle</label>
                  <input
                    type="text"
                    placeholder="Lichess/Chess.com"
                    value={newPlayer.chessUsername}
                    onChange={(e) => setNewPlayer({ ...newPlayer, chessUsername: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">FIDE ID</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={newPlayer.fideId}
                    onChange={(e) => setNewPlayer({ ...newPlayer, fideId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>
              </div>

              {/* Custom Tournament Questions (Dynamically Loaded) */}
              {(() => {
                const curTourn = tournaments.find(t => t.id === newPlayer.tournamentId);
                if (!curTourn || !curTourn.customFields || curTourn.customFields.length === 0) return null;
                return (
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-[#D4AF7C]/30 space-y-3">
                    <div className="font-bold text-[11px] uppercase tracking-wider text-[#D4AF7C]">
                      Tournament Specific Form Responses
                    </div>
                    {curTourn.customFields.map(cf => (
                      <div key={cf.id} className="space-y-1">
                        <label className="text-[#F5F5F5] font-medium text-[11px] block">
                          {cf.label} {cf.required && <span className="text-red-400">*</span>}
                        </label>
                        {cf.type === 'select' && cf.options ? (
                          <select
                            value={walkInCustomAnswers[cf.id] || ''}
                            onChange={(e) => setWalkInCustomAnswers({ ...walkInCustomAnswers, [cf.id]: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                          >
                            <option value="">-- Choose Option --</option>
                            {cf.options.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={walkInCustomAnswers[cf.id] || ''}
                            onChange={(e) => setWalkInCustomAnswers({ ...walkInCustomAnswers, [cf.id]: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Immediate Check-In Toggle */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-emerald-400 block">Immediate Desk Check-In</span>
                  <span className="text-[10px] text-[#A0A6B0]">Mark player as present and verified for pairing immediately</span>
                </div>
                <input
                  type="checkbox"
                  checked={walkInImmediateCheckIn}
                  onChange={(e) => setWalkInImmediateCheckIn(e.target.checked)}
                  className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full text-[#A0A6B0] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingWalkIn}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer shadow-lg shadow-[#D4AF7C]/20 disabled:opacity-50"
                >
                  {savingWalkIn ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Walk-in...</span>
                    </>
                  ) : (
                    <span>Register Walk-in Player</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM Q&A INSPECTOR */}
      {inspectingPlayer && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setInspectingPlayer(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#12161D] rounded-3xl border border-white/15 p-6 sm:p-8 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Custom Registration Answers</span>
                </h3>
                <p className="text-xs text-[#A0A6B0] mt-0.5">
                  {inspectingPlayer.name} ({inspectingPlayer.rollNumber}) • {inspectingPlayer.ticketId}
                </p>
              </div>
              <button 
                onClick={() => setInspectingPlayer(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                <span className="text-[#A0A6B0] block text-[10px] uppercase font-mono">Tournament</span>
                <span className="text-[#D4AF7C] font-semibold">{inspectingPlayer.tournament}</span>
              </div>

              {inspectingPlayer.customAnswers && Object.keys(inspectingPlayer.customAnswers).length > 0 ? (
                Object.entries(inspectingPlayer.customAnswers).map(([key, val], idx) => {
                  const targetTourn = tournaments.find(t => 
                    t.id === inspectingPlayer.tournamentId || 
                    t.title.toLowerCase() === inspectingPlayer.tournament.toLowerCase()
                  );
                  const cf = targetTourn?.customFields?.find(f => f.id === key);
                  const displayLabel = cf ? cf.label : key.replace(/_/g, ' ');

                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-[#090D12] border border-white/10 space-y-1">
                      <span className="text-[11px] font-medium text-[#A0A6B0] block leading-snug">
                        {displayLabel}
                      </span>
                      <p className="text-sm font-bold text-[#F5F5F5] font-['Inter',sans-serif]">
                        {val || '<empty response>'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-[#A0A6B0]">
                  No custom questions were answered for this player.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInspectingPlayer(null)}
                className="px-5 py-2 rounded-full font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
