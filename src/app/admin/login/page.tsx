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
  Info
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
      setErrorMessage('Please enter both Admin ID and Password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe }),
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

  const handleUseQuickCredentials = () => {
    setUsername('admin');
    setPassword('1234');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#070A0E] text-[#F5F5F5] font-['Inter',sans-serif] flex flex-col justify-between relative overflow-hidden selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
      {/* Background Ambience & Chess Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #D4AF7C 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#D4AF7C]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-6 max-w-[1440px] mx-auto flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A0A6B0] hover:text-[#D4AF7C] transition-colors group cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Public Website</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[11px] text-[#A0A6B0]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Arbiter Portal Gate • JGEC</span>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-[460px]">
          
          {/* Brand & Badge Top */}
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-b from-black/80 to-[#12161D] border border-[#D4AF7C]/40 p-2 shadow-2xl shadow-[#D4AF7C]/15 mx-auto">
              <ChaturangaLogo className="w-full h-full" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF7C]" />
                <span>Restricted Arbiter Access</span>
              </div>
              <h1 className="font-['Montserrat',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F5]">
                CHATURANGA Admin
              </h1>
              <p className="text-xs text-[#A0A6B0] max-w-sm mx-auto mt-1 font-['Poppins',sans-serif]">
                Tournament pairing engine, registration roster & club administration console.
              </p>
            </div>
          </div>

          {/* Form Container Card */}
          <div className="rounded-3xl bg-[#10141C]/90 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF7C] to-transparent" />

            {checkingExistingSession ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-[#D4AF7C] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#A0A6B0]">Checking active session status...</p>
              </div>
            ) : success ? (
              <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-['Montserrat',sans-serif] text-lg font-bold text-[#F5F5F5]">
                    Authorized Successfully
                  </h3>
                  <p className="text-xs text-[#A0A6B0] mt-1">
                    Opening Arbiter Dashboard...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">{errorMessage}</div>
                  </div>
                )}

                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#A0A6B0] uppercase tracking-wider">
                    Admin Identifier
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A6B0]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="admin-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin or admin@jgec.ac.in"
                      autoComplete="username"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#090D12] border border-white/10 text-sm text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C]/40 transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#A0A6B0] uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[11px] text-[#A0A6B0]/70">
                      Standard Security Key
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A6B0]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="admin-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#090D12] border border-white/10 text-sm text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C]/40 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A0A6B0] hover:text-[#F5F5F5] transition cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs text-[#A0A6B0]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-[#090D12] text-[#D4AF7C] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#D4AF7C]"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[11px] text-[#A0A6B0]/70">Session: 7 days</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] disabled:opacity-50 transition-all duration-200 shadow-lg shadow-[#D4AF7C]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B0F14] border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
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

            {/* Quick Demo Credentials Assistant Box */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-[#D4AF7C]">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Configured .env Credentials</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseQuickCredentials}
                    className="text-[11px] font-semibold text-[#D4AF7C] hover:underline cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
                
                <p className="text-[11px] text-[#A0A6B0] leading-relaxed">
                  Firebase is currently uninitiated. Active fallback credentials loaded from <code className="text-[#D4AF7C]">.env.local</code>:
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="px-2.5 py-1.5 rounded-lg bg-[#090D12] border border-white/5 flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-[#A0A6B0]">Admin ID</span>
                    <span className="text-[#F5F5F5] font-semibold">admin</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-[#090D12] border border-white/5 flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-[#A0A6B0]">Password</span>
                    <span className="text-[#F5F5F5] font-semibold">1234</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Security Note Footer */}
          <div className="text-center mt-6 text-[11px] text-[#A0A6B0]/60 space-y-1">
            <p>Jalpaiguri Government Engineering College Chess Society</p>
            <p>Fair play monitoring, arbiter pairing generation & tournament logs.</p>
          </div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-[#A0A6B0]/50 border-t border-white/5">
        © 2026 CHATURANGA Arbiter Administration. All administrative actions are logged.
      </footer>
    </div>
  );
}
