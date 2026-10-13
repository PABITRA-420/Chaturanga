import fs from 'fs';
import path from 'path';
import { supabaseServer } from '@/lib/supabase/server';

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

function dbToRegistration(row: any): RegistrationRecord {
  return {
    ticketId: row.ticket_id,
    tournament: row.tournament,
    fullName: row.full_name,
    rollNumber: row.roll_number,
    institution: row.institution,
    department: row.department,
    year: row.year,
    email: row.email,
    phone: row.phone,
    ratingCategory: row.rating_category,
    chessUsername: row.chess_username || 'N/A',
    fideId: row.fide_id || 'Unrated',
    customAnswers: row.custom_answers || {},
    registeredAt: row.registered_at || new Date().toISOString(),
    checkInStatus: (row.check_in_status as any) || 'confirmed'
  };
}

function registrationToDb(r: RegistrationRecord): any {
  return {
    ticket_id: r.ticketId,
    tournament: r.tournament,
    full_name: r.fullName,
    roll_number: r.rollNumber,
    institution: r.institution,
    department: r.department,
    year: r.year,
    email: r.email,
    phone: r.phone,
    rating_category: r.ratingCategory,
    chess_username: r.chessUsername || 'N/A',
    fide_id: r.fideId || 'Unrated',
    custom_answers: r.customAnswers || {},
    check_in_status: r.checkInStatus,
    registered_at: r.registeredAt || new Date().toISOString()
  };
}

function getLocalRegistrationsFallback(): RegistrationRecord[] {
  try {
    if (fs.existsSync(REGISTRATIONS_FILE_PATH)) {
      const content = fs.readFileSync(REGISTRATIONS_FILE_PATH, 'utf-8');
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [];
    }
  } catch {}
  return [];
}

export async function getAllRegistrations(): Promise<RegistrationRecord[]> {
  try {
    const { data, error } = await supabaseServer
      .from('registrations')
      .select('*')
      .order('registered_at', { ascending: false });

    if (!error && data) {
      return data.map(dbToRegistration);
    }
  } catch (err) {
    console.warn('Supabase fetch registrations failed, using fallback:', err);
  }

  return getLocalRegistrationsFallback();
}

export async function findDuplicateRegistration(rollNumber: string, tournament: string): Promise<RegistrationRecord | undefined> {
  const cleanRoll = rollNumber.trim().toLowerCase();
  const cleanTourn = tournament.trim().toLowerCase();

  try {
    const { data, error } = await supabaseServer
      .from('registrations')
      .select('*')
      .ilike('roll_number', cleanRoll)
      .ilike('tournament', cleanTourn)
      .maybeSingle();

    if (!error && data) {
      return dbToRegistration(data);
    }
  } catch {}

  const local = getLocalRegistrationsFallback();
  return local.find(r => 
    r.rollNumber.trim().toLowerCase() === cleanRoll && 
    r.tournament.trim().toLowerCase() === cleanTourn
  );
}

export async function findRegistration(query: string): Promise<RegistrationRecord | undefined> {
  const q = query.trim().toLowerCase();

  try {
    const { data, error } = await supabaseServer
      .from('registrations')
      .select('*')
      .or(`ticket_id.ilike.${q},roll_number.ilike.${q},email.ilike.${q}`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return dbToRegistration(data);
    }
  } catch {}

  const local = getLocalRegistrationsFallback();
  return local.find(r => 
    r.ticketId.toLowerCase() === q || 
    r.rollNumber.toLowerCase() === q ||
    r.email.toLowerCase() === q
  );
}

export async function addRegistration(record: RegistrationRecord): Promise<RegistrationRecord> {
  try {
    const dbRecord = registrationToDb(record);
    const { error } = await supabaseServer
      .from('registrations')
      .insert([dbRecord]);

    if (error) {
      console.error('Supabase add registration error:', error);
    }
  } catch (err) {
    console.error('Supabase insert exception:', err);
  }

  return record;
}

export async function updateRegistrationStatus(ticketId: string, status: 'registered' | 'confirmed' | 'checked_in'): Promise<boolean> {
  try {
    const { error } = await supabaseServer
      .from('registrations')
      .update({ check_in_status: status })
      .eq('ticket_id', ticketId);

    if (!error) return true;
  } catch {}

  return false;
}

export async function deleteRegistration(ticketId: string): Promise<{ success: boolean; deletedRecord?: RegistrationRecord }> {
  try {
    // Get existing first to return it
    const { data: existing } = await supabaseServer
      .from('registrations')
      .select('*')
      .eq('ticket_id', ticketId)
      .single();

    const { error } = await supabaseServer
      .from('registrations')
      .delete()
      .eq('ticket_id', ticketId);

    if (!error) {
      return { 
        success: true, 
        deletedRecord: existing ? dbToRegistration(existing) : undefined 
      };
    }
  } catch {}

  return { success: false };
}

export interface RegistrationStats {
  total: number;
  checkedIn: number;
  confirmed: number;
  byTournament: Record<string, { total: number; checkedIn: number; confirmed: number }>;
}

export async function getRegistrationStats(): Promise<RegistrationStats> {
  const all = await getAllRegistrations();
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
