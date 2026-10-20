import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/player/verify/route';
import { verifyPlayerAccount } from '@/lib/playerVerification';

vi.mock('@/lib/playerVerification', () => ({
  verifyPlayerAccount: vi.fn()
}));

describe('API Route: GET /api/player/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with profile and ratings for a verified account', async () => {
    vi.mocked(verifyPlayerAccount).mockResolvedValueOnce({
      success: true,
      exists: true,
      platform: 'Chess.com',
      username: 'magnuscarlsen',
      ratings: { rapid: 2832, blitz: 2886, bullet: 3105 },
      status: 200
    });

    const request = new Request('http://localhost:3000/api/player/verify?platform=chesscom&username=magnuscarlsen');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.exists).toBe(true);
    expect(body.username).toBe('magnuscarlsen');
    expect(body.ratings.blitz).toBe(2886);
    expect(verifyPlayerAccount).toHaveBeenCalledWith('chesscom', 'magnuscarlsen');
  });

  it('returns 400 when username is missing from query string', async () => {
    vi.mocked(verifyPlayerAccount).mockResolvedValueOnce({
      success: false,
      error: 'Username is required',
      status: 400
    });

    const request = new Request('http://localhost:3000/api/player/verify?platform=chesscom');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Username is required');
  });

  it('returns 400 when an unsupported chess platform is specified', async () => {
    vi.mocked(verifyPlayerAccount).mockResolvedValueOnce({
      success: false,
      error: 'Invalid chess platform. Only chesscom or lichess are supported.',
      status: 400
    });

    const request = new Request('http://localhost:3000/api/player/verify?platform=chess24&username=magnus');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid chess platform');
  });
});
