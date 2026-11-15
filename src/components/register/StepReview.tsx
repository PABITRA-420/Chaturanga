"use client";

import React from 'react';
import { ShieldCheck, Sparkles, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export interface StepReviewProps {
  currentEvent: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    entryFee?: string;
    customFields?: Array<{
      id: string;
      label: string;
      type: 'text' | 'select' | 'checkbox';
      required: boolean;
      options?: string[];
    }>;
  };
  formData: {
    fullName: string;
    rollNumber: string;
    department: string;
    year: string;
    institution: string;
    email: string;
    phone: string;
    ratingCategory: string;
    chessPlatform?: string;
    chessUsername?: string;
    fideId?: string;
    acceptTerms: boolean;
  };
  customAnswers: Record<string, any>;
  onCustomAnswerChange: (fieldId: string, val: any) => void;
  onAcceptTermsChange: (accepted: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  chessVerification: {
    checking: boolean;
    result: { exists: boolean; message?: string; unavailable?: boolean } | null;
  };
}

export default function StepReview({
  currentEvent,
  formData,
  customAnswers,
  onCustomAnswerChange,
  onAcceptTermsChange,
  onSubmit,
  isSubmitting,
  chessVerification,
}: StepReviewProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 font-ui">
      <div className="p-4 rounded-sm bg-surface-elevated border border-border space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
            Registration Summary
          </span>
          <span className="text-[11px] text-success font-mono font-semibold">
            Event: {currentEvent.title}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-mono text-fg-muted block uppercase">Player</span>
            <span className="font-bold text-fg">{formData.fullName || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-fg-muted block uppercase">Roll Number</span>
            <span className="font-mono text-accent font-semibold">{formData.rollNumber || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-fg-muted block uppercase">Department &amp; Year</span>
            <span className="text-fg">{formData.department} ({formData.year})</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-fg-muted block uppercase">Institution</span>
            <span className="text-fg truncate block">{formData.institution || '—'}</span>
          </div>
        </div>
      </div>

      {currentEvent.customFields && currentEvent.customFields.length > 0 && (
        <div className="space-y-4 pt-1">
          <div className="border-b border-border pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-fg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>Additional Tournament Questions</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentEvent.customFields.map((cf) => (
              <div key={cf.id} className="space-y-1.5">
                <label className="text-[11px] font-medium text-fg-muted flex items-center gap-1">
                  <span>{cf.label}</span>
                  {cf.required && <span className="text-danger font-bold">*</span>}
                </label>
                {cf.type === 'select' ? (
                  <select
                    required={cf.required}
                    value={customAnswers[cf.id] || ''}
                    onChange={(e) => onCustomAnswerChange(cf.id, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-sm bg-bg border border-border text-xs text-fg focus:border-border-strong transition-colors"
                  >
                    <option value="">Select an option...</option>
                    {cf.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : cf.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs text-fg">
                    <input
                      type="checkbox"
                      checked={Boolean(customAnswers[cf.id])}
                      onChange={(e) => onCustomAnswerChange(cf.id, e.target.checked)}
                      className="accent-[var(--accent)] rounded-xs w-4 h-4"
                    />
                    <span>Yes / Agreed</span>
                  </label>
                ) : (
                  <input
                    type="text"
                    required={cf.required}
                    placeholder="Your answer..."
                    value={customAnswers[cf.id] || ''}
                    onChange={(e) => onCustomAnswerChange(cf.id, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-bg border border-border text-xs text-fg focus:border-border-strong transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 rounded-sm bg-surface-elevated border border-border-strong/50 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => onAcceptTermsChange(e.target.checked)}
            className="mt-0.5 rounded-xs accent-[var(--accent)] cursor-pointer h-4 w-4 shrink-0"
          />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>FIDE Fair-Play &amp; Swiss System Agreement</span>
            </span>
            <p className="text-[11px] text-fg-muted leading-relaxed font-body">
              I certify that all details provided are authentic. I agree to comply with JGEC Chaturanga tournament bylaws, arbiter clocks, and FIDE fair-play standards.
            </p>
          </div>
        </label>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-fg-muted font-mono">
          {chessVerification.checking ? (
            <div className="flex items-center gap-1.5 text-accent">
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              <span>Verifying player ID...</span>
            </div>
          ) : chessVerification.result?.exists === true ? (
            <div className="flex items-center gap-1.5 text-success font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Player ID Verified &bull; Free Registration</span>
            </div>
          ) : chessVerification.result?.unavailable ? (
            <div className="flex items-center gap-1.5 text-warning font-medium">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Verification service unavailable &bull; Retry required</span>
            </div>
          ) : chessVerification.result?.exists === false ? (
            <div className="flex items-center gap-1.5 text-danger font-medium">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Check your ID carefully before submitting</span>
            </div>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
              <span>100% Free Entry &bull; Instant Confirmation</span>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || chessVerification.checking || (Boolean(formData.chessUsername) && chessVerification.result?.exists === false && !chessVerification.result?.unavailable)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xs font-bold uppercase tracking-wider text-xs text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed btn-tactile"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Recording Registration...</span>
            </>
          ) : (
            <>
              <span>Submit &amp; Generate Entry Pass</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
