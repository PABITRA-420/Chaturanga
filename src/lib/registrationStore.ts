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
  chessPlatform?: string | null;
  chessUsername?: string;
  fideId?: string;
  customAnswers?: Record<string, string>;
  registeredAt: string;
  checkInStatus: 'registered' | 'confirmed' | 'checked_in';
}

import { RegistrationRow, RegistrationInsert } from '@/types/database';

const REGISTRATIONS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'registrations.json');

export function dbToRegistration(row: RegistrationRow): RegistrationRecord {
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
    ratingCategory: row.rating_category || '',
    chessPlatform: (row as any).chess_platform || null,
    chessUsername: row.chess_username || 'N/A',
    fideId: row.fide_id || 'Unrated',
    customAnswers: (typeof row.custom_answers === 'object' && row.custom_answers !== null && !Array.isArray(row.custom_answers)) 
      ? (row.custom_answers as Record<string, string>) 
      : {},
    registeredAt: row.registered_at || new Date().toISOString(),
    checkInStatus: (row.check_in_status as any) || 'confirmed'
  };
}

export function registrationToDb(r: RegistrationRecord): RegistrationInsert {
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
    custom_answers: (r.customAnswers || {}) as any,
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
    if (error && process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${error.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
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
    // 1. Attempt atomic stored function in PostgreSQL with row-level locking
    const { error } = await (supabaseServer as any).rpc('register_participant_atomic', {
      p_ticket_id: record.ticketId,
      p_tournament_id: (record as any).tournamentId || record.tournament,
      p_tournament_title: record.tournament,
      p_full_name: record.fullName,
      p_roll_number: record.rollNumber,
      p_institution: record.institution,
      p_department: record.department,
      p_year: record.year,
      p_email: record.email,
      p_phone: record.phone,
      p_rating_category: record.ratingCategory,
      p_chess_platform: record.chessPlatform || null,
      p_chess_username: record.chessUsername || 'N/A',
      p_fide_id: record.fideId || 'Unrated',
      p_custom_answers: record.customAnswers || {}
    });

    if (error) {
      if (error.message?.includes('CAPACITY_REACHED')) {
        const capacityErr = new Error('CAPACITY_REACHED');
        (capacityErr as any).code = 'CAPACITY_REACHED';
        throw capacityErr;
      }
      if (error.message?.includes('DUPLICATE_REGISTRATION')) {
        const dupErr = new Error('DUPLICATE_REGISTRATION');
        (dupErr as any).code = 'DUPLICATE_REGISTRATION';
        throw dupErr;
      }

      // If stored function is not yet present on remote DB, fallback to direct insert
      const dbRecord = registrationToDb(record);
      const { error: insertError } = await supabaseServer
        .from('registrations')
        .insert([dbRecord]);

      if (insertError) {
        console.error('Supabase add registration error:', insertError);
        if (process.env.NODE_ENV === 'production') {
          const prodErr = new Error(`Database service unavailable in production: ${insertError.message}`);
          (prodErr as any).status = 503;
          throw prodErr;
        }
      }
    }
  } catch (err: any) {
    if (err.code === 'CAPACITY_REACHED' || err.code === 'DUPLICATE_REGISTRATION' || err.message?.includes('CAPACITY_REACHED') || err.message?.includes('DUPLICATE_REGISTRATION') || err.status === 503) {
      throw err;
    }
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
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
    if (error && process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${error.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  }

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
    if (error && process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${error.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
  }

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
