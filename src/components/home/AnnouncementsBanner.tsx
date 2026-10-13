'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Megaphone, Calendar, ChevronRight, X, ArrowUpRight, AlertCircle, Bell } from 'lucide-react';
import { CLUB_ANNOUNCEMENTS, ClubAnnouncement } from '@/data/announcementsData';

export default function AnnouncementsBanner() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ClubAnnouncement | null>(null);

  return (
    <section id="announcements" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="p-6 sm:p-8 rounded-3xl bg-[#12161D] border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Subtle gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF7C] to-transparent" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF7C]">
                COLLEGE NOTICE BOARD
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-['Montserrat',sans-serif] text-[#F5F5F5]">
                Official Club Announcements
              </h2>
            </div>
          </div>

          <div className="text-xs text-[#A0A6B0]">
            Updated weekly by Chief Arbiter &amp; Executive Council
          </div>
        </div>

        {/* Announcements List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CLUB_ANNOUNCEMENTS.map((ann) => (
            <div
              key={ann.id}
              onClick={() => setSelectedAnnouncement(ann)}
              className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-[#D4AF7C]/40 transition cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ann.badgeColor}`}>
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-[#A0A6B0] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{ann.date}</span>
                  </span>
                </div>

                <h3 className="font-['Montserrat',sans-serif] font-bold text-sm text-[#F5F5F5] group-hover:text-[#D4AF7C] transition line-clamp-2 mb-2">
                  {ann.title}
                </h3>
                
                <p className="text-xs text-[#A0A6B0] line-clamp-2 leading-relaxed">
                  {ann.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#D4AF7C]">
                <span>Read notice</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* DETAIL MODAL */}
      {selectedAnnouncement && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-[#12161D] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-[#F5F5F5] flex items-center justify-center transition cursor-pointer"
              aria-label="Close notice"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${selectedAnnouncement.badgeColor}`}>
                {selectedAnnouncement.category}
              </span>
              <span className="text-xs text-[#A0A6B0]">{selectedAnnouncement.date}</span>
            </div>

            <h3 className="font-['Montserrat',sans-serif] font-black text-xl text-[#F5F5F5]">
              {selectedAnnouncement.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#A0A6B0] leading-relaxed font-['Poppins',sans-serif] pt-2 border-t border-white/10">
              {selectedAnnouncement.content}
            </p>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#A0A6B0] hover:text-[#F5F5F5] transition"
              >
                Close
              </button>

              {selectedAnnouncement.linkUrl && (
                <Link
                  href={selectedAnnouncement.linkUrl}
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-5 py-2 rounded-xl bg-[#D4AF7C] hover:bg-[#E6C98A] text-[#0B0F14] font-bold text-xs transition inline-flex items-center gap-1.5 shadow"
                >
                  <span>{selectedAnnouncement.linkText || 'Proceed'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
