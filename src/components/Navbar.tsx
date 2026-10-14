"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ChaturangaLogo from './ChaturangaLogo';
import { Menu, X, Sparkles } from 'lucide-react';

export interface NavbarProps {
  onRegisterClick?: () => void;
}

export default function Navbar({ onRegisterClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Upcoming', href: '/upcoming' },
    { name: 'Past Events', href: '/past-events' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Our Team', href: '/team' },
    { name: 'Check Pass', href: '/my-ticket' },
    { name: 'Register', href: '/register' },
  ];

  // Window scroll state for all pages
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    setMobileMenuOpen(false);

    // If on homepage and clicking Home
    if (pathname === '/' && href === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      router.push('/register');
    }
  };

  // Determine whether this link is currently active
  const isLinkActive = (link: typeof navLinks[0]) => {
    if (pathname === link.href) return true;
    if (link.href !== '/' && pathname.startsWith(link.href)) return true;
    return false;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 font-['Inter',sans-serif] ${
        scrolled
          ? 'bg-[#0B0F14]/90 backdrop-blur-md border-b border-white/10 shadow-2xl shadow-black/80'
          : 'bg-[#0B0F14]/70 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* BRAND: Logo + CHATURANGA CHESS CLUB */}
          <div className="flex items-center gap-3.5">
            <Link
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="group flex items-center gap-3.5 focus:outline-none cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-[#D4AF7C]/40 p-1.5 shadow-md shadow-[#D4AF7C]/10 group-hover:border-[#D4AF7C] transition-all duration-200">
                <ChaturangaLogo className="w-full h-full" />
              </div>

              <div className="flex flex-col justify-center">
                <span className="font-['Montserrat',sans-serif] font-black tracking-widest text-[#F5F5F5] text-lg sm:text-xl leading-none">
                  CHATURANGA
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#D4AF7C] tracking-[0.22em] mt-1 uppercase">
                  CHESS CLUB
                </span>
              </div>
            </Link>
          </div>

          {/* DESKTOP NAV LINKS WITH SMOOTH ANIMATED INDICATOR */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md text-sm">
            {navLinks.map((link) => {
              const active = isLinkActive(link);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'text-[#F5F5F5] bg-[#D4AF7C]/15 border border-[#D4AF7C]/40 shadow-[0_0_12px_rgba(212,175,124,0.25)]'
                      : 'text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  {/* Glowing gold dot for active state */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full bg-[#D4AF7C] shadow-[0_0_8px_#D4AF7C] transition-all duration-300 ${
                      active ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0 -mr-1.5'
                    }`}
                  />

                  <span>{link.name}</span>

                  {/* Dynamic beam glow under active item */}
                  <span
                    className={`absolute -bottom-[3px] left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF7C] to-transparent rounded-full transition-all duration-300 ${
                      active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE: JOIN US BUTTON (Desktop only, mobile/tablet button is inside lg:hidden below) */}
          <div className="hidden lg:flex items-center">
            <button
              type="button"
              onClick={handleJoinClick}
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition-all duration-200 shadow-md shadow-[#D4AF7C]/20 active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join Us</span>
            </button>
          </div>

          {/* MOBILE TOGGLE MENU BUTTON */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-[#F5F5F5] hover:text-[#D4AF7C] hover:bg-white/5 transition cursor-pointer flex items-center justify-center active:scale-95"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#D4AF7C]" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE SLIDE-DOWN DRAWER */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out border-t border-white/10 overflow-hidden bg-[#0B0F14]/98 backdrop-blur-2xl ${
          mobileMenuOpen
            ? 'max-h-[500px] opacity-100 py-4 px-6'
            : 'max-h-0 opacity-0 pointer-events-none p-0'
        }`}
      >
        <div className="flex flex-col space-y-2">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-[#F5F5F5] bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 font-semibold'
                    : 'text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5'
                }`}
              >
                <span>{link.name}</span>
                {active && (
                  <span className="w-2 h-2 rounded-full bg-[#D4AF7C] shadow-[0_0_6px_#D4AF7C]" />
                )}
              </Link>
            );
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleJoinClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join Us</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
