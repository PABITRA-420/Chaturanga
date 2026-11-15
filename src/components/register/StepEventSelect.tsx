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
  onNext,
}: StepEventSelectProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-mono font-bold uppercase tracking-widest text-accent flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" aria-hidden="true" />
            <span>Select Tournament Event ({events.length} Available)</span>
          </label>
          <span className="text-[11px] font-mono text-fg-muted hidden sm:inline">
            Click card to select
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {events.map((event: any) => {
            const isSelected = event.id === selectedEventId;
            const isClosingSoon = event.status === 'closing_soon';
            const isClosed = event.status === 'closed';

            const maxSlots = event.maxSlots || 64;
            const registered = event.registeredCount || 0;
            const capacityPercent = Math.min(100, Math.round((registered / maxSlots) * 100));
            const spotsLeft = Math.max(0, maxSlots - registered);

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event.id)}
                className={`relative p-4 rounded-sm border text-left cursor-pointer transition-colors flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-surface-elevated border-2 border-accent'
                    : 'bg-bg border-border hover:border-border-strong'
                }`}
              >
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between gap-1">
                    {isClosed ? (
                      <span className="text-[9px] font-mono font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-xs border border-danger/30">
                        CLOSED
                      </span>
                    ) : isClosingSoon ? (
                      <span className="text-[9px] font-mono font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-xs border border-warning/30">
                        CLOSING SOON
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold text-success bg-success/10 px-2 py-0.5 rounded-xs border border-success/30">
                        OPEN
                      </span>
                    )}

                    {isSelected ? (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-xs bg-accent text-on-accent">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-accent font-semibold">
                        {event.entryFee || 'Free'}
                      </span>
                    )}
                  </div>

                  <div className="font-heading font-bold text-xs text-fg group-hover:text-accent transition-colors leading-tight line-clamp-2">
                    {event.title}
                  </div>

                  <div className="space-y-1 text-[10px] font-mono text-fg-muted">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-accent shrink-0" aria-hidden="true" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent shrink-0" aria-hidden="true" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-fg-muted">
                      <span>Capacity</span>
                      <span className="text-fg font-semibold tabular-nums">
                        {registered}/{maxSlots} ({spotsLeft} left)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-border overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          capacityPercent >= 90
                            ? 'bg-danger'
                            : capacityPercent >= 70
                            ? 'bg-warning'
                            : 'bg-accent'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full mt-3 pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono">
                  <span className="text-fg-muted">Format:</span>
                  <span className="font-semibold text-fg truncate max-w-[120px] text-right">
                    {event.format?.split('•')[0] || event.format}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3.5 rounded-sm bg-surface-elevated border border-border flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-fg-muted font-body">
          <ShieldCheck className="w-4 h-4 text-accent" aria-hidden="true" />
          <span>Already registered for a tournament?</span>
        </div>
        <Link
          href="/my-ticket"
          className="text-accent hover:underline font-mono font-bold inline-flex items-center gap-1"
        >
          <span>Check pass &amp; seat status</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {onNext && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
          >
            <span>Continue to Credentials</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
