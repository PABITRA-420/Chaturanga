import fs from 'fs';
import path from 'path';
import { supabaseServer } from '@/lib/supabase/server';
import { UPCOMING_EVENTS, PAST_EVENTS } from '@/data/tournamentData';
import { 
  Tournament, 
  TournamentStatus, 
  DEFAULT_FORM_FIELDS 
} from '@/types/tournament';

import { TournamentRow, TournamentInsert } from '@/types/database';

export * from '@/types/tournament';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'tournaments.json');

export function dbToTournament(row: TournamentRow): Tournament {
  return {
    id: row.id,
    title: row.title,
    date: row.date || '',
    targetDate: row.target_date || '',
    time: row.time || '',
    venue: row.venue || '',
    format: row.format || '',
    prizePool: row.prize_pool || '',
    slots: row.slots || '',
    maxSlots: Number(row.max_slots ?? 100),
    registeredCount: Number(row.registered_count ?? 0),
    isFeatured: Boolean(row.is_featured),
    isVisible: row.is_visible !== null && row.is_visible !== undefined ? Boolean(row.is_visible) : true,
    description: row.description || '',
    status: (row.status as TournamentStatus) || 'upcoming',
    registrationStartDate: row.registration_start_date || undefined,
    registrationEndDate: row.registration_end_date || undefined,
    entryFee: row.entry_fee || undefined,
    arbiterName: row.arbiter_name || undefined,
    contactEmail: row.contact_email || undefined,
    contactPhone: row.contact_phone || undefined,
    fairPlayNotice: row.fair_play_notice || undefined,
    formConfig: Array.isArray(row.form_config) ? (row.form_config as any) : [],
    customFields: Array.isArray(row.custom_fields) ? (row.custom_fields as any) : [],
    isPast: Boolean(row.is_past),
    totalParticipants: Number(row.total_participants ?? 0),
    summary: row.summary || undefined,
    podium: Array.isArray(row.podium) ? (row.podium as any) : [],
    results: Array.isArray(row.results) ? (row.results as any) : [],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

export function tournamentToDb(t: Tournament): TournamentInsert {
  return {
    id: t.id,
    title: t.title,
    date: t.date,
    target_date: t.targetDate,
    time: t.time,
    venue: t.venue,
    format: t.format,
    prize_pool: t.prizePool,
    slots: t.slots,
    max_slots: t.maxSlots,
    registered_count: t.registeredCount,
    is_featured: t.isFeatured,
    is_visible: t.isVisible !== undefined ? t.isVisible : true,
    description: t.description,
    status: t.status,
    registration_start_date: t.registrationStartDate,
    registration_end_date: t.registrationEndDate,
    entry_fee: t.entryFee,
    arbiter_name: t.arbiterName,
    contact_email: t.contactEmail,
    contact_phone: t.contactPhone,
    fair_play_notice: t.fairPlayNotice,
    form_config: t.formConfig as any,
    custom_fields: t.customFields as any,
    is_past: t.isPast,
    total_participants: t.totalParticipants,
    summary: t.summary,
    podium: t.podium as any,
    results: t.results as any,
    updated_at: new Date().toISOString()
  };
}

// Fallback initial seeds if offline
function getInitialSeedTournaments(): Tournament[] {
  const seed: Tournament[] = [];
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
      fairPlayNotice: 'Standard FIDE Anti-Cheating and Digital Clock Regulations apply.',
      formConfig: JSON.parse(JSON.stringify(DEFAULT_FORM_FIELDS)),
      customFields: [],
      isPast: false,
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: new Date().toISOString()
    });
  });

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

function getLocalTournamentsFallback(): Tournament[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return getInitialSeedTournaments();
}

let lastTournamentDataSource: 'supabase' | 'fallback-mock' = 'supabase';

export function getLastTournamentDataSource(): 'supabase' | 'fallback-mock' {
  return lastTournamentDataSource;
}

export function setLastTournamentDataSourceForTesting(source: 'supabase' | 'fallback-mock') {
  lastTournamentDataSource = source;
}

export async function getAllTournaments(): Promise<Tournament[]> {
  try {
    const { data, error } = await supabaseServer
      .from('tournaments')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('target_date', { ascending: true });

    if (!error && data !== null) {
      lastTournamentDataSource = 'supabase';
      return data.map(dbToTournament);
    }
    if (error) {
      console.warn('Supabase fetch tournaments error:', error.message);
    }
  } catch (err) {
    console.warn('Supabase fetch tournaments failed, using local fallback:', err);
  }

  lastTournamentDataSource = 'fallback-mock';
  return getLocalTournamentsFallback();
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
  try {
    const { data, error } = await supabaseServer
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error) {
      return data ? dbToTournament(data) : null;
    }
  } catch (err) {
    console.warn('Supabase getTournamentById error:', err);
  }

  const local = getLocalTournamentsFallback();
  return local.find(t => t.id === id) || null;
}

export async function createTournament(data: Partial<Tournament>): Promise<Tournament> {
  const existing = await getAllTournaments();
  
  const slugBase = (data.title || 'tournament')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  let newId = slugBase || `tourn-${Date.now()}`;
  let counter = 1;
  while (existing.some(t => t.id === newId)) {
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

  try {
    const dbRecord = tournamentToDb(newTournament);
    const { error } = await supabaseServer
      .from('tournaments')
      .insert([dbRecord]);

    if (error) {
      console.error('Supabase create tournament error:', error);
      if (process.env.NODE_ENV === 'production') {
        const prodErr = new Error(`Database service unavailable in production: ${error.message}`);
        (prodErr as any).status = 503;
        throw prodErr;
      }
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
    console.error('Supabase insert exception:', err);
  }

  return newTournament;
}

export async function updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | null> {
  const current = await getTournamentById(id);
  if (!current) return null;

  const updatedTournament: Tournament = {
    ...current,
    ...updates,
    id: current.id,
    updatedAt: new Date().toISOString()
  };

  try {
    const dbRecord = tournamentToDb(updatedTournament);
    const { error } = await supabaseServer
      .from('tournaments')
      .update(dbRecord)
      .eq('id', id);

    if (error) {
      console.error('Supabase update tournament error:', error);
      if (process.env.NODE_ENV === 'production') {
        const prodErr = new Error(`Database service unavailable in production: ${error.message}`);
        (prodErr as any).status = 503;
        throw prodErr;
      }
    }
  } catch (err: any) {
    if (err.status === 503) throw err;
    if (process.env.NODE_ENV === 'production') {
      const prodErr = new Error(`Database service unavailable in production: ${err.message}`);
      (prodErr as any).status = 503;
      throw prodErr;
    }
    console.error('Supabase update exception:', err);
  }

  return updatedTournament;
}

export async function deleteTournament(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseServer
      .from('tournaments')
      .delete()
      .eq('id', id);

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

export async function incrementTournamentRegistrations(tournamentTitleOrId: string): Promise<void> {
  const tournaments = await getAllTournaments();
  const t = tournaments.find(x => 
    x.id === tournamentTitleOrId || 
    x.title.toLowerCase() === tournamentTitleOrId.toLowerCase()
  );

  if (t) {
    const newCount = (t.registeredCount || 0) + 1;
    const newSlots = `${t.maxSlots || 128} Max (${newCount} Registered)`;
    const newStatus = t.maxSlots && newCount >= t.maxSlots ? 'closed' : t.status;

    await updateTournament(t.id, {
      registeredCount: newCount,
      slots: newSlots,
      status: newStatus
    });
  }
}

export async function decrementTournamentRegistrations(tournamentTitleOrId: string): Promise<void> {
  const tournaments = await getAllTournaments();
  const t = tournaments.find(x => 
    x.id === tournamentTitleOrId || 
    x.title.toLowerCase() === tournamentTitleOrId.toLowerCase() ||
    x.title.toLowerCase().includes(tournamentTitleOrId.toLowerCase())
  );

  if (t) {
    const newCount = Math.max(0, (t.registeredCount || 1) - 1);
    const newSlots = `${t.maxSlots || 128} Max (${newCount} Registered)`;
    const newStatus = t.status === 'closed' && t.maxSlots && newCount < t.maxSlots ? 'open' : t.status;

    await updateTournament(t.id, {
      registeredCount: newCount,
      slots: newSlots,
      status: newStatus
    });
  }
}

export async function getTournamentByName(tournamentTitleOrId: string): Promise<Tournament | undefined> {
  const tournaments = await getAllTournaments();
  return tournaments.find(x => 
    x.id === tournamentTitleOrId || 
    x.title.toLowerCase() === tournamentTitleOrId.toLowerCase() ||
    x.title.toLowerCase().includes(tournamentTitleOrId.toLowerCase())
  );
}
