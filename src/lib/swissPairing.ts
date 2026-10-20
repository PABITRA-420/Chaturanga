import {
  MatchResult,
  PairingPlayer,
  PlayerStanding,
  TieBreakScores,
  TournamentMatch,
  TournamentRound,
} from '@/types/pairing';

/**
 * Result point mapping according to standard FIDE rules
 */
export function getPointsForResult(result: MatchResult): { white: number; black: number } {
  switch (result) {
    case '1-0':
    case '1F-0F':
      return { white: 1.0, black: 0.0 };
    case '0-1':
    case '0F-1F':
      return { white: 0.0, black: 1.0 };
    case '0.5-0.5':
      return { white: 0.5, black: 0.5 };
    case '1-0_bye':
      return { white: 1.0, black: 0.0 };
    case '0.5-bye':
      return { white: 0.5, black: 0.0 };
    default:
      return { white: 0.0, black: 0.0 };
  }
}

/**
 * Enriches players with history, scores, opponents, and color counts from prior rounds
 */
export function enrichPlayerHistory(
  initialPlayers: PairingPlayer[],
  previousRounds: TournamentRound[]
): PairingPlayer[] {
  const playerMap = new Map<string, PairingPlayer>();

  initialPlayers.forEach(p => {
    playerMap.set(p.id, {
      ...p,
      points: 0,
      color_history: [],
      opponents: [],
      had_bye: false,
    });
  });

  const sortedRounds = [...previousRounds].sort((a, b) => a.round_number - b.round_number);

  for (const round of sortedRounds) {
    if (!round.matches) continue;

    for (const match of round.matches) {
      if (match.result === 'pending') continue;

      const { white, black } = getPointsForResult(match.result);

      if (match.white_player_id && playerMap.has(match.white_player_id)) {
        const w = playerMap.get(match.white_player_id)!;
        w.points = (w.points || 0) + white;

        if (match.result === '1-0_bye' || match.result === '0.5-bye') {
          w.had_bye = true;
          w.color_history = [...(w.color_history || []), 'BYE'];
        } else {
          w.color_history = [...(w.color_history || []), 'W'];
          if (match.black_player_id) {
            w.opponents = [...(w.opponents || []), match.black_player_id];
          }
        }
      }

      if (match.black_player_id && playerMap.has(match.black_player_id)) {
        const b = playerMap.get(match.black_player_id)!;
        b.points = (b.points || 0) + black;
        b.color_history = [...(b.color_history || []), 'B'];
        if (match.white_player_id) {
          b.opponents = [...(b.opponents || []), match.white_player_id];
        }
      }
    }
  }

  return Array.from(playerMap.values());
}

/**
 * Checks if a player can be assigned White or Black without violating:
 * 1. Maximum 2 consecutive of the same color (cannot play 3 consecutive same color)
 * 2. Absolute color difference |W - B| <= 2
 */
function canPlayColor(player: PairingPlayer, color: 'W' | 'B'): boolean {
  const history = (player.color_history || []).filter(c => c === 'W' || c === 'B') as ('W' | 'B')[];
  const len = history.length;

  if (len >= 2 && history[len - 1] === color && history[len - 2] === color) {
    return false;
  }

  const whiteCount = history.filter(c => c === 'W').length + (color === 'W' ? 1 : 0);
  const blackCount = history.filter(c => c === 'B').length + (color === 'B' ? 1 : 0);

  if (Math.abs(whiteCount - blackCount) > 2) {
    return false;
  }

  return true;
}

/**
 * Determines optimal color assignment for p1 vs p2
 * Returns { white: p1 | p2, black: p1 | p2 } or null if illegal
 */
function resolveColors(
  p1: PairingPlayer,
  p2: PairingPlayer,
  strict = true
): { white: PairingPlayer; black: PairingPlayer } | null {
  const p1CanW = !strict || canPlayColor(p1, 'W');
  const p1CanB = !strict || canPlayColor(p1, 'B');
  const p2CanW = !strict || canPlayColor(p2, 'W');
  const p2CanB = !strict || canPlayColor(p2, 'B');

  const p1AsWhiteLegal = p1CanW && p2CanB;
  const p2AsWhiteLegal = p2CanW && p1CanB;

  if (!p1AsWhiteLegal && !p2AsWhiteLegal) {
    if (strict) return null;
    // Fallback: assign White to player with fewer Whites
    const p1Whites = (p1.color_history || []).filter(c => c === 'W').length;
    const p2Whites = (p2.color_history || []).filter(c => c === 'W').length;
    return p1Whites <= p2Whites ? { white: p1, black: p2 } : { white: p2, black: p1 };
  }

  if (p1AsWhiteLegal && !p2AsWhiteLegal) {
    return { white: p1, black: p2 };
  }
  if (!p1AsWhiteLegal && p2AsWhiteLegal) {
    return { white: p2, black: p1 };
  }

  // Both legal: pick based on color balance and alternation preference
  const p1History = (p1.color_history || []).filter(c => c === 'W' || c === 'B');
  const p2History = (p2.color_history || []).filter(c => c === 'W' || c === 'B');

  const p1Whites = p1History.filter(c => c === 'W').length;
  const p1Blacks = p1History.length - p1Whites;
  const p2Whites = p2History.filter(c => c === 'W').length;
  const p2Blacks = p2History.length - p2Whites;

  const p1Diff = p1Whites - p1Blacks; // > 0 means more whites
  const p2Diff = p2Whites - p2Blacks;

  if (p1Diff < p2Diff) return { white: p1, black: p2 };
  if (p2Diff < p1Diff) return { white: p2, black: p1 };

  // If color difference tied, alternate based on previous game
  const p1Last = p1History[p1History.length - 1];
  const p2Last = p2History[p2History.length - 1];

  if (p1Last === 'B' && p2Last === 'W') return { white: p1, black: p2 };
  if (p1Last === 'W' && p2Last === 'B') return { white: p2, black: p1 };

  // Tie-breaker: higher rating plays White (or p1)
  return (p1.rating || 0) >= (p2.rating || 0) ? { white: p1, black: p2 } : { white: p2, black: p1 };
}

/**
 * Generates Swiss pairings for a round using Dutch Swiss principles
 */
export function generateSwissPairings(
  players: PairingPlayer[],
  previousRounds: TournamentRound[],
  currentRoundNumber: number,
  tournamentId = ''
): TournamentMatch[] {
  if (!players || players.length === 0) return [];

  const enrichedPlayers = enrichPlayerHistory(players, previousRounds);
  const matches: TournamentMatch[] = [];

  // Sort players by points DESC, then rating DESC, then name
  enrichedPlayers.sort((a, b) => {
    const ptDiff = (b.points || 0) - (a.points || 0);
    if (ptDiff !== 0) return ptDiff;
    const ratDiff = (b.rating || 0) - (a.rating || 0);
    if (ratDiff !== 0) return ratDiff;
    return a.name.localeCompare(b.name);
  });

  const pairingPool = [...enrichedPlayers];
  let byeMatch: TournamentMatch | null = null;

  // Handle Odd Player Count: Assign 1.0 Bye
  if (pairingPool.length % 2 !== 0) {
    // Find lowest-ranked player who has not had a bye yet
    let byeIndex = -1;
    for (let i = pairingPool.length - 1; i >= 0; i--) {
      if (!pairingPool[i].had_bye) {
        byeIndex = i;
        break;
      }
    }

    // If all had a bye (rare in short tourneys), take the absolute lowest
    if (byeIndex === -1) {
      byeIndex = pairingPool.length - 1;
    }

    const byePlayer = pairingPool.splice(byeIndex, 1)[0];
    byeMatch = {
      id: `bye-${currentRoundNumber}-${byePlayer.id}`,
      round_id: '',
      tournament_id: tournamentId,
      board_number: 0, // Assigned later
      white_player_id: byePlayer.id,
      white_player_name: byePlayer.name,
      black_player_id: null,
      black_player_name: 'BYE',
      result: '1-0_bye',
      arbiter_notes: 'Full-point 1.0 bye awarded by Swiss pairing system',
    };
  }

  // Round 1: Top-half vs Bottom-half seeding
  if (currentRoundNumber === 1 && previousRounds.length === 0) {
    const half = Math.floor(pairingPool.length / 2);
    const topHalf = pairingPool.slice(0, half);
    const bottomHalf = pairingPool.slice(half);

    for (let i = 0; i < half; i++) {
      const p1 = topHalf[i];
      const p2 = bottomHalf[i];
      // Alternate White/Black for top half
      const isWhite = i % 2 === 0;
      const white = isWhite ? p1 : p2;
      const black = isWhite ? p2 : p1;

      matches.push({
        id: `match-r1-b${i + 1}`,
        round_id: '',
        tournament_id: tournamentId,
        board_number: i + 1,
        white_player_id: white.id,
        white_player_name: white.name,
        black_player_id: black.id,
        black_player_name: black.name,
        result: 'pending',
      });
    }

    if (byeMatch) {
      byeMatch.board_number = matches.length + 1;
      matches.push(byeMatch);
    }

    return matches;
  }

  // Recursive backtracking pairing algorithm
  function findPairings(
    unpaired: PairingPlayer[],
    strictColors: boolean,
    strictRematches: boolean
  ): { white: PairingPlayer; black: PairingPlayer }[] | null {
    if (unpaired.length === 0) return [];

    const p1 = unpaired[0];
    const candidates = unpaired.slice(1);

    // Sort candidates: favor same score group, then rating
    candidates.sort((a, b) => {
      const aScoreDiff = Math.abs((p1.points || 0) - (a.points || 0));
      const bScoreDiff = Math.abs((p1.points || 0) - (b.points || 0));
      if (aScoreDiff !== bScoreDiff) return aScoreDiff - bScoreDiff;
      return (b.rating || 0) - (a.rating || 0);
    });

    for (const p2 of candidates) {
      // Check rematch restriction
      if (strictRematches && p1.opponents?.includes(p2.id)) {
        continue;
      }

      // Check color assignment
      const colors = resolveColors(p1, p2, strictColors);
      if (!colors) continue;

      const remaining = unpaired.slice(1).filter(p => p.id !== p2.id);
      const subPairings = findPairings(remaining, strictColors, strictRematches);

      if (subPairings !== null) {
        return [colors, ...subPairings];
      }
    }

    return null;
  }

  // Attempt 1: Strict colors and strict rematches
  let pairs = findPairings(pairingPool, true, true);

  // Attempt 2: Relax colors if necessary, preserve strict rematches
  if (!pairs) {
    pairs = findPairings(pairingPool, false, true);
  }

  // Attempt 3: If mathematically impossible (e.g. all players have played everyone), relax rematches
  if (!pairs) {
    pairs = findPairings(pairingPool, false, false);
  }

  // Fallback safe pairing if graph cannot find perfect match
  if (!pairs) {
    pairs = [];
    for (let i = 0; i < pairingPool.length - 1; i += 2) {
      pairs.push({
        white: pairingPool[i],
        black: pairingPool[i + 1],
      });
    }
  }

  pairs.forEach((pair, idx) => {
    matches.push({
      id: `match-r${currentRoundNumber}-b${idx + 1}`,
      round_id: '',
      tournament_id: tournamentId,
      board_number: idx + 1,
      white_player_id: pair.white.id,
      white_player_name: pair.white.name,
      black_player_id: pair.black.id,
      black_player_name: pair.black.name,
      result: 'pending',
    });
  });

  if (byeMatch) {
    byeMatch.board_number = matches.length + 1;
    matches.push(byeMatch);
  }

  return matches;
}

/**
 * Calculates tournament standings according to collegiate FIDE tie-break order:
 * 1. Total Points (1.0 win / 0.5 draw / 0.0 loss / 1.0 bye)
 * 2. Buchholz Cut 1 (sum of all opponents' scores minus the lowest opponent score)
 * 3. Direct Encounter (head-to-head points between tied players)
 * 4. Sonneborn-Berger (sum of defeated opponents' scores + 0.5 * drawn opponents' scores)
 */
export function calculateStandings(
  players: PairingPlayer[],
  allMatches: TournamentMatch[]
): PlayerStanding[] {
  if (!players || players.length === 0) return [];

  interface PlayerStats {
    id: string;
    name: string;
    rating: number;
    points: number;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    opponents: { id: string; resultVsOpponent: 'win' | 'draw' | 'loss' }[];
  }

  const statsMap = new Map<string, PlayerStats>();

  players.forEach(p => {
    statsMap.set(p.id, {
      id: p.id,
      name: p.name,
      rating: p.rating || 1200,
      points: 0,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      opponents: [],
    });
  });

  // Calculate points, wins, draws, losses, and opponents
  for (const m of allMatches) {
    if (m.result === 'pending') continue;

    const { white, black } = getPointsForResult(m.result);

    if (m.white_player_id && statsMap.has(m.white_player_id)) {
      const w = statsMap.get(m.white_player_id)!;
      w.points += white;

      if (m.result === '1-0_bye' || m.result === '0.5-bye') {
        w.wins += white === 1.0 ? 1 : 0;
        w.draws += white === 0.5 ? 1 : 0;
      } else {
        w.matchesPlayed += 1;
        if (white === 1.0) w.wins += 1;
        else if (white === 0.5) w.draws += 1;
        else w.losses += 1;

        if (m.black_player_id) {
          w.opponents.push({
            id: m.black_player_id,
            resultVsOpponent: white === 1.0 ? 'win' : white === 0.5 ? 'draw' : 'loss',
          });
        }
      }
    }

    if (m.black_player_id && statsMap.has(m.black_player_id)) {
      const b = statsMap.get(m.black_player_id)!;
      b.points += black;
      b.matchesPlayed += 1;

      if (black === 1.0) b.wins += 1;
      else if (black === 0.5) b.draws += 1;
      else b.losses += 1;

      if (m.white_player_id) {
        b.opponents.push({
          id: m.white_player_id,
          resultVsOpponent: black === 1.0 ? 'win' : black === 0.5 ? 'draw' : 'loss',
        });
      }
    }
  }

  // Calculate Tie-Breaks: Buchholz, Buchholz Cut 1, Direct Encounter, Sonneborn-Berger
  const standingsWithoutRank = Array.from(statsMap.values()).map(stat => {
    const opponentScores = stat.opponents
      .map(opp => statsMap.get(opp.id)?.points ?? 0)
      .sort((a, b) => a - b);

    const buchholz = opponentScores.reduce((sum, score) => sum + score, 0);

    // Buchholz Cut 1: Drop the lowest opponent score if at least 1 opponent played
    const buchholzCut1 =
      opponentScores.length > 1
        ? opponentScores.slice(1).reduce((sum, score) => sum + score, 0)
        : buchholz;

    // Sonneborn-Berger: score of defeated opponents + 0.5 * score of drawn opponents
    let sonnebornBerger = 0;
    for (const opp of stat.opponents) {
      const oppPoints = statsMap.get(opp.id)?.points ?? 0;
      if (opp.resultVsOpponent === 'win') {
        sonnebornBerger += oppPoints;
      } else if (opp.resultVsOpponent === 'draw') {
        sonnebornBerger += 0.5 * oppPoints;
      }
    }

    const tieBreaks: TieBreakScores = {
      buchholz: Number(buchholz.toFixed(2)),
      buchholzCut1: Number(buchholzCut1.toFixed(2)),
      directEncounter: 0, // Computed dynamically during sorting if points tie
      sonnebornBerger: Number(sonnebornBerger.toFixed(2)),
    };

    return {
      rank: 0,
      playerId: stat.id,
      playerName: stat.name,
      rating: stat.rating,
      points: Number(stat.points.toFixed(2)),
      matchesPlayed: stat.matchesPlayed,
      wins: stat.wins,
      draws: stat.draws,
      losses: stat.losses,
      tieBreaks,
      _opponents: stat.opponents,
    };
  });

  // Sort standings with collegiate FIDE rules
  standingsWithoutRank.sort((a, b) => {
    // 1. Total Points DESC
    if (b.points !== a.points) return b.points - a.points;

    // 2. Buchholz Cut 1 DESC
    if (b.tieBreaks.buchholzCut1 !== a.tieBreaks.buchholzCut1) {
      return b.tieBreaks.buchholzCut1 - a.tieBreaks.buchholzCut1;
    }

    // 3. Direct Encounter (Head-to-head match between tied players)
    const directMatch = a._opponents.find(o => o.id === b.playerId);
    if (directMatch) {
      if (directMatch.resultVsOpponent === 'win') return -1;
      if (directMatch.resultVsOpponent === 'loss') return 1;
    }

    // 4. Sonneborn-Berger DESC
    if (b.tieBreaks.sonnebornBerger !== a.tieBreaks.sonnebornBerger) {
      return b.tieBreaks.sonnebornBerger - a.tieBreaks.sonnebornBerger;
    }

    // 5. Total Buchholz DESC
    if (b.tieBreaks.buchholz !== a.tieBreaks.buchholz) {
      return b.tieBreaks.buchholz - a.tieBreaks.buchholz;
    }

    // 6. Rating / Seed DESC
    if (b.rating !== a.rating) return b.rating - a.rating;

    // 7. Alphabetical
    return a.playerName.localeCompare(b.playerName);
  });

  // Assign ranks
  return standingsWithoutRank.map((s, index) => ({
    rank: index + 1,
    playerId: s.playerId,
    playerName: s.playerName,
    points: s.points,
    matchesPlayed: s.matchesPlayed,
    wins: s.wins,
    draws: s.draws,
    losses: s.losses,
    tieBreaks: s.tieBreaks,
  }));
}
