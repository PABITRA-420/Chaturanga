'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import { LoadingSpinner } from './ChessLoader';
import { useUIStore } from '@/stores/useUIStore';

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <aside aria-label="Quick Support and Contact Desk">
        <div className="fixed bottom-20 md:bottom-6 right-5 sm:right-6 z-40 flex items-center group">
          <div
            style={{ boxShadow: 'var(--shadow-sm)' }}
            className={`hidden md:block transition-all duration-150 mr-3 px-3 py-1.5 rounded-sm bg-surface border border-border text-fg text-xs font-medium pointer-events-none select-none whitespace-nowrap ${
              isContactOpen ? 'opacity-0 scale-95' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
            }`}
          >
            <span className="text-accent font-mono mr-1.5">•</span>Arbiter Support Desk
          </div>

          <button
            type="button"
            onClick={toggleContact}
            style={{ boxShadow: 'var(--shadow-md)' }}
            className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-colors duration-150 cursor-pointer btn-tactile border ${
              isContactOpen
                ? 'bg-accent text-on-accent border-accent'
                : 'bg-surface hover:bg-surface-elevated text-fg border-border-strong'
            }`}
            aria-label={isContactOpen ? 'Close Contact Desk' : 'Open Contact & Arbiter Support Desk'}
            aria-expanded={isContactOpen}
            aria-haspopup="dialog"
          >
            {!isContactOpen && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success border-2 border-bg" />
              </span>
            )}

            {isContactOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <MessageSquare className="w-5 h-5 text-accent" aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>

      {isContactOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-panel-title"
          style={{ boxShadow: 'var(--shadow-md)' }}
          className="fixed bottom-36 md:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[82vh] overflow-y-auto rounded-md bg-surface border border-border-strong text-fg p-5 sm:p-6 space-y-5 animate-scale-up"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-widest text-accent border border-border bg-surface-elevated">
                <Terminal className="w-3 h-3" aria-hidden="true" />
                <span>ARBITER &amp; TECH DESK</span>
              </div>
              <h3 id="contact-panel-title" className="text-base font-bold font-heading text-fg">
                Chaturanga Support
              </h3>
              <p className="text-xs text-fg-muted font-body">
                Tournament queries, seat issues, or collegiate collaborations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setContactOpen(false)}
              className="p-2 min-w-[36px] min-h-[36px] rounded-sm text-fg-muted hover:text-fg hover:bg-surface-elevated transition-colors"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Channels */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-fg-muted block">
              Direct Channels
            </span>

            <div className="p-3 rounded-sm bg-surface-elevated border border-border hover:border-border-strong transition-colors flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-sm bg-surface border border-border text-accent flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-fg-muted block font-mono uppercase">Official Email</span>
                  <a
                    href="mailto:contact@chaturanga-jgec.ac.in"
                    className="text-xs text-fg hover:text-accent truncate font-mono block"
                  >
                    contact@chaturanga-jgec.ac.in
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-2 rounded-sm text-fg bg-surface hover:bg-surface-subtle border border-border hover:border-border-strong transition-colors btn-tactile shrink-0"
                title="Copy email address"
                aria-label="Copy email address"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-accent" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://instagram.com/chaturanga_jgec"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-sm bg-surface-elevated border border-border hover:border-border-strong transition-colors flex items-center gap-2.5 text-xs text-fg-muted hover:text-fg group"
              >
                <InstagramIcon className="w-4 h-4 text-accent" />
                <span className="truncate font-medium">Instagram</span>
              </a>

              <a
                href="https://jgec.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-sm bg-surface-elevated border border-border hover:border-border-strong transition-colors flex items-center gap-2.5 text-xs text-fg-muted hover:text-fg group"
              >
                <MapPin className="w-4 h-4 text-accent" aria-hidden="true" />
                <span className="truncate font-medium">JGEC Campus</span>
              </a>
            </div>
          </div>

          {/* Quick In-App Message Dispatch */}
          <div className="pt-3 border-t border-border space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-fg-muted block">
              Leave a Quick Message
            </span>

            {submitted ? (
              <div className="p-4 rounded-sm bg-surface-elevated border border-success/50 text-fg text-xs flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-bold">Message Dispatched</p>
                  <p className="text-[11px] text-fg-muted">Our chief arbiter will respond shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuery} className="space-y-2.5">
                <input
                  type="text"
                  aria-label="Your Name"
                  placeholder="Your Name (Optional)"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-border-strong transition-colors"
                />

                <input
                  type="text"
                  aria-label="Email or Phone"
                  placeholder="Email or Phone (For reply)"
                  value={senderContact}
                  onChange={(e) => setSenderContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-border-strong transition-colors"
                />

                <textarea
                  required
                  rows={3}
                  aria-label="Question or issue"
                  placeholder="Ask a question or report an issue..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm bg-bg border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-border-strong transition-colors resize-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !queryText.trim()}
                  className="w-full py-2.5 px-4 rounded-sm text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 btn-tactile cursor-pointer"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" color="var(--on-accent)" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
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
