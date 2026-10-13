import Link from 'next/link';
import { Home, ArrowRight, Trophy } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F5F5] flex items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#D4AF7C]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-lg mx-auto px-6 space-y-8">
        {/* Chess piece icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 text-[#D4AF7C] mx-auto">
          <span className="text-4xl select-none">♞</span>
        </div>

        {/* Error text */}
        <div className="space-y-3">
          <h1 className="font-['Montserrat',sans-serif] font-black text-7xl sm:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF7C] via-[#F3E2B8] to-[#D4AF7C] tracking-tight">
            404
          </h1>
          <h2 className="font-['Montserrat',sans-serif] font-bold text-xl sm:text-2xl text-[#F5F5F5]">
            Illegal Move Detected
          </h2>
          <p className="font-['Poppins',sans-serif] text-sm text-[#A0A6B0] leading-relaxed max-w-md mx-auto">
            This square doesn&apos;t exist on our board. The page you&apos;re looking for may have been moved, removed, or never existed.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-['Inter',sans-serif] text-sm font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 transition-all shadow-xl shadow-[#D4AF7C]/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/upcoming"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-['Inter',sans-serif] text-sm font-semibold text-[#F5F5F5] bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#D4AF7C]/40 transition-all active:scale-[0.98]"
          >
            <Trophy className="w-4 h-4 text-[#D4AF7C]" />
            <span>View Tournaments</span>
          </Link>
        </div>

        {/* Quick links */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 text-xs text-[#A0A6B0] font-['Inter',sans-serif]">
          <Link href="/register" className="hover:text-[#D4AF7C] transition-colors flex items-center gap-1">
            Register <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/team" className="hover:text-[#D4AF7C] transition-colors flex items-center gap-1">
            Our Team <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/past-events" className="hover:text-[#D4AF7C] transition-colors flex items-center gap-1">
            Past Events <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
