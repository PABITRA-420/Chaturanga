'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CertificateData } from '@/types/certificate';
import CertificateCanvas from './CertificateCanvas';
import { exportCertificatePdf, exportCertificatePng } from '@/lib/certificatePdfExport';
import { Download, Image as ImageIcon, Copy, Check, X, ShieldCheck, Sparkles } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
}

export default function CertificateModal({
  isOpen,
  onClose,
  certificate,
}: CertificateModalProps) {
  const [activeCanvas, setActiveCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Trigger celebration confetti for merit / winner awards
  useEffect(() => {
    if (isOpen && certificate && certificate.role !== 'participant' && typeof window !== 'undefined') {
      import('canvas-confetti')
        .then((mod) => {
          const confettiFn = mod.default || mod;
          confettiFn({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4AF7C', '#10B981', '#F59E0B', '#FFFFFF'],
          });
        })
        .catch((err) => {
          console.error('Confetti error:', err);
        });
    }
  }, [isOpen, certificate]);

  if (!isOpen || !certificate) return null;

  const handleDownloadPdf = async () => {
    if (!activeCanvas) return;
    setIsExportingPdf(true);
    try {
      await exportCertificatePdf(activeCanvas, certificate);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSavePng = () => {
    if (!activeCanvas) return;
    try {
      exportCertificatePng(activeCanvas, certificate);
    } catch (err) {
      console.error('Failed to save PNG:', err);
    }
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${certificate.verification_url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0F141C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#070A0E]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center">
                Digital Certificate of Excellence
                {certificate.role === 'winner' && (
                  <Sparkles className="w-3.5 h-3.5 ml-1.5 text-amber-400 fill-amber-400" />
                )}
              </h2>
              <p className="text-xs text-slate-400 font-mono">{certificate.certificate_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Canvas Preview Area */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-[#070A0E]/50 overflow-x-auto">
          <div className="max-w-full overflow-hidden shadow-2xl rounded-xl border border-white/10">
            <CertificateCanvas
              certificate={certificate}
              width={760}
              height={537}
              onCanvasReady={setActiveCanvas}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#070A0E] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Copied Link!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Copy Verification Link
              </>
            )}
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleSavePng}
              disabled={!activeCanvas}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4 mr-1.5 text-[#D4AF7C]" />
              Save Image (PNG)
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={!activeCanvas || isExportingPdf}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-[#070A0E] bg-gradient-to-r from-[#D4AF7C] to-[#E5C396] hover:brightness-110 shadow-lg shadow-[#D4AF7C]/15 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-1.5" />
              {isExportingPdf ? 'Exporting PDF...' : 'Download Certificate (PDF)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
