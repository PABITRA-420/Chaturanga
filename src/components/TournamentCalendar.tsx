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
  Users, 
  ArrowRight, 
  Sparkles,
  Zap,
  CheckCircle2,
  Filter,
  BookmarkCheck,
  ChevronDown,
  Info
} from 'lucide-react';

export interface CalendarEvent {
  id: string;
  title: string;
  dateStr: string; // "2026-11-07"
  dateFormatted: string; // "Saturday, November 7, 2026"
  year: number;
  month: number; // 0-11
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
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function TournamentCalendar() {
  const [eventsList, setEventsList] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Navigation State
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'upcoming' | 'past'>('all');

  // Fetch live tournaments from Supabase / API
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
              badgeColor: isPast ? 'bg-slate-300 text-[#0B0F14]' : category === 'Rapid' ? 'bg-[#D4AF7C] text-[#0B0F14]' : 'bg-amber-400 text-[#0B0F14]'
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

  // Month navigation
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

  const handleNextEventJump = () => {
    const nearest = eventsList.find(e => e.isUpcoming) || eventsList[0];
    if (nearest) {
      setCurrentYear(nearest.year);
      setCurrentMonth(nearest.month);
      setSelectedDay(nearest.day);
      setSelectedEvent(nearest);
    }
  };

  const jumpToEvent = (evt: CalendarEvent) => {
    setCurrentYear(evt.year);
    setCurrentMonth(evt.month);
    setSelectedDay(evt.day);
    setSelectedEvent(evt);
  };

  // Days in month calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Filtered event pool
  const filteredEvents = useMemo(() => {
    return eventsList.filter((e) => {
      if (filterMode === 'upcoming') return e.isUpcoming;
      if (filterMode === 'past') return !e.isUpcoming;
      return true;
    });
  }, [eventsList, filterMode]);

  // Events occurring in current viewed month
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

  // Find next/prev event for quick arrows in inspector
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
    <div className="w-full space-y-5 font-['Inter',sans-serif]">
      
      {/* 1. PROFESSIONAL GOOGLE CALENDAR TOOLBAR */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#12161D] border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Month Title & Navigation Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRealTodayJump}
              className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 hover:border-[#D4AF7C]/40 text-xs font-semibold text-[#F5F5F5] transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center"
              title="Jump to Current Month and Date"
              aria-label="Jump to Current Date"
            >
              Today
            </button>

            <button
              type="button"
              onClick={handleNextEventJump}
              className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 sm:py-1.5 rounded-xl bg-[#D4AF7C]/15 hover:bg-[#D4AF7C]/25 border border-[#D4AF7C]/30 text-xs font-bold text-[#D4AF7C] transition cursor-pointer active:scale-95 shadow-sm flex items-center justify-center"
              title="Jump to Nearest Upcoming Championship"
              aria-label="Jump to Nearest Upcoming Tournament"
            >
              Next Event
            </button>

            <button
              type="button"
              onClick={handlePrevMonth}
              className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-9 sm:h-9 sm:min-w-[36px] sm:min-h-[36px] rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center transition cursor-pointer active:scale-95"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-9 sm:h-9 sm:min-w-[36px] sm:min-h-[36px] rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center transition cursor-pointer active:scale-95"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

          {/* Month / Year Display */}
          <div className="flex items-baseline gap-2">
            <h3 className="font-['Montserrat',sans-serif] font-black text-xl sm:text-2xl text-[#F5F5F5] tracking-tight">
              {MONTH_NAMES[currentMonth]}
            </h3>
            <span className="font-mono text-sm sm:text-base font-bold text-[#D4AF7C]">
              {currentYear}
            </span>
          </div>
        </div>

        {/* Right: Event Filters (All / Upcoming / Past) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs w-full sm:w-auto overflow-x-auto scrollbar-none whitespace-nowrap">
          {[
            { id: 'all', label: `All Events (${eventsList.length})` },
            { id: 'upcoming', label: `Upcoming (${eventsList.filter(e => e.isUpcoming).length})` },
            { id: 'past', label: `Past Archives (${eventsList.filter(e => !e.isUpcoming).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                filterMode === tab.id
                  ? 'bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] text-[#0B0F14] font-bold shadow-sm'
                  : 'text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* 2. FAST JUMP HORIZONTAL STRIP: ALL UPCOMING & PAST TOURNAMENTS */}
      <div className="px-1 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2 whitespace-nowrap text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF7C] flex items-center gap-1.5 mr-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tournament Roster:</span>
          </span>

          {filteredEvents.length === 0 ? (
            <span className="text-xs text-[#A0A6B0] italic py-1">
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
                  className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer flex items-center gap-2 shrink-0 ${
                    isMatch
                      ? 'bg-[#D4AF7C] text-[#0B0F14] font-bold shadow-md shadow-[#D4AF7C]/30 scale-[1.02]'
                      : evt.isUpcoming
                      ? 'bg-white/5 hover:bg-white/15 text-[#F5F5F5] border border-white/10 hover:border-[#D4AF7C]/40'
                      : 'bg-black/40 hover:bg-white/5 text-[#A0A6B0] border border-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${evt.isUpcoming ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  <span>{MONTH_NAMES[evt.month].slice(0, 3)} {evt.day}, {evt.year}</span>
                  <span className="opacity-70 font-mono text-[11px]">({evt.title.split(' ')[0]})</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: GOOGLE CALENDAR GRID + EVENT INSPECTOR PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Google Calendar High-Precision 7-Day Month Grid (7 Columns) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#12161D] border border-white/10 p-4 sm:p-6 shadow-2xl space-y-3">
          
          {/* Weekday Column Headers (SUN - SAT) */}
          <div className="grid grid-cols-7 border-b border-white/10 pb-2 text-center text-[11px] font-bold text-[#A0A6B0] tracking-wider select-none">
            {WEEKDAY_NAMES.map((dayName, idx) => (
              <div 
                key={dayName}
                className={idx === 0 || idx === 6 ? 'text-[#D4AF7C]' : ''}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Month Cells Grid (Google Calendar Matrix) */}
          <div className="grid grid-cols-7 gap-[1px] bg-white/5 rounded-2xl overflow-hidden border border-white/10">
            
            {/* 1. Leading Inactive Days from Previous Month */}
            {Array.from({ length: firstDayWeekday }).map((_, idx) => {
              const prevDayNum = daysInPrevMonth - firstDayWeekday + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="min-h-[52px] sm:min-h-[88px] p-1.5 sm:p-2 bg-[#0B0F14]/70 text-[#A0A6B0]/25 text-xs flex flex-col justify-between select-none cursor-default"
                >
                  <span className="font-mono text-[10px] sm:text-[11px]">{prevDayNum}</span>
                </div>
              );
            })}

            {/* 2. Active Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const evt = getEventForDay(dayNum);
              const isSelected = selectedDay === dayNum;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => handleDaySelect(dayNum)}
                  className={`min-h-[52px] sm:min-h-[88px] p-1 sm:p-2 bg-[#0E1218] hover:bg-[#161B24] text-xs flex flex-col justify-between transition-colors duration-150 cursor-pointer relative group select-none ${
                    isSelected
                      ? 'ring-2 ring-inset ring-[#D4AF7C] bg-[#161B24] z-10'
                      : ''
                  }`}
                >
                  {/* Day Number Header / Google Calendar Date Bubble */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-mono text-[11px] sm:text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/30'
                          : evt
                          ? 'text-[#F3E2B8] bg-[#D4AF7C]/15 border border-[#D4AF7C]/40'
                          : 'text-[#F5F5F5]'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {evt && (
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping shrink-0" title="Live / Scheduled Tournament" />
                    )}
                  </div>

                  {/* Google Calendar Event Pill */}
                  {evt ? (
                    <div className="mt-1 space-y-1">
                      {/* Mobile compact glowing dot indicator */}
                      <div className="sm:hidden flex items-center justify-center pt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF7C] shadow-[0_0_8px_#D4AF7C]" />
                      </div>
                      {/* Tablet / Desktop text pill */}
                      <div className={`hidden sm:block px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold truncate shadow-sm ${evt.badgeColor}`}>
                        {evt.title.split(' ')[0]} {evt.title.split(' ')[1] || ''}
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-[#A0A6B0] hidden sm:block truncate font-mono">
                        {evt.time.split('–')[0].trim()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[9px] text-white/10 hidden sm:block truncate mt-auto">
                      Practice
                    </div>
                  )}
                </div>
              );
            })}

            {/* 3. Trailing Inactive Days from Next Month */}
            {(() => {
              const totalOccupied = firstDayWeekday + daysInMonth;
              const remainingCells = (7 - (totalOccupied % 7)) % 7;
              return Array.from({ length: remainingCells }).map((_, idx) => (
                <div
                  key={`next-${idx}`}
                  className="min-h-[52px] sm:min-h-[88px] p-1.5 sm:p-2 bg-[#0B0F14]/70 text-[#A0A6B0]/25 text-xs flex flex-col justify-between select-none cursor-default"
                >
                  <span className="font-mono text-[10px] sm:text-[11px]">{idx + 1}</span>
                </div>
              ));
            })()}

          </div>

          {/* Bottom Footnote / Google Calendar Legend */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#A0A6B0] gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D4AF7C]" />
                <span>Tournament Date</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Registration Live</span>
              </span>
            </div>

            <span className="font-mono text-[10px] text-[#D4AF7C]">
              FIDE Tournament Rules Apply
            </span>
          </div>

        </div>

        {/* Right: Google Calendar Event Inspector Card (5 Columns) */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-[#181D26] to-[#0F131A] border-2 border-[#D4AF7C]/40 p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
          
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF7C]/10 rounded-full blur-3xl pointer-events-none" />

          {selectedEvent ? (
            <div className="space-y-6 relative z-10">
              
              {/* Event Inspector Header */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] uppercase tracking-wider shadow-sm">
                      <Trophy className="w-3 h-3" />
                      <span>{selectedEvent.isUpcoming ? 'UPCOMING TOURNAMENT' : 'CONCLUDED ARCHIVE'}</span>
                    </span>

                    <span className="text-[10px] font-semibold text-[#A0A6B0] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {selectedEvent.category} Time Control
                    </span>
                  </div>

                  <h3 className="font-['Montserrat',sans-serif] font-black text-xl sm:text-2xl text-[#F5F5F5] mt-2.5 leading-snug">
                    {selectedEvent.title}
                  </h3>
                </div>

                {/* Next / Prev Event Mini Switcher */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCycleEvent('prev')}
                    className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-8 sm:h-8 sm:min-w-[32px] sm:min-h-[32px] rounded-lg bg-white/5 hover:bg-white/15 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center transition cursor-pointer active:scale-95"
                    title="Previous Tournament"
                    aria-label="Previous Tournament"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCycleEvent('next')}
                    className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-8 sm:h-8 sm:min-w-[32px] sm:min-h-[32px] rounded-lg bg-white/5 hover:bg-white/15 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center transition cursor-pointer active:scale-95"
                    title="Next Tournament"
                    aria-label="Next Tournament"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>

              {/* Event Coordinates (Google Calendar Format) */}
              <div className="space-y-3.5 p-4 rounded-2xl bg-black/50 border border-white/10 text-xs font-['Poppins',sans-serif]">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#D4AF7C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block uppercase font-medium">Match Date &amp; Reporting Time</span>
                    <span className="text-[#F5F5F5] font-semibold block">{selectedEvent.dateFormatted}</span>
                    <span className="text-[#D4AF7C] font-mono text-[11px]">{selectedEvent.time}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                  <MapPin className="w-4 h-4 text-[#D4AF7C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block uppercase font-medium">Playing Hall / Venue</span>
                    <span className="text-[#F5F5F5] font-medium">{selectedEvent.venue}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                  <Trophy className="w-4 h-4 text-[#D4AF7C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block uppercase font-medium">Tournament Format &amp; Clock</span>
                    <span className="text-[#F5F5F5] font-medium">{selectedEvent.format}</span>
                  </div>
                </div>

                {selectedEvent.prizePool && (
                  <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                    <Sparkles className="w-4 h-4 text-[#D4AF7C] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-[#A0A6B0] block uppercase font-medium">Prize Pool &amp; Slots</span>
                      <span className="text-[#F3E2B8] font-mono font-bold text-sm block">{selectedEvent.prizePool}</span>
                      {selectedEvent.slots && (
                        <span className="text-[11px] text-[#A0A6B0]">{selectedEvent.slots}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#A0A6B0] leading-relaxed font-['Poppins',sans-serif]">
                {selectedEvent.description}
              </p>

              {/* Action Button */}
              <div className="pt-2">
                {selectedEvent.isUpcoming ? (
                  <Link
                    href={`/register?event=${selectedEvent.id}`}
                    className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full font-['Inter',sans-serif] text-sm font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] via-[#F3E2B8] to-[#D4AF7C] hover:brightness-110 transition-all duration-300 shadow-[0_4px_25px_rgba(212,175,124,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Register For This Championship</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/past-events"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full font-['Inter',sans-serif] text-xs font-semibold text-[#F5F5F5] bg-white/10 hover:bg-white/20 border border-white/15 transition cursor-pointer"
                  >
                    <span>View Certified Crosstable Standings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

            </div>
          ) : (
            /* Empty Selected Day State */
            <div className="py-10 text-center space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-[#A0A6B0]">
                <CalendarIcon className="w-7 h-7 text-[#D4AF7C]" />
              </div>

              <div className="space-y-1">
                <h4 className="font-['Montserrat',sans-serif] font-bold text-lg text-[#F5F5F5]">
                  {MONTH_NAMES[currentMonth]} {selectedDay}, {currentYear}
                </h4>
                <p className="text-xs text-[#A0A6B0] max-w-xs mx-auto leading-relaxed">
                  No official collegiate championship round scheduled on this calendar date.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-left space-y-2 text-[#A0A6B0]">
                <div className="text-[#D4AF7C] font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Club Activity &amp; Practice</span>
                </div>
                <p>Casual practice matches, engine analysis, and blitz arenas run every weekday in SAC Room 204 from 5:00 PM – 8:30 PM.</p>
              </div>

              <button
                type="button"
                onClick={handleNextEventJump}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF7C] hover:underline cursor-pointer pt-2"
              >
                <span>Jump to Flagship Championship (Nov 07, 2026) &rarr;</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
