'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Swords, Trophy, Shield, Award, ShieldCheck } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'arena', label: 'Arena', href: '/', icon: Swords, exact: true },
  { id: 'events', label: 'Events', href: '/#tournaments', icon: Trophy },
  { id: 'teams', label: 'Teams', href: '/#team-swiss', icon: Shield },
  { id: 'certs', label: 'Verify', href: '/verify-cert', icon: Award },
  { id: 'arbiter', label: 'Arbiter', href: '/admin', icon: ShieldCheck },
];

export const MobileNavigation: React.FC = () => {
  const pathname = usePathname();

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    if (item.href.startsWith('/#')) {
      return pathname === '/';
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-2xl bg-[#070A0E]/92 border-t border-white/10 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.8)] pb-safe transition-all"
    >
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-around">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-90 min-w-[56px] min-h-[46px] relative ${
                active
                  ? 'text-[#D4AF7C]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {/* Active glow pill indicator */}
              {active && (
                <div className="absolute -top-1 w-8 h-1 rounded-full bg-[#D4AF7C] shadow-[0_0_10px_#D4AF7C]" />
              )}

              <div
                className={`p-1 rounded-lg transition-transform ${
                  active ? 'scale-110' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>

              <span className={`text-[10px] tracking-tight font-medium mt-0.5 ${active ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
