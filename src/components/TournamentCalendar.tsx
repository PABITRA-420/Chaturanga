"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Clock,
  MapPin,
  ArrowRight,
  Info,
} from 'lucide-react';

export interface CalendarEvent {
  id: string;
  title: string;
  dateStr: string;
  dateFormatted: string;
  year: number;
  month: number;
  day: number;
  time: string;
  venue: string;
  format: string;
  prizePool?: string;
  slots?: string;
  description: string;
  isUpcoming: boolean;
  category: 'Rapid' | 'Blitz' | 'Classical' | 'Swiss';
  badgeColor: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function TournamentCalendar() {
  const [eventsList, setEventsList] = useState<CalendarEvent[]>([]);
  const [, setLoading] = useState<boolean>(true);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    fetch('/api/tournaments')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tournaments)) {
          const mapped: CalendarEvent[] = data.tournaments.map((t: any) => {
            const d = new Date(t.targetDate || t.date);
            const isValid = !isNaN(d.getTime());
            const year = isValid ? d.getFullYear() : 2026;
            const month = isValid ? d.getMonth() : 10;
            const day = isValid ? d.getDate() : 1;
            const isPast = Boolean(t.isPast || t.status === 'completed');
            const formatLower = (t.format || '').toLowerCase();
            const category = formatLower.includes('blitz') ? 'Blitz' : formatLower.includes('rapid') ? 'Rapid' : 'Classical';

            return {
              id: t.id,
              title: t.title,
              dateStr: isValid ? d.toISOString().slice(0, 10) : '2026-11-07',
              dateFormatted: t.date || 'TBD',
              year,
              month,
              day,
              time: t.time || '10:00 AM – 05:00 PM',
              venue: t.venue || 'JGEC Campus',
              format: t.format || 'Swiss System',
              prizePool: t.prizePool || 'Trophies & Prizes',
              slots: t.slots || `${t.maxSlots || 100} Slots`,
              description: t.description || '',
              isUpcoming: !isPast,
              category,
              badgeColor: isPast
                ? 'bg-surface-elevated text-fg-muted border border-border'
                : 'bg-accent text-on-accent',
            };
          });
          setEventsList(mapped);
          if (mapped.length > 0) {
            const nextUpcoming = mapped.find(e => e.isUpcoming) || mapped[0];
            setSelectedEvent(nextUpcoming);
            setCurrentYear(nextUpcoming.year);
            setCurrentMonth(nextUpcoming.month);
            setSelectedDay(nextUpcoming.day);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleRealTodayJump = () => {
    const t = new Date();
    setCurrentYear(t.getFullYear());
    setCurrentMonth(t.getMonth());
    setSelectedDay(t.getDate());
    const match = eventsList.find(e => e.year === t.getFullYear() && e.month === t.getMonth() && e.day === t.getDate());
    setSelectedEvent(match || null);
  };

  const nearestEvent = useMemo(() => {
    return eventsList.find((e) => e.isUpcoming) || eventsList[0] || null;
  }, [eventsList]);

  const handleNextEventJump = () => {
    if (nearestEvent) {
      setCurrentYear(nearestEvent.year);
      setCurrentMonth(nearestEvent.month);
      setSelectedDay(nearestEvent.day);
      setSelectedEvent(nearestEvent);
    }
  };

  const jumpToEvent = (evt: CalendarEvent) => {
    setCurrentYear(evt.year);
    setCurrentMonth(evt.month);
    setSelectedDay(evt.day);
    setSelectedEvent(evt);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const filteredEvents = useMemo(() => {
    return eventsList.filter((e) => {
      if (filterMode === 'upcoming') return e.isUpcoming;
      if (filterMode === 'past') return !e.isUpcoming;
      return true;
    });
  }, [eventsList, filterMode]);

  const eventsInThisMonth = useMemo(() => {
    return filteredEvents.filter(
      (e) => e.year === currentYear && e.month === currentMonth
    );
  }, [filteredEvents, currentYear, currentMonth]);

  const getEventForDay = (day: number) => {
    return eventsInThisMonth.find((e) => e.day === day);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    const evt = getEventForDay(day);
    setSelectedEvent(evt || null);
  };

  const currentEventIndex = selectedEvent
    ? eventsList.findIndex(e => e.id === selectedEvent.id)
    : -1;

  const handleCycleEvent = (direction: 'prev' | 'next') => {
    if (eventsList.length === 0) return;
    let nextIdx = direction === 'next' ? currentEventIndex + 1 : currentEventIndex - 1;
    if (nextIdx < 0) nextIdx = eventsList.length - 1;
    if (nextIdx >= eventsList.length) nextIdx = 0;
    jumpToEvent(eventsList[nextIdx]);
  };

  return (
    <div className="w-full space-y-5 font-ui">
      
      {/* 1. TOOLBAR */}
      <div className="p-4 sm:p-5 rounded-md bg-surface border border-border flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRealTodayJump}
              className="min-h-[38px] px-3.5 py-1.5 rounded-sm bg-surface-elevated hover:bg-surface-subtle border border-border hover:border-border-strong text-xs font-semibold text-fg transition-colors cursor-pointer flex items-center justify-center"
              title="Jump to Current Month and Date"
              aria-label="Jump to Current Date"
            >
              Today
            </button>

            <button
              type="button"
              onClick={handleNextEventJump}
              className="min-h-[38px] px-3.5 py-1.5 rounded-sm bg-accent/15 hover:bg-accent/25 border border-accent/40 text-xs font-bold text-accent transition-colors cursor-pointer flex items-center justify-center"
              title="Jump to Nearest Upcoming Championship"
              aria-label="Jump to Nearest Upcoming Tournament"
            >
              Next Event
            </button>

            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-sm bg-surface-elevated hover:bg-surface-subtle border border-border hover:border-border-strong text-fg-muted hover:text-fg flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-sm bg-surface-elevated hover:bg-surface-subtle border border-border hover:border-border-strong text-fg-muted hover:text-fg flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div className="flex items-baseline gap-2">
            <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-fg tracking-tight">
              {MONTH_NAMES[currentMonth]}
            </h3>
            <span className="font-mono text-sm sm:text-base font-bold text-accent tabular-nums">
              {currentYear}
            </span>
          </div>
        </div>

        {/* Event Filters */}
        <div className="flex items-center gap-1 p-1 rounded-sm bg-surface-elevated border border-border text-xs w-full sm:w-auto overflow-x-auto whitespace-nowrap">
          {[
            { id: 'all', label: `All Events (${eventsList.length})` },
            { id: 'upcoming', label: `Upcoming (${eventsList.filter(e => e.isUpcoming).length})` },
            { id: 'past', label: `Past Archives (${eventsList.filter(e => !e.isUpcoming).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filterMode === tab.id
                  ? 'bg-primary text-on-primary'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* 2. QUICK ROSTER JUMP STRIP */}
      <div className="px-1 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2 whitespace-nowrap text-xs">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent mr-1 shrink-0">
            Roster:
          </span>

          {filteredEvents.length === 0 ? (
            <span className="text-xs text-fg-muted italic py-1">
              No tournaments scheduled matching this view
            </span>
          ) : (
            filteredEvents.map((evt) => {
              const isMatch = currentYear === evt.year && currentMonth === evt.month && selectedDay === evt.day;
              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => jumpToEvent(evt)}
                  className={`px-3 py-1.5 rounded-xs text-xs transition-colors cursor-pointer flex items-center gap-2 shrink-0 border ${
                    isMatch
                      ? 'bg-accent text-on-accent border-accent font-bold'
                      : evt.isUpcoming
                      ? 'bg-surface hover:bg-surface-elevated text-fg border-border hover:border-border-strong'
                      : 'bg-surface-elevated text-fg-muted border-border'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isMatch ? 'bg-on-accent' : evt.isUpcoming ? 'bg-success' : 'bg-fg-muted'}`} aria-hidden="true" />
                  <span className="font-mono">{MONTH_NAMES[evt.month].slice(0, 3)} {evt.day}, {evt.year}</span>
                  <span className="opacity-75 font-mono text-[11px]">({evt.title.split(' ')[0]})</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 3. WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: 7-Day Architectural Grid */}
        <div className="lg:col-span-7 rounded-md bg-surface border border-border p-4 sm:p-6 space-y-3">
          
          <div className="grid grid-cols-7 border-b border-border pb-2 text-center text-[11px] font-mono font-bold text-fg-muted tracking-wider select-none">
            {WEEKDAY_NAMES.map((dayName, idx) => (
              <div
                key={dayName}
                className={idx === 0 || idx === 6 ? 'text-accent' : ''}
              >
                {dayName}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-border rounded-sm overflow-hidden border border-border">
            
            {Array.from({ length: firstDayWeekday }).map((_, idx) => {
              const prevDayNum = daysInPrevMonth - firstDayWeekday + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="min-h-[52px] sm:min-h-[84px] p-1.5 sm:p-2 bg-bg text-fg-subtle opacity-50 text-xs flex flex-col justify-between select-none"
                >
                  <span className="font-mono text-[10px] sm:text-[11px]">{prevDayNum}</span>
                </div>
              );
            })}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const evt = getEventForDay(dayNum);
              const isSelected = selectedDay === dayNum;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => handleDaySelect(dayNum)}
                  aria-label={`${MONTH_NAMES[currentMonth]} ${dayNum}, ${currentYear}${evt ? ` - ${evt.title}` : ''}`}
                  className={`min-h-[52px] sm:min-h-[84px] p-1.5 sm:p-2 text-left text-xs flex flex-col justify-between transition-colors duration-150 cursor-pointer relative group ${
                    isSelected
                      ? 'bg-surface-elevated ring-2 ring-inset ring-accent z-10'
                      : 'bg-surface hover:bg-surface-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`w-6 h-6 rounded-xs flex items-center justify-center font-mono text-[11px] sm:text-xs font-bold ${
                        isSelected
                          ? 'bg-accent text-on-accent'
                          : evt
                          ? 'text-accent bg-accent/15 border border-accent/40'
                          : 'text-fg'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {evt && (
                      <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" title="Scheduled Tournament" aria-hidden="true" />
                    )}
                  </div>

                  {evt ? (
                    <div className="mt-1 space-y-0.5 w-full">
                      <div className="sm:hidden flex items-center justify-center pt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      </div>
                      <div className={`hidden sm:block px-1.5 py-0.5 rounded-xs text-[9px] sm:text-[10px] font-bold truncate ${evt.badgeColor}`}>
                        {evt.title.split(' ')[0]} {evt.title.split(' ')[1] || ''}
                      </div>
                      <div className="text-[9px] text-fg-muted hidden sm:block truncate font-mono">
                        {evt.time.split('–')[0].trim()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[9px] text-fg-subtle opacity-40 hidden sm:block truncate mt-auto font-mono">
                      Practice
                    </div>
                  )}
                </button>
              );
            })}

            {(() => {
              const totalOccupied = firstDayWeekday + daysInMonth;
              const remainingCells = (7 - (totalOccupied % 7)) % 7;
              return Array.from({ length: remainingCells }).map((_, idx) => (
                <div
                  key={`next-${idx}`}
                  className="min-h-[52px] sm:min-h-[84px] p-1.5 sm:p-2 bg-bg text-fg-subtle opacity-50 text-xs flex flex-col justify-between select-none"
                >
                  <span className="font-mono text-[10px] sm:text-[11px]">{idx + 1}</span>
                </div>
              ));
            })()}

          </div>

          <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between text-[11px] font-mono text-fg-muted gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-accent" aria-hidden="true" />
                <span>Tournament Date</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-success" aria-hidden="true" />
                <span>Registration Live</span>
              </span>
            </div>

            <span className="text-[10px] text-accent">
              FIDE Rules Apply
            </span>
          </div>

        </div>

        {/* Right: Event Inspector Card */}
        <div className="lg:col-span-5 rounded-md bg-surface border border-border-strong p-6 sm:p-7 space-y-6">
          {selectedEvent ? (
            <div className="space-y-6">
              
              <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold text-on-accent bg-accent uppercase tracking-wider">
                      <Trophy className="w-3 h-3" aria-hidden="true" />
                      <span>{selectedEvent.isUpcoming ? 'UPCOMING' : 'ARCHIVED'}</span>
                    </span>

                    <span className="text-[10px] font-mono font-semibold text-fg-muted px-2 py-1 rounded-xs bg-surface-elevated border border-border">
                      {selectedEvent.category}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-fg mt-2.5 leading-snug">
                    {selectedEvent.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCycleEvent('prev')}
                    className="w-8 h-8 rounded-xs bg-surface-elevated hover:bg-surface-subtle border border-border text-fg-muted hover:text-fg flex items-center justify-center transition-colors cursor-pointer"
                    title="Previous Tournament"
                    aria-label="Previous Tournament"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCycleEvent('next')}
                    className="w-8 h-8 rounded-xs bg-surface-elevated hover:bg-surface-subtle border border-border text-fg-muted hover:text-fg flex items-center justify-center transition-colors cursor-pointer"
                    title="Next Tournament"
                    aria-label="Next Tournament"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-sm bg-surface-elevated border border-border text-xs font-body">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-[10px] font-mono text-fg-muted block uppercase font-semibold">Date &amp; Time</span>
                    <span className="text-fg font-semibold block">{selectedEvent.dateFormatted}</span>
                    <span className="text-accent font-mono text-[11px]">{selectedEvent.time}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-border">
                  <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-[10px] font-mono text-fg-muted block uppercase font-semibold">Venue</span>
                    <span className="text-fg font-medium">{selectedEvent.venue}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-border">
                  <Trophy className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-[10px] font-mono text-fg-muted block uppercase font-semibold">Format &amp; Prize Pool</span>
                    <span className="text-fg font-medium block">{selectedEvent.format}</span>
                    {selectedEvent.prizePool && (
                      <span className="text-accent font-mono font-bold text-sm block mt-0.5">{selectedEvent.prizePool}</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-fg-muted leading-relaxed font-body">
                {selectedEvent.description}
              </p>

              <div className="pt-1">
                {selectedEvent.isUpcoming ? (
                  <Link
                    href={`/register?event=${selectedEvent.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xs font-ui text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    <span>Register For Championship</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link
                    href="/past-events"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xs font-ui text-xs font-semibold uppercase tracking-wider text-fg bg-surface-elevated hover:bg-surface-subtle border border-border hover:border-border-strong transition-colors cursor-pointer"
                  >
                    <span>View Certified Crosstable Standings</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>

            </div>
          ) : (
            <div className="py-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-sm bg-surface-elevated border border-border mx-auto flex items-center justify-center text-accent">
                <CalendarIcon className="w-6 h-6" aria-hidden="true" />
              </div>

              <div className="space-y-1">
                <h4 className="font-heading font-bold text-lg text-fg">
                  {MONTH_NAMES[currentMonth]} {selectedDay}, {currentYear}
                </h4>
                <p className="text-xs text-fg-muted max-w-xs mx-auto leading-relaxed">
                  No official championship round scheduled on this calendar date.
                </p>
              </div>

              <div className="p-4 rounded-sm bg-surface-elevated border border-border text-xs text-left space-y-1.5 text-fg-muted">
                <div className="text-accent font-mono font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Daily Practice Hours</span>
                </div>
                <p>Casual sparring, engine analysis, and blitz games run every weekday in SAC Room 204 (5:00 PM – 8:30 PM).</p>
              </div>

              {nearestEvent && (
                <button
                  type="button"
                  onClick={handleNextEventJump}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent hover:underline cursor-pointer pt-2"
                >
                  <span>
                    Jump to {nearestEvent.title} ({MONTH_NAMES[nearestEvent.month].slice(0, 3)} {String(nearestEvent.day).padStart(2, '0')}, {nearestEvent.year}) →
                  </span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
