"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ChaturangaLogo from './ChaturangaLogo';
import { Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { useUIStore, ThemeMode } from '@/stores/useUIStore';

export interface NavbarProps {
  onRegisterClick?: () => void;
}

export default function Navbar({ onRegisterClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

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

  // Sync theme store from DOM attribute initialized before hydration
  useEffect(() => {
    setMounted(true);
    const domTheme = document.documentElement.dataset.theme as ThemeMode | undefined;
    if (domTheme === 'light' || domTheme === 'dark') {
      useUIStore.setState({ theme: domTheme });
    } else {
      const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
      setTheme(prefersLight ? 'light' : 'dark');
    }
  }, [setTheme]);

  // Window scroll state (bails out with zero re-renders when unchanged)
  useEffect(() => {
    const handleScroll = () => {
      const isOver = window.scrollY > 15;
      setScrolled((prev) => (prev !== isOver ? isOver : prev));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    setMobileMenuOpen(false);

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

  const isLinkActive = (link: (typeof navLinks)[0]) => {
    if (pathname === link.href) return true;
    if (link.href !== '/' && pathname.startsWith(link.href)) return true;
    return false;
  };

  return (
    <header
      data-scrolled={scrolled ? 'true' : 'false'}
      style={scrolled ? { boxShadow: 'var(--shadow-sm)' } : undefined}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-200 font-ui gpu-layer ${
        scrolled
          ? 'bg-bg/95 backdrop-blur-md border-b border-border-strong/40'
          : 'bg-bg/85 backdrop-blur-xs border-b border-border'
      }`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* BRAND: Swiss Medallion + Typography */}
          <div className="flex items-center gap-3.5 shrink-0">
            <Link
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="group flex items-center gap-3 cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-sm bg-[#111114] border border-border-strong p-1.5 transition-colors duration-150 group-hover:border-accent">
                <ChaturangaLogo className="w-full h-full" />
              </div>

              <div className="flex flex-col justify-center">
                <span className="font-heading font-extrabold tracking-tight text-fg text-base sm:text-lg leading-none">
                  CHATURANGA
                </span>
                <span className="text-[10px] font-mono font-semibold text-accent tracking-[0.2em] mt-1 uppercase">
                  CHESS CLUB
                </span>
              </div>
            </Link>
          </div>

          {/* DESKTOP NAV LINKS: Swiss Minimal Architectural Strip */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-0.5 p-1 rounded-sm bg-surface border border-border text-xs"
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`relative px-3 py-1.5 rounded-xs text-xs font-semibold tracking-wide transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'text-fg bg-accent/15 border border-accent/40'
                      : 'text-fg-muted hover:text-fg hover:bg-surface-elevated border border-transparent'
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="w-1.5 h-1.5 rounded-xs bg-accent shrink-0"
                    />
                  )}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS: Theme Mode Toggle + Primary CTA */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              data-testid="theme-toggle-btn"
              aria-label={mounted && theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={mounted && theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              className="w-9 h-9 rounded-sm bg-surface hover:bg-surface-elevated border border-border hover:border-border-strong text-fg-muted hover:text-fg flex items-center justify-center transition-colors btn-tactile"
            >
              {mounted && theme === 'light' ? (
                <Moon className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Sun className="w-4 h-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={handleJoinClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer btn-tactile"
            >
              <span>Join Us</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* MOBILE ACTIONS: Theme Toggle + Hamburger Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={mounted && theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-sm bg-surface border border-border text-fg hover:border-border-strong transition-colors flex items-center justify-center btn-tactile"
            >
              {mounted && theme === 'light' ? (
                <Moon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Sun className="w-5 h-5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-sm bg-surface border border-border text-fg hover:border-border-strong transition-colors flex items-center justify-center btn-tactile"
              aria-label="Toggle Navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-accent" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div
        className={`lg:hidden transition-all duration-200 ease-in-out border-t border-border overflow-hidden bg-surface ${
          mobileMenuOpen
            ? 'max-h-[520px] opacity-100 py-4 px-6'
            : 'max-h-0 opacity-0 pointer-events-none p-0'
        }`}
      >
        <div className="flex flex-col space-y-1.5">
          {navLinks.map((link) => {
            const active = isLinkActive(link);
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`flex items-center justify-between py-2.5 px-3 rounded-sm text-sm font-medium transition-colors ${
                  active
                    ? 'text-fg bg-accent/15 border border-accent/40 font-semibold'
                    : 'text-fg-muted hover:text-fg hover:bg-surface-elevated border border-transparent'
                }`}
              >
                <span>{link.name}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-xs bg-accent" aria-hidden="true" />
                )}
              </Link>
            );
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleJoinClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <span>Join Us</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
