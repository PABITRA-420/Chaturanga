'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, LogOut, Table2 } from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import AdminSpreadsheetTab from '@/components/admin/AdminSpreadsheetTab';

export default function AdminSpreadsheetPage() {
  const {
    loading,
    adminUser,
    tournaments,
    participants,
    loadingParticipants,
    loadRegistrations,
    handleCheckIn,
    handleLogout,
  } = useAdminManagement();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0E] flex flex-col items-center justify-center text-[#D4AF7C] space-y-4">
        <div className="w-10 h-10 border-2 border-[#D4AF7C] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#A0A6B0] tracking-widest uppercase font-semibold font-mono">
          Loading Master Registration Spreadsheet...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0E] text-[#F5F5F5] font-['Inter',sans-serif] selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B0F14]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Desk</span>
            </Link>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-[#D4AF7C]" />
              <span className="font-bold text-white text-xs sm:text-sm tracking-wide">
                Spreadsheet Master Terminal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Arbiter: {adminUser?.username || 'Chief Arbiter'}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Spreadsheet Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminSpreadsheetTab
          tournaments={tournaments}
          participants={participants}
          loading={loadingParticipants}
          onRefresh={loadRegistrations}
          onCheckIn={handleCheckIn}
        />
      </main>
    </div>
  );
}
