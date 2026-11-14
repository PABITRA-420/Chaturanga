"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChaturangaLogo from '@/components/ChaturangaLogo';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft,
  KeyRound,
  Database,
  Fingerprint
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingExistingSession, setCheckingExistingSession] = useState(true);

  // Check if already authenticated on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (data.authenticated) {
          router.replace('/admin');
          return;
        }
      } catch {
        // Silently continue to login
      } finally {
        setCheckingExistingSession(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both Admin Email / ID and Password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: username.trim(),
          username: username.trim(), 
          password: password.trim(), 
          rememberMe 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      } else {
        setErrorMessage(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('Network or server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg font-body flex flex-col justify-between relative selection:bg-accent selection:text-on-accent">
      {/* Subtle Architectural Swiss Grid */}
      <div className="absolute inset-0 pointer-events-none chess-bg-pattern opacity-40" />

      {/* Header Bar */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-fg-muted hover:text-accent transition-colors group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Public Website</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1 rounded-sm bg-surface border border-border text-[11px] font-mono text-fg-muted">
          <Database className="w-3.5 h-3.5 text-success" />
          <span className="text-success font-medium">Supabase Auth Protected</span>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-[460px]">
          {/* Brand & Badge Top */}
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-[#111114] border border-border-strong p-2 mx-auto">
              <ChaturangaLogo className="w-full h-full" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs text-[11px] font-mono font-semibold uppercase tracking-widest text-accent bg-accent/10 border border-accent/30 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Supabase RBAC &amp; Arbiter Protection</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-fg">
                CHATURANGA Admin
              </h1>
              <p className="text-xs text-fg-muted max-w-sm mx-auto mt-1">
                Tournament pairing engine, registration roster &amp; club administration console.
              </p>
            </div>
          </div>

          {/* Form Container Card */}
          <div className="rounded-md bg-surface border border-border-strong border-t-2 border-t-accent p-6 sm:p-8 shadow-sm relative">
            {checkingExistingSession ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-fg-muted">Verifying Supabase cryptographic session...</p>
              </div>
            ) : success ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-sm bg-success/10 border border-success/40 text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-fg">
                    Supabase Authentication Verified
                  </h3>
                  <p className="text-xs text-fg-muted mt-1">
                    Granting Arbiter Console privileges...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Banner */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-sm bg-danger/10 border border-danger/30 flex items-start gap-3 text-xs text-danger"
                  >
                    <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                    <div className="flex-1">{errorMessage}</div>
                  </div>
                )}

                {/* Username / Email Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-username"
                    className="block text-xs font-mono font-semibold text-fg-muted uppercase tracking-wider"
                  >
                    Admin Email / Identifier
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-fg-subtle">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="admin-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin@chaturanga-jgec.ac.in or username"
                      autoComplete="username"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-sm bg-surface-elevated border border-border text-sm text-fg placeholder:text-fg-subtle focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="admin-password"
                      className="block text-xs font-mono font-semibold text-fg-muted uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <span className="text-[11px] font-mono text-fg-muted flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-accent" />
                      <span>Encrypted Credential</span>
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-fg-subtle">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="admin-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-11 py-2.5 rounded-sm bg-surface-elevated border border-border text-sm text-fg placeholder:text-fg-subtle focus:border-accent transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-fg-muted hover:text-fg transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs text-fg-muted">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-xs border-border-strong bg-surface-elevated text-accent cursor-pointer accent-accent"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[11px] font-mono text-success font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                    Supabase JWT
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-sm font-heading font-semibold text-xs sm:text-sm uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-accent border-t-transparent rounded-full animate-spin" />
                      <span>Verifying via Supabase Auth...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Arbiter Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Enterprise Security Notice */}
            <div className="mt-6 pt-5 border-t border-border">
              <div className="p-3.5 rounded-sm bg-surface-elevated border border-border text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-accent">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Restricted Access System</span>
                </div>

                <p className="text-[11px] text-fg-muted leading-relaxed">
                  This console is restricted to certified JGEC arbiters and authorized tournament directors. All sessions are authenticated using Supabase Auth JWTs with PostgreSQL Row Level Security enforcement.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="px-2.5 py-1.5 rounded-xs bg-surface border border-border flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-fg-subtle">Audit Logging</span>
                    <span className="text-fg font-semibold">Active &amp; Monitored</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-xs bg-surface border border-border flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-fg-subtle">Security Standard</span>
                    <span className="text-success font-semibold">FIDE / AICF Fair Play</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Note Footer */}
          <div className="text-center mt-6 text-[11px] font-mono text-fg-subtle space-y-1">
            <p>Jalpaiguri Government Engineering College Chess Society</p>
            <p>Fair play monitoring, arbiter pairing generation &amp; tournament logs.</p>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 py-4 text-center text-[11px] font-mono text-fg-subtle border-t border-border">
        © 2026 CHATURANGA Arbiter Administration. Protected by Supabase Auth &amp; PostgreSQL RLS.
      </footer>
    </div>
  );
}
