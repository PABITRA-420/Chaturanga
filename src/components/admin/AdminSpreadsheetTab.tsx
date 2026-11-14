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
      <div className="p-6 rounded-md bg-surface border border-border-strong shadow-xs relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs text-[11px] font-mono font-bold text-accent bg-accent/10 border border-accent/30">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Live Spreadsheet Data Grid</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-mono text-success bg-success/10 border border-success/30">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span>Google Apps Script Link Active</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight font-heading">
              Master Registration Spreadsheet
            </h2>

            <p className="text-xs text-fg-muted max-w-2xl leading-relaxed">
              Real-time tabular roster mirroring the Google Sheets master database. Instant cell copy, multi-column search, Swiss-Manager CSV export, and live check-in management.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={GOOGLE_SHEETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-semibold text-accent bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Google Sheets</span>
            </a>

            <button
              type="button"
              onClick={handleCopyTSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-xs font-semibold text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
              title="Copy all rows in Tab-Separated format to paste directly into Excel or Google Sheets"
            >
              {copyTsvSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-success font-bold">Copied TSV!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-accent" />
                  <span>Copy TSV (for Excel)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                aria-label="Refresh registrations from database"
                className="p-2 rounded-sm text-fg-muted hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
                title="Refresh registrations from database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-accent' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="mt-6 pt-5 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by name, roll, phone, handle..."
              className="w-full pl-9 pr-8 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear filter"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tournament Dropdown */}
          <select
            aria-label="Filter by tournament"
            value={selectedTournament}
            onChange={e => setSelectedTournament(e.target.value)}
            className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg focus:border-accent transition-colors"
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
            aria-label="Filter by department"
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg focus:border-accent transition-colors"
          >
            <option value="all">All Departments (Branches)</option>
            {departmentOptions.map(dept => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Check-in Status Selector */}
          <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-sm border border-border">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-primary text-on-primary' : 'text-fg-muted hover:text-fg'
              }`}
            >
              All ({participants.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('checked_in')}
              className={`flex-1 py-1 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'checked_in'
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'text-fg-muted hover:text-success'
              }`}
            >
              Checked In ({participants.filter(p => p.checkInStatus === 'checked_in').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('confirmed')}
              className={`flex-1 py-1 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer ${
                statusFilter === 'confirmed'
                  ? 'bg-warning/15 text-warning border border-warning/30'
                  : 'text-fg-muted hover:text-warning'
              }`}
            >
              Awaiting ({participants.filter(p => p.checkInStatus !== 'checked_in').length})
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="rounded-md bg-surface border border-border shadow-xs overflow-hidden">
        {/* Table Header Bar / Hint */}
        <div className="px-5 py-3 bg-surface-elevated border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Table2 className="w-4 h-4 text-accent" />
            <span className="font-mono font-bold text-fg uppercase tracking-wider text-[11px] tabular-nums">
              Showing {filteredParticipants.length} of {participants.length} spreadsheet records
            </span>
            {copiedCell && (
              <span className="ml-2 px-2 py-0.5 rounded-xs bg-success/15 border border-success/30 text-success text-[10px] font-mono">
                Copied cell to clipboard!
              </span>
            )}
          </div>
          <span className="text-[11px] text-fg-muted hidden sm:inline-block">
            Tip: Click any table cell to copy its content to clipboard
          </span>
        </div>

        {/* Interactive Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-elevated text-[10px] font-mono font-bold uppercase tracking-wider text-accent border-b border-border">
              <tr>
                <th className="py-3 px-3 w-12 text-center border-r border-border">#</th>
                <th className="py-3 px-3 border-r border-border min-w-[130px]">Timestamp</th>
                <th className="py-3 px-3 border-r border-border min-w-[120px]">Ticket ID</th>
                <th className="py-3 px-4 border-r border-border min-w-[180px]">Tournament</th>
                <th className="py-3 px-4 border-r border-border min-w-[160px]">Full Name</th>
                <th className="py-3 px-3 border-r border-border min-w-[110px]">Roll No</th>
                <th className="py-3 px-3 border-r border-border min-w-[90px]">Dept</th>
                <th className="py-3 px-3 border-r border-border min-w-[80px]">Year</th>
                <th className="py-3 px-4 border-r border-border min-w-[140px]">Institution</th>
                <th className="py-3 px-4 border-r border-border min-w-[160px]">Email</th>
                <th className="py-3 px-3 border-r border-border min-w-[110px]">Phone</th>
                <th className="py-3 px-3 border-r border-border min-w-[130px]">Rating Cat</th>
                <th className="py-3 px-3 border-r border-border min-w-[110px]">Chess Handle</th>
                <th className="py-3 px-3 border-r border-border min-w-[90px]">FIDE ID</th>
                <th className="py-3 px-4 text-center min-w-[110px]">Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={15} className="py-16 text-center text-fg-muted">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                      <span className="text-xs font-mono">Synchronizing spreadsheet entries from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-16 text-center text-fg-muted space-y-2">
                    <p className="text-sm font-bold text-fg font-heading">No Spreadsheet Records Found</p>
                    <p className="text-xs text-fg-muted font-body max-w-md mx-auto">
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
                      className="mt-2 px-3 py-1.5 rounded-sm text-xs font-semibold text-accent bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-colors cursor-pointer"
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
                      className="hover:bg-surface-elevated/60 transition-colors group"
                    >
                      {/* # Row Number */}
                      <td className="py-2.5 px-3 text-center text-fg-subtle border-r border-border select-none bg-surface-subtle/50 tabular-nums">
                        {rowNum}
                      </td>

                      {/* Timestamp */}
                      <td
                        onClick={() => handleCopyCell(dateStr, `time-${p.ticketId}`)}
                        className="py-2.5 px-3 text-fg-muted border-r border-border cursor-pointer hover:text-fg truncate"
                        title="Click to copy timestamp"
                      >
                        {dateStr}
                      </td>

                      {/* Ticket ID */}
                      <td
                        onClick={() => handleCopyCell(p.ticketId, `tkt-${p.ticketId}`)}
                        className="py-2.5 px-3 text-accent font-bold border-r border-border cursor-pointer hover:underline truncate tabular-nums"
                        title="Click to copy ticket ID"
                      >
                        {p.ticketId}
                      </td>

                      {/* Tournament */}
                      <td
                        onClick={() => handleCopyCell(p.tournament, `tourn-${p.ticketId}`)}
                        className="py-2.5 px-4 text-fg font-body font-medium border-r border-border cursor-pointer truncate max-w-[200px]"
                        title={p.tournament}
                      >
                        {p.tournament}
                      </td>

                      {/* Full Name */}
                      <td
                        onClick={() => handleCopyCell(p.name, `name-${p.ticketId}`)}
                        className="py-2.5 px-4 text-fg font-body font-semibold border-r border-border cursor-pointer hover:text-accent truncate max-w-[180px]"
                        title="Click to copy name"
                      >
                        {p.name}
                      </td>

                      {/* Roll Number */}
                      <td
                        onClick={() => handleCopyCell(p.rollNumber, `roll-${p.ticketId}`)}
                        className="py-2.5 px-3 text-fg-muted border-r border-border cursor-pointer hover:text-fg truncate tabular-nums"
                        title="Click to copy roll number"
                      >
                        {p.rollNumber}
                      </td>

                      {/* Department */}
                      <td
                        onClick={() => handleCopyCell(p.department, `dept-${p.ticketId}`)}
                        className="py-2.5 px-3 text-fg font-body border-r border-border cursor-pointer truncate"
                      >
                        <span className="px-1.5 py-0.5 rounded-xs bg-surface-elevated text-[10px] font-mono border border-border">
                          {p.department || '—'}
                        </span>
                      </td>

                      {/* Year */}
                      <td className="py-2.5 px-3 text-fg-muted border-r border-border truncate">
                        {p.year || '—'}
                      </td>

                      {/* Institution */}
                      <td
                        onClick={() => handleCopyCell(p.college || 'JGEC', `inst-${p.ticketId}`)}
                        className="py-2.5 px-4 text-fg-muted font-body border-r border-border cursor-pointer truncate max-w-[140px]"
                        title={p.college}
                      >
                        {p.college || 'JGEC'}
                      </td>

                      {/* Email */}
                      <td
                        onClick={() => handleCopyCell(p.email || '', `email-${p.ticketId}`)}
                        className="py-2.5 px-4 text-fg-muted border-r border-border cursor-pointer hover:text-fg truncate max-w-[160px]"
                        title={p.email}
                      >
                        {p.email || '—'}
                      </td>

                      {/* Phone */}
                      <td
                        onClick={() => handleCopyCell(p.phone || '', `phone-${p.ticketId}`)}
                        className="py-2.5 px-3 text-fg-muted border-r border-border cursor-pointer hover:text-fg truncate tabular-nums"
                        title={p.phone}
                      >
                        {p.phone || '—'}
                      </td>

                      {/* Rating Category */}
                      <td className="py-2.5 px-3 text-fg-muted font-body border-r border-border truncate max-w-[130px]">
                        {p.ratingCategory || 'Unrated'}
                      </td>

                      {/* Chess Username */}
                      <td
                        onClick={() => handleCopyCell(p.chessUsername || '', `user-${p.ticketId}`)}
                        className="py-2.5 px-3 text-accent border-r border-border cursor-pointer hover:underline truncate"
                        title={p.chessUsername}
                      >
                        {p.chessUsername || '—'}
                      </td>

                      {/* FIDE ID */}
                      <td
                        onClick={() => handleCopyCell(p.fideId || '', `fide-${p.ticketId}`)}
                        className="py-2.5 px-3 text-fg-muted border-r border-border cursor-pointer hover:text-fg truncate tabular-nums"
                      >
                        {p.fideId || '—'}
                      </td>

                      {/* Desk Check-in Action */}
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={togglingTicketId === p.ticketId}
                          onClick={() => handleToggleCheckIn(p.ticketId, p.checkInStatus)}
                          className={`px-2.5 py-1 rounded-xs text-[10px] font-body font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer ${
                            isCheckedIn
                              ? 'bg-success/15 text-success border border-success/30 hover:bg-success/25'
                              : 'bg-surface-elevated text-fg-muted border border-border hover:text-fg hover:bg-surface-subtle'
                          }`}
                        >
                          {isCheckedIn ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-success" />
                              <span>Checked</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-warning" />
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
        <div className="px-5 py-3 bg-surface-elevated border-t border-border flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-fg-muted">
          <div className="flex items-center gap-4 tabular-nums">
            <span>
              Total Rows: <strong className="text-fg">{participants.length}</strong>
            </span>
            <span>•</span>
            <span>
              Filtered: <strong className="text-accent">{filteredParticipants.length}</strong>
            </span>
            <span>•</span>
            <span>
              Checked In:{' '}
              <strong className="text-success">
                {filteredParticipants.filter(p => p.checkInStatus === 'checked_in').length}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span>Formula/Sync:</span>
            <span className="text-fg">
              =GOOGLEFINANCE / AppsScript(v1.2) • Supabase PostgreSQL v15
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
