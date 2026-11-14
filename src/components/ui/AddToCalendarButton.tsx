'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CalendarPlus, ChevronDown, ExternalLink, Download } from 'lucide-react';
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
    ? 'px-3 py-1.5 text-[11px] gap-1.5'
    : 'px-3.5 py-2 text-xs gap-2';

  return (
    <div ref={menuRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Add ${event.title} to calendar`}
        data-testid="add-to-calendar-btn"
        className={`inline-flex items-center font-semibold rounded-sm bg-surface-elevated hover:bg-surface-subtle border border-border hover:border-border-strong text-fg transition-colors cursor-pointer select-none btn-tactile ${sizeClasses}`}
      >
        <CalendarPlus className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
        <span>Add to Calendar</span>
        <ChevronDown className={`w-3 h-3 text-fg-muted transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {/* Swiss Dropdown Popover */}
      {isOpen && (
        <div
          data-testid="add-to-calendar-dropdown"
          style={{ boxShadow: 'var(--shadow-md)' }}
          className="absolute right-0 sm:right-auto sm:left-0 mt-1.5 w-56 rounded-sm bg-surface border border-border-strong p-1.5 z-50 animate-scale-up text-left"
        >
          <div className="px-2.5 py-1.5 border-b border-border mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted font-bold">
              Select Calendar
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleCalendar}
            data-testid="cal-opt-google"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xs text-xs font-semibold text-fg hover:bg-primary hover:text-on-primary transition-colors cursor-pointer group text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-xs bg-info group-hover:bg-on-primary" />
              <span>Google Calendar</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-fg-muted group-hover:text-on-primary" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleIcsDownload}
            data-testid="cal-opt-ics"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xs text-xs font-semibold text-fg hover:bg-primary hover:text-on-primary transition-colors cursor-pointer group text-left mt-0.5"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-xs bg-success group-hover:bg-on-primary" />
              <span>Apple / Outlook (.ics)</span>
            </div>
            <Download className="w-3.5 h-3.5 text-fg-muted group-hover:text-on-primary" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
