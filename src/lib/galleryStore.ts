import { supabaseServer } from '@/lib/supabase/server';
import { GalleryPhoto } from '@/data/galleryData';

export * from '@/data/galleryData';

function dbToGalleryPhoto(row: any): GalleryPhoto {
  return {
    id: row.id,
    title: row.title || '',
    category: row.category || 'Tournaments',
    date: row.date || '',
    tournamentName: row.tournament_name || '',
    description: row.description || '',
    imageSrc: row.image_src || '',
    aspect: row.aspect || 'landscape',
    tag: row.tag || '',
  };
}

function galleryPhotoToDb(g: Partial<GalleryPhoto>): any {
  const dbRecord: any = {};
  if (g.id !== undefined) dbRecord.id = g.id;
  if (g.title !== undefined) dbRecord.title = g.title;
  if (g.category !== undefined) dbRecord.category = g.category;
  if (g.date !== undefined) dbRecord.date = g.date;
  if (g.tournamentName !== undefined) dbRecord.tournament_name = g.tournamentName;
  if (g.description !== undefined) dbRecord.description = g.description;
  if (g.imageSrc !== undefined) dbRecord.image_src = g.imageSrc;
  if (g.aspect !== undefined) dbRecord.aspect = g.aspect;
  if (g.tag !== undefined) dbRecord.tag = g.tag;
  dbRecord.updated_at = new Date().toISOString();
  return dbRecord;
}

export async function getAllGalleryPhotos(category?: string): Promise<GalleryPhoto[]> {
  try {
    let query = supabaseServer
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (category && category !== 'All' && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (!error && data !== null) {
      return data.map(dbToGalleryPhoto);
    }
    if (error) {
      console.warn('Supabase fetch gallery error:', error.message);
    }
  } catch (err) {
    console.warn('Supabase fetch gallery failed:', err);
  }

  return [];
}

export async function getGalleryPhotoById(id: string): Promise<GalleryPhoto | null> {
  try {
    const { data, error } = await supabaseServer
      .from('gallery')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return dbToGalleryPhoto(data);
    }
  } catch (err) {
    console.warn(`Supabase fetch gallery photo ${id} failed:`, err);
  }
  return null;
}

export async function createGalleryPhoto(data: Partial<GalleryPhoto>): Promise<GalleryPhoto> {
  const id = data.id || `gal-${Date.now()}`;
  const record: GalleryPhoto = {
    id,
    title: data.title || 'Tournament Moment',
    category: data.category || 'Tournaments',
    date: data.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    tournamentName: data.tournamentName || 'Chaturanga Event',
    description: data.description || '',
    imageSrc: data.imageSrc || '',
    aspect: data.aspect || 'landscape',
    tag: data.tag || 'Tournament',
  };

  const dbRecord = galleryPhotoToDb(record);
  const { data: inserted, error } = await supabaseServer
    .from('gallery')
    .insert([dbRecord])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create gallery photo: ${error.message}`);
  }

  return dbToGalleryPhoto(inserted);
}

export async function updateGalleryPhoto(id: string, updates: Partial<GalleryPhoto>): Promise<GalleryPhoto | null> {
  const dbRecord = galleryPhotoToDb(updates);
  delete dbRecord.id;

  const { data, error } = await supabaseServer
    .from('gallery')
    .update(dbRecord)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update gallery photo: ${error.message}`);
  }

  return dbToGalleryPhoto(data);
}

export async function deleteGalleryPhoto(id: string): Promise<boolean> {
  const { error } = await supabaseServer
    .from('gallery')
    .delete()
    .eq('id', id);

  return !error;
}
