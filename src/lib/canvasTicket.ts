/**
 * Canvas 2D Digital Competitor Pass Renderer & PNG Exporter
 * Reusable utility with zero React dependencies.
 */

export interface TicketDrawOptions {
  ticketId: string;
  fullName: string;
  rollNumber: string;
  tournament: string;
  institution: string;
  department: string;
  year?: string;
  date?: string;
  time?: string;
  venue?: string;
  chessPlatform?: string | null;
  chessUsername?: string | null;
  fideId?: string | null;
  ratingCategory?: string | null;
  registeredAt?: string;
}

/**
 * Draws the high-resolution accreditation badge onto a given 2D HTML Canvas.
 */
export function drawPassToCanvas(canvas: HTMLCanvasElement, data: TicketDrawOptions): void {
  canvas.width = 900;
  canvas.height = 1250;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1250);
  bgGrad.addColorStop(0, '#0B0F14');
  bgGrad.addColorStop(0.5, '#121720');
  bgGrad.addColorStop(1, '#0B0F14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 900, 1250);

  // 2. Gold Border
  ctx.strokeStyle = '#D4AF7C';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, 860, 1210);

  // Inner pin stripe
  ctx.strokeStyle = 'rgba(212, 175, 124, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(34, 34, 832, 1182);

  // 3. Lanyard Clip Slot at Top
  ctx.fillStyle = '#06080B';
  ctx.strokeStyle = 'rgba(212, 175, 124, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(370, 46, 160, 22, 11);
  } else {
    ctx.rect(370, 46, 160, 22);
  }
  ctx.fill();
  ctx.stroke();

  // 4. Logo Crest / Chess Knight
  ctx.fillStyle = '#D4AF7C';
  ctx.beginPath();
  ctx.arc(450, 130, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0B0F14';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('♞', 450, 142);

  // 5. Header Titles
  ctx.fillStyle = '#D4AF7C';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('CHATURANGA JGEC • CHESS CLUB', 450, 195);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText(data.tournament || 'COLLEGIATE CHESS TOURNAMENT', 450, 235);

  ctx.fillStyle = '#A0A6B0';
  ctx.font = '13px Arial, sans-serif';
  ctx.fillText('OFFICIAL COMPETITOR ACCREDITATION BADGE', 450, 265);

  // Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.moveTo(60, 290);
  ctx.lineTo(840, 290);
  ctx.stroke();

  // 6. Player Name (Prominent & Bold)
  ctx.fillStyle = '#A0A6B0';
  ctx.font = '13px Arial, sans-serif';
  ctx.fillText('COMPETITOR NAME', 450, 330);

  ctx.fillStyle = '#F5F5F5';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillText((data.fullName || 'COMPETITOR').toUpperCase(), 450, 375);

  // 7. Student Roll Number
  ctx.fillStyle = '#D4AF7C';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(`ROLL NO: ${data.rollNumber || 'N/A'}`, 450, 415);

  // 8. Academic Credentials Box
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fillRect(60, 450, 780, 110);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.strokeRect(60, 450, 780, 110);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#A0A6B0';
  ctx.font = '13px Arial, sans-serif';
  ctx.fillText('DEPARTMENT & YEAR', 90, 485);
  ctx.fillText('INSTITUTION', 500, 485);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText(`${data.department || 'General'} (${data.year || 'UG'})`, 90, 520);
  ctx.fillText(data.institution || 'Jalpaiguri Government Engineering College', 500, 520);

  // 9. Match Schedule Box
  ctx.fillStyle = 'rgba(212, 175, 124, 0.08)';
  ctx.fillRect(60, 580, 780, 110);
  ctx.strokeStyle = 'rgba(212, 175, 124, 0.25)';
  ctx.strokeRect(60, 580, 780, 110);

  ctx.fillStyle = '#D4AF7C';
  ctx.font = '13px Arial, sans-serif';
  ctx.fillText('TOURNAMENT DATE & TIME', 90, 615);
  ctx.fillText('REPORTING VENUE', 500, 615);

  ctx.fillStyle = '#F5F5F5';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText(`${data.date || 'Tournament Day'} • ${data.time || '10:00 AM IST'}`, 90, 650);
  ctx.fillText(data.venue || 'Main Auditorium, JGEC Campus', 500, 650);

  // 10. Rating Category & Chess Profile
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fillRect(60, 710, 780, 80);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.strokeRect(60, 710, 780, 80);

  ctx.fillStyle = '#A0A6B0';
  ctx.font = '13px Arial, sans-serif';
  ctx.fillText('SKILL CATEGORY', 90, 740);
  ctx.fillText('CHESS ID / HANDLE', 500, 740);

  ctx.fillStyle = '#D4AF7C';
  ctx.font = 'bold 16px Arial, sans-serif';
  const platformLabel = data.chessPlatform === 'chesscom' ? 'Chess.com' : (data.chessPlatform === 'lichess' ? 'Lichess' : '');
  const chessIdText = data.fideId && data.fideId !== 'Unrated'
    ? `FIDE: ${data.fideId}` 
    : (data.chessUsername && data.chessUsername !== 'N/A'
      ? `@${data.chessUsername}${platformLabel ? ` (${platformLabel})` : ''}` 
      : (data.ratingCategory || 'Unrated'));
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(chessIdText, 500, 768);

  // 11. Unique Pass Code Banner (Gold Box)
  ctx.fillStyle = '#D4AF7C';
  ctx.fillRect(60, 815, 780, 140);

  ctx.fillStyle = '#0B0F14';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('OFFICIAL ACCREDITED PASS CODE (DATABASE SYNCED)', 90, 848);

  ctx.fillStyle = '#0B0F14';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(data.ticketId || 'CHTR-PASS', 90, 900);

  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillText('STATUS: CONFIRMED • VALID FOR ARBITER DESK CHECK-IN', 90, 932);

  // Draw simulated QR matrix block on the right side
  ctx.fillStyle = '#0B0F14';
  ctx.fillRect(710, 830, 105, 105);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(720, 840, 85, 85);
  ctx.fillStyle = '#0B0F14';
  ctx.fillRect(730, 850, 22, 22);
  ctx.fillRect(770, 850, 22, 22);
  ctx.fillRect(730, 890, 22, 22);
  ctx.fillRect(765, 890, 27, 22);

  // 12. Security Watermark & Arbiter Seal
  ctx.textAlign = 'center';
  ctx.fillStyle = '#A0A6B0';
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('★ FIDE SWISS PAIRING RULES APPLY • ADMISSION PERMITTED TO PLAYING HALL ★', 450, 990);
  ctx.fillText('PRESENT THIS DIGITAL PASSPORT OR COLLEGE ID AT THE ARBITER DESK', 450, 1010);
}

/**
 * Triggers a download of the canvas rendered image as a PNG file.
 */
export function exportCanvasToPng(canvas: HTMLCanvasElement, filename: string): void {
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.download = filename;
  a.href = dataUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
