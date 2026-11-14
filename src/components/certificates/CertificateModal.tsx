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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Digital Certificate of Excellence"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-surface border border-border-strong rounded-md shadow-md overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-elevated">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-success/10 border border-success/30 flex items-center justify-center text-success">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-bold text-fg flex items-center">
                Digital Certificate of Excellence
                {certificate.role === 'winner' && (
                  <Sparkles className="w-3.5 h-3.5 ml-1.5 text-accent" />
                )}
              </h2>
              <p className="text-xs text-fg-muted font-mono tabular-nums">{certificate.certificate_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-fg-muted hover:text-fg rounded-sm hover:bg-surface-subtle transition-colors"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Canvas Preview Area */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-bg/60 overflow-x-auto">
          <div className="max-w-full overflow-hidden rounded-sm border border-border-strong">
            <CertificateCanvas
              certificate={certificate}
              width={760}
              height={537}
              onCanvasReady={setActiveCanvas}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-surface-elevated border-t border-border flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-medium text-fg bg-surface hover:bg-surface-subtle border border-border transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-success" />
                Copied Link!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5 text-fg-muted" />
                Copy Verification Link
              </>
            )}
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleSavePng}
              disabled={!activeCanvas}
              className="inline-flex items-center px-3.5 py-2 rounded-sm text-xs font-semibold text-fg bg-surface hover:bg-surface-subtle border border-border-strong transition-colors disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4 mr-1.5 text-accent" />
              Save Image (PNG)
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={!activeCanvas || isExportingPdf}
              className="inline-flex items-center px-4 py-2 rounded-sm text-xs font-semibold text-on-accent bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50"
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
