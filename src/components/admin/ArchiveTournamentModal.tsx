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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-[#12161E] rounded-3xl border border-white/15 p-6 sm:p-8 space-y-5 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D4AF7C]" />
              <span>Conclude &amp; Publish Podium Results</span>
            </h3>
            <p className="text-xs text-[#A0A6B0] mt-0.5">
              Move &quot;{tournament.title}&quot; to Past Events with official winner standings.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-['Inter',sans-serif]">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#A0A6B0] font-semibold">Total Turnout / Participants</label>
              <input
                type="number"
                value={podiumData.totalParticipants}
                onChange={(e) => setPodiumData({ ...podiumData, totalParticipants: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#A0A6B0] font-semibold">Final Status</label>
              <div className="px-3 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                Completed &amp; Archived
              </div>
            </div>
          </div>

          {/* 1st Place Gold */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="font-bold text-[#D4AF7C] text-[11px] uppercase">1st Place • Champion (Gold)</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Champion Full Name"
                value={podiumData.goldName}
                onChange={(e) => setPodiumData({ ...podiumData, goldName: e.target.value })}
                className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Dept (e.g. CSE 4th Year)"
                value={podiumData.goldDept}
                onChange={(e) => setPodiumData({ ...podiumData, goldDept: e.target.value })}
                className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
              />
            </div>
          </div>

          {/* 2nd Place Silver */}
          <div className="p-3 rounded-2xl bg-neutral-400/10 border border-neutral-400/30 space-y-2">
            <div className="font-bold text-neutral-300 text-[11px] uppercase">2nd Place • Runner Up (Silver)</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Runner Up Full Name"
                value={podiumData.silverName}
                onChange={(e) => setPodiumData({ ...podiumData, silverName: e.target.value })}
                className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Dept (e.g. ECE 3rd Year)"
                value={podiumData.silverDept}
                onChange={(e) => setPodiumData({ ...podiumData, silverDept: e.target.value })}
                className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
              />
            </div>
          </div>

          {/* 3rd Place Bronze */}
          <div className="p-3 rounded-2xl bg-orange-700/10 border border-orange-700/30 space-y-2">
            <div className="font-bold text-orange-400 text-[11px] uppercase">3rd Place • 2nd Runner Up (Bronze)</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Third Place Full Name"
                value={podiumData.bronzeName}
                onChange={(e) => setPodiumData({ ...podiumData, bronzeName: e.target.value })}
                className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Dept (e.g. ME 2nd Year)"
                value={podiumData.bronzeDept}
                onChange={(e) => setPodiumData({ ...podiumData, bronzeDept: e.target.value })}
                className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#A0A6B0] font-semibold">Tournament Summary &amp; Memorable Games</label>
            <textarea
              rows={2}
              value={podiumData.summary}
              onChange={(e) => setPodiumData({ ...podiumData, summary: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-[#A0A6B0] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-full font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish to Past Events'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
