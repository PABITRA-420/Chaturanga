import QRCode from 'qrcode';
import { CertificateVerificationPayload } from '@/types/certificate';

/**
 * Builds the canonical string representation for cryptographic hashing.
 * Deterministic ordering guarantees identical hash for identical input data.
 */
export function buildCertificateCanonicalString(payload: CertificateVerificationPayload): string {
  return [
    payload.certificate_id.trim().toUpperCase(),
    payload.tournament_id.trim(),
    payload.recipient_name.trim().toLowerCase(),
    payload.role.trim().toLowerCase(),
    payload.issued_at.trim(),
  ].join('::');
}

/**
 * Generates SHA-256 hex string from text using standard Web Crypto API.
 * Gracefully supports both browser runtime and Node.js server/test environments.
 */
export async function sha256Hex(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js fallback if crypto.subtle is not available in legacy mock contexts
  try {
    const nodeCrypto = await import('crypto');
    return nodeCrypto.createHash('sha256').update(content).digest('hex');
  } catch {
    throw new Error('Web Crypto API is not supported in this runtime environment');
  }
}

/**
 * Generates a tamper-evident SHA-256 hash for a certificate payload.
 */
export async function generateCertificateHash(payload: CertificateVerificationPayload): Promise<string> {
  const canonical = buildCertificateCanonicalString(payload);
  return sha256Hex(canonical);
}

/**
 * Verifies if the supplied certificate payload matches the claimed SHA-256 hash.
 */
export async function verifyCertificateHash(
  payload: CertificateVerificationPayload,
  claimedHash: string
): Promise<boolean> {
  if (!claimedHash || claimedHash.length !== 64) {
    return false;
  }
  const expectedHash = await generateCertificateHash(payload);
  return expectedHash.toLowerCase() === claimedHash.toLowerCase();
}

/**
 * Generates high-contrast QR Code as a data URL for embedding in canvas and PDF.
 */
export async function generateQrCodeDataUrl(
  verificationUrl: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 256,
    color: {
      dark: '#0A0E17',
      light: '#FFFFFF',
    },
    ...options,
  };

  return QRCode.toDataURL(verificationUrl, defaultOptions);
}
