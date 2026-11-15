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
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-accent space-y-4">
        <div className="w-9 h-9 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-fg-muted tracking-widest uppercase font-semibold font-mono">
          Loading Master Registration Spreadsheet...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg font-body selection:bg-accent selection:text-on-accent">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xs border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Desk</span>
            </Link>
            <span className="text-border-strong">•</span>
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-accent" />
              <span className="font-heading font-bold text-fg text-xs sm:text-sm tracking-tight">
                Spreadsheet Master Terminal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xs bg-success/10 border border-success/30 text-success text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Arbiter: {adminUser?.username || 'Chief Arbiter'}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/30 transition-colors cursor-pointer"
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
