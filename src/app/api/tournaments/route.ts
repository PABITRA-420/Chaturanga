import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllTournaments, createTournament } from '@/lib/tournamentStore';

// Helper to check admin session
async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('chaturanga_admin_session');
  return Boolean(session && session.value === 'authenticated_arbiter_session_2026');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'upcoming', 'past', or undefined for all
    const status = searchParams.get('status');

    let tournaments = getAllTournaments();

    if (type === 'upcoming') {
      tournaments = tournaments.filter(t => !t.isPast && t.status !== 'completed');
    } else if (type === 'past') {
      tournaments = tournaments.filter(t => t.isPast || t.status === 'completed');
    }

    if (status && status !== 'all') {
      tournaments = tournaments.filter(t => t.status === status);
    }

    return NextResponse.json({
      success: true,
      tournaments,
      total: tournaments.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tournaments.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to create tournaments.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body.title || !body.venue) {
      return NextResponse.json(
        { success: false, error: 'Tournament title and venue are required.' },
        { status: 400 }
      );
    }

    const created = createTournament(body);

    return NextResponse.json({
      success: true,
      message: 'Tournament created successfully.',
      tournament: created
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error while creating tournament.' },
      { status: 500 }
    );
  }
}
