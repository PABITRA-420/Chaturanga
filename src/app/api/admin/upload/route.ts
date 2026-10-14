import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { uploadImageBlob, listImageBlobs } from '@/lib/blobStorage';

// Maximum upload limit: 8MB
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif'
]);

export async function GET() {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin credentials required.' }, { status: 401 });
    }

    const blobs = await listImageBlobs();
    return NextResponse.json({
      success: true,
      blobs,
      count: blobs.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list media' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin credentials required.' }, { status: 401 });
    }

    const contentTypeHeader = request.headers.get('content-type') || '';

    let buffer: Buffer;
    let fileName: string = 'upload.jpg';
    let mimeType: string = 'image/jpeg';

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No image file provided in form data.' }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, error: 'File size exceeds maximum 8MB limit.' }, { status: 400 });
      }

      fileName = file.name || 'image.jpg';
      mimeType = file.type || 'image/jpeg';

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json({ 
          success: false, 
          error: `Unsupported file type "${mimeType}". Allowed formats: JPEG, PNG, WebP, GIF, SVG, AVIF.` 
        }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // JSON base64 upload support
      const body = await request.json();
      const { base64, name, type } = body;

      if (!base64) {
        return NextResponse.json({ success: false, error: 'Missing base64 image data.' }, { status: 400 });
      }

      fileName = name || 'upload.jpg';
      mimeType = type || 'image/jpeg';

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json({ success: false, error: 'Unsupported file type.' }, { status: 400 });
      }

      const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      buffer = Buffer.from(cleanBase64, 'base64');

      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json({ success: false, error: 'Image size exceeds maximum 8MB limit.' }, { status: 400 });
      }
    }

    const result = await uploadImageBlob(buffer, fileName, mimeType);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully to Netlify Blobs storage.',
      blob: result,
      url: result.url
    }, { status: 201 });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed.' },
      { status: 500 }
    );
  }
}
