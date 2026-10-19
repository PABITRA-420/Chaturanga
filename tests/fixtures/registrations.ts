import { RegistrationRecord } from '@/lib/registrationStore';

export const MOCK_REGISTRATION_RECORD: RegistrationRecord = {
  ticketId: 'CHTR-2026-ABC123',
  tournament: 'Inter-College Chess Tournament 2026',
  fullName: 'Aritra Sen',
  rollNumber: '22101104012',
  institution: 'Jalpaiguri Government Engineering College',
  department: 'Computer Science & Engineering',
  year: '3rd Year',
  email: 'aritra@jgec.ac.in',
  phone: '9876543210',
  ratingCategory: 'Club Player (1200 - 1600)',
  chessPlatform: 'chesscom',
  chessUsername: 'aritra_gambit',
  fideId: '50291844',
  customAnswers: {
    tshirtSize: 'L',
    stayRequired: 'No'
  },
  registeredAt: '2026-10-01T12:00:00.000Z',
  checkInStatus: 'confirmed'
};

export const MOCK_REGISTRATION_ROW = {
  id: 'uuid-1234',
  ticket_id: 'CHTR-2026-ABC123',
  tournament_id: 'inter-college-2026',
  tournament: 'Inter-College Chess Tournament 2026',
  full_name: 'Aritra Sen',
  roll_number: '22101104012',
  institution: 'Jalpaiguri Government Engineering College',
  department: 'Computer Science & Engineering',
  year: '3rd Year',
  email: 'aritra@jgec.ac.in',
  phone: '9876543210',
  rating_category: 'Club Player (1200 - 1600)',
  chess_platform: 'chesscom',
  chess_username: 'aritra_gambit',
  fide_id: '50291844',
  custom_answers: {
    tshirtSize: 'L',
    stayRequired: 'No'
  },
  registered_at: '2026-10-01T12:00:00.000Z',
  check_in_status: 'confirmed'
};
