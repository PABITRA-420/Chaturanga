import { NextResponse } from 'next/server';
import { 
  getAllRegistrations, 
  updateRegistrationStatus, 
  deleteRegistration, 
  getRegistrationStats,
  addRegistration,
  findDuplicateRegistration
} from '@/lib/registrationStore';
import { 
  incrementTournamentRegistrations, 
  decrementTournamentRegistrations 
} from '@/lib/tournamentStore';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournament = searchParams.get('tournament');
    const search = searchParams.get('search')?.toLowerCase();
    const status = searchParams.get('status');

    let list = await getAllRegistrations();

    if (tournament && tournament !== 'All' && tournament !== 'all') {
      const tLower = tournament.toLowerCase();
      list = list.filter(r => 
        r.tournament.toLowerCase() === tLower ||
        r.tournament.toLowerCase().includes(tLower)
      );
    }

    if (status && status !== 'all') {
      list = list.filter(r => r.checkInStatus === status);
    }

    if (search) {
      list = list.filter(r => 
        r.fullName.toLowerCase().includes(search) ||
        r.rollNumber.toLowerCase().includes(search) ||
        r.ticketId.toLowerCase().includes(search) ||
        r.department.toLowerCase().includes(search) ||
        r.institution.toLowerCase().includes(search) ||
        (r.chessUsername && r.chessUsername.toLowerCase().includes(search)) ||
        (r.fideId && r.fideId.toLowerCase().includes(search))
      );
    }

    const stats = await getRegistrationStats();

    return NextResponse.json({ 
      success: true, 
      count: list.length, 
      registrations: list,
      stats
    });
  } catch (error: any) {
    console.error('Error in GET /api/registrations:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await isAdminAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized arbiter session required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      rollNumber,
      institution,
      department,
      year,
      email,
      phone,
      chessUsername,
      fideId,
      ratingCategory,
      tournament,
      customAnswers,
      checkInStatus
    } = body;

    if (!fullName || !rollNumber || !tournament) {
      return NextResponse.json(
        { success: false, error: 'Full name, roll number, and tournament are required.' },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await findDuplicateRegistration(rollNumber, tournament);
    if (existing) {
      return NextResponse.json(
        { 
          success: false, 
          isDuplicate: true, 
          existingTicketId: existing.ticketId,
          error: `Player with roll number ${rollNumber} already registered for ${tournament} (${existing.ticketId})` 
        },
        { status: 409 }
      );
    }

    const uniqueCode = `CHTR-2026-WLK${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      ticketId: uniqueCode,
      tournament,
      fullName,
      rollNumber,
      institution: institution || 'Jalpaiguri Government Engineering College',
      department: department || 'General',
      year: year || 'Undergraduate',
      email: email || `${rollNumber}@jgec.ac.in`,
      phone: phone || '0000000000',
      ratingCategory: ratingCategory || 'Club Player (1200 - 1600)',
      chessUsername: chessUsername || 'N/A',
      fideId: fideId || 'Unrated',
      customAnswers: customAnswers || {},
      registeredAt: new Date().toISOString(),
      checkInStatus: (checkInStatus || 'checked_in') as 'registered' | 'confirmed' | 'checked_in'
    };

    await addRegistration(newRecord);
    try {
      await incrementTournamentRegistrations(tournament);
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Walk-in player registered successfully',
      registration: newRecord
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to create walk-in registration' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await isAdminAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ticketId, status } = body;

    if (!ticketId || !['registered', 'confirmed', 'checked_in'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updated = await updateRegistrationStatus(ticketId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Status updated to ${status}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to update registration' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await isAdminAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticketId parameter' }, { status: 400 });
    }

    const result = await deleteRegistration(ticketId);
    if (!result.success) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (result.deletedRecord?.tournament) {
      await decrementTournamentRegistrations(result.deletedRecord.tournament);
    }

    return NextResponse.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete registration' }, { status: 500 });
  }
}
