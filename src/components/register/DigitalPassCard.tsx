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
  Sparkles,
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
  onReset,
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
        ratingCategory: formData.ratingCategory,
      });
      exportCanvasToPng(canvas, `Chaturanga-Pass-${ticketId}.png`);
    } catch (err) {
      console.error('Error generating pass PNG:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      
      {/* Accreditation Banner */}
      <div className="relative overflow-hidden p-8 sm:p-10 rounded-md bg-surface border-2 border-border-strong text-center space-y-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent" aria-hidden="true" />
        
        <div className="inline-flex p-3 rounded-sm bg-accent text-on-accent mx-auto">
          <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-accent">
            OFFICIAL ENTRY ACCREDITED
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-fg">
            You&apos;re Ready for <span className="text-accent">Battle</span>!
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-fg-muted max-w-lg mx-auto font-body leading-relaxed">
          Your unique accreditation code is generated and saved directly into the tournament registry. Download your high-resolution lanyard pass below.
        </p>

        {/* Sync Badge */}
        <div className="pt-2">
          {sheetStatus?.synced ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs bg-success/10 border border-success/40 text-success text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-success shrink-0" aria-hidden="true" />
              <span>Google Sheets Live Database Synced &amp; Locked!</span>
            </div>
          ) : sheetStatus?.configured ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs bg-warning/10 border border-warning/40 text-warning text-xs font-mono font-medium">
              <span>Pass generated. Spreadsheet synchronization registered.</span>
            </div>
          ) : (
            <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-3.5 py-2 rounded-xs bg-info/10 border border-info/30 text-info text-xs">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                <span>Free Google Sheet Automation active for organizers.</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="underline font-bold text-accent hover:text-fg cursor-pointer ml-1"
              >
                {showSetupGuide ? 'Hide Instructions' : 'View 2-Min Setup Guide'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showSetupGuide && (
        <div className="p-6 sm:p-8 rounded-md bg-surface border border-border text-xs space-y-4 font-ui">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h4 className="font-bold text-sm text-accent font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>100% Free Google Apps Script &amp; Chart Automation</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowSetupGuide(false)}
              className="text-fg-muted hover:text-fg cursor-pointer font-bold px-2 py-1 rounded-xs hover:bg-surface-elevated"
            >
              ✕ Close
            </button>
          </div>
          
          <p className="text-fg-muted leading-relaxed font-body">
            Google Apps Script runs completely free on your Google Drive. The script in <code className="text-accent bg-surface-elevated px-1.5 py-0.5 rounded-xs font-mono">google-apps-script/Code.gs</code> handles player entry logging and auto-builds <strong>Department</strong> and <strong>Rating Distribution</strong> charts.
          </p>
        </div>
      )}

      {/* DIGITAL TOURNAMENT PASS */}
      <div className="relative rounded-md bg-surface border-2 border-border-strong overflow-hidden font-ui">
        {/* Lanyard Clip Slot */}
        <div className="pt-5 pb-2 text-center bg-surface-elevated border-b border-border">
          <div className="w-24 h-2.5 rounded-xs bg-bg border border-border mx-auto" />
          <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-fg-muted block mt-1.5">
            OFFICIAL LANYARD ACCREDITATION BADGE
          </span>
        </div>

        {/* Ticket Header Ribbon */}
        <div className="p-6 sm:p-8 bg-surface-elevated border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-accent text-on-accent flex items-center justify-center font-serif font-bold text-2xl shrink-0">
              ♞
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
                  CHATURANGA JGEC
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-xs bg-success/10 text-success border border-success/30 font-mono font-bold uppercase tracking-wider">
                  VERIFIED ENTRY
                </span>
              </div>
              <h3 className="font-heading font-extrabold text-lg sm:text-xl text-fg mt-0.5">
                {currentEvent.title}
              </h3>
            </div>
          </div>

          <div className="text-left sm:text-right sm:pl-4 sm:border-l border-border">
            <span className="text-[10px] font-mono text-fg-muted uppercase tracking-wider block font-medium">UNIQUE PASS CODE</span>
            <span className="font-mono text-base font-extrabold text-accent tracking-wider">{ticketId}</span>
            <span className="text-[10px] text-success font-mono block font-medium mt-0.5">✓ Synced in Database</span>
          </div>
        </div>

        {/* Ticket Content Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-fg-muted uppercase tracking-wider font-semibold">Player Name</span>
                <div className="font-heading font-extrabold text-lg text-fg">
                  {formData.fullName}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-fg-muted uppercase tracking-wider font-semibold">Roll / Student ID</span>
                <div className="font-mono font-bold text-base text-accent">
                  {formData.rollNumber}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-fg-muted uppercase tracking-wider font-semibold">Department &amp; Year</span>
                <div className="text-xs text-fg font-medium">
                  {formData.department} ({formData.year})
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-fg-muted uppercase tracking-wider font-semibold">Institution</span>
                <div className="text-xs text-fg font-medium truncate">
                  {formData.institution}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-sm bg-surface-elevated border border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-[10px] font-mono text-fg-muted block">Match Date &amp; Time</span>
                  <span className="text-fg font-semibold">{currentEvent.date} ({currentEvent.time})</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <div>
                  <span className="text-[10px] font-mono text-fg-muted block">Reporting Venue</span>
                  <span className="text-fg font-semibold">{currentEvent.venue}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
              <span className="px-2.5 py-1 rounded-xs bg-accent/15 border border-accent/40 text-accent font-semibold">
                {formData.ratingCategory || 'Collegiate Player'}
              </span>
              {formData.chessUsername && (
                <span className="px-2.5 py-1 rounded-xs bg-surface-elevated border border-border text-fg-muted">
                  Profile: <strong className="text-fg">@{formData.chessUsername} ({formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'})</strong>
                </span>
              )}
              {formData.fideId && (
                <span className="px-2.5 py-1 rounded-xs bg-surface-elevated border border-border text-fg-muted">
                  FIDE ID: <strong className="text-fg">{formData.fideId}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Scannable QR Code Column */}
          <div className="flex flex-col items-center justify-between p-5 rounded-sm bg-surface-elevated border border-border text-center space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-accent">
                ARBITER SCAN CODE
              </span>
              <p className="text-[10px] text-fg-muted">Present at desk for pairing</p>
            </div>

            {/* White-backed optical QR graphic */}
            <div className="p-3 bg-white border border-border rounded-xs flex items-center justify-center">
              <svg aria-label="Tournament QR Pass Matrix" className="w-24 h-24" viewBox="0 0 100 100" fill="#09090B">
                <rect x="0" y="0" width="30" height="30" rx="2" fill="#09090B" />
                <rect x="5" y="5" width="20" height="20" rx="1" fill="#FFFFFF" />
                <rect x="10" y="10" width="10" height="10" fill="#09090B" />

                <rect x="70" y="0" width="30" height="30" rx="2" fill="#09090B" />
                <rect x="75" y="5" width="20" height="20" rx="1" fill="#FFFFFF" />
                <rect x="80" y="10" width="10" height="10" fill="#09090B" />

                <rect x="0" y="70" width="30" height="30" rx="2" fill="#09090B" />
                <rect x="5" y="75" width="20" height="20" rx="1" fill="#FFFFFF" />
                <rect x="10" y="80" width="10" height="10" fill="#09090B" />

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

            <div className="font-mono text-[10px] text-fg-muted">
              AUTHENTICATED • JGEC-ARB
            </div>
          </div>
        </div>

        {/* Perforated Stub Line */}
        <div className="relative py-2.5 px-6 flex items-center justify-between border-t border-dashed border-border bg-surface-elevated text-[10px] font-mono">
          <span className="text-fg-muted uppercase tracking-wider font-medium">
            ACCREDITED COMPETITOR BADGE • VALID FOR ROUNDS
          </span>
          <span className="font-bold text-accent tracking-widest">
            FAIR PLAY VERIFIED
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
        <button
          type="button"
          onClick={handleDownloadPNG}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xs text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-60 btn-tactile"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Generating Image...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download Pass (PNG Image)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xs text-xs font-mono font-semibold text-fg bg-surface-elevated hover:bg-surface-subtle border border-border hover:border-border-strong transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-accent" aria-hidden="true" />
          <span>Print / Save PDF</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xs text-xs font-mono font-semibold text-fg-muted hover:text-fg bg-surface hover:bg-surface-elevated border border-border transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Register Another Player</span>
        </button>
      </div>

    </div>
  );
}
