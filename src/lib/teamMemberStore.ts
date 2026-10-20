import { supabaseServer } from '@/lib/supabase/server';
import { TeamMember } from '@/data/teamData';

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
