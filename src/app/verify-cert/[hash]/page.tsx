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
    <div className="min-h-screen bg-[#070A0E] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full">
        {/* Navigation Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs tracking-wider uppercase text-slate-400 hover:text-[#D4AF7C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Chaturanga Arena
          </Link>
        </div>

        {/* Verification Card */}
        <div className="bg-[#0F141C] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF7C]/5 rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-tr-full pointer-events-none" />

          {isValid && certificate ? (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center space-x-3 pb-6 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Authentic & Verified
                    </span>
                    <span className="text-xs text-slate-400">Cryptographically Signed</span>
                  </div>
                  <h1 className="text-lg font-bold text-white mt-1">Official JGEC Tournament Certificate</h1>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Awarded To</span>
                  <p className="text-2xl font-black text-[#D4AF7C] tracking-wide mt-0.5">
                    {certificate.recipient_name}
                  </p>
                  {certificate.recipient_department && (
                    <p className="text-sm text-slate-300 flex items-center mt-1">
                      <Building className="w-4 h-4 mr-1.5 text-slate-400 shrink-0" />
                      {certificate.recipient_department}
                      {certificate.recipient_college ? ` • ${certificate.recipient_college}` : ''}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#141A24] border border-white/5 rounded-xl p-3.5">
                    <span className="text-xs text-slate-400 flex items-center mb-1">
                      <Award className="w-3.5 h-3.5 mr-1 text-[#D4AF7C]" />
                      Achievement / Role
                    </span>
                    <p className="text-sm font-semibold text-white">
                      {roleLabels[certificate.role] || certificate.role}
                      {certificate.rank && certificate.total_participants
                        ? ` (Rank ${certificate.rank} of ${certificate.total_participants})`
                        : ''}
                    </p>
                  </div>

                  <div className="bg-[#141A24] border border-white/5 rounded-xl p-3.5">
                    <span className="text-xs text-slate-400 flex items-center mb-1">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Event Date
                    </span>
                    <p className="text-sm font-semibold text-white">{certificate.tournament_date}</p>
                  </div>
                </div>

                <div className="bg-[#141A24] border border-white/5 rounded-xl p-3.5">
                  <span className="text-xs text-slate-400 block mb-1">Tournament Championship</span>
                  <p className="text-sm font-medium text-slate-200">{certificate.tournament_title}</p>
                </div>

                {/* Audit & Cryptographic Signature Box */}
                <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center">
                      <Hash className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Certificate Serial
                    </span>
                    <span className="font-mono text-slate-200">{certificate.certificate_id}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-slate-400">SHA-256 Verification Hash</span>
                    <span className="font-mono text-[11px] text-emerald-400/90 break-all bg-black/40 p-2 rounded-lg border border-white/5 select-all">
                      {hash}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400 pt-1">
                    <span>Chief Arbiter</span>
                    <span className="text-slate-200">{certificate.arbiter_name}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Invalid / Tampered State */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">
                  {isTampered ? 'Certificate Tampering Detected' : 'Certificate Not Found'}
                </h1>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                  {isTampered
                    ? 'The cryptographic payload associated with this certificate hash has been modified or corrupted. This certificate is invalid.'
                    : 'The requested certificate verification hash was not found in the official Chaturanga JGEC registry.'}
                </p>
              </div>

              <div className="bg-[#141A24] border border-amber-500/20 rounded-xl p-4 text-xs font-mono text-amber-300 break-all max-w-lg mx-auto">
                Hash: {hash}
              </div>

              <div className="pt-2 text-xs text-slate-500">
                If you believe this is an error, please contact the Chaturanga Chess Club Executive Committee at{' '}
                <span className="text-slate-300">chaturanga@jgec.ac.in</span>.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="text-center text-xs text-slate-500 mt-8">
        Chaturanga JGEC • Official Chess Platform of Jalpaiguri Government Engineering College
      </footer>
    </div>
  );
}
