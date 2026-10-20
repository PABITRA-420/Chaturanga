import { CertificateData } from '@/types/certificate';
import { generateQrCodeDataUrl } from './certificateCrypto';

export interface BulkExportProgress {
  current: number;
  total: number;
  percent: number;
  recipientName: string;
}

/**
 * Draws an individual certificate onto an offscreen canvas at high resolution.
 */
async function renderCertificateToCanvas(
  certificate: CertificateData,
  width = 842,
  height = 595
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const dpr = 2; // Fixed 2x for reliable print export resolution
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create canvas context for bulk export');
  }

  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = '#070A0E';
  ctx.fillRect(0, 0, width, height);

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

  // Gold Borders
  ctx.strokeStyle = '#D4AF7C';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  ctx.strokeStyle = 'rgba(212, 175, 124, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Watermark
  ctx.save();
  ctx.fillStyle = 'rgba(212, 175, 124, 0.035)';
  ctx.font = 'bold 240px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♞', width / 2, height / 2 + 10);
  ctx.restore();

  // Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#D4AF7C';
  ctx.font = '600 11px sans-serif';
  ctx.fillText('JALPAIGURI GOVERNMENT ENGINEERING COLLEGE • ESTD 1961', width / 2, 56);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px serif';
  ctx.fillText('CHATURANGA CHESS ARENA', width / 2, 86);

  let bannerTitle = 'CERTIFICATE OF PARTICIPATION';
  if (certificate.role === 'winner') {
    bannerTitle = 'CERTIFICATE OF CHAMPIONSHIP';
  } else if (certificate.role === 'runner_up' || certificate.role === 'second_runner_up') {
    bannerTitle = 'CERTIFICATE OF EXCELLENCE';
  } else if (certificate.role === 'top_board' || certificate.role === 'merit') {
    bannerTitle = 'CERTIFICATE OF MERIT';
  }

  ctx.fillStyle = '#D4AF7C';
  ctx.font = 'bold 16px serif';
  ctx.fillText(bannerTitle, width / 2, 142);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'normal 13px sans-serif';
  ctx.fillText('PROUDLY PRESENTED TO', width / 2, 176);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 28px serif';
  ctx.fillText(certificate.recipient_name, width / 2, 218);

  if (certificate.recipient_department) {
    ctx.fillStyle = '#D4AF7C';
    ctx.font = 'italic 13px sans-serif';
    ctx.fillText(`${certificate.recipient_department} • ${certificate.recipient_college || 'JGEC'}`, width / 2, 244);
  }

  ctx.fillStyle = '#CBD5E1';
  ctx.font = 'normal 12.5px sans-serif';
  ctx.fillText(`in recognition of participation in ${certificate.tournament_title}`, width / 2, 280);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '11.5px sans-serif';
  ctx.fillText(`Conducted on ${certificate.tournament_date}`, width / 2, 310);

  // QR Code
  try {
    const qrDataUrl = await generateQrCodeDataUrl(certificate.verification_url, {
      width: 90,
      margin: 1,
      color: { dark: '#070A0E', light: '#D4AF7C' },
    });
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 50);
      qrImg.onload = () => {
        clearTimeout(timer);
        ctx.fillStyle = '#0F1622';
        ctx.strokeStyle = 'rgba(212, 175, 124, 0.4)';
        ctx.lineWidth = 1;
        ctx.fillRect(width - 150, height - 150, 110, 110);
        ctx.strokeRect(width - 150, height - 150, 110, 110);
        ctx.drawImage(qrImg, width - 145, height - 145, 100, 100);
        resolve();
      };
      qrImg.onerror = () => {
        clearTimeout(timer);
        resolve();
      };
    });
  } catch (e) {
    // Non-blocking for bulk export
  }

  // Signatures
  const sigY = height - 100;
  ctx.strokeStyle = 'rgba(212, 175, 124, 0.6)';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 160, sigY);
  ctx.lineTo(width / 2 - 30, sigY);
  ctx.moveTo(width / 2 + 30, sigY);
  ctx.lineTo(width / 2 + 160, sigY);
  ctx.stroke();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(certificate.arbiter_name, width / 2 - 95, sigY + 16);
  ctx.fillText(certificate.convenor_name || 'Convenor, Chaturanga JGEC', width / 2 + 95, sigY + 16);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '10px sans-serif';
  ctx.fillText(`Certificate ID: ${certificate.certificate_id}`, 48, height - 60);

  return canvas;
}

/**
 * Batches generation of certificates and produces a consolidated multi-page Landscape A4 PDF.
 */
export async function generateBulkCertificatesPdf(
  certificates: CertificateData[],
  onProgress?: (progress: BulkExportProgress) => void,
  customFilename?: string
): Promise<void> {
  if (!certificates || certificates.length === 0) {
    throw new Error('No certificates supplied for bulk export');
  }

  // Dynamic import of UMD bundle ensures Turbopack does not trace optional canvg dependency
  // @ts-expect-error jspdf UMD bundle export
  const jspdfModule = await import('jspdf/dist/jspdf.umd.min.js');
  const jsPDF = jspdfModule.jsPDF || jspdfModule.default;

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const total = certificates.length;

  for (let i = 0; i < total; i++) {
    const cert = certificates[i];

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100),
        recipientName: cert.recipient_name,
      });
    }

    if (i > 0) {
      pdf.addPage('a4', 'landscape');
    }

    const canvas = await renderCertificateToCanvas(cert);
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);

    // Yield control to UI event loop to allow progress bar rendering
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  const filename = customFilename || `Chaturanga_Certificates_Bulk_${Date.now()}.pdf`;
  pdf.save(filename);
}
