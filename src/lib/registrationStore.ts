import fs from 'fs';
import path from 'path';

export interface RegistrationRecord {
  ticketId: string;
  tournament: string;
  fullName: string;
  rollNumber: string;
  institution: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  ratingCategory: string;
  chessUsername?: string;
  fideId?: string;
  customAnswers?: Record<string, string>;
  registeredAt: string;
  checkInStatus: 'registered' | 'confirmed' | 'checked_in';
}

const REGISTRATIONS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'registrations.json');

const INITIAL_REGISTRATIONS: RegistrationRecord[] = [
  {
    ticketId: 'CHTR-2026-AR94K1',
    tournament: 'Chaturanga Spring Blitz Open 2026',
    fullName: 'Aritra Sen',
    rollNumber: '22101104012',
    institution: 'Jalpaiguri Government Engineering College',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    email: 'aritra.sen@jgec.ac.in',
    phone: '9876543210',
    ratingCategory: 'College Champion (1600+)',
    chessUsername: 'aritra_gambit',
    fideId: '50291844',
    registeredAt: '2026-03-28T14:22:00.000Z',
    checkInStatus: 'confirmed'
  },
  {
    ticketId: 'CHTR-2026-SB72E9',
    tournament: 'Chaturanga Spring Blitz Open 2026',
    fullName: 'Debanjan Ghosh',
    rollNumber: '23101102008',
    institution: 'Jalpaiguri Government Engineering College',
    department: 'Information Technology',
    year: '2nd Year',
    email: 'debanjan.g@jgec.ac.in',
    phone: '9832109876',
    ratingCategory: 'Club Player (1200 - 1600)',
    chessUsername: 'debanjan_knight',
    fideId: 'Unrated',
    registeredAt: '2026-03-29T10:15:00.000Z',
    checkInStatus: 'registered'
  },
  {
    ticketId: 'CHTR-2026-MR55P3',
    tournament: 'Chaturanga Spring Blitz Open 2026',
    fullName: 'Sayanika Roy',
    rollNumber: '24101103019',
    institution: 'Jalpaiguri Government Engineering College',
    department: 'Electronics & Communication',
    year: '1st Year',
    email: 'sayanika.roy@jgec.ac.in',
    phone: '9748231145',
    ratingCategory: 'Beginner / Intermediate (<1200)',
    chessUsername: 'sayanika_queen',
    fideId: 'Unrated',
    registeredAt: '2026-03-30T16:45:00.000Z',
    checkInStatus: 'confirmed'
  }
];

function ensureDataFile(): void {
  try {
    const dir = path.dirname(REGISTRATIONS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(REGISTRATIONS_FILE_PATH)) {
      fs.writeFileSync(REGISTRATIONS_FILE_PATH, JSON.stringify(INITIAL_REGISTRATIONS, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error ensuring registrations.json file exists:', error);
  }
}

export function getAllRegistrations(): RegistrationRecord[] {
  ensureDataFile();
  try {
    const content = fs.readFileSync(REGISTRATIONS_FILE_PATH, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : INITIAL_REGISTRATIONS;
  } catch (error) {
    console.error('Error reading registrations.json, falling back to initial data:', error);
    return INITIAL_REGISTRATIONS;
  }
}

export function saveRegistrations(registrations: RegistrationRecord[]): boolean {
  ensureDataFile();
  try {
    fs.writeFileSync(REGISTRATIONS_FILE_PATH, JSON.stringify(registrations, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to registrations.json:', error);
    return false;
  }
}

export function findDuplicateRegistration(rollNumber: string, tournament: string): RegistrationRecord | undefined {
  const all = getAllRegistrations();
  const cleanRoll = rollNumber.trim().toLowerCase();
  const cleanTourn = tournament.trim().toLowerCase();
  return all.find(r => 
    r.rollNumber.trim().toLowerCase() === cleanRoll && 
    r.tournament.trim().toLowerCase() === cleanTourn
  );
}

export function findRegistration(query: string): RegistrationRecord | undefined {
  const all = getAllRegistrations();
  const q = query.trim().toLowerCase();
  return all.find(r => 
    r.ticketId.toLowerCase() === q || 
    r.rollNumber.toLowerCase() === q ||
    r.email.toLowerCase() === q
  );
}

export function addRegistration(record: RegistrationRecord): RegistrationRecord {
  const all = getAllRegistrations();
  all.unshift(record);
  saveRegistrations(all);
  return record;
}

export function updateRegistrationStatus(ticketId: string, status: 'registered' | 'confirmed' | 'checked_in'): boolean {
  const all = getAllRegistrations();
  const index = all.findIndex(r => r.ticketId === ticketId);
  if (index === -1) return false;
  all[index].checkInStatus = status;
  return saveRegistrations(all);
}

export function deleteRegistration(ticketId: string): { success: boolean; deletedRecord?: RegistrationRecord } {
  const all = getAllRegistrations();
  const index = all.findIndex(r => r.ticketId === ticketId);
  if (index === -1) return { success: false };
  const [deletedRecord] = all.splice(index, 1);
  saveRegistrations(all);
  return { success: true, deletedRecord };
}

export interface RegistrationStats {
  total: number;
  checkedIn: number;
  confirmed: number;
  byTournament: Record<string, { total: number; checkedIn: number; confirmed: number }>;
}

export function getRegistrationStats(): RegistrationStats {
  const all = getAllRegistrations();
  const stats: RegistrationStats = {
    total: all.length,
    checkedIn: all.filter(r => r.checkInStatus === 'checked_in').length,
    confirmed: all.filter(r => r.checkInStatus !== 'checked_in').length,
    byTournament: {}
  };

  all.forEach(r => {
    const t = r.tournament;
    if (!stats.byTournament[t]) {
      stats.byTournament[t] = { total: 0, checkedIn: 0, confirmed: 0 };
    }
    stats.byTournament[t].total += 1;
    if (r.checkInStatus === 'checked_in') {
      stats.byTournament[t].checkedIn += 1;
    } else {
      stats.byTournament[t].confirmed += 1;
    }
  });

  return stats;
}
