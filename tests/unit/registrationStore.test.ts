import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseServer } from '@/lib/supabase/server';
import {
  findDuplicateRegistration,
  addRegistration,
  findRegistration,
  updateRegistrationStatus,
  deleteRegistration,
  getRegistrationStats,
  getAllRegistrations,
  RegistrationRecord
} from '@/lib/registrationStore';
import { MOCK_REGISTRATION_RECORD, MOCK_REGISTRATION_ROW } from '../fixtures/registrations';

vi.mock('@/lib/supabase/server', () => {
  return {
    supabaseServer: {
      from: vi.fn(),
      rpc: vi.fn()
    },
    getSupabaseConfig: vi.fn(() => ({
      hasServiceRoleKey: true,
      isConfigured: true,
      url: 'https://test.supabase.co',
      anonKey: 'test-anon',
      serviceKey: 'test-service'
    })),
    createSupabaseServerClient: vi.fn()
  };
});

describe('Registration Store (registrationStore.ts)', () => {
  let mockQuery: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis()
    };

    vi.mocked(supabaseServer.from).mockReturnValue(mockQuery);
    vi.mocked((supabaseServer as any).rpc).mockResolvedValue({ data: null, error: { message: 'function does not exist' } });
  });

  describe('findDuplicateRegistration', () => {
    it('detects existing registration with same roll number and tournament', async () => {
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: MOCK_REGISTRATION_ROW,
        error: null
      });

      const duplicate = await findDuplicateRegistration(
        '22101104012',
        'Inter-College Chess Tournament 2026'
      );

      expect(duplicate).toBeDefined();
      expect(duplicate?.ticketId).toBe(MOCK_REGISTRATION_RECORD.ticketId);
      expect(duplicate?.rollNumber).toBe('22101104012');
      expect(mockQuery.ilike).toHaveBeenCalledWith('roll_number', '22101104012');
      expect(mockQuery.ilike).toHaveBeenCalledWith(
        'tournament',
        'inter-college chess tournament 2026'
      );
    });

    it('matches roll number and tournament case-insensitively with leading/trailing spaces trimmed', async () => {
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: MOCK_REGISTRATION_ROW,
        error: null
      });

      const duplicate = await findDuplicateRegistration(
        '  22101104012  ',
        '  INTER-COLLEGE CHESS TOURNAMENT 2026  '
      );

      expect(duplicate).toBeDefined();
      expect(mockQuery.ilike).toHaveBeenCalledWith('roll_number', '22101104012');
      expect(mockQuery.ilike).toHaveBeenCalledWith(
        'tournament',
        'inter-college chess tournament 2026'
      );
    });

    it('returns undefined when no duplicate exists for the given tournament', async () => {
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      const duplicate = await findDuplicateRegistration(
        '22101104999',
        'Inter-College Chess Tournament 2026'
      );

      expect(duplicate).toBeUndefined();
    });

    it('handles database errors gracefully and falls back to local data without throwing', async () => {
      mockQuery.maybeSingle.mockRejectedValueOnce(new Error('Connection timeout to Supabase'));

      const duplicate = await findDuplicateRegistration(
        'unknown_roll',
        'Some Tournament'
      );

      expect(duplicate).toBeUndefined();
    });
  });

  describe('addRegistration', () => {
    it('inserts registration into database and returns the record', async () => {
      mockQuery.insert.mockResolvedValueOnce({ data: null, error: null });

      const newRecord: RegistrationRecord = {
        ...MOCK_REGISTRATION_RECORD,
        ticketId: 'CHTR-2026-XYZ999',
        rollNumber: '22101104099'
      };

      const result = await addRegistration(newRecord);

      expect(result).toEqual(newRecord);
      expect(supabaseServer.from).toHaveBeenCalledWith('registrations');
      expect(mockQuery.insert).toHaveBeenCalledTimes(1);
      const insertedPayload = mockQuery.insert.mock.calls[0][0][0];
      expect(insertedPayload.ticket_id).toBe('CHTR-2026-XYZ999');
      expect(insertedPayload.roll_number).toBe('22101104099');
    });

    it('gracefully handles database failure during insert without throwing', async () => {
      mockQuery.insert.mockRejectedValueOnce(new Error('Postgres unique constraint violation'));

      const newRecord: RegistrationRecord = {
        ...MOCK_REGISTRATION_RECORD,
        ticketId: 'CHTR-2026-ERR001'
      };

      // Must not throw unhandled exception
      const result = await addRegistration(newRecord);
      expect(result).toEqual(newRecord);
    });
  });

  describe('getAllRegistrations', () => {
    it('fetches all registrations ordered by registered_at descending', async () => {
      mockQuery.order.mockResolvedValueOnce({
        data: [MOCK_REGISTRATION_ROW],
        error: null
      });

      const registrations = await getAllRegistrations();

      expect(registrations).toHaveLength(1);
      expect(registrations[0].ticketId).toBe(MOCK_REGISTRATION_ROW.ticket_id);
      expect(registrations[0].fullName).toBe(MOCK_REGISTRATION_ROW.full_name);
      expect(mockQuery.order).toHaveBeenCalledWith('registered_at', { ascending: false });
    });

    it('falls back gracefully to empty or local array on database failure', async () => {
      mockQuery.order.mockRejectedValueOnce(new Error('Network error'));

      const registrations = await getAllRegistrations();
      expect(Array.isArray(registrations)).toBe(true);
    });
  });

  describe('findRegistration', () => {
    it('queries registrations by ticket ID, roll number, or email', async () => {
      mockQuery.maybeSingle.mockResolvedValueOnce({
        data: MOCK_REGISTRATION_ROW,
        error: null
      });

      const found = await findRegistration('CHTR-2026-ABC123');

      expect(found).toBeDefined();
      expect(found?.ticketId).toBe(MOCK_REGISTRATION_ROW.ticket_id);
      expect(mockQuery.or).toHaveBeenCalledWith(
        'ticket_id.ilike.chtr-2026-abc123,roll_number.ilike.chtr-2026-abc123,email.ilike.chtr-2026-abc123'
      );
    });
  });

  describe('updateRegistrationStatus', () => {
    it('updates status and returns true on success', async () => {
      mockQuery.eq.mockResolvedValueOnce({ data: null, error: null });

      const success = await updateRegistrationStatus('CHTR-2026-ABC123', 'checked_in');

      expect(success).toBe(true);
      expect(mockQuery.update).toHaveBeenCalledWith({ check_in_status: 'checked_in' });
      expect(mockQuery.eq).toHaveBeenCalledWith('ticket_id', 'CHTR-2026-ABC123');
    });

    it('returns false if database update fails', async () => {
      mockQuery.eq.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      const success = await updateRegistrationStatus('INVALID-ID', 'checked_in');
      expect(success).toBe(false);
    });
  });

  describe('deleteRegistration', () => {
    it('fetches existing record before deleting and returns deletedRecord', async () => {
      const selectBuilder = {
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: MOCK_REGISTRATION_ROW, error: null })
        })
      };
      const deleteBuilder = {
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      };

      vi.mocked(supabaseServer.from).mockImplementation((table: string) => {
        return {
          select: vi.fn().mockReturnValue(selectBuilder),
          delete: vi.fn().mockReturnValue(deleteBuilder)
        } as any;
      });

      const result = await deleteRegistration('CHTR-2026-ABC123');

      expect(result.success).toBe(true);
      expect(result.deletedRecord?.ticketId).toBe(MOCK_REGISTRATION_ROW.ticket_id);
    });
  });

  describe('getRegistrationStats', () => {
    it('calculates total, checkedIn, confirmed, and per-tournament aggregates correctly', async () => {
      const records = [
        { ...MOCK_REGISTRATION_ROW, ticket_id: '1', check_in_status: 'checked_in', tournament: 'T1' },
        { ...MOCK_REGISTRATION_ROW, ticket_id: '2', check_in_status: 'confirmed', tournament: 'T1' },
        { ...MOCK_REGISTRATION_ROW, ticket_id: '3', check_in_status: 'registered', tournament: 'T2' }
      ];

      mockQuery.order.mockResolvedValueOnce({
        data: records,
        error: null
      });

      const stats = await getRegistrationStats();

      expect(stats.total).toBe(3);
      expect(stats.checkedIn).toBe(1);
      expect(stats.confirmed).toBe(2);
      expect(stats.byTournament['T1']).toEqual({ total: 2, checkedIn: 1, confirmed: 1 });
      expect(stats.byTournament['T2']).toEqual({ total: 1, checkedIn: 0, confirmed: 1 });
    });
  });
});
