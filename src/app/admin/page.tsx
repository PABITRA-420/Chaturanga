"use client";

import React from 'react';
import Link from 'next/link';
import ChaturangaLogo from '@/components/ChaturangaLogo';
import { 
  ShieldCheck, Shield, Users, Trophy, LogOut, Download, CheckCircle2, 
  ExternalLink, Sparkles, Database, Plus, Award, Crown, Bell, Cloud, Camera, Swords 
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
import TournamentFormModal from '@/components/admin/TournamentFormModal';
import ArchiveTournamentModal from '@/components/admin/ArchiveTournamentModal';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0E] flex flex-col items-center justify-center text-[#D4AF7C] space-y-4">
        <div className="w-10 h-10 border-2 border-[#D4AF7C] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#A0A6B0] tracking-widest uppercase font-semibold">Verifying Arbiter Credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0E] text-[#F5F5F5] font-['Inter',sans-serif] selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
      {/* Top Arbiter Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F14]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/60 border border-[#D4AF7C]/40 p-1 flex items-center justify-center shadow-md shadow-[#D4AF7C]/15">
                <ChaturangaLogo className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Montserrat',sans-serif] font-black tracking-widest text-[#F5F5F5] text-base leading-none">CHATURANGA</span>
                <span className="text-[10px] font-semibold text-[#D4AF7C] tracking-[0.2em] uppercase mt-0.5">CHIEF ARBITER CONSOLE</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-2 ml-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 text-[11px] font-semibold text-[#D4AF7C]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF7C]" />
                <span>{adminUser?.role || 'Chief Arbiter'}: {adminUser?.username || adminUser?.email || 'admin'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Supabase Auth & RLS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer">
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Superior Power Control Banner */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#141A24] via-[#10141C] to-[#0A0D12] border border-[#D4AF7C]/30 shadow-2xl relative overflow-hidden">
            <div className="space-y-2 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-[#D4AF7C] bg-[#D4AF7C]/15 border border-[#D4AF7C]/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Superior Admin Mode • Full CMS & Registration Power</span>
              </div>
              <h1 className="font-['Montserrat',sans-serif] text-2xl sm:text-3xl font-extrabold text-[#F5F5F5]">
                Tournament & Arbiter Command Center
              </h1>
              <p className="text-xs sm:text-sm text-[#A0A6B0] max-w-xl font-['Poppins',sans-serif]">
                Create new tournaments, configure registration dates, open/close registrations dynamically, tailor form required fields, and publish podium standings.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 z-10">
              <button onClick={() => openCreateModal()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition shadow-lg shadow-[#D4AF7C]/25 cursor-pointer active:scale-95">
                <Plus className="w-4 h-4" />
                <span>Create Tournament</span>
              </button>
              <button onClick={() => setActiveTab('roster')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-[#F5F5F5] bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 transition cursor-pointer">
                <Download className="w-3.5 h-3.5 text-[#D4AF7C]" />
                <span>View Roster & CSV</span>
              </button>
            </div>
          </div>

          {/* 4 Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B0]">Total Tournaments</p>
                <p className="text-2xl font-black text-[#F5F5F5] mt-1 font-['Montserrat',sans-serif]">{tournaments.length} <span className="text-xs text-[#A0A6B0] font-normal">Events</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C]"><Trophy className="w-6 h-6" /></div>
            </div>
            <div className="p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B0]">Registration Open</p>
                <p className="text-2xl font-black text-emerald-400 mt-1 font-['Montserrat',sans-serif]">{tournaments.filter(t => t.status === 'open').length} <span className="text-xs text-[#A0A6B0] font-normal">Live</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"><CheckCircle2 className="w-6 h-6" /></div>
            </div>
            <div className="p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B0]">Total Registrations</p>
                <p className="text-2xl font-black text-[#F5F5F5] mt-1 font-['Montserrat',sans-serif]">{participants.length} <span className="text-xs text-[#A0A6B0] font-normal">Players</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400"><Users className="w-6 h-6" /></div>
            </div>
            <div className="p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B0]">Data Persistence</p>
                <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span>PostgreSQL Sync</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400"><Database className="w-6 h-6" /></div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'tournaments', label: `Tournaments CMS (${tournaments.length})`, icon: Trophy },
            { id: 'roster', label: `Player Roster (${participants.length})`, icon: Users },
            { id: 'pairings', label: 'Swiss Pairings & Clocks', icon: Swords },
            { id: 'team_pairings', label: 'Team Swiss Arena', icon: Shield },
            { id: 'results', label: 'Prizes & Podiums', icon: Award },
            { id: 'certificates', label: 'Award Certificates', icon: Award },
            { id: 'leaderboard', label: 'Leaderboard & Chess.com', icon: Crown },
            { id: 'announcements', label: 'Notice Board CMS', icon: Bell },
            { id: 'team', label: 'Council & Team', icon: Users },
            { id: 'gallery', label: 'Photo Gallery', icon: Camera },
            { id: 'media', label: 'Netlify Blobs Media', icon: Cloud },
            { id: 'settings', label: 'Supabase Hub', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/20' : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
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
      </main>

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
