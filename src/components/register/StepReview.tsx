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
  chessVerification
}: StepReviewProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 font-['Inter',sans-serif]">
      {/* Summary Box */}
      <div className="p-4 rounded-2xl bg-[#0B0F14] border border-white/10 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF7C]">
            Registration Summary
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            Event: {currentEvent.title}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-[#A0A6B0] block">Player</span>
            <span className="font-bold text-[#F5F5F5]">{formData.fullName || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#A0A6B0] block">Roll Number</span>
            <span className="font-mono text-[#D4AF7C]">{formData.rollNumber || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#A0A6B0] block">Department &amp; Year</span>
            <span className="text-[#F5F5F5]">{formData.department} ({formData.year})</span>
          </div>
          <div>
            <span className="text-[10px] text-[#A0A6B0] block">Institution</span>
            <span className="text-[#F5F5F5] truncate block">{formData.institution || '—'}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Custom Questions */}
      {currentEvent.customFields && currentEvent.customFields.length > 0 && (
        <div className="space-y-4 pt-1">
          <div className="border-b border-white/10 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF7C]" />
              <span>Additional Tournament Questions</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentEvent.customFields.map((cf) => (
              <div key={cf.id} className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#A0A6B0] flex items-center gap-1">
                  <span>{cf.label}</span>
                  {cf.required && <span className="text-red-400 font-bold">*</span>}
                </label>
                {cf.type === 'select' ? (
                  <select
                    required={cf.required}
                    value={customAnswers[cf.id] || ''}
                    onChange={(e) => onCustomAnswerChange(cf.id, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C] transition"
                  >
                    <option value="">Select an option...</option>
                    {cf.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : cf.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs text-[#F5F5F5]">
                    <input
                      type="checkbox"
                      checked={Boolean(customAnswers[cf.id])}
                      onChange={(e) => onCustomAnswerChange(cf.id, e.target.checked)}
                      className="accent-[#D4AF7C] rounded w-4 h-4"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C] transition"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fair Play Pledge */}
      <div className="p-4 rounded-2xl bg-black/40 border border-[#D4AF7C]/20 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => onAcceptTermsChange(e.target.checked)}
            className="mt-0.5 rounded bg-[#0B0F14] border-white/20 text-[#D4AF7C] focus:ring-0 cursor-pointer h-4 w-4"
          />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#F5F5F5] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF7C]" />
              <span>FIDE Fair-Play &amp; Swiss System Agreement</span>
            </span>
            <p className="text-[11px] text-[#A0A6B0] leading-relaxed">
              I certify that all details provided are authentic. I agree to comply with JGEC Chaturanga tournament bylaws, arbiter clocks, and FIDE fair-play standards.
            </p>
          </div>
        </label>
      </div>

      {/* Submit CTA Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#A0A6B0]">
          {chessVerification.checking ? (
            <div className="flex items-center gap-1.5 text-[#D4AF7C]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying player ID...</span>
            </div>
          ) : chessVerification.result?.exists === true ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Player ID Verified &bull; Free Registration</span>
            </div>
          ) : chessVerification.result?.unavailable ? (
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Verification service unavailable &bull; Retry required</span>
            </div>
          ) : chessVerification.result?.exists === false ? (
            <div className="flex items-center gap-1.5 text-red-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Check your ID carefully before submitting</span>
            </div>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>100% Free Entry &bull; Instant Confirmation</span>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || chessVerification.checking || (Boolean(formData.chessUsername) && chessVerification.result?.exists === false && !chessVerification.result?.unavailable)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-xs text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 transition-all duration-200 shadow-xl shadow-[#D4AF7C]/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Recording Registration...</span>
            </>
          ) : (
            <>
              <span>Submit &amp; Generate Entry Pass</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
