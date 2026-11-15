"use client";

import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import StepEventSelect from '@/components/register/StepEventSelect';
import StepPersonalDetails from '@/components/register/StepPersonalDetails';
import StepChessProfile from '@/components/register/StepChessProfile';
import StepReview from '@/components/register/StepReview';
import { FormAlert } from '@/components/ui/FormFeedback';

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
  duplicateTicket,
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
    <div className="space-y-8">
      {/* Swiss Stepper Strip */}
      <div className="max-w-xl mx-auto flex items-center justify-between px-4 text-xs font-ui">
        {[
          { step: 1, label: 'Event' },
          { step: 2, label: 'Identity' },
          { step: 3, label: 'Chess' },
          { step: 4, label: 'Review' },
        ].map((s, idx) => {
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          return (
            <React.Fragment key={s.step}>
              {idx > 0 && (
                <div
                  className={`h-px flex-1 mx-2 transition-colors duration-200 ${
                    currentStep >= s.step ? 'bg-accent' : 'bg-border'
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => onStepChange(s.step)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isCurrent
                    ? 'text-accent font-bold'
                    : isDone
                    ? 'text-fg'
                    : 'text-fg-muted'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-xs font-mono font-bold flex items-center justify-center text-[11px] transition-colors border ${
                    isCurrent
                      ? 'bg-accent text-on-accent border-accent'
                      : isDone
                      ? 'bg-success/15 text-success border-success/40'
                      : 'bg-surface-elevated text-fg-muted border-border'
                  }`}
                >
                  {isDone ? '✓' : s.step}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Two-Column Swiss Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-md bg-surface border border-border space-y-7 relative">
            
            {duplicateTicket && (
              <div className="p-5 rounded-sm bg-accent/10 border border-accent text-xs space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 font-bold text-accent text-sm">
                  <Award className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span>Existing Registration Found</span>
                </div>
                <p className="text-fg">
                  You already have a confirmed entry for this tournament with Ticket ID: <strong className="font-mono text-accent">{duplicateTicket}</strong>.
                </p>
                <div className="pt-1">
                  <Link
                    href={`/my-ticket?ticketId=${duplicateTicket}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs bg-accent text-on-accent font-mono font-bold text-xs hover:bg-accent-hover transition-colors"
                  >
                    <span>View &amp; Download Your Pass →</span>
                  </Link>
                </div>
              </div>
            )}

            {errorMsg && (
              <FormAlert
                type="error"
                title="Registration Alert"
                message={errorMsg}
              />
            )}

            {!isRegistrationOpen ? (
              <div className="p-8 sm:p-10 rounded-sm bg-danger/10 border border-danger/40 text-center space-y-4">
                <div className="w-12 h-12 rounded-sm bg-surface text-danger flex items-center justify-center mx-auto border border-danger/40">
                  <Clock className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-danger font-mono">
                    ARBITER STATUS: REGISTRATION CLOSED
                  </span>
                  <h3 className="font-heading text-xl font-bold text-fg">
                    Registration Window Closed
                  </h3>
                  <p className="text-xs text-fg-muted max-w-md mx-auto leading-relaxed pt-1 font-body">
                    Registrations for <span className="text-fg font-semibold">{currentEvent?.title}</span> have been closed by the Chief Arbiter.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {currentStep === 1 && (
                  <StepEventSelect
                    events={events}
                    selectedEventId={selectedEventId}
                    onSelectEvent={onSelectEvent}
                    onNext={handleNextStep}
                  />
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <StepPersonalDetails
                      formData={formData}
                      onFieldChange={onFieldChange}
                      isFieldEnabled={isFieldEnabled}
                      isFieldRequired={isFieldRequired}
                    />
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs text-xs font-mono font-semibold text-fg-muted hover:text-fg bg-surface-elevated border border-border transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
                      >
                        <span>Continue to Chess Profile</span>
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}

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
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs text-xs font-mono font-semibold text-fg-muted hover:text-fg bg-surface-elevated border border-border transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
                      >
                        <span>Review &amp; Pledge</span>
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}

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
                    <div className="flex items-center justify-start pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs text-xs font-mono font-semibold text-fg-muted hover:text-fg bg-surface-elevated border border-border transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        <span>Back to Chess Profile</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Live Pass Preview & Rules */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent">
                Live Digital Pass Preview
              </span>
              <span className="text-[10px] text-fg-muted font-mono">Updates live</span>
            </div>

            <div className="relative rounded-md bg-surface border-2 border-border-strong p-6 overflow-hidden font-ui">
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent" aria-hidden="true" />

              <div className="flex items-center justify-between pb-4 border-b border-border pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xs bg-accent text-on-accent flex items-center justify-center font-serif font-bold text-base">
                    ♞
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-accent block">
                      CHATURANGA JGEC
                    </span>
                    <h4 className="font-heading font-bold text-xs text-fg leading-none mt-0.5">
                      {currentEvent?.title || 'TOURNAMENT PASS'}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-fg-muted block">PASS ID</span>
                  <span className="font-mono text-xs font-bold text-accent">PREVIEW</span>
                </div>
              </div>

              <div className="py-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-fg-muted block uppercase">Player</span>
                    <span className="font-bold text-fg text-sm truncate block">
                      {formData.fullName || 'Your Name'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-fg-muted block uppercase">Roll Number</span>
                    <span className="font-mono font-semibold text-accent text-xs block">
                      {formData.rollNumber || '2310XXXX'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[10px] font-mono text-fg-muted block uppercase">Department</span>
                    <span className="text-fg truncate block">
                      {formData.department ? formData.department.split(' ')[0] : 'Department'} &bull; {formData.year ? formData.year.split(' ')[0] : 'UG'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-fg-muted block uppercase">Skill Tier</span>
                    <span className="text-accent truncate block font-mono font-semibold">
                      {formData.ratingCategory ? formData.ratingCategory.split(' ')[0] : 'Club'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] p-3 rounded-sm bg-surface-elevated border border-border">
                  <div>
                    <span className="text-[10px] font-mono text-fg-muted block uppercase">Online Account</span>
                    <span className="text-fg font-mono text-xs truncate block font-bold">
                      {formData.chessUsername ? `@${formData.chessUsername}` : 'None'}
                    </span>
                    <span className="text-[10px] text-accent font-mono block">
                      {formData.chessPlatform === 'chesscom' ? 'Chess.com' : (formData.chessPlatform === 'lichess' ? 'Lichess.org' : 'Select platform')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-fg-muted block uppercase">Verification</span>
                    <div className="mt-0.5">
                      {chessVerification.result?.exists === true ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-success font-mono font-bold">
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                          <span>Verified</span>
                        </span>
                      ) : chessVerification.result?.exists === false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-danger font-mono font-bold">
                          <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                          <span>Invalid ID</span>
                        </span>
                      ) : chessVerification.checking ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent">
                          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                          <span>Checking</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-fg-muted">Pending</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-sm bg-surface-elevated border border-border flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-fg-muted">
                    <Clock className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                    <span>{currentEvent?.date || 'Event Day'}</span>
                  </div>
                  <div className="text-accent font-semibold">
                    {currentEvent?.time || '10:00 AM IST'}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-border flex items-center justify-between text-[10px] text-fg-muted font-mono">
                <div className="tracking-widest text-accent">
                  ||| | |||| | ||| |||| |
                </div>
                <div className="uppercase font-bold tracking-wider text-[9px]">
                  OFFICIAL ARBITER PASS
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Perks Card */}
          <div className="p-6 rounded-md bg-surface border border-border space-y-4 font-ui">
            <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-accent flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>Tournament Rules &amp; Perks</span>
            </h4>

            <div className="space-y-3 text-xs text-fg-muted font-body">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-xs bg-accent mt-1.5 shrink-0" />
                <span><strong className="text-fg">Swiss System Format:</strong> Guaranteed multiple rounds for every participant.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-xs bg-accent mt-1.5 shrink-0" />
                <span><strong className="text-fg">Official Clocks &amp; Boards:</strong> FIDE standard digital chess clocks provided by Chaturanga.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-xs bg-accent mt-1.5 shrink-0" />
                <span><strong className="text-fg">Prizes &amp; Merit Trophies:</strong> Cash awards, category shields, and certificates.</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-sm bg-success/10 border border-success/30 text-[11px] text-success flex items-center gap-2.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-success shrink-0" aria-hidden="true" />
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
