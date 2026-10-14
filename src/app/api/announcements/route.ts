import { NextResponse } from 'next/server';
import { 
  getAllAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from '@/lib/announcementsStore';
import { isAdminAuthenticated } from '@/lib/adminAuth';

export async function GET() {
  try {
    const announcements = await getAllAnnouncements();
    return NextResponse.json({
      success: true,
      announcements,
      total: announcements.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch announcements.' },
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
    if (!body.title || !body.summary) {
      return NextResponse.json({ success: false, error: 'Title and summary are required.' }, { status: 400 });
    }

    const created = await createAnnouncement(body);
    return NextResponse.json({
      success: true,
      message: 'Announcement created successfully.',
      announcement: created
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create announcement.' },
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
      return NextResponse.json({ success: false, error: 'Announcement ID required.' }, { status: 400 });
    }

    const updated = await updateAnnouncement(id, updates);
    return NextResponse.json({
      success: true,
      message: 'Announcement updated successfully.',
      announcement: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update announcement.' },
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
      return NextResponse.json({ success: false, error: 'ID required.' }, { status: 400 });
    }

    const deleted = await deleteAnnouncement(id);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Announcement deleted.' : 'Failed to delete.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete announcement.' },
      { status: 500 }
    );
  }
}
