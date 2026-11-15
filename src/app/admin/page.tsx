"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ChaturangaLogo from '@/components/ChaturangaLogo';
import {
  ShieldCheck, Shield, Users, Trophy, LogOut, Download, CheckCircle2,
  ExternalLink, Sparkles, Database, Plus, Award, Crown, Bell, Cloud, Camera,
  Swords, Menu, X, ChevronRight, Activity, Clock, Sun, Moon
} from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import AdminTournamentsTab from '@/components/admin/AdminTournamentsTab';
import AdminParticipantsTab from '@/components/admin/AdminParticipantsTab';
import AdminPairingsTab from '@/components/admin/AdminPairingsTab';
import AdminLeaderboardTab from '@/components/admin/AdminLeaderboardTab';
import AdminResultsTab from '@/components/admin/AdminResultsTab';
import AdminAnnouncementsTab from '@/components/admin/AdminAnnouncementsTab';
import AdminTeamTab from '@/components/admin/AdminTeamTab';
import AdminGalleryTab from '@/components/admin/AdminGalleryTab';
import AdminMediaTab from '@/components/admin/AdminMediaTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
import AdminCertificatesTab from '@/components/admin/AdminCertificatesTab';
import { AdminTeamPairingsTab } from '@/components/admin/AdminTeamPairingsTab';
import AdminCockpitTab from '@/components/admin/AdminCockpitTab';
import TournamentFormModal from '@/components/admin/TournamentFormModal';
import ArchiveTournamentModal from '@/components/admin/ArchiveTournamentModal';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function AdminDashboardPage() {
  const {
    loading, adminUser, activeTab, setActiveTab, tournaments, setTournaments,
    participants, loadingParticipants, isUpdatingStatus, togglingVisibilityId,
    isEditorModalOpen, editingTournament, openCreateModal, openEditModal, closeEditorModal,
    handleSaveTournament, handleDeleteTournament, handleToggleStatus, handleToggleVisibility,
    isArchiveModalOpen, archivingTournament, openArchiveModal, closeArchiveModal,
    handleArchiveTournament, loadRegistrations, handleCheckIn, handleDeleteParticipant,
    handleAddWalkIn, editorDraft, setEditorDraft, handleNavigateToMedia, handleReturnToEditor, handleLogout
  } = useAdminManagement();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  // Grouped Navigation for Calm, Structured Access
  const NAV_GROUPS: NavGroup[] = [
    {
      title: 'Tournament Operations',
      items: [
        { id: 'cockpit', label: 'All-in-One Cockpit', icon: Sparkles, badge: 'Live Desk' },
        { id: 'tournaments', label: 'Tournaments CMS', icon: Trophy, count: tournaments.length },
        { id: 'roster', label: 'Player Roster', icon: Users, count: participants.length },
        { id: 'pairings', label: 'Swiss Pairings & Clocks', icon: Swords },
        { id: 'team_pairings', label: 'Team Swiss Arena', icon: Shield },
        { id: 'results', label: 'Prizes & Podiums', icon: Award },
      ],
    },
    {
      title: 'Ratings & Awards',
      items: [
        { id: 'leaderboard', label: 'Elo Leaderboard & FIDE', icon: Crown },
        { id: 'certificates', label: 'Award Certificates', icon: Award },
      ],
    },
    {
      title: 'Campus Content (CMS)',
      items: [
        { id: 'announcements', label: 'Notice Board', icon: Bell },
        { id: 'gallery', label: 'Photo Gallery', icon: Camera },
        { id: 'team', label: 'Council & Mentors', icon: Users },
        { id: 'media', label: 'Media & Storage', icon: Cloud },
      ],
    },
    {
      title: 'System & Health',
      items: [
        { id: 'settings', label: 'Database & Sync', icon: Database },
      ],
    },
  ];

  // Helper to find active tab title & group
  const currentItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab) || {
    id: 'cockpit',
    label: 'All-in-One Cockpit',
    icon: Sparkles,
  };
  const currentGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === activeTab)) || NAV_GROUPS[0];
  const CurrentIcon = currentItem.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-accent space-y-4">
        <div className="w-9 h-9 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-fg-muted tracking-widest uppercase font-semibold">
          Verifying Chief Arbiter Credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg font-body flex flex-col selection:bg-accent selection:text-on-accent">
      {/* 1. TOP EXECUTIVE HEADER */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xs border-b border-border h-16 shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          {/* Left: Brand & Arbiter Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-sm text-fg-muted hover:text-fg hover:bg-surface-subtle border border-border transition-colors"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-accent" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-sm bg-[#111114] border border-border-strong p-1 flex items-center justify-center group-hover:border-accent transition-colors">
                <ChaturangaLogo className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold tracking-widest text-fg text-sm leading-none">
                  CHATURANGA
                </span>
                <span className="text-[9px] font-mono font-semibold text-accent tracking-[0.2em] uppercase mt-0.5">
                  ARBITER CONSOLE
                </span>
              </div>
            </Link>

            {/* Desktop Arbiter Badge */}
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-border text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-accent/10 border border-accent/30 text-[11px] font-mono font-medium text-accent">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{adminUser?.role || 'Chief Arbiter'}: {adminUser?.username || adminUser?.email || 'admin'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-success/10 border border-success/30 text-[10px] font-mono text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span>Live Supabase RLS</span>
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              className="p-2 rounded-sm text-fg-muted hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-fg" />}
            </button>

            <button
              type="button"
              onClick={() => openCreateModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Tournament</span>
              <span className="sm:hidden">New</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-fg-muted hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/30 transition-colors cursor-pointer"
              title="Sign Out of Arbiter Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: PRO SIDEBAR + CLEAN WORKSPACE */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="w-64 xl:w-72 shrink-0 border-r border-border bg-surface p-4 space-y-6 hidden lg:block overflow-y-auto max-h-[calc(100vh-4rem)] sticky top-16 no-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="px-3 text-[10px] font-mono font-bold tracking-widest text-fg-subtle uppercase">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full px-3 py-2 rounded-sm text-xs font-medium flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-accent text-on-accent font-semibold'
                          : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-on-accent' : 'text-accent'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs uppercase tracking-wider shrink-0 ${
                          isActive ? 'bg-black/15 text-on-accent' : 'bg-accent/15 text-accent'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {typeof item.count === 'number' && (
                        <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-xs shrink-0 ${
                          isActive ? 'bg-black/15 text-on-accent' : 'bg-surface-elevated border border-border text-fg-muted'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Campus Arbiter Footer Info in Sidebar */}
          <div className="p-3.5 rounded-sm bg-surface-elevated border border-border text-[11px] text-fg-muted space-y-1">
            <div className="font-semibold text-fg flex items-center gap-1.5">
              <span>Jalpaiguri Govt. Engg. College</span>
            </div>
            <p className="text-[10px] font-mono text-fg-subtle">
              Official Collegiate FIDE Swiss Arbiter Portal • Est. 2012
            </p>
          </div>
        </aside>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden bg-black/75 backdrop-blur-xs flex"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-surface h-full p-5 space-y-6 overflow-y-auto border-r border-border-strong"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                  Arbiter Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-sm text-fg-muted hover:text-fg"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1.5">
                  <div className="px-2 text-[10px] font-mono font-bold tracking-widest text-fg-subtle uppercase">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-sm text-xs font-medium flex items-center justify-between gap-2.5 transition-colors ${
                            isActive
                              ? 'bg-accent text-on-accent font-semibold'
                              : 'text-fg-muted hover:text-fg hover:bg-surface-subtle'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-on-accent' : 'text-accent'}`} />
                            <span>{item.label}</span>
                          </div>
                          {typeof item.count === 'number' && (
                            <span className="text-[10px] font-mono tabular-nums opacity-80">{item.count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MAIN OPERATIONAL WORKSPACE */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0 space-y-6">
          {/* Breadcrumb & Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="text-[11px] font-mono text-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>Console</span>
                <span>/</span>
                <span className="text-fg-muted">{currentGroup.title}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-fg flex items-center gap-2.5 tracking-tight">
                <CurrentIcon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                <span>{currentItem.label}</span>
              </h1>
            </div>

            {/* Quick Context Shortcuts */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {activeTab !== 'roster' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('roster')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-fg-muted hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-accent" />
                  <span>Roster ({participants.length})</span>
                </button>
              )}
              {activeTab !== 'tournaments' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('tournaments')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold text-fg-muted hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors"
                >
                  <Trophy className="w-3.5 h-3.5 text-accent" />
                  <span>Events ({tournaments.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Cockpit Executive Overview (Only on cockpit tab so it doesn't clutter other workspaces) */}
          {activeTab === 'cockpit' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-md bg-surface border border-border flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-fg-muted">Total Events</p>
                  <p className="text-xl sm:text-2xl font-bold text-fg mt-0.5 font-heading tabular-nums">
                    {tournaments.length} <span className="text-xs text-fg-muted font-normal font-body">Championships</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-sm bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-md bg-surface border border-border flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-fg-muted">Registration</p>
                  <p className="text-xl sm:text-2xl font-bold text-success mt-0.5 font-heading tabular-nums">
                    {tournaments.filter(t => t.status === 'open').length} <span className="text-xs text-fg-muted font-normal font-body">Active</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-sm bg-success/10 border border-success/30 flex items-center justify-center text-success shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-md bg-surface border border-border flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-fg-muted">Total Players</p>
                  <p className="text-xl sm:text-2xl font-bold text-fg mt-0.5 font-heading tabular-nums">
                    {participants.length} <span className="text-xs text-fg-muted font-normal font-body">Registered</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-sm bg-warning/10 border border-warning/30 flex items-center justify-center text-warning shrink-0">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-md bg-surface border border-border flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-fg-muted">Database Health</p>
                  <p className="text-xs font-mono font-bold text-success mt-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    <span>PostgreSQL Sync</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-sm bg-info/10 border border-info/30 flex items-center justify-center text-info shrink-0">
                  <Database className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE TAB VIEWS */}
          <div className="min-w-0">
            {activeTab === 'cockpit' && (
              <AdminCockpitTab
                tournaments={tournaments}
                participants={participants}
                onCheckIn={handleCheckIn}
                onTournamentUpdated={(updated) => {
                  setTournaments(prev => prev.map(t => t.id === updated.id ? updated : t));
                }}
              />
            )}

            {activeTab === 'tournaments' && (
              <AdminTournamentsTab
                tournaments={tournaments}
                onOpenCreateModal={() => openCreateModal()}
                onOpenEditModal={(t) => openEditModal(t)}
                onOpenArchiveModal={(t) => openArchiveModal(t)}
                onToggleStatus={handleToggleStatus}
                onToggleVisibility={handleToggleVisibility}
                onDeleteTournament={handleDeleteTournament}
                isUpdatingStatusId={isUpdatingStatus}
                isTogglingVisibilityId={togglingVisibilityId}
              />
            )}

            {activeTab === 'roster' && (
              <AdminParticipantsTab
                tournaments={tournaments}
                participants={participants}
                loadingParticipants={loadingParticipants}
                onRefresh={loadRegistrations}
                onCheckIn={handleCheckIn}
                onDeletePlayer={handleDeleteParticipant}
                onAddWalkIn={handleAddWalkIn}
              />
            )}

            {activeTab === 'pairings' && (
              <AdminPairingsTab tournaments={tournaments} />
            )}

            {activeTab === 'team_pairings' && (
              <AdminTeamPairingsTab tournaments={tournaments} />
            )}

            {activeTab === 'results' && (
              <AdminResultsTab
                tournaments={tournaments}
                onTournamentUpdated={(updated) => setTournaments(prev => prev.map(t => t.id === updated.id ? updated : t))}
              />
            )}

            {activeTab === 'certificates' && (
              <AdminCertificatesTab tournaments={tournaments} />
            )}

            {activeTab === 'leaderboard' && <AdminLeaderboardTab />}
            {activeTab === 'announcements' && <AdminAnnouncementsTab />}
            {activeTab === 'team' && <AdminTeamTab />}
            {activeTab === 'gallery' && <AdminGalleryTab />}
            {activeTab === 'media' && <AdminMediaTab editorDraft={editorDraft} onReturnToEditor={handleReturnToEditor} />}
            {activeTab === 'settings' && <AdminSettingsTab />}
          </div>
        </main>
      </div>

      {/* MODAL: TOURNAMENT CREATOR & EDITOR */}
      <TournamentFormModal
        isOpen={isEditorModalOpen}
        editingTournament={editingTournament}
        onClose={closeEditorModal}
        onSave={handleSaveTournament}
        onNavigateToMedia={handleNavigateToMedia}
        initialDraft={editorDraft}
        onDraftChange={setEditorDraft}
      />

      {/* MODAL: ARCHIVE TOURNAMENT & PODIUM PUBLISHER */}
      <ArchiveTournamentModal
        isOpen={isArchiveModalOpen}
        tournament={archivingTournament}
        onClose={closeArchiveModal}
        onArchive={handleArchiveTournament}
      />
    </div>
  );
}
