"use client";

import React, { useState, useEffect } from 'react';
import { PastEvent } from '@/data/tournamentData';
import { Trophy, Calendar, Clock, MapPin, Award, Users, X, ArrowUpRight, Eye, Medal } from 'lucide-react';
import { PgnViewer } from '@/components/chess/PgnViewer';
import { SEED_GAMES } from '@/lib/pgnParser';
import SpotlightCard from '@/components/ui/SpotlightCard';

interface PastEventCardProps {
  event: PastEvent;
}

export default function PastEventCard({ event }: PastEventCardProps) {
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showPgnModal, setShowPgnModal] = useState(false);

  const featuredGame =
    SEED_GAMES.find(g => g.tournament_id === event.id) ||
    SEED_GAMES[0];

  useEffect(() => {
    if (!showResultsModal && !showPgnModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowResultsModal(false);
        setShowPgnModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showResultsModal, showPgnModal]);

  return (
    <>
      <SpotlightCard className="rounded-md bg-surface border border-border hover:border-border-strong p-6 sm:p-7 flex flex-col justify-between overflow-hidden h-full group">
        <div className="space-y-4 relative z-10">
          {/* Top Meta */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-mono font-semibold text-accent bg-surface-elevated border border-border">
              <Trophy className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>{event.format}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] text-fg-muted font-mono bg-surface-elevated px-2.5 py-1 rounded-xs border border-border">
              <Users className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>{event.totalParticipants} Players</span>
            </span>
          </div>

          {/* Event Title */}
          <div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-fg group-hover:text-accent transition-colors leading-snug">
              {event.title}
            </h3>
          </div>

          {/* Venue & Time */}
          <div className="space-y-2 py-1 text-xs text-fg-muted font-body">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
              <span>{event.date}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
              <span className="text-fg font-medium">{event.venue}</span>
            </div>
          </div>

          {/* Podium Standings Preview */}
          <div className="p-3.5 rounded-sm bg-surface-elevated border border-border space-y-2 text-xs">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent flex items-center justify-between border-b border-border pb-1.5">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Podium Champions</span>
              </span>
              <span className="text-[10px] text-fg-muted">Score</span>
            </div>
            
            <div className="space-y-1.5">
              {event.podium.map((p, idx) => {
                const rankCode = `0${idx + 1}`;
                const rowStyle =
                  idx === 0
                    ? 'border-accent/50 bg-accent/10'
                    : 'border-border bg-surface';

                return (
                  <div key={idx} className={`flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-xs border ${rowStyle}`}>
                    <span className="flex items-center gap-2 truncate">
                      <span className={`font-mono font-bold text-[10px] ${idx === 0 ? 'text-accent' : 'text-fg-muted'}`}>
                        #{rankCode}
                      </span>
                      <Medal className={`w-3.5 h-3.5 shrink-0 ${idx === 0 ? 'text-accent' : idx === 1 ? 'text-fg-muted' : 'text-warning'}`} aria-hidden="true" />
                      <strong className="text-fg font-semibold truncate">{p.name}</strong>
                    </span>
                    <span className="font-mono text-accent font-bold ml-2 shrink-0 tabular-nums">{p.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-5 border-t border-border flex items-center justify-between relative z-10 gap-2">
          <button
            type="button"
            onClick={() => setShowPgnModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xs text-xs font-mono font-semibold text-fg bg-surface-elevated border border-border hover:border-border-strong transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Replay PGN</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowResultsModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
          >
            <span>Full Results</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </SpotlightCard>

      {/* FULL RESULTS MODAL */}
      {showResultsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="past-results-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-scrim/75 backdrop-blur-xs p-4 sm:p-6 flex items-start sm:items-center justify-center animate-fade-in"
          onClick={() => setShowResultsModal(false)}
        >
          <div
            style={{ boxShadow: 'var(--shadow-md)' }}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface rounded-md p-5 sm:p-7 border border-border-strong relative my-auto overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-start justify-between pb-4 border-b border-border gap-4">
              <div>
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent">
                  CERTIFIED TOURNAMENT RESULTS ARCHIVE
                </span>
                <h3 id="past-results-title" className="font-heading font-extrabold text-xl sm:text-2xl text-fg mt-1">
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-fg-muted font-mono mt-1.5">
                  <span>{event.date}</span>
                  <span>/</span>
                  <span>{event.venue}</span>
                  <span>/</span>
                  <span className="text-accent font-semibold">{event.format}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowResultsModal(false)}
                className="min-w-[40px] min-h-[40px] rounded-sm bg-surface-elevated hover:bg-surface-subtle text-fg-muted hover:text-fg flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-border hover:border-border-strong"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-5 my-4">
              <div className="p-4 rounded-sm bg-surface-elevated border border-border space-y-1.5">
                <div className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">
                  Tournament Summary &amp; Arbiter Verdict
                </div>
                <p className="text-xs text-fg-muted leading-relaxed font-body">
                  {event.summary}
                </p>
                <div className="pt-1.5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResultsModal(false);
                      setShowPgnModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline font-medium cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Interactive PGN Replay for Championship Game →</span>
                  </button>
                </div>
              </div>

              {/* Podium Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {event.podium.map((p, idx) => {
                  const medalCard =
                    idx === 0
                      ? 'bg-accent/10 border-accent'
                      : 'bg-surface-elevated border-border';
                  const rankTitle = idx === 0 ? '01 • 1st Place' : idx === 1 ? '02 • 2nd Place' : '03 • 3rd Place';

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-sm border text-center space-y-1.5 ${medalCard}`}
                    >
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent">
                        {rankTitle}
                      </div>
                      <div className="font-heading font-bold text-sm text-fg truncate">
                        {p.name}
                      </div>
                      <div className="font-mono text-sm text-fg font-bold pt-1 tabular-nums">
                        {p.score}
                      </div>
                      <div className="text-[10px] font-mono text-accent font-medium">
                        {p.prize}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Standings Table */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-fg mb-3 flex items-center justify-between">
                  <span>Final Crosstable &amp; Standings</span>
                  <span className="text-[10px] text-fg-muted font-normal">FIDE Swiss Tiebreaks</span>
                </h4>
                <div className="overflow-x-auto rounded-sm border border-border">
                  <div className="sm:hidden flex items-center justify-between px-3 py-1.5 bg-surface-elevated border-b border-border text-[10px] text-fg-muted font-mono">
                    <span className="text-accent font-medium">← Swipe table to see Buchholz tiebreaks →</span>
                  </div>
                  <table className="w-full min-w-[500px] text-left text-xs">
                    <thead className="bg-surface-elevated text-[11px] font-mono uppercase tracking-wider text-accent font-semibold border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Player</th>
                        <th className="py-2.5 px-3">Score</th>
                        <th className="py-2.5 px-3">Buchholz</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {event.results.map((row) => (
                        <tr key={row.rank} className="hover:bg-surface-elevated transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-accent">{row.rank}</td>
                          <td className="py-2.5 px-3 font-semibold text-fg">{row.name}</td>
                          <td className="py-2.5 px-3 font-bold text-fg font-mono tabular-nums">{row.score}</td>
                          <td className="py-2.5 px-3 text-fg-muted font-mono tabular-nums">{row.tieBreak}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 pt-4 mt-2 border-t border-border flex items-center justify-between">
              <span className="text-[11px] font-mono text-fg-muted">
                Certified by JGEC Chaturanga Arbiter Council
              </span>
              <button
                type="button"
                onClick={() => setShowResultsModal(false)}
                className="px-4 py-2 rounded-xs text-xs font-semibold text-fg bg-surface-elevated hover:bg-surface-subtle transition-colors cursor-pointer border border-border"
              >
                Close Standings
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PGN REPLAY MODAL */}
      {showPgnModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Championship Game Replay"
          className="fixed inset-0 z-50 overflow-y-auto bg-scrim/75 backdrop-blur-xs p-3 sm:p-6 flex items-start sm:items-center justify-center animate-fade-in"
          onClick={() => setShowPgnModal(false)}
        >
          <div
            style={{ boxShadow: 'var(--shadow-md)' }}
            className="w-full max-w-4xl bg-surface rounded-md p-4 sm:p-6 border border-border-strong relative my-auto overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                Championship Game Archive • {event.title}
              </span>
              <button
                type="button"
                onClick={() => setShowPgnModal(false)}
                className="w-9 h-9 rounded-sm bg-surface-elevated hover:bg-surface-subtle text-fg-muted hover:text-fg flex items-center justify-center transition-colors border border-border cursor-pointer"
                aria-label="Close PGN viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <PgnViewer
              pgn={featuredGame.pgn}
              title={`${event.title} • Featured Game`}
            />
          </div>
        </div>
      )}
    </>
  );
}
