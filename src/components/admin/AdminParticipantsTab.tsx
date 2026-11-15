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
            <h2 className="font-heading text-base sm:text-lg font-bold text-fg flex items-center gap-2 tracking-tight">
              <Swords className="w-5 h-5 text-accent" />
              <span>Concurrent Tournaments • Live Registration Operations</span>
            </h2>
            <p className="text-xs text-fg-muted">
              Monitor capacity and arbiter desk check-ins across all simultaneously active tournament forms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loadingParticipants}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-surface hover:bg-surface-subtle border border-border text-fg-muted hover:text-fg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-accent ${loadingParticipants ? 'animate-spin' : ''}`} />
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
              <button
                type="button"
                key={tourn.id}
                onClick={() => setSelectedTournament(isSelected ? 'all' : tourn.id)}
                className={`text-left relative p-4 rounded-md border transition-colors cursor-pointer flex flex-col justify-between space-y-3 ${isSelected
                  ? 'bg-surface border-accent ring-1 ring-accent shadow-xs'
                  : 'bg-surface border-border hover:border-border-strong'
                  }`}
              >
                <div className="space-y-2 w-full">
                  {/* Status Chip & Format */}
                  <div className="flex items-center justify-between gap-2">
                    {isOpen ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold text-success bg-success/10 border border-success/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        <span>OPEN</span>
                      </span>
                    ) : isClosingSoon ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold text-warning bg-warning/10 border border-warning/30">
                        <Flame className="w-3 h-3 text-warning" />
                        <span>CLOSING SOON</span>
                      </span>
                    ) : isClosed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold text-danger bg-danger/10 border border-danger/30">
                        <X className="w-3 h-3 text-danger" />
                        <span>CLOSED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold text-info bg-info/10 border border-info/30 uppercase">
                        {tourn.status}
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-accent font-semibold truncate max-w-[120px]">
                      {tourn.entryFee || 'Free'}
                    </span>
                  </div>

                  {/* Tournament Title */}
                  <div>
                    <h4 className="font-heading font-bold text-xs sm:text-sm text-fg line-clamp-1 leading-snug">
                      {tourn.title}
                    </h4>
                    <p className="text-[10px] text-fg-muted truncate mt-0.5">
                      {tourn.date} • {tourn.venue}
                    </p>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                      <span className="text-fg-muted">
                        Capacity: <strong className="text-fg">{enrolledCount}</strong>/{maxSlots}
                      </span>
                      <span className="font-bold text-accent">
                        {capacityPercent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-xs bg-surface-subtle overflow-hidden border border-border">
                      <div
                        className={`h-full transition-all duration-500 ${capacityPercent >= 90
                          ? 'bg-danger'
                          : capacityPercent >= 70
                            ? 'bg-warning'
                            : 'bg-success'
                          }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                    <p className="text-[9px] font-mono text-fg-subtle">
                      {Math.max(0, maxSlots - enrolledCount)} spots remaining
                    </p>
                  </div>
                </div>

                {/* Desk Check-in Breakdown & Focus Toggle */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-xs bg-success/10 text-success font-bold border border-success/20 tabular-nums">
                      {checkedInCount} In
                    </span>
                    <span className="px-2 py-0.5 rounded-xs bg-warning/10 text-warning font-medium border border-warning/20 tabular-nums">
                      {Math.max(0, enrolledCount - checkedInCount)} Pending
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold ${isSelected ? 'text-accent' : 'text-fg-muted'}`}>
                    {isSelected ? 'Focused' : 'Focus →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter, Search & Arbiter Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-md bg-surface border border-border space-y-4">
        {/* Row 1: Search & Action Buttons */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-fg-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search player name, roll no, ticket ID, chess handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-fg-muted hover:text-fg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Arbiter Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            {/* Manual Walk-in Player */}
            <button
              type="button"
              onClick={() => {
                setWalkInError('');
                setWalkInCustomAnswers({});
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Walk-in Registration</span>
            </button>

            {/* Export CSV for Swiss-Manager / FIDE */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-xs font-semibold text-fg bg-surface-elevated hover:bg-surface-subtle border border-border-strong transition-colors cursor-pointer"
              title="Export formatted CSV compatible with Swiss-Manager and Excel"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Tournament Filter Tabs & Check-in Status Pills */}
        <div className="pt-3 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Tournament Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-fg-muted mr-1">Event:</span>

            <button
              type="button"
              onClick={() => setSelectedTournament('all')}
              className={`px-3 py-1.5 rounded-sm font-semibold transition-colors cursor-pointer text-xs ${selectedTournament === 'all'
                ? 'bg-accent text-on-accent'
                : 'bg-surface-elevated text-fg-muted hover:text-fg border border-border'
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
                  className={`px-3 py-1.5 rounded-sm font-semibold transition-colors cursor-pointer text-xs truncate max-w-[200px] ${selectedTournament === t.id || selectedTournament === t.title
                    ? 'bg-accent text-on-accent'
                    : 'bg-surface-elevated text-fg-muted hover:text-fg border border-border'
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
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-fg-muted mr-1">Status:</span>

            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer ${statusFilter === 'all'
                ? 'bg-primary text-on-primary'
                : 'text-fg-muted hover:text-fg border border-border'
                }`}
            >
              All ({filteredParticipants.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('checked_in')}
              className={`px-2.5 py-1 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${statusFilter === 'checked_in'
                ? 'bg-success/15 text-success border border-success/30'
                : 'text-fg-muted hover:text-success border border-transparent'
                }`}
            >
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span>Checked In ({participants.filter(p => p.checkInStatus === 'checked_in').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('confirmed')}
              className={`px-2.5 py-1 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${statusFilter === 'confirmed'
                ? 'bg-warning/15 text-warning border border-warning/30'
                : 'text-fg-muted hover:text-warning border border-transparent'
                }`}
            >
              <Clock className="w-3 h-3 text-warning" />
              <span>Awaiting Desk ({participants.filter(p => p.checkInStatus !== 'checked_in').length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="rounded-md bg-surface border border-border overflow-hidden shadow-xs">
        {/* Mobile Horizontal Scroll Hint */}
        <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-surface-elevated border-b border-border text-[11px] text-fg-muted">
          <span className="text-accent font-medium">← Swipe to view arbiter actions &amp; details →</span>
          <span className="font-mono text-[10px] text-fg-subtle tabular-nums">{filteredParticipants.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-xs">
            <thead className="bg-surface-elevated text-fg-muted font-mono font-semibold border-b border-border uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Participant Details</th>
                <th className="py-3.5 px-4">Institution &amp; Dept</th>
                <th className="py-3.5 px-4">Rating &amp; Handle</th>
                <th className="py-3.5 px-4">Tournament Event</th>
                <th className="py-3.5 px-4 text-center">Custom Q&amp;A</th>
                <th className="py-3.5 px-4 text-center">Desk Status</th>
                <th className="py-3.5 px-4 text-right">Arbiter Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-body">
              {loadingParticipants ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-fg-muted">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                      <span className="text-xs font-mono">Synchronizing player registrations from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-fg-muted">
                    <p className="text-sm font-semibold text-fg">No participants matching your filter criteria.</p>
                    <p className="text-xs text-fg-muted mt-1">Try clearing your search query or selecting &quot;All Events&quot;.</p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((player) => {
                  const hasCustomAnswers = player.customAnswers && Object.keys(player.customAnswers).length > 0;
                  const isCheckingThis = togglingTicketId === player.ticketId;
                  const isDeletingThis = deletingTicketId === player.ticketId;

                  return (
                    <tr key={player.id} className="hover:bg-surface-elevated/60 transition-colors">
                      {/* Ticket ID */}
                      <td className="py-4 px-4 font-mono font-semibold text-accent whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{player.ticketId}</span>
                          <Link
                            href={`/my-ticket?ticketId=${encodeURIComponent(player.ticketId)}`}
                            target="_blank"
                            className="text-fg-muted hover:text-accent transition-colors"
                            title="Open Public Pass"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>

                      {/* Participant Name & Contact */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-fg">{player.name}</div>
                        <div className="text-[11px] text-fg-muted font-mono">Roll: {player.rollNumber}</div>
                        {player.phone && (
                          <div className="text-[10px] font-mono text-fg-subtle">Ph: {player.phone}</div>
                        )}
                      </td>

                      {/* Institution & Dept */}
                      <td className="py-4 px-4">
                        <div className="text-fg font-medium">{player.department} ({player.year || 'UG'})</div>
                        <div className="text-[11px] text-fg-muted truncate max-w-[170px]" title={player.college}>
                          {player.college}
                        </div>
                      </td>

                      {/* Rating Category & Chess Handles */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-surface-elevated border border-border text-fg">
                            {player.ratingCategory}
                          </span>
                        </div>
                        <div className="text-[11px] text-accent font-mono mt-1">
                          {player.chessUsername && player.chessUsername !== 'N/A' ? (
                            <>
                              <span>@{player.chessUsername}</span>
                              {player.chessPlatform && !player.chessUsername.includes('(') && (
                                <span className="text-fg-muted text-[10px] ml-1">
                                  ({player.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'})
                                </span>
                              )}
                            </>
                          ) : ''}
                          {player.fideId && player.fideId !== 'Unrated' && (
                            <span className="text-[10px] text-fg-muted block">FIDE: {player.fideId}</span>
                          )}
                        </div>
                      </td>

                      {/* Tournament Event */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-xs text-[10px] font-medium bg-accent/10 border border-accent/25 text-accent inline-block max-w-[160px] truncate" title={player.tournament}>
                          {player.tournament}
                        </span>
                      </td>

                      {/* Custom Q&A */}
                      <td className="py-4 px-4 text-center">
                        {hasCustomAnswers ? (
                          <button
                            type="button"
                            onClick={() => setInspectingPlayer(player)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[10px] font-semibold text-info bg-info/10 border border-info/30 hover:bg-info/20 transition-colors cursor-pointer"
                            title="View answers to custom tournament questions"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{Object.keys(player.customAnswers || {}).length} Answers</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-fg-subtle">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {player.checkInStatus === 'checked_in' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold text-success bg-success/10 border border-success/30">
                            <CheckCircle2 className="w-3 h-3 text-success" />
                            <span>Checked In</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold text-warning bg-warning/10 border border-warning/30">
                            <Clock className="w-3 h-3 text-warning" />
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
                            className={`px-3 py-1.5 rounded-sm text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${player.checkInStatus === 'checked_in'
                              ? 'text-fg-muted hover:text-danger bg-surface-elevated hover:bg-danger/10 border border-border hover:border-danger/30'
                              : 'text-white bg-success hover:bg-success/90 font-semibold'
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
                            className="p-1.5 rounded-sm text-fg-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
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
          role="dialog"
          aria-modal="true"
          aria-label="Manual Arbiter Walk-in Registration"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-surface rounded-md border border-border-strong p-6 sm:p-8 space-y-5 shadow-md my-auto max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
              <div>
                <h3 className="font-heading text-base font-bold text-fg flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-accent" />
                  <span>Manual Arbiter Walk-in Registration</span>
                </h3>
                <p className="text-xs text-fg-muted mt-0.5">
                  Register a walk-in player directly at the tournament reception desk.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close Walk-in Modal"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-sm bg-surface-elevated hover:bg-surface-subtle text-fg-muted hover:text-fg flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs font-body">
              {walkInError && (
                <div className="p-3 rounded-sm bg-danger/10 border border-danger/30 text-danger">
                  {walkInError}
                </div>
              )}

              {/* Tournament Selector */}
              <div className="space-y-1">
                <label className="text-accent font-mono font-bold uppercase tracking-wider text-[10px]">
                  Target Tournament Event *
                </label>
                <select
                  value={newPlayer.tournamentId}
                  onChange={(e) => setNewPlayer({ ...newPlayer, tournamentId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-sm bg-surface-elevated border border-border text-fg focus:border-accent text-xs cursor-pointer"
                >
                  {tournaments.filter(t => !t.isPast && t.status !== 'completed').map(t => (
                    <option key={t.id} value={t.id} className="bg-surface text-fg">
                      {t.title} ({t.status === 'open' ? 'Open' : t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name & Roll */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Roll Number / Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23101104018"
                    value={newPlayer.rollNumber}
                    onChange={(e) => setNewPlayer({ ...newPlayer, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs font-mono"
                  />
                </div>
              </div>

              {/* Institution & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Institution / College</label>
                  <input
                    type="text"
                    value={newPlayer.college}
                    onChange={(e) => setNewPlayer({ ...newPlayer, college: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg focus:border-accent text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Department &amp; Year</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="CSE"
                      value={newPlayer.department}
                      onChange={(e) => setNewPlayer({ ...newPlayer, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg focus:border-accent text-xs"
                    />
                    <select
                      value={newPlayer.year}
                      onChange={(e) => setNewPlayer({ ...newPlayer, year: e.target.value })}
                      className="w-full px-2 py-2 rounded-sm bg-surface-elevated border border-border text-fg text-xs"
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
                  <label className="text-fg-muted font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="player@jgec.ac.in"
                    value={newPlayer.email}
                    onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">WhatsApp / Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={newPlayer.phone}
                    onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs font-mono"
                  />
                </div>
              </div>

              {/* Chess Ratings & Handles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Rating Band</label>
                  <select
                    value={newPlayer.ratingCategory}
                    onChange={(e) => setNewPlayer({ ...newPlayer, ratingCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg focus:border-accent text-xs"
                  >
                    <option>Beginner / Casual (&lt; 1200)</option>
                    <option>Club Player (1200 - 1600)</option>
                    <option>Intermediate / Rated (1600 - 1900)</option>
                    <option>Advanced / FIDE Master (&gt; 1900)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">Chess Handle</label>
                  <input
                    type="text"
                    placeholder="Lichess/Chess.com"
                    value={newPlayer.chessUsername}
                    onChange={(e) => setNewPlayer({ ...newPlayer, chessUsername: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-fg-muted font-semibold">FIDE ID</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={newPlayer.fideId}
                    onChange={(e) => setNewPlayer({ ...newPlayer, fideId: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle focus:border-accent text-xs font-mono"
                  />
                </div>
              </div>

              {/* Custom Tournament Questions (Dynamically Loaded) */}
              {(() => {
                const curTourn = tournaments.find(t => t.id === newPlayer.tournamentId);
                if (!curTourn || !curTourn.customFields || curTourn.customFields.length === 0) return null;
                return (
                  <div className="p-3.5 rounded-sm bg-surface-elevated border border-accent/30 space-y-3">
                    <div className="font-mono font-bold text-[11px] uppercase tracking-wider text-accent">
                      Tournament Specific Form Responses
                    </div>
                    {curTourn.customFields.map(cf => (
                      <div key={cf.id} className="space-y-1">
                        <label className="text-fg font-medium text-[11px] block">
                          {cf.label} {cf.required && <span className="text-danger">*</span>}
                        </label>
                        {cf.type === 'select' && cf.options ? (
                          <select
                            value={walkInCustomAnswers[cf.id] || ''}
                            onChange={(e) => setWalkInCustomAnswers({ ...walkInCustomAnswers, [cf.id]: e.target.value })}
                            className="w-full px-3 py-2 rounded-sm bg-surface border border-border text-fg text-xs"
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
                            className="w-full px-3 py-2 rounded-sm bg-surface border border-border text-fg text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Immediate Check-In Toggle */}
              <div className="p-3 rounded-sm bg-success/10 border border-success/30 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-success block">Immediate Desk Check-In</span>
                  <span className="text-[10px] text-fg-muted">Mark player as present and verified for pairing immediately</span>
                </div>
                <input
                  type="checkbox"
                  checked={walkInImmediateCheckIn}
                  onChange={(e) => setWalkInImmediateCheckIn(e.target.checked)}
                  className="w-4 h-4 accent-success rounded-xs cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-sm text-fg-muted hover:text-fg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingWalkIn}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50"
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
          role="dialog"
          aria-modal="true"
          aria-label="Custom Registration Answers"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectingPlayer(null)}
        >
          <div
            className="w-full max-w-lg bg-surface rounded-md border border-border-strong p-6 sm:p-8 space-y-5 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-heading text-base font-bold text-fg flex items-center gap-2">
                  <Eye className="w-4 h-4 text-info" />
                  <span>Custom Registration Answers</span>
                </h3>
                <p className="text-xs text-fg-muted mt-0.5 font-mono">
                  {inspectingPlayer.name} ({inspectingPlayer.rollNumber}) • {inspectingPlayer.ticketId}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close Inspector"
                onClick={() => setInspectingPlayer(null)}
                className="w-7 h-7 rounded-sm bg-surface-elevated hover:bg-surface-subtle text-fg-muted hover:text-fg flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-sm bg-surface-elevated border border-border text-xs">
                <span className="text-fg-muted block text-[10px] uppercase font-mono">Tournament</span>
                <span className="text-accent font-semibold">{inspectingPlayer.tournament}</span>
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
                    <div key={idx} className="p-3.5 rounded-sm bg-surface-elevated border border-border space-y-1">
                      <span className="text-[11px] font-medium text-fg-muted block leading-snug">
                        {displayLabel}
                      </span>
                      <p className="text-sm font-semibold text-fg font-body">
                        {val || '<empty response>'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-fg-muted">
                  No custom questions were answered for this player.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInspectingPlayer(null)}
                className="px-5 py-2 rounded-sm font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer text-xs"
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
