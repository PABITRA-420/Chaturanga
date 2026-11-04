'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { LoadingSpinner } from './ChessLoader';
import { useUIStore } from '@/stores/useUIStore';

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function FloatingContactButton() {
  const isContactOpen = useUIStore((s) => s.isContactOpen);
  const setContactOpen = useUIStore((s) => s.setContactOpen);
  const toggleContact = useUIStore((s) => s.toggleContact);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape & click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isContactOpen) {
        setContactOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setContactOpen(false);
      }
    };

    if (isContactOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isContactOpen, setContactOpen]);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('contact@chaturanga-jgec.ac.in');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setIsSubmitting(true);
    // Simulate swift network dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setQueryText('');
        setSenderName('');
        setSenderContact('');
        setContactOpen(false);
      }, 2500);
    }, 700);
  };

  return (
    <>
      {/* Floating Action Trigger Button - Top Reference (Intercom / Crisp / Linear style) */}
      <aside aria-label="Quick Support and Contact Desk">
        <div className="fixed bottom-20 md:bottom-6 right-5 sm:right-6 z-40 flex items-center">
          {/* Desktop Hover Pill Tooltip */}
          <div
            className={`hidden md:block transition-all duration-200 mr-3 px-3.5 py-1.5 rounded-full bg-[#12161D]/95 border border-[#D4AF7C]/30 text-[#F5F5F5] text-xs font-semibold shadow-xl backdrop-blur-md pointer-events-none select-none whitespace-nowrap ${
              isContactOpen ? 'opacity-0 scale-95' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
            }`}
          >
            <span className="text-[#D4AF7C]">✦</span> Need Help? Arbiter Desk
          </div>

          <button
            type="button"
            onClick={toggleContact}
            className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer btn-tactile group ${
              isContactOpen
                ? 'bg-[#D4AF7C] text-[#0B0F14] border-2 border-[#F3E2B8] shadow-[0_0_25px_rgba(212,175,124,0.4)]'
                : 'bg-gradient-to-br from-[#1A202C] via-[#12161D] to-[#0A0D12] text-[#F5F5F5] border-2 border-[#D4AF7C]/40 hover:border-[#D4AF7C] hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,124,0.3)]'
            }`}
            aria-label={isContactOpen ? 'Close Contact Desk' : 'Open Contact & Arbiter Support Desk'}
            aria-expanded={isContactOpen}
            aria-haspopup="dialog"
          >
            {/* Live Status Indicator Ping */}
            {!isContactOpen && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0B0F14]" />
              </span>
            )}

            {isContactOpen ? (
              <X className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
            ) : (
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF7C] group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      </aside>

      {/* Floating Contact Panel / Drawer - Anchored directly above trigger */}
      {isContactOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-panel-title"
          className="fixed bottom-36 md:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[82vh] overflow-y-auto rounded-3xl bg-[#0F131A]/98 border border-[#D4AF7C]/35 shadow-2xl backdrop-blur-2xl text-[#F5F5F5] p-5 sm:p-6 space-y-5 animate-scale-up"
        >
          {/* Panel Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/25">
                <Sparkles className="w-3 h-3" />
                <span>ARBITER & TECH DESK</span>
              </div>
              <h3 id="contact-panel-title" className="text-base font-bold font-['Montserrat',sans-serif]">
                Chaturanga Support
              </h3>
              <p className="text-xs text-[#A0A6B0]">
                Tournament queries, seat issues, or collegiate collaborations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setContactOpen(false)}
              className="p-1.5 rounded-xl text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5 transition"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Channels Grid */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A0A6B0] block">
              Direct Channels
            </span>

            {/* Email Copy Card */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#D4AF7C]/30 transition flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/25 text-[#D4AF7C] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-[#A0A6B0] block">Official Email</span>
                  <a
                    href="mailto:contact@chaturanga-jgec.ac.in"
                    className="text-xs text-[#F5F5F5] hover:text-[#D4AF7C] truncate font-mono block"
                  >
                    contact@chaturanga-jgec.ac.in
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-2 rounded-xl text-[#D4AF7C] bg-[#D4AF7C]/10 hover:bg-[#D4AF7C]/20 border border-[#D4AF7C]/25 transition btn-tactile shrink-0"
                title="Copy email address"
                aria-label="Copy email address"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Social & Campus Links */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://instagram.com/chaturanga_jgec"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#D4AF7C]/30 hover:bg-white/[0.06] transition flex items-center gap-2.5 text-xs text-[#A0A6B0] hover:text-[#F5F5F5] group"
              >
                <InstagramIcon className="w-4 h-4 text-[#D4AF7C] group-hover:scale-110 transition-transform" />
                <span className="truncate">Instagram</span>
              </a>

              <a
                href="https://jgec.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#D4AF7C]/30 hover:bg-white/[0.06] transition flex items-center gap-2.5 text-xs text-[#A0A6B0] hover:text-[#F5F5F5] group"
              >
                <MapPin className="w-4 h-4 text-[#D4AF7C] group-hover:scale-110 transition-transform" />
                <span className="truncate">JGEC Campus</span>
              </a>
            </div>
          </div>

          {/* Quick In-App Message Dispatch */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A0A6B0] block">
              Leave a Quick Message
            </span>

            {submitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold">Message Dispatched!</p>
                  <p className="text-[11px] opacity-80">Our chief arbiter will respond shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuery} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition"
                />

                <input
                  type="text"
                  placeholder="Email or Phone (For reply)"
                  value={senderContact}
                  onChange={(e) => setSenderContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition"
                />

                <textarea
                  required
                  rows={3}
                  placeholder="Ask a question or report an issue..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition resize-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !queryText.trim()}
                  className="w-full py-2.5 px-4 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition flex items-center justify-center gap-2 disabled:opacity-50 btn-tactile cursor-pointer shadow-md shadow-[#D4AF7C]/20"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" color="#0B0F14" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Arbiter Desk</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
