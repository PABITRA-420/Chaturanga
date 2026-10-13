import fs from 'fs';
import path from 'path';
import { UPCOMING_EVENTS, PAST_EVENTS } from '@/data/tournamentData';
import { 
  Tournament, 
  TournamentStatus, 
  FormFieldConfig, 
  CustomField, 
  TournamentPodiumItem, 
  TournamentStandingResult, 
  DEFAULT_FORM_FIELDS 
} from '@/types/tournament';

export * from '@/types/tournament';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'tournaments.json');

// Initialize initial seed data from tournamentData.ts if tournaments.json doesn't exist
function getInitialSeedTournaments(): Tournament[] {
  const seed: Tournament[] = [];

  // Seed upcoming events
  UPCOMING_EVENTS.forEach((ue, index) => {
    seed.push({
      id: ue.id,
      title: ue.title,
      date: ue.date,
      targetDate: ue.targetDate,
      time: ue.time,
      venue: ue.venue,
      format: ue.format,
      prizePool: ue.prizePool,
      slots: ue.slots,
      maxSlots: ue.id === 'inter-college-2026' ? 128 : ue.id === 'state-rapid-2026' ? 64 : 100,
      registeredCount: ue.id === 'inter-college-2026' ? 42 : 18,
      isFeatured: ue.isFeatured,
      description: ue.description,
      status: index === 0 ? 'open' : index === 1 ? 'closing_soon' : 'upcoming',
      registrationStartDate: '2026-10-01T00:00:00',
      registrationEndDate: ue.targetDate,
      entryFee: ue.id === 'inter-college-2026' ? 'Free for JGEC • ₹100 External' : '₹150 All Players',
      arbiterName: 'IA Dr. P. K. Sen / Chief Arbiter JGEC',
      contactEmail: 'tournaments@chaturanga-jgec.ac.in',
      contactPhone: '+91 94340 12345',
      fairPlayNotice: 'Standard FIDE Anti-Cheating and Digital Clock Regulations apply. Mobile devices strictly prohibited in tournament hall.',
      formConfig: JSON.parse(JSON.stringify(DEFAULT_FORM_FIELDS)),
      customFields: [],
      isPast: false,
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: new Date().toISOString()
    });
  });

  // Seed past events as completed tournaments
  PAST_EVENTS.forEach((pe) => {
    seed.push({
      id: pe.id,
      title: pe.title,
      date: pe.date,
      targetDate: `${pe.date}T09:00:00`,
      time: pe.time,
      venue: pe.venue,
      format: pe.format,
      prizePool: 'Completed',
      slots: `${pe.totalParticipants} Participants`,
      maxSlots: pe.totalParticipants,
      registeredCount: pe.totalParticipants,
      isFeatured: false,
      description: pe.summary,
      status: 'completed',
      formConfig: JSON.parse(JSON.stringify(DEFAULT_FORM_FIELDS)),
      isPast: true,
      totalParticipants: pe.totalParticipants,
      summary: pe.summary,
      podium: pe.podium,
      results: pe.results,
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-09-20T10:00:00Z'
    });
  });

  return seed;
}

// In-memory cache for ultra-fast access, with disk persistence
let cachedTournaments: Tournament[] | null = null;

export function getAllTournaments(): Tournament[] {
  if (cachedTournaments) {
    return cachedTournaments;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      cachedTournaments = JSON.parse(content);
      return cachedTournaments || [];
    }
  } catch (err) {
    console.error('Error reading tournaments.json, using fallback:', err);
  }

  // File doesn't exist, seed it
  const initial = getInitialSeedTournaments();
  saveTournaments(initial);
  return initial;
}

export function saveTournaments(tournaments: Tournament[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(tournaments, null, 2), 'utf-8');
    cachedTournaments = tournaments;
    return true;
  } catch (err) {
    console.error('Failed to save tournaments to file:', err);
    cachedTournaments = tournaments; // Keep in memory at least
    return false;
  }
}

export function getTournamentById(id: string): Tournament | null {
  const tournaments = getAllTournaments();
  return tournaments.find(t => t.id === id) || null;
}

export function createTournament(data: Partial<Tournament>): Tournament {
  const tournaments = getAllTournaments();
  
  // Create unique slug ID if not provided
  const slugBase = (data.title || 'tournament')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  let newId = slugBase || `tourn-${Date.now()}`;
  let counter = 1;
  while (tournaments.some(t => t.id === newId)) {
    newId = `${slugBase}-${counter++}`;
  }

  const newTournament: Tournament = {
    id: newId,
    title: data.title || 'Untitled Tournament',
    date: data.date || 'TBD, 2026',
    targetDate: data.targetDate || new Date(Date.now() + 86400000 * 14).toISOString(),
    time: data.time || '10:00 AM – 05:00 PM IST',
    venue: data.venue || 'Main Auditorium, JGEC Campus',
    format: data.format || 'Swiss System • Rapid',
    prizePool: data.prizePool || 'Trophies & Certificates',
    slots: data.slots || `${data.maxSlots || 64} Max Slots`,
    maxSlots: Number(data.maxSlots) || 64,
    registeredCount: 0,
    isFeatured: Boolean(data.isFeatured),
    description: data.description || 'Official college chess tournament organized by Chaturanga JGEC.',
    status: (data.status as TournamentStatus) || 'open',
    registrationStartDate: data.registrationStartDate || new Date().toISOString(),
    registrationEndDate: data.registrationEndDate || data.targetDate || new Date(Date.now() + 86400000 * 13).toISOString(),
    entryFee: data.entryFee || 'Free',
    arbiterName: data.arbiterName || 'Chief Arbiter JGEC',
    contactEmail: data.contactEmail || 'contact@chaturanga-jgec.ac.in',
    contactPhone: data.contactPhone || '+91 94340 12345',
    fairPlayNotice: data.fairPlayNotice || 'All participants must abide by the FIDE Laws of Chess.',
    formConfig: data.formConfig && data.formConfig.length > 0 ? data.formConfig : JSON.parse(JSON.stringify(DEFAULT_FORM_FIELDS)),
    customFields: data.customFields || [],
    isPast: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated = [newTournament, ...tournaments];
  saveTournaments(updated);
  return newTournament;
}

export function updateTournament(id: string, updates: Partial<Tournament>): Tournament | null {
  const tournaments = getAllTournaments();
  const index = tournaments.findIndex(t => t.id === id);
  if (index === -1) return null;

  const current = tournaments[index];
  const updatedTournament: Tournament = {
    ...current,
    ...updates,
    id: current.id, // ID remains immutable to preserve links
    updatedAt: new Date().toISOString()
  };

  tournaments[index] = updatedTournament;
  saveTournaments(tournaments);
  return updatedTournament;
}

export function deleteTournament(id: string): boolean {
  const tournaments = getAllTournaments();
  const filtered = tournaments.filter(t => t.id !== id);
  if (filtered.length === tournaments.length) return false;
  saveTournaments(filtered);
  return true;
}

export function incrementTournamentRegistrations(tournamentTitleOrId: string): void {
  const tournaments = getAllTournaments();
  const t = tournaments.find(x => x.id === tournamentTitleOrId || x.title.toLowerCase() === tournamentTitleOrId.toLowerCase());
  if (t) {
    t.registeredCount = (t.registeredCount || 0) + 1;
    t.slots = `${t.maxSlots || 128} Max (${t.registeredCount} Registered)`;
    if (t.maxSlots && t.registeredCount >= t.maxSlots) {
      t.status = 'closed'; // Auto-close when capacity reached
    }
    saveTournaments(tournaments);
  }
}

export function decrementTournamentRegistrations(tournamentTitleOrId: string): void {
  const tournaments = getAllTournaments();
  const t = tournaments.find(x => 
    x.id === tournamentTitleOrId || 
    x.title.toLowerCase() === tournamentTitleOrId.toLowerCase() ||
    x.title.toLowerCase().includes(tournamentTitleOrId.toLowerCase())
  );
  if (t) {
    t.registeredCount = Math.max(0, (t.registeredCount || 1) - 1);
    t.slots = `${t.maxSlots || 128} Max (${t.registeredCount} Registered)`;
    if (t.status === 'closed' && t.maxSlots && t.registeredCount < t.maxSlots) {
      t.status = 'open';
    }
    saveTournaments(tournaments);
  }
}

export function getTournamentByName(tournamentTitleOrId: string): Tournament | undefined {
  const tournaments = getAllTournaments();
  return tournaments.find(x => 
    x.id === tournamentTitleOrId || 
    x.title.toLowerCase() === tournamentTitleOrId.toLowerCase() ||
    x.title.toLowerCase().includes(tournamentTitleOrId.toLowerCase())
  );
}


