"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { TeamMember } from '@/data/teamData';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  X, 
  Upload, 
  Sparkles, 
  Swords, 
  Trophy, 
  Check, 
  Crown, 
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import AdminMediaManager from './AdminMediaManager';

const CATEGORIES = [
  { id: 'all', label: 'All Members' },
  { id: 'core', label: 'Core Executive' },
  { id: 'coordinator', label: 'Coordinators' },
  { id: 'mentor', label: 'Faculty & Mentors' }
];

const CHESS_PIECES = ['King', 'Queen', 'Rook', 'Bishop', 'Knight'] as const;

export default function AdminTeamTab() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: 'core' as 'core' | 'coordinator' | 'mentor',
    department: '',
    year: '',
    elo: '',
    fideId: '',
    bio: '',
    responsibilitiesText: '',
    favoriteOpening: '',
    achievementsText: '',
    chessPiece: 'Knight' as 'King' | 'Queen' | 'Rook' | 'Bishop' | 'Knight',
    avatarColor: 'from-[#D4AF7C] via-[#E6C98A] to-[#B89355]',
    titleBadge: '',
    imageUrl: ''
  });

  const loadTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success && Array.isArray(data.teamMembers)) {
        setMembers(data.teamMembers);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      category: 'core',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      elo: '1850 Elo',
      fideId: '',
      bio: '',
      responsibilitiesText: '',
      favoriteOpening: 'Sicilian Defense',
      achievementsText: '',
      chessPiece: 'Knight',
      avatarColor: 'from-amber-400 to-yellow-600',
      titleBadge: 'Council Member',
      imageUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      category: member.category,
      department: member.department,
      year: member.year,
      elo: member.elo,
      fideId: member.fideId || '',
      bio: member.bio,
      responsibilitiesText: (member.responsibilities || []).join('\n'),
      favoriteOpening: member.favoriteOpening,
      achievementsText: (member.achievements || []).join('\n'),
      chessPiece: member.chessPiece,
      avatarColor: member.avatarColor,
      titleBadge: member.titleBadge,
      imageUrl: member.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotice({ type: 'error', text: 'Please upload an image file (JPEG, PNG, WebP, AVIF).' });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setNotice({ type: 'error', text: 'Image file size must be under 8MB.' });
      return;
    }

    setUploadingImage(true);
    setNotice(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await res.json();
      if (data.success && data.blob?.url) {
        setFormData(prev => ({ ...prev, imageUrl: data.blob.url }));
        setNotice({ type: 'success', text: 'Profile photo uploaded to Netlify Blobs!' });
        setTimeout(() => setNotice(null), 3000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Image upload failed.' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      setNotice({ type: 'error', text: 'Name and role are required.' });
      return;
    }

    setSaving(true);
    setNotice(null);

    const responsibilities = formData.responsibilitiesText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const achievements = formData.achievementsText
      .split('\n')
      .map(a => a.trim())
      .filter(Boolean);

    const payload: Partial<TeamMember> = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      category: formData.category,
      department: formData.department.trim(),
      year: formData.year.trim(),
      elo: formData.elo.trim(),
      fideId: formData.fideId.trim() || null,
      bio: formData.bio.trim(),
      responsibilities,
      favoriteOpening: formData.favoriteOpening.trim(),
      achievements,
      chessPiece: formData.chessPiece,
      avatarColor: formData.avatarColor.trim(),
      titleBadge: formData.titleBadge.trim(),
      imageUrl: formData.imageUrl.trim() || null
    };

    try {
      const url = '/api/team';
      const method = editingMember ? 'PUT' : 'POST';
      const body = editingMember ? { id: editingMember.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save team member.');

      setIsModalOpen(false);
      await loadTeamMembers();
      setNotice({ type: 'success', text: `Team member "${formData.name}" saved successfully!` });
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Error saving team member.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Are you sure you want to remove "${member.name}" from club leadership?`)) return;

    try {
      const res = await fetch(`/api/team?id=${encodeURIComponent(member.id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setMembers(prev => prev.filter(m => m.id !== member.id));
        setNotice({ type: 'success', text: `Removed "${member.name}" from council.` });
        setTimeout(() => setNotice(null), 3000);
      } else {
        alert(data.error || 'Failed to delete team member');
      }
    } catch (err) {
      console.error('Delete team member failed:', err);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[#10141C] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>EXECUTIVE COUNCIL & ARBITER ROSTER</span>
          </div>
          <h2 className="font-['Montserrat',sans-serif] text-xl sm:text-2xl font-black text-[#F5F5F5]">
            Leadership &amp; Council Member CMS
          </h2>
          <p className="text-xs text-[#A0A6B0] mt-1 max-w-2xl font-['Poppins',sans-serif]">
            Manage club executives, FIDE arbiters, event coordinators, and faculty patrons. Changes immediately update the live public roster at <span className="text-[#D4AF7C]">/team</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadTeamMembers}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] transition cursor-pointer"
            title="Refresh Roster"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer shadow-md shadow-[#D4AF7C]/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Council Member</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
          notice.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Controls: Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-sm'
                  : 'bg-[#12161D] text-[#A0A6B0] hover:text-white border border-white/5'
              }`}
            >
              {cat.label} {cat.id === 'all' ? `(${members.length})` : `(${members.filter(m => m.category === cat.id).length})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#A0A6B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member, role, dept..."
            className="w-full bg-[#12161D] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/60 focus:outline-none focus:border-[#D4AF7C]/60"
          />
        </div>
      </div>

      {/* Members Grid / Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#10141C] border border-white/5 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-[#10141C] border border-white/5 space-y-3">
          <Users className="w-10 h-10 text-[#D4AF7C]/40 mx-auto" />
          <h3 className="font-bold text-sm text-[#F5F5F5]">No Council Members Found</h3>
          <p className="text-xs text-[#A0A6B0]">
            {searchQuery ? 'No members match your search criteria.' : 'Click "Add Council Member" above to register the first member.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-[#10141C] border border-white/10 hover:border-[#D4AF7C]/40 transition group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Top Row: Avatar & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#D4AF7C]/40 bg-black/40"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${member.avatarColor} border border-[#D4AF7C]/40 flex items-center justify-center text-[#0B0F14] font-black text-xl`}>
                        {member.chessPiece === 'King' ? '♚' :
                         member.chessPiece === 'Queen' ? '♛' :
                         member.chessPiece === 'Rook' ? '♜' :
                         member.chessPiece === 'Bishop' ? '♝' : '♞'}
                      </div>
                    )}
                    <div>
                      <h4 className="font-['Montserrat',sans-serif] font-bold text-sm text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors">
                        {member.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#D4AF7C]">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-[#A0A6B0]">
                    {member.category}
                  </span>
                </div>

                {/* Sub details */}
                <div className="text-[11px] text-[#A0A6B0] space-y-1">
                  <div>{member.department} • {member.year}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">{member.elo}</span>
                    {member.fideId && <span className="font-mono text-[#A0A6B0]">FIDE: {member.fideId}</span>}
                  </div>
                </div>

                {/* Bio snippet */}
                {member.bio && (
                  <p className="text-xs text-[#A0A6B0] line-clamp-2 leading-relaxed">
                    {member.bio}
                  </p>
                )}

              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#A0A6B0]">
                  Piece: {member.chessPiece}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(member)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-[#D4AF7C]/20 hover:text-[#D4AF7C] text-[#A0A6B0] transition cursor-pointer"
                    title="Edit Member"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(member)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-[#A0A6B0] transition cursor-pointer"
                    title="Delete Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-2xl w-full my-8 bg-[#12161D] border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C]">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-['Montserrat',sans-serif] font-bold text-lg text-[#F5F5F5]">
                  {editingMember ? 'Edit Council Member' : 'Add New Council Member'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Row 1: Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Aniket Roy"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Club Role / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. President & Head Arbiter"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>
              </div>

              {/* Row 2: Category, Department, Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  >
                    <option value="core">Core Executive</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="mentor">Faculty & Mentor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g. Computer Science & Engg"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="e.g. 4th Year / Faculty"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>
              </div>

              {/* Row 3: Elo, FIDE ID, Chess Piece */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Elo Rating / Title
                  </label>
                  <input
                    type="text"
                    value={formData.elo}
                    onChange={(e) => setFormData(prev => ({ ...prev, elo: e.target.value }))}
                    placeholder="e.g. 2085 FIDE / 1950 Elo"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    FIDE ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.fideId}
                    onChange={(e) => setFormData(prev => ({ ...prev, fideId: e.target.value }))}
                    placeholder="e.g. 25048112"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Insignia Piece
                  </label>
                  <select
                    value={formData.chessPiece}
                    onChange={(e) => setFormData(prev => ({ ...prev, chessPiece: e.target.value as any }))}
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  >
                    {CHESS_PIECES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Signature Opening & Title Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Signature Opening
                  </label>
                  <input
                    type="text"
                    value={formData.favoriteOpening}
                    onChange={(e) => setFormData(prev => ({ ...prev, favoriteOpening: e.target.value }))}
                    placeholder="e.g. Sicilian Defense (Najdorf)"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Title Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.titleBadge}
                    onChange={(e) => setFormData(prev => ({ ...prev, titleBadge: e.target.value }))}
                    placeholder="e.g. Club President"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>
              </div>

              {/* Row 5: Profile Photo Uploader (Netlify Blobs direct upload + paste URL) */}
              <div className="p-4 rounded-2xl bg-[#0E1218] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#D4AF7C] uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Profile Photo (Netlify Blobs / Direct URL)</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                    className="text-[11px] font-semibold text-[#D4AF7C] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{showMediaPicker ? 'Hide Library' : 'Browse Blobs Library'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Photo Preview */}
                  <div className="w-14 h-14 rounded-xl border border-white/15 bg-black/50 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[#A0A6B0]/40" />
                    )}
                  </div>

                  {/* Input and Buttons */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Paste image URL (https://...) or upload directly below"
                      className="w-full bg-[#12161D] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Upload className={`w-3.5 h-3.5 ${uploadingImage ? 'animate-bounce' : ''}`} />
                        <span>{uploadingImage ? 'Uploading to Blobs...' : 'Upload from Computer'}</span>
                      </button>

                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional Embedded Media Manager Picker */}
                {showMediaPicker && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[11px] text-[#A0A6B0] mb-2">Click any photo below to set as profile image:</p>
                    <AdminMediaManager
                      selectedUrl={formData.imageUrl}
                      onSelectImage={(url) => {
                        setFormData(prev => ({ ...prev, imageUrl: url }));
                        setShowMediaPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Bio Description */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                  Biography / Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Short bio covering chess background and leadership scope..."
                  className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                />
              </div>

              {/* Key Responsibilities */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                  Key Responsibilities (One item per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.responsibilitiesText}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibilitiesText: e.target.value }))}
                  placeholder="Overseeing round pairings using Swiss-Manager&#10;Organizing weekly blitz arenas"
                  className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] font-mono focus:outline-none focus:border-[#D4AF7C]"
                />
              </div>

              {/* Key Achievements */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                  Key Achievements / Highlights (One item per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.achievementsText}
                  onChange={(e) => setFormData(prev => ({ ...prev, achievementsText: e.target.value }))}
                  placeholder="Winner - Autumn Swiss Cup 2025&#10;Gold Board 1 - Inter-Tech Cup"
                  className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] font-mono focus:outline-none focus:border-[#D4AF7C]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/5 hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer shadow-md shadow-[#D4AF7C]/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Saving Member...' : editingMember ? 'Update Member' : 'Create Member'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
