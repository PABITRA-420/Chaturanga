"use client";

import React, { useState, useEffect } from 'react';
import { ClubAnnouncement } from '@/data/announcementsData';
import { 
  Bell, 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  X,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function AdminAnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<ClubAnnouncement | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ClubAnnouncement>>({
    title: '',
    category: 'GENERAL',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    summary: '',
    content: '',
    isUrgent: false,
    linkText: 'Learn More',
    linkUrl: '/upcoming'
  });

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.success && Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAnn(null);
    setFormData({
      title: '',
      category: 'TOURNAMENT',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      summary: '',
      content: '',
      isUrgent: false,
      linkText: 'Register Now',
      linkUrl: '/register'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ann: ClubAnnouncement) => {
    setEditingAnn(ann);
    setFormData({ ...ann });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const url = '/api/announcements';
      const method = editingAnn ? 'PUT' : 'POST';
      const body = editingAnn ? { id: editingAnn.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save announcement');

      setIsModalOpen(false);
      await loadAnnouncements();
      setNotice({ type: 'success', text: `Announcement "${formData.title}" saved successfully!` });
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Error saving announcement.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ann: ClubAnnouncement) => {
    if (!confirm(`Are you sure you want to remove announcement "${ann.title}"?`)) return;

    try {
      const res = await fetch(`/api/announcements?id=${encodeURIComponent(ann.id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(prev => prev.filter(a => a.id !== ann.id));
        setNotice({ type: 'success', text: 'Announcement removed.' });
        setTimeout(() => setNotice(null), 3000);
      } else {
        alert(data.error || 'Failed to delete announcement');
      }
    } catch (err) {
      console.error('Delete announcement failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#10141C] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>DYNAMIC CLUB NOTICE BOARD</span>
          </div>
          <h2 className="font-['Montserrat',sans-serif] text-xl sm:text-2xl font-black text-[#F5F5F5]">
            Announcements &amp; Urgent Banner CMS
          </h2>
          <p className="text-xs text-[#A0A6B0] mt-1 max-w-2xl font-['Poppins',sans-serif]">
            Broadcast notices, timetable alerts, and practice schedules directly on the homepage banner without writing code.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer shadow-md shadow-[#D4AF7C]/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fadeIn ${
          notice.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
            <span className="font-semibold">{notice.text}</span>
          </div>
        </div>
      )}

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#A0A6B0]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF7C]" />
            <span>Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#A0A6B0] rounded-3xl bg-[#10141C] border border-white/10">
            No announcements found. Click "Post Announcement" to create your first notice.
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-6 rounded-3xl bg-[#10141C] border border-white/10 hover:border-white/20 transition flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    ann.category === 'TOURNAMENT' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                    ann.category === 'PRACTICE' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                    ann.category === 'SELECTION' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                    'bg-white/10 text-[#F5F5F5] border border-white/15'
                  }`}>
                    {ann.category}
                  </span>

                  {ann.isUrgent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>URGENT</span>
                    </span>
                  )}
                </div>

                <h3 className="font-['Montserrat',sans-serif] text-base font-bold text-[#F5F5F5]">
                  {ann.title}
                </h3>

                <p className="text-xs text-[#A0A6B0] line-clamp-3 leading-relaxed">
                  {ann.summary}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] text-[#A0A6B0]/70 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF7C]" />
                  <span>{ann.date}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-[#D4AF7C] font-semibold">
                  Link: {ann.linkText || 'Learn More'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(ann)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F5F5F5] border border-white/10 transition cursor-pointer"
                    title="Edit announcement"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#D4AF7C]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ann)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-xl bg-[#10141C] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Montserrat',sans-serif] text-lg font-bold text-[#F5F5F5]">
                    {editingAnn ? 'Edit Club Announcement' : 'Post New Club Notice'}
                  </h3>
                  <p className="text-xs text-[#A0A6B0]">
                    Pushed instantly to the public homepage announcement carousel.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Spring Blitz Open Registrations Live"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5]"
                  >
                    {['TOURNAMENT', 'PRACTICE', 'SELECTION', 'GENERAL'].map(c => (
                      <option key={c} value={c} className="bg-[#10141C]">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Display Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Summary / Lead-in *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Short 1-2 sentence lead text shown on card..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Full Detailed Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Complete announcement text displayed when visitors open modal..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Button / Link Text</label>
                  <input
                    type="text"
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    placeholder="Register Now"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A0A6B0] mb-1">Button Target URL</label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="/register or /upcoming"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B0F] border border-white/10 text-xs text-[#F5F5F5]"
                  />
                </div>
              </div>

              {/* Urgent Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="urgentToggle"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  className="w-4 h-4 rounded text-[#D4AF7C] bg-[#080B0F] border-white/20 cursor-pointer"
                />
                <label htmlFor="urgentToggle" className="text-xs font-semibold text-[#F5F5F5] cursor-pointer">
                  Highlight as Urgent / Breaking Notice (flashing red badge)
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A0A6B0] hover:text-white bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer shadow-md shadow-[#D4AF7C]/20 disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : editingAnn ? 'Update Announcement' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
