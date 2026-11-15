"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Tournament } from '@/types/tournament';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Edit, 
  SlidersHorizontal, 
  Award, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  X, 
  Trophy 
} from 'lucide-react';

export interface AdminTournamentsTabProps {
  tournaments: Tournament[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (tournament: Tournament, initialTab?: 'basics' | 'registration' | 'form' | 'rules') => void;
  onOpenArchiveModal: (tournament: Tournament) => void;
  onToggleStatus: (tournament: Tournament) => Promise<void>;
  onToggleVisibility: (tournament: Tournament) => Promise<void>;
  onDeleteTournament: (tournamentId: string, title: string) => Promise<void>;
  isUpdatingStatusId?: string | null;
  isTogglingVisibilityId?: string | null;
}

export default function AdminTournamentsTab({
  tournaments,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenArchiveModal,
  onToggleStatus,
  onToggleVisibility,
  onDeleteTournament,
  isUpdatingStatusId,
  isTogglingVisibilityId
}: AdminTournamentsTabProps) {
  const [tournamentSearch, setTournamentSearch] = useState('');
  const [tournamentStatusFilter, setTournamentStatusFilter] = useState('all');

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(tournamentSearch.toLowerCase()) ||
      t.venue.toLowerCase().includes(tournamentSearch.toLowerCase()) ||
      t.format.toLowerCase().includes(tournamentSearch.toLowerCase());

    if (tournamentStatusFilter === 'all') return matchesSearch;
    if (tournamentStatusFilter === 'open') return matchesSearch && t.status === 'open';
    if (tournamentStatusFilter === 'closed') return matchesSearch && t.status === 'closed';
    if (tournamentStatusFilter === 'upcoming') return matchesSearch && !t.isPast && t.status !== 'completed';
    if (tournamentStatusFilter === 'completed') return matchesSearch && (t.isPast || t.status === 'completed');

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-md bg-surface border border-border">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-fg-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tournaments by title, venue..."
            value={tournamentSearch}
            onChange={(e) => setTournamentSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['all', 'open', 'closed', 'upcoming', 'completed'].map(statusKey => (
            <button
              type="button"
              key={statusKey}
              onClick={() => setTournamentStatusFilter(statusKey)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold capitalize transition-colors cursor-pointer ${
                tournamentStatusFilter === statusKey
                  ? 'bg-accent text-on-accent'
                  : 'bg-surface-elevated border border-border text-fg-muted hover:text-fg'
              }`}
            >
              {statusKey}
            </button>
          ))}
        </div>
      </div>

      {/* Tournament Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredTournaments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-fg-muted rounded-md bg-surface border border-border">
            No tournaments found. Click &quot;Create Tournament&quot; to add your first event.
          </div>
        ) : (
          filteredTournaments.map(tournament => {
            const isOpen = tournament.status === 'open';
            const isClosed = tournament.status === 'closed';
            const isCompleted = tournament.status === 'completed';

            return (
              <div
                key={tournament.id}
                className="p-6 rounded-md bg-surface border border-border hover:border-border-strong transition-colors flex flex-col justify-between space-y-5 shadow-xs relative group"
              >
                {/* Top status & quick actions */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Status Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      {isOpen ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-mono font-bold text-success bg-success/10 border border-success/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          <span>REGISTRATION OPEN</span>
                        </span>
                      ) : isClosed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-mono font-bold text-danger bg-danger/10 border border-danger/30">
                          <X className="w-3.5 h-3.5" />
                          <span>REGISTRATION CLOSED</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-mono font-bold text-info bg-info/10 border border-info/30">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>COMPLETED (PAST EVENT)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-mono font-bold text-warning bg-warning/10 border border-warning/30">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="uppercase">{tournament.status}</span>
                        </span>
                      )}

                      {tournament.isFeatured && (
                        <span className="px-2 py-1 rounded-xs text-[10px] font-mono font-bold text-accent bg-accent/10 border border-accent/30 uppercase">
                          Featured
                        </span>
                      )}

                      {tournament.isVisible === false ? (
                        <span className="px-2 py-1 rounded-xs text-[10px] font-mono font-bold text-warning bg-warning/10 border border-warning/30 inline-flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden Draft</span>
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-xs text-[10px] font-mono font-bold text-success bg-success/10 border border-success/30 inline-flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Live on Site</span>
                        </span>
                      )}
                    </div>

                    {/* Quick 1-Click Open/Close Toggle Button */}
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(tournament)}
                        disabled={isUpdatingStatusId === tournament.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                          isOpen
                            ? 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30'
                            : 'bg-success/10 hover:bg-success/20 text-success border border-success/30'
                        }`}
                        title={isOpen ? 'Click to close registration immediately' : 'Click to open registration immediately'}
                      >
                        {isUpdatingStatusId === tournament.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : isOpen ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-success" />
                            <span>Close Reg</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-danger" />
                            <span>Open Reg</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Title & Format */}
                  <div>
                    <h3 className="font-heading text-lg font-bold text-fg group-hover:text-accent transition-colors">
                      {tournament.title}
                    </h3>
                    <p className="text-xs text-accent font-mono font-semibold mt-0.5">
                      {tournament.format}
                    </p>
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-fg-muted pt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{tournament.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{tournament.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="truncate">{tournament.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="font-mono tabular-nums">{tournament.slots} ({tournament.registeredCount || 0} enrolled)</span>
                    </div>
                  </div>

                  {/* Form Fields summary badge */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded-xs bg-surface-elevated border border-border text-fg-muted">
                      Form: {tournament.formConfig?.filter(f => f.enabled).length || 11} fields ({tournament.formConfig?.filter(f => f.required).length || 8} required)
                    </span>
                    {tournament.entryFee && (
                      <span className="px-2 py-0.5 rounded-xs bg-surface-elevated border border-border text-fg-muted">
                        Fee: {tournament.entryFee}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Toolbar */}
                <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Edit Details */}
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(tournament, 'basics')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-accent" />
                      <span>Edit All</span>
                    </button>

                    {/* Edit Registration Form Builder */}
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(tournament, 'form')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-info" />
                      <span>Form Fields</span>
                    </button>

                    {/* Move to Past / Publish Podium */}
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => onOpenArchiveModal(tournament)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/30 transition-colors cursor-pointer"
                        title="Conclude tournament, enter winners and move to Past Events"
                      >
                        <Award className="w-3.5 h-3.5 text-accent" />
                        <span>Conclude &amp; Podium</span>
                      </button>
                    )}
                  </div>

                  {/* Right side: Visibility Toggle, Preview link & Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleVisibility(tournament)}
                      disabled={isTogglingVisibilityId === tournament.id}
                      className={`p-2 rounded-sm transition-colors cursor-pointer ${
                        tournament.isVisible === false
                          ? 'text-warning bg-warning/10 hover:bg-warning/20 border border-warning/30'
                          : 'text-fg-muted hover:text-accent hover:bg-surface-subtle'
                      }`}
                      title={tournament.isVisible === false ? 'Currently Hidden from public (Click to make Visible)' : 'Currently Live on site (Click to Hide/Draft)'}
                      aria-label={tournament.isVisible === false ? 'Make tournament visible' : 'Hide tournament'}
                    >
                      {isTogglingVisibilityId === tournament.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-warning" />
                      ) : tournament.isVisible === false ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                    <Link
                      href={`/register?event=${tournament.id}`}
                      target="_blank"
                      className="p-2 rounded-sm text-fg-muted hover:text-accent hover:bg-surface-subtle transition-colors cursor-pointer"
                      title="Test public registration form"
                      aria-label="Test public registration form"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDeleteTournament(tournament.id, tournament.title)}
                      className="p-2 rounded-sm text-fg-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                      title="Delete tournament"
                      aria-label={`Delete ${tournament.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
