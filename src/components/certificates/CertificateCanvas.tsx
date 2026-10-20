'use client';

import React, { useEffect, useRef } from 'react';
import { CertificateData } from '@/types/certificate';
import { generateQrCodeDataUrl } from '@/lib/certificateCrypto';

interface CertificateCanvasProps {
  certificate: CertificateData;
  width?: number; // display width in CSS px
  height?: number; // display height in CSS px
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export default function CertificateCanvas({
  certificate,
  width = 842, // Landscape A4 display aspect ratio
  height = 595,
  onCanvasReady,
}: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    // Use at least 2x scale for crisp Retina & 300 DPI vector printing
    const dpr = typeof window !== 'undefined' ? Math.max(window.devicePixelRatio || 1, 2) : 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Normalize coordinates so 1 unit = 1 CSS pixel
    ctx.scale(dpr, dpr);

    if (onCanvasReady) {
      onCanvasReady(canvas);
    }

    const renderCertificate = async () => {
      // 1. Background Fill: Obsidian / Midnight Blue
      ctx.fillStyle = '#070A0E';
      ctx.fillRect(0, 0, width, height);

      // Radial dark vignette
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        width / 1.5
      );
      gradient.addColorStop(0, '#0F1622');
      gradient.addColorStop(1, '#06080C');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Outer Brushed Gold Border
      ctx.strokeStyle = '#D4AF7C';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, width - 32, height - 32);

      // Inner Fine Gold Border
      ctx.strokeStyle = 'rgba(212, 175, 124, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(24, 24, width - 48, height - 48);

      // Corner Flourishes (Classic Geometric Accents)
      const drawCorner = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.strokeStyle = '#D4AF7C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(24, 0);
        ctx.lineTo(24, 8);
        ctx.stroke();
        ctx.restore();
      };

      drawCorner(24, 24, 0);
      drawCorner(width - 24, 24, 90);
      drawCorner(width - 24, height - 24, 180);
      drawCorner(24, height - 24, 270);

      // 3. Central Knight Silhouette Watermark
      ctx.save();
      ctx.fillStyle = 'rgba(212, 175, 124, 0.035)';
      ctx.font = 'bold 240px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♞', width / 2, height / 2 + 10);
      ctx.restore();

      // 4. Header: Institution & Club Name
      ctx.textAlign = 'center';

      // Club Tagline
      ctx.fillStyle = '#D4AF7C';
      ctx.font = '600 11px sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText(
        'JALPAIGURI GOVERNMENT ENGINEERING COLLEGE • ESTD 1961',
        width / 2,
        56
      );

      // Main Club Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('CHATURANGA CHESS ARENA', width / 2, 86);

      // Decorative divider with chess emblem
      ctx.strokeStyle = 'rgba(212, 175, 124, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 160, 102);
      ctx.lineTo(width / 2 - 24, 102);
      ctx.moveTo(width / 2 + 24, 102);
      ctx.lineTo(width / 2 + 160, 102);
      ctx.stroke();

      ctx.fillStyle = '#D4AF7C';
      ctx.font = '14px sans-serif';
      ctx.fillText('♚', width / 2, 106);

      // 5. Certificate Category Banner
      let bannerTitle = 'CERTIFICATE OF PARTICIPATION';
      if (certificate.role === 'winner') {
        bannerTitle = 'CERTIFICATE OF CHAMPIONSHIP';
      } else if (
        certificate.role === 'runner_up' ||
        certificate.role === 'second_runner_up'
      ) {
        bannerTitle = 'CERTIFICATE OF EXCELLENCE';
      } else if (
        certificate.role === 'top_board' ||
        certificate.role === 'merit'
      ) {
        bannerTitle = 'CERTIFICATE OF MERIT';
      }

      ctx.fillStyle = '#D4AF7C';
      ctx.font = 'bold 16px serif';
      ctx.letterSpacing = '3px';
      ctx.fillText(bannerTitle, width / 2, 142);

      // 6. Presentation text
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'normal 13px sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('PROUDLY PRESENTED TO', width / 2, 176);

      // Recipient Name
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 28px serif';
      ctx.letterSpacing = '1.5px';
      ctx.fillText(certificate.recipient_name, width / 2, 218);

      // Department & College
      if (certificate.recipient_department) {
        ctx.fillStyle = '#D4AF7C';
        ctx.font = 'italic 13px sans-serif';
        const affiliation = `${certificate.recipient_department}${
          certificate.recipient_college ? ` • ${certificate.recipient_college}` : ''
        }`;
        ctx.fillText(affiliation, width / 2, 244);
      }

      // Achievement Description Paragraph
      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'normal 12.5px sans-serif';

      let awardDescription = `for commendable performance in the`;
      if (certificate.role === 'winner') {
        awardDescription = `for securing 1st Place (Champion) in the`;
      } else if (certificate.role === 'runner_up') {
        awardDescription = `for securing 2nd Place (Runner-up) in the`;
      } else if (certificate.role === 'second_runner_up') {
        awardDescription = `for securing 3rd Place (2nd Runner-up) in the`;
      } else if (certificate.role === 'top_board') {
        awardDescription = `for outstanding board score performance in the`;
      }

      ctx.fillText(awardDescription, width / 2, 280);

      // Tournament Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(certificate.tournament_title, width / 2, 308);

      // Date of Tournament
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11.5px sans-serif';
      ctx.fillText(`Conducted on ${certificate.tournament_date}`, width / 2, 332);

      // 7. QR Code (Bottom-Right)
      try {
        const fullVerificationUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}${certificate.verification_url}`
            : certificate.verification_url;

        const qrDataUrl = await generateQrCodeDataUrl(fullVerificationUrl, {
          width: 90,
          margin: 1,
          color: { dark: '#070A0E', light: '#D4AF7C' },
        });

        if (isMounted) {
          const qrImg = new Image();
          qrImg.src = qrDataUrl;
          await new Promise<void>((resolve) => {
            qrImg.onload = () => {
              // Draw QR code background pill
              ctx.fillStyle = '#0F1622';
              ctx.strokeStyle = 'rgba(212, 175, 124, 0.4)';
              ctx.lineWidth = 1;
              ctx.fillRect(width - 150, height - 150, 110, 110);
              ctx.strokeRect(width - 150, height - 150, 110, 110);

              // Draw QR code
              ctx.drawImage(qrImg, width - 145, height - 145, 100, 100);

              // QR Label
              ctx.fillStyle = '#94A3B8';
              ctx.font = '9px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('SCAN TO VERIFY', width - 95, height - 30);
              resolve();
            };
            qrImg.onerror = () => resolve();
          });
        }
      } catch (err) {
        console.error('Error drawing certificate QR:', err);
      }

      // 8. Bottom Left: Certificate Serial ID & Issue Date
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`Certificate ID: ${certificate.certificate_id}`, 48, height - 76);
      ctx.fillText(
        `Issued on: ${new Date(certificate.issued_at).toLocaleDateString()}`,
        48,
        height - 60
      );

      ctx.fillStyle = '#64748B';
      ctx.font = '8px monospace';
      const shortHash = certificate.verification_hash
        ? `SHA-256: ${certificate.verification_hash.substring(0, 24)}...`
        : '';
      ctx.fillText(shortHash, 48, height - 46);

      // 9. Signatures (Chief Arbiter & Convenor)
      const sigY = height - 100;

      // Chief Arbiter (Left Center)
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(212, 175, 124, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 160, sigY);
      ctx.lineTo(width / 2 - 30, sigY);
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(certificate.arbiter_name, width / 2 - 95, sigY + 16);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px sans-serif';
      ctx.fillText('Chief Tournament Arbiter', width / 2 - 95, sigY + 28);

      // Convenor / President (Right Center)
      ctx.beginPath();
      ctx.moveTo(width / 2 + 30, sigY);
      ctx.lineTo(width / 2 + 160, sigY);
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(
        certificate.convenor_name || 'Convenor, Chaturanga JGEC',
        width / 2 + 95,
        sigY + 16
      );
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px sans-serif';
      ctx.fillText('Club President / Convenor', width / 2 + 95, sigY + 28);

      if (onCanvasReady) {
        onCanvasReady(canvas);
      }
    };

    renderCertificate();

    return () => {
      isMounted = false;
    };
  }, [certificate, width, height, onCanvasReady]);

  return (
    <div className="relative inline-block overflow-hidden rounded-xl shadow-2xl border border-white/10 bg-[#070A0E]">
      <canvas
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="block max-w-full h-auto select-none"
      />
    </div>
  );
}
