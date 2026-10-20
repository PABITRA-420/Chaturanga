import { NextRequest, NextResponse } from 'next/server';
import { getCertificateByHash } from '@/lib/certificateStore';
import { verifyCertificateHash } from '@/lib/certificateCrypto';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await context.params;

    if (!hash || hash.trim().length !== 64) {
      return NextResponse.json(
        { valid: false, error: 'Invalid certificate hash format (must be 64-char SHA-256)' },
        { status: 400 }
      );
    }

    const certificate = await getCertificateByHash(hash);

    if (!certificate) {
      return NextResponse.json(
        { valid: false, error: 'Certificate record not found in registry' },
        { status: 404 }
      );
    }

    // Cryptographically verify payload integrity
    const isTamperFree = await verifyCertificateHash(
      {
        certificate_id: certificate.certificate_id,
        tournament_id: certificate.tournament_id,
        recipient_name: certificate.recipient_name,
        role: certificate.role,
        issued_at: certificate.issued_at,
      },
      hash
    );

    if (!isTamperFree) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Cryptographic hash mismatch. Certificate payload has been altered or tampered with.',
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      valid: true,
      certificate,
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error verifying certificate' },
      { status: 500 }
    );
  }
}
