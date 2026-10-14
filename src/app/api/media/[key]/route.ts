import { NextResponse } from 'next/server';
import { getImageBlob } from '@/lib/blobStorage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    if (!key) {
      return new NextResponse('Media key is required', { status: 400 });
    }

    const decodedKey = decodeURIComponent(key);
    const media = await getImageBlob(decodedKey);

    if (!media || !media.data) {
      return new NextResponse('Media asset not found', { status: 404 });
    }

    // Return the binary blob with immutable caching headers
    return new NextResponse(media.data as any, {
      status: 200,
      headers: {
        'Content-Type': media.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Error serving media blob:', error);
    return new NextResponse('Failed to serve media', { status: 500 });
  }
}
