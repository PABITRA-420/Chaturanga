import Link from 'next/link';
import { Home, ArrowRight, Trophy } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center relative overflow-hidden chess-bg-pattern">
      <div className="relative z-10 text-center max-w-lg mx-auto px-6 space-y-8">
        {/* Swiss Square Emblem */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-surface border border-border-strong text-accent mx-auto">
          <span className="text-3xl select-none" aria-hidden="true">♞</span>
        </div>

        {/* Error Typography */}
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-fg-muted">
            Status 404 • Out of Bounds
          </p>
          <h1 className="font-heading font-extrabold text-7xl sm:text-8xl text-fg tracking-tighter tabular-nums">
            404
          </h1>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-fg">
            Illegal Move Detected
          </h2>
          <p className="font-body text-sm text-fg-muted leading-relaxed max-w-md mx-auto">
            You blundered onto an empty square. Looks like this page was captured or never existed on our board. Let&apos;s castle back to safety.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-ui text-xs font-bold uppercase tracking-wider text-on-primary bg-primary hover:opacity-90 transition-opacity btn-tactile"
          >
            <Home className="w-4 h-4" />
            <span>Castle Back Home</span>
          </Link>

          <Link
            href="/upcoming"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm font-ui text-xs font-semibold uppercase tracking-wider text-fg bg-surface hover:bg-surface-elevated border border-border hover:border-border-strong transition-colors btn-tactile"
          >
            <Trophy className="w-4 h-4 text-accent" />
            <span>View Tournaments</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-border flex flex-wrap items-center justify-center gap-6 text-xs text-fg-muted font-ui">
          <Link href="/register" className="hover:text-fg transition-colors flex items-center gap-1">
            Register <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/team" className="hover:text-fg transition-colors flex items-center gap-1">
            Our Team <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/past-events" className="hover:text-fg transition-colors flex items-center gap-1">
            Past Events <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
