import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface CachedStats {
  data: {
    competitors: number;
    tournaments: number;
    peakElo: number;
  };
  cachedAt: number;
}

let memoryStatsCache: CachedStats | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds server-side in-memory cache

export async function GET() {
  const now = Date.now();

  // 1. Serve immediately from memory if cache is warm
  if (memoryStatsCache && now - memoryStatsCache.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(
      { success: true, stats: memoryStatsCache.data, cached: true },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'x-cache': 'HIT',
        },
      }
    );
  }

  try {
    // 2. Parallelize all queries concurrently with Promise.all
    const [regResult, tournsResult, playersResult] = await Promise.all([
      // Total Registrations count
      supabaseServer
        .from('registrations')
        .select('*', { count: 'exact', head: true }),

      // Tournament list for count & past participants sum
      supabaseServer
        .from('tournaments')
        .select('total_participants, registered_count, is_past, status'),

      // Leaderboard players for peak Elo
      supabaseServer
        .from('leaderboard_players')
        .select('peak_elo, rapid_elo, blitz_elo, classical_elo')
        .eq('is_active', true),
    ]);

    // Handle any query errors gracefully by using cached data or safe defaults
    const regCount = regResult.count || 0;
    const tournamentsData = tournsResult.data || [];
    const playersData = playersResult.data || [];

    const pastParticipantsSum = tournamentsData
      .filter((t: any) => t.is_past || t.status === 'completed')
      .reduce((sum: number, t: any) => sum + (Number(t.total_participants) || 0), 0);

    const competitorsCount = regCount + pastParticipantsSum;
    const tournamentsCount = tournamentsData.length || 0;

    let peakElo = 0;
    if (playersData && playersData.length > 0) {
      for (const p of playersData) {
        const candidates = [p.peak_elo, p.rapid_elo, p.blitz_elo, p.classical_elo].filter(
          (r): r is number => typeof r === 'number' && !isNaN(r) && r > 0
        );
        for (const c of candidates) {
          if (c > peakElo) peakElo = c;
        }
      }
    }

    const statsPayload = {
      competitors: competitorsCount,
      tournaments: tournamentsCount,
      peakElo: peakElo,
    };

    // Update server in-memory cache
    memoryStatsCache = {
      data: statsPayload,
      cachedAt: now,
    };

    return NextResponse.json(
      {
        success: true,
        stats: statsPayload,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'x-cache': 'MISS',
        },
      }
    );
  } catch (error: any) {
    // If database stalls under high load, serve cached stats if available
    if (memoryStatsCache) {
      return NextResponse.json(
        { success: true, stats: memoryStatsCache.data, degraded: true },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            'x-cache': 'STALE-FALLBACK',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to aggregate club statistics',
      },
      { status: 500 }
    );
  }
}

