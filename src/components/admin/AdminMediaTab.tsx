"use client";

import React from 'react';
import { Cloud, ChevronRight, Image as ImageIcon } from 'lucide-react';
import AdminMediaManager from '@/components/admin/AdminMediaManager';
import { EditorDraft } from '@/hooks/useAdminManagement';

export interface AdminMediaTabProps {
  editorDraft: EditorDraft | null;
  onReturnToEditor: (url?: string) => void;
}

export default function AdminMediaTab({
  editorDraft,
  onReturnToEditor
}: AdminMediaTabProps) {
  return (
    <div className="p-6 sm:p-8 rounded-md bg-surface border border-border space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs text-[11px] font-mono font-bold text-success bg-success/10 border border-success/30">
            <Cloud className="w-3.5 h-3.5" />
            <span>Netlify Blobs Object Storage</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-fg tracking-tight">
            Media &amp; Tournament Image Manager
          </h2>
          <p className="text-xs text-fg-muted max-w-2xl">
            Upload official event banners, tournament posters, and winner graphics directly to Netlify Blobs.
          </p>
        </div>
        {editorDraft && (
          <button
            type="button"
            onClick={() => onReturnToEditor()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-heading font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
          >
            <span>Return to Editor</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {editorDraft && (
        <div className="p-4 rounded-sm bg-accent/10 border border-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-fg">
                Tournament Editor In Progress: {editorDraft.formData.title ? `"${editorDraft.formData.title}"` : '(Untitled Tournament)'}
              </p>
              <p className="text-[11px] text-fg-muted">
                Click &quot;Use Image&quot; below to insert an asset into your tournament banner and return to the editor.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onReturnToEditor()}
            className="px-3.5 py-1.5 rounded-sm text-xs font-semibold text-accent hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition-colors cursor-pointer"
          >
            Resume Editor
          </button>
        </div>
      )}

      <AdminMediaManager onSelectImage={(url) => onReturnToEditor(url)} />
    </div>
  );
}
