import { CertificateData } from '@/types/certificate';
import { generateCertificateHash } from './certificateCrypto';

// In-memory/local certificate store registry for offline resilience and development
const seedCertificates: CertificateData[] = [
  {
    certificate_id: 'CERT-JGEC-CHTR04-REG001',
    tournament_id: 'CHTR-04',
    tournament_title: 'Chaturanga Autumn Collegiate Open 2026',
    tournament_date: 'October 19, 2026',
    recipient_name: 'Pabitra Banerjee',
    recipient_department: 'Computer Science & Engineering',
    recipient_college: 'Jalpaiguri Government Engineering College',
    registration_id: 'REG-001',
    role: 'winner',
    rank: 1,
    total_participants: 64,
    arbiter_name: 'Prof. S. K. Roy (FIDE Arbiter)',
    convenor_name: 'President, Chaturanga JGEC',
    issued_at: '2026-10-19T12:00:00Z',
    verification_hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', // will be hydrated dynamically
    verification_url: '/verify-cert/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
  },
  {
    certificate_id: 'CERT-JGEC-CHTR04-REG002',
    tournament_id: 'CHTR-04',
    tournament_title: 'Chaturanga Autumn Collegiate Open 2026',
    tournament_date: 'October 19, 2026',
    recipient_name: 'Arindam Ghosh',
    recipient_department: 'Electrical Engineering',
    recipient_college: 'Jalpaiguri Government Engineering College',
    registration_id: 'REG-002',
    role: 'runner_up',
    rank: 2,
    total_participants: 64,
    arbiter_name: 'Prof. S. K. Roy (FIDE Arbiter)',
    convenor_name: 'President, Chaturanga JGEC',
    issued_at: '2026-10-19T12:00:00Z',
    verification_hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    verification_url: '/verify-cert/b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
  },
  {
    certificate_id: 'CERT-JGEC-CHTR04-REG003',
    tournament_id: 'CHTR-04',
    tournament_title: 'Chaturanga Autumn Collegiate Open 2026',
    tournament_date: 'October 19, 2026',
    recipient_name: 'Rohan Sen',
    recipient_department: 'Mechanical Engineering',
    recipient_college: 'Jalpaiguri Government Engineering College',
    registration_id: 'REG-003',
    role: 'participant',
    rank: 12,
    total_participants: 64,
    arbiter_name: 'Prof. S. K. Roy (FIDE Arbiter)',
    convenor_name: 'President, Chaturanga JGEC',
    issued_at: '2026-10-19T12:00:00Z',
    verification_hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    verification_url: '/verify-cert/c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
  },
];

const memoryStore = new Map<string, CertificateData>();
let isInitialized = false;

async function ensureInitialized() {
  if (isInitialized) return;

  for (const cert of seedCertificates) {
    const hash = await generateCertificateHash({
      certificate_id: cert.certificate_id,
      tournament_id: cert.tournament_id,
      recipient_name: cert.recipient_name,
      role: cert.role,
      issued_at: cert.issued_at,
    });
    const hydratedCert: CertificateData = {
      ...cert,
      verification_hash: hash,
      verification_url: `/verify-cert/${hash}`,
    };
    memoryStore.set(hash.toLowerCase(), hydratedCert);
  }
  isInitialized = true;
}

/**
 * Retrieves a certificate record by its unique SHA-256 verification hash.
 */
export async function getCertificateByHash(hash: string): Promise<CertificateData | null> {
  await ensureInitialized();
  if (!hash) return null;
  return memoryStore.get(hash.trim().toLowerCase()) || null;
}

/**
 * Retrieves a certificate record by its certificate serial ID (e.g. CERT-JGEC-...).
 */
export async function getCertificateById(certId: string): Promise<CertificateData | null> {
  await ensureInitialized();
  if (!certId) return null;
  for (const cert of memoryStore.values()) {
    if (cert.certificate_id.toLowerCase() === certId.trim().toLowerCase()) {
      return cert;
    }
  }
  return null;
}

/**
 * Retrieves all certificates issued for a particular tournament.
 */
export async function getCertificatesByTournament(tournamentId: string): Promise<CertificateData[]> {
  await ensureInitialized();
  return Array.from(memoryStore.values()).filter(
    (c) => c.tournament_id.toLowerCase() === tournamentId.trim().toLowerCase()
  );
}

/**
 * Saves a new certificate into the store.
 */
export async function saveCertificate(cert: CertificateData): Promise<CertificateData> {
  await ensureInitialized();
  const hash = cert.verification_hash || (await generateCertificateHash({
    certificate_id: cert.certificate_id,
    tournament_id: cert.tournament_id,
    recipient_name: cert.recipient_name,
    role: cert.role,
    issued_at: cert.issued_at,
  }));

  const saved: CertificateData = {
    ...cert,
    verification_hash: hash,
    verification_url: `/verify-cert/${hash}`,
  };

  memoryStore.set(hash.toLowerCase(), saved);
  return saved;
}

/**
 * Clears or resets the store (used in test setup)
 */
export function _resetCertificateStore() {
  memoryStore.clear();
  isInitialized = false;
}
