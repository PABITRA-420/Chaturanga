import { NextResponse } from 'next/server';
import { 
  getAllGalleryPhotos, 
  createGalleryPhoto, 
  updateGalleryPhoto, 
  deleteGalleryPhoto 
} from '@/lib/galleryStore';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const photos = await getAllGalleryPhotos(category);
    return NextResponse.json({
      success: true,
      photos,
      total: photos.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch gallery photos.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title || !body.imageSrc) {
      return NextResponse.json({ success: false, error: 'Title and imageSrc are required.' }, { status: 400 });
    }

    const created = await createGalleryPhoto(body);
    return NextResponse.json({
      success: true,
      message: 'Gallery photo created successfully.',
      photo: created
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create gallery photo.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Gallery photo ID required.' }, { status: 400 });
    }

    const updated = await updateGalleryPhoto(id, updates);
    return NextResponse.json({
      success: true,
      message: 'Gallery photo updated successfully.',
      photo: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update gallery photo.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Gallery photo ID required.' }, { status: 400 });
    }

    const deleted = await deleteGalleryPhoto(id);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Gallery photo deleted.' : 'Failed to delete gallery photo.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete gallery photo.' },
      { status: 500 }
    );
  }
}
