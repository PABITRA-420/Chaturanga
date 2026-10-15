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
      <div className="p-6 rounded-3xl bg-[#10141C] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>COLLEGIATE TOURNAMENT MEMORIES</span>
          </div>
          <h2 className="font-['Montserrat',sans-serif] text-xl sm:text-2xl font-black text-[#F5F5F5]">
            Photo Gallery &amp; Event Archive CMS
          </h2>
          <p className="text-xs text-[#A0A6B0] mt-1 max-w-2xl font-['Poppins',sans-serif]">
            Upload and organize collegiate tournament photos, award presentations, blitz arenas, and club room masterclasses at <span className="text-[#D4AF7C]">/gallery</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadPhotos}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-[#A0A6B0] hover:text-[#F5F5F5] transition cursor-pointer"
            title="Refresh Photos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer shadow-md shadow-[#D4AF7C]/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Upload Photo</span>
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

      {/* Controls: Category Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-sm'
                  : 'bg-[#12161D] text-[#A0A6B0] hover:text-white border border-white/5'
              }`}
            >
              {cat} {cat === 'All' ? `(${photos.length})` : `(${photos.filter(p => p.category === cat).length})`}
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
            placeholder="Search by title, event, tag..."
            className="w-full bg-[#12161D] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/60 focus:outline-none focus:border-[#D4AF7C]/60"
          />
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-[#10141C] border border-white/5 animate-pulse space-y-3">
              <div className="aspect-[4/3] bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-[#10141C] border border-white/5 space-y-3">
          <Camera className="w-10 h-10 text-[#D4AF7C]/40 mx-auto" />
          <h3 className="font-bold text-sm text-[#F5F5F5]">No Gallery Photos Found</h3>
          <p className="text-xs text-[#A0A6B0]">
            {searchQuery ? 'No photos match your search.' : 'Click "Add / Upload Photo" to catalog your first tournament highlight.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-2xl overflow-hidden bg-[#10141C] border border-white/10 hover:border-[#D4AF7C]/40 transition group flex flex-col justify-between"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="relative aspect-[4/3] w-full bg-black/60 overflow-hidden">
                  <img
                    src={photo.imageSrc}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-bold text-[#D4AF7C]">
                    {photo.tag}
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] text-[#A0A6B0]">
                    {photo.date}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-bold text-[#D4AF7C] uppercase tracking-wider">
                    {photo.category} • {photo.tournamentName}
                  </div>
                  <h4 className="font-['Montserrat',sans-serif] font-bold text-sm text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors line-clamp-1">
                    {photo.title}
                  </h4>
                  {photo.description && (
                    <p className="text-xs text-[#A0A6B0] line-clamp-2 leading-relaxed">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                <span className="text-[10px] font-mono text-[#A0A6B0] uppercase">
                  {photo.aspect}
                </span>

                <div className="flex items-center gap-1.5 pt-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(photo)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-[#D4AF7C]/20 hover:text-[#D4AF7C] text-[#A0A6B0] transition cursor-pointer"
                    title="Edit Photo"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-[#A0A6B0] transition cursor-pointer"
                    title="Delete Photo"
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
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-['Montserrat',sans-serif] font-bold text-lg text-[#F5F5F5]">
                  {editingPhoto ? 'Edit Gallery Photo' : 'Upload & Add Photo'}
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
              
              {/* Image Uploader & Preview Box */}
              <div className="p-4 rounded-2xl bg-[#0E1218] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#D4AF7C] uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photo Source (Netlify Blobs / Direct URL) *</span>
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

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Photo Preview */}
                  <div className="w-full sm:w-36 h-28 rounded-xl border border-white/15 bg-black/60 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.imageSrc ? (
                      <img src={formData.imageSrc} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2 text-[#A0A6B0]/50 text-xs">
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
                      className="w-full bg-[#12161D] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
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
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Upload className={`w-3.5 h-3.5 ${uploadingImage ? 'animate-bounce' : ''}`} />
                        <span>{uploadingImage ? 'Uploading to Blobs...' : 'Upload from Computer'}</span>
                      </button>

                      {formData.imageSrc && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageSrc: '' }))}
                          className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition cursor-pointer"
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
                    <p className="text-[11px] text-[#A0A6B0] mb-2">Click any photo below to select:</p>
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
                <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                  Photo Caption / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Final Round Board 1 Clash • Annual Championship 2025"
                  className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                />
              </div>

              {/* Category & Tag & Aspect */}
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
                    <option value="Tournaments">Tournaments</option>
                    <option value="Awards">Awards</option>
                    <option value="Blitz Night">Blitz Night</option>
                    <option value="Club Room">Club Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Tag / Badge
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                    placeholder="e.g. Championship / Podium"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Display Aspect
                  </label>
                  <select
                    value={formData.aspect}
                    onChange={(e) => setFormData(prev => ({ ...prev, aspect: e.target.value as any }))}
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
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
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Tournament / Event Name
                  </label>
                  <input
                    type="text"
                    value={formData.tournamentName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tournamentName: e.target.value }))}
                    placeholder="e.g. Chaturanga Annual Championship 2025"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                    Date String
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="e.g. November 2025"
                    className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF7C] uppercase tracking-wider mb-1">
                  Description / Memory Context
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Context about the moment, players involved, board dynamics..."
                  className="w-full bg-[#0E1218] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C]"
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
