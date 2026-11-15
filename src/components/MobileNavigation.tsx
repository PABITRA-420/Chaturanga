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
      style={{ boxShadow: 'var(--shadow-sm)' }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden backdrop-blur-md bg-surface/95 border-t border-border pb-safe transition-colors"
    >
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-sm transition-colors duration-150 cursor-pointer min-w-[56px] min-h-[46px] relative ${
                active
                  ? 'text-accent'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              {/* Swiss Hairline Top Rule Indicator */}
              {active && (
                <div className="absolute -top-1.5 w-8 h-0.5 bg-accent" aria-hidden="true" />
              )}

              <div className="p-1">
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} aria-hidden="true" />
              </div>

              <span className={`text-[10px] tracking-tight font-ui mt-0.5 ${active ? 'font-bold' : 'font-medium'}`}>
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
