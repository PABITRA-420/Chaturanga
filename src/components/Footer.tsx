"use client";

import React from 'react';
import Link from 'next/link';
import ChaturangaLogo from './ChaturangaLogo';
import { Lock, ArrowUpRight, Mail } from 'lucide-react';
import LastUpdatedBadge from '@/components/ui/LastUpdatedBadge';

export interface FooterProps {
  onOpenAdminModal?: () => void;
}

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" />
  </svg>
);

export default function Footer({ onOpenAdminModal: _onOpenAdminModal }: FooterProps) {
  return (
    <footer className="w-full border-t border-border bg-surface text-xs text-fg-muted font-ui">
      {/* Top Footer with Swiss Structural Column Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">

          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-sm bg-[#111114] border border-border-strong p-1.5">
                <ChaturangaLogo className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-base tracking-tight text-fg leading-none">
                  CHATURANGA
                </span>
                <span className="text-[10px] font-mono text-accent tracking-[0.2em] font-semibold uppercase mt-1">
                  CHESS CLUB • JGEC
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-fg-muted max-w-sm font-body leading-relaxed">
              Official Chess Club of Jalpaiguri Government Engineering College. Promoting tactical discipline, collegiate qualifiers, and a thriving chess community.
            </p>

            {/* Admin Login Link */}
            <div className="pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-semibold text-fg-muted hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border hover:border-border-strong transition-colors cursor-pointer group"
                title="Restricted Administrator Access"
              >
                <Lock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                <span>Admin Login Portal</span>
                <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right Columns: EXPLORE and CONNECT */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 md:pl-6 md:border-l md:border-border">

            {/* Column 1: EXPLORE */}
            <div>
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent mb-4">
                EXPLORE
              </h4>
              <ul className="space-y-2.5 font-body text-sm">
                <li>
                  <Link
                    href="/#about"
                    className="text-fg-muted hover:text-fg transition-colors inline-block"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/upcoming"
                    className="text-fg-muted hover:text-fg transition-colors inline-block"
                  >
                    Upcoming Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/past-events"
                    className="text-fg-muted hover:text-fg transition-colors inline-block"
                  >
                    Past Archives
                  </Link>
                </li>
                <li>
                  <Link
                    href="/leaderboard"
                    className="text-fg-muted hover:text-fg transition-colors inline-block"
                  >
                    Club Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery"
                    className="text-fg-muted hover:text-fg transition-colors inline-block"
                  >
                    Photo Gallery
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-ticket"
                    className="text-fg-muted hover:text-fg transition-colors inline-block"
                  >
                    Check Pass / Seat
                  </Link>
                </li>
                <li>
                  <Link
                    href="/team"
                    className="text-fg-muted hover:text-fg transition-colors inline-block"
                  >
                    Executive Team
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-fg-muted hover:text-fg transition-colors inline-block"
                  >
                    Join / Register
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: CONNECT */}
            <div>
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent mb-4">
                CONNECT
              </h4>
              <ul className="space-y-2.5 font-body text-sm">
                <li>
                  <a
                    href="https://instagram.com/chaturanga_jgec"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Chaturanga JGEC on Instagram"
                    className="text-fg-muted hover:text-fg transition-colors inline-flex items-center gap-3 group"
                  >
                    <InstagramIcon className="w-4 h-4 text-accent" />
                    <span>Instagram @chaturanga_jgec</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://facebook.com/chaturanga.jgec"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Chaturanga JGEC on Facebook"
                    className="text-fg-muted hover:text-fg transition-colors inline-flex items-center gap-3 group"
                  >
                    <FacebookIcon className="w-4 h-4 text-accent" />
                    <span>Facebook @chaturanga.jgec</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com/@chaturangajgec"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Subscribe to Chaturanga JGEC on YouTube"
                    className="text-fg-muted hover:text-fg transition-colors inline-flex items-center gap-3 group"
                  >
                    <YoutubeIcon className="w-4 h-4 text-accent" />
                    <span>YouTube @chaturangajgec</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@chaturanga-jgec.ac.in"
                    className="text-fg-muted hover:text-fg transition-colors inline-flex items-center gap-3 group"
                  >
                    <Mail className="w-4 h-4 text-accent" aria-hidden="true" />
                    <span>Contact Us</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Bar: Copyright & Deployment Stamp */}
      <div className="border-t border-border py-5 bg-surface-elevated">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-fg-muted">
          <div className="font-mono">
            © 2026 CHATURANGA • Jalpaiguri Government Engineering College. All rights reserved.
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <LastUpdatedBadge />
          </div>
        </div>
      </div>
    </footer>
  );
}
