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
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`w-full p-8 rounded-md border-2 border-dashed transition-colors cursor-pointer text-center relative group ${
          uploading
            ? 'border-accent bg-accent/10 pointer-events-none'
            : 'border-border-strong hover:border-accent bg-surface-elevated hover:bg-surface-subtle'
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
          <div className="w-12 h-12 rounded-sm bg-accent/10 border border-accent/30 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <h4 className="font-heading font-bold text-base text-fg">
              {uploading ? 'Uploading to Netlify Blobs...' : 'Upload Image via Netlify Blobs'}
            </h4>
            <p className="text-xs text-fg-muted mt-1">
              Click to browse • Supports JPEG, PNG, WebP, SVG, AVIF (Max 8MB)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-success">
            <Cloud className="w-3.5 h-3.5" />
            <span>Direct Netlify Blob Object Storage Integration</span>
          </div>
        </div>
      </button>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-sm bg-danger/10 border border-danger/30 flex items-start gap-3 text-xs text-danger"
        >
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Gallery Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-bold text-sm text-fg">
            Netlify Blobs Media Library ({blobs.length})
          </h3>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-xs bg-surface-elevated border border-border text-fg-muted">
            Immutable Cache
          </span>
        </div>

        <button
          type="button"
          onClick={loadMedia}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface-elevated hover:bg-surface-subtle border border-border text-xs text-fg-muted hover:text-fg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-fg-muted">Connecting to Netlify Blobs store...</p>
        </div>
      ) : blobs.length === 0 ? (
        <div className="py-14 text-center border border-border rounded-md bg-surface-elevated space-y-2">
          <ImageIcon className="w-10 h-10 text-fg-subtle mx-auto" />
          <p className="text-xs text-fg-muted">No images uploaded to Netlify Blobs yet.</p>
          <p className="text-[11px] text-fg-subtle">Upload tournament posters, banner photos, or club graphics above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {blobs.map((blob) => {
            const isSelected = selectedUrl === blob.url;
            return (
              <div
                key={blob.key}
                className={`group rounded-sm bg-surface-elevated border transition-colors overflow-hidden relative flex flex-col ${
                  isSelected
                    ? 'border-accent ring-1 ring-accent'
                    : 'border-border hover:border-border-strong'
                }`}
              >
                {/* Image Preview Container */}
                <div className="relative aspect-video bg-surface-subtle overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blob.url}
                    alt={blob.key}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                    <span className="text-[10px] text-white truncate max-w-[120px] font-mono tabular-nums">
                      {formatBytes(blob.size)}
                    </span>
                    <a
                      href={blob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-xs bg-black/75 hover:bg-accent text-white hover:text-on-accent transition-colors cursor-pointer"
                      title="Open full image"
                      aria-label={`Open ${blob.key} in new tab`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Details & Actions Footer */}
                <div className="p-2.5 flex flex-col justify-between flex-1 bg-surface-elevated">
                  <p className="text-[11px] font-mono text-fg truncate mb-2" title={blob.key}>
                    {blob.key}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-border">
                    {onSelectImage && (
                      <button
                        type="button"
                        onClick={() => onSelectImage(blob.url)}
                        className={`flex-1 py-1 px-2 rounded-xs text-[10px] font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-success text-on-success'
                            : 'bg-accent/15 text-accent hover:bg-accent hover:text-on-accent'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Use Image'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyUrl(blob.url, blob.key)}
                      className="p-1.5 rounded-xs bg-surface hover:bg-surface-subtle border border-border text-fg-muted hover:text-fg transition-colors cursor-pointer"
                      title="Copy URL"
                      aria-label={`Copy URL for ${blob.key}`}
                    >
                      {copiedKey === blob.key ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(blob.key)}
                      disabled={deletingKey === blob.key}
                      className="p-1.5 rounded-xs bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger transition-colors cursor-pointer"
                      title="Delete from Blobs"
                      aria-label={`Delete ${blob.key}`}
                    >
                      {deletingKey === blob.key ? (
                        <div className="w-3.5 h-3.5 border-2 border-danger border-t-transparent rounded-full animate-spin" />
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
