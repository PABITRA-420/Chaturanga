"use client";

import React from 'react';
import { Trophy, ShieldCheck, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

export interface StepChessProfileProps {
  formData: {
    ratingCategory: string;
    fideId: string;
    chessPlatform: 'chesscom' | 'lichess' | '';
    chessUsername: string;
  };
  onFieldChange: (field: string, val: any) => void;
  isFieldEnabled: (fieldId: string) => boolean;
  isFieldRequired: (fieldId: string) => boolean;
  onVerifyChess: (platform?: string, username?: string) => Promise<any>;
  chessVerification: {
    checking: boolean;
    hasChecked: boolean;
    lastCheckedHandle: string;
    lastCheckedPlatform: string;
    result: {
      exists: boolean;
      platform?: string;
      username?: string;
      name?: string | null;
      avatar?: string | null;
      title?: string | null;
      ratings?: { rapid?: number | null; blitz?: number | null; bullet?: number | null; classical?: number | null };
      message?: string;
      unavailable?: boolean;
    } | null;
  };
}

export default function StepChessProfile({
  formData,
  onFieldChange,
  isFieldEnabled,
  isFieldRequired,
  onVerifyChess,
  chessVerification
}: StepChessProfileProps) {
  return (
    <div className="space-y-5">
      <div className="border-b border-white/10 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#D4AF7C]" />
          <span>Chess Skill &amp; Online Account Verification</span>
        </h3>
        <p className="text-[11px] text-[#A0A6B0] mt-1">
          Select your platform (Chess.com or Lichess) and provide your authentic player ID for pairing &amp; rating checks.
        </p>
      </div>

      {/* Skill Tier & Optional FIDE ID Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isFieldEnabled('ratingCategory') && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#A0A6B0]">
              Rating / Skill Category {isFieldRequired('ratingCategory') && '*'}
            </label>
            <select
              value={formData.ratingCategory}
              onChange={(e) => onFieldChange('ratingCategory', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C] transition cursor-pointer"
            >
              <option value="Beginner (< 1200)">Beginner (&lt; 1200)</option>
              <option value="Club Player (1200 - 1600)">Club Player (1200 - 1600)</option>
              <option value="Advanced (1600 - 2000)">Advanced (1600 - 2000)</option>
              <option value="FIDE Rated / Master (2000+)">FIDE Rated (2000+)</option>
            </select>
          </div>
        )}

        {isFieldEnabled('fideId') && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[#A0A6B0]">
              FIDE ID {isFieldRequired('fideId') ? '*' : '(Optional)'}
            </label>
            <input
              type="text"
              required={isFieldRequired('fideId')}
              placeholder="e.g. 25012345 (Leave empty if unrated)"
              value={formData.fideId}
              onChange={(e) => onFieldChange('fideId', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 font-mono focus:outline-none focus:border-[#D4AF7C] transition shadow-inner"
            />
          </div>
        )}
      </div>

      {/* Radio Button Selector for Chess.com or Lichess */}
      {isFieldEnabled('chessUsername') && (
        <div id="chess-platform-selector" className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF7C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF7C]" />
              <span>Select Chess Platform {isFieldRequired('chessUsername') && '*'}</span>
            </label>
            <span className="text-[10px] text-[#A0A6B0]">Choose Chess.com or Lichess</span>
          </div>

          {/* Interactive Radio Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Chess.com Radio Card */}
            <div
              onClick={() => {
                onFieldChange('chessPlatform', 'chesscom');
                if (formData.chessUsername) {
                  onVerifyChess('chesscom', formData.chessUsername);
                }
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-3.5 select-none ${
                formData.chessPlatform === 'chesscom'
                  ? 'bg-gradient-to-r from-emerald-500/20 via-[#161B22] to-[#12161D] border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-[#0B0F14] border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <input
                type="radio"
                name="chessPlatform"
                value="chesscom"
                checked={formData.chessPlatform === 'chesscom'}
                onChange={() => {}}
                className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
              />
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-lg">♟</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-['Montserrat',sans-serif] font-bold text-sm text-[#F5F5F5]">Chess.com</span>
                  {formData.chessPlatform === 'chesscom' && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#A0A6B0] truncate mt-0.5">
                  Verify via official Chess.com profile
                </p>
              </div>
            </div>

            {/* Lichess Radio Card */}
            <div
              onClick={() => {
                onFieldChange('chessPlatform', 'lichess');
                if (formData.chessUsername) {
                  onVerifyChess('lichess', formData.chessUsername);
                }
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-3.5 select-none ${
                formData.chessPlatform === 'lichess'
                  ? 'bg-gradient-to-r from-[#D4AF7C]/20 via-[#161B22] to-[#12161D] border-[#D4AF7C] shadow-lg shadow-[#D4AF7C]/10 ring-1 ring-[#D4AF7C]/50'
                  : 'bg-[#0B0F14] border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <input
                type="radio"
                name="chessPlatform"
                value="lichess"
                checked={formData.chessPlatform === 'lichess'}
                onChange={() => {}}
                className="w-4 h-4 accent-[#D4AF7C] cursor-pointer shrink-0"
              />
              <div className="w-9 h-9 rounded-xl bg-[#D4AF7C]/20 border border-[#D4AF7C]/40 flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-lg">♞</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-['Montserrat',sans-serif] font-bold text-sm text-[#F5F5F5]">Lichess.org</span>
                  {formData.chessPlatform === 'lichess' && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#D4AF7C]/20 text-[#D4AF7C] font-bold border border-[#D4AF7C]/40">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#A0A6B0] truncate mt-0.5">
                  Verify via official Lichess.org profile
                </p>
              </div>
            </div>
          </div>

          {/* Conditional ID Input Field */}
          {formData.chessPlatform && (
            <div className="space-y-2.5 pt-2 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-[#A0A6B0] flex items-center gap-1.5">
                  <span>
                    Type your {formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'} Username / ID
                  </span>
                  {isFieldRequired('chessUsername') && (
                    <span className="text-red-400 font-bold">*</span>
                  )}
                </label>
                <span className="text-[10px] text-[#D4AF7C]">
                  Checked when you go to another field
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  id="chess-handle-input"
                  required={isFieldRequired('chessUsername')}
                  placeholder={
                    formData.chessPlatform === 'chesscom'
                      ? 'e.g. Hikaru or MagnusCarlsen'
                      : 'e.g. thibault or DrNykterstein'
                  }
                  value={formData.chessUsername}
                  onChange={(e) => onFieldChange('chessUsername', e.target.value)}
                  onBlur={() => {
                    if (formData.chessUsername.trim()) {
                      onVerifyChess(formData.chessPlatform, formData.chessUsername);
                    }
                  }}
                  className={`w-full px-4 py-3 pr-28 rounded-xl bg-[#0B0F14] border text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 font-mono transition shadow-inner focus:outline-none ${
                    chessVerification.result?.exists === true
                      ? 'border-emerald-500/70 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500'
                      : chessVerification.result?.exists === false
                      ? 'border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-white/10 focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C]'
                  }`}
                />

                {/* Right Inline Action Button / Status Badge */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {chessVerification.checking ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-[10px] text-[#D4AF7C] font-semibold border border-white/10">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF7C]" />
                      <span>Checking...</span>
                    </div>
                  ) : chessVerification.result?.exists === true ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-[10px] text-emerald-400 font-bold border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onVerifyChess(formData.chessPlatform, formData.chessUsername)}
                      disabled={!formData.chessUsername.trim() || chessVerification.checking}
                      className="px-3 py-1 rounded-lg bg-[#D4AF7C]/20 hover:bg-[#D4AF7C]/30 text-[#D4AF7C] font-bold text-[10px] transition cursor-pointer border border-[#D4AF7C]/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Verify ID
                    </button>
                  )}
                </div>
              </div>

              {/* Live Verification Status Cards */}
              {chessVerification.checking && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#A0A6B0] flex items-center gap-2.5 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF7C] shrink-0" />
                  <span>
                    Checking official existence of &ldquo;<strong className="text-white font-mono">@{formData.chessUsername}</strong>&rdquo; on {formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'}...
                  </span>
                </div>
              )}

              {!chessVerification.checking && chessVerification.result && (
                chessVerification.result.exists ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold flex items-center gap-1.5 truncate">
                          <span className="text-white">Genuine {chessVerification.result.platform} Player:</span>
                          <span className="font-mono text-emerald-300 font-bold">@{chessVerification.result.username}</span>
                          {chessVerification.result.title && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30">
                              {chessVerification.result.title}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-emerald-300/80 font-mono mt-0.5 truncate">
                          {chessVerification.result.ratings?.rapid ? `Rapid: ${chessVerification.result.ratings.rapid} • ` : ''}
                          {chessVerification.result.ratings?.blitz ? `Blitz: ${chessVerification.result.ratings.blitz} • ` : ''}
                          {chessVerification.result.ratings?.classical ? `Classical: ${chessVerification.result.ratings.classical} • ` : ''}
                          {chessVerification.result.name ? `Name: ${chessVerification.result.name} • ` : ''}
                          Account Verified &amp; Eligible
                        </div>
                      </div>
                    </div>
                    {chessVerification.result.avatar && (
                      <img
                        src={chessVerification.result.avatar}
                        alt="Player Avatar"
                        className="w-9 h-9 rounded-full border border-emerald-400/40 object-cover shrink-0"
                      />
                    )}
                  </div>
                ) : chessVerification.result.unavailable ? (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-300 text-xs flex items-start justify-between gap-3 shadow-lg animate-in fade-in duration-200">
                    <div className="flex items-start gap-3 min-w-0">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                      <div className="space-y-1 min-w-0">
                        <div className="font-bold text-amber-200 text-xs">
                          Verification Service Unavailable
                        </div>
                        <p className="text-[11px] text-amber-300/90 leading-relaxed">
                          {chessVerification.result.message || 'Unable to connect to chess verification server.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3 animate-in fade-in duration-200">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>
                      {chessVerification.result.message || `No player found with username "@${formData.chessUsername}".`}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
