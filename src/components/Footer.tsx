
"use client";

import React from 'react';
import Link from 'next/link';
import ChaturangaLogo from './ChaturangaLogo';
import { Lock, ArrowUpRight, Mail } from 'lucide-react';

export interface FooterProps {
  onOpenAdminModal?: () => void;
}

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" />
  </svg>
);

export default function Footer({ onOpenAdminModal }: FooterProps) {
  return (
    <footer className="w-full border-t border-white/10 bg-[#070A0E] text-xs text-[#A0A6B0] font-['Inter',sans-serif]">
      {/* Top Footer with Branding & Two-Column Navigation */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">

          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-[#D4AF7C]/40 p-1.5 shadow-md shadow-[#D4AF7C]/10">
                <ChaturangaLogo className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Montserrat',sans-serif] font-black text-base tracking-widest text-[#F5F5F5]">
                  CHATURANGA
                </span>
                <span className="text-[10px] text-[#D4AF7C] tracking-[0.22em] font-semibold uppercase">
                  CHESS CLUB • JGEC
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#A0A6B0] max-w-sm font-['Poppins',sans-serif] leading-relaxed">
              Official Chess Club of Jalpaiguri Government Engineering College. Promoting tactical discipline, collegiate qualifiers, and a thriving chess community.
            </p>

            {/* Admin Login Link */}
            <div className="pt-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-[#D4AF7C] bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-[#D4AF7C]/40 transition-all cursor-pointer group"
                title="Restricted Administrator Access"
              >
                <Lock className="w-3.5 h-3.5 text-[#D4AF7C] group-hover:scale-110 transition-transform" />
                <span>Admin Login Portal</span>
                <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </Link>
            </div>
          </div>

          {/* Right Columns: EXPLORE and CONNECT */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 md:pl-6">

            {/* Column 1: EXPLORE */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#D4AF7C] mb-4 font-['Montserrat',sans-serif]">
                EXPLORE
              </h4>
              <ul className="space-y-3 font-['Poppins',sans-serif] text-sm">
                <li>
                  <Link
                    href="/#about"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-block hover:translate-x-1 duration-200"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/upcoming"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-block hover:translate-x-1 duration-200"
                  >
                    Upcoming Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/past-events"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-block hover:translate-x-1 duration-200"
                  >
                    Past Archives
                  </Link>
                </li>
                <li>
                  <Link
                    href="/leaderboard"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-block hover:translate-x-1 duration-200"
                  >
                    Club Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-block hover:translate-x-1 duration-200"
                  >
                    Photo Gallery
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-ticket"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-block hover:translate-x-1 duration-200"
                  >
                    Check Pass / Seat
                  </Link>
                </li>
                <li>
                  <Link
                    href="/team"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-block hover:translate-x-1 duration-200"
                  >
                    Executive Team
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-block hover:translate-x-1 duration-200"
                  >
                    Join / Register
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: CONNECT */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-[0.22em] text-[#D4AF7C] mb-4 font-['Montserrat',sans-serif]">
                CONNECT
              </h4>
              <ul className="space-y-3 font-['Poppins',sans-serif] text-sm">
                <li>
                  <a
                    href="https://instagram.com/chaturanga_jgec"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Chaturanga JGEC on Instagram"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-flex items-center gap-3 group"
                  >
                    <InstagramIcon className="w-4 h-4 text-[#D4AF7C] group-hover:scale-110 transition-transform" />
                    <span>Instagram @chaturanga_jgec</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://facebook.com/chaturanga.jgec"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Chaturanga JGEC on Facebook"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-flex items-center gap-3 group"
                  >
                    <FacebookIcon className="w-4 h-4 text-[#D4AF7C] group-hover:scale-110 transition-transform" />
                    <span>Facebook @chaturanga.jgec</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com/@chaturangajgec"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Subscribe to Chaturanga JGEC on YouTube"
                    className="text-[#A0A6B0] hover:text-[#D4AF7C] transition-all inline-flex items-center gap-3 group"
                  >
                    <YoutubeIcon className="w-4 h-4 text-[#D4AF7C] group-hover:scale-110 transition-transform" />
                    <span>YouTube @chaturangajgec</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@chaturanga-jgec.ac.in"
                    className="text-[#A0A6B0] hover:text-[#F5F5F5] hover:text-[#D4AF7C] transition-all inline-flex items-center gap-3 group"
                  >
                    <Mail className="w-4 h-4 text-[#D4AF7C] group-hover:scale-110 transition-transform" />
                    <span>Contact Us</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Bar: Copyright */}
      <div className="border-t border-white/5 py-5 bg-[#05070A]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A0A6B0]/70">
          <div>
            © 2026 CHATURANGA • Jalpaiguri Government Engineering College. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#home" className="hover:text-[#D4AF7C] transition-colors">Back to top ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
