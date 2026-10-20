'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerStanding, TournamentMatch, TournamentRound } from '@/types/pairing';
import { Tournament } from '@/types/tournament';

export interface UseLiveTournamentResult {
  tournament: Tournament | null;
  currentRound: TournamentRound | null;
  rounds: TournamentRound[];
  matches: TournamentMatch[];
  standings: PlayerStanding[];
  loading: boolean;
  isLiveSyncing: boolean;
  error: string | null;
  lastSyncedAt: Date | null;
  refetch: () => Promise<void>;
}

export function useLiveTournament(tournamentId: string, pollIntervalMs = 15000): UseLiveTournamentResult {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rounds, setRounds] = useState<TournamentRound[]>([]);
  const [standings, setStandings] = useState<PlayerStanding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const isMounted = useRef<boolean>(true);

  const fetchLiveState = useCallback(
    async (isBackground = false) => {
      if (!tournamentId) return;

      if (!isBackground) setLoading(true);
      else setIsLiveSyncing(true);

      try {
        // Fetch tournament details
        const tournRes = await fetch(`/api/tournaments/${tournamentId}`);
        const tournData = await tournRes.json();
        if (tournData.success && tournData.tournament) {
          if (isMounted.current) setTournament(tournData.tournament);
        }

        // Fetch rounds, matches, and standings
        const pairRes = await fetch(`/api/tournaments/${tournamentId}/pairings`);
        const pairData = await pairRes.json();

        if (isMounted.current) {
          if (pairData.success) {
            setRounds(pairData.rounds || []);
            setStandings(pairData.standings || []);
            setError(null);
            setLastSyncedAt(new Date());
          } else {
            setError(pairData.error || 'Failed to sync live tournament data');
          }
        }
      } catch (err: any) {
        if (isMounted.current) {
          setError(err.message || 'Network error syncing live tournament');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setIsLiveSyncing(false);
        }
      }
    },
    [tournamentId]
  );

  useEffect(() => {
    isMounted.current = true;
    fetchLiveState(false);

    // 15-second SWR-style live polling
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchLiveState(true);
    }, pollIntervalMs);

    return () => {
      isMounted.current = false;
      clearInterval(timer);
    };
  }, [fetchLiveState, pollIntervalMs]);

  // Determine current active or published round (default to highest round number)
  const currentRound =
    rounds.find(r => r.status === 'in_progress' || r.status === 'published') ||
    (rounds.length > 0 ? rounds[rounds.length - 1] : null);

  const matches = currentRound?.matches || [];

  return {
    tournament,
    currentRound,
    rounds,
    matches,
    standings,
    loading,
    isLiveSyncing,
    error,
    lastSyncedAt,
    refetch: () => fetchLiveState(false),
  };
}
