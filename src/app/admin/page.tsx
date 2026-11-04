"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ChaturangaLogo from '@/components/ChaturangaLogo';
import {
  ShieldCheck, Shield, Users, Trophy, LogOut, Download, CheckCircle2,
  ExternalLink, Sparkles, Database, Plus, Award, Crown, Bell, Cloud, Camera,
  Swords, Menu, X, ChevronRight, Activity, Clock
} from 'lucide-react';
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
      <div className="min-h-screen bg-[#070A0E] flex flex-col items-center justify-center text-[#D4AF7C] space-y-4">
        <div className="w-10 h-10 border-2 border-[#D4AF7C] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#A0A6B0] tracking-widest uppercase font-semibold">
          Verifying Chief Arbiter Credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0E] text-[#F5F5F5] font-['Inter',sans-serif] flex flex-col selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
      {/* 1. TOP EXECUTIVE HEADER */}
      <header className="sticky top-0 z-40 bg-[#0B0F14]/95 backdrop-blur-xl border-b border-white/10 h-16 shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* Left: Brand & Arbiter Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5 transition btn-tactile"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#D4AF7C]" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-black/60 border border-[#D4AF7C]/40 p-1 flex items-center justify-center shadow-md shadow-[#D4AF7C]/15 group-hover:border-[#D4AF7C] transition">
                <ChaturangaLogo className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Montserrat',sans-serif] font-black tracking-widest text-[#F5F5F5] text-sm leading-none">
                  CHATURANGA
                </span>
                <span className="text-[9px] font-semibold text-[#D4AF7C] tracking-[0.2em] uppercase mt-0.5">
                  ARBITER CONSOLE
                </span>
              </div>
            </Link>

            {/* Desktop Arbiter Badge */}
            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-white/10 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 text-[11px] font-medium text-[#D4AF7C]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{adminUser?.role || 'Chief Arbiter'}: {adminUser?.username || adminUser?.email || 'admin'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Supabase RLS</span>
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openCreateModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] shadow-md shadow-[#D4AF7C]/20 btn-tactile cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Tournament</span>
              <span className="sm:hidden">New</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition btn-tactile"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition btn-tactile cursor-pointer"
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
        <aside className="w-64 xl:w-72 shrink-0 border-r border-white/10 bg-[#090D13]/70 p-4 space-y-6 hidden lg:block overflow-y-auto max-h-[calc(100vh-4rem)] sticky top-16 no-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="px-3 text-[10px] font-mono font-bold tracking-widest text-[#A0A6B0]/70 uppercase">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#D4AF7C] text-[#0B0F14] font-bold shadow-md shadow-[#D4AF7C]/20'
                          : 'text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0B0F14]' : 'text-[#D4AF7C]'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0 ${
                          isActive ? 'bg-black/20 text-[#0B0F14]' : 'bg-[#D4AF7C]/15 text-[#D4AF7C]'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {typeof item.count === 'number' && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md shrink-0 ${
                          isActive ? 'bg-black/20 text-[#0B0F14]' : 'bg-white/5 text-[#A0A6B0]'
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
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-[#A0A6B0] space-y-1">
            <div className="font-semibold text-[#F5F5F5] flex items-center gap-1.5">
              <span>Jalpaiguri Govt. Engg. College</span>
            </div>
            <p className="text-[10px] text-[#A0A6B0]/80">
              Official Collegiate FIDE Swiss Arbiter Portal • Est. 2012
            </p>
          </div>
        </aside>

        {/* MOBILE NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-md flex"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-[#0B0F14] h-full p-5 space-y-6 overflow-y-auto border-r border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-[#D4AF7C] uppercase tracking-wider">
                  Arbiter Menu
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#A0A6B0] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1.5">
                  <div className="px-2 text-[10px] font-mono font-bold tracking-widest text-[#A0A6B0]/70 uppercase">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between gap-2.5 transition ${
                            isActive
                              ? 'bg-[#D4AF7C] text-[#0B0F14] font-bold'
                              : 'text-[#A0A6B0] hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B0F14]' : 'text-[#D4AF7C]'}`} />
                            <span>{item.label}</span>
                          </div>
                          {typeof item.count === 'number' && (
                            <span className="text-[10px] font-mono opacity-80">{item.count}</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="text-[11px] font-mono text-[#D4AF7C] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>Console</span>
                <span>/</span>
                <span className="text-[#A0A6B0]">{currentGroup.title}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-['Montserrat',sans-serif] text-[#F5F5F5] flex items-center gap-2.5">
                <CurrentIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF7C]" />
                <span>{currentItem.label}</span>
              </h1>
            </div>

            {/* Quick Context Shortcuts */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {activeTab !== 'roster' && (
                <button
                  onClick={() => setActiveTab('roster')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition btn-tactile"
                >
                  <Users className="w-3.5 h-3.5 text-[#D4AF7C]" />
                  <span>Roster ({participants.length})</span>
                </button>
              )}
              {activeTab !== 'tournaments' && (
                <button
                  onClick={() => setActiveTab('tournaments')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition btn-tactile"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#D4AF7C]" />
                  <span>Events ({tournaments.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Cockpit Executive Overview (Only on cockpit tab so it doesn't clutter other workspaces) */}
          {activeTab === 'cockpit' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A0A6B0]">Total Events</p>
                  <p className="text-xl sm:text-2xl font-black text-[#F5F5F5] mt-0.5 font-['Montserrat',sans-serif]">
                    {tournaments.length} <span className="text-xs text-[#A0A6B0] font-normal">Championships</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C] shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A0A6B0]">Registration</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 font-['Montserrat',sans-serif]">
                    {tournaments.filter(t => t.status === 'open').length} <span className="text-xs text-[#A0A6B0] font-normal">Active</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A0A6B0]">Total Players</p>
                  <p className="text-xl sm:text-2xl font-black text-[#F5F5F5] mt-0.5 font-['Montserrat',sans-serif]">
                    {participants.length} <span className="text-xs text-[#A0A6B0] font-normal">Registered</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A0A6B0]">Database Health</p>
                  <p className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>PostgreSQL Sync</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
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
