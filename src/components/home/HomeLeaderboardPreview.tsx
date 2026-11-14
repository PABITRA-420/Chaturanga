'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Trophy, Medal, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { LEADERBOARD_PLAYERS } from '@/data/leaderboardData';

function getPlayerDisplayRating(p: any) {
  if (!p) return { label: 'Rating', rating: 1200, platform: 'Lichess', format: 'Classical' };
  const lichess = p.lichessUsername;
  const chessCom = p.chessComVerified || p.chessComUsername;
  const platform = lichess ? 'Lichess' : (chessCom ? 'Chess.com' : 'Collegiate');

  const classical = p.rating?.classical || 0;
  const rapid = p.rating?.rapid || 0;
  const blitz = p.rating?.blitz || 0;

  if (classical >= rapid && classical >= blitz && classical > 1500) {
    return { label: 'Classical Elo', rating: classical, platform, format: 'Classical' };
  }
  if (rapid >= blitz && rapid > 1500) {
    return { label: 'Rapid Elo', rating: rapid, platform, format: 'Rapid' };
  }
  if (blitz > 1500) {
    return { label: 'Blitz Elo', rating: blitz, platform, format: 'Blitz' };
  }
  return { label: 'Peak Elo', rating: p.rating?.peak ?? p.rating?.rapid ?? 1200, platform, format: 'Classical' };
}

export default function HomeLeaderboardPreview() {
  const [players, setPlayers] = useState<any[]>(() => LEADERBOARD_PLAYERS.slice(0, 3));
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('chaturanga_leaderboard_preview');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPlayers(parsed);
          setLoading(false);
        }
      }
    } catch {}

    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.players)) {
          setPlayers(data.players);
          try {
            sessionStorage.setItem('chaturanga_leaderboard_preview', JSON.stringify(data.players));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const p1 = players[0];
  const p2 = players[1];
  const p3 = players[2];

  const info1 = p1 ? getPlayerDisplayRating(p1) : null;
  const info2 = p2 ? getPlayerDisplayRating(p2) : null;
  const info3 = p3 ? getPlayerDisplayRating(p3) : null;

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="p-6 sm:p-10 rounded-md bg-surface border border-border relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border mb-8">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
              <Crown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>03 / COLLEGIATE RATINGS STANDINGS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-fg tracking-tight">
              Club Elo Leaderboard <span className="text-accent">Top Board</span>
            </h2>
            <p className="text-xs sm:text-sm text-fg-muted max-w-xl font-body">
              Live ratings calibrated from official collegiate matches and verified Lichess &amp; Chess.com accounts.
            </p>
          </div>

          <Link
            href="/leaderboard"
            className="px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors inline-flex items-center gap-2 self-start md:self-end btn-tactile"
          >
            <span>{players.length > 0 ? `View Full (${players.length}) Leaderboard` : 'View Leaderboard'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch" data-testid="leaderboard-podium-skeleton">
            <div className="order-2 md:order-1 p-6 rounded-sm bg-surface-elevated border border-border flex flex-col justify-between space-y-4">
              <Skeleton className="w-24 h-5" />
              <Skeleton className="w-3/4 h-6" />
              <Skeleton className="w-1/2 h-4" />
            </div>

            <div className="order-1 md:order-2 p-6 rounded-sm bg-surface-elevated border-2 border-accent/60 flex flex-col justify-between space-y-4">
              <Skeleton className="w-28 h-5" />
              <Skeleton className="w-4/5 h-7" />
              <Skeleton className="w-3/5 h-4" />
            </div>

            <div className="order-3 p-6 rounded-sm bg-surface-elevated border border-border flex flex-col justify-between space-y-4">
              <Skeleton className="w-24 h-5" />
              <Skeleton className="w-3/4 h-6" />
              <Skeleton className="w-1/2 h-4" />
            </div>
          </div>
        ) : players.length === 0 ? (
          <div className="p-10 sm:p-12 rounded-sm bg-surface-elevated border border-border text-center space-y-4">
            <div className="w-12 h-12 rounded-sm bg-surface border border-border flex items-center justify-center mx-auto text-accent">
              <Trophy className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold font-heading text-fg">
                Season Leaderboard Calibration Pending
              </h3>
              <p className="text-xs sm:text-sm text-fg-muted leading-relaxed font-body">
                No rated club players recorded in the system yet. Compete in upcoming official Swiss championships to earn your collegiate ranking.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/upcoming"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors"
              >
                <span>Explore Tournaments &amp; Play</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            
            {/* Rank #2 Silver */}
            {p2 && info2 ? (
              <SpotlightCard className="order-2 md:order-1 p-6 rounded-sm bg-surface-elevated border border-border hover:border-border-strong flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-fg-muted px-2 py-0.5 rounded-xs bg-surface border border-border">
                      Rank #02 • Silver
                    </span>
                    <Medal className="w-5 h-5 text-fg-muted" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-fg">{p2.name}</h3>
                  <p className="text-xs text-fg-muted mt-0.5 font-mono">
                    {info2.platform} {info2.format}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-fg-muted block">Handle</span>
                    <span className="text-xs text-fg font-mono">@{p2.lichessUsername || p2.chessUsername || 'player'}</span>
                  </div>
                  <span className="font-mono text-2xl font-bold text-fg tabular-nums">{info2.rating}</span>
                </div>
              </SpotlightCard>
            ) : (
              <div className="order-2 md:order-1 p-6 rounded-sm bg-surface-elevated border border-dashed border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-medium text-fg-muted px-2 py-0.5 rounded-xs bg-surface border border-border">
                      Rank #02 • Silver
                    </span>
                    <Medal className="w-5 h-5 text-fg-muted opacity-50" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-base text-fg-muted">Contender Slot Open</h3>
                  <p className="text-xs text-fg-muted mt-1">Play in upcoming Swiss rounds to claim rank #2</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-fg-muted">Status</span>
                  <span className="font-mono text-xs text-fg-muted">Unclaimed</span>
                </div>
              </div>
            )}

            {/* Rank #1 Champion */}
            {p1 && info1 && (
              <SpotlightCard className="order-1 md:order-2 p-6 rounded-sm bg-surface-elevated border-2 border-accent flex flex-col justify-between relative">
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent px-2 py-0.5 rounded-xs bg-accent/10 border border-accent/40">
                        Rank #01
                      </span>
                      <span className="px-2 py-0.5 rounded-xs bg-accent text-on-accent font-mono font-bold text-[10px] tracking-wider uppercase">
                        CHAMPION
                      </span>
                    </div>
                    <Crown className="w-5 h-5 text-accent shrink-0" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-extrabold text-xl text-fg">{p1.name}</h3>
                  <p className="text-xs text-accent font-mono font-semibold mt-0.5">
                    {info1.platform} {info1.format}
                  </p>
                </div>
                <div className="relative z-10 mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-fg-muted block">Handle</span>
                    <span className="text-xs text-fg font-mono">@{p1.lichessUsername || p1.chessUsername || 'champion'}</span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-accent tabular-nums">{info1.rating}</span>
                </div>
              </SpotlightCard>
            )}

            {/* Rank #3 Bronze */}
            {p3 && info3 ? (
              <SpotlightCard className="order-3 md:order-3 p-6 rounded-sm bg-surface-elevated border border-border hover:border-border-strong flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-warning px-2 py-0.5 rounded-xs bg-surface border border-warning/40">
                      Rank #03 • Bronze
                    </span>
                    <Medal className="w-5 h-5 text-warning" aria-hidden="true" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-fg">{p3.name}</h3>
                  <p className="text-xs text-warning font-mono font-semibold mt-0.5">
                    {info3.platform} {info3.format}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-fg-muted block">Handle</span>
                    <span className="text-xs text-fg font-mono">@{p3.lichessUsername || p3.chessUsername || 'player'}</span>
                  </div>
                  <span className="font-mono text-2xl font-bold text-warning tabular-nums">{info3.rating}</span>
                </div>
              </SpotlightCard>
            ) : (
              <div className="order-3 md:order-3 p-6 rounded-sm bg-surface-elevated border border-dashed border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-medium text-fg-muted px-2 py-0.5 rounded-xs bg-surface border border-border">
                      Rank #03 • Bronze
                    </span>
                    <Medal className="w-5 h-5 text-fg-muted opacity-50" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-base text-fg-muted">Contender Slot Open</h3>
                  <p className="text-xs text-fg-muted mt-1">Play in upcoming Swiss rounds to claim rank #3</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-fg-muted">Status</span>
                  <span className="font-mono text-xs text-fg-muted">Unclaimed</span>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
