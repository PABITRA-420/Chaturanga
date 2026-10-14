import { NextResponse } from 'next/server';
import { getTournamentById, updateTournament } from '@/lib/tournamentStore';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await getTournamentById(id);

    if (!tournament) {
      return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tournamentId: id,
      title: tournament.title,
      summary: tournament.summary || '',
      totalParticipants: tournament.totalParticipants || tournament.registeredCount || 0,
      podium: tournament.podium || [],
      results: tournament.results || []
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { podium, results, summary, totalParticipants } = body;

    const updated = await updateTournament(id, {
      podium: podium || [],
      results: results || [],
      summary: summary || undefined,
      totalParticipants: totalParticipants !== undefined ? Number(totalParticipants) : undefined,
      isPast: true,
      status: 'completed'
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tournament podium and results updated successfully.',
      tournament: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
