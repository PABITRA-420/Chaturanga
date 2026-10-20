import { DepartmentTeam, TeamPlayer, DepartmentCode } from '@/types/teamPairing';
import { supabaseServer } from '@/lib/supabase/server';
import { TeamMember, TEAM_MEMBERS } from '@/data/teamData';

export * from '@/data/teamData';

export const DEFAULT_JGEC_TEAMS: DepartmentTeam[] = [
  {
    id: 'team-jgec-cse',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'CSE',
    department_name: 'Computer Science & Engineering',
    captain_name: 'Arpan Chakraborty',
    captain_contact: 'arpan.cse@jgec.ac.in',
    seed_rating: 1820,
    roster: [
      { id: 'cse-b1', name: 'Arpan Chakraborty', rating: 1950, board_number: 1, is_reserve: false, department_code: 'CSE' },
      { id: 'cse-b2', name: 'Subham Ghosh', rating: 1870, board_number: 2, is_reserve: false, department_code: 'CSE' },
      { id: 'cse-b3', name: 'Priyanka Das', rating: 1780, board_number: 3, is_reserve: false, department_code: 'CSE' },
      { id: 'cse-b4', name: 'Debjyoti Sen', rating: 1680, board_number: 4, is_reserve: false, department_code: 'CSE' },
      { id: 'cse-res1', name: 'Anik Paul', rating: 1620, board_number: 5, is_reserve: true, department_code: 'CSE' },
      { id: 'cse-res2', name: 'Sneha Roy', rating: 1550, board_number: 6, is_reserve: true, department_code: 'CSE' },
    ],
  },
  {
    id: 'team-jgec-it',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'IT',
    department_name: 'Information Technology',
    captain_name: 'Rohan Banerjee',
    captain_contact: 'rohan.it@jgec.ac.in',
    seed_rating: 1790,
    roster: [
      { id: 'it-b1', name: 'Rohan Banerjee', rating: 1910, board_number: 1, is_reserve: false, department_code: 'IT' },
      { id: 'it-b2', name: 'Souvik Karmakar', rating: 1840, board_number: 2, is_reserve: false, department_code: 'IT' },
      { id: 'it-b3', name: 'Aditi Saha', rating: 1750, board_number: 3, is_reserve: false, department_code: 'IT' },
      { id: 'it-b4', name: 'Kuntal Dutta', rating: 1660, board_number: 4, is_reserve: false, department_code: 'IT' },
      { id: 'it-res1', name: 'Tanmoy Barman', rating: 1590, board_number: 5, is_reserve: true, department_code: 'IT' },
    ],
  },
  {
    id: 'team-jgec-ece',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'ECE',
    department_name: 'Electronics & Communication',
    captain_name: 'Sayan Majumder',
    captain_contact: 'sayan.ece@jgec.ac.in',
    seed_rating: 1750,
    roster: [
      { id: 'ece-b1', name: 'Sayan Majumder', rating: 1880, board_number: 1, is_reserve: false, department_code: 'ECE' },
      { id: 'ece-b2', name: 'Manojit Mondal', rating: 1810, board_number: 2, is_reserve: false, department_code: 'ECE' },
      { id: 'ece-b3', name: 'Riya Mukherjee', rating: 1710, board_number: 3, is_reserve: false, department_code: 'ECE' },
      { id: 'ece-b4', name: 'Sourav Roy', rating: 1600, board_number: 4, is_reserve: false, department_code: 'ECE' },
      { id: 'ece-res1', name: 'Bitan Sarkar', rating: 1530, board_number: 5, is_reserve: true, department_code: 'ECE' },
    ],
  },
  {
    id: 'team-jgec-ee',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'EE',
    department_name: 'Electrical Engineering',
    captain_name: 'Avishek Das',
    captain_contact: 'avishek.ee@jgec.ac.in',
    seed_rating: 1720,
    roster: [
      { id: 'ee-b1', name: 'Avishek Das', rating: 1850, board_number: 1, is_reserve: false, department_code: 'EE' },
      { id: 'ee-b2', name: 'Sandip Ghosh', rating: 1770, board_number: 2, is_reserve: false, department_code: 'EE' },
      { id: 'ee-b3', name: 'Rupak Dey', rating: 1680, board_number: 3, is_reserve: false, department_code: 'EE' },
      { id: 'ee-b4', name: 'Swagata Pal', rating: 1580, board_number: 4, is_reserve: false, department_code: 'EE' },
      { id: 'ee-res1', name: 'Prasenjit Roy', rating: 1510, board_number: 5, is_reserve: true, department_code: 'EE' },
    ],
  },
  {
    id: 'team-jgec-me',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'ME',
    department_name: 'Mechanical Engineering',
    captain_name: 'Indranil Roy',
    captain_contact: 'indranil.me@jgec.ac.in',
    seed_rating: 1700,
    roster: [
      { id: 'me-b1', name: 'Indranil Roy', rating: 1830, board_number: 1, is_reserve: false, department_code: 'ME' },
      { id: 'me-b2', name: 'Joyjit Sen', rating: 1740, board_number: 2, is_reserve: false, department_code: 'ME' },
      { id: 'me-b3', name: 'Abhijit Saha', rating: 1650, board_number: 3, is_reserve: false, department_code: 'ME' },
      { id: 'me-b4', name: 'Suman Mondal', rating: 1580, board_number: 4, is_reserve: false, department_code: 'ME' },
      { id: 'me-res1', name: 'Dipankar Das', rating: 1500, board_number: 5, is_reserve: true, department_code: 'ME' },
    ],
  },
  {
    id: 'team-jgec-ce',
    tournament_id: 'tourn-jgec-interdept-2026',
    department_code: 'CE',
    department_name: 'Civil Engineering',
    captain_name: 'Tuhin Chatterjee',
    captain_contact: 'tuhin.ce@jgec.ac.in',
    seed_rating: 1670,
    roster: [
      { id: 'ce-b1', name: 'Tuhin Chatterjee', rating: 1790, board_number: 1, is_reserve: false, department_code: 'CE' },
      { id: 'ce-b2', name: 'Anirban Bhowmick', rating: 1710, board_number: 2, is_reserve: false, department_code: 'CE' },
      { id: 'ce-b3', name: 'Subhadeep Paul', rating: 1620, board_number: 3, is_reserve: false, department_code: 'CE' },
      { id: 'ce-b4', name: 'Niladri Sarkar', rating: 1560, board_number: 4, is_reserve: false, department_code: 'CE' },
      { id: 'ce-res1', name: 'Rajib Roy', rating: 1480, board_number: 5, is_reserve: true, department_code: 'CE' },
    ],
  },
];

// In-memory team registry
const teamRegistry = new Map<string, DepartmentTeam>();

// Initialize with defaults
DEFAULT_JGEC_TEAMS.forEach(team => {
  teamRegistry.set(team.id, { ...team, roster: [...team.roster] });
});

const STORAGE_KEY_PREFIX = 'chaturanga_teams_';

/**
 * Get all registered teams for a tournament
 */
export function getTeams(tournamentId: string): DepartmentTeam[] {
  // Sync from browser localStorage if available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_PREFIX + tournamentId);
      if (stored) {
        const parsed: DepartmentTeam[] = JSON.parse(stored);
        parsed.forEach(t => teamRegistry.set(t.id, t));
      }
    } catch (e) {
      console.warn('Could not read teams from localStorage', e);
    }
  }

  const results: DepartmentTeam[] = [];
  teamRegistry.forEach(team => {
    if (team.tournament_id === tournamentId || tournamentId === 'all') {
      results.push(team);
    }
  });

  return results.length > 0 ? results : DEFAULT_JGEC_TEAMS.filter(t => t.tournament_id === tournamentId || tournamentId === 'all');
}

/**
 * Get a specific team by its ID
 */
export function getTeam(teamId: string): DepartmentTeam | undefined {
  return teamRegistry.get(teamId);
}

/**
 * Save or update a team in the registry
 */
export function saveTeam(team: DepartmentTeam): DepartmentTeam {
  const updated: DepartmentTeam = {
    ...team,
    updated_at: new Date().toISOString(),
  };
  teamRegistry.set(team.id, updated);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const allForTourn = getTeams(team.tournament_id);
      window.localStorage.setItem(STORAGE_KEY_PREFIX + team.tournament_id, JSON.stringify(allForTourn));
    } catch (e) {
      console.warn('Could not persist teams to localStorage', e);
    }
  }

  return updated;
}

/**
 * Update the roster of players for a specific team
 */
export function updateRoster(teamId: string, roster: TeamPlayer[]): DepartmentTeam | undefined {
  const team = teamRegistry.get(teamId);
  if (!team) return undefined;

  const updated: DepartmentTeam = {
    ...team,
    roster,
    updated_at: new Date().toISOString(),
  };

  teamRegistry.set(teamId, updated);
  return updated;
}

/**
 * Reset team registry to pristine seed state (primarily for tests)
 */
export function resetTeamRegistry(): void {
  teamRegistry.clear();
  DEFAULT_JGEC_TEAMS.forEach(team => {
    teamRegistry.set(team.id, { ...team, roster: [...team.roster] });
  });
}

function dbToTeamMember(row: any): TeamMember {
  return {
    id: row.id,
    name: row.name || '',
    role: row.role || '',
    category: row.category || 'core',
    department: row.department || '',
    year: row.year || '',
    elo: row.elo || '',
    fideId: row.fide_id || undefined,
    bio: row.bio || '',
    responsibilities: Array.isArray(row.responsibilities) ? row.responsibilities : [],
    favoriteOpening: row.favorite_opening || '',
    achievements: Array.isArray(row.achievements) ? row.achievements : [],
    chessPiece: row.chess_piece || 'Knight',
    avatarColor: row.avatar_color || 'from-amber-400 to-yellow-600',
    titleBadge: row.title_badge || '',
    imageUrl: row.image_url || undefined,
  };
}

function teamMemberToDb(m: Partial<TeamMember>): any {
  const dbRecord: any = {};
  if (m.id !== undefined) dbRecord.id = m.id;
  if (m.name !== undefined) dbRecord.name = m.name;
  if (m.role !== undefined) dbRecord.role = m.role;
  if (m.category !== undefined) dbRecord.category = m.category;
  if (m.department !== undefined) dbRecord.department = m.department;
  if (m.year !== undefined) dbRecord.year = m.year;
  if (m.elo !== undefined) dbRecord.elo = m.elo;
  if (m.fideId !== undefined) dbRecord.fide_id = m.fideId === null ? null : m.fideId;
  if (m.bio !== undefined) dbRecord.bio = m.bio;
  if (m.responsibilities !== undefined) dbRecord.responsibilities = m.responsibilities;
  if (m.favoriteOpening !== undefined) dbRecord.favorite_opening = m.favoriteOpening;
  if (m.achievements !== undefined) dbRecord.achievements = m.achievements;
  if (m.chessPiece !== undefined) dbRecord.chess_piece = m.chessPiece;
  if (m.avatarColor !== undefined) dbRecord.avatar_color = m.avatarColor;
  if (m.titleBadge !== undefined) dbRecord.title_badge = m.titleBadge;
  if (m.imageUrl !== undefined) dbRecord.image_url = m.imageUrl === null ? null : m.imageUrl;
  dbRecord.updated_at = new Date().toISOString();
  return dbRecord;
}

export async function getAllTeamMembers(category?: string): Promise<TeamMember[]> {
  try {
    let query = supabaseServer
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (!error && data !== null) {
      return data.map(dbToTeamMember);
    }
    if (error) {
      console.warn('Supabase fetch team_members error:', error.message);
    }
  } catch (err) {
    console.warn('Supabase fetch team_members failed:', err);
  }

  return [];
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  try {
    const { data, error } = await supabaseServer
      .from('team_members')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return dbToTeamMember(data);
    }
  } catch (err) {
    console.warn(`Supabase fetch team_member ${id} failed:`, err);
  }
  return null;
}

export async function createTeamMember(data: Partial<TeamMember>): Promise<TeamMember> {
  const id = data.id || `member-${Date.now()}`;
  const record: TeamMember = {
    id,
    name: data.name || 'Member',
    role: data.role || 'Coordinator',
    category: data.category || 'coordinator',
    department: data.department || '',
    year: data.year || '',
    elo: data.elo || '',
    fideId: data.fideId,
    bio: data.bio || '',
    responsibilities: data.responsibilities || [],
    favoriteOpening: data.favoriteOpening || '',
    achievements: data.achievements || [],
    chessPiece: data.chessPiece || 'Knight',
    avatarColor: data.avatarColor || 'from-amber-400 to-yellow-600',
    titleBadge: data.titleBadge || '',
    imageUrl: data.imageUrl,
  };

  const dbRecord = teamMemberToDb(record);
  const { data: inserted, error } = await supabaseServer
    .from('team_members')
    .insert([dbRecord])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create team member: ${error.message}`);
  }

  return dbToTeamMember(inserted);
}

export async function updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
  const dbRecord = teamMemberToDb(updates);
  delete dbRecord.id;

  const { data, error } = await supabaseServer
    .from('team_members')
    .update(dbRecord)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update team member: ${error.message}`);
  }

  return dbToTeamMember(data);
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const { error } = await supabaseServer
    .from('team_members')
    .delete()
    .eq('id', id);

  return !error;
}
