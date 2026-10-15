import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Total Competitors: Registrations count + completed tournaments participant records
    let competitorsCount = 0;
    try {
      const { count: regCount } = await supabaseServer
        .from('registrations')
        .select('*', { count: 'exact', head: true });

      const { data: tournamentsData } = await supabaseServer
        .from('tournaments')
        .select('total_participants, registered_count, is_past, status');

      const pastParticipantsSum = (tournamentsData || [])
        .filter((t: any) => t.is_past || t.status === 'completed')
        .reduce((sum: number, t: any) => sum + (Number(t.total_participants) || 0), 0);

      competitorsCount = (regCount || 0) + pastParticipantsSum;
    } catch (err) {
      console.warn('Error computing competitors count:', err);
    }

    // 2. Total Tournaments / Championships
    let tournamentsCount = 0;
    try {
      const { count: tournCount } = await supabaseServer
        .from('tournaments')
        .select('*', { count: 'exact', head: true });

      tournamentsCount = tournCount || 0;
    } catch (err) {
      console.warn('Error computing tournaments count:', err);
    }

    // 3. Peak Club Elo rating across all leaderboard players
    let peakElo = 0;
    try {
      const { data: playersData } = await supabaseServer
        .from('leaderboard_players')
        .select('peak_elo, rapid_elo, blitz_elo, classical_elo')
        .eq('is_active', true);

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
    } catch (err) {
      console.warn('Error computing peak Elo:', err);
    }

    return NextResponse.json({
      success: true,
      stats: {
        competitors: competitorsCount,
        tournaments: tournamentsCount,
        peakElo: peakElo
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to aggregate club statistics',
        stats: {
          competitors: 0,
          tournaments: 0,
          peakElo: 0
        }
      },
      { status: 500 }
    );
  }
}
