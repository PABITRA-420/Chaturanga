"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Tournament, 
  TournamentStatus, 
  Participant,
  TournamentPodiumItem,
  DEFAULT_FORM_FIELDS 
} from '@/types/tournament';
import { createSupabaseClient } from '@/lib/supabase/client';

export interface AdminUser {
  username?: string;
  email?: string;
  role?: string;
  fullName?: string;
  authMethod?: string;
}

export interface EditorDraft {
  formData: Partial<Tournament>;
  editingTournamentId: string | null;
  editorActiveTab: 'basics' | 'registration' | 'form' | 'rules';
}

export function useAdminManagement() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'cockpit' | 'tournaments' | 'roster' | 'pairings' | 'team_pairings' | 'results' | 'certificates' | 'leaderboard' | 'announcements' | 'team' | 'gallery' | 'media' | 'settings'>('cockpit');

  // Tournaments state
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [togglingVisibilityId, setTogglingVisibilityId] = useState<string | null>(null);

  // Tournament Editor Modal state
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  // Editor Draft state (persisted when switching to media or closing modal without saving)
  const [editorDraft, setEditorDraft] = useState<EditorDraft | null>(null);

  // Archive Modal state
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archivingTournament, setArchivingTournament] = useState<Tournament | null>(null);

  // Participants state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantStats, setParticipantStats] = useState<{
    total: number;
    checkedIn: number;
    confirmed: number;
    byTournament: Record<string, { total: number; checkedIn: number; confirmed: number }>;
  } | null>(null);

  // Load tournaments from API
  const loadTournaments = useCallback(async () => {
    try {
      const res = await fetch('/api/tournaments?includeHidden=true');
      const data = await res.json();
      if (data.success && data.tournaments) {
        setTournaments(data.tournaments);
      }
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
  }, []);

  // Load registrations from API
  const loadRegistrations = useCallback(async () => {
    setLoadingParticipants(true);
    try {
      const res = await fetch('/api/registrations');
      const data = await res.json();
      if (data.success && Array.isArray(data.registrations)) {
        const mapped: Participant[] = data.registrations.map((r: any, idx: number) => ({
          id: r.ticketId || `p-${idx}`,
          ticketId: r.ticketId,
          name: r.fullName || r.name || 'Unnamed Player',
          rollNumber: r.rollNumber || 'N/A',
          college: r.institution || r.college || 'Jalpaiguri Government Engineering College',
          department: r.department || 'General',
          year: r.year || 'Undergraduate',
          email: r.email || '',
          phone: r.phone || '',
          ratingCategory: r.ratingCategory || 'Club Player (1200 - 1600)',
          chessPlatform: r.chessPlatform || null,
          chessUsername: r.chessUsername || 'N/A',
          fideId: r.fideId || 'Unrated',
          registeredAt: r.registeredAt || new Date().toISOString(),
          verified: r.checkInStatus === 'checked_in',
          checkInStatus: r.checkInStatus || 'confirmed',
          tournament: r.tournament || 'Chess Tournament',
          tournamentId: r.tournamentId || '',
          customAnswers: r.customAnswers || {}
        }));
        setParticipants(mapped);
        if (data.stats) {
          setParticipantStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setLoadingParticipants(false);
    }
  }, []);

  // Verify authentication on mount
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (!data.authenticated) {
          router.replace('/admin/login');
          return;
        }
        setAdminUser(data.user);
        loadTournaments();
        loadRegistrations();
      } catch {
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    verifyAuth();
  }, [router, loadTournaments, loadRegistrations]);

  // Supabase Realtime Listener
  useEffect(() => {
    let channel: any = null;
    try {
      const supabase = createSupabaseClient();
      channel = supabase
        .channel('admin-dashboard-live-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tournaments' },
          () => {
            loadTournaments();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'registrations' },
          () => {
            loadTournaments();
            loadRegistrations();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription notice:', err);
    }

    return () => {
      if (channel) {
        try {
          const supabase = createSupabaseClient();
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [loadTournaments, loadRegistrations]);

  // Logout
  const handleLogout = async () => {
    try {
      try {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
      } catch {}
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
    }
  };

  // 1-Click Quick Toggle Registration Status (Open <-> Closed)
  const handleToggleStatus = async (tournament: Tournament) => {
    const nextStatus: TournamentStatus = tournament.status === 'open' ? 'closed' : 'open';
    setIsUpdatingStatus(tournament.id);

    try {
      const res = await fetch(`/api/tournaments/${tournament.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success && data.tournament) {
        setTournaments(prev => prev.map(t => t.id === tournament.id ? data.tournament : t));
      }
    } catch (err) {
      console.error('Status toggle failed:', err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Toggle Tournament Visibility (Live vs Hidden)
  const handleToggleVisibility = async (tournament: Tournament) => {
    const nextVisible = tournament.isVisible === false;
    setTogglingVisibilityId(tournament.id);

    try {
      const res = await fetch(`/api/tournaments/${tournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: nextVisible })
      });
      const data = await res.json();
      if (data.success && data.tournament) {
        setTournaments(prev => prev.map(t => t.id === tournament.id ? data.tournament : t));
      }
    } catch (err) {
      console.error('Visibility toggle failed:', err);
    } finally {
      setTogglingVisibilityId(null);
    }
  };

  // Delete Tournament
  const handleDeleteTournament = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTournaments(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete tournament:', err);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingTournament(null);
    setIsEditorModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (t: Tournament) => {
    setEditingTournament(t);
    setIsEditorModalOpen(true);
  };

  // Close Editor Modal
  const closeEditorModal = () => {
    setIsEditorModalOpen(false);
  };

  // Save Tournament (Create or Update)
  const handleSaveTournament = async (formData: Partial<Tournament>) => {
    if (editingTournament?.id) {
      // Update
      const res = await fetch(`/api/tournaments/${editingTournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update tournament.');
      setTournaments(prev => prev.map(t => t.id === editingTournament.id ? data.tournament : t));
    } else {
      // Create
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create tournament.');
      setTournaments(prev => [data.tournament, ...prev]);
    }
    setEditorDraft(null);
    setIsEditorModalOpen(false);
  };

  // Open Archive Modal
  const openArchiveModal = (t: Tournament) => {
    setArchivingTournament(t);
    setIsArchiveModalOpen(true);
  };

  // Close Archive Modal
  const closeArchiveModal = () => {
    setIsArchiveModalOpen(false);
    setArchivingTournament(null);
  };

  // Submit Archive Tournament
  const handleArchiveTournament = async (tournamentId: string, archivePayload: {
    status: 'completed';
    isPast: boolean;
    totalParticipants: number;
    summary: string;
    podium: TournamentPodiumItem[];
  }) => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(archivePayload)
      });
      const data = await res.json();
      if (data.success && data.tournament) {
        setTournaments(prev => prev.map(t => t.id === tournamentId ? data.tournament : t));
        setIsArchiveModalOpen(false);
        setArchivingTournament(null);
      }
    } catch (err) {
      console.error('Failed to move tournament to past:', err);
      throw err;
    }
  };

  // Toggle Check-in status of participant
  const handleCheckIn = async (ticketId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'checked_in' ? 'confirmed' : 'checked_in';

    // Optimistic UI update
    setParticipants(prev =>
      prev.map(p => p.ticketId === ticketId ? { 
        ...p, 
        checkInStatus: nextStatus as any,
        verified: nextStatus === 'checked_in' 
      } : p)
    );

    try {
      const res = await fetch('/api/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        loadRegistrations();
      }
    } catch (err) {
      console.error('Check-in toggle failed:', err);
      loadRegistrations();
    }
  };

  // Delete participant registration
  const handleDeleteParticipant = async (ticketId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove registration ${ticketId} for "${name}"? This will free up a tournament slot.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/registrations?ticketId=${encodeURIComponent(ticketId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setParticipants(prev => prev.filter(p => p.ticketId !== ticketId));
        loadTournaments();
        loadRegistrations();
      } else {
        alert(data.error || 'Failed to delete player registration.');
      }
    } catch (err) {
      console.error('Failed to delete player:', err);
    }
  };

  // Add Walk-in Participant
  const handleAddWalkIn = async (playerData: any): Promise<boolean> => {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playerData)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to register walk-in player');
    }

    await loadRegistrations();
    await loadTournaments();
    return true;
  };

  // Draft & Media integration helpers
  const handleNavigateToMedia = () => {
    setIsEditorModalOpen(false);
    setActiveTab('media');
  };

  const handleReturnToEditor = (bannerUrl?: string) => {
    if (editorDraft) {
      const updatedDraft = {
        ...editorDraft,
        formData: {
          ...editorDraft.formData,
          ...(bannerUrl ? { bannerUrl } : {})
        }
      };
      setEditorDraft(updatedDraft);
      if (updatedDraft.editingTournamentId) {
        const found = tournaments.find(t => t.id === updatedDraft.editingTournamentId);
        setEditingTournament(found || null);
      } else {
        setEditingTournament(null);
      }
    }
    setActiveTab('tournaments');
    setIsEditorModalOpen(true);
  };

  return {
    loading,
    adminUser,
    activeTab,
    setActiveTab,
    tournaments,
    setTournaments,
    participants,
    loadingParticipants,
    participantStats,
    isUpdatingStatus,
    togglingVisibilityId,
    // Tournament modal state & actions
    isEditorModalOpen,
    editingTournament,
    openCreateModal,
    openEditModal,
    closeEditorModal,
    handleSaveTournament,
    handleDeleteTournament,
    handleToggleStatus,
    handleToggleVisibility,
    // Archive modal state & actions
    isArchiveModalOpen,
    archivingTournament,
    openArchiveModal,
    closeArchiveModal,
    handleArchiveTournament,
    // Participant actions
    loadTournaments,
    loadRegistrations,
    handleCheckIn,
    handleDeleteParticipant,
    handleAddWalkIn,
    // Draft & media integration
    editorDraft,
    setEditorDraft,
    handleNavigateToMedia,
    handleReturnToEditor,
    // Auth actions
    handleLogout
  };
}
