import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/register/route';
import { findDuplicateRegistration, addRegistration } from '@/lib/registrationStore';
import { verifyPlayerAccount } from '@/lib/playerVerification';
import { incrementTournamentRegistrations } from '@/lib/tournamentStore';
import { MOCK_REGISTRATION_RECORD } from '../fixtures/registrations';

vi.mock('@/lib/registrationStore', () => ({
  findDuplicateRegistration: vi.fn(),
  addRegistration: vi.fn(async (rec) => rec)
}));

vi.mock('@/lib/playerVerification', () => ({
  verifyPlayerAccount: vi.fn()
}));

vi.mock('@/lib/tournamentStore', () => ({
  incrementTournamentRegistrations: vi.fn().mockResolvedValue(1)
}));

describe('API Route: POST /api/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/test-script-id/exec';
  });

  const validRegistrationPayload = {
    fullName: 'Aritra Sen',
    rollNumber: '22101104012',
    institution: 'Jalpaiguri Government Engineering College',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    email: 'aritra@jgec.ac.in',
    phone: '9876543210',
    chessPlatform: 'chesscom',
    chessUsername: 'magnuscarlsen',
    fideId: '50291844',
    ratingCategory: 'Club Player (1200 - 1600)',
    tournament: 'Inter-College Chess Tournament 2026',
    customAnswers: { tshirtSize: 'L' }
  };

  it('completes registration successfully, generates ticketId, and syncs to Google Sheets', async () => {
    vi.mocked(findDuplicateRegistration).mockResolvedValueOnce(undefined);
    vi.mocked(verifyPlayerAccount).mockResolvedValueOnce({
      success: true,
      exists: true,
      platform: 'Chess.com',
      username: 'magnuscarlsen',
      status: 200
    });

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'success' }), { status: 200 })
    );

    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validRegistrationPayload)
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.ticketId).toMatch(/^CHTR-2026-[A-Z0-9]{6}$/);
    expect(body.syncedToSheet).toBe(true);

    expect(addRegistration).toHaveBeenCalledTimes(1);
    expect(incrementTournamentRegistrations).toHaveBeenCalledWith(
      'Inter-College Chess Tournament 2026'
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://script.google.com/macros/s/test-script-id/exec',
      expect.objectContaining({
        method: 'POST',
        redirect: 'follow'
      })
    );
  });

  it('returns 400 when mandatory registration details are missing', async () => {
    const invalidPayload = {
      fullName: 'Aritra Sen',
      // rollNumber is missing
      email: 'aritra@jgec.ac.in',
      phone: '9876543210'
    };

    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload)
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Missing required registration details.');
    expect(addRegistration).not.toHaveBeenCalled();
  });

  it('returns 409 conflict when duplicate roll number is registered for the same tournament', async () => {
    vi.mocked(findDuplicateRegistration).mockResolvedValueOnce(MOCK_REGISTRATION_RECORD);

    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validRegistrationPayload)
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.isDuplicate).toBe(true);
    expect(body.existingTicketId).toBe(MOCK_REGISTRATION_RECORD.ticketId);
    expect(addRegistration).not.toHaveBeenCalled();
  });

  it('returns 400 when chess platform is invalid', async () => {
    vi.mocked(findDuplicateRegistration).mockResolvedValueOnce(undefined);

    const payload = {
      ...validRegistrationPayload,
      chessPlatform: 'chess24'
    };

    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid chess platform');
  });

  it('returns 400 when chess handle does not exist on the platform', async () => {
    vi.mocked(findDuplicateRegistration).mockResolvedValueOnce(undefined);
    vi.mocked(verifyPlayerAccount).mockResolvedValueOnce({
      success: true,
      exists: false,
      message: 'Player "invalid_chess_id" not found on Chess.com.',
      status: 200
    });

    const payload = {
      ...validRegistrationPayload,
      chessUsername: 'invalid_chess_id'
    };

    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('not found');
  });

  it('returns 502/503 when upstream player verification service is unavailable', async () => {
    vi.mocked(findDuplicateRegistration).mockResolvedValueOnce(undefined);
    vi.mocked(verifyPlayerAccount).mockResolvedValueOnce({
      success: false,
      error: 'Chess.com verification service unavailable',
      status: 503
    });

    const request = new Request('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validRegistrationPayload)
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Chess.com verification service unavailable');
  });
});
