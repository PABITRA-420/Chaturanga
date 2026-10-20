"use client";

import React from 'react';
import { Trophy, Calendar, MapPin, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export interface StepEventSelectProps {
  events: any[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  onNext?: () => void;
}

export default function StepEventSelect({
  events,
  selectedEventId,
  onSelectEvent,
  onNext
}: StepEventSelectProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-widest text-[#D4AF7C] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#D4AF7C]" />
            <span>Select Tournament Event ({events.length} Available)</span>
          </label>
          <span className="text-[11px] text-[#A0A6B0] hidden sm:inline">
            Click any card to load that tournament&apos;s registration form
          </span>
        </div>

        {/* Responsive Multi-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {events.map((event: any) => {
            const isSelected = event.id === selectedEventId;
            const isOpen = event.status === 'open';
            const isClosingSoon = event.status === 'closing_soon';
            const isClosed = event.status === 'closed';

            const maxSlots = event.maxSlots || 64;
            const registered = event.registeredCount || 0;
            const capacityPercent = Math.min(100, Math.round((registered / maxSlots) * 100));
            const spotsLeft = Math.max(0, maxSlots - registered);

            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event.id)}
                className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#D4AF7C]/25 via-[#181D26] to-[#12161D] border-[#D4AF7C] shadow-xl shadow-[#D4AF7C]/20 scale-[1.02] ring-1 ring-[#D4AF7C]'
                    : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                }`}
              >
                <div className="space-y-2">
                  {/* Top Chips */}
                  <div className="flex items-center justify-between gap-1">
                    {isClosed ? (
                      <span className="text-[9px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
                        <span>● CLOSED</span>
                      </span>
                    ) : isClosingSoon ? (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>CLOSING SOON</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>OPEN</span>
                      </span>
                    )}

                    {isSelected ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF7C] text-[#0B0F14] shadow-sm">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-[#D4AF7C] font-semibold">
                        {event.entryFee || 'Free'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="font-['Montserrat',sans-serif] font-bold text-xs text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors leading-tight line-clamp-2">
                    {event.title}
                  </div>

                  {/* Schedule & Venue Coordinates */}
                  <div className="space-y-1 text-[10px] text-[#A0A6B0]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#D4AF7C] shrink-0" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4AF7C] shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  {/* Live Capacity Bar */}
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-[#A0A6B0]">
                      <span>Capacity</span>
                      <span className="font-mono text-[#F5F5F5] font-semibold">
                        {registered}/{maxSlots} ({spotsLeft} left)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          capacityPercent >= 90
                            ? 'bg-red-400'
                            : capacityPercent >= 70
                            ? 'bg-amber-400'
                            : 'bg-[#D4AF7C]'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Prize / Fee footer */}
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-[#A0A6B0]">Format:</span>
                  <span className="font-semibold text-[#F5F5F5] truncate max-w-[120px] text-right">
                    {event.format?.split('•')[0] || event.format}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Link to Pass Verification */}
      <div className="p-3.5 rounded-2xl bg-[#12161D] border border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#A0A6B0]">
          <ShieldCheck className="w-4 h-4 text-[#D4AF7C]" />
          <span>Already registered for a tournament?</span>
        </div>
        <Link 
          href="/my-ticket"
          className="text-[#D4AF7C] hover:underline font-bold inline-flex items-center gap-1"
        >
          <span>Check pass &amp; seat status</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {onNext && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition shadow-lg shadow-[#D4AF7C]/20 cursor-pointer"
          >
            <span>Continue to Credentials</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
