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
  Download, 
  Printer, 
  User, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function MyTicketView() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [record, setRecord] = useState<any | null>(null);
  const [tournamentInfo, setTournamentInfo] = useState<any | null>(null);

  // If query in URL params
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
    } catch (err: any) {
      setError('Failed to connect to verification server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F5F5] font-['Inter',sans-serif] selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
      <Navbar />

      <main id="main-content" className="pt-28 pb-20">
        
        {/* HEADER */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 text-xs font-bold uppercase tracking-widest text-[#D4AF7C] mb-4">
            <Ticket className="w-3.5 h-3.5" />
            <span>Official Pass Verification</span>
          </div>
          <h1 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-4xl text-[#F5F5F5] tracking-tight mb-3">
            Check Registration <span className="text-[#D4AF7C]">&</span> Digital Pass
          </h1>
          <p className="text-sm text-[#A0A6B0] max-w-xl mx-auto font-['Poppins',sans-serif]">
            Enter your JGEC College Roll Number or Ticket ID to verify your tournament seat, check reporting venue, and reprint your pass.
          </p>
        </section>

        {/* SEARCH BOX */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 mb-12">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleLookup(); }}
            className="p-3 rounded-2xl bg-[#12161D] border border-white/10 shadow-2xl flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A0A6B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter Roll Number (e.g. 22101104012) or Ticket ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#080B0F] border border-white/10 text-sm text-[#F5F5F5] placeholder-[#A0A6B0]/50 focus:outline-none focus:border-[#D4AF7C]"
                aria-label="Roll number or ticket ID"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] text-[#0B0F14] font-bold text-sm hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <span>Find My Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Help */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-[#A0A6B0]">
            <span>Try sample roll:</span>
            <button 
              type="button" 
              onClick={() => { setQuery('22101104012'); handleLookup('22101104012'); }}
              className="text-[#D4AF7C] underline hover:text-white cursor-pointer"
            >
              22101104012 (Aritra Sen)
            </button>
            <span>or</span>
            <button 
              type="button" 
              onClick={() => { setQuery('23101102008'); handleLookup('23101102008'); }}
              className="text-[#D4AF7C] underline hover:text-white cursor-pointer"
            >
              23101102008 (Debanjan Ghosh)
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                <p className="mt-1 text-xs opacity-90">
                  Not registered yet? <Link href="/register" className="underline font-bold text-white">Click here to register online.</Link>
                </p>
              </div>
            </div>
          )}
        </section>

        {/* PASS RESULTS */}
        {record && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6">
            
            <div className="p-1 rounded-3xl bg-gradient-to-r from-[#D4AF7C] via-[#F3E5AB] to-[#D4AF7C] shadow-2xl mb-6">
              <div className="bg-[#12161D] rounded-[22px] p-6 sm:p-8">
                
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase tracking-widest text-[#D4AF7C] font-bold">CHATURANGA • JGEC CHESS CLUB</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{record.checkInStatus === 'checked_in' ? 'Checked In' : 'Confirmed Seat'}</span>
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-['Montserrat',sans-serif] text-[#F5F5F5]">
                      {record.tournament}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-[#A0A6B0] uppercase font-mono">TICKET IDENTIFIER</div>
                    <div className="text-lg font-black font-mono text-[#D4AF7C] tracking-wider">
                      {record.ticketId}
                    </div>
                  </div>
                </div>

                {/* Player Credentials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-6 border-b border-white/10">
                  <div>
                    <div className="text-[11px] text-[#A0A6B0] uppercase">PLAYER NAME</div>
                    <div className="text-base font-bold text-[#F5F5F5] mt-0.5">{record.fullName}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#A0A6B0] uppercase">COLLEGE ROLL NUMBER</div>
                    <div className="text-base font-mono font-bold text-[#D4AF7C] mt-0.5">{record.rollNumber}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#A0A6B0] uppercase">DEPARTMENT & YEAR</div>
                    <div className="text-sm font-semibold text-[#F5F5F5] mt-0.5">{record.department} • {record.year}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#A0A6B0] uppercase">RATING CATEGORY</div>
                    <div className="text-sm font-semibold text-[#F5F5F5] mt-0.5">{record.ratingCategory}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#A0A6B0] uppercase">CHESS IDENTIFIERS</div>
                    <div className="text-sm font-mono text-[#F5F5F5] mt-0.5">
                      FIDE: {record.fideId || 'Unrated'} • @{record.chessUsername || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#A0A6B0] uppercase">REGISTRATION DATE</div>
                    <div className="text-sm font-mono text-[#A0A6B0] mt-0.5">
                      {new Date(record.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Tournament Match Venue Details */}
                <div className="py-6 border-b border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/30 -mx-6 sm:-mx-8 px-6 sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF7C]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-[#A0A6B0] uppercase">REPORTING VENUE</div>
                      <div className="text-xs sm:text-sm font-bold text-[#F5F5F5]">
                        {tournamentInfo?.venue || 'Main Auditorium, JGEC Campus'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF7C]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-[#A0A6B0] uppercase">EVENT DATE & REPORTING</div>
                      <div className="text-xs sm:text-sm font-bold text-[#F5F5F5]">
                        {tournamentInfo?.date || 'As announced'} • {tournamentInfo?.time || '09:30 AM IST'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barcode & Instructions */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#D4AF7C]" />
                    <span className="text-xs text-[#A0A6B0]">
                      Please present this pass along with valid College Student ID at the Arbiter Desk.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-[#F5F5F5] transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Pass</span>
                    </button>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-xl bg-[#D4AF7C] hover:bg-[#E6C98A] text-[#0B0F14] text-xs font-bold transition flex items-center gap-1.5"
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
