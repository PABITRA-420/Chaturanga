import {
  DepartmentTeam,
  TeamRound,
  TeamMatch,
  TeamStanding,
  TeamMatchOutcome,
} from '@/types/teamPairing';
import { MatchResult } from '@/types/pairing';

/**
 * Result point mapping for individual board games
 */
export function calculateBoardPoints(result: MatchResult): { white: number; black: number } {
  switch (result) {
    case '1-0':
    case '1F-0F':
    case '1-0_bye':
      return { white: 1.0, black: 0.0 };
    case '0-1':
    case '0F-1F':
      return { white: 0.0, black: 1.0 };
    case '0.5-0.5':
    case '0.5-bye':
      return { white: 0.5, black: 0.5 };
    default:
      return { white: 0.0, black: 0.0 };
  }
}

/**
 * Computes game points, match points, and match outcome for a 4-board team match
 * Win: > 2.0 GP -> 2 MP
 * Draw: == 2.0 GP -> 1 MP
 * Loss: < 2.0 GP -> 0 MP
 */
export function calculateTeamMatchOutcome(match: TeamMatch): {
  white_game_points: number;
  black_game_points: number;
  white_match_points: number;
  black_match_points: number;
  outcome: TeamMatchOutcome;
} {
  if (match.is_bye) {
    return {
      white_game_points: 4.0,
      black_game_points: 0.0,
      white_match_points: 2,
      black_match_points: 0,
      outcome: 'bye',
    };
  }

  let whiteGP = 0;
  let blackGP = 0;
  let completedBoards = 0;

  for (const board of match.boards) {
    if (board.result !== 'pending') {
      const { white, black } = calculateBoardPoints(board.result);
      // Notice: Odd boards (1, 3), White pieces are white_team. Even boards (2, 4), White pieces are black_team.
      if (board.board_number % 2 === 1) {
        whiteGP += white;
        blackGP += black;
      } else {
        whiteGP += black;
        blackGP += white;
      }
      completedBoards++;
    }
  }

  // If match has 4 boards and not all completed, outcome is still pending
  if (completedBoards < match.boards.length) {
    return {
      white_game_points: whiteGP,
      black_game_points: blackGP,
      white_match_points: 0,
      black_match_points: 0,
      outcome: 'pending',
    };
  }

  let outcome: TeamMatchOutcome = 'draw';
  let whiteMP = 1;
  let blackMP = 1;

  if (whiteGP > 2.0) {
    outcome = 'white_win';
    whiteMP = 2;
    blackMP = 0;
  } else if (blackGP > 2.0) {
    outcome = 'black_win';
    whiteMP = 0;
    blackMP = 2;
  } else {
    outcome = 'draw';
    whiteMP = 1;
    blackMP = 1;
  }

  return {
    white_game_points: whiteGP,
    black_game_points: blackGP,
    white_match_points: whiteMP,
    black_match_points: blackMP,
    outcome,
  };
}

/**
 * Updates a specific board result within a team round and recalculates team scores
 */
export function updateBoardResult(
  round: TeamRound,
  matchId: string,
  boardNumber: number,
  result: MatchResult
): TeamRound {
  const updatedMatches = round.matches.map(match => {
    if (match.id !== matchId) return match;

    const updatedBoards = match.boards.map(b => {
      if (b.board_number !== boardNumber) return b;
      return { ...b, result };
    });

    const candidateMatch: TeamMatch = {
      ...match,
      boards: updatedBoards,
    };

    const outcomeData = calculateTeamMatchOutcome(candidateMatch);

    return {
      ...candidateMatch,
      ...outcomeData,
      updated_at: new Date().toISOString(),
    };
  });

  return {
    ...round,
    matches: updatedMatches,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Calculates live team standings according to FIDE Collegiate Team Swiss tie-break hierarchy:
 * 1. Match Points (MP)
 * 2. Game Points (GP)
 * 3. Direct Encounter (Head-to-head)
 * 4. Sonneborn-Berger
 * 5. Buchholz
 */
export function calculateTeamStandings(
  teams: DepartmentTeam[],
  rounds: TeamRound[]
): TeamStanding[] {
  interface TeamAccumulator {
    team: DepartmentTeam;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    match_points: number;
    game_points: number;
    opponents: { id: string; our_gp: number; their_gp: number; outcome: 'W' | 'D' | 'L' }[];
  }

  const accumulators = new Map<string, TeamAccumulator>();

  teams.forEach(t => {
    accumulators.set(t.id, {
      team: t,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      match_points: 0,
      game_points: 0,
      opponents: [],
    });
  });

  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number);

  for (const round of sortedRounds) {
    if (!round.matches) continue;

    for (const match of round.matches) {
      if (match.is_bye) {
        const teamAcc = accumulators.get(match.white_team_id);
        if (teamAcc) {
          teamAcc.played += 1;
          teamAcc.won += 1;
          teamAcc.match_points += 2;
          teamAcc.game_points += 4.0;
        }
        continue;
      }

      if (match.outcome === 'pending') continue;

      const whiteAcc = accumulators.get(match.white_team_id);
      const blackAcc = match.black_team_id ? accumulators.get(match.black_team_id) : undefined;

      if (whiteAcc && blackAcc) {
        whiteAcc.played += 1;
        blackAcc.played += 1;

        whiteAcc.game_points += match.white_game_points;
        blackAcc.game_points += match.black_game_points;

        whiteAcc.match_points += match.white_match_points;
        blackAcc.match_points += match.black_match_points;

        if (match.outcome === 'white_win') {
          whiteAcc.won += 1;
          blackAcc.lost += 1;
          whiteAcc.opponents.push({ id: blackAcc.team.id, our_gp: match.white_game_points, their_gp: match.black_game_points, outcome: 'W' });
          blackAcc.opponents.push({ id: whiteAcc.team.id, our_gp: match.black_game_points, their_gp: match.white_game_points, outcome: 'L' });
        } else if (match.outcome === 'black_win') {
          whiteAcc.lost += 1;
          blackAcc.won += 1;
          whiteAcc.opponents.push({ id: blackAcc.team.id, our_gp: match.white_game_points, their_gp: match.black_game_points, outcome: 'L' });
          blackAcc.opponents.push({ id: whiteAcc.team.id, our_gp: match.black_game_points, their_gp: match.white_game_points, outcome: 'W' });
        } else if (match.outcome === 'draw') {
          whiteAcc.drawn += 1;
          blackAcc.drawn += 1;
          whiteAcc.opponents.push({ id: blackAcc.team.id, our_gp: match.white_game_points, their_gp: match.black_game_points, outcome: 'D' });
          blackAcc.opponents.push({ id: whiteAcc.team.id, our_gp: match.black_game_points, their_gp: match.white_game_points, outcome: 'D' });
        }
      }
    }
  }

  // Calculate Sonneborn-Berger and Buchholz
  const standingsWithoutRank = Array.from(accumulators.values()).map(acc => {
    let sonnebornBerger = 0;
    let buchholz = 0;
    const directRecord: Record<string, 'W' | 'D' | 'L'> = {};

    acc.opponents.forEach(opp => {
      const oppAcc = accumulators.get(opp.id);
      if (oppAcc) {
        buchholz += oppAcc.match_points;
        // Team Sonneborn-Berger = sum of (Opponent MP * our GP vs Opponent / 4)
        sonnebornBerger += (oppAcc.match_points * opp.our_gp) / 4.0;
        directRecord[opp.id] = opp.outcome;
      }
    });

    return {
      team_id: acc.team.id,
      department_code: acc.team.department_code,
      department_name: acc.team.department_name,
      captain_name: acc.team.captain_name,
      played: acc.played,
      won: acc.won,
      drawn: acc.drawn,
      lost: acc.lost,
      match_points: acc.match_points,
      game_points: acc.game_points,
      sonneborn_berger: Number(sonnebornBerger.toFixed(2)),
      buchholz,
      direct_encounter_record: directRecord,
    };
  });

  // Sorting
  standingsWithoutRank.sort((a, b) => {
    // 1. Match Points
    if (b.match_points !== a.match_points) {
      return b.match_points - a.match_points;
    }
    // 2. Game Points
    if (b.game_points !== a.game_points) {
      return b.game_points - a.game_points;
    }
    // 3. Direct Encounter
    if (a.direct_encounter_record && a.direct_encounter_record[b.team_id]) {
      const result = a.direct_encounter_record[b.team_id];
      if (result === 'W') return -1;
      if (result === 'L') return 1;
    }
    // 4. Sonneborn-Berger
    if (b.sonneborn_berger !== a.sonneborn_berger) {
      return b.sonneborn_berger - a.sonneborn_berger;
    }
    // 5. Buchholz
    return b.buchholz - a.buchholz;
  });

  return standingsWithoutRank.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));
}
