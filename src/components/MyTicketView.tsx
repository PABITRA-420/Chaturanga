'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Search,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Printer,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function MyTicketView() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [record, setRecord] = useState<any | null>(null);
  const [tournamentInfo, setTournamentInfo] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || params.get('ticketId') || params.get('roll');
      if (q) {
        setQuery(q);
        handleLookup(q);
      }
    }
  }, []);

  const handleLookup = async (lookupQuery?: string) => {
    const target = lookupQuery || query;
    if (!target.trim()) {
      setError('Please enter your Roll Number or Ticket ID.');
      return;
    }

    setLoading(true);
    setError('');
    setRecord(null);

    try {
      const res = await fetch(`/api/registrations/verify?q=${encodeURIComponent(target.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'No matching registration found. Please verify your details.');
      } else {
        setRecord(data.registration);
        setTournamentInfo(data.tournament);
      }
    } catch {
      setError('Failed to connect to verification server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-bg text-fg font-ui selection:bg-accent selection:text-on-accent">
      <Navbar />

      <main id="main-content" className="pt-28 pb-20">
        
        {/* HEADER */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
            <Ticket className="w-3.5 h-3.5" aria-hidden="true" />
            <span>OFFICIAL PASS VERIFICATION</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-fg tracking-tight">
            Check Registration <span className="text-accent">&amp;</span> Digital Pass
          </h1>
          <p className="text-sm text-fg-muted max-w-xl mx-auto font-body">
            Enter your JGEC College Roll Number or Ticket ID to verify your tournament seat, check reporting venue, and reprint your pass.
          </p>
        </section>

        {/* SEARCH BOX */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 mb-12">
          <form
            onSubmit={(e) => { e.preventDefault(); handleLookup(); }}
            className="p-3 rounded-md bg-surface border border-border flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-fg-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                placeholder="Enter Roll Number (e.g. 22101104012) or Ticket ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-sm bg-bg border border-border text-sm text-fg placeholder:text-fg-subtle focus:border-border-strong transition-colors"
                aria-label="Roll number or ticket ID"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-sm bg-accent hover:bg-accent-hover text-on-accent font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 btn-tactile"
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <span>Find My Pass</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Format Guidance */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-fg-muted font-mono">
            <span>Formats:</span>
            <span className="text-accent font-semibold">11-Digit Roll No.</span>
            <span>or</span>
            <span className="text-accent font-semibold">CHTR-2026-...</span>
          </div>

          {error && (
            <div role="alert" className="mt-4 p-4 rounded-sm bg-surface border border-danger/50 text-danger text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-fg">{error}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  Not registered yet? <Link href="/register" className="underline font-bold text-accent">Click here to register online.</Link>
                </p>
              </div>
            </div>
          )}
        </section>

        {/* PASS RESULTS */}
        {record && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6">
            
            <div className="bg-surface border-2 border-border-strong rounded-md overflow-hidden relative mb-6">
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full bg-accent" aria-hidden="true" />

              <div className="p-6 sm:p-8">
                
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-border gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold">
                        CHATURANGA • JGEC CHESS CLUB
                      </span>
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-success/10 text-success border border-success/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        <span>{record.checkInStatus === 'checked_in' ? 'Checked In' : 'Confirmed Seat'}</span>
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-fg">
                      {record.tournament}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-fg-muted uppercase font-mono">TICKET IDENTIFIER</div>
                    <div className="text-lg font-extrabold font-mono text-accent tracking-wider">
                      {record.ticketId}
                    </div>
                  </div>
                </div>

                {/* Player Credentials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-6 border-b border-border">
                  <div>
                    <div className="text-[10px] font-mono text-fg-muted uppercase">PLAYER NAME</div>
                    <div className="text-base font-bold text-fg mt-0.5">{record.fullName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-fg-muted uppercase">COLLEGE ROLL NUMBER</div>
                    <div className="text-base font-mono font-bold text-accent mt-0.5">{record.rollNumber}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-fg-muted uppercase">DEPARTMENT &amp; YEAR</div>
                    <div className="text-sm font-semibold text-fg mt-0.5">{record.department} • {record.year}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-fg-muted uppercase">RATING CATEGORY</div>
                    <div className="text-sm font-semibold text-fg mt-0.5">{record.ratingCategory}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-fg-muted uppercase">CHESS IDENTIFIERS</div>
                    <div className="text-sm font-mono text-fg mt-0.5">
                      FIDE: {record.fideId || 'Unrated'} • {record.chessUsername && record.chessUsername !== 'N/A' ? (
                        <>
                          @{record.chessUsername}
                          {record.chessPlatform && !record.chessUsername.includes('(')
                            ? ` (${record.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'})`
                            : ''}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-fg-muted uppercase">REGISTRATION DATE</div>
                    <div className="text-sm font-mono text-fg-muted mt-0.5">
                      {new Date(record.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Tournament Venue Details */}
                <div className="py-6 border-b border-border grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-elevated -mx-6 sm:-mx-8 px-6 sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-surface border border-border flex items-center justify-center text-accent shrink-0">
                      <MapPin className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-fg-muted uppercase">REPORTING VENUE</div>
                      <div className="text-xs sm:text-sm font-bold text-fg">
                        {tournamentInfo?.venue || 'Main Auditorium, JGEC Campus'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-surface border border-border flex items-center justify-center text-accent shrink-0">
                      <Clock className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-fg-muted uppercase">EVENT DATE &amp; REPORTING</div>
                      <div className="text-xs sm:text-sm font-bold text-fg">
                        {tournamentInfo?.date || 'As announced'} • {tournamentInfo?.time || '09:30 AM IST'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions & Actions */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                    <span className="text-xs text-fg-muted font-body">
                      Please present this pass along with valid College Student ID at the Arbiter Desk.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 print:hidden">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-4 py-2 rounded-xs bg-surface-elevated hover:bg-surface-subtle border border-border hover:border-border-strong text-xs font-mono font-semibold text-fg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Print Pass</span>
                    </button>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-xs bg-accent hover:bg-accent-hover text-on-accent text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <span>New Registration</span>
                    </Link>
                  </div>
                </div>

              </div>
            </div>

          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
