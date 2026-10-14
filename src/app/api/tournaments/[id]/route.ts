import { NextResponse } from 'next/server';
import { getTournamentById, updateTournament, deleteTournament } from '@/lib/tournamentStore';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await getTournamentById(id);

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tournament
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to modify tournaments.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await updateTournament(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tournament updated successfully.',
      tournament: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to delete tournaments.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const success = await deleteTournament(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tournament deleted successfully.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
