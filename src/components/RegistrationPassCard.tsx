'use client';

import React, { useState } from 'react';
import { Award, Download, ShieldCheck, User, Calendar, MapPin } from 'lucide-react';
import CertificateModal from './certificates/CertificateModal';
import { CertificateData } from '@/types/certificate';

interface RegistrationPassCardProps {
  registration: {
    id: string;
    fullName: string;
    rollNumber: string;
    department: string;
    ratingCategory?: string;
    status?: string;
  };
  tournament: {
    id: string;
    title: string;
    date: string;
    venue?: string;
    status?: 'upcoming' | 'ongoing' | 'completed';
  };
  certificate?: CertificateData | null;
}

export default function RegistrationPassCard({
  registration,
  tournament,
  certificate,
}: RegistrationPassCardProps) {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Fallback synthetic certificate data if tournament is completed and no dedicated cert record was passed
  const activeCert: CertificateData = certificate || {
    certificate_id: `CERT-JGEC-${tournament.id.toUpperCase()}-${registration.id.toUpperCase()}`,
    tournament_id: tournament.id,
    tournament_title: tournament.title,
    tournament_date: tournament.date,
    recipient_name: registration.fullName,
    recipient_department: registration.department,
    recipient_college: 'Jalpaiguri Government Engineering College',
    registration_id: registration.id,
    role: 'participant',
    arbiter_name: 'Chief Arbiter, Chaturanga JGEC',
    convenor_name: 'President, Chaturanga JGEC',
    issued_at: new Date().toISOString(),
    verification_hash: 'samplehash00000000000000000000000000000000000000000000000000000000',
    verification_url: `/verify-cert/samplehash00000000000000000000000000000000000000000000000000000000`,
  };

  const isCompleted = tournament.status === 'completed' || !!certificate;

  return (
    <>
      <div className="bg-[#0F141C] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#D4AF7C] uppercase font-semibold">
              OFFICIAL PARTICIPANT PASS
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">{tournament.title}</h3>
          </div>
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verified Pass
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
          <div>
            <span className="text-slate-400">Player</span>
            <p className="text-sm font-bold text-white mt-0.5">{registration.fullName}</p>
            <p className="text-slate-400 font-mono">{registration.rollNumber} • {registration.department}</p>
          </div>
          <div>
            <span className="text-slate-400">Event Details</span>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">{tournament.date}</p>
            <p className="text-slate-400">{tournament.venue || 'JGEC Auditorium'}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-mono">ID: {registration.id}</span>

          {isCompleted && (
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#070A0E] bg-gradient-to-r from-[#D4AF7C] to-[#E5C396] hover:brightness-110 shadow-md shadow-[#D4AF7C]/10 transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 mr-1.5" />
              View Award Certificate
            </button>
          )}
        </div>
      </div>

      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={activeCert}
      />
    </>
  );
}
