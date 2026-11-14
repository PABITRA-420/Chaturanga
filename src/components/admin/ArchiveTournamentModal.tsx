"use client";

import React, { useState, useEffect } from 'react';
import { Tournament, TournamentPodiumItem } from '@/types/tournament';
import { Award } from 'lucide-react';

export interface ArchiveTournamentModalProps {
  isOpen: boolean;
  tournament: Tournament | null;
  onClose: () => void;
  onArchive: (tournamentId: string, archivePayload: {
    status: 'completed';
    isPast: boolean;
    totalParticipants: number;
    summary: string;
    podium: TournamentPodiumItem[];
  }) => Promise<void>;
}

export default function ArchiveTournamentModal({
  isOpen,
  tournament,
  onClose,
  onArchive
}: ArchiveTournamentModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [podiumData, setPodiumData] = useState({
    summary: '',
    totalParticipants: 64,
    goldName: '',
    goldDept: 'CSE',
    goldScore: '6.5 / 7',
    goldPrize: 'Champion Trophy + Cash',
    silverName: '',
    silverDept: 'ECE',
    silverScore: '6.0 / 7',
    silverPrize: 'Silver Shield',
    bronzeName: '',
    bronzeDept: 'ME',
    bronzeScore: '5.5 / 7',
    bronzePrize: 'Bronze Medal'
  });

  useEffect(() => {
    if (tournament) {
      setPodiumData({
        summary: `${tournament.title} successfully concluded with fierce collegiate competition across rounds.`,
        totalParticipants: tournament.registeredCount || 64,
        goldName: '',
        goldDept: 'CSE',
        goldScore: '6.5 / 7',
        goldPrize: 'Champion Trophy + Cash',
        silverName: '',
        silverDept: 'ECE',
        silverScore: '6.0 / 7',
        silverPrize: 'Silver Shield',
        bronzeName: '',
        bronzeDept: 'ME',
        bronzeScore: '5.5 / 7',
        bronzePrize: 'Bronze Medal'
      });
    }
  }, [tournament, isOpen]);

  if (!isOpen || !tournament) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const podium: TournamentPodiumItem[] = [
      {
        rank: '1st (Gold)',
        name: podiumData.goldName || 'Champion Player',
        dept: podiumData.goldDept,
        score: podiumData.goldScore,
        prize: podiumData.goldPrize
      },
      {
        rank: '2nd (Silver)',
        name: podiumData.silverName || 'Runner Up',
        dept: podiumData.silverDept,
        score: podiumData.silverScore,
        prize: podiumData.silverPrize
      },
      {
        rank: '3rd (Bronze)',
        name: podiumData.bronzeName || 'Third Place',
        dept: podiumData.bronzeDept,
        score: podiumData.bronzeScore,
        prize: podiumData.bronzePrize
      }
    ];

    try {
      await onArchive(tournament.id, {
        status: 'completed',
        isPast: true,
        totalParticipants: Number(podiumData.totalParticipants),
        summary: podiumData.summary,
        podium
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Conclude and Publish Podium Results"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface rounded-md border border-border-strong p-6 sm:p-8 space-y-5 shadow-md my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="font-heading text-base font-bold text-fg flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              <span>Conclude &amp; Publish Podium Results</span>
            </h3>
            <p className="text-xs text-fg-muted mt-0.5">
              Move &quot;{tournament.title}&quot; to Past Events with official winner standings.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="w-7 h-7 rounded-sm bg-surface-elevated hover:bg-surface-subtle text-fg-muted hover:text-fg flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-body">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-fg-muted font-semibold">Total Turnout / Participants</label>
              <input
                type="number"
                value={podiumData.totalParticipants}
                onChange={(e) => setPodiumData({ ...podiumData, totalParticipants: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg font-mono tabular-nums focus:border-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-fg-muted font-semibold">Final Status</label>
              <div className="px-3 py-2 rounded-sm bg-info/10 border border-info/30 text-info font-mono font-bold">
                Completed &amp; Archived
              </div>
            </div>
          </div>

          {/* 1st Place Gold */}
          <div className="p-3 rounded-sm bg-accent/10 border border-accent/30 space-y-2">
            <div className="font-mono font-bold text-accent text-[11px] uppercase">1st Place • Champion (Gold)</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Champion Full Name"
                value={podiumData.goldName}
                onChange={(e) => setPodiumData({ ...podiumData, goldName: e.target.value })}
                className="px-3 py-1.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle text-xs focus:border-accent"
              />
              <input
                type="text"
                placeholder="Dept (e.g. CSE 4th Year)"
                value={podiumData.goldDept}
                onChange={(e) => setPodiumData({ ...podiumData, goldDept: e.target.value })}
                className="px-3 py-1.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle text-xs focus:border-accent"
              />
            </div>
          </div>

          {/* 2nd Place Silver */}
          <div className="p-3 rounded-sm bg-surface-elevated border border-border-strong space-y-2">
            <div className="font-mono font-bold text-fg text-[11px] uppercase">2nd Place • Runner Up (Silver)</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Runner Up Full Name"
                value={podiumData.silverName}
                onChange={(e) => setPodiumData({ ...podiumData, silverName: e.target.value })}
                className="px-3 py-1.5 rounded-sm bg-surface border border-border text-fg placeholder:text-fg-subtle text-xs focus:border-accent"
              />
              <input
                type="text"
                placeholder="Dept (e.g. ECE 3rd Year)"
                value={podiumData.silverDept}
                onChange={(e) => setPodiumData({ ...podiumData, silverDept: e.target.value })}
                className="px-3 py-1.5 rounded-sm bg-surface border border-border text-fg placeholder:text-fg-subtle text-xs focus:border-accent"
              />
            </div>
          </div>

          {/* 3rd Place Bronze */}
          <div className="p-3 rounded-sm bg-warning/10 border border-warning/30 space-y-2">
            <div className="font-mono font-bold text-warning text-[11px] uppercase">3rd Place • 2nd Runner Up (Bronze)</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Third Place Full Name"
                value={podiumData.bronzeName}
                onChange={(e) => setPodiumData({ ...podiumData, bronzeName: e.target.value })}
                className="px-3 py-1.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle text-xs focus:border-accent"
              />
              <input
                type="text"
                placeholder="Dept (e.g. ME 2nd Year)"
                value={podiumData.bronzeDept}
                onChange={(e) => setPodiumData({ ...podiumData, bronzeDept: e.target.value })}
                className="px-3 py-1.5 rounded-sm bg-surface-elevated border border-border text-fg placeholder:text-fg-subtle text-xs focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-fg-muted font-semibold">Tournament Summary &amp; Memorable Games</label>
            <textarea
              rows={2}
              value={podiumData.summary}
              onChange={(e) => setPodiumData({ ...podiumData, summary: e.target.value })}
              className="w-full px-3 py-2 rounded-sm bg-surface-elevated border border-border text-fg focus:border-accent"
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-sm text-fg-muted hover:text-fg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-sm font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish to Past Events'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
