import { NextResponse } from 'next/server';
import { incrementTournamentRegistrations } from '@/lib/tournamentStore';
import { findDuplicateRegistration, addRegistration } from '@/lib/registrationStore';

export async function POST(request: Request) {
  try {
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
      customAnswers
    } = body;

    // Basic Validation
    if (!fullName || !rollNumber || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required registration details.' },
        { status: 400 }
      );
    }

    // Generate official unique registration code
    const tournamentName = tournament || 'Inter-College Chess Tournament 2026';
    const uniqueRandom = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticketId = body.ticketId || `CHTR-2026-${uniqueRandom}`;

    // Check for duplicate registration
    const existing = await findDuplicateRegistration(rollNumber, tournamentName);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          isDuplicate: true,
          existingTicketId: existing.ticketId,
          error: `Roll Number ${rollNumber} is already registered for "${tournamentName}". You can view and download your pass directly.`
        },
        { status: 409 }
      );
    }

    // Increment count in persistent tournament store
    try {
      await incrementTournamentRegistrations(tournamentName);
    } catch {
      // Non-blocking
    }

    const registrationRecord = {
      ticketId,
      tournament: tournamentName,
      fullName,
      rollNumber,
      institution: institution || 'Jalpaiguri Government Engineering College',
      department: department || 'General',
      year: year || 'Undergraduate',
      email,
      phone,
      ratingCategory: ratingCategory || 'Club Player (1200 - 1600)',
      chessUsername: chessUsername || 'N/A',
      fideId: fideId || 'Unrated',
      customAnswers: customAnswers || {},
      registeredAt: new Date().toISOString(),
      checkInStatus: 'confirmed' as const,
    };

    // Save to persistent registrations store
    await addRegistration(registrationRecord);

    const registrationPayload = {
      ...registrationRecord,
      uniqueCode: ticketId,
      customAnswers: customAnswers ? JSON.stringify(customAnswers) : '',
    };

    let syncedToSheet = false;
    let sheetError = null;

    // Check if Google Sheet WebApp URL is configured
    const googleSheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

    if (googleSheetUrl && googleSheetUrl.startsWith('http')) {
      try {
        // Google Apps Script requires redirect: 'follow' because POST endpoints issue 302 redirects
        const response = await fetch(googleSheetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationPayload),
          redirect: 'follow',
        });

        if (response.ok) {
          try {
            const gasResult = await response.json();
            if (gasResult && gasResult.status === 'success') {
              syncedToSheet = true;
            } else {
              sheetError = gasResult?.message || 'Google Apps Script reported an error.';
            }
          } catch {
            // In case text is returned
            syncedToSheet = true;
          }
        } else {
          sheetError = `Google Sheet returned status: ${response.status}`;
        }
      } catch (err: any) {
        sheetError = err.message || 'Failed to connect to Google Sheets';
        console.error('Google Sheet Sync Warning:', sheetError);
      }
    }

    return NextResponse.json({
      success: true,
      ticketId,
      syncedToSheet,
      sheetConfigured: Boolean(googleSheetUrl),
      sheetError,
      message: syncedToSheet 
        ? 'Registration successfully synced to Google Spreadsheet and live charts.'
        : 'Registration recorded. Configure GOOGLE_SHEET_WEBAPP_URL in .env.local to enable real-time sheet sync.'
    });

  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
