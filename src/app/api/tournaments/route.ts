import { NextResponse } from 'next/server';
import { getAllTournaments, createTournament, getLastTournamentDataSource } from '@/lib/tournamentStore';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const includeHidden = searchParams.get('includeHidden') === 'true';

    let tournaments = await getAllTournaments();

    if (!includeHidden) {
      tournaments = tournaments.filter(t => t.isVisible !== false);
    }

    if (type === 'upcoming') {
      tournaments = tournaments.filter(t => !t.isPast && t.status !== 'completed');
    } else if (type === 'past') {
      tournaments = tournaments.filter(t => t.isPast || t.status === 'completed');
    }

    if (status && status !== 'all') {
      tournaments = tournaments.filter(t => t.status === status);
    }

    const dataSource = getLastTournamentDataSource();

    return NextResponse.json(
      {
        success: true,
        tournaments,
        total: tournaments.length
      },
      {
        headers: {
          'x-data-source': dataSource,
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        }
      }
    );
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tournaments.' },
      { status }
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

    const created = await createTournament(body);

    return NextResponse.json({
      success: true,
      message: 'Tournament created successfully.',
      tournament: created
    }, { status: 201 });
  } catch (error: any) {
    const status = error.status || 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Server error while creating tournament.' },
      { status }
    );
  }
}
