import { CertificateData } from '@/types/certificate';

/**
 * Dynamically exports a rendered canvas as a high-resolution Landscape A4 PDF document.
 * Utilizes dynamic import of jsPDF to strictly prevent SSR window undefined crashes.
 */
export async function exportCertificatePdf(
  canvas: HTMLCanvasElement,
  certificate: CertificateData
): Promise<void> {
  if (!canvas) {
    throw new Error('Canvas element is required for PDF export');
  }

  // Dynamic import of UMD bundle ensures Turbopack does not trace optional canvg dependency
  // @ts-expect-error jspdf UMD bundle export
  const jspdfModule = await import('jspdf/dist/jspdf.umd.min.js');
  const jsPDF = jspdfModule.jsPDF || jspdfModule.default;

  // Landscape A4 dimensions: 297mm width, 210mm height
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);

  const cleanRecipient = certificate.recipient_name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${certificate.certificate_id}_${cleanRecipient}.pdf`;

  pdf.save(filename);
}

/**
 * Exports canvas as a high-resolution PNG image directly in browser.
 */
export function exportCertificatePng(
  canvas: HTMLCanvasElement,
  certificate: CertificateData
): void {
  if (!canvas) {
    throw new Error('Canvas element is required for PNG export');
  }

  const cleanRecipient = certificate.recipient_name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${certificate.certificate_id}_${cleanRecipient}.png`;

  const imageUri = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = imageUri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
