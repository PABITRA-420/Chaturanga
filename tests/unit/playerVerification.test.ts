import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyPlayerAccount } from '@/lib/playerVerification';
import {
  MOCK_CHESS_COM_PLAYER,
  MOCK_CHESS_COM_STATS,
  MOCK_LICHESS_USER
} from '../fixtures/chessProfiles';

describe('Player Account Verification (playerVerification.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Chess.com Platform Verification', () => {
    it('successfully verifies an active Chess.com player profile and fetches ratings', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      fetchSpy.mockImplementation(async (url: any) => {
        const urlStr = url.toString();
        if (urlStr.includes('/stats')) {
          return new Response(JSON.stringify(MOCK_CHESS_COM_STATS), { status: 200 });
        }
        return new Response(JSON.stringify(MOCK_CHESS_COM_PLAYER), { status: 200 });
      });

      const result = await verifyPlayerAccount('chesscom', 'magnuscarlsen');

      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(result.platform).toBe('Chess.com');
      expect(result.username).toBe('magnuscarlsen');
      expect(result.ratings?.rapid).toBe(2832);
      expect(result.ratings?.blitz).toBe(2886);
      expect(result.ratings?.bullet).toBe(3105);
      expect(result.status).toBe(200);
    });

    it('returns exists: false when Chess.com player does not exist (HTTP 404)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ message: 'User not found' }), { status: 404 })
      );

      const result = await verifyPlayerAccount('chesscom', 'nonexistent_user_9999');

      expect(result.success).toBe(true);
      expect(result.exists).toBe(false);
      expect(result.platform).toBe('Chess.com');
      expect(result.message).toContain('not found on Chess.com');
      expect(result.status).toBe(200);
    });

    it('returns error when Chess.com returns rate limit or server error (HTTP 429 / 503)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Too Many Requests', { status: 429 })
      );

      const result = await verifyPlayerAccount('chesscom', 'busy_user');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Chess.com verification service unavailable');
      expect(result.status).toBe(503);
    });

    it('handles unexpected network rejections gracefully', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Connection refused'));

      const result = await verifyPlayerAccount('chesscom', 'offline_user');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection refused');
      expect(result.status).toBe(500);
    });
  });

  describe('Lichess Platform Verification', () => {
    it('successfully verifies an active Lichess player and normalizes ratings', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(MOCK_LICHESS_USER), { status: 200 })
      );

      const result = await verifyPlayerAccount('lichess', 'RebeccaHarris');

      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(result.platform).toBe('Lichess');
      expect(result.username).toBe('RebeccaHarris');
      expect(result.ratings?.blitz).toBe(2750);
      expect(result.ratings?.rapid).toBe(2680);
      expect(result.ratings?.classical).toBe(2500);
      expect(result.status).toBe(200);
    });

    it('returns exists: false when Lichess player does not exist (HTTP 404)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
      );

      const result = await verifyPlayerAccount('lichess', 'ghost_player_123');

      expect(result.success).toBe(true);
      expect(result.exists).toBe(false);
      expect(result.platform).toBe('Lichess');
      expect(result.message).toContain('not found on Lichess');
      expect(result.status).toBe(200);
    });

    it('handles Lichess network errors gracefully', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('DNS resolution failed'));

      const result = await verifyPlayerAccount('lichess', 'valid_handle');

      expect(result.success).toBe(false);
      expect(result.error).toContain('DNS resolution failed');
      expect(result.status).toBe(500);
    });
  });

  describe('Platform Validation & Empty Input Guard', () => {
    it('returns failure on unsupported platform string', async () => {
      const result = await verifyPlayerAccount('chess24' as any, 'player123');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toBe('Invalid chess platform. Only chesscom or lichess are supported.');
    });

    it('rejects empty or whitespace-only username', async () => {
      const result = await verifyPlayerAccount('chesscom', '   ');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toBe('Username is required');
    });

    it('falls back to multi-platform detection when platform is omitted', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      fetchSpy.mockImplementation(async (url: any) => {
        const urlStr = url.toString();
        if (urlStr.includes('api.chess.com/pub/player/fallbackuser/stats')) {
          return new Response(JSON.stringify(MOCK_CHESS_COM_STATS), { status: 200 });
        }
        if (urlStr.includes('api.chess.com/pub/player/fallbackuser')) {
          return new Response(JSON.stringify(MOCK_CHESS_COM_PLAYER), { status: 200 });
        }
        return new Response('Not found', { status: 404 });
      });

      const result = await verifyPlayerAccount(undefined, 'fallbackuser');
      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(result.platform).toBe('Chess.com');
    });
  });
});
