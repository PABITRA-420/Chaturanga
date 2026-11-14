"use client";

import React from 'react';
import { Database, Sparkles } from 'lucide-react';

export default function AdminSettingsTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 rounded-md bg-surface border border-border space-y-4 shadow-xs">
        <h3 className="font-heading text-base font-bold text-fg flex items-center gap-2">
          <Database className="w-4 h-4 text-accent" />
          <span>Supabase PostgreSQL Architecture Status</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-sm bg-surface-elevated border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fg">Supabase PostgreSQL</span>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-success/10 text-success border border-success/30">
                Live &amp; Connected
              </span>
            </div>
            <p className="text-xs text-fg-muted">
              Managed tables: <code className="font-mono text-accent">tournaments</code>, <code className="font-mono text-accent">registrations</code>, <code className="font-mono text-accent">leaderboard_players</code>.
            </p>
          </div>
          <div className="p-4 rounded-sm bg-surface-elevated border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fg">Chess.com Public API</span>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-info/10 text-info border border-info/30">
                REST Live
              </span>
            </div>
            <p className="text-xs text-fg-muted">
              Syncs official Chess.com stats and updates collegiate player ratings automatically.
            </p>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-md bg-surface border border-border space-y-3 font-body">
        <h3 className="font-heading text-base font-bold text-fg flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>One-Click Schema Synchronization</span>
        </h3>
        <p className="text-xs text-fg-muted leading-relaxed">
          Run the built-in migration script to re-seed or verify Supabase schema:
        </p>
        <pre className="p-4 rounded-sm bg-surface-elevated border border-border text-xs font-mono text-accent overflow-x-auto">
          npm run db:migrate
        </pre>
      </div>
    </div>
  );
}
