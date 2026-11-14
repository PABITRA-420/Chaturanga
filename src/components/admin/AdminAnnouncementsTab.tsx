"use client";

import React, { useState, useEffect } from 'react';
import { ClubAnnouncement } from '@/data/announcementsData';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
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

  const [deletingAnn, setDeletingAnn] = useState<ClubAnnouncement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deletingAnn) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/announcements?id=${encodeURIComponent(deletingAnn.id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(prev => prev.filter(a => a.id !== deletingAnn.id));
        setNotice({ type: 'success', text: 'Announcement removed.' });
        setTimeout(() => setNotice(null), 3000);
        setDeletingAnn(null);
      } else {
        setNotice({ type: 'error', text: data.error || 'Failed to delete announcement' });
      }
    } catch (err) {
      console.error('Delete announcement failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-md bg-surface border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs text-[11px] font-mono font-bold text-success bg-success/10 border border-success/30 mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>DYNAMIC CLUB NOTICE BOARD</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-fg tracking-tight">
            Announcements &amp; Urgent Banner CMS
          </h2>
          <p className="text-xs text-fg-muted mt-1 max-w-2xl">
            Broadcast notices, timetable alerts, and practice schedules directly on the homepage banner without writing code.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div
          role="status"
          className={`p-4 rounded-sm border text-xs flex items-center justify-between gap-3 ${
            notice.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-success" /> : <AlertCircle className="w-4 h-4 shrink-0 text-danger" />}
            <span className="font-semibold">{notice.text}</span>
          </div>
        </div>
      )}

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-fg-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-accent" />
            <span className="font-mono text-xs">Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="col-span-full py-16 text-center text-fg-muted rounded-md bg-surface border border-border">
            No announcements found. Click &quot;Post Announcement&quot; to create your first notice.
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-6 rounded-md bg-surface border border-border hover:border-border-strong transition-colors flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      ann.category === 'TOURNAMENT'
                        ? 'bg-success/10 text-success border-success/30'
                        : ann.category === 'PRACTICE'
                        ? 'bg-info/10 text-info border-info/30'
                        : ann.category === 'SELECTION'
                        ? 'bg-warning/10 text-warning border-warning/30'
                        : 'bg-surface-elevated text-fg border-border'
                    }`}
                  >
                    {ann.category}
                  </span>

                  {ann.isUrgent && (
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold text-danger bg-danger/10 border border-danger/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>URGENT</span>
                    </span>
                  )}
                </div>

                <h3 className="font-heading text-base font-bold text-fg">
                  {ann.title}
                </h3>

                <p className="text-xs text-fg-muted line-clamp-3 leading-relaxed">
                  {ann.summary}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-fg-subtle pt-1">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <span>{ann.date}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-mono text-accent font-semibold">
                  Link: {ann.linkText || 'Learn More'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(ann)}
                    className="p-1.5 rounded-sm bg-surface-elevated hover:bg-surface-subtle text-fg border border-border transition-colors cursor-pointer"
                    title="Edit announcement"
                    aria-label={`Edit ${ann.title}`}
                  >
                    <Edit className="w-3.5 h-3.5 text-accent" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingAnn(ann)}
                    className="p-1.5 rounded-sm bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 transition-colors cursor-pointer"
                    title="Delete announcement"
                    aria-label={`Delete ${ann.title}`}
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
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editingAnn ? 'Edit Club Announcement' : 'Post New Club Notice'}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-xl bg-surface border border-border-strong rounded-md p-6 sm:p-8 shadow-md relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-success/10 border border-success/30 flex items-center justify-center text-success">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-fg">
                    {editingAnn ? 'Edit Club Announcement' : 'Post New Club Notice'}
                  </h3>
                  <p className="text-xs text-fg-muted">
                    Pushed instantly to the public homepage announcement carousel.
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-sm text-fg-muted hover:text-fg hover:bg-surface-subtle cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-fg-muted mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Spring Blitz Open Registrations Live"
                  className="w-full px-3.5 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-fg-muted mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg focus:border-accent"
                  >
                    {['TOURNAMENT', 'PRACTICE', 'SELECTION', 'GENERAL'].map(c => (
                      <option key={c} value={c} className="bg-surface text-fg">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-fg-muted mb-1">Display Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg-muted mb-1">Summary / Lead-in *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Short 1-2 sentence lead text shown on card..."
                  className="w-full px-3.5 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg-muted mb-1">Full Detailed Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Complete announcement text displayed when visitors open modal..."
                  className="w-full px-3.5 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-fg-muted mb-1">Button / Link Text</label>
                  <input
                    type="text"
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    placeholder="Register Now"
                    className="w-full px-3.5 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-fg-muted mb-1">Button Target URL</label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="/register or /upcoming"
                    className="w-full px-3.5 py-2 rounded-sm bg-surface-elevated border border-border text-xs text-fg font-mono placeholder:text-fg-subtle focus:border-accent"
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
                  className="w-4 h-4 rounded-xs text-accent bg-surface-elevated border-border-strong cursor-pointer accent-accent"
                />
                <label htmlFor="urgentToggle" className="text-xs font-semibold text-fg cursor-pointer">
                  Highlight as Urgent / Breaking Notice (priority red badge)
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-sm text-xs font-semibold text-fg-muted hover:text-fg bg-surface-elevated border border-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : editingAnn ? 'Update Announcement' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingAnn}
        title="Remove Announcement"
        description={`Are you sure you want to permanently delete "${deletingAnn?.title}"? This cannot be undone.`}
        confirmText="Delete Announcement"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingAnn(null)}
      />

    </div>
  );
}
