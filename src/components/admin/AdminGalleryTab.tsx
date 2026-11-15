"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { GalleryPhoto } from '@/data/galleryData';
import { 
  Camera, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  X, 
  Upload, 
  Calendar, 
  Image as ImageIcon,
  FolderOpen,
  Trophy,
  ExternalLink
} from 'lucide-react';
import AdminMediaManager from './AdminMediaManager';

const CATEGORIES = [
  'All',
  'Tournaments',
  'Awards',
  'Blitz Night',
  'Club Room'
] as const;

const ASPECTS = ['landscape', 'portrait', 'square'] as const;

export default function AdminGalleryTab() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tournaments' as 'Tournaments' | 'Awards' | 'Blitz Night' | 'Club Room',
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    tournamentName: 'Chaturanga Championship',
    description: '',
    imageSrc: '',
    aspect: 'landscape' as 'landscape' | 'portrait' | 'square',
    tag: 'Tournament'
  });

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success && Array.isArray(data.photos)) {
        setPhotos(data.photos);
      }
    } catch (err) {
      console.error('Failed to load gallery photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPhoto(null);
    setFormData({
      title: '',
      category: 'Tournaments',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      tournamentName: 'Chaturanga Annual Circuit',
      description: '',
      imageSrc: '',
      aspect: 'landscape',
      tag: 'Championship'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      category: photo.category,
      date: photo.date,
      tournamentName: photo.tournamentName,
      description: photo.description,
      imageSrc: photo.imageSrc,
      aspect: photo.aspect,
      tag: photo.tag
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
        setFormData(prev => ({ ...prev, imageSrc: data.blob.url }));
        setNotice({ type: 'success', text: 'Photo uploaded to Netlify Blobs!' });
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
    if (!formData.title.trim() || !formData.imageSrc.trim()) {
      setNotice({ type: 'error', text: 'Title and image are required.' });
      return;
    }

    setSaving(true);
    setNotice(null);

    const payload: Partial<GalleryPhoto> = {
      title: formData.title.trim(),
      category: formData.category,
      date: formData.date.trim(),
      tournamentName: formData.tournamentName.trim(),
      description: formData.description.trim(),
      imageSrc: formData.imageSrc.trim(),
      aspect: formData.aspect,
      tag: formData.tag.trim()
    };

    try {
      const url = '/api/gallery';
      const method = editingPhoto ? 'PUT' : 'POST';
      const body = editingPhoto ? { id: editingPhoto.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save gallery photo.');

      setIsModalOpen(false);
      await loadPhotos();
      setNotice({ type: 'success', text: `Photo "${formData.title}" saved successfully!` });
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message || 'Error saving photo.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (photo: GalleryPhoto) => {
    if (!confirm(`Are you sure you want to delete photo "${photo.title}"?`)) return;

    try {
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(photo.id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPhotos(prev => prev.filter(p => p.id !== photo.id));
        setNotice({ type: 'success', text: `Deleted photo "${photo.title}".` });
        setTimeout(() => setNotice(null), 3000);
      } else {
        alert(data.error || 'Failed to delete photo');
      }
    } catch (err) {
      console.error('Delete photo failed:', err);
    }
  };

  const filteredPhotos = photos.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tournamentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-md bg-surface border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs text-[11px] font-mono font-bold text-accent bg-accent/10 border border-accent/30 mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>COLLEGIATE TOURNAMENT MEMORIES</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-fg tracking-tight">
            Photo Gallery &amp; Event Archive CMS
          </h2>
          <p className="text-xs text-fg-muted mt-1 max-w-2xl">
            Upload and organize collegiate tournament photos, award presentations, blitz arenas, and club room masterclasses at <span className="font-mono text-accent">/gallery</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadPhotos}
            disabled={loading}
            className="p-2.5 rounded-sm bg-surface-elevated hover:bg-surface-subtle border border-border text-fg-muted hover:text-fg transition-colors cursor-pointer"
            title="Refresh Photos"
            aria-label="Refresh Photos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          role="status"
          className={`p-4 rounded-sm flex items-center gap-3 text-xs font-semibold border ${
            notice.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Controls: Category Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-accent text-on-accent'
                  : 'bg-surface text-fg-muted hover:text-fg border border-border'
              }`}
            >
              {cat} {cat === 'All' ? `(${photos.length})` : `(${photos.filter(p => p.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-fg-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, event, tag..."
            className="w-full bg-surface border border-border rounded-sm pl-9 pr-4 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-md overflow-hidden bg-surface border border-border animate-pulse space-y-3">
              <div className="aspect-[4/3] bg-surface-subtle" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-surface-subtle rounded-xs" />
                <div className="h-3 w-1/2 bg-surface-subtle rounded-xs" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="py-16 text-center rounded-md bg-surface border border-border space-y-3">
          <Camera className="w-9 h-9 text-accent/50 mx-auto" />
          <h3 className="font-heading font-bold text-sm text-fg">No Gallery Photos Found</h3>
          <p className="text-xs text-fg-muted">
            {searchQuery ? 'No photos match your search.' : 'Click "Add / Upload Photo" to catalog your first tournament highlight.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-md overflow-hidden bg-surface border border-border hover:border-border-strong transition-colors group flex flex-col justify-between"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="relative aspect-[4/3] w-full bg-surface-elevated overflow-hidden">
                  <img
                    src={photo.imageSrc}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-xs bg-[#09090B]/85 backdrop-blur-xs border border-white/15 text-[10px] font-mono font-bold text-[#D4AF7C]">
                    {photo.tag}
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-xs bg-[#09090B]/85 backdrop-blur-xs border border-white/15 text-[10px] font-mono text-zinc-200">
                    {photo.date}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider">
                    {photo.category} • {photo.tournamentName}
                  </div>
                  <h4 className="font-heading font-bold text-sm text-fg group-hover:text-accent transition-colors line-clamp-1">
                    {photo.title}
                  </h4>
                  {photo.description && (
                    <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-3 flex items-center justify-between border-t border-border mt-2">
                <span className="text-[10px] font-mono text-fg-subtle uppercase">
                  {photo.aspect}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(photo)}
                    className="p-1.5 rounded-sm bg-surface-elevated hover:bg-accent/15 hover:text-accent text-fg-muted border border-border transition-colors cursor-pointer"
                    title="Edit Photo"
                    aria-label={`Edit ${photo.title}`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo)}
                    className="p-1.5 rounded-sm bg-surface-elevated hover:bg-danger/15 hover:text-danger text-fg-muted border border-border transition-colors cursor-pointer"
                    title="Delete Photo"
                    aria-label={`Delete ${photo.title}`}
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
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editingPhoto ? 'Edit Gallery Photo' : 'Upload and Add Photo'}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="relative max-w-2xl w-full my-8 bg-surface border border-border-strong rounded-md shadow-md p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-sm bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-lg text-fg">
                  {editingPhoto ? 'Edit Gallery Photo' : 'Upload & Add Photo'}
                </h3>
              </div>

              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-sm bg-surface-elevated hover:bg-surface-subtle text-fg-muted hover:text-fg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Uploader & Preview Box */}
              <div className="p-4 rounded-sm bg-surface-elevated border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photo Source (Netlify Blobs / Direct URL) *</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                    className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{showMediaPicker ? 'Hide Library' : 'Browse Blobs Library'}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Photo Preview */}
                  <div className="w-full sm:w-36 h-28 rounded-sm border border-border-strong bg-surface overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.imageSrc ? (
                      <img src={formData.imageSrc} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2 text-fg-subtle text-xs">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                        <span>No image</span>
                      </div>
                    )}
                  </div>

                  {/* Input and Buttons */}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      required
                      value={formData.imageSrc}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageSrc: e.target.value }))}
                      placeholder="Paste image URL (https://...) or upload below"
                      className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
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
                        className="px-3.5 py-2 rounded-sm bg-surface hover:bg-surface-subtle border border-border text-xs font-semibold text-fg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Upload className={`w-3.5 h-3.5 ${uploadingImage ? 'animate-spin' : ''}`} />
                        <span>{uploadingImage ? 'Uploading to Blobs...' : 'Upload from Computer'}</span>
                      </button>

                      {formData.imageSrc && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageSrc: '' }))}
                          className="px-3 py-2 rounded-sm bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional Embedded Media Manager Picker */}
                {showMediaPicker && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[11px] text-fg-muted mb-2">Click any photo below to select:</p>
                    <AdminMediaManager
                      selectedUrl={formData.imageSrc}
                      onSelectImage={(url) => {
                        setFormData(prev => ({ ...prev, imageSrc: url }));
                        setShowMediaPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-accent uppercase tracking-wider mb-1">
                  Photo Caption / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Final Round Board 1 Clash • Annual Championship 2025"
                  className="w-full bg-surface-elevated border border-border rounded-sm px-3.5 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                />
              </div>

              {/* Category & Tag & Aspect */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-accent uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-surface-elevated border border-border rounded-sm px-3.5 py-2 text-xs text-fg focus:border-accent"
                  >
                    <option value="Tournaments">Tournaments</option>
                    <option value="Awards">Awards</option>
                    <option value="Blitz Night">Blitz Night</option>
                    <option value="Club Room">Club Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-accent uppercase tracking-wider mb-1">
                    Tag / Badge
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                    placeholder="e.g. Championship / Podium"
                    className="w-full bg-surface-elevated border border-border rounded-sm px-3.5 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-accent uppercase tracking-wider mb-1">
                    Display Aspect
                  </label>
                  <select
                    value={formData.aspect}
                    onChange={(e) => setFormData(prev => ({ ...prev, aspect: e.target.value as any }))}
                    className="w-full bg-surface-elevated border border-border rounded-sm px-3.5 py-2 text-xs text-fg focus:border-accent"
                  >
                    {ASPECTS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tournament Name & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-accent uppercase tracking-wider mb-1">
                    Tournament / Event Name
                  </label>
                  <input
                    type="text"
                    value={formData.tournamentName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tournamentName: e.target.value }))}
                    placeholder="e.g. Chaturanga Annual Championship 2025"
                    className="w-full bg-surface-elevated border border-border rounded-sm px-3.5 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-accent uppercase tracking-wider mb-1">
                    Date String
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="e.g. November 2025"
                    className="w-full bg-surface-elevated border border-border rounded-sm px-3.5 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-accent uppercase tracking-wider mb-1">
                  Description / Memory Context
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Context about the moment, players involved, board dynamics..."
                  className="w-full bg-surface-elevated border border-border rounded-sm px-3.5 py-2 text-xs text-fg placeholder:text-fg-subtle focus:border-accent"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
                  className="px-5 py-2 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Saving Photo...' : editingPhoto ? 'Update Photo' : 'Add Photo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
