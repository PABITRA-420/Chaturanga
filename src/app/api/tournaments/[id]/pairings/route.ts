import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getTournamentById } from '@/lib/tournamentStore';
import { getAllRegistrations } from '@/lib/registrationStore';
import {
  createRound,
  getRoundsByTournament,
  manualSwapBoardPlayers,
  publishRound,
  updateMatchResult,
  updateRound,
} from '@/lib/pairingsStore';
import { calculateStandings, generateSwissPairings } from '@/lib/swissPairing';
import { MatchResult, PairingPlayer, TournamentMatch } from '@/types/pairing';

// Collegiate mock players for immediate seeding when no registrations are found
const DEFAULT_SEED_PLAYERS: PairingPlayer[] = [
  { id: 'p1', name: 'Arjun Das', rating: 1980, fide_id: '5012341' },
  { id: 'p2', name: 'Subham Mukherjee', rating: 1875, fide_id: '5012342' },
  { id: 'p3', name: 'Priya Sen', rating: 1790, fide_id: '5012343' },
  { id: 'p4', name: 'Debjit Paul', rating: 1720, fide_id: '5012344' },
  { id: 'p5', name: 'Ananya Roy', rating: 1650, fide_id: '5012345' },
  { id: 'p6', name: 'Rohit Sarkar', rating: 1580, fide_id: '5012346' },
  { id: 'p7', name: 'Sneha Barman', rating: 1510, fide_id: '5012347' },
  { id: 'p8', name: 'Kushal Dey', rating: 1440, fide_id: '5012348' },
];

async function getTournamentParticipants(tournamentId: string, tournamentTitle?: string): Promise<PairingPlayer[]> {
  try {
    const allRegs = await getAllRegistrations();
    const matching = allRegs.filter(
      r =>
        r.tournament === tournamentId ||
        r.tournament === tournamentTitle ||
        (r as any).tournamentId === tournamentId
    );

    if (matching.length >= 2) {
      return matching.map(r => {
        let rating = 1400;
        if (r.ratingCategory?.toLowerCase().includes('advanced')) rating = 1800;
        else if (r.ratingCategory?.toLowerCase().includes('intermediate')) rating = 1500;
        else if (r.ratingCategory?.toLowerCase().includes('beginner')) rating = 1200;

        return {
          id: r.ticketId || r.rollNumber,
          name: r.fullName,
          rating,
          fide_id: r.fideId && r.fideId !== 'Unrated' ? r.fideId : undefined,
        };
      });
    }
  } catch (err) {
    console.warn('Failed to load registered participants, falling back to default seed:', err);
  }

  return DEFAULT_SEED_PLAYERS;
}

/**
 * GET: Retrieve all rounds, matches, and live standings for the tournament
 */
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

    const rounds = await getRoundsByTournament(id);
    const participants = await getTournamentParticipants(id, tournament.title);

    // Extract all matches across all rounds
    const allMatches: TournamentMatch[] = [];
    rounds.forEach(r => {
      if (r.matches) {
        allMatches.push(...r.matches);
      }
    });

    const standings = calculateStandings(participants, allMatches);

    return NextResponse.json({
      success: true,
      tournamentId: id,
      rounds,
      standings,
      participantsCount: participants.length,
    });
  } catch (error: any) {
    const status = error.status === 503 ? 503 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status }
    );
  }
}

/**
 * POST: Arbiter operations: generate pairings for next round, publish round, or swap players
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Arbiter credentials required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const tournament = await getTournamentById(id);
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'generate_pairings') {
      const existingRounds = await getRoundsByTournament(id);
      const roundNumber = Number(body.roundNumber) || existingRounds.length + 1;

      // Ensure previous round doesn't have unrecorded pending matches if round > 1
      if (existingRounds.length > 0 && !body.force) {
        const lastRound = existingRounds[existingRounds.length - 1];
        const pendingMatches = (lastRound.matches || []).filter(m => m.result === 'pending');
        if (pendingMatches.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot generate Round ${roundNumber}: Round ${lastRound.round_number} has ${pendingMatches.length} pending matches. Record all scores first.`,
            },
            { status: 400 }
          );
        }
      }

      const participants = body.players?.length
        ? (body.players as PairingPlayer[])
        : await getTournamentParticipants(id, tournament.title);

      const pairings = generateSwissPairings(participants, existingRounds, roundNumber, id);

      const newRound = await createRound({
        tournament_id: id,
        round_number: roundNumber,
        status: 'draft',
        duration_minutes: Number(body.durationMinutes) || 60,
        matches: pairings,
      });

      return NextResponse.json({
        success: true,
        message: `Round ${roundNumber} pairings generated successfully as draft.`,
        round: newRound,
      });
    }

    if (action === 'publish_round') {
      const { roundId, durationMinutes } = body;
      if (!roundId) {
        return NextResponse.json(
          { success: false, error: 'roundId is required to publish round.' },
          { status: 400 }
        );
      }

      const published = await publishRound(roundId, Number(durationMinutes) || 60);
      if (!published) {
        return NextResponse.json(
          { success: false, error: 'Round not found or update failed.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Round ${published.round_number} published successfully. Countdown clock started.`,
        round: published,
      });
    }

    if (action === 'swap_players') {
      const { matchId1, matchId2, swapWhite } = body;
      if (!matchId1 || !matchId2) {
        return NextResponse.json(
          { success: false, error: 'matchId1 and matchId2 are required.' },
          { status: 400 }
        );
      }

      const swapped = await manualSwapBoardPlayers(matchId1, matchId2, Boolean(swapWhite));
      if (!swapped) {
        return NextResponse.json(
          { success: false, error: 'Failed to swap board players.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Board players successfully swapped by arbiter.',
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported action '${action}'` },
      { status: 400 }
    );
  } catch (error: any) {
    const status = error.status === 503 ? 503 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status }
    );
  }
}

/**
 * PATCH: Arbiter operation: update individual match result / arbiter notes
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Arbiter credentials required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { matchId, result, arbiterNotes, pgn } = body;

    if (!matchId || !result) {
      return NextResponse.json(
        { success: false, error: 'matchId and result are required.' },
        { status: 400 }
      );
    }

    const validResults: MatchResult[] = [
      'pending',
      '1-0',
      '0.5-0.5',
      '0-1',
      '1F-0F',
      '0F-1F',
      '1-0_bye',
      '0.5-bye',
    ];
    if (!validResults.includes(result)) {
      return NextResponse.json(
        { success: false, error: `Invalid result '${result}'. Expected one of: ${validResults.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await updateMatchResult(matchId, result, arbiterNotes, pgn);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Match not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Match result successfully recorded.',
      match: updated,
    });
  } catch (error: any) {
    const status = error.status === 503 ? 503 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status }
    );
  }
}
