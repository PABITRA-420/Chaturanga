import Link from 'next/link';
import { getCertificateByHash } from '@/lib/certificateStore';
import { verifyCertificateHash } from '@/lib/certificateCrypto';
import { ShieldCheck, AlertTriangle, Award, Calendar, Building, Hash, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ hash: string }>;
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { hash } = await params;
  const certificate = await getCertificateByHash(hash);

  let isValid = false;
  let isTampered = false;

  if (certificate) {
    const hashMatches = await verifyCertificateHash(
      {
        certificate_id: certificate.certificate_id,
        tournament_id: certificate.tournament_id,
        recipient_name: certificate.recipient_name,
        role: certificate.role,
        issued_at: certificate.issued_at,
      },
      hash
    );

    if (hashMatches) {
      isValid = true;
    } else {
      isTampered = true;
    }
  }

  const roleLabels: Record<string, string> = {
    winner: 'Tournament Champion (1st Place)',
    runner_up: 'Runner-up (2nd Place)',
    second_runner_up: '2nd Runner-up (3rd Place)',
    top_board: 'Top Board Performer',
    merit: 'Certificate of Merit',
    participant: 'Certificate of Participation',
  };

  return (
    <div className="min-h-screen bg-bg text-fg py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full">
        {/* Navigation Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-mono tracking-wider uppercase text-fg-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Chaturanga Arena
          </Link>
        </div>

        {/* Verification Card */}
        <div className="bg-surface border border-border-strong rounded-md p-6 sm:p-8 shadow-sm relative">
          {isValid && certificate ? (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center space-x-3.5 pb-6 border-b border-border">
                <div className="w-11 h-11 rounded-sm bg-success/10 border border-success/30 flex items-center justify-center text-success shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-xs text-[11px] font-mono uppercase tracking-wider font-semibold bg-success/10 text-success border border-success/30">
                      Authentic & Verified
                    </span>
                    <span className="text-xs font-mono text-fg-muted">Cryptographically Signed</span>
                  </div>
                  <h1 className="font-heading text-lg font-bold text-fg mt-1.5">Official JGEC Tournament Certificate</h1>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono font-medium uppercase tracking-widest text-fg-muted">Awarded To</span>
                  <p className="font-heading text-2xl font-bold text-accent tracking-tight mt-0.5">
                    {certificate.recipient_name}
                  </p>
                  {certificate.recipient_department && (
                    <p className="text-sm text-fg-muted flex items-center mt-1">
                      <Building className="w-4 h-4 mr-1.5 text-fg-subtle shrink-0" />
                      {certificate.recipient_department}
                      {certificate.recipient_college ? ` • ${certificate.recipient_college}` : ''}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-surface-elevated border border-border rounded-sm p-3.5">
                    <span className="text-xs text-fg-muted flex items-center mb-1">
                      <Award className="w-3.5 h-3.5 mr-1.5 text-accent" />
                      Achievement / Role
                    </span>
                    <p className="text-sm font-semibold text-fg">
                      {roleLabels[certificate.role] || certificate.role}
                      {certificate.rank && certificate.total_participants
                        ? ` (Rank ${certificate.rank} of ${certificate.total_participants})`
                        : ''}
                    </p>
                  </div>

                  <div className="bg-surface-elevated border border-border rounded-sm p-3.5">
                    <span className="text-xs text-fg-muted flex items-center mb-1">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-fg-subtle" />
                      Event Date
                    </span>
                    <p className="text-sm font-semibold text-fg">{certificate.tournament_date}</p>
                  </div>
                </div>

                <div className="bg-surface-elevated border border-border rounded-sm p-3.5">
                  <span className="text-xs text-fg-muted block mb-1">Tournament Championship</span>
                  <p className="text-sm font-medium text-fg">{certificate.tournament_title}</p>
                </div>

                {/* Audit & Cryptographic Signature Box */}
                <div className="pt-4 border-t border-border space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-fg-muted">
                    <span className="flex items-center">
                      <Hash className="w-3.5 h-3.5 mr-1 text-fg-subtle" />
                      Certificate Serial
                    </span>
                    <span className="font-mono text-fg tabular-nums">{certificate.certificate_id}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-fg-muted">SHA-256 Verification Hash</span>
                    <span className="font-mono text-[11px] text-success break-all bg-surface-subtle p-2.5 rounded-sm border border-border select-all">
                      {hash}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-fg-muted pt-1">
                    <span>Chief Arbiter</span>
                    <span className="text-fg font-medium">{certificate.arbiter_name}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Invalid / Tampered State */
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 rounded-sm bg-warning/10 border border-warning/30 flex items-center justify-center text-warning mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h1 className="font-heading text-xl font-bold text-fg">
                  {isTampered ? 'Certificate Tampering Detected' : 'Certificate Not Found'}
                </h1>
                <p className="text-sm text-fg-muted mt-2 max-w-md mx-auto">
                  {isTampered
                    ? 'The cryptographic payload associated with this certificate hash has been modified or corrupted. This certificate is invalid.'
                    : 'The requested certificate verification hash was not found in the official Chaturanga JGEC registry.'}
                </p>
              </div>

              <div className="bg-surface-elevated border border-warning/30 rounded-sm p-4 text-xs font-mono text-warning break-all max-w-lg mx-auto">
                Hash: {hash}
              </div>

              <div className="pt-2 text-xs text-fg-muted">
                If you believe this is an error, please contact the Chaturanga Chess Club Executive Committee at{' '}
                <span className="text-fg font-medium">chaturanga@jgec.ac.in</span>.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="text-center text-xs font-mono text-fg-subtle mt-8">
        Chaturanga JGEC • Official Chess Platform of Jalpaiguri Government Engineering College
      </footer>
    </div>
  );
}
