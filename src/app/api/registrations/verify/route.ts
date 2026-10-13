import { NextResponse } from 'next/server';
import { findRegistration } from '@/lib/registrationStore';
import { getTournamentByName } from '@/lib/tournamentStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('roll') || searchParams.get('ticketId');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Roll Number, Ticket ID, or registered Email.' },
        { status: 400 }
      );
    }

    const registration = findRegistration(query.trim());

    if (!registration) {
      return NextResponse.json(
        { success: false, error: `No registration found matching "${query.trim()}". Please verify your Roll Number or Ticket ID.` },
        { status: 404 }
      );
    }

    // Attach tournament details if available
    const tournament = getTournamentByName(registration.tournament);

    return NextResponse.json({
      success: true,
      registration,
      tournament: tournament ? {
        id: tournament.id,
        title: tournament.title,
        date: tournament.date,
        time: tournament.time,
        venue: tournament.venue,
        format: tournament.format,
        status: tournament.status,
        arbiterName: tournament.arbiterName,
      } : null
    });
  } catch (error: any) {
    console.error('Registration verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while searching registration' },
      { status: 500 }
    );
  }
}
