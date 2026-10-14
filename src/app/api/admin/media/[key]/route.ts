import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { deleteImageBlob } from '@/lib/blobStorage';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin credentials required.' }, { status: 401 });
    }

    const { key } = await params;
    if (!key) {
      return NextResponse.json({ success: false, error: 'Key parameter is required.' }, { status: 400 });
    }

    const decodedKey = decodeURIComponent(key);
    const success = await deleteImageBlob(decodedKey);

    return NextResponse.json({
      success,
      message: success ? 'Media asset deleted successfully from Netlify Blobs' : 'Media asset not found'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete media' },
      { status: 500 }
    );
  }
}
