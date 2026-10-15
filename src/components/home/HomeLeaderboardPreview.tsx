'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Trophy, Medal, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

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
  const [players, setPlayers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.players)) {
          setPlayers(data.players);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const p1 = players[0]; // Gold #1
  const p2 = players[1]; // Silver #2
  const p3 = players[2]; // Bronze #3

  const info1 = p1 ? getPlayerDisplayRating(p1) : null;
  const info2 = p2 ? getPlayerDisplayRating(p2) : null;
  const info3 = p3 ? getPlayerDisplayRating(p3) : null;

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#141820] to-[#0D1016] border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 mb-2">
              <Crown className="w-3.5 h-3.5" />
              <span>COLLEGIATE RATINGS STANDINGS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-['Montserrat',sans-serif] text-[#F5F5F5]">
              Club Elo Leaderboard <span className="text-[#D4AF7C]">Top Board</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A6B0] mt-1 max-w-xl font-['Poppins',sans-serif]">
              Live ratings calibrated from official collegiate matches and verified Lichess &amp; Chess.com accounts.
            </p>
          </div>

          <Link
            href="/leaderboard"
            className="px-5 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition inline-flex items-center gap-2 self-start md:self-end shadow-md shadow-[#D4AF7C]/20"
          >
            <span>{players.length > 0 ? `View Full (${players.length}) Leaderboard` : 'View Leaderboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-black/40 border border-white/5 animate-pulse space-y-4">
                <div className="h-6 w-24 bg-white/10 rounded-full" />
                <div className="h-6 w-40 bg-white/10 rounded-lg" />
                <div className="h-4 w-28 bg-white/5 rounded-md" />
                <div className="h-10 w-full bg-white/5 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : players.length === 0 ? (
          /* Empty State: 0 Players */
          <div className="p-10 sm:p-12 rounded-2xl bg-black/40 border border-white/5 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center mx-auto text-[#D4AF7C]">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-bold font-['Montserrat',sans-serif] text-[#F5F5F5]">
                Season Leaderboard Calibration Pending
              </h3>
              <p className="text-xs sm:text-sm text-[#A0A6B0] leading-relaxed font-['Poppins',sans-serif]">
                No rated club players recorded in the system yet. Compete in upcoming official Swiss championships to earn your collegiate ranking and claim the top board!
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/upcoming"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 shadow-md transition"
              >
                <span>Explore Tournaments &amp; Play</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* 1, 2, or 3+ Players */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Silver #2 */}
            {p2 && info2 ? (
              <div className="order-2 md:order-1 p-6 rounded-2xl bg-black/40 border border-slate-400/20 hover:border-slate-300/40 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300 px-2.5 py-0.5 rounded-full bg-slate-300/10 border border-slate-300/30">
                      Rank #2 • Silver
                    </span>
                    <span className="text-lg">🥈</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#F5F5F5]">{p2.name}</h3>
                  <p className="text-xs text-[#A0A6B0]">
                    <span className="text-slate-300 font-semibold">{info2.platform} {info2.format}</span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{info2.platform} {info2.format}</span>
                    <span className="text-xs text-[#A0A6B0] font-mono">@{p2.lichessUsername || p2.chessUsername}</span>
                  </div>
                  <span className="font-mono text-xl font-bold text-slate-200">{info2.rating}</span>
                </div>
              </div>
            ) : (
              <div className="order-2 md:order-1 p-6 rounded-2xl bg-black/20 border border-dashed border-slate-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400 px-2.5 py-0.5 rounded-full bg-white/5">
                      Rank #2 • Silver
                    </span>
                    <span className="text-lg opacity-50">🥈</span>
                  </div>
                  <h3 className="font-semibold text-base text-[#A0A6B0]">Contender Slot Open</h3>
                  <p className="text-xs text-[#A0A6B0]/60">Play in upcoming Swiss rounds to claim rank #2</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-[#A0A6B0]/60">Status</span>
                  <span className="font-mono text-xs text-[#A0A6B0]">Unclaimed</span>
                </div>
              </div>
            )}

            {/* Gold #1 */}
            {p1 && info1 && (
              <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-[#1C1710] to-[#12161D] border-2 border-[#D4AF7C] shadow-lg shadow-[#D4AF7C]/15 flex flex-col justify-between relative transform md:-translate-y-2">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#D4AF7C] text-[#0B0F14] font-black text-[10px] tracking-wider uppercase">
                  REIGNING CHAMPION
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#D4AF7C] px-2.5 py-0.5 rounded-full bg-[#D4AF7C]/20 border border-[#D4AF7C]/40">
                      Rank #1 • Gold Crown
                    </span>
                    <span className="text-xl">👑</span>
                  </div>
                  <h3 className="font-black text-xl text-[#F5F5F5]">{p1.name}</h3>
                  <p className="text-xs text-[#A0A6B0]">
                    <span className="text-[#D4AF7C] font-semibold">{info1.platform} {info1.format}</span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#D4AF7C]/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#D4AF7C] block">{info1.platform} {info1.format}</span>
                    <span className="text-xs text-[#A0A6B0] font-mono">@{p1.lichessUsername || p1.chessUsername}</span>
                  </div>
                  <span className="font-mono text-2xl font-black text-[#D4AF7C]">{info1.rating}</span>
                </div>
              </div>
            )}

            {/* Bronze #3 */}
            {p3 && info3 ? (
              <div className="order-3 md:order-3 p-6 rounded-2xl bg-black/40 border border-amber-700/30 hover:border-amber-600/40 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-500 px-2.5 py-0.5 rounded-full bg-amber-700/20 border border-amber-700/40">
                      Rank #3 • Bronze
                    </span>
                    <span className="text-lg">🥉</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#F5F5F5]">{p3.name}</h3>
                  <p className="text-xs text-[#A0A6B0]">
                    <span className="text-amber-400 font-semibold">{info3.platform} {info3.format}</span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-500 block">{info3.platform} {info3.format}</span>
                    <span className="text-xs text-[#A0A6B0] font-mono">@{p3.lichessUsername || p3.chessUsername}</span>
                  </div>
                  <span className="font-mono text-xl font-bold text-amber-400">{info3.rating}</span>
                </div>
              </div>
            ) : (
              <div className="order-3 md:order-3 p-6 rounded-2xl bg-black/20 border border-dashed border-amber-700/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-amber-600/70 px-2.5 py-0.5 rounded-full bg-white/5">
                      Rank #3 • Bronze
                    </span>
                    <span className="text-lg opacity-50">🥉</span>
                  </div>
                  <h3 className="font-semibold text-base text-[#A0A6B0]">Contender Slot Open</h3>
                  <p className="text-xs text-[#A0A6B0]/60">Play in upcoming Swiss rounds to claim rank #3</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-[#A0A6B0]/60">Status</span>
                  <span className="font-mono text-xs text-[#A0A6B0]">Unclaimed</span>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
