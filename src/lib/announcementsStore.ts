import { supabaseServer } from '@/lib/supabase/server';
import { CLUB_ANNOUNCEMENTS, ClubAnnouncement } from '@/data/announcementsData';

export * from '@/data/announcementsData';

function dbToAnnouncement(row: any): ClubAnnouncement {
  return {
    id: row.id,
    title: row.title || '',
    category: row.category || 'GENERAL',
    date: row.date || '',
    badgeColor: row.badge_color || 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    summary: row.summary || '',
    content: row.content || '',
    isUrgent: Boolean(row.is_urgent),
    linkText: row.link_text || 'Learn More',
    linkUrl: row.link_url || '/upcoming',
  };
}

function announcementToDb(a: Partial<ClubAnnouncement>): any {
  const dbRecord: any = {};
  if (a.id) dbRecord.id = a.id;
  if (a.title !== undefined) dbRecord.title = a.title;
  if (a.category !== undefined) dbRecord.category = a.category;
  if (a.date !== undefined) dbRecord.date = a.date;
  if (a.badgeColor !== undefined) dbRecord.badge_color = a.badgeColor;
  if (a.summary !== undefined) dbRecord.summary = a.summary;
  if (a.content !== undefined) dbRecord.content = a.content;
  if (a.isUrgent !== undefined) dbRecord.is_urgent = a.isUrgent;
  if (a.linkText !== undefined) dbRecord.link_text = a.linkText;
  if (a.linkUrl !== undefined) dbRecord.link_url = a.linkUrl;
  dbRecord.updated_at = new Date().toISOString();
  return dbRecord;
}

export async function getAllAnnouncements(): Promise<ClubAnnouncement[]> {
  try {
    const { data, error } = await supabaseServer
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data !== null) {
      return data.map(dbToAnnouncement);
    }
    if (error) {
      console.warn('Supabase fetch announcements error:', error.message);
    }
  } catch (err) {
    console.warn('Supabase fetch announcements failed:', err);
  }

  return [];
}

export async function createAnnouncement(data: Partial<ClubAnnouncement>): Promise<ClubAnnouncement> {
  const id = data.id || `ann-${Date.now()}`;
  const record: ClubAnnouncement = {
    id,
    title: data.title || 'Club Announcement',
    category: data.category || 'GENERAL',
    date: data.date || new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
    badgeColor: data.badgeColor || 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    summary: data.summary || '',
    content: data.content || '',
    isUrgent: Boolean(data.isUrgent),
    linkText: data.linkText || 'Learn More',
    linkUrl: data.linkUrl || '/upcoming',
  };

  const dbRecord = announcementToDb(record);
  const { data: inserted, error } = await supabaseServer
    .from('announcements')
    .insert([dbRecord])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create announcement: ${error.message}`);
  }

  return dbToAnnouncement(inserted);
}

export async function updateAnnouncement(id: string, updates: Partial<ClubAnnouncement>): Promise<ClubAnnouncement | null> {
  const dbRecord = announcementToDb(updates);
  delete dbRecord.id;

  const { data, error } = await supabaseServer
    .from('announcements')
    .update(dbRecord)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update announcement: ${error.message}`);
  }

  return dbToAnnouncement(data);
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const { error } = await supabaseServer
    .from('announcements')
    .delete()
    .eq('id', id);

  return !error;
}
