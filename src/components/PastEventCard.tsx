"use client";

import React, { useState } from 'react';
import { PastEvent } from '@/data/tournamentData';
import { Trophy, Calendar, Clock, MapPin, Award, Users, X, ArrowUpRight } from 'lucide-react';

interface PastEventCardProps {
  event: PastEvent;
}

export default function PastEventCard({ event }: PastEventCardProps) {
  const [showResultsModal, setShowResultsModal] = useState(false);

  return (
    <>
      {/* CARD */}
      <div className="relative group rounded-2xl bg-[#12161D] border border-white/10 hover:border-[#D4AF7C]/50 p-6 sm:p-7 transition-all duration-300 shadow-xl hover:shadow-[0_8px_30px_rgba(212,175,124,0.1)] flex flex-col justify-between overflow-hidden hover-lift">
        {/* Subtle accent corner glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#D4AF7C]/5 rounded-full blur-2xl group-hover:bg-[#D4AF7C]/20 transition-all duration-500 pointer-events-none" />

        <div className="space-y-4 relative z-10">
          {/* Top Meta: Format & Participants */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-[#D4AF7C]" />
              <span>{event.format}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] text-[#A0A6B0] font-medium bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5">
              <Users className="w-3.5 h-3.5 text-[#D4AF7C]" />
              <span>{event.totalParticipants} Players</span>
            </span>
          </div>

          {/* Event Title */}
          <div>
            <h3 className="font-['Montserrat',sans-serif] font-bold text-lg sm:text-xl text-[#F5F5F5] group-hover:text-[#F3E2B8] transition-colors leading-snug">
              {event.title}
            </h3>
          </div>

          {/* Venue & Time Grid */}
          <div className="space-y-2 py-1 text-xs text-[#A0A6B0] font-['Poppins',sans-serif]">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
              <span>{event.date}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
              <span className="text-[#F5F5F5]/90 font-medium">{event.venue}</span>
            </div>
          </div>

          {/* Podium Quick View with Distinct Olympic/FIDE Colors */}
          <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF7C] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Podium Champions</span>
              </span>
              <span className="text-[10px] text-[#A0A6B0]/70 font-mono">Score</span>
            </div>
            
            <div className="space-y-1.5">
              {event.podium.map((p, idx) => {
                const medalIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                const medalBorder = idx === 0 ? 'border-[#D4AF7C]/40 bg-[#D4AF7C]/10' : idx === 1 ? 'border-slate-400/30 bg-slate-400/5' : 'border-amber-700/30 bg-amber-700/5';
                const medalText = idx === 0 ? 'text-[#F3E2B8]' : idx === 1 ? 'text-slate-200' : 'text-amber-300';

                return (
                  <div key={idx} className={`flex items-center justify-between text-[11px] p-1.5 rounded-lg border ${medalBorder}`}>
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="text-sm select-none">{medalIcon}</span>
                      <strong className={`${medalText} font-semibold truncate`}>{p.name}</strong>
                      <span className="text-[#A0A6B0] text-[10px]">({p.dept})</span>
                    </span>
                    <span className="font-mono text-[#D4AF7C] font-bold ml-2 shrink-0">{p.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button: Show Result */}
        <div className="pt-4 mt-5 border-t border-white/10 flex items-center justify-between relative z-10">
          <span className="text-[11px] text-[#A0A6B0]/80">Official Scoreboard</span>
          
          <button
            type="button"
            onClick={() => setShowResultsModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 transition-all duration-200 shadow-md shadow-[#D4AF7C]/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>View Full Results</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FULL RESULTS MODAL */}
      {showResultsModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex items-start sm:items-center justify-center animate-in fade-in duration-200"
          onClick={() => setShowResultsModal(false)}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-gradient-to-b from-[#161B24] to-[#0F131A] rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/15 relative my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Fixed at top, never cut off) */}
            <div className="shrink-0 flex items-start justify-between pb-4 border-b border-white/10 gap-4">
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF7C]">
                  CERTIFIED TOURNAMENT RESULTS ARCHIVE
                </span>
                <h3 className="font-['Montserrat',sans-serif] font-black text-xl sm:text-2xl text-[#F5F5F5] mt-1">
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#A0A6B0] mt-1.5">
                  <span>{event.date}</span>
                  <span>•</span>
                  <span>{event.venue}</span>
                  <span>•</span>
                  <span className="text-[#D4AF7C] font-semibold">{event.format}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowResultsModal(false)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center transition cursor-pointer shrink-0 border border-white/10"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-5 my-4">
              {/* Tournament Highlights */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                <div className="text-[11px] font-bold text-[#D4AF7C] uppercase tracking-wider">
                  Tournament Summary &amp; Arbiter Verdict
                </div>
                <p className="text-xs text-[#A0A6B0] leading-relaxed font-['Poppins',sans-serif]">
                  {event.summary}
                </p>
              </div>

            {/* Podium Cards with Medals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {event.podium.map((p, idx) => {
                const medalBg = idx === 0 ? 'bg-[#D4AF7C]/15 border-[#D4AF7C]/50 shadow-md shadow-[#D4AF7C]/15' : idx === 1 ? 'bg-slate-400/10 border-slate-400/40' : 'bg-amber-700/10 border-amber-700/40';
                const medalIcon = idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place';

                return (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border text-center space-y-1.5 ${medalBg}`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF7C]">
                      {medalIcon}
                    </div>
                    <div className="font-['Montserrat',sans-serif] font-bold text-sm text-[#F5F5F5] truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-[#A0A6B0]">
                      {p.dept}
                    </div>
                    <div className="font-mono text-sm text-[#F3E2B8] font-bold pt-1">
                      {p.score}
                    </div>
                    <div className="text-[10px] text-[#D4AF7C]/90 font-medium">
                      {p.prize}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Standings Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] mb-3 flex items-center justify-between">
                <span>Final Crosstable & Standings</span>
                <span className="text-[10px] text-[#A0A6B0] font-normal font-mono">FIDE Swiss Tiebreaks</span>
              </h4>
              <div className="overflow-x-auto rounded-xl border border-white/10 shadow-inner">
                {/* Mobile Horizontal Scroll Hint */}
                <div className="sm:hidden flex items-center justify-between px-3 py-1.5 bg-black/60 border-b border-white/5 text-[10px] text-[#A0A6B0]">
                  <span className="text-[#D4AF7C] font-medium">← Swipe table to see Buchholz tiebreaks →</span>
                </div>
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-[#D4AF7C] font-semibold border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Player</th>
                      <th className="py-2.5 px-3">Roll / ID</th>
                      <th className="py-2.5 px-3">Dept</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Buchholz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {event.results.map((row) => (
                      <tr key={row.rank} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[#D4AF7C]">{row.rank}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#F5F5F5]">{row.name}</td>
                        <td className="py-2.5 px-3 text-[#A0A6B0] font-mono">{row.idNumber}</td>
                        <td className="py-2.5 px-3 text-[#A0A6B0]">{row.dept}</td>
                        <td className="py-2.5 px-3 font-bold text-[#F3E2B8] font-mono">{row.score}</td>
                        <td className="py-2.5 px-3 text-[#A0A6B0] font-mono">{row.tieBreak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="shrink-0 pt-4 mt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-[#A0A6B0]">
                Certified by JGEC Chaturanga Arbiter Council
              </span>
              <button
                type="button"
                onClick={() => setShowResultsModal(false)}
                className="px-5 py-2 rounded-full text-xs font-semibold text-[#F5F5F5] bg-white/10 hover:bg-white/20 transition cursor-pointer border border-white/10"
              >
                Close Standings
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
