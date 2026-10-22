'use client';

import React, { useState, useMemo } from 'react';
import { Participant, Tournament } from '@/types/tournament';
import {
  Table2,
  Download,
  ExternalLink,
  Search,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  FileSpreadsheet,
  X,
  Phone,
  Mail,
  Award,
} from 'lucide-react';

export interface AdminSpreadsheetTabProps {
  tournaments: Tournament[];
  participants: Participant[];
  loading?: boolean;
  onRefresh?: () => void;
  onCheckIn?: (ticketId: string, currentStatus: string) => Promise<void>;
}

// Google Sheets document linked from Code.gs automation
const GOOGLE_SHEETS_URL =
  'https://docs.google.com/spreadsheets/d/1bfFYC3jwdndjTfT5nMJ0nANOrVFKngNUzEP-IFu-Olg/edit';

export default function AdminSpreadsheetTab({
  tournaments,
  participants,
  loading = false,
  onRefresh,
  onCheckIn,
}: AdminSpreadsheetTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'confirmed'>('all');
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [togglingTicketId, setTogglingTicketId] = useState<string | null>(null);
  const [copyTsvSuccess, setCopyTsvSuccess] = useState(false);

  // Extract unique departments from participants
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    participants.forEach(p => {
      if (p.department) set.add(p.department.trim());
    });
    return Array.from(set).sort();
  }, [participants]);

  // Filter participants
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      // Tournament filter
      if (selectedTournament !== 'all') {
        const matchesTourn =
          p.tournamentId === selectedTournament ||
          p.tournament.toLowerCase() === selectedTournament.toLowerCase() ||
          tournaments.find(t => t.id === selectedTournament)?.title.toLowerCase() === p.tournament.toLowerCase();
        if (!matchesTourn) return false;
      }

      // Department filter
      if (selectedDepartment !== 'all') {
        if (p.department !== selectedDepartment) return false;
      }

      // Status filter
      if (statusFilter === 'checked_in' && p.checkInStatus !== 'checked_in') return false;
      if (statusFilter === 'confirmed' && p.checkInStatus === 'checked_in') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.rollNumber.toLowerCase().includes(q) ||
          p.ticketId.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          (p.college && p.college.toLowerCase().includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q)) ||
          (p.phone && p.phone.toLowerCase().includes(q)) ||
          (p.chessUsername && p.chessUsername.toLowerCase().includes(q)) ||
          (p.fideId && p.fideId.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [participants, selectedTournament, selectedDepartment, statusFilter, searchQuery, tournaments]);

  // Copy cell value to clipboard
  const handleCopyCell = (text: string, cellKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCell(cellKey);
    setTimeout(() => setCopiedCell(null), 2000);
  };

  // Export full table as CSV
  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Ticket ID',
      'Tournament',
      'Full Name',
      'Roll Number',
      'Department',
      'Year',
      'Institution',
      'Email',
      'Phone',
      'Rating Category',
      'Chess Username',
      'FIDE ID',
      'Check-in Status',
    ];

    const rows = filteredParticipants.map(p => [
      p.registeredAt || '',
      p.ticketId || '',
      `"${(p.tournament || '').replace(/"/g, '""')}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.rollNumber || '',
      `"${(p.department || '').replace(/"/g, '""')}"`,
      p.year || '',
      `"${(p.college || 'JGEC').replace(/"/g, '""')}"`,
      p.email || '',
      p.phone || '',
      `"${(p.ratingCategory || '').replace(/"/g, '""')}"`,
      p.chessUsername || '',
      p.fideId || '',
      p.checkInStatus || 'registered',
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Chaturanga_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy TSV directly to paste into Excel or Google Sheets (Ctrl+V)
  const handleCopyTSV = () => {
    const headers = [
      'Timestamp',
      'Ticket ID',
      'Tournament',
      'Full Name',
      'Roll Number',
      'Department',
      'Year',
      'Institution',
      'Email',
      'Phone',
      'Rating Category',
      'Chess Username',
      'FIDE ID',
      'Check-in Status',
    ];

    const rows = filteredParticipants.map(p => [
      p.registeredAt || '',
      p.ticketId || '',
      p.tournament || '',
      p.name || '',
      p.rollNumber || '',
      p.department || '',
      p.year || '',
      p.college || 'JGEC',
      p.email || '',
      p.phone || '',
      p.ratingCategory || '',
      p.chessUsername || '',
      p.fideId || '',
      p.checkInStatus || 'registered',
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopyTsvSuccess(true);
    setTimeout(() => setCopyTsvSuccess(false), 2500);
  };

  // Toggle Check-in status
  const handleToggleCheckIn = async (ticketId: string, current: string) => {
    if (!onCheckIn) return;
    setTogglingTicketId(ticketId);
    try {
      await onCheckIn(ticketId, current);
    } finally {
      setTogglingTicketId(null);
    }
  };

  return (
    <section className="space-y-6" data-testid="admin-spreadsheet-view">
      {/* Top Banner & Control Deck */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#141A24] via-[#10141D] to-[#0A0D14] border border-[#D4AF7C]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF7C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Live Spreadsheet Data Grid</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Google Apps Script Link Active</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Montserrat',sans-serif]">
              Master Registration Spreadsheet
            </h2>

            <p className="text-xs text-[#A0A6B0] max-w-2xl leading-relaxed">
              Real-time tabular roster mirroring the Google Sheets master database. Instant cell copy, multi-column search, Swiss-Manager CSV export, and live check-in management.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={GOOGLE_SHEETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 hover:bg-[#D4AF7C]/20 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Sheets ↗</span>
            </a>

            <button
              type="button"
              onClick={handleCopyTSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
              title="Copy all rows in Tab-Separated format to paste directly into Excel or Google Sheets"
            >
              {copyTsvSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Copied TSV!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#D4AF7C]" />
                  <span>Copy TSV (for Excel)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-[#D4AF7C] hover:bg-[#E6C98A] transition shadow-md shadow-[#D4AF7C]/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
                title="Refresh registrations from database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF7C]' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by name, roll, phone, handle..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF7C] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tournament Dropdown */}
          <select
            value={selectedTournament}
            onChange={e => setSelectedTournament(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF7C] transition"
          >
            <option value="all">All Tournaments ({participants.length})</option>
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          {/* Department Dropdown */}
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF7C] transition"
          >
            <option value="all">All Departments (Branches)</option>
            {departmentOptions.map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Check-in Status Selector */}
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition ${
                statusFilter === 'all' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({participants.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('checked_in')}
              className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition ${
                statusFilter === 'checked_in'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Checked In ({participants.filter(p => p.checkInStatus === 'checked_in').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('confirmed')}
              className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition ${
                statusFilter === 'confirmed'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              Awaiting ({participants.filter(p => p.checkInStatus !== 'checked_in').length})
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="rounded-3xl bg-[#0D1117] border border-white/10 shadow-2xl overflow-hidden">
        {/* Table Header Bar / Hint */}
        <div className="px-5 py-3 bg-[#080B10] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Table2 className="w-4 h-4 text-[#D4AF7C]" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Showing {filteredParticipants.length} of {participants.length} spreadsheet records
            </span>
            {copiedCell && (
              <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono animate-fadeIn">
                Copied cell to clipboard!
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline-block">
            Tip: Click any table cell to copy its content to clipboard
          </span>
        </div>

        {/* Interactive Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#121620] text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4AF7C] border-b border-white/10">
              <tr>
                <th className="py-3 px-3 w-12 text-center border-r border-white/5">#</th>
                <th className="py-3 px-3 border-r border-white/5 min-w-[130px]">Timestamp</th>
                <th className="py-3 px-3 border-r border-white/5 min-w-[120px]">Ticket ID</th>
                <th className="py-3 px-4 border-r border-white/5 min-w-[180px]">Tournament</th>
                <th className="py-3 px-4 border-r border-white/5 min-w-[160px]">Full Name</th>
                <th className="py-3 px-3 border-r border-white/5 min-w-[110px]">Roll No</th>
                <th className="py-3 px-3 border-r border-white/5 min-w-[90px]">Dept</th>
                <th className="py-3 px-3 border-r border-white/5 min-w-[80px]">Year</th>
                <th className="py-3 px-4 border-r border-white/5 min-w-[140px]">Institution</th>
                <th className="py-3 px-4 border-r border-white/5 min-w-[160px]">Email</th>
                <th className="py-3 px-3 border-r border-white/5 min-w-[110px]">Phone</th>
                <th className="py-3 px-3 border-r border-white/5 min-w-[130px]">Rating Cat</th>
                <th className="py-3 px-3 border-r border-white/5 min-w-[110px]">Chess Handle</th>
                <th className="py-3 px-3 border-r border-white/5 min-w-[90px]">FIDE ID</th>
                <th className="py-3 px-4 text-center min-w-[110px]">Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={15} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 text-[#D4AF7C] animate-spin" />
                      <span className="text-xs font-mono">Synchronizing spreadsheet entries from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-16 text-center text-slate-400 space-y-2">
                    <p className="text-sm font-bold text-white">No Spreadsheet Records Found</p>
                    <p className="text-xs text-slate-500 font-sans max-w-md mx-auto">
                      No registrations matched your search or filters. Reset filters or register a walk-in player.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTournament('all');
                        setSelectedDepartment('all');
                        setStatusFilter('all');
                      }}
                      className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 hover:bg-[#D4AF7C]/20 transition cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p, idx) => {
                  const isCheckedIn = p.checkInStatus === 'checked_in';
                  const rowNum = idx + 1;
                  const dateStr = p.registeredAt
                    ? new Date(p.registeredAt).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr
                      key={p.ticketId || idx}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* # Row Number */}
                      <td className="py-2.5 px-3 text-center text-slate-500 border-r border-white/5 select-none bg-black/20">
                        {rowNum}
                      </td>

                      {/* Timestamp */}
                      <td
                        onClick={() => handleCopyCell(dateStr, `time-${p.ticketId}`)}
                        className="py-2.5 px-3 text-slate-400 border-r border-white/5 cursor-pointer hover:text-white truncate"
                        title="Click to copy timestamp"
                      >
                        {dateStr}
                      </td>

                      {/* Ticket ID */}
                      <td
                        onClick={() => handleCopyCell(p.ticketId, `tkt-${p.ticketId}`)}
                        className="py-2.5 px-3 text-[#D4AF7C] font-bold border-r border-white/5 cursor-pointer hover:underline truncate"
                        title="Click to copy ticket ID"
                      >
                        {p.ticketId}
                      </td>

                      {/* Tournament */}
                      <td
                        onClick={() => handleCopyCell(p.tournament, `tourn-${p.ticketId}`)}
                        className="py-2.5 px-4 text-white font-sans font-medium border-r border-white/5 cursor-pointer truncate max-w-[200px]"
                        title={p.tournament}
                      >
                        {p.tournament}
                      </td>

                      {/* Full Name */}
                      <td
                        onClick={() => handleCopyCell(p.name, `name-${p.ticketId}`)}
                        className="py-2.5 px-4 text-white font-sans font-bold border-r border-white/5 cursor-pointer hover:text-[#D4AF7C] truncate max-w-[180px]"
                        title="Click to copy name"
                      >
                        {p.name}
                      </td>

                      {/* Roll Number */}
                      <td
                        onClick={() => handleCopyCell(p.rollNumber, `roll-${p.ticketId}`)}
                        className="py-2.5 px-3 text-slate-300 border-r border-white/5 cursor-pointer hover:text-white truncate"
                        title="Click to copy roll number"
                      >
                        {p.rollNumber}
                      </td>

                      {/* Department */}
                      <td
                        onClick={() => handleCopyCell(p.department, `dept-${p.ticketId}`)}
                        className="py-2.5 px-3 text-slate-300 font-sans border-r border-white/5 cursor-pointer hover:text-white truncate"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono border border-white/5">
                          {p.department || '—'}
                        </span>
                      </td>

                      {/* Year */}
                      <td className="py-2.5 px-3 text-slate-400 border-r border-white/5 truncate">
                        {p.year || '—'}
                      </td>

                      {/* Institution */}
                      <td
                        onClick={() => handleCopyCell(p.college || 'JGEC', `inst-${p.ticketId}`)}
                        className="py-2.5 px-4 text-slate-300 font-sans border-r border-white/5 cursor-pointer truncate max-w-[140px]"
                        title={p.college}
                      >
                        {p.college || 'JGEC'}
                      </td>

                      {/* Email */}
                      <td
                        onClick={() => handleCopyCell(p.email || '', `email-${p.ticketId}`)}
                        className="py-2.5 px-4 text-slate-300 border-r border-white/5 cursor-pointer hover:text-white truncate max-w-[160px]"
                        title={p.email}
                      >
                        {p.email || '—'}
                      </td>

                      {/* Phone */}
                      <td
                        onClick={() => handleCopyCell(p.phone || '', `phone-${p.ticketId}`)}
                        className="py-2.5 px-3 text-slate-300 border-r border-white/5 cursor-pointer hover:text-white truncate"
                        title={p.phone}
                      >
                        {p.phone || '—'}
                      </td>

                      {/* Rating Category */}
                      <td className="py-2.5 px-3 text-slate-400 font-sans border-r border-white/5 truncate max-w-[130px]">
                        {p.ratingCategory || 'Unrated'}
                      </td>

                      {/* Chess Username */}
                      <td
                        onClick={() => handleCopyCell(p.chessUsername || '', `user-${p.ticketId}`)}
                        className="py-2.5 px-3 text-amber-300 border-r border-white/5 cursor-pointer hover:underline truncate"
                        title={p.chessUsername}
                      >
                        {p.chessUsername || '—'}
                      </td>

                      {/* FIDE ID */}
                      <td
                        onClick={() => handleCopyCell(p.fideId || '', `fide-${p.ticketId}`)}
                        className="py-2.5 px-3 text-slate-400 border-r border-white/5 cursor-pointer hover:text-white truncate"
                      >
                        {p.fideId || '—'}
                      </td>

                      {/* Desk Check-in Action */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={togglingTicketId === p.ticketId}
                          onClick={() => handleToggleCheckIn(p.ticketId, p.checkInStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold transition inline-flex items-center gap-1 cursor-pointer active:scale-95 ${
                            isCheckedIn
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {isCheckedIn ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Checked</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Check In</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Spreadsheet Footer Status Bar */}
        <div className="px-5 py-3 bg-[#080B10] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              Total Rows: <strong className="text-white">{participants.length}</strong>
            </span>
            <span>•</span>
            <span>
              Filtered: <strong className="text-[#D4AF7C]">{filteredParticipants.length}</strong>
            </span>
            <span>•</span>
            <span>
              Checked In:{' '}
              <strong className="text-emerald-400">
                {filteredParticipants.filter(p => p.checkInStatus === 'checked_in').length}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span>Formula/Sync:</span>
            <span className="text-slate-300">
              =GOOGLEFINANCE / AppsScript(v1.2) • Supabase PostgreSQL v15
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
