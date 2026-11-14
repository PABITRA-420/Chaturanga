'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, X, ArrowUpRight, Bell } from 'lucide-react';
import { ClubAnnouncement, CLUB_ANNOUNCEMENTS } from '@/data/announcementsData';
import { Skeleton } from '@/components/ui/Skeleton';

function getCategoryBadgeClasses(category?: ClubAnnouncement['category']) {
  switch (category) {
    case 'TOURNAMENT':
      return 'bg-success/10 text-success border-success/30';
    case 'PRACTICE':
      return 'bg-info/10 text-info border-info/30';
    case 'SELECTION':
      return 'bg-warning/10 text-warning border-warning/30';
    default:
      return 'bg-accent/10 text-accent border-border';
  }
}

export default function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>(() => CLUB_ANNOUNCEMENTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ClubAnnouncement | null>(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('chaturanga_announcements');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAnnouncements(parsed);
          setLoading(false);
        }
      }
    } catch {}

    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements);
          try {
            sessionStorage.setItem('chaturanga_announcements', JSON.stringify(data.announcements));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAnnouncement) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedAnnouncement(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedAnnouncement]);

  return (
    <section id="announcements" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="p-6 sm:p-8 rounded-md bg-surface border border-border relative overflow-hidden">
        
        {/* Swiss Hairline Top Rule */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent" aria-hidden="true" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border mb-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-sm bg-surface-elevated border border-border flex items-center justify-center text-accent shrink-0 mt-0.5">
              <Bell className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent block">
                01 / COLLEGE NOTICE BOARD
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-fg mt-0.5">
                Official Club Announcements
              </h2>
            </div>
          </div>

          <div className="text-xs font-mono text-fg-muted">
            Updated weekly by Chief Arbiter &amp; Council
          </div>
        </div>

        {/* Announcements Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="announcements-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-sm bg-surface-elevated border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-10 w-full" />
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 rounded-sm bg-surface-elevated border border-border text-center space-y-2">
            <p className="text-sm font-semibold text-fg">No active club announcements at this time</p>
            <p className="text-xs text-fg-muted">
              Official tournament announcements, practice schedules, and arbiter notices will be pinned here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.map((ann) => (
              <button
                key={ann.id}
                type="button"
                onClick={() => setSelectedAnnouncement(ann)}
                className="p-5 rounded-sm bg-surface-elevated border border-border hover:border-border-strong transition-colors cursor-pointer flex flex-col justify-between text-left group"
              >
                <div className="w-full">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider border ${getCategoryBadgeClasses(ann.category)}`}>
                      {ann.category}
                    </span>
                    <span className="text-[11px] font-mono text-fg-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      <span>{ann.date}</span>
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-fg group-hover:text-accent transition-colors line-clamp-2 mb-2">
                    {ann.title}
                  </h3>
                  
                  <p className="text-xs text-fg-muted font-body line-clamp-2 leading-relaxed">
                    {ann.summary}
                  </p>
                </div>

                <div className="w-full mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono font-semibold text-accent">
                  <span>Read notice</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* DETAIL MODAL */}
      {selectedAnnouncement && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ann-modal-title"
          className="fixed inset-0 z-50 bg-scrim/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            style={{ boxShadow: 'var(--shadow-md)' }}
            className="relative max-w-lg w-full bg-surface border border-border-strong rounded-md p-6 sm:p-8 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 min-w-[40px] min-h-[40px] rounded-sm bg-surface-elevated hover:bg-surface-subtle text-fg flex items-center justify-center transition-colors cursor-pointer border border-border hover:border-border-strong"
              aria-label="Close notice"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 pr-10">
              <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider border ${getCategoryBadgeClasses(selectedAnnouncement.category)}`}>
                {selectedAnnouncement.category}
              </span>
              <span className="text-xs font-mono text-fg-muted">{selectedAnnouncement.date}</span>
            </div>

            <h3 id="ann-modal-title" className="font-heading font-extrabold text-xl text-fg">
              {selectedAnnouncement.title}
            </h3>

            <p className="text-xs sm:text-sm text-fg-muted leading-relaxed font-body pt-3 border-t border-border">
              {selectedAnnouncement.content}
            </p>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-sm bg-surface-elevated hover:bg-surface-subtle border border-border text-xs font-semibold text-fg-muted hover:text-fg transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedAnnouncement.linkUrl && (
                <Link
                  href={selectedAnnouncement.linkUrl}
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-5 py-2 rounded-sm bg-accent hover:bg-accent-hover text-on-accent font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{selectedAnnouncement.linkText || 'Proceed'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
