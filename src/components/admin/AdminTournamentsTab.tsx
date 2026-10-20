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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#10141C] border border-white/10">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#A0A6B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tournaments by title, venue..."
            value={tournamentSearch}
            onChange={(e) => setTournamentSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/50 focus:outline-none focus:border-[#D4AF7C]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['all', 'open', 'closed', 'upcoming', 'completed'].map(statusKey => (
            <button
              key={statusKey}
              onClick={() => setTournamentStatusFilter(statusKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                tournamentStatusFilter === statusKey
                  ? 'bg-[#D4AF7C]/20 border border-[#D4AF7C]/50 text-[#D4AF7C]'
                  : 'bg-[#080B0F] border border-white/10 text-[#A0A6B0] hover:text-[#F5F5F5]'
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
          <div className="col-span-full py-16 text-center text-[#A0A6B0] rounded-2xl bg-[#10141C] border border-white/10">
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
                className="p-6 rounded-3xl bg-[#10141C] border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col justify-between space-y-5 shadow-xl relative overflow-hidden group"
              >
                {/* Top status & quick actions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>REGISTRATION OPEN</span>
                        </span>
                      ) : isClosed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30">
                          <X className="w-3.5 h-3.5" />
                          <span>REGISTRATION CLOSED</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>COMPLETED (PAST EVENT)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="uppercase">{tournament.status}</span>
                        </span>
                      )}

                      {tournament.isFeatured && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#D4AF7C] bg-[#D4AF7C]/15 border border-[#D4AF7C]/40">
                          ★ Featured
                        </span>
                      )}

                      {tournament.isVisible === false ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/40 inline-flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden Draft</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 inline-flex items-center gap-1">
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                          isOpen
                            ? 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30'
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                        }`}
                        title={isOpen ? "Click to close registration immediately" : "Click to open registration immediately"}
                      >
                        {isUpdatingStatusId === tournament.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : isOpen ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-400" />
                            <span>Close Reg</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-red-400" />
                            <span>Open Reg</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Title & Format */}
                  <div>
                    <h3 className="font-['Montserrat',sans-serif] text-lg font-bold text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors">
                      {tournament.title}
                    </h3>
                    <p className="text-xs text-[#D4AF7C] font-semibold mt-0.5">
                      {tournament.format}
                    </p>
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#A0A6B0] pt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
                      <span>{tournament.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
                      <span>{tournament.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
                      <span className="truncate">{tournament.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
                      <span>{tournament.slots} ({tournament.registeredCount || 0} enrolled)</span>
                    </div>
                  </div>

                  {/* Form Fields summary badge */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[#A0A6B0]">
                      Form: {tournament.formConfig?.filter(f => f.enabled).length || 11} fields ({tournament.formConfig?.filter(f => f.required).length || 8} required)
                    </span>
                    {tournament.entryFee && (
                      <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[#A0A6B0]">
                        Fee: {tournament.entryFee}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Toolbar */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Edit Details */}
                    <button
                      onClick={() => onOpenEditModal(tournament, 'basics')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F5F5F5] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#D4AF7C]" />
                      <span>Edit All</span>
                    </button>

                    {/* Edit Registration Form Builder */}
                    <button
                      onClick={() => onOpenEditModal(tournament, 'form')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F5F5F5] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Form Fields</span>
                    </button>

                    {/* Move to Past / Publish Podium */}
                    {!isCompleted && (
                      <button
                        onClick={() => onOpenArchiveModal(tournament)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition cursor-pointer"
                        title="Conclude tournament, enter winners and move to Past Events"
                      >
                        <Award className="w-3.5 h-3.5 text-purple-400" />
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
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        tournament.isVisible === false
                          ? 'text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30'
                          : 'text-[#A0A6B0] hover:text-[#D4AF7C] hover:bg-white/5'
                      }`}
                      title={tournament.isVisible === false ? "Currently Hidden from public (Click to make Visible)" : "Currently Live on site (Click to Hide/Draft)"}
                    >
                      {isTogglingVisibilityId === tournament.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      ) : tournament.isVisible === false ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                    <Link
                      href={`/register?event=${tournament.id}`}
                      target="_blank"
                      className="p-2 rounded-xl text-[#A0A6B0] hover:text-[#D4AF7C] hover:bg-white/5 transition cursor-pointer"
                      title="Test public registration form"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => onDeleteTournament(tournament.id, tournament.title)}
                      className="p-2 rounded-xl text-[#A0A6B0] hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Delete tournament"
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
