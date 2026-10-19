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
    <div className="p-6 sm:p-8 rounded-3xl bg-[#10141C] border border-white/10 space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
            <Cloud className="w-3.5 h-3.5" />
            <span>Netlify Blobs Object Storage</span>
          </div>
          <h2 className="font-['Montserrat',sans-serif] text-xl font-bold text-[#F5F5F5]">
            Media &amp; Tournament Image Manager
          </h2>
          <p className="text-xs text-[#A0A6B0] max-w-2xl font-['Poppins',sans-serif]">
            Upload official event banners, tournament posters, and winner graphics directly to Netlify Blobs.
          </p>
        </div>
        {editorDraft && (
          <button 
            type="button" 
            onClick={() => onReturnToEditor()} 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition shadow-lg shadow-[#D4AF7C]/20 cursor-pointer"
          >
            <span>Return to Editor</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {editorDraft && (
        <div className="p-4 rounded-2xl bg-[#D4AF7C]/15 border border-[#D4AF7C]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF7C]/20 border border-[#D4AF7C]/40 flex items-center justify-center text-[#D4AF7C] shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F5F5F5]">
                Tournament Editor In Progress: {editorDraft.formData.title ? `"${editorDraft.formData.title}"` : '(Untitled Tournament)'}
              </p>
              <p className="text-[11px] text-[#A0A6B0]">
                Click &quot;Use Image&quot; below to insert an asset into your tournament banner and return to the editor.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => onReturnToEditor()} 
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#D4AF7C] hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            Resume Editor
          </button>
        </div>
      )}

      <AdminMediaManager onSelectImage={(url) => onReturnToEditor(url)} />
    </div>
  );
}
