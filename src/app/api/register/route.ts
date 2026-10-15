import { NextResponse } from 'next/server';
import { incrementTournamentRegistrations } from '@/lib/tournamentStore';
import { findDuplicateRegistration, addRegistration, RegistrationRecord } from '@/lib/registrationStore';
import { verifyPlayerAccount } from '@/lib/playerVerification';

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
      chessPlatform,
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

    // Chess account validation & verification using shared verification logic
    const cleanUsername = typeof chessUsername === 'string'
      ? chessUsername.replace(/\s*\(.*?\)\s*$/, '').trim()
      : '';
    let validatedPlatform: 'chesscom' | 'lichess' | null = null;
    let verifiedChessUsername = 'N/A';

    if (cleanUsername) {
      const rawPlatform = typeof chessPlatform === 'string' ? chessPlatform.trim().toLowerCase() : '';
      const normPlatform = rawPlatform === 'chess.com' ? 'chesscom' : rawPlatform;

      if (normPlatform !== 'chesscom' && normPlatform !== 'lichess') {
        return NextResponse.json(
          { success: false, error: 'Invalid chess platform. Only chesscom or lichess are accepted.' },
          { status: 400 }
        );
      }

      validatedPlatform = normPlatform;

      const verification = await verifyPlayerAccount(validatedPlatform, cleanUsername);

      if (!verification.success) {
        return NextResponse.json(
          {
            success: false,
            error: verification.error || 'Chess account verification service is currently unavailable. Please retry.'
          },
          { status: verification.status || 502 }
        );
      }

      if (!verification.exists) {
        return NextResponse.json(
          {
            success: false,
            error: verification.message || `Player "${cleanUsername}" does not exist on ${validatedPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'}. Please check your ID carefully.`
          },
          { status: 400 }
        );
      }

      // Store only the trimmed handle; keep platform labels out because chessPlatform is stored separately
      verifiedChessUsername = verification.username || cleanUsername;
    } else {
      validatedPlatform = null;
      verifiedChessUsername = 'N/A';
    }

    // Increment count in persistent tournament store
    try {
      await incrementTournamentRegistrations(tournamentName);
    } catch {
      // Non-blocking
    }

    const registrationRecord: RegistrationRecord = {
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
      chessPlatform: validatedPlatform,
      chessUsername: verifiedChessUsername,
      fideId: fideId || 'Unrated',
      customAnswers: customAnswers || {},
      registeredAt: new Date().toISOString(),
      checkInStatus: 'confirmed' as const,
    };

    // Save to persistent registrations store only after verification succeeds
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
