"use client";

import React from 'react';
import { Database, Sparkles } from 'lucide-react';

export default function AdminSettingsTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 rounded-3xl bg-[#10141C] border border-white/10 space-y-4 shadow-xl">
        <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5] flex items-center gap-2">
          <Database className="w-4 h-4 text-[#D4AF7C]" />
          <span>Supabase PostgreSQL Architecture Status</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#080B0F] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5F5F5]">Supabase PostgreSQL</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live &amp; Connected
              </span>
            </div>
            <p className="text-xs text-[#A0A6B0]">
              Managed tables: <code className="text-[#D4AF7C]">tournaments</code>, <code className="text-[#D4AF7C]">registrations</code>, <code className="text-[#D4AF7C]">leaderboard_players</code>.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#080B0F] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5F5F5]">Chess.com Public API</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                REST Live
              </span>
            </div>
            <p className="text-xs text-[#A0A6B0]">
              Syncs official Chess.com stats and updates collegiate player ratings automatically.
            </p>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-3xl bg-[#10141C] border border-white/10 space-y-3 font-['Inter',sans-serif]">
        <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4AF7C]" />
          <span>One-Click Schema Synchronization</span>
        </h3>
        <p className="text-xs text-[#A0A6B0] leading-relaxed">
          Run the built-in migration script to re-seed or verify Supabase schema:
        </p>
        <pre className="p-4 rounded-2xl bg-[#080B0F] border border-white/10 text-xs font-mono text-[#D4AF7C] overflow-x-auto">
          npm run db:migrate
        </pre>
      </div>
    </div>
  );
}
