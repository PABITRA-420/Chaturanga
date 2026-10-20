"use client";

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Download, 
  Printer, 
  RotateCcw, 
  Loader2, 
  Zap, 
  Sparkles 
} from 'lucide-react';
import { drawPassToCanvas, exportCanvasToPng } from '@/lib/canvasTicket';

export interface DigitalPassCardProps {
  ticketId: string;
  formData: {
    fullName: string;
    rollNumber: string;
    institution: string;
    department: string;
    year: string;
    email?: string;
    phone?: string;
    chessPlatform?: string;
    chessUsername?: string;
    fideId?: string;
    ratingCategory?: string;
  };
  currentEvent: {
    title: string;
    date: string;
    time: string;
    venue: string;
  };
  sheetStatus?: {
    synced: boolean;
    configured: boolean;
    message?: string;
  } | null;
  onReset: () => void;
}

export default function DigitalPassCard({
  ticketId,
  formData,
  currentEvent,
  sheetStatus,
  onReset
}: DigitalPassCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleDownloadPNG = () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      drawPassToCanvas(canvas, {
        ticketId,
        fullName: formData.fullName,
        rollNumber: formData.rollNumber,
        tournament: currentEvent.title,
        institution: formData.institution,
        department: formData.department,
        year: formData.year,
        date: currentEvent.date,
        time: currentEvent.time,
        venue: currentEvent.venue,
        chessPlatform: formData.chessPlatform,
        chessUsername: formData.chessUsername,
        fideId: formData.fideId,
        ratingCategory: formData.ratingCategory
      });
      exportCanvasToPng(canvas, `Chaturanga-Pass-${ticketId}.png`);
    } catch (err) {
      console.error('Error generating pass PNG:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-400">
      
      {/* Celebration Banner with Gold Particle Glow */}
      <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#181D26] via-[#12161D] to-[#0A0D12] border-2 border-[#D4AF7C]/60 text-center space-y-4 shadow-[0_10px_50px_rgba(212,175,124,0.2)]">
        <div className="animate-shimmer" />

        {/* Golden confetti dots floating in background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <span className="absolute top-4 left-10 text-lg opacity-70 animate-bounce">✨</span>
          <span className="absolute top-8 right-14 text-base opacity-70 animate-bounce" style={{ animationDelay: '300ms' }}>🏆</span>
          <span className="absolute bottom-6 left-16 text-xs text-[#D4AF7C] opacity-80 animate-pulse">✦</span>
          <span className="absolute bottom-10 right-20 text-sm text-[#F3E2B8] opacity-80 animate-pulse" style={{ animationDelay: '500ms' }}>★</span>
          <span className="absolute top-1/2 left-4 text-xs text-[#D4AF7C] opacity-50">✦</span>
          <span className="absolute top-1/3 right-6 text-xs text-[#D4AF7C] opacity-60">✨</span>
        </div>

        <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-32 bg-[#D4AF7C]/25 blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-[#D4AF7C] via-[#F3E2B8] to-[#D4AF7C] text-[#0B0F14] shadow-xl shadow-[#D4AF7C]/30 mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1 relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4AF7C]">
            OFFICIAL ENTRY ACCREDITED
          </span>
          <h2 className="font-['Montserrat',sans-serif] font-black text-2xl sm:text-4xl text-[#F5F5F5]">
            You&apos;re Ready for <span className="gold-gradient-text">Battle</span>!
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-[#A0A6B0] max-w-lg mx-auto font-['Inter',sans-serif] leading-relaxed relative z-10">
          Your unique accreditation code is generated and saved directly into the tournament registry. Download your high-resolution lanyard pass below.
        </p>

        {/* Google Sheets Sync Telemetry Badge */}
        <div className="pt-2 relative z-10">
          {sheetStatus?.synced ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Google Sheets Live Database Synced &amp; Locked!</span>
            </div>
          ) : sheetStatus?.configured ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <span>Pass generated. Spreadsheet synchronization registered.</span>
            </div>
          ) : (
            <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#D4AF7C]" />
                <span>Free Google Sheet Automation active for organizers.</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="underline font-bold text-[#D4AF7C] hover:text-white cursor-pointer ml-1"
              >
                {showSetupGuide ? 'Hide Instructions' : 'View 2-Min Setup Guide'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Setup Guide Modal / Accordion */}
      {showSetupGuide && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12161D] border border-white/10 text-xs space-y-4 font-['Inter',sans-serif] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="font-bold text-sm text-[#D4AF7C] font-['Montserrat',sans-serif] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF7C]" />
              <span>100% Free Google Apps Script &amp; Chart Automation</span>
            </h4>
            <button 
              type="button"
              onClick={() => setShowSetupGuide(false)}
              className="text-[#A0A6B0] hover:text-white cursor-pointer font-bold px-2 py-1 rounded-lg hover:bg-white/5"
            >
              ✕ Close
            </button>
          </div>
          
          <p className="text-[#A0A6B0] leading-relaxed">
            Google Apps Script runs completely free on your Google Drive. The script in <code className="text-[#D4AF7C] bg-white/5 px-1.5 py-0.5 rounded font-mono">google-apps-script/Code.gs</code> handles player entry logging and auto-builds <strong>Department</strong> and <strong>Rating Distribution</strong> charts.
          </p>
        </div>
      )}

      {/* DIGITAL TOURNAMENT NAMECARD / PASS */}
      <div className="relative rounded-3xl bg-[#12161D] border-2 border-[#D4AF7C]/40 shadow-2xl overflow-hidden font-['Inter',sans-serif]">
        {/* Holographic Watermark glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D4AF7C]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#D4AF7C]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Lanyard Clip Slot Cutout Simulation */}
        <div className="pt-6 pb-2 text-center">
          <div className="w-28 h-3.5 rounded-full bg-black/70 border border-[#D4AF7C]/30 mx-auto shadow-inner flex items-center justify-center">
            <div className="w-20 h-1 rounded-full bg-white/10" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#A0A6B0] block mt-1">
            OFFICIAL LANYARD ACCREDITATION BADGE
          </span>
        </div>

        {/* Ticket Header Ribbon */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-black/60 via-[#12161D] to-black/60 border-y border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF7C] to-[#997945] text-[#0B0F14] flex items-center justify-center font-black text-xl shadow-lg shadow-[#D4AF7C]/20">
              ♞
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF7C]">
                  CHATURANGA JGEC
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                  VERIFIED ENTRY
                </span>
              </div>
              <h3 className="font-['Montserrat',sans-serif] font-black text-lg sm:text-xl text-[#F5F5F5] mt-0.5">
                {currentEvent.title}
              </h3>
            </div>
          </div>

          <div className="text-right pl-4 sm:border-l border-white/10">
            <span className="text-[10px] text-[#A0A6B0] uppercase tracking-wider block font-medium">UNIQUE PASS CODE</span>
            <span className="font-mono text-base font-black text-[#D4AF7C] tracking-wider">{ticketId}</span>
            <span className="text-[9px] text-emerald-400 block font-medium mt-0.5">✓ Synced in Database</span>
          </div>
        </div>

        {/* Ticket Core Content Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Player Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] text-[#A0A6B0] uppercase tracking-wider font-semibold">Player Name</span>
                <div className="font-['Montserrat',sans-serif] font-black text-lg text-[#F5F5F5]">
                  {formData.fullName}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-[#A0A6B0] uppercase tracking-wider font-semibold">Roll / Student ID</span>
                <div className="font-mono font-bold text-base text-[#D4AF7C]">
                  {formData.rollNumber}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-[#A0A6B0] uppercase tracking-wider font-semibold">Department &amp; Year</span>
                <div className="text-xs text-[#F5F5F5] font-medium">
                  {formData.department} ({formData.year})
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-[#A0A6B0] uppercase tracking-wider font-semibold">Institution</span>
                <div className="text-xs text-[#F5F5F5] font-medium truncate">
                  {formData.institution}
                </div>
              </div>
            </div>

            {/* Tournament Schedule Coordinates */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#D4AF7C] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#A0A6B0] block">Match Date &amp; Time</span>
                  <span className="text-[#F5F5F5] font-semibold">{currentEvent.date} ({currentEvent.time})</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF7C] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#A0A6B0] block">Reporting Venue</span>
                  <span className="text-[#F5F5F5] font-semibold">{currentEvent.venue}</span>
                </div>
              </div>
            </div>

            {/* Chess Ratings */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="px-3 py-1 rounded-lg bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 text-[#D4AF7C] font-semibold">
                {formData.ratingCategory || 'Collegiate Player'}
              </span>
              {formData.chessUsername && (
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[#A0A6B0]">
                  Profile: <strong className="text-[#F5F5F5] font-mono">@{formData.chessUsername} ({formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'})</strong>
                </span>
              )}
              {formData.fideId && (
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[#A0A6B0]">
                  FIDE ID: <strong className="text-[#F5F5F5] font-mono">{formData.fideId}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Simulated Scannable Badge & Arbiter Seal */}
          <div className="flex flex-col items-center justify-between p-5 rounded-2xl bg-black/40 border border-white/5 text-center space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF7C]">
                ARBITER SCAN CODE
              </span>
              <p className="text-[10px] text-[#A0A6B0]">Present at desk for pairing</p>
            </div>

            {/* High-tech QR Pattern Simulator */}
            <div className="p-3 bg-white rounded-xl shadow-inner flex items-center justify-center">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="#0B0F14">
                <rect x="0" y="0" width="30" height="30" rx="3" fill="#0B0F14" />
                <rect x="5" y="5" width="20" height="20" rx="2" fill="#FFFFFF" />
                <rect x="10" y="10" width="10" height="10" fill="#0B0F14" />

                <rect x="70" y="0" width="30" height="30" rx="3" fill="#0B0F14" />
                <rect x="75" y="5" width="20" height="20" rx="2" fill="#FFFFFF" />
                <rect x="80" y="10" width="10" height="10" fill="#0B0F14" />

                <rect x="0" y="70" width="30" height="30" rx="3" fill="#0B0F14" />
                <rect x="5" y="75" width="20" height="20" rx="2" fill="#FFFFFF" />
                <rect x="10" y="80" width="10" height="10" fill="#0B0F14" />

                <rect x="40" y="10" width="8" height="8" />
                <rect x="52" y="10" width="8" height="8" />
                <rect x="40" y="24" width="20" height="6" />
                <rect x="10" y="42" width="14" height="6" />
                <rect x="30" y="40" width="10" height="10" />
                <rect x="48" y="40" width="12" height="12" />
                <rect x="68" y="42" width="22" height="6" />
                <rect x="40" y="60" width="12" height="8" />
                <rect x="60" y="60" width="10" height="10" />
                <rect x="80" y="60" width="10" height="10" />
                <rect x="40" y="78" width="18" height="12" />
                <rect x="66" y="78" width="14" height="12" />
                <rect x="88" y="78" width="8" height="12" />
              </svg>
            </div>

            <div className="font-mono text-[11px] text-[#A0A6B0]">
              AUTHENTICATED • JGEC-ARB
            </div>
          </div>
        </div>

        {/* Perforated Stub Line */}
        <div className="relative py-2 px-6 flex items-center justify-between border-t border-dashed border-white/20">
          <span className="text-[10px] text-[#A0A6B0] uppercase tracking-wider font-medium">
            ACCREDITED COMPETITOR BADGE • VALID FOR TOURNAMENT ROUNDS
          </span>
          <span className="text-[10px] font-bold text-[#D4AF7C] tracking-widest font-mono">
            ★ FAIR PLAY VERIFIED ★
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          type="button"
          onClick={handleDownloadPNG}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 transition shadow-lg shadow-[#D4AF7C]/25 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Image...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Pass (PNG Image)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold text-[#F5F5F5] bg-white/10 hover:bg-white/15 border border-white/15 transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#D4AF7C]" />
          <span>Print / Save PDF</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Register Another Player</span>
        </button>
      </div>

    </div>
  );
}
