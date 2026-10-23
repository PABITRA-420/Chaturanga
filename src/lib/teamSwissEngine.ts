import {
  DepartmentTeam,
  TeamRound,
  TeamMatch,
  BoardPairing,
  TeamPlayer,
} from '@/types/teamPairing';

export interface EnrichedTeamState {
  team: DepartmentTeam;
  match_points: number;
  game_points: number;
  opponents: string[]; // opponent team IDs
  color_history: ('W' | 'B' | 'BYE')[];
  had_bye: boolean;
}

/**
 * Enriches teams with prior round results, match points, game points, opponent history, and colors
 */
export function enrichTeamHistory(
  teams: DepartmentTeam[],
  previousRounds: TeamRound[]
): EnrichedTeamState[] {
  const teamMap = new Map<string, EnrichedTeamState>();

  teams.forEach(t => {
    teamMap.set(t.id, {
      team: t,
      match_points: 0,
      game_points: 0,
      opponents: [],
      color_history: [],
      had_bye: false,
    });
  });

  const sortedRounds = [...previousRounds].sort((a, b) => a.round_number - b.round_number);

  for (const round of sortedRounds) {
    if (!round.matches) continue;

    for (const match of round.matches) {
      if (match.is_bye) {
        const t = teamMap.get(match.white_team_id);
        if (t) {
          t.had_bye = true;
          t.match_points += 2;
          t.game_points += 4.0;
          t.color_history.push('BYE');
        }
        continue;
      }

      const whiteTeam = teamMap.get(match.white_team_id);
      const blackTeam = match.black_team_id ? teamMap.get(match.black_team_id) : undefined;

      if (whiteTeam && blackTeam) {
        whiteTeam.opponents.push(blackTeam.team.id);
        blackTeam.opponents.push(whiteTeam.team.id);

        whiteTeam.color_history.push('W');
        blackTeam.color_history.push('B');

        whiteTeam.match_points += match.white_match_points || 0;
        whiteTeam.game_points += match.white_game_points || 0;

        blackTeam.match_points += match.black_match_points || 0;
        blackTeam.game_points += match.black_game_points || 0;
      }
    }
  }

  return Array.from(teamMap.values());
}

/**
 * Determine match color for Team A vs Team B based on prior color balance
 * Returns 'A_WHITE' if Team A gets White on Board 1, else 'B_WHITE'
 */
export function determineTeamColors(
  teamA: EnrichedTeamState,
  teamB: EnrichedTeamState
): 'A_WHITE' | 'B_WHITE' {
  const countColor = (hist: ('W' | 'B' | 'BYE')[], c: 'W' | 'B') => hist.filter(x => x === c).length;
  
  const balanceA = countColor(teamA.color_history, 'W') - countColor(teamA.color_history, 'B');
  const balanceB = countColor(teamB.color_history, 'W') - countColor(teamB.color_history, 'B');

  // If A played more White than Black, preference B for White
  if (balanceA > balanceB) return 'B_WHITE';
  if (balanceB > balanceA) return 'A_WHITE';

  // If balances are equal, check last round color
  const lastA = [...teamA.color_history].reverse().find(c => c === 'W' || c === 'B');
  const lastB = [...teamB.color_history].reverse().find(c => c === 'W' || c === 'B');

  if (lastA === 'W' && lastB !== 'W') return 'B_WHITE';
  if (lastB === 'W' && lastA !== 'W') return 'A_WHITE';

  // Default: higher seeded team gets White
  return (teamA.team.seed_rating || 0) >= (teamB.team.seed_rating || 0) ? 'A_WHITE' : 'B_WHITE';
}

/**
 * Build board pairings for a 4-board match with alternating colors:
 * Board 1: Team White vs Team Black
 * Board 2: Team Black vs Team White
 * Board 3: Team White vs Team Black
 * Board 4: Team Black vs Team White
 */
export function buildBoardPairings(
  whiteTeam: DepartmentTeam,
  blackTeam: DepartmentTeam
): BoardPairing[] {
  const getActiveBoards = (team: DepartmentTeam): TeamPlayer[] => {
    // Sort by board number, taking top 4 active boards
    const sorted = [...team.roster]
      .filter(p => !p.is_reserve || p.board_number <= 4)
      .sort((a, b) => a.board_number - b.board_number);
    
    // Fill up to 4 if needed
    while (sorted.length < 4) {
      const idx = sorted.length + 1;
      sorted.push({
        id: `${team.id}-b${idx}`,
        name: `Board ${idx} (${team.department_code})`,
        rating: 1500,
        board_number: idx,
        is_reserve: false,
        department_code: team.department_code,
      });
    }
    return sorted.slice(0, 4);
  };

  const whiteBoards = getActiveBoards(whiteTeam);
  const blackBoards = getActiveBoards(blackTeam);

  const pairings: BoardPairing[] = [];

  for (let b = 1; b <= 4; b++) {
    const isOddBoard = b % 2 === 1; // 1 and 3 are odd
    // Odd boards (1, 3): Team White has White pieces, Team Black has Black pieces
    // Even boards (2, 4): Team White has Black pieces, Team Black has White pieces
    if (isOddBoard) {
      pairings.push({
        board_number: b,
        white_player: whiteBoards[b - 1],
        black_player: blackBoards[b - 1],
        result: 'pending',
      });
    } else {
      pairings.push({
        board_number: b,
        white_player: blackBoards[b - 1],
        black_player: whiteBoards[b - 1],
        result: 'pending',
      });
    }
  }

  return pairings;
}

/**
 * Main Team Swiss Pairing Generator (FIDE Dutch Team Swiss)
 */
export function generateTeamSwissPairings(
  teams: DepartmentTeam[],
  previousRounds: TeamRound[] = [],
  currentRoundNumber: number = 1
): TeamMatch[] {
  if (teams.length === 0) return [];

  const enriched = enrichTeamHistory(teams, previousRounds);

  // Sort teams primarily by Match Points (MP), then Game Points (GP), then seed rating
  const sortedTeams = [...enriched].sort((a, b) => {
    if (b.match_points !== a.match_points) return b.match_points - a.match_points;
    if (b.game_points !== a.game_points) return b.game_points - a.game_points;
    return (b.team.seed_rating || 0) - (a.team.seed_rating || 0);
  });

  const matches: TeamMatch[] = [];
  const pairingPool = [...sortedTeams];
  let byeMatch: TeamMatch | null = null;

  // Handle Odd Team Bye:
  // Give bye to lowest ranked team that hasn't received a bye yet
  if (pairingPool.length % 2 !== 0) {
    let byeIndex = -1;
    for (let i = pairingPool.length - 1; i >= 0; i--) {
      if (!pairingPool[i].had_bye) {
        byeIndex = i;
        break;
      }
    }
    // Fallback if all had byes
    if (byeIndex === -1) byeIndex = pairingPool.length - 1;

    const byeTeam = pairingPool.splice(byeIndex, 1)[0];

    byeMatch = {
      id: `match-r${currentRoundNumber}-bye-${byeTeam.team.id}`,
      tournament_id: byeTeam.team.tournament_id,
      round_number: currentRoundNumber,
      table_number: Math.ceil(sortedTeams.length / 2),
      white_team_id: byeTeam.team.id,
      white_team_name: byeTeam.team.department_name,
      white_team_dept: byeTeam.team.department_code,
      black_team_id: null,
      black_team_name: 'BYE',
      black_team_dept: null,
      boards: [],
      is_bye: true,
      outcome: 'bye',
      white_game_points: 4.0,
      black_game_points: 0.0,
      white_match_points: 2,
      black_match_points: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Recursive backtracking pairing search
  function findTeamPairings(
    unpaired: EnrichedTeamState[],
    strictRematches: boolean
  ): [EnrichedTeamState, EnrichedTeamState][] | null {
    if (unpaired.length === 0) return [];

    const teamA = unpaired[0];
    const candidates = unpaired.slice(1);

    // Sort candidates:
    // 1. Unplayed opponents first (strict rematch avoidance)
    // 2. Score closeness (match points difference)
    // 3. Game points difference
    // 4. Rating closeness
    candidates.sort((b1, b2) => {
      const playedB1 = teamA.opponents.includes(b1.team.id) ? 1 : 0;
      const playedB2 = teamA.opponents.includes(b2.team.id) ? 1 : 0;
      if (playedB1 !== playedB2) return playedB1 - playedB2;

      const mpDiff1 = Math.abs(teamA.match_points - b1.match_points);
      const mpDiff2 = Math.abs(teamA.match_points - b2.match_points);
      if (mpDiff1 !== mpDiff2) return mpDiff1 - mpDiff2;

      const gpDiff1 = Math.abs(teamA.game_points - b1.game_points);
      const gpDiff2 = Math.abs(teamA.game_points - b2.game_points);
      if (gpDiff1 !== gpDiff2) return gpDiff1 - gpDiff2;

      const rDiff1 = Math.abs((teamA.team.seed_rating || 0) - (b1.team.seed_rating || 0));
      const rDiff2 = Math.abs((teamA.team.seed_rating || 0) - (b2.team.seed_rating || 0));
      return rDiff1 - rDiff2;
    });

    for (const teamB of candidates) {
      if (strictRematches && teamA.opponents.includes(teamB.team.id)) {
        continue;
      }

      const remaining = candidates.filter(t => t.team.id !== teamB.team.id);
      const subPairings = findTeamPairings(remaining, strictRematches);

      if (subPairings !== null) {
        return [[teamA, teamB], ...subPairings];
      }
    }

    return null;
  }

  // Attempt 1: Strict rematches (zero rematches allowed)
  let selectedPairs = findTeamPairings(pairingPool, true);

  // Attempt 2: Relax rematches if mathematically impossible (unplayed-first sorting minimizes rematches)
  if (!selectedPairs) {
    selectedPairs = findTeamPairings(pairingPool, false);
  }

  // Attempt 3: Deterministic fallback if graph search fails
  if (!selectedPairs) {
    selectedPairs = [];
    for (let i = 0; i < pairingPool.length - 1; i += 2) {
      selectedPairs.push([pairingPool[i], pairingPool[i + 1]]);
    }
  }

  let tableNum = 1;
  for (const [t1, t2] of selectedPairs) {
    const colorPreference = determineTeamColors(t1, t2);
    const whiteTeam = colorPreference === 'A_WHITE' ? t1.team : t2.team;
    const blackTeam = colorPreference === 'A_WHITE' ? t2.team : t1.team;

    const boardPairings = buildBoardPairings(whiteTeam, blackTeam);

    matches.push({
      id: `match-r${currentRoundNumber}-t${tableNum}`,
      tournament_id: whiteTeam.tournament_id,
      round_number: currentRoundNumber,
      table_number: tableNum,
      white_team_id: whiteTeam.id,
      white_team_name: whiteTeam.department_name,
      white_team_dept: whiteTeam.department_code,
      black_team_id: blackTeam.id,
      black_team_name: blackTeam.department_name,
      black_team_dept: blackTeam.department_code,
      boards: boardPairings,
      is_bye: false,
      outcome: 'pending',
      white_game_points: 0,
      black_game_points: 0,
      white_match_points: 0,
      black_match_points: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    tableNum++;
  }

  if (byeMatch) {
    byeMatch.table_number = tableNum;
    matches.push(byeMatch);
  }

  // Sort matches by table number
  return matches.sort((a, b) => a.table_number - b.table_number);
}
