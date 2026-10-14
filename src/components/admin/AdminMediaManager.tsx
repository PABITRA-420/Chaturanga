"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  Database,
  Cloud
} from 'lucide-react';

interface BlobItem {
  key: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

interface AdminMediaManagerProps {
  onSelectImage?: (url: string) => void;
  selectedUrl?: string;
}

export default function AdminMediaManager({ onSelectImage, selectedUrl }: AdminMediaManagerProps) {
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/upload');
      const data = await res.json();
      if (data.success && data.blobs) {
        setBlobs(data.blobs);
      } else {
        setError(data.error || 'Failed to load media assets');
      }
    } catch {
      setError('Network error while loading Netlify Blobs media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPEG, PNG, WebP, SVG, AVIF) are supported.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('File size exceeds the 8MB limit.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.blob) {
        setBlobs(prev => [data.blob, ...prev]);
        if (onSelectImage) {
          onSelectImage(data.blob.url);
        }
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Network error during image upload to Netlify Blobs.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this media asset from Netlify Blobs?')) {
      return;
    }

    setDeletingKey(key);
    try {
      const res = await fetch(`/api/admin/media/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setBlobs(prev => prev.filter(b => b.key !== key));
      } else {
        alert(data.error || 'Failed to delete asset');
      }
    } catch {
      alert('Network error while deleting asset');
    } finally {
      setDeletingKey(null);
    }
  };

  const handleCopyUrl = (url: string, key: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone Card */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center relative overflow-hidden group ${
          uploading 
            ? 'border-[#D4AF7C] bg-[#D4AF7C]/5 pointer-events-none' 
            : 'border-white/15 hover:border-[#D4AF7C]/60 bg-white/[0.02] hover:bg-white/[0.04]'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF7C]/20 to-amber-500/5 border border-[#D4AF7C]/30 flex items-center justify-center text-[#D4AF7C] group-hover:scale-105 transition-transform shadow-lg shadow-[#D4AF7C]/10">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-[#D4AF7C] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <h4 className="font-['Montserrat',sans-serif] font-bold text-base text-[#F5F5F5]">
              {uploading ? 'Uploading to Netlify Blobs...' : 'Upload Image via Netlify Blobs'}
            </h4>
            <p className="text-xs text-[#A0A6B0] mt-1">
              Drag & drop or click to browse • Supports JPEG, PNG, WebP, SVG, AVIF (Max 8MB)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
            <Cloud className="w-3.5 h-3.5" />
            <span>Direct Netlify Blob Object Storage Integration</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Gallery Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <h3 className="font-['Montserrat',sans-serif] font-bold text-sm text-[#F5F5F5]">
            Netlify Blobs Media Library ({blobs.length})
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[#A0A6B0]">
            Immutable Cache
          </span>
        </div>

        <button
          type="button"
          onClick={loadMedia}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-[#A0A6B0] hover:text-[#F5F5F5] transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#D4AF7C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#A0A6B0]">Connecting to Netlify Blobs store...</p>
        </div>
      ) : blobs.length === 0 ? (
        <div className="py-14 text-center border border-white/5 rounded-3xl bg-white/[0.01] space-y-2">
          <ImageIcon className="w-10 h-10 text-[#A0A6B0]/30 mx-auto" />
          <p className="text-xs text-[#A0A6B0]">No images uploaded to Netlify Blobs yet.</p>
          <p className="text-[11px] text-[#A0A6B0]/60">Upload tournament posters, banner photos, or club graphics above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {blobs.map((blob) => {
            const isSelected = selectedUrl === blob.url;
            return (
              <div 
                key={blob.key}
                className={`group rounded-2xl bg-[#090D12] border transition-all overflow-hidden relative flex flex-col ${
                  isSelected 
                    ? 'border-[#D4AF7C] ring-2 ring-[#D4AF7C]/30' 
                    : 'border-white/10 hover:border-[#D4AF7C]/50'
                }`}
              >
                {/* Image Preview Container */}
                <div className="relative aspect-video bg-black/60 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={blob.url} 
                    alt={blob.key}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                    <span className="text-[10px] text-white/90 truncate max-w-[120px] font-mono">
                      {formatBytes(blob.size)}
                    </span>
                    <a
                      href={blob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg bg-black/60 hover:bg-[#D4AF7C] text-white hover:text-black transition cursor-pointer"
                      title="Open full image"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Details & Actions Footer */}
                <div className="p-2.5 flex flex-col justify-between flex-1 bg-[#090D12]">
                  <p className="text-[11px] font-mono text-[#F5F5F5] truncate mb-2" title={blob.key}>
                    {blob.key}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                    {onSelectImage && (
                      <button
                        type="button"
                        onClick={() => onSelectImage(blob.url)}
                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-black'
                            : 'bg-[#D4AF7C]/20 text-[#D4AF7C] hover:bg-[#D4AF7C] hover:text-black'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Use Image'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyUrl(blob.url, blob.key)}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#A0A6B0] hover:text-[#F5F5F5] transition cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedKey === blob.key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(blob.key)}
                      disabled={deletingKey === blob.key}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                      title="Delete from Blobs"
                    >
                      {deletingKey === blob.key ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
