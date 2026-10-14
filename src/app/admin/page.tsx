"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChaturangaLogo from '@/components/ChaturangaLogo';
import { 
  Tournament, 
  TournamentStatus, 
  FormFieldConfig, 
  CustomField, 
  TournamentPodiumItem,
  DEFAULT_FORM_FIELDS 
} from '@/types/tournament';
import { createSupabaseClient } from '@/lib/supabase/client';
import { 
  ShieldCheck, 
  Users, 
  Trophy, 
  LogOut, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  RefreshCw, 
  UserPlus, 
  Sparkles, 
  Database, 
  AlertTriangle,
  Swords,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  FileText,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Radio,
  Award,
  Settings,
  HelpCircle,
  Crown,
  Bell,
  Zap
} from 'lucide-react';
import AdminLeaderboardTab from '@/components/admin/AdminLeaderboardTab';
import AdminResultsTab from '@/components/admin/AdminResultsTab';
import AdminAnnouncementsTab from '@/components/admin/AdminAnnouncementsTab';

interface Participant {
  id: string;
  ticketId: string;
  name: string;
  rollNumber: string;
  college: string;
  department: string;
  year?: string;
  email?: string;
  phone?: string;
  ratingCategory: string;
  chessUsername: string;
  fideId: string;
  registeredAt: string;
  verified: boolean;
  checkInStatus: 'registered' | 'confirmed' | 'checked_in';
  tournamentId: string;
  tournament: string;
  customAnswers?: Record<string, string>;
}

const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: "p-1",
    ticketId: "CHTR-2026-A48B2",
    name: "Arindam Mukherjee",
    rollNumber: "22101104012",
    college: "Jalpaiguri Government Engineering College",
    department: "CSE",
    ratingCategory: "FIDE Rated (> 1600)",
    chessUsername: "ArinKing99",
    fideId: "5029411",
    registeredAt: "2026-10-12 14:32",
    verified: true,
    checkInStatus: 'checked_in',
    tournamentId: "inter-college-2026",
    tournament: "Chaturanga Annual Inter-College Chess Championship 2026"
  },
  {
    id: "p-2",
    ticketId: "CHTR-2026-C89K1",
    name: "Debayan Roy",
    rollNumber: "23101103045",
    college: "Jalpaiguri Government Engineering College",
    department: "ECE",
    ratingCategory: "Club Player (1200 - 1600)",
    chessUsername: "KnightRiderJGEC",
    fideId: "Unrated",
    registeredAt: "2026-10-12 16:45",
    verified: true,
    checkInStatus: 'checked_in',
    tournamentId: "inter-college-2026",
    tournament: "Chaturanga Annual Inter-College Chess Championship 2026"
  },
  {
    id: "p-3",
    ticketId: "CHTR-2026-F12P9",
    name: "Sreya Chakraborty",
    rollNumber: "21101101008",
    college: "Siliguri Institute of Technology",
    department: "IT",
    ratingCategory: "Intermediate (1400 - 1800)",
    chessUsername: "SreyaChess_Tactics",
    fideId: "5038190",
    registeredAt: "2026-10-13 09:15",
    verified: false,
    checkInStatus: 'confirmed',
    tournamentId: "inter-college-2026",
    tournament: "Chaturanga Annual Inter-College Chess Championship 2026"
  },
  {
    id: "p-4",
    ticketId: "CHTR-2026-M44Q7",
    name: "Subhajit Pal",
    rollNumber: "24101105022",
    college: "Jalpaiguri Government Engineering College",
    department: "EE",
    ratingCategory: "Beginner / Freshmen (< 1200)",
    chessUsername: "Subho_Bishop",
    fideId: "Unrated",
    registeredAt: "2026-10-13 11:20",
    verified: false,
    checkInStatus: 'confirmed',
    tournamentId: "inter-college-2026",
    tournament: "Chaturanga Annual Inter-College Chess Championship 2026"
  },
  {
    id: "p-5",
    ticketId: "CHTR-2026-X99T3",
    name: "Aniket Sen",
    rollNumber: "22101102031",
    college: "North Bengal University",
    department: "Mathematics",
    ratingCategory: "FIDE Rated (> 1600)",
    chessUsername: "AniketTactician",
    fideId: "5018322",
    registeredAt: "2026-10-13 13:04",
    verified: true,
    checkInStatus: 'checked_in',
    tournamentId: "state-rapid-2026",
    tournament: "North Bengal State Rapid Rating Open"
  }
];

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ 
    username?: string; 
    email?: string; 
    role?: string; 
    fullName?: string; 
    authMethod?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'roster' | 'results' | 'leaderboard' | 'announcements' | 'settings'>('tournaments');

  // Tournaments state
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentSearch, setTournamentSearch] = useState('');
  const [tournamentStatusFilter, setTournamentStatusFilter] = useState<string>('all');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Tournament Editor / Creator Modal state
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<string | null>(null);
  const [editorActiveTab, setEditorActiveTab] = useState<'basics' | 'registration' | 'form' | 'rules'>('basics');
  const [savingTournament, setSavingTournament] = useState(false);
  const [editorError, setEditorError] = useState('');

  // Form builder editor state
  const [formData, setFormData] = useState<Partial<Tournament>>({
    title: '',
    date: '',
    targetDate: '',
    time: '10:00 AM – 06:00 PM IST',
    venue: 'Main Auditorium, JGEC Campus',
    format: '7 Rounds Swiss System • Rapid (15m + 10s)',
    prizePool: '₹25,000 + Trophies',
    slots: '128 Max Slots',
    maxSlots: 128,
    isFeatured: false,
    description: '',
    status: 'open',
    registrationStartDate: '',
    registrationEndDate: '',
    entryFee: 'Free for JGEC • ₹100 External',
    arbiterName: 'IA Dr. P. K. Sen / Chief Arbiter JGEC',
    contactEmail: 'tournaments@chaturanga-jgec.ac.in',
    contactPhone: '+91 94340 12345',
    fairPlayNotice: 'Standard FIDE Anti-Cheating and Digital Clock Regulations apply.',
    formConfig: JSON.parse(JSON.stringify(DEFAULT_FORM_FIELDS)),
    customFields: []
  });

  // Custom question prompt state
  const [newCustomQuestion, setNewCustomQuestion] = useState({
    label: '',
    type: 'text' as 'text' | 'select' | 'checkbox',
    required: false,
    optionsString: ''
  });
  const [showAddQuestionRow, setShowAddQuestionRow] = useState(false);

  // Archive / Move to Past Modal
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archivingTournament, setArchivingTournament] = useState<Tournament | null>(null);
  const [podiumData, setPodiumData] = useState<{
    summary: string;
    totalParticipants: number;
    goldName: string; goldDept: string; goldScore: string; goldPrize: string;
    silverName: string; silverDept: string; silverScore: string; silverPrize: string;
    bronzeName: string; bronzeDept: string; bronzeScore: string; bronzePrize: string;
  }>({
    summary: '',
    totalParticipants: 64,
    goldName: '', goldDept: '', goldScore: '', goldPrize: '',
    silverName: '', silverDept: '', silverScore: '', silverPrize: '',
    bronzeName: '', bronzeDept: '', bronzeScore: '', bronzePrize: ''
  });

  // Roster state & real backend persistence
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantStats, setParticipantStats] = useState<{
    total: number;
    checkedIn: number;
    confirmed: number;
    byTournament: Record<string, { total: number; checkedIn: number; confirmed: number }>;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'confirmed'>('all');
  const [togglingTicketId, setTogglingTicketId] = useState<string | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [inspectingPlayer, setInspectingPlayer] = useState<Participant | null>(null);

  // Manual player walk-in modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [savingWalkIn, setSavingWalkIn] = useState(false);
  const [walkInError, setWalkInError] = useState('');
  const [walkInImmediateCheckIn, setWalkInImmediateCheckIn] = useState(true);
  const [walkInCustomAnswers, setWalkInCustomAnswers] = useState<Record<string, string>>({});
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    rollNumber: '',
    college: 'Jalpaiguri Government Engineering College',
    department: 'Computer Science & Engineering',
    year: '2nd Year',
    email: '',
    phone: '',
    ratingCategory: 'Club Player (1200 - 1600)',
    chessUsername: '',
    fideId: '',
    tournamentId: 'inter-college-2026'
  });

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
  }, [router]);

  // Load tournaments from API (include hidden/draft events for admin)
  const loadTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments?includeHidden=true');
      const data = await res.json();
      if (data.success && data.tournaments) {
        setTournaments(data.tournaments);
      }
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
  };

  // Supabase Realtime Listener for Instant Arbiter Dashboard Sync
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
  }, []);

  // 1-Click Quick Toggle Tournament Visibility (Live vs Hidden/Draft)
  const [togglingVisibilityId, setTogglingVisibilityId] = useState<string | null>(null);
  const handleToggleVisibility = async (tournament: Tournament) => {
    const nextVisible = tournament.isVisible === false ? true : false;
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

  // Load registrations from API
  const loadRegistrations = async () => {
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
  };

  // Handle Logout
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

  // Open Create Tournament Modal
  const handleOpenCreateModal = () => {
    setEditingTournamentId(null);
    setEditorError('');
    setEditorActiveTab('basics');
    const defaultDate = new Date(Date.now() + 86400000 * 21);
    setFormData({
      title: '',
      date: defaultDate.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
      targetDate: defaultDate.toISOString().slice(0, 16),
      time: '10:00 AM – 06:00 PM IST',
      venue: 'Main Auditorium, JGEC Campus',
      format: '7 Rounds Swiss System • Rapid (15m + 10s)',
      prizePool: '₹25,000 + Trophies',
      slots: '128 Max Slots',
      maxSlots: 128,
      isFeatured: false,
      description: 'Official collegiate chess tournament organized by Chaturanga JGEC.',
      status: 'open',
      registrationStartDate: new Date().toISOString().slice(0, 16),
      registrationEndDate: defaultDate.toISOString().slice(0, 16),
      entryFee: 'Free for JGEC • ₹100 External',
      arbiterName: 'IA Dr. P. K. Sen / Chief Arbiter JGEC',
      contactEmail: 'tournaments@chaturanga-jgec.ac.in',
      contactPhone: '+91 94340 12345',
      fairPlayNotice: 'Standard FIDE Anti-Cheating and Digital Clock Regulations apply. Mobile devices prohibited in tournament hall.',
      formConfig: JSON.parse(JSON.stringify(DEFAULT_FORM_FIELDS)),
      customFields: []
    });
    setIsEditorModalOpen(true);
  };

  // Open Edit Tournament Modal
  const handleOpenEditModal = (t: Tournament, defaultTab: 'basics' | 'form' = 'basics') => {
    setEditingTournamentId(t.id);
    setEditorError('');
    setEditorActiveTab(defaultTab);
    setFormData({
      ...t,
      formConfig: t.formConfig && t.formConfig.length > 0 ? t.formConfig : JSON.parse(JSON.stringify(DEFAULT_FORM_FIELDS)),
      customFields: t.customFields || []
    });
    setIsEditorModalOpen(true);
  };

  // Save Tournament (Create or Update)
  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditorError('');

    if (!formData.title?.trim() || !formData.venue?.trim()) {
      setEditorError('Tournament Title and Venue are required.');
      return;
    }

    setSavingTournament(true);

    try {
      if (editingTournamentId) {
        // Update
        const res = await fetch(`/api/tournaments/${editingTournamentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update tournament.');
        setTournaments(prev => prev.map(t => t.id === editingTournamentId ? data.tournament : t));
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
      setIsEditorModalOpen(false);
    } catch (err: any) {
      setEditorError(err.message || 'Error saving tournament.');
    } finally {
      setSavingTournament(false);
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

  // Form Field Toggle Helper
  const handleToggleFormField = (fieldId: string, property: 'enabled' | 'required') => {
    setFormData(prev => {
      const configs = prev.formConfig ? [...prev.formConfig] : [...DEFAULT_FORM_FIELDS];
      const index = configs.findIndex(f => f.id === fieldId);
      if (index === -1) return prev;

      const current = configs[index];
      const updated = { ...current };

      if (property === 'enabled') {
        updated.enabled = !current.enabled;
        if (!updated.enabled) updated.required = false; // Cannot require disabled field
      } else if (property === 'required') {
        updated.required = !current.required;
        if (updated.required) updated.enabled = true; // Auto-enable if required
      }

      configs[index] = updated;
      return { ...prev, formConfig: configs };
    });
  };

  // Add Custom Field to Form
  const handleAddCustomQuestion = () => {
    if (!newCustomQuestion.label.trim()) return;

    const customId = `custom_${Date.now()}`;
    const options = newCustomQuestion.type === 'select'
      ? newCustomQuestion.optionsString.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const newField: CustomField = {
      id: customId,
      label: newCustomQuestion.label.trim(),
      type: newCustomQuestion.type,
      required: newCustomQuestion.required,
      options
    };

    setFormData(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), newField]
    }));

    setNewCustomQuestion({ label: '', type: 'text', required: false, optionsString: '' });
    setShowAddQuestionRow(false);
  };

  // Remove Custom Field
  const handleRemoveCustomQuestion = (customId: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: (prev.customFields || []).filter(f => f.id !== customId)
    }));
  };

  // Open Archive / Move to Past Modal
  const handleOpenArchiveModal = (t: Tournament) => {
    setArchivingTournament(t);
    setPodiumData({
      summary: `${t.title} successfully concluded with fierce collegiate competition across rounds.`,
      totalParticipants: t.registeredCount || 64,
      goldName: '', goldDept: 'CSE', goldScore: '6.5 / 7', goldPrize: 'Champion Trophy + Cash',
      silverName: '', silverDept: 'ECE', silverScore: '6.0 / 7', silverPrize: 'Silver Shield',
      bronzeName: '', bronzeDept: 'ME', bronzeScore: '5.5 / 7', bronzePrize: 'Bronze Medal'
    });
    setIsArchiveModalOpen(true);
  };

  // Submit Move to Past
  const handleArchiveTournamentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivingTournament) return;

    const podium: TournamentPodiumItem[] = [
      { rank: '1st (Gold)', name: podiumData.goldName || 'Champion Player', dept: podiumData.goldDept, score: podiumData.goldScore, prize: podiumData.goldPrize },
      { rank: '2nd (Silver)', name: podiumData.silverName || 'Runner Up', dept: podiumData.silverDept, score: podiumData.silverScore, prize: podiumData.silverPrize },
      { rank: '3rd (Bronze)', name: podiumData.bronzeName || 'Third Place', dept: podiumData.bronzeDept, score: podiumData.bronzeScore, prize: podiumData.bronzePrize }
    ];

    try {
      const res = await fetch(`/api/tournaments/${archivingTournament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          isPast: true,
          totalParticipants: Number(podiumData.totalParticipants),
          summary: podiumData.summary,
          podium
        })
      });
      const data = await res.json();
      if (data.success && data.tournament) {
        setTournaments(prev => prev.map(t => t.id === archivingTournament.id ? data.tournament : t));
        setIsArchiveModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to move tournament to past:', err);
    }
  };

  // Toggle Check-in status of participant (1-click Arbiter Desk)
  const toggleVerify = async (ticketId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'checked_in' ? 'confirmed' : 'checked_in';
    setTogglingTicketId(ticketId);

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
      } else {
        loadRegistrations();
      }
    } catch (err) {
      console.error('Check-in toggle failed:', err);
      loadRegistrations();
    } finally {
      setTogglingTicketId(null);
    }
  };

  // Delete participant registration
  const handleDeletePlayer = async (ticketId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove registration ${ticketId} for "${name}"? This will free up a tournament slot.`)) {
      return;
    }

    setDeletingTicketId(ticketId);
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
    } finally {
      setDeletingTicketId(null);
    }
  };

  // Export CSV (Swiss-Manager / FIDE pairing compatible)
  const handleExportCSV = () => {
    const isFiltered = selectedTournament !== 'all';
    const targetTournament = tournaments.find(t => t.id === selectedTournament || t.title === selectedTournament);
    const tournamentName = targetTournament ? targetTournament.title : 'All_Tournaments';
    const cleanFileName = tournamentName.replace(/[^a-zA-Z0-9_-]/g, '_');

    const headers = [
      'Ticket ID',
      'Full Name',
      'Roll Number',
      'Institution',
      'Department',
      'Academic Year',
      'Email',
      'Phone',
      'Rating Category',
      'Chess Username',
      'FIDE ID',
      'Tournament',
      'Check-in Status',
      'Registered Date',
      'Custom Answers'
    ];

    const dataRows = (isFiltered ? filteredParticipants : participants).map(p => {
      const customStr = p.customAnswers 
        ? Object.entries(p.customAnswers).map(([k, v]) => `${k}: ${v}`).join('; ')
        : '';
      return [
        p.ticketId,
        p.name,
        p.rollNumber,
        p.college,
        p.department,
        p.year || 'N/A',
        p.email || 'N/A',
        p.phone || 'N/A',
        p.ratingCategory,
        p.chessUsername || 'N/A',
        p.fideId || 'Unrated',
        p.tournament,
        p.checkInStatus === 'checked_in' ? 'CHECKED_IN (PRESENT)' : 'CONFIRMED (AWAITING DESK)',
        p.registeredAt,
        customStr
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...dataRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chaturanga_${cleanFileName}_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Manual Player (Walk-in Desk)
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.rollNumber) return;

    setSavingWalkIn(true);
    setWalkInError('');

    try {
      const targetTournamentObj = tournaments.find(t => t.id === newPlayer.tournamentId || t.title === newPlayer.tournamentId);
      const tournamentTitle = targetTournamentObj ? targetTournamentObj.title : newPlayer.tournamentId;

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newPlayer.name,
          rollNumber: newPlayer.rollNumber,
          institution: newPlayer.college,
          department: newPlayer.department,
          year: newPlayer.year || '1st Year',
          email: newPlayer.email || `${newPlayer.rollNumber}@jgec.ac.in`,
          phone: newPlayer.phone || '9876543210',
          ratingCategory: newPlayer.ratingCategory,
          chessUsername: newPlayer.chessUsername || 'N/A',
          fideId: newPlayer.fideId || 'Unrated',
          tournament: tournamentTitle,
          customAnswers: walkInCustomAnswers,
          checkInStatus: walkInImmediateCheckIn ? 'checked_in' : 'confirmed'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register walk-in player');
      }

      setIsAddModalOpen(false);
      setWalkInCustomAnswers({});
      setNewPlayer({
        name: '',
        rollNumber: '',
        college: 'Jalpaiguri Government Engineering College',
        department: 'Computer Science & Engineering',
        year: '2nd Year',
        email: '',
        phone: '',
        ratingCategory: 'Club Player (1200 - 1600)',
        chessUsername: '',
        fideId: '',
        tournamentId: tournaments[0]?.id || 'inter-college-2026'
      });
      loadRegistrations();
      loadTournaments();
    } catch (err: any) {
      setWalkInError(err.message || 'Error creating walk-in player');
    } finally {
      setSavingWalkIn(false);
    }
  };

  // Filter participants
  const filteredParticipants = participants.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      p.name.toLowerCase().includes(q) ||
      p.rollNumber.toLowerCase().includes(q) ||
      p.ticketId.toLowerCase().includes(q) ||
      p.chessUsername.toLowerCase().includes(q) ||
      p.college.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    );

    const matchesTournament = 
      selectedTournament === 'all' || 
      p.tournamentId === selectedTournament ||
      p.tournament.toLowerCase() === selectedTournament.toLowerCase() ||
      (tournaments.find(t => t.id === selectedTournament)?.title.toLowerCase() === p.tournament.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'checked_in' && p.checkInStatus === 'checked_in') ||
      (statusFilter === 'confirmed' && p.checkInStatus !== 'checked_in');

    return matchesSearch && matchesTournament && matchesStatus;
  });

  // Filter tournaments
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(tournamentSearch.toLowerCase()) ||
      t.venue.toLowerCase().includes(tournamentSearch.toLowerCase()) ||
      t.format.toLowerCase().includes(tournamentSearch.toLowerCase());

    if (tournamentStatusFilter === 'all') return matchesSearch;
    if (tournamentStatusFilter === 'open') return matchesSearch && t.status === 'open';
    if (tournamentStatusFilter === 'closed') return matchesSearch && t.status === 'closed';
    if (tournamentStatusFilter === 'upcoming') return matchesSearch && !t.isPast && t.status !== 'completed';
    if (tournamentStatusFilter === 'completed') return matchesSearch && (t.isPast || t.status === 'completed');

    return matchesSearch;
  });

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
          
          {/* Brand */}
          <div className="flex items-center gap-3.5">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/60 border border-[#D4AF7C]/40 p-1 flex items-center justify-center shadow-md shadow-[#D4AF7C]/15">
                <ChaturangaLogo className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Montserrat',sans-serif] font-black tracking-widest text-[#F5F5F5] text-base leading-none">
                  CHATURANGA
                </span>
                <span className="text-[10px] font-semibold text-[#D4AF7C] tracking-[0.2em] uppercase mt-0.5">
                  CHIEF ARBITER CONSOLE
                </span>
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

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition cursor-pointer"
            >
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
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition shadow-lg shadow-[#D4AF7C]/25 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create Tournament</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-[#F5F5F5] bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF7C]" />
                <span>Export Roster CSV</span>
              </button>
            </div>
          </div>

          {/* 4 Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B0]">Total Tournaments</p>
                <p className="text-2xl font-black text-[#F5F5F5] mt-1 font-['Montserrat',sans-serif]">
                  {tournaments.length} <span className="text-xs text-[#A0A6B0] font-normal">Events</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C]">
                <Trophy className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B0]">Registration Open</p>
                <p className="text-2xl font-black text-emerald-400 mt-1 font-['Montserrat',sans-serif]">
                  {tournaments.filter(t => t.status === 'open').length} <span className="text-xs text-[#A0A6B0] font-normal">Live</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B0]">Total Registrations</p>
                <p className="text-2xl font-black text-[#F5F5F5] mt-1 font-['Montserrat',sans-serif]">
                  {participants.length} <span className="text-xs text-[#A0A6B0] font-normal">Players</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#10141C] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B0]">Data Persistence</p>
                <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>tournaments.json Sync</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Database className="w-6 h-6" />
              </div>
            </div>

          </div>
        </section>

        {/* Navigation Tabs (Scrollable on mobile) */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'tournaments'
                ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/20'
                : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tournaments CMS ({tournaments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'roster'
                ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/20'
                : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Player Roster ({filteredParticipants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'results'
                ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/20'
                : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Prizes &amp; Podiums</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'leaderboard'
                ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/20'
                : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Leaderboard &amp; Chess.com</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'announcements'
                ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/20'
                : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notice Board CMS</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/20'
                : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Hub</span>
          </button>
        </div>

        {/* TAB 1: TOURNAMENT CMS & SUPERIOR POWER CONTROLS */}
        {activeTab === 'tournaments' && (
          <div className="space-y-6">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#10141C] border border-white/10">
              
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#A0A6B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search tournaments by title, venue..."
                  value={tournamentSearch}
                  onChange={(e) => setTournamentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/50 focus:outline-none focus:border-[#D4AF7C]"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {['all', 'open', 'closed', 'upcoming', 'completed'].map(statusKey => (
                  <button
                    key={statusKey}
                    onClick={() => setTournamentStatusFilter(statusKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                      tournamentStatusFilter === statusKey
                        ? 'bg-[#D4AF7C]/20 border border-[#D4AF7C]/50 text-[#D4AF7C]'
                        : 'bg-[#080B0F] border border-white/10 text-[#A0A6B0] hover:text-[#F5F5F5]'
                    }`}
                  >
                    {statusKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Tournament Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredTournaments.length === 0 ? (
                <div className="col-span-full py-16 text-center text-[#A0A6B0] rounded-2xl bg-[#10141C] border border-white/10">
                  No tournaments found. Click "Create Tournament" to add your first event.
                </div>
              ) : (
                filteredTournaments.map(tournament => {
                  const isOpen = tournament.status === 'open';
                  const isClosed = tournament.status === 'closed';
                  const isCompleted = tournament.status === 'completed';

                  return (
                    <div 
                      key={tournament.id}
                      className="p-6 rounded-3xl bg-[#10141C] border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col justify-between space-y-5 shadow-xl relative overflow-hidden group"
                    >
                      {/* Top status & quick actions */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          
                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            {isOpen ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>REGISTRATION OPEN</span>
                              </span>
                            ) : isClosed ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30">
                                <X className="w-3.5 h-3.5" />
                                <span>REGISTRATION CLOSED</span>
                              </span>
                            ) : isCompleted ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30">
                                <Trophy className="w-3.5 h-3.5" />
                                <span>COMPLETED (PAST EVENT)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="uppercase">{tournament.status}</span>
                              </span>
                            )}

                            {tournament.isFeatured && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#D4AF7C] bg-[#D4AF7C]/15 border border-[#D4AF7C]/40">
                                ★ Featured
                              </span>
                            )}

                            {tournament.isVisible === false ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/40 inline-flex items-center gap-1">
                                <EyeOff className="w-3 h-3" />
                                <span>Hidden Draft</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 inline-flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>Live on Site</span>
                              </span>
                            )}
                          </div>

                          {/* Quick 1-Click Open/Close Toggle Button */}
                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(tournament)}
                              disabled={isUpdatingStatus === tournament.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                                isOpen
                                  ? 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30'
                                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                              }`}
                              title={isOpen ? "Click to close registration immediately" : "Click to open registration immediately"}
                            >
                              {isUpdatingStatus === tournament.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : isOpen ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-emerald-400" />
                                  <span>Close Reg</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-red-400" />
                                  <span>Open Reg</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Title & Format */}
                        <div>
                          <h3 className="font-['Montserrat',sans-serif] text-lg font-bold text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors">
                            {tournament.title}
                          </h3>
                          <p className="text-xs text-[#D4AF7C] font-semibold mt-0.5">
                            {tournament.format}
                          </p>
                        </div>

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-[#A0A6B0] pt-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
                            <span>{tournament.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
                            <span>{tournament.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
                            <span className="truncate">{tournament.venue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0" />
                            <span>{tournament.slots} ({tournament.registeredCount || 0} enrolled)</span>
                          </div>
                        </div>

                        {/* Form Fields summary badge */}
                        <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[#A0A6B0]">
                            Form: {tournament.formConfig?.filter(f => f.enabled).length || 11} fields ({tournament.formConfig?.filter(f => f.required).length || 8} required)
                          </span>
                          {tournament.entryFee && (
                            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[#A0A6B0]">
                              Fee: {tournament.entryFee}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Toolbar (Superior Power) */}
                      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                        
                        <div className="flex items-center gap-1.5">
                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEditModal(tournament, 'basics')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F5F5F5] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#D4AF7C]" />
                            <span>Edit All</span>
                          </button>

                          {/* Edit Registration Form Builder */}
                          <button
                            onClick={() => handleOpenEditModal(tournament, 'form')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F5F5F5] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Form Fields</span>
                          </button>

                          {/* Move to Past / Publish Podium */}
                          {!isCompleted && (
                            <button
                              onClick={() => handleOpenArchiveModal(tournament)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition cursor-pointer"
                              title="Conclude tournament, enter winners and move to Past Events"
                            >
                              <Award className="w-3.5 h-3.5 text-purple-400" />
                              <span>Conclude & Podium</span>
                            </button>
                          )}
                        </div>

                        {/* Right side: Visibility Toggle, Preview link & Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(tournament)}
                            disabled={togglingVisibilityId === tournament.id}
                            className={`p-2 rounded-xl transition cursor-pointer ${
                              tournament.isVisible === false
                                ? 'text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30'
                                : 'text-[#A0A6B0] hover:text-[#D4AF7C] hover:bg-white/5'
                            }`}
                            title={tournament.isVisible === false ? "Currently Hidden from public (Click to make Visible)" : "Currently Live on site (Click to Hide/Draft)"}
                          >
                            {togglingVisibilityId === tournament.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                            ) : tournament.isVisible === false ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>

                          <Link
                            href={`/register?event=${tournament.id}`}
                            target="_blank"
                            className="p-2 rounded-xl text-[#A0A6B0] hover:text-[#D4AF7C] hover:bg-white/5 transition cursor-pointer"
                            title="Test public registration form"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDeleteTournament(tournament.id, tournament.title)}
                            className="p-2 rounded-xl text-[#A0A6B0] hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            title="Delete tournament"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PLAYER ROSTER & MULTI-TOURNAMENT OPERATIONS DESK */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            
            {/* Multi-Tournament Live Operations Grid (Top Overview Cards) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-['Montserrat',sans-serif] text-base sm:text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
                    <Swords className="w-5 h-5 text-[#D4AF7C]" />
                    <span>Concurrent Tournaments • Live Registration Operations</span>
                  </h2>
                  <p className="text-xs text-[#A0A6B0]">
                    Monitor capacity and arbiter desk check-ins across all simultaneously active tournament forms.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadRegistrations()}
                    disabled={loadingParticipants}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-[#A0A6B0] hover:text-white transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF7C] ${loadingParticipants ? 'animate-spin' : ''}`} />
                    <span>Refresh Live Roster</span>
                  </button>
                </div>
              </div>

              {/* Tournament Capacity & Operations Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {tournaments.filter(t => !t.isPast && t.status !== 'completed').map((tourn) => {
                  const matchingPlayers = participants.filter(p => 
                    p.tournamentId === tourn.id || 
                    p.tournament.toLowerCase() === tourn.title.toLowerCase() ||
                    tourn.title.toLowerCase().includes(p.tournament.toLowerCase())
                  );
                  const enrolledCount = Math.max(matchingPlayers.length, tourn.registeredCount || 0);
                  const checkedInCount = matchingPlayers.filter(p => p.checkInStatus === 'checked_in').length;
                  const maxSlots = tourn.maxSlots || 64;
                  const capacityPercent = Math.min(100, Math.round((enrolledCount / maxSlots) * 100));
                  const isSelected = selectedTournament === tourn.id || selectedTournament === tourn.title;

                  const isOpen = tourn.status === 'open';
                  const isClosingSoon = tourn.status === 'closing_soon';
                  const isClosed = tourn.status === 'closed';

                  return (
                    <div
                      key={tourn.id}
                      onClick={() => setSelectedTournament(isSelected ? 'all' : tourn.id)}
                      className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#141A24] via-[#10141C] to-[#0A0D12] border-[#D4AF7C] shadow-lg shadow-[#D4AF7C]/15 ring-1 ring-[#D4AF7C]'
                          : 'bg-[#10141C] border-white/10 hover:border-white/20 hover:bg-[#141924]'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Status Chip & Format */}
                        <div className="flex items-center justify-between gap-2">
                          {isOpen ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>OPEN</span>
                            </span>
                          ) : isClosingSoon ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30">
                              <Flame className="w-3 h-3 text-amber-400" />
                              <span>CLOSING SOON</span>
                            </span>
                          ) : isClosed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30">
                              <X className="w-3 h-3 text-red-400" />
                              <span>CLOSED</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 uppercase">
                              {tourn.status}
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-[#D4AF7C] font-semibold truncate max-w-[120px]">
                            {tourn.entryFee || 'Free'}
                          </span>
                        </div>

                        {/* Tournament Title */}
                        <div>
                          <h4 className="font-['Montserrat',sans-serif] font-bold text-xs sm:text-sm text-[#F5F5F5] line-clamp-1 leading-snug">
                            {tourn.title}
                          </h4>
                          <p className="text-[10px] text-[#A0A6B0] truncate mt-0.5">
                            {tourn.date} • {tourn.venue}
                          </p>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-[#A0A6B0]">
                              Capacity: <strong className="text-white font-mono">{enrolledCount}</strong>/{maxSlots}
                            </span>
                            <span className="font-mono font-bold text-[#D4AF7C]">
                              {capacityPercent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                capacityPercent >= 90
                                  ? 'bg-gradient-to-r from-red-500 to-amber-500'
                                  : capacityPercent >= 70
                                  ? 'bg-gradient-to-r from-amber-500 to-[#D4AF7C]'
                                  : 'bg-gradient-to-r from-emerald-500 to-[#D4AF7C]'
                              }`}
                              style={{ width: `${capacityPercent}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-[#A0A6B0]">
                            {Math.max(0, maxSlots - enrolledCount)} spots remaining
                          </p>
                        </div>
                      </div>

                      {/* Desk Check-in Breakdown & Focus Toggle */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                            ✓ {checkedInCount} In
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-medium border border-amber-500/20">
                            ⏳ {Math.max(0, enrolledCount - checkedInCount)} Pending
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold ${isSelected ? 'text-[#D4AF7C]' : 'text-[#A0A6B0] hover:text-white'}`}>
                          {isSelected ? '★ Focused' : 'Focus →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Filter, Search & Arbiter Actions Toolbar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#10141C] border border-white/10 space-y-4">
              
              {/* Row 1: Search & Action Buttons */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative w-full lg:w-96">
                  <Search className="w-4 h-4 text-[#A0A6B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search player name, roll no, ticket ID, chess handle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/50 focus:outline-none focus:border-[#D4AF7C]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A0A6B0] hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Arbiter Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                  
                  {/* Manual Walk-in Player */}
                  <button
                    onClick={() => {
                      setWalkInError('');
                      setWalkInCustomAnswers({});
                      setIsAddModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition shadow-md shadow-[#D4AF7C]/20 cursor-pointer active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Walk-in Registration</span>
                  </button>

                  {/* Export CSV for Swiss-Manager / FIDE */}
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#F5F5F5] bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 transition cursor-pointer"
                    title="Export formatted CSV compatible with Swiss-Manager and Excel"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D4AF7C]" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Tournament Filter Tabs & Check-in Status Pills */}
              <div className="pt-2 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                
                {/* Tournament Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[11px] font-semibold text-[#A0A6B0] mr-1">Event:</span>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedTournament('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                      selectedTournament === 'all'
                        ? 'bg-[#D4AF7C] text-[#0B0F14] shadow'
                        : 'bg-[#080B0F] text-[#A0A6B0] hover:text-white border border-white/10'
                    }`}
                  >
                    All Events ({participants.length})
                  </button>

                  {tournaments.filter(t => !t.isPast && t.status !== 'completed').map(t => {
                    const count = participants.filter(p => 
                      p.tournamentId === t.id || 
                      p.tournament.toLowerCase() === t.title.toLowerCase() ||
                      t.title.toLowerCase().includes(p.tournament.toLowerCase())
                    ).length;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTournament(t.id)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs truncate max-w-[200px] ${
                          selectedTournament === t.id || selectedTournament === t.title
                            ? 'bg-[#D4AF7C] text-[#0B0F14] font-bold shadow'
                            : 'bg-[#080B0F] text-[#A0A6B0] hover:text-white border border-white/10'
                        }`}
                        title={t.title}
                      >
                        {t.title.split(' ')[0]} {t.title.split(' ')[1] || ''} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Check-in Status Filter Pills */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-semibold text-[#A0A6B0] mr-1">Status:</span>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-white/15 text-white'
                        : 'text-[#A0A6B0] hover:text-white'
                    }`}
                  >
                    All ({filteredParticipants.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('checked_in')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'checked_in'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-[#A0A6B0] hover:text-emerald-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Checked In ({participants.filter(p => p.checkInStatus === 'checked_in').length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('confirmed')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'confirmed'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-[#A0A6B0] hover:text-amber-400'
                    }`}
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Awaiting Desk ({participants.filter(p => p.checkInStatus !== 'checked_in').length})</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Players Table */}
            <div className="rounded-2xl bg-[#10141C] border border-white/10 overflow-hidden shadow-xl">
              {/* Mobile Horizontal Scroll Hint */}
              <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 text-[11px] text-[#A0A6B0]">
                <span className="text-[#D4AF7C] font-medium">← Swipe to view arbiter actions & details →</span>
                <span className="font-mono text-[10px] text-white/50">{filteredParticipants.length} entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-xs">
                  <thead className="bg-[#090D12] text-[#A0A6B0] font-semibold border-b border-white/10 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Ticket ID</th>
                      <th className="py-3.5 px-4">Participant Details</th>
                      <th className="py-3.5 px-4">Institution & Dept</th>
                      <th className="py-3.5 px-4">Rating & Handle</th>
                      <th className="py-3.5 px-4">Tournament Event</th>
                      <th className="py-3.5 px-4 text-center">Custom Q&A</th>
                      <th className="py-3.5 px-4 text-center">Desk Status</th>
                      <th className="py-3.5 px-4 text-right">Arbiter Desk Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-['Inter',sans-serif]">
                    {loadingParticipants ? (
                      <tr>
                        <td colSpan={8} className="text-center py-14 text-[#A0A6B0]">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <RefreshCw className="w-6 h-6 text-[#D4AF7C] animate-spin" />
                            <span className="text-xs">Synchronizing player registrations from database...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-14 text-[#A0A6B0]">
                          <p className="text-sm font-semibold text-[#F5F5F5]">No participants matching your filter criteria.</p>
                          <p className="text-xs text-[#A0A6B0] mt-1">Try clearing your search query or selecting &quot;All Events&quot;.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((player) => {
                        const hasCustomAnswers = player.customAnswers && Object.keys(player.customAnswers).length > 0;
                        const isCheckingThis = togglingTicketId === player.ticketId;
                        const isDeletingThis = deletingTicketId === player.ticketId;

                        return (
                          <tr key={player.id} className="hover:bg-white/[0.02] transition">
                            
                            {/* Ticket ID */}
                            <td className="py-4 px-4 font-mono font-semibold text-[#D4AF7C] whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{player.ticketId}</span>
                                <Link
                                  href={`/my-ticket?ticketId=${encodeURIComponent(player.ticketId)}`}
                                  target="_blank"
                                  className="text-[#A0A6B0] hover:text-[#D4AF7C] transition"
                                  title="Open Public Pass"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </td>

                            {/* Participant Name & Contact */}
                            <td className="py-4 px-4">
                              <div className="font-bold text-[#F5F5F5]">{player.name}</div>
                              <div className="text-[11px] text-[#A0A6B0] font-mono">Roll: {player.rollNumber}</div>
                              {player.phone && (
                                <div className="text-[10px] text-[#A0A6B0]/80">Ph: {player.phone}</div>
                              )}
                            </td>

                            {/* Institution & Dept */}
                            <td className="py-4 px-4">
                              <div className="text-[#F5F5F5] font-medium">{player.department} ({player.year || 'UG'})</div>
                              <div className="text-[11px] text-[#A0A6B0] truncate max-w-[170px]" title={player.college}>
                                {player.college}
                              </div>
                            </td>

                            {/* Rating Category & Chess Handles */}
                            <td className="py-4 px-4">
                              <div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.05] border border-white/10 text-[#F5F5F5]">
                                  {player.ratingCategory}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#D4AF7C] font-mono mt-1">
                                {player.chessUsername !== 'N/A' ? player.chessUsername : ''}
                                {player.fideId && player.fideId !== 'Unrated' && (
                                  <span className="text-[10px] text-[#A0A6B0] block">FIDE: {player.fideId}</span>
                                )}
                              </div>
                            </td>

                            {/* Tournament Event */}
                            <td className="py-4 px-4">
                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-medium bg-[#D4AF7C]/10 border border-[#D4AF7C]/20 text-[#D4AF7C] inline-block max-w-[160px] truncate" title={player.tournament}>
                                {player.tournament}
                              </span>
                            </td>

                            {/* Custom Q&A */}
                            <td className="py-4 px-4 text-center">
                              {hasCustomAnswers ? (
                                <button
                                  type="button"
                                  onClick={() => setInspectingPlayer(player)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition cursor-pointer"
                                  title="View answers to custom tournament questions"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>{Object.keys(player.customAnswers || {}).length} Answers</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-[#A0A6B0]/50">—</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              {player.checkInStatus === 'checked_in' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>Checked In</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>Awaiting Desk</span>
                                </span>
                              )}
                            </td>

                            {/* Arbiter Action Button */}
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isCheckingThis}
                                  onClick={() => toggleVerify(player.ticketId, player.checkInStatus)}
                                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                                    player.checkInStatus === 'checked_in'
                                      ? 'text-[#A0A6B0] hover:text-red-300 bg-white/[0.04] hover:bg-red-500/10 border border-white/10 hover:border-red-500/30'
                                      : 'text-[#0B0F14] bg-emerald-400 hover:bg-emerald-300 font-bold shadow-md shadow-emerald-500/20'
                                  }`}
                                >
                                  {isCheckingThis ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : player.checkInStatus === 'checked_in' ? (
                                    'Revoke Desk'
                                  ) : (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Check In Desk</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  disabled={isDeletingThis}
                                  onClick={() => handleDeletePlayer(player.ticketId, player.name)}
                                  className="p-1.5 rounded-lg text-[#A0A6B0] hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                  title="Delete Registration"
                                >
                                  {isDeletingThis ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: RESULTS & PODIUM STANDINGS PUBLISHER */}
        {activeTab === 'results' && (
          <AdminResultsTab 
            tournaments={tournaments} 
            onTournamentUpdated={(updated) => setTournaments(prev => prev.map(t => t.id === updated.id ? updated : t))} 
          />
        )}

        {/* TAB 4: COLLEGIATE LEADERBOARD & CHESS.COM LIVE RATINGS */}
        {activeTab === 'leaderboard' && (
          <AdminLeaderboardTab />
        )}

        {/* TAB 5: NOTICE BOARD & ANNOUNCEMENTS CMS */}
        {activeTab === 'announcements' && (
          <AdminAnnouncementsTab />
        )}

        {/* TAB 6: SETTINGS & SUPABASE POSTGRESQL ARCHITECTURE */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl">
            
            <div className="p-6 rounded-3xl bg-[#10141C] border border-white/10 space-y-4 shadow-xl">
              <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#D4AF7C]" />
                <span>Supabase PostgreSQL Architecture Status</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Supabase Live DB */}
                <div className="p-4 rounded-2xl bg-[#080B0F] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F5F5]">Supabase PostgreSQL</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Live &amp; Connected
                    </span>
                  </div>
                  <p className="text-xs text-[#A0A6B0]">
                    Managed tables: <code className="text-[#D4AF7C]">tournaments</code>, <code className="text-[#D4AF7C]">registrations</code>, <code className="text-[#D4AF7C]">leaderboard_players</code>, <code className="text-[#D4AF7C]">announcements</code>.
                  </p>
                </div>

                {/* Chess.com API Integration */}
                <div className="p-4 rounded-2xl bg-[#080B0F] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F5F5]">Chess.com Public API</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      REST Live
                    </span>
                  </div>
                  <p className="text-xs text-[#A0A6B0]">
                    Endpoint <code className="text-[#D4AF7C]">/api/leaderboard/sync-chess</code> automatically queries official Chess.com stats and updates collegiate player ratings.
                  </p>
                </div>

                {/* Google Sheet Webhook */}
                <div className="p-4 rounded-2xl bg-[#080B0F] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F5F5]">Google Sheet Sync</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      Live Webhook
                    </span>
                  </div>
                  <p className="text-xs text-[#A0A6B0]">
                    Active registration webhook running in parallel with Supabase for multi-arbiter redundancy.
                  </p>
                </div>

                {/* Real-time Listeners */}
                <div className="p-4 rounded-2xl bg-[#080B0F] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F5F5]">Real-time Listeners</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-[#A0A6B0]">
                    Websockets push registration and tournament status changes immediately across admin browsers.
                  </p>
                </div>

              </div>
            </div>

            {/* Database Migration Command */}
            <div className="p-6 rounded-3xl bg-[#10141C] border border-white/10 space-y-3 font-['Inter',sans-serif]">
              <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF7C]" />
                <span>One-Click Schema Synchronization</span>
              </h3>

              <p className="text-xs text-[#A0A6B0] leading-relaxed">
                If you ever want to re-seed or run a clean migration on Supabase, execute the built-in migration script:
              </p>

              <pre className="p-4 rounded-2xl bg-[#080B0F] border border-white/10 text-xs font-mono text-[#D4AF7C] overflow-x-auto">
{`npm run db:migrate`}
              </pre>
            </div>

          </div>
        )}

      </main>

      {/* FULL SUPERIOR POWER MODAL: TOURNAMENT CREATOR & EDITOR */}
      {isEditorModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsEditorModalOpen(false)}
        >
          <div 
            className="w-full max-w-3xl bg-[#12161E] rounded-3xl border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF7C]/15 border border-[#D4AF7C]/40 flex items-center justify-center text-[#D4AF7C]">
                  {editingTournamentId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-['Montserrat',sans-serif] text-lg font-bold text-[#F5F5F5]">
                    {editingTournamentId ? `Edit Tournament: ${formData.title}` : 'Create New Tournament'}
                  </h3>
                  <p className="text-xs text-[#A0A6B0]">
                    {editingTournamentId ? 'Modify schedule, capacity, registration window, and custom form fields.' : 'Configure official tournament details, timetable, and registration schema.'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEditorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Sub-tabs for modal */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditorActiveTab('basics')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  editorActiveTab === 'basics'
                    ? 'bg-[#D4AF7C] text-[#0B0F14]'
                    : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/5'
                }`}
              >
                1. Basic Info & Venue
              </button>

              <button
                type="button"
                onClick={() => setEditorActiveTab('registration')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  editorActiveTab === 'registration'
                    ? 'bg-[#D4AF7C] text-[#0B0F14]'
                    : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/5'
                }`}
              >
                2. Registration Schedule
              </button>

              <button
                type="button"
                onClick={() => setEditorActiveTab('form')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  editorActiveTab === 'form'
                    ? 'bg-[#D4AF7C] text-[#0B0F14]'
                    : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/5'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>3. Form Builder & Required Fields</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorActiveTab('rules')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  editorActiveTab === 'rules'
                    ? 'bg-[#D4AF7C] text-[#0B0F14]'
                    : 'text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/5'
                }`}
              >
                4. Arbiter & Rules
              </button>
            </div>

            {/* Form scrollable container */}
            <form onSubmit={handleSaveTournament} className="flex-1 overflow-y-auto pr-1 space-y-5 text-xs">
              
              {editorError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300">
                  {editorError}
                </div>
              )}

              {/* TAB 1: BASICS */}
              {editorActiveTab === 'basics' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[#A0A6B0] font-semibold">Tournament Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JGEC Inter-College Championship 2026"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Tournament Format</label>
                      <input
                        type="text"
                        placeholder="e.g. 7 Rounds Swiss System • Rapid (15m + 10s)"
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Venue / Location *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Main Auditorium, JGEC Campus"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Display Date</label>
                      <input
                        type="text"
                        placeholder="e.g. November 07, 2026"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Target Countdown ISO</label>
                      <input
                        type="datetime-local"
                        value={formData.targetDate ? formData.targetDate.slice(0, 16) : ''}
                        onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Daily Timing</label>
                      <input
                        type="text"
                        placeholder="e.g. 09:30 AM – 06:00 PM IST"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Max Player Slots</label>
                      <input
                        type="number"
                        placeholder="128"
                        value={formData.maxSlots}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          maxSlots: Number(e.target.value),
                          slots: `${e.target.value} Max Slots`
                        })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Prize Pool</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹25,000 + Trophies"
                        value={formData.prizePool}
                        onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Entry Fee</label>
                      <input
                        type="text"
                        placeholder="e.g. Free or ₹100"
                        value={formData.entryFee}
                        onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#A0A6B0] font-semibold">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Tournament summary, eligibility criteria, and key highlights..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="feat-checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-[#080B0F] text-[#D4AF7C] accent-[#D4AF7C] cursor-pointer"
                    />
                    <label htmlFor="feat-checkbox" className="text-xs text-[#F5F5F5] font-semibold cursor-pointer">
                      Feature on Homepage Hero & Header Countdown
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: REGISTRATION WINDOW & STATUS */}
              {editorActiveTab === 'registration' && (
                <div className="space-y-5">
                  
                  {/* Status Selector */}
                  <div className="space-y-1.5 p-4 rounded-2xl bg-[#080B0F] border border-white/10">
                    <label className="text-[#D4AF7C] font-bold uppercase tracking-wider text-[11px]">
                      Current Registration Status
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[
                        { key: 'open', label: 'Open', color: 'emerald' },
                        { key: 'closed', label: 'Closed', color: 'red' },
                        { key: 'closing_soon', label: 'Closing Soon', color: 'amber' },
                        { key: 'upcoming', label: 'Upcoming Draft', color: 'blue' }
                      ].map(st => (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: st.key as TournamentStatus })}
                          className={`py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer border ${
                            formData.status === st.key
                              ? 'bg-[#D4AF7C] text-[#0B0F14] border-[#D4AF7C]'
                              : 'bg-white/5 border-white/10 text-[#A0A6B0] hover:text-white'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Registration Opens Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formData.registrationStartDate ? formData.registrationStartDate.slice(0, 16) : ''}
                        onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                      <p className="text-[10px] text-[#A0A6B0]">Before this date, registration form shows &quot;Opening Soon&quot;.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Registration Closes Deadline</label>
                      <input
                        type="datetime-local"
                        value={formData.registrationEndDate ? formData.registrationEndDate.slice(0, 16) : ''}
                        onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                      <p className="text-[10px] text-[#A0A6B0]">After this deadline, registrations automatically close.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-[#A0A6B0]">
                    <div className="font-semibold text-[#F5F5F5] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF7C]" />
                      <span>Arbiter Superior Override Note</span>
                    </div>
                    <p>
                      Regardless of dates, you can manually force registration open or closed anytime with the instant toggle switch on the dashboard.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: REGISTRATION FORM BUILDER */}
              {editorActiveTab === 'form' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <h4 className="font-bold text-[#F5F5F5] text-xs uppercase tracking-wider text-[#D4AF7C]">
                        Configurable Registration Form Fields
                      </h4>
                      <p className="text-[11px] text-[#A0A6B0]">
                        Toggle which fields appear on the public registration form, and whether they are required or optional.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddQuestionRow(!showAddQuestionRow)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 hover:bg-[#D4AF7C]/20 transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Custom Question</span>
                    </button>
                  </div>

                  {/* Add Custom Question Row */}
                  {showAddQuestionRow && (
                    <div className="p-4 rounded-2xl bg-[#080B0F] border border-[#D4AF7C]/40 space-y-3">
                      <div className="font-semibold text-xs text-[#D4AF7C]">Add Custom Tournament Question</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] text-[#A0A6B0]">Question / Field Label</label>
                          <input
                            type="text"
                            placeholder="e.g. Do you need campus hostel accommodation?"
                            value={newCustomQuestion.label}
                            onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, label: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-xl bg-[#12161E] border border-white/10 text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-[#A0A6B0]">Field Type</label>
                          <select
                            value={newCustomQuestion.type}
                            onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, type: e.target.value as any })}
                            className="w-full px-3 py-1.5 rounded-xl bg-[#12161E] border border-white/10 text-white text-xs"
                          >
                            <option value="text">Short Text</option>
                            <option value="select">Dropdown Options</option>
                            <option value="checkbox">Yes/No Checkbox</option>
                          </select>
                        </div>
                      </div>

                      {newCustomQuestion.type === 'select' && (
                        <div className="space-y-1">
                          <label className="text-[10px] text-[#A0A6B0]">Dropdown Choices (comma-separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Yes - Male Hostel, Yes - Female Hostel, No - Day Scholar"
                            value={newCustomQuestion.optionsString}
                            onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, optionsString: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-xl bg-[#12161E] border border-white/10 text-white text-xs"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A0A6B0]">
                          <input
                            type="checkbox"
                            checked={newCustomQuestion.required}
                            onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, required: e.target.checked })}
                            className="accent-[#D4AF7C]"
                          />
                          <span>Mandatory / Required Field</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddQuestionRow(false)}
                            className="px-3 py-1 rounded-full text-xs text-[#A0A6B0] hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddCustomQuestion}
                            className="px-4 py-1.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A]"
                          >
                            Add to Form
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Built-in Standard Form Fields List */}
                  <div className="space-y-2">
                    {formData.formConfig?.map(field => (
                      <div 
                        key={field.id}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-4 ${
                          field.enabled 
                            ? 'bg-[#080B0F] border-white/10' 
                            : 'bg-white/[0.01] border-white/5 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleFormField(field.id, 'enabled')}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition ${
                              field.enabled
                                ? 'bg-[#D4AF7C] text-[#0B0F14]'
                                : 'bg-white/10 text-[#A0A6B0]'
                            }`}
                          >
                            {field.enabled ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                          </button>

                          <div>
                            <div className="font-semibold text-xs text-[#F5F5F5] flex items-center gap-2">
                              <span>{field.label}</span>
                              {field.required && (
                                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded">
                                  REQUIRED
                                </span>
                              )}
                              <span className="text-[10px] text-[#A0A6B0]/60 uppercase font-mono">
                                ({field.type})
                              </span>
                            </div>
                            <div className="text-[10px] text-[#A0A6B0]">{field.helpText}</div>
                          </div>
                        </div>

                        {/* Required Toggle */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!field.enabled}
                            onClick={() => handleToggleFormField(field.id, 'required')}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                              field.required
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : 'bg-white/5 text-[#A0A6B0] border border-white/10 hover:text-white'
                            }`}
                          >
                            {field.required ? 'Mandatory' : 'Optional'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Fields List if any */}
                  {formData.customFields && formData.customFields.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-white/10">
                      <div className="font-bold text-xs text-[#D4AF7C] uppercase tracking-wider">
                        Custom Extra Questions ({formData.customFields.length})
                      </div>
                      {formData.customFields.map(cf => (
                        <div key={cf.id} className="p-3.5 rounded-2xl bg-[#080B0F] border border-[#D4AF7C]/30 flex items-center justify-between gap-4">
                          <div>
                            <div className="font-semibold text-xs text-[#F5F5F5] flex items-center gap-2">
                              <span>{cf.label}</span>
                              {cf.required && <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-1 rounded">REQUIRED</span>}
                              <span className="text-[10px] text-cyan-400 font-mono">({cf.type})</span>
                            </div>
                            {cf.options && (
                              <div className="text-[10px] text-[#A0A6B0]">Options: {cf.options.join(', ')}</div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCustomQuestion(cf.id)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: ARBITER & RULES */}
              {editorActiveTab === 'rules' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[#A0A6B0] font-semibold">Chief Arbiter in Charge</label>
                    <input
                      type="text"
                      placeholder="e.g. IA Dr. P. K. Sen / Chief Arbiter JGEC"
                      value={formData.arbiterName}
                      onChange={(e) => setFormData({ ...formData, arbiterName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Contact Email for Queries</label>
                      <input
                        type="email"
                        placeholder="tournaments@chaturanga-jgec.ac.in"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#A0A6B0] font-semibold">Emergency WhatsApp Contact</label>
                      <input
                        type="text"
                        placeholder="+91 94340 12345"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#A0A6B0] font-semibold">Fair Play & Anti-Cheating Declaration</label>
                    <textarea
                      rows={4}
                      value={formData.fairPlayNotice}
                      onChange={(e) => setFormData({ ...formData, fairPlayNotice: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Bottom modal actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditorModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingTournament}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition shadow-lg shadow-[#D4AF7C]/20 cursor-pointer disabled:opacity-50"
                >
                  {savingTournament ? 'Saving to Database...' : editingTournamentId ? 'Save Changes' : 'Create Tournament'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONCLUDE & PUBLISH PODIUM RESULTS */}
      {isArchiveModalOpen && archivingTournament && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsArchiveModalOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-[#12161E] rounded-3xl border border-white/15 p-6 sm:p-8 space-y-5 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D4AF7C]" />
                  <span>Conclude & Publish Podium Results</span>
                </h3>
                <p className="text-xs text-[#A0A6B0] mt-0.5">
                  Move &quot;{archivingTournament.title}&quot; to Past Events with official winner standings.
                </p>
              </div>
              <button 
                onClick={() => setIsArchiveModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleArchiveTournamentSubmit} className="space-y-4 text-xs font-['Inter',sans-serif]">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Total Turnout / Participants</label>
                  <input
                    type="number"
                    value={podiumData.totalParticipants}
                    onChange={(e) => setPodiumData({ ...podiumData, totalParticipants: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Final Status</label>
                  <div className="px-3 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                    Completed & Archived
                  </div>
                </div>
              </div>

              {/* 1st Place Gold */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="font-bold text-[#D4AF7C] text-[11px] uppercase">1st Place • Champion (Gold)</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Champion Full Name"
                    value={podiumData.goldName}
                    onChange={(e) => setPodiumData({ ...podiumData, goldName: e.target.value })}
                    className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dept (e.g. CSE 4th Year)"
                    value={podiumData.goldDept}
                    onChange={(e) => setPodiumData({ ...podiumData, goldDept: e.target.value })}
                    className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              {/* 2nd Place Silver */}
              <div className="p-3 rounded-2xl bg-neutral-400/10 border border-neutral-400/30 space-y-2">
                <div className="font-bold text-neutral-300 text-[11px] uppercase">2nd Place • Runner Up (Silver)</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Runner Up Full Name"
                    value={podiumData.silverName}
                    onChange={(e) => setPodiumData({ ...podiumData, silverName: e.target.value })}
                    className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dept (e.g. ECE 3rd Year)"
                    value={podiumData.silverDept}
                    onChange={(e) => setPodiumData({ ...podiumData, silverDept: e.target.value })}
                    className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              {/* 3rd Place Bronze */}
              <div className="p-3 rounded-2xl bg-orange-700/10 border border-orange-700/30 space-y-2">
                <div className="font-bold text-orange-400 text-[11px] uppercase">3rd Place • 2nd Runner Up (Bronze)</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Third Place Full Name"
                    value={podiumData.bronzeName}
                    onChange={(e) => setPodiumData({ ...podiumData, bronzeName: e.target.value })}
                    className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dept (e.g. ME 2nd Year)"
                    value={podiumData.bronzeDept}
                    onChange={(e) => setPodiumData({ ...podiumData, bronzeDept: e.target.value })}
                    className="px-3 py-1.5 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#A0A6B0] font-semibold">Tournament Summary & Memorable Games</label>
                <textarea
                  rows={2}
                  value={podiumData.summary}
                  onChange={(e) => setPodiumData({ ...podiumData, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(false)}
                  className="px-4 py-2 rounded-full text-[#A0A6B0] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer"
                >
                  Publish to Past Events
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ARBITER WALK-IN REGISTRATION */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#12161D] rounded-3xl border border-white/15 p-6 sm:p-8 space-y-5 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#D4AF7C]" />
                  <span>Manual Arbiter Walk-in Registration</span>
                </h3>
                <p className="text-xs text-[#A0A6B0] mt-0.5">
                  Register a walk-in player directly at the tournament reception desk.
                </p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPlayer} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs font-['Inter',sans-serif]">
              
              {walkInError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300">
                  {walkInError}
                </div>
              )}

              {/* Tournament Selector */}
              <div className="space-y-1">
                <label className="text-[#D4AF7C] font-bold uppercase tracking-wider text-[10px]">
                  Target Tournament Event *
                </label>
                <select
                  value={newPlayer.tournamentId}
                  onChange={(e) => setNewPlayer({ ...newPlayer, tournamentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs cursor-pointer"
                >
                  {tournaments.filter(t => !t.isPast && t.status !== 'completed').map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.status === 'open' ? 'Open' : t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name & Roll */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Roll Number / Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23101104018"
                    value={newPlayer.rollNumber}
                    onChange={(e) => setNewPlayer({ ...newPlayer, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>
              </div>

              {/* Institution & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Institution / College</label>
                  <input
                    type="text"
                    value={newPlayer.college}
                    onChange={(e) => setNewPlayer({ ...newPlayer, college: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Department & Year</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="CSE"
                      value={newPlayer.department}
                      onChange={(e) => setNewPlayer({ ...newPlayer, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                    />
                    <select
                      value={newPlayer.year}
                      onChange={(e) => setNewPlayer({ ...newPlayer, year: e.target.value })}
                      className="w-full px-2 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="player@jgec.ac.in"
                    value={newPlayer.email}
                    onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">WhatsApp / Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={newPlayer.phone}
                    onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>
              </div>

              {/* Chess Ratings & Handles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Rating Band</label>
                  <select
                    value={newPlayer.ratingCategory}
                    onChange={(e) => setNewPlayer({ ...newPlayer, ratingCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  >
                    <option>Beginner / Casual (&lt; 1200)</option>
                    <option>Club Player (1200 - 1600)</option>
                    <option>Intermediate / Rated (1600 - 1900)</option>
                    <option>Advanced / FIDE Master (&gt; 1900)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">Chess Handle</label>
                  <input
                    type="text"
                    placeholder="Lichess/Chess.com"
                    value={newPlayer.chessUsername}
                    onChange={(e) => setNewPlayer({ ...newPlayer, chessUsername: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#A0A6B0] font-semibold">FIDE ID</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={newPlayer.fideId}
                    onChange={(e) => setNewPlayer({ ...newPlayer, fideId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white focus:outline-none focus:border-[#D4AF7C] text-xs"
                  />
                </div>
              </div>

              {/* Custom Tournament Questions (Dynamically Loaded) */}
              {(() => {
                const curTourn = tournaments.find(t => t.id === newPlayer.tournamentId);
                if (!curTourn || !curTourn.customFields || curTourn.customFields.length === 0) return null;
                return (
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-[#D4AF7C]/30 space-y-3">
                    <div className="font-bold text-[11px] uppercase tracking-wider text-[#D4AF7C]">
                      Tournament Specific Form Responses
                    </div>
                    {curTourn.customFields.map(cf => (
                      <div key={cf.id} className="space-y-1">
                        <label className="text-[#F5F5F5] font-medium text-[11px] block">
                          {cf.label} {cf.required && <span className="text-red-400">*</span>}
                        </label>
                        {cf.type === 'select' && cf.options ? (
                          <select
                            value={walkInCustomAnswers[cf.id] || ''}
                            onChange={(e) => setWalkInCustomAnswers({ ...walkInCustomAnswers, [cf.id]: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                          >
                            <option value="">-- Choose Option --</option>
                            {cf.options.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={walkInCustomAnswers[cf.id] || ''}
                            onChange={(e) => setWalkInCustomAnswers({ ...walkInCustomAnswers, [cf.id]: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[#090D12] border border-white/10 text-white text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Immediate Check-In Toggle */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-emerald-400 block">Immediate Desk Check-In</span>
                  <span className="text-[10px] text-[#A0A6B0]">Mark player as present and verified for pairing immediately</span>
                </div>
                <input
                  type="checkbox"
                  checked={walkInImmediateCheckIn}
                  onChange={(e) => setWalkInImmediateCheckIn(e.target.checked)}
                  className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full text-[#A0A6B0] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingWalkIn}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer shadow-lg shadow-[#D4AF7C]/20 disabled:opacity-50"
                >
                  {savingWalkIn ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Walk-in...</span>
                    </>
                  ) : (
                    <span>Register Walk-in Player</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM Q&A INSPECTOR */}
      {inspectingPlayer && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setInspectingPlayer(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#12161D] rounded-3xl border border-white/15 p-6 sm:p-8 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Custom Registration Answers</span>
                </h3>
                <p className="text-xs text-[#A0A6B0] mt-0.5">
                  {inspectingPlayer.name} ({inspectingPlayer.rollNumber}) • {inspectingPlayer.ticketId}
                </p>
              </div>
              <button 
                onClick={() => setInspectingPlayer(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                <span className="text-[#A0A6B0] block text-[10px] uppercase font-mono">Tournament</span>
                <span className="text-[#D4AF7C] font-semibold">{inspectingPlayer.tournament}</span>
              </div>

              {inspectingPlayer.customAnswers && Object.keys(inspectingPlayer.customAnswers).length > 0 ? (
                Object.entries(inspectingPlayer.customAnswers).map(([key, val], idx) => {
                  // Lookup friendly label if configured in tournament
                  const targetTourn = tournaments.find(t => 
                    t.id === inspectingPlayer.tournamentId || 
                    t.title.toLowerCase() === inspectingPlayer.tournament.toLowerCase()
                  );
                  const cf = targetTourn?.customFields?.find(f => f.id === key);
                  const displayLabel = cf ? cf.label : key.replace(/_/g, ' ');

                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-[#090D12] border border-white/10 space-y-1">
                      <span className="text-[11px] font-medium text-[#A0A6B0] block leading-snug">
                        {displayLabel}
                      </span>
                      <p className="text-sm font-bold text-[#F5F5F5] font-['Inter',sans-serif]">
                        {val || '<empty response>'}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-[#A0A6B0]">
                  No custom questions were answered for this player.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setInspectingPlayer(null)}
                className="px-5 py-2 rounded-full font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
