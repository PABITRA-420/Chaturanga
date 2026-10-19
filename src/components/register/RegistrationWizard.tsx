"use client";

import React from 'react';
import { 
  Trophy, 
  User, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Clock, 
  Info, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import Link from 'next/link';
import StepEventSelect from '@/components/register/StepEventSelect';
import StepPersonalDetails from '@/components/register/StepPersonalDetails';
import StepChessProfile from '@/components/register/StepChessProfile';
import StepReview from '@/components/register/StepReview';

export interface RegistrationWizardProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  events: any[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  formData: {
    fullName: string;
    rollNumber: string;
    institution: string;
    department: string;
    year: string;
    email: string;
    phone: string;
    chessPlatform: 'chesscom' | 'lichess' | '';
    chessUsername: string;
    fideId: string;
    ratingCategory: string;
    acceptTerms: boolean;
  };
  onFieldChange: (field: string, val: any) => void;
  customAnswers: Record<string, any>;
  onCustomAnswerChange: (fieldId: string, val: any) => void;
  onVerifyChess: (platform?: string, username?: string) => Promise<any>;
  chessVerification: any;
  isFieldEnabled: (fieldId: string) => boolean;
  isFieldRequired: (fieldId: string) => boolean;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  errorMsg: string;
  duplicateTicket: string | null;
}

export default function RegistrationWizard({
  currentStep,
  onStepChange,
  events,
  selectedEventId,
  onSelectEvent,
  formData,
  onFieldChange,
  customAnswers,
  onCustomAnswerChange,
  onVerifyChess,
  chessVerification,
  isFieldEnabled,
  isFieldRequired,
  onSubmit,
  isSubmitting,
  errorMsg,
  duplicateTicket
}: RegistrationWizardProps) {
  const currentEvent = events.find((e: any) => e.id === selectedEventId) || events[0] || null;
  const isRegistrationOpen = currentEvent ? (currentEvent.status === 'open' || !currentEvent.status) : false;

  const handleNextStep = () => {
    onStepChange(Math.min(4, currentStep + 1));
  };

  const handlePrevStep = () => {
    onStepChange(Math.max(1, currentStep - 1));
  };

  return (
    <div className="space-y-10">
      {/* Visual Step Indicator (4 steps) */}
      <div className="max-w-xl mx-auto flex items-center justify-between px-4 text-xs font-['Inter',sans-serif]">
        {[
          { step: 1, label: 'Event' },
          { step: 2, label: 'Identity' },
          { step: 3, label: 'Chess' },
          { step: 4, label: 'Review' }
        ].map((s, idx) => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          return (
            <React.Fragment key={s.step}>
              {idx > 0 && (
                <div 
                  className={`h-[1px] flex-1 mx-2 transition-colors duration-300 ${
                    currentStep >= s.step ? 'bg-[#D4AF7C]' : 'bg-white/10'
                  }`} 
                />
              )}
              <button
                type="button"
                onClick={() => onStepChange(s.step)}
                className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCurrent
                    ? 'text-[#D4AF7C] font-bold'
                    : isDone
                    ? 'text-white/80'
                    : 'text-[#A0A6B0]'
                }`}
              >
                <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] transition-colors ${
                  isCurrent
                    ? 'bg-[#D4AF7C] text-[#0B0F14]'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/10 text-[#A0A6B0]'
                }`}>
                  {isDone ? '✓' : s.step}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Two-Column Master Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12161D]/90 backdrop-blur-xl border border-white/10 shadow-2xl space-y-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF7C]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Duplicate Registration Detected Banner */}
            {duplicateTicket && (
              <div className="p-5 rounded-2xl bg-[#D4AF7C]/15 border-2 border-[#D4AF7C] text-xs space-y-2 shadow-lg animate-in fade-in duration-300">
                <div className="flex items-center gap-2 font-bold text-[#D4AF7C] text-sm">
                  <Award className="w-5 h-5 text-[#D4AF7C]" />
                  <span>Existing Registration Found</span>
                </div>
                <p className="text-[#F5F5F5]">
                  You already have a confirmed entry for this tournament with Ticket ID: <strong className="font-mono text-[#D4AF7C]">{duplicateTicket}</strong>.
                </p>
                <div className="pt-1">
                  <Link
                    href={`/my-ticket?ticketId=${duplicateTicket}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF7C] text-[#0B0F14] font-bold text-xs hover:brightness-110 transition shadow"
                  >
                    <span>View &amp; Download Your Pass &rarr;</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3 animate-shake">
                <Info className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Closed Registration Banner vs Active Step */}
            {!isRegistrationOpen ? (
              <div className="p-8 sm:p-10 rounded-3xl bg-red-500/10 border-2 border-red-500/30 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 font-mono">
                    ARBITER STATUS: REGISTRATION CLOSED
                  </span>
                  <h3 className="font-['Montserrat',sans-serif] text-xl font-bold text-red-200">
                    Registration Window Closed
                  </h3>
                  <p className="text-xs text-[#A0A6B0] max-w-md mx-auto leading-relaxed pt-1">
                    Registrations for <span className="text-[#F5F5F5] font-semibold">{currentEvent?.title}</span> have been closed by the Chief Arbiter.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1: EVENT SELECT */}
                {currentStep === 1 && (
                  <StepEventSelect
                    events={events}
                    selectedEventId={selectedEventId}
                    onSelectEvent={onSelectEvent}
                    onNext={handleNextStep}
                  />
                )}

                {/* STEP 2: PERSONAL CREDENTIALS */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <StepPersonalDetails
                      formData={formData}
                      onFieldChange={onFieldChange}
                      isFieldEnabled={isFieldEnabled}
                      isFieldRequired={isFieldRequired}
                    />
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-white bg-white/5 transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition shadow-md shadow-[#D4AF7C]/20 cursor-pointer"
                      >
                        <span>Continue to Chess Profile</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: CHESS PROFILE */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <StepChessProfile
                      formData={formData}
                      onFieldChange={onFieldChange}
                      isFieldEnabled={isFieldEnabled}
                      isFieldRequired={isFieldRequired}
                      onVerifyChess={onVerifyChess}
                      chessVerification={chessVerification}
                    />
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-white bg-white/5 transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition shadow-md shadow-[#D4AF7C]/20 cursor-pointer"
                      >
                        <span>Review &amp; Pledge</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW & CONFIRM */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <StepReview
                      currentEvent={currentEvent}
                      formData={formData}
                      customAnswers={customAnswers}
                      onCustomAnswerChange={onCustomAnswerChange}
                      onAcceptTermsChange={(val) => onFieldChange('acceptTerms', val)}
                      onSubmit={onSubmit}
                      isSubmitting={isSubmitting}
                      chessVerification={chessVerification}
                    />
                    <div className="flex items-center justify-start pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-white bg-white/5 transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Chess Profile</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Live Pass Preview & Tournament Perks */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF7C] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF7C]" />
                <span>Live Digital Pass Preview</span>
              </span>
              <span className="text-[10px] text-[#A0A6B0] font-mono">Updates as you type</span>
            </div>

            {/* Simulated Live Player Card */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#181D26] to-[#0E1217] border-2 border-[#D4AF7C]/40 p-6 shadow-2xl overflow-hidden font-['Inter',sans-serif]">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF7C]/15 rounded-full blur-2xl pointer-events-none" />

              {/* Pass Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF7C] text-[#0B0F14] flex items-center justify-center font-black text-sm">
                    ♞
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF7C] block">
                      CHATURANGA JGEC
                    </span>
                    <h4 className="font-['Montserrat',sans-serif] font-bold text-xs text-[#F5F5F5] leading-none mt-0.5">
                      {currentEvent?.title || 'TOURNAMENT PASS'}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-[#A0A6B0] block">PASS ID</span>
                  <span className="font-mono text-xs font-bold text-[#D4AF7C]">PREVIEW</span>
                </div>
              </div>

              {/* Live Mirrored Details */}
              <div className="py-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Player</span>
                    <span className="font-bold text-[#F5F5F5] text-sm truncate block">
                      {formData.fullName || 'Your Name'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Roll Number</span>
                    <span className="font-mono font-semibold text-[#D4AF7C] text-xs block">
                      {formData.rollNumber || '2310XXXX'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Department</span>
                    <span className="text-[#F5F5F5] truncate block">
                      {formData.department ? formData.department.split(' ')[0] : 'Department'} &bull; {formData.year ? formData.year.split(' ')[0] : 'UG'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Skill Tier</span>
                    <span className="text-[#D4AF7C] truncate block font-medium">
                      {formData.ratingCategory ? formData.ratingCategory.split(' ')[0] : 'Club'}
                    </span>
                  </div>
                </div>

                {/* Verified Chess Profile Badge in Preview */}
                <div className="grid grid-cols-2 gap-3 text-[11px] p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Online Account</span>
                    <span className="text-[#F5F5F5] font-mono text-xs truncate block font-bold">
                      {formData.chessUsername ? `@${formData.chessUsername}` : 'None'}
                    </span>
                    <span className="text-[9px] text-[#D4AF7C] font-semibold block">
                      {formData.chessPlatform === 'chesscom' ? 'Chess.com' : (formData.chessPlatform === 'lichess' ? 'Lichess.org' : 'Select platform')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Verification</span>
                    <div className="mt-0.5">
                      {chessVerification.result?.exists === true ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : chessVerification.result?.exists === false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Invalid ID</span>
                        </span>
                      ) : chessVerification.checking ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#D4AF7C]">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Checking</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#A0A6B0]">Pending</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-[#A0A6B0]">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF7C]" />
                    <span>{currentEvent?.date || 'Event Day'}</span>
                  </div>
                  <div className="text-[#D4AF7C] font-semibold">
                    {currentEvent?.time || '10:00 AM IST'}
                  </div>
                </div>
              </div>

              {/* Barcode Simulator & Watermark */}
              <div className="pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-[10px] text-[#A0A6B0]">
                <div className="flex items-center gap-1 font-mono tracking-widest text-[#D4AF7C]">
                  ||| | |||| | ||| |||| |
                </div>
                <div className="uppercase font-bold tracking-wider text-[9px] text-[#A0A6B0]">
                  OFFICIAL ARBITER PASS
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Perks Card */}
          <div className="p-6 rounded-3xl bg-[#12161D] border border-white/10 space-y-4 font-['Inter',sans-serif]">
            <h4 className="font-['Montserrat',sans-serif] font-bold text-xs uppercase tracking-widest text-[#D4AF7C] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D4AF7C]" />
              <span>Tournament Rules &amp; Perks</span>
            </h4>

            <div className="space-y-3 text-xs text-[#A0A6B0]">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF7C] mt-1.5 shrink-0" />
                <span><strong>Swiss System Format:</strong> Guaranteed multiple rounds for every participant.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF7C] mt-1.5 shrink-0" />
                <span><strong>Official Clocks &amp; Boards:</strong> FIDE standard digital chess clocks provided by Chaturanga.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF7C] mt-1.5 shrink-0" />
                <span><strong>Prizes &amp; Merit Trophies:</strong> Cash awards, category shields, and certificates.</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                <strong>100% Free Entry &amp; Digital Passport:</strong> Instant badge generated upon submission.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
