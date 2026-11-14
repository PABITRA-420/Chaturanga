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
  chessVerification,
}: StepChessProfileProps) {
  return (
    <div className="space-y-5">
      <div className="border-b border-border pb-2">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-fg flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" aria-hidden="true" />
          <span>Chess Skill &amp; Online Account Verification</span>
        </h3>
        <p className="text-[11px] text-fg-muted mt-1 font-body">
          Select your platform (Chess.com or Lichess) and provide your authentic player ID for pairing &amp; rating checks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isFieldEnabled('ratingCategory') && (
          <div className="space-y-1.5">
            <label htmlFor="reg-ratingCategory" className="text-[11px] font-medium text-fg-muted block">
              Rating / Skill Category {isFieldRequired('ratingCategory') && '*'}
            </label>
            <select
              id="reg-ratingCategory"
              value={formData.ratingCategory}
              onChange={(e) => onFieldChange('ratingCategory', e.target.value)}
              className="w-full px-3 py-2.5 rounded-sm bg-bg border border-border text-xs text-fg focus:border-border-strong transition-colors cursor-pointer"
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
            <label htmlFor="reg-fideId" className="text-[11px] font-medium text-fg-muted block">
              FIDE ID {isFieldRequired('fideId') ? '*' : '(Optional)'}
            </label>
            <input
              id="reg-fideId"
              type="text"
              required={isFieldRequired('fideId')}
              placeholder="e.g. 25012345 (Leave empty if unrated)"
              value={formData.fideId}
              onChange={(e) => onFieldChange('fideId', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-sm bg-bg border border-border text-xs text-fg placeholder:text-fg-subtle font-mono focus:border-border-strong transition-colors"
            />
          </div>
        )}
      </div>

      {isFieldEnabled('chessUsername') && (
        <div id="chess-platform-selector" className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" aria-hidden="true" />
              <span>Select Chess Platform {isFieldRequired('chessUsername') && '*'}</span>
            </label>
            <span className="text-[10px] font-mono text-fg-muted">Choose Chess.com or Lichess</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Chess.com Card */}
            <div
              onClick={() => {
                onFieldChange('chessPlatform', 'chesscom');
                if (formData.chessUsername) {
                  onVerifyChess('chesscom', formData.chessUsername);
                }
              }}
              className={`p-4 rounded-sm border cursor-pointer transition-colors flex items-center gap-3.5 select-none ${
                formData.chessPlatform === 'chesscom'
                  ? 'bg-surface-elevated border-2 border-success'
                  : 'bg-bg border-border hover:border-border-strong'
              }`}
            >
              <input
                type="radio"
                name="chessPlatform"
                value="chesscom"
                checked={formData.chessPlatform === 'chesscom'}
                onChange={() => {}}
                className="w-4 h-4 accent-[var(--success)] cursor-pointer shrink-0"
              />
              <div className="w-9 h-9 rounded-xs bg-success/15 border border-success/40 flex items-center justify-center shrink-0 text-success">
                <span className="text-lg font-serif" aria-hidden="true">♟</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-fg">Chess.com</span>
                  {formData.chessPlatform === 'chesscom' && (
                    <span className="text-[9px] px-2 py-0.5 rounded-xs bg-success/15 text-success font-mono font-bold border border-success/40">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-fg-muted truncate mt-0.5 font-body">
                  Verify via official Chess.com profile
                </p>
              </div>
            </div>

            {/* Lichess Card */}
            <div
              onClick={() => {
                onFieldChange('chessPlatform', 'lichess');
                if (formData.chessUsername) {
                  onVerifyChess('lichess', formData.chessUsername);
                }
              }}
              className={`p-4 rounded-sm border cursor-pointer transition-colors flex items-center gap-3.5 select-none ${
                formData.chessPlatform === 'lichess'
                  ? 'bg-surface-elevated border-2 border-accent'
                  : 'bg-bg border-border hover:border-border-strong'
              }`}
            >
              <input
                type="radio"
                name="chessPlatform"
                value="lichess"
                checked={formData.chessPlatform === 'lichess'}
                onChange={() => {}}
                className="w-4 h-4 accent-[var(--accent)] cursor-pointer shrink-0"
              />
              <div className="w-9 h-9 rounded-xs bg-accent/15 border border-accent/40 flex items-center justify-center shrink-0 text-accent">
                <span className="text-lg font-serif" aria-hidden="true">♞</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-fg">Lichess.org</span>
                  {formData.chessPlatform === 'lichess' && (
                    <span className="text-[9px] px-2 py-0.5 rounded-xs bg-accent/15 text-accent font-mono font-bold border border-accent/40">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-fg-muted truncate mt-0.5 font-body">
                  Verify via official Lichess.org profile
                </p>
              </div>
            </div>
          </div>

          {formData.chessPlatform && (
            <div className="space-y-2.5 pt-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <label htmlFor="chess-handle-input" className="text-[11px] font-medium text-fg-muted flex items-center gap-1.5">
                  <span>
                    Type your {formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'} Username / ID
                  </span>
                  {isFieldRequired('chessUsername') && (
                    <span className="text-danger font-bold">*</span>
                  )}
                </label>
                <span className="text-[10px] font-mono text-accent">
                  Auto-verifies on blur
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
                  className={`w-full px-3.5 py-3 pr-28 rounded-sm bg-bg border text-xs text-fg placeholder:text-fg-subtle font-mono transition-colors ${
                    chessVerification.result?.exists === true
                      ? 'border-success focus:border-success'
                      : chessVerification.result?.exists === false
                      ? 'border-danger focus:border-danger'
                      : 'border-border focus:border-border-strong'
                  }`}
                />

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {chessVerification.checking ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-surface-elevated text-[10px] text-accent font-mono font-semibold border border-border">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" aria-hidden="true" />
                      <span>Checking...</span>
                    </div>
                  ) : chessVerification.result?.exists === true ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-success/15 text-[10px] text-success font-mono font-bold border border-success/40">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onVerifyChess(formData.chessPlatform, formData.chessUsername)}
                      disabled={!formData.chessUsername.trim() || chessVerification.checking}
                      className="px-3 py-1 rounded-xs bg-accent/15 hover:bg-accent/25 text-accent font-mono font-bold text-[10px] transition-colors cursor-pointer border border-accent/40 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Verify ID
                    </button>
                  )}
                </div>
              </div>

              {chessVerification.checking && (
                <div className="p-3 rounded-sm bg-surface-elevated border border-border text-xs text-fg-muted flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-accent shrink-0" aria-hidden="true" />
                  <span>
                    Checking official existence of &ldquo;<strong className="text-fg font-mono">@{formData.chessUsername}</strong>&rdquo; on {formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'}...
                  </span>
                </div>
              )}

              {!chessVerification.checking && chessVerification.result && (
                chessVerification.result.exists ? (
                  <div className="p-3.5 rounded-sm bg-success/10 border border-success/40 text-fg text-xs flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xs bg-success/20 flex items-center justify-center shrink-0 text-success">
                        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold flex items-center gap-1.5 truncate">
                          <span>Genuine {chessVerification.result.platform} Player:</span>
                          <span className="font-mono text-success font-bold">@{chessVerification.result.username}</span>
                          {chessVerification.result.title && (
                            <span className="px-1.5 py-0.5 rounded-xs bg-accent/15 text-accent text-[9px] font-mono font-bold border border-accent/30">
                              {chessVerification.result.title}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-fg-muted font-mono mt-0.5 truncate">
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
                        className="w-9 h-9 rounded-xs border border-success/40 object-cover shrink-0"
                      />
                    )}
                  </div>
                ) : chessVerification.result.unavailable ? (
                  <div className="p-3.5 rounded-sm bg-warning/10 border border-warning/40 text-fg text-xs flex items-start justify-between gap-3 animate-fade-in">
                    <div className="flex items-start gap-3 min-w-0">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-warning mt-0.5" aria-hidden="true" />
                      <div className="space-y-1 min-w-0">
                        <div className="font-bold text-warning text-xs">
                          Verification Service Unavailable
                        </div>
                        <p className="text-[11px] text-fg-muted leading-relaxed">
                          {chessVerification.result.message || 'Unable to connect to chess verification server.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-sm bg-danger/10 border border-danger/40 text-danger text-xs flex items-center gap-3 animate-fade-in">
                    <AlertTriangle className="w-4 h-4 text-danger shrink-0" aria-hidden="true" />
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
