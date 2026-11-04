'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CalendarPlus, ChevronDown, ExternalLink, Download, Check } from 'lucide-react';
import { CalendarEventData, generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendarExport';
import { useUIStore } from '@/stores/useUIStore';

export interface AddToCalendarButtonProps {
  event: CalendarEventData;
  className?: string;
  size?: 'sm' | 'md';
}

export default function AddToCalendarButton({
  event,
  className = '',
  size = 'md',
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const showToast = useUIStore((s) => s.showToast);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleGoogleCalendar = () => {
    setIsOpen(false);
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast({
      type: 'success',
      title: 'Google Calendar Opened',
      message: `Opening "${event.title}" in Google Calendar.`,
    });
  };

  const handleIcsDownload = () => {
    setIsOpen(false);
    downloadIcsFile(event);
    showToast({
      type: 'success',
      title: 'Calendar File Downloaded',
      message: 'iCal (.ics) pass saved for Apple Calendar & Outlook.',
    });
  };

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1 text-[11px] gap-1.5'
    : 'px-3.5 py-1.5 text-xs gap-2';

  return (
    <div ref={menuRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Add ${event.title} to calendar`}
        data-testid="add-to-calendar-btn"
        className={`inline-flex items-center font-semibold rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#D4AF7C]/40 text-[#F5F5F5] hover:text-[#D4AF7C] transition-all cursor-pointer backdrop-blur-sm select-none active:scale-95 ${sizeClasses}`}
      >
        <CalendarPlus className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
        <span>Add to Calendar</span>
        <ChevronDown className={`w-3 h-3 text-[#A0A6B0] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Luxury Glassmorphic Popover Menu */}
      {isOpen && (
        <div
          data-testid="add-to-calendar-dropdown"
          className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-56 rounded-2xl bg-[#12161D]/95 border border-[#D4AF7C]/30 shadow-2xl backdrop-blur-xl p-1.5 z-50 animate-scale-up text-left"
        >
          <div className="px-3 py-1.5 border-b border-white/5 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A0A6B0] font-bold">
              Select Calendar
            </span>
          </div>

          {/* Option 1: Google Calendar */}
          <button
            type="button"
            onClick={handleGoogleCalendar}
            data-testid="cal-opt-google"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#F5F5F5] hover:text-[#0B0F14] hover:bg-gradient-to-r hover:from-[#D4AF7C] hover:to-[#E6C98A] transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 group-hover:bg-[#0B0F14]" />
              <span>Google Calendar</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#A0A6B0] group-hover:text-[#0B0F14]" />
          </button>

          {/* Option 2: Apple Calendar / Outlook / iCal */}
          <button
            type="button"
            onClick={handleIcsDownload}
            data-testid="cal-opt-ics"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#F5F5F5] hover:text-[#0B0F14] hover:bg-gradient-to-r hover:from-[#D4AF7C] hover:to-[#E6C98A] transition-all cursor-pointer group text-left mt-0.5"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:bg-[#0B0F14]" />
              <span>Apple / Outlook (.ics)</span>
            </div>
            <Download className="w-3.5 h-3.5 text-[#A0A6B0] group-hover:text-[#0B0F14]" />
          </button>
        </div>
      )}
    </div>
  );
}

