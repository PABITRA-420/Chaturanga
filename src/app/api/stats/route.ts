import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Total Competitors: Registrations count + completed tournaments participant records
    const { count: regCount, error: regError } = await supabaseServer
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    if (regError) {
      return NextResponse.json(
        { success: false, error: regError.message || 'Failed to query registrations count.' },
        { status: 500 }
      );
    }

    const { data: tournamentsData, error: tournsDataError } = await supabaseServer
      .from('tournaments')
      .select('total_participants, registered_count, is_past, status');

    if (tournsDataError) {
      return NextResponse.json(
        { success: false, error: tournsDataError.message || 'Failed to query tournament participants.' },
        { status: 500 }
      );
    }

    const pastParticipantsSum = (tournamentsData || [])
      .filter((t: any) => t.is_past || t.status === 'completed')
      .reduce((sum: number, t: any) => sum + (Number(t.total_participants) || 0), 0);

    const competitorsCount = (regCount || 0) + pastParticipantsSum;

    // 2. Total Tournaments / Championships
    const { count: tournCount, error: tournCountError } = await supabaseServer
      .from('tournaments')
      .select('*', { count: 'exact', head: true });

    if (tournCountError) {
      return NextResponse.json(
        { success: false, error: tournCountError.message || 'Failed to query tournaments count.' },
        { status: 500 }
      );
    }

    const tournamentsCount = tournCount || 0;

    // 3. Peak Club Elo rating across all leaderboard players
    const { data: playersData, error: playersError } = await supabaseServer
      .from('leaderboard_players')
      .select('peak_elo, rapid_elo, blitz_elo, classical_elo')
      .eq('is_active', true);

    if (playersError) {
      return NextResponse.json(
        { success: false, error: playersError.message || 'Failed to query peak Elo ratings.' },
        { status: 500 }
      );
    }

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
        error: error.message || 'Failed to aggregate club statistics'
      },
      { status: 500 }
    );
  }
}
