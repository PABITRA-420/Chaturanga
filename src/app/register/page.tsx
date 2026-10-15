"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Trophy, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Sparkles, 
  Download, 
  RotateCcw, 
  Loader2,
  ShieldCheck,
  Clock,
  Award,
  Zap,
  Info,
  ChevronRight,
  Printer,
  AlertTriangle
} from 'lucide-react';

function RegisterForm() {
  const searchParams = useSearchParams();
  const eventParam = searchParams.get('event');

  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [selectedEventId, setSelectedEventId] = useState<string>(eventParam || '');

  useEffect(() => {
    fetch('/api/tournaments?type=upcoming')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tournaments)) {
          setEvents(data.tournaments);
          if (data.tournaments.length > 0) {
            const matched = eventParam ? data.tournaments.find((e: any) => e.id === eventParam) : null;
            setSelectedEventId(matched ? matched.id : data.tournaments[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, [eventParam]);

  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    institution: '',
    department: '',
    year: '2nd Year',
    email: '',
    phone: '',
    chessPlatform: '' as 'chesscom' | 'lichess' | '',
    chessUsername: '',
    fideId: '',
    ratingCategory: 'Club Player (1200 - 1600)',
    acceptTerms: false
  });
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [duplicateTicket, setDuplicateTicket] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<{ synced: boolean; configured: boolean; message?: string } | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const verifySequenceRef = useRef(0);
  const [chessVerification, setChessVerification] = useState<{
    checking: boolean;
    hasChecked: boolean;
    lastCheckedHandle: string;
    lastCheckedPlatform: string;
    result: {
      exists: boolean;
      platform?: string;
      username?: string;
      name?: string | null;
      avatar?: string | null;
      title?: string | null;
      ratings?: { rapid?: number | null; blitz?: number | null; bullet?: number | null; classical?: number | null };
      message?: string;
      unavailable?: boolean;
    } | null;
  }>({
    checking: false,
    hasChecked: false,
    lastCheckedHandle: '',
    lastCheckedPlatform: '',
    result: null
  });

  // Dedicated verification function
  const verifyChessAccount = async (platform: string, username: string) => {
    const handle = username.trim();
    const seq = ++verifySequenceRef.current;

    if (!platform || !handle) {
      setChessVerification({ checking: false, hasChecked: false, lastCheckedHandle: '', lastCheckedPlatform: '', result: null });
      return null;
    }

    setChessVerification(prev => {
      const isDiff =
        prev.lastCheckedHandle.toLowerCase() !== handle.toLowerCase() ||
        prev.lastCheckedPlatform !== platform;
      return {
        ...prev,
        checking: true,
        lastCheckedHandle: handle,
        lastCheckedPlatform: platform,
        result: isDiff ? null : prev.result
      };
    });

    try {
      const res = await fetch(`/api/player/verify?platform=${encodeURIComponent(platform)}&username=${encodeURIComponent(handle)}`);
      if (seq !== verifySequenceRef.current) return null;

      if (res.ok) {
        const data = await res.json();
        if (seq !== verifySequenceRef.current) return null;

        setChessVerification({
          checking: false,
          hasChecked: true,
          lastCheckedHandle: handle,
          lastCheckedPlatform: platform,
          result: data
        });

        // Automatically align skill tier if ratings exist
        if (data.exists && data.ratings) {
          const rating = data.ratings.rapid || data.ratings.classical || data.ratings.blitz;
          if (rating) {
            let cat = 'Club Player (1200 - 1600)';
            if (rating < 1200) cat = 'Beginner (< 1200)';
            else if (rating >= 2000) cat = 'FIDE Rated / Master (2000+)';
            else if (rating >= 1600) cat = 'Advanced (1600 - 2000)';
            handleFieldChange('ratingCategory', cat);
          }
        }
        return data;
      } else {
        const errJson = await res.json().catch(() => null);
        if (seq !== verifySequenceRef.current) return null;

        const unavailable = {
          exists: false,
          unavailable: true,
          message: errJson?.error || 'Verification service temporarily unavailable. Please retry.'
        };
        setChessVerification({ checking: false, hasChecked: true, lastCheckedHandle: handle, lastCheckedPlatform: platform, result: unavailable });
        return unavailable;
      }
    } catch (err: any) {
      if (seq !== verifySequenceRef.current) return null;

      const failed = {
        exists: false,
        unavailable: true,
        message: err.message || 'Network error while contacting verification service. Please retry.'
      };
      setChessVerification({ checking: false, hasChecked: true, lastCheckedHandle: handle, lastCheckedPlatform: platform, result: failed });
      return failed;
    }
  };

  // Live account verification on Chess.com / Lichess
  useEffect(() => {
    const handle = formData.chessUsername.trim();
    const platform = formData.chessPlatform;
    if (!handle || !platform) {
      verifySequenceRef.current++;
      setChessVerification({ checking: false, hasChecked: false, lastCheckedHandle: '', lastCheckedPlatform: '', result: null });
      return;
    }

    const isDifferent =
      chessVerification.lastCheckedHandle.toLowerCase() !== handle.toLowerCase() ||
      chessVerification.lastCheckedPlatform !== platform;

    if (isDifferent) {
      verifySequenceRef.current++;
      setChessVerification(prev => ({
        ...prev,
        checking: false,
        hasChecked: false,
        result: null
      }));
    } else if (chessVerification.hasChecked || chessVerification.checking) {
      return;
    }

    const timer = setTimeout(() => {
      verifyChessAccount(platform, handle);
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.chessUsername, formData.chessPlatform]);

  // Auto-restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chaturanga_reg_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed, acceptTerms: false }));
      }
    } catch {}
  }, []);

  // Sync draft to localStorage on change
  const handleFieldChange = (field: string, val: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: val };
      try {
        localStorage.setItem('chaturanga_reg_draft', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (field === 'chessUsername' || field === 'chessPlatform') {
      const nextUsername = field === 'chessUsername' ? String(val).trim() : formData.chessUsername.trim();
      const nextPlatform = field === 'chessPlatform' ? val : formData.chessPlatform;
      if (
        nextUsername.toLowerCase() !== chessVerification.lastCheckedHandle.toLowerCase() ||
        nextPlatform !== chessVerification.lastCheckedPlatform
      ) {
        verifySequenceRef.current++;
        setChessVerification(prev => ({
          ...prev,
          checking: false,
          hasChecked: false,
          result: null
        }));
      }
    }
  };

  const currentEvent = events.find((e: any) => e.id === selectedEventId) || events[0] || null;

  const isFieldEnabled = (fieldId: string) => {
    if (!currentEvent?.formConfig) return true;
    const f = currentEvent.formConfig.find((item: any) => item.id === fieldId);
    return f ? f.enabled : true;
  };

  const isFieldRequired = (fieldId: string) => {
    if (!currentEvent?.formConfig) return true;
    const f = currentEvent.formConfig.find((item: any) => item.id === fieldId);
    return f ? f.required : true;
  };

  const isRegistrationOpen = currentEvent ? (currentEvent.status === 'open' || !currentEvent.status) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isRegistrationOpen) {
      setErrorMsg('Registrations for this tournament are currently closed by the Arbiter.');
      return;
    }

    if (isFieldEnabled('fullName') && isFieldRequired('fullName') && !formData.fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (isFieldEnabled('rollNumber') && isFieldRequired('rollNumber') && !formData.rollNumber.trim()) {
      setErrorMsg('Please enter your university/college roll number.');
      return;
    }
    if (isFieldEnabled('email') && isFieldRequired('email') && (!formData.email.trim() || !formData.email.includes('@'))) {
      setErrorMsg('Please enter a valid email address for pairing notifications.');
      return;
    }
    if (isFieldEnabled('phone') && isFieldRequired('phone') && (!formData.phone.trim() || formData.phone.length < 10)) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp/mobile number.');
      return;
    }
    // Strict Chess Platform & Player ID Verification
    if (isFieldEnabled('chessUsername')) {
      const isRequired = isFieldRequired('chessUsername');
      const handle = formData.chessUsername.trim();

      if (isRequired) {
        if (!formData.chessPlatform) {
          setErrorMsg('Please select your chess platform: Chess.com or Lichess.');
          const el = document.getElementById('chess-platform-selector');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        if (!handle) {
          const platformName = formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess';
          setErrorMsg(`Please enter your ${platformName} player ID / username.`);
          const el = document.getElementById('chess-handle-input');
          if (el) el.focus();
          return;
        }
      } else {
        // Optional: require platform only if a handle is entered
        if (handle && !formData.chessPlatform) {
          setErrorMsg('Please select your chess platform: Chess.com or Lichess.');
          const el = document.getElementById('chess-platform-selector');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      // If handle is present, verify it (both required and optional with entered handle)
      if (handle) {
        if (chessVerification.checking) {
          setErrorMsg(`Verifying your player account on ${formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'}... Please wait a few seconds.`);
          return;
        }

        let verResult = chessVerification.result;
        if (
          !chessVerification.hasChecked ||
          chessVerification.lastCheckedHandle.toLowerCase() !== handle.toLowerCase() ||
          chessVerification.lastCheckedPlatform !== formData.chessPlatform ||
          !verResult
        ) {
          setIsSubmitting(true);
          verResult = await verifyChessAccount(formData.chessPlatform, handle);
          setIsSubmitting(false);
        }

        if (verResult?.unavailable) {
          setErrorMsg(verResult.message || 'Verification service is temporarily unavailable. Please retry verification before submitting.');
          const el = document.getElementById('chess-handle-input');
          if (el) el.focus();
          return;
        }

        if (!verResult || !verResult.exists) {
          const platformName = formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess';
          setErrorMsg(`Registration unsuccessful: Player "@${handle}" does not exist on ${platformName}. Check your ID carefully!`);
          const el = document.getElementById('chess-handle-input');
          if (el) el.focus();
          return;
        }
      }
    }

    if (isFieldEnabled('fideId') && isFieldRequired('fideId') && !formData.fideId.trim()) {
      setErrorMsg('Please enter your official FIDE ID.');
      return;
    }

    // Validate custom required fields
    if (currentEvent.customFields) {
      for (const cf of currentEvent.customFields) {
        if (cf.required && !customAnswers[cf.id]) {
          setErrorMsg(`Please answer required question: "${cf.label}"`);
          return;
        }
      }
    }

    if (!formData.acceptTerms) {
      setErrorMsg('Please acknowledge adherence to official FIDE & Chaturanga Fair Play regulations.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customAnswers,
          tournament: currentEvent.title,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.isDuplicate && data.existingTicketId) {
          setDuplicateTicket(data.existingTicketId);
        }
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Success: clear draft
      try {
        localStorage.removeItem('chaturanga_reg_draft');
      } catch {}

      setTicketId(data.ticketId);
      setDuplicateTicket(null);
      setSheetStatus({
        synced: Boolean(data.syncedToSheet),
        configured: Boolean(data.sheetConfigured),
        message: data.message,
      });
      setFormSubmitted(true);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormSubmitted(false);
    setSheetStatus(null);
    setChessVerification({
      checking: false,
      hasChecked: false,
      lastCheckedHandle: '',
      lastCheckedPlatform: '',
      result: null
    });
    setFormData({
      fullName: '',
      rollNumber: '',
      institution: '',
      department: '',
      year: '2nd Year',
      email: '',
      phone: '',
      chessPlatform: '',
      chessUsername: '',
      fideId: '',
      ratingCategory: 'Club Player (1200 - 1600)',
      acceptTerms: false
    });
  };

  const [isDownloading, setIsDownloading] = useState(false);

  // -------------------------------------------------------------
  // GENERATE & DOWNLOAD NAMECARD / PASS AS PNG IMAGE
  // -------------------------------------------------------------
  const handleDownloadPassPNG = () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
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
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(370, 46, 160, 22, 11);
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
      ctx.fillText(currentEvent.title, 450, 235);

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
      ctx.fillText(formData.fullName.toUpperCase(), 450, 375);

      // 7. Student Roll Number
      ctx.fillStyle = '#D4AF7C';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`ROLL NO: ${formData.rollNumber}`, 450, 415);

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
      ctx.fillText(`${formData.department} (${formData.year})`, 90, 520);
      ctx.fillText(formData.institution, 500, 520);

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
      ctx.fillText(`${currentEvent.date} • ${currentEvent.time}`, 90, 650);
      ctx.fillText(currentEvent.venue, 500, 650);

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
      const platformLabel = formData.chessPlatform === 'chesscom' ? 'Chess.com' : (formData.chessPlatform === 'lichess' ? 'Lichess' : '');
      const chessIdText = formData.fideId ? `FIDE: ${formData.fideId}` : (formData.chessUsername ? `@${formData.chessUsername}${platformLabel ? ` (${platformLabel})` : ''}` : 'Unrated');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(chessIdText, 500, 768);

      // 11. Unique Pass Code Banner (Gold Box)
      ctx.fillStyle = '#D4AF7C';
      ctx.fillRect(60, 815, 780, 140);

      ctx.fillStyle = '#0B0F14';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText('OFFICIAL ACCREDITED PASS CODE (SYNCED TO SPREADSHEET DATABASE)', 90, 848);

      ctx.fillStyle = '#0B0F14';
      ctx.font = 'bold 36px monospace';
      ctx.fillText(ticketId, 90, 900);

      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText('STATUS: CONFIRMED • VALID FOR ROUNDS 1 THROUGH 5', 90, 932);

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

      // Trigger instant PNG download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `Chaturanga-Pass-${ticketId}.png`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error generating pass PNG:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW: CONFIRMED ENTRY PASS & TICKET
  // -------------------------------------------------------------
  if (formSubmitted) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-400">
        
        {/* Celebration Banner with Gold Particle Glow */}
        <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#181D26] via-[#12161D] to-[#0A0D12] border-2 border-[#D4AF7C]/60 text-center space-y-4 shadow-[0_10px_50px_rgba(212,175,124,0.2)]">
          <div className="animate-shimmer" />

          {/* Golden confetti dots floating in background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <span className="absolute top-4 left-10 text-lg opacity-70 animate-bounce">✨</span>
            <span className="absolute top-8 right-14 text-base opacity-70 animate-bounce" style={{ animationDelay: '300ms' }}>🏆</span>
            <span className="absolute bottom-6 left-16 text-xs text-[#D4AF7C] opacity-80 animate-pulse">✦</span>
            <span className="absolute bottom-10 right-20 text-sm text-[#F3E2B8] opacity-80 animate-pulse" style={{ animationDelay: '500ms' }}>★</span>
            <span className="absolute top-1/2 left-4 text-xs text-[#D4AF7C] opacity-50">✦</span>
            <span className="absolute top-1/3 right-6 text-xs text-[#D4AF7C] opacity-60">✨</span>
          </div>

          <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-32 bg-[#D4AF7C]/25 blur-3xl pointer-events-none rounded-full" />
          
          <div className="relative inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-[#D4AF7C] via-[#F3E2B8] to-[#D4AF7C] text-[#0B0F14] shadow-xl shadow-[#D4AF7C]/30 mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1 relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4AF7C]">
              OFFICIAL ENTRY ACCREDITED
            </span>
            <h2 className="font-['Montserrat',sans-serif] font-black text-2xl sm:text-4xl text-[#F5F5F5]">
              You're Ready for <span className="gold-gradient-text">Battle</span>!
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#A0A6B0] max-w-lg mx-auto font-['Inter',sans-serif] leading-relaxed relative z-10">
            Your unique accreditation code is generated and saved directly into the Google Sheets tournament registry. Download your high-resolution lanyard pass below.
          </p>

          {/* Google Sheets Sync Telemetry Badge */}
          <div className="pt-2 relative z-10">
            {sheetStatus?.synced ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Google Sheets Live Database Synced &amp; Locked!</span>
              </div>
            ) : sheetStatus?.configured ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                <span>Pass generated. Spreadsheet synchronization registered.</span>
              </div>
            ) : (
              <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#D4AF7C]" />
                  <span>Free Google Sheet Automation active for organizers.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  className="underline font-bold text-[#D4AF7C] hover:text-white cursor-pointer ml-1"
                >
                  {showSetupGuide ? 'Hide Instructions' : 'View 2-Min Setup Guide'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Setup Guide Modal / Accordion */}
        {showSetupGuide && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12161D] border border-white/10 text-xs space-y-4 font-['Inter',sans-serif] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-bold text-sm text-[#D4AF7C] font-['Montserrat',sans-serif] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF7C]" />
                <span>100% Free Google Apps Script &amp; Chart Automation</span>
              </h4>
              <button 
                onClick={() => setShowSetupGuide(false)}
                className="text-[#A0A6B0] hover:text-white cursor-pointer font-bold px-2 py-1 rounded-lg hover:bg-white/5"
              >
                ✕ Close
              </button>
            </div>
            
            <p className="text-[#A0A6B0] leading-relaxed">
              Google Apps Script runs completely free on your Google Drive. The script in <code className="text-[#D4AF7C] bg-white/5 px-1.5 py-0.5 rounded font-mono">google-apps-script/Code.gs</code> handles player entry logging and auto-builds <strong>Department</strong> and <strong>Rating Distribution</strong> charts:
            </p>

            <ol className="list-decimal list-inside space-y-2 text-[#F5F5F5] pl-1 leading-relaxed">
              <li>Open <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-[#D4AF7C] underline font-bold">sheets.new</a> in your browser.</li>
              <li>Click <strong>Extensions &gt; Apps Script</strong> in your Google Sheet menu.</li>
              <li>Replace all editor code with the code from <code className="text-[#D4AF7C] bg-white/5 px-1 py-0.5 rounded font-mono">google-apps-script/Code.gs</code> and click <strong>Save</strong>.</li>
              <li>Click <strong>Deploy &gt; Manage deployments</strong> &rarr; Edit &rarr; Select <strong>Who has access: Anyone</strong>.</li>
              <li>Copy the Web App URL and place it in your <code className="text-[#D4AF7C] bg-white/5 px-1 py-0.5 rounded font-mono">.env.local</code>.</li>
            </ol>
          </div>
        )}

        {/* ULTRA-PREMIUM DIGITAL TOURNAMENT NAMECARD / PASS */}
        <div className="relative rounded-3xl bg-[#12161D] border-2 border-[#D4AF7C]/40 shadow-2xl overflow-hidden font-['Inter',sans-serif]">
          {/* Holographic Watermark glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D4AF7C]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#D4AF7C]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Lanyard Clip Slot Cutout Simulation */}
          <div className="pt-6 pb-2 text-center">
            <div className="w-28 h-3.5 rounded-full bg-black/70 border border-[#D4AF7C]/30 mx-auto shadow-inner flex items-center justify-center">
              <div className="w-20 h-1 rounded-full bg-white/10" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#A0A6B0] block mt-1">
              OFFICIAL LANYARD ACCREDITATION BADGE
            </span>
          </div>

          {/* Ticket Header Ribbon */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-black/60 via-[#12161D] to-black/60 border-y border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF7C] to-[#997945] text-[#0B0F14] flex items-center justify-center font-black text-xl shadow-lg shadow-[#D4AF7C]/20">
                ♞
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF7C]">
                    CHATURANGA JGEC
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                    VERIFIED ENTRY
                  </span>
                </div>
                <h3 className="font-['Montserrat',sans-serif] font-black text-lg sm:text-xl text-[#F5F5F5] mt-0.5">
                  {currentEvent.title}
                </h3>
              </div>
            </div>

            <div className="text-right pl-4 sm:border-l border-white/10">
              <span className="text-[10px] text-[#A0A6B0] uppercase tracking-wider block font-medium">UNIQUE PASS CODE</span>
              <span className="font-mono text-base font-black text-[#D4AF7C] tracking-wider">{ticketId}</span>
              <span className="text-[9px] text-emerald-400 block font-medium mt-0.5">✓ Synced in Spreadsheet</span>
            </div>
          </div>

          {/* Ticket Core Content Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Player Main Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] text-[#A0A6B0] uppercase tracking-wider font-semibold">Player Name</span>
                  <div className="font-['Montserrat',sans-serif] font-black text-lg text-[#F5F5F5]">
                    {formData.fullName}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-[#A0A6B0] uppercase tracking-wider font-semibold">Roll / Student ID</span>
                  <div className="font-mono font-bold text-base text-[#D4AF7C]">
                    {formData.rollNumber}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-[#A0A6B0] uppercase tracking-wider font-semibold">Department &amp; Year</span>
                  <div className="text-xs text-[#F5F5F5] font-medium">
                    {formData.department} ({formData.year})
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-[#A0A6B0] uppercase tracking-wider font-semibold">Institution</span>
                  <div className="text-xs text-[#F5F5F5] font-medium truncate">
                    {formData.institution}
                  </div>
                </div>
              </div>

              {/* Tournament Schedule Coordinates */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#D4AF7C] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Match Date &amp; Time</span>
                    <span className="text-[#F5F5F5] font-semibold">{currentEvent.date} ({currentEvent.time})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D4AF7C] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Reporting Venue</span>
                    <span className="text-[#F5F5F5] font-semibold">{currentEvent.venue}</span>
                  </div>
                </div>
              </div>

              {/* Chess Ratings */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="px-3 py-1 rounded-lg bg-[#D4AF7C]/15 border border-[#D4AF7C]/30 text-[#D4AF7C] font-semibold">
                  {formData.ratingCategory}
                </span>
                {formData.chessUsername && (
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[#A0A6B0]">
                    Profile: <strong className="text-[#F5F5F5] font-mono">@{formData.chessUsername} ({formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'})</strong>
                  </span>
                )}
                {formData.fideId && (
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[#A0A6B0]">
                    FIDE ID: <strong className="text-[#F5F5F5] font-mono">{formData.fideId}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Simulated Scannable Badge & Arbiter Seal */}
            <div className="flex flex-col items-center justify-between p-5 rounded-2xl bg-black/40 border border-white/5 text-center space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF7C]">
                  ARBITER SCAN CODE
                </span>
                <p className="text-[10px] text-[#A0A6B0]">Present at desk for pairing</p>
              </div>

              {/* High-tech QR Pattern Simulator */}
              <div className="p-3 bg-white rounded-xl shadow-inner flex items-center justify-center">
                <svg className="w-24 h-24" viewBox="0 0 100 100" fill="#0B0F14">
                  {/* Outer corner squares */}
                  <rect x="0" y="0" width="30" height="30" rx="3" fill="#0B0F14" />
                  <rect x="5" y="5" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="10" y="10" width="10" height="10" fill="#0B0F14" />

                  <rect x="70" y="0" width="30" height="30" rx="3" fill="#0B0F14" />
                  <rect x="75" y="5" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="80" y="10" width="10" height="10" fill="#0B0F14" />

                  <rect x="0" y="70" width="30" height="30" rx="3" fill="#0B0F14" />
                  <rect x="5" y="75" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="10" y="80" width="10" height="10" fill="#0B0F14" />

                  {/* Simulated internal data blocks */}
                  <rect x="40" y="10" width="8" height="8" />
                  <rect x="52" y="10" width="8" height="8" />
                  <rect x="40" y="24" width="20" height="6" />
                  <rect x="10" y="42" width="14" height="6" />
                  <rect x="30" y="40" width="10" height="10" />
                  <rect x="48" y="40" width="12" height="12" />
                  <rect x="68" y="42" width="22" height="6" />
                  <rect x="40" y="60" width="12" height="8" />
                  <rect x="60" y="60" width="10" height="10" />
                  <rect x="80" y="60" width="10" height="10" />
                  <rect x="40" y="78" width="18" height="12" />
                  <rect x="66" y="78" width="14" height="12" />
                  <rect x="88" y="78" width="8" height="12" />
                </svg>
              </div>

              <div className="font-mono text-[11px] text-[#A0A6B0]">
                AUTHENTICATED • JGEC-ARB
              </div>
            </div>

          </div>

          {/* Perforated Stub Line */}
          <div className="relative py-2 px-6 flex items-center justify-between border-t border-dashed border-white/20">
            <span className="text-[10px] text-[#A0A6B0] uppercase tracking-wider font-medium">
              ACCREDITED COMPETITOR BADGE • VALID FOR ALL 5 TOURNAMENT ROUNDS
            </span>
            <span className="text-[10px] font-bold text-[#D4AF7C] tracking-widest font-mono">
              ★ FAIR PLAY VERIFIED ★
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Primary Action: Download High-Res Namecard PNG */}
          <button
            type="button"
            onClick={handleDownloadPassPNG}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 transition shadow-lg shadow-[#D4AF7C]/25 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Image...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Pass (PNG Image)</span>
              </>
            )}
          </button>

          {/* Secondary Action: Print / PDF Pass */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold text-[#F5F5F5] bg-white/10 hover:bg-white/15 border border-white/15 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D4AF7C]" />
            <span>Print / Save PDF</span>
          </button>

          {/* Tertiary Action: Register Another */}
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Register Another Player</span>
          </button>
        </div>

      </div>
    );
  }

  if (loadingEvents) {
    return (
      <div className="p-12 rounded-3xl bg-[#12161D] border border-white/10 text-center space-y-4 max-w-xl mx-auto my-12 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-white/5 mx-auto" />
        <div className="h-6 w-48 bg-white/10 rounded-full mx-auto" />
        <div className="h-4 w-72 bg-white/5 rounded-full mx-auto" />
      </div>
    );
  }

  if (events.length === 0 || !currentEvent) {
    return (
      <div className="p-10 sm:p-14 rounded-3xl bg-[#12161D] border border-white/10 text-center space-y-4 max-w-xl mx-auto my-12 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 flex items-center justify-center mx-auto text-[#D4AF7C]">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-['Montserrat',sans-serif] font-bold text-xl text-[#F5F5F5]">
            No Open Tournament Registrations
          </h3>
          <p className="text-xs sm:text-sm text-[#A0A6B0] leading-relaxed">
            There are currently no scheduled tournaments accepting registrations. Please check back soon or browse our tournament calendar for upcoming announcements.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/upcoming"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 shadow-md transition"
          >
            <span>View Tournament Calendar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: REGISTRATION FORM & LIVE PASS PREVIEW
  // -------------------------------------------------------------
  return (
    <div className="space-y-10">
      
      {/* Visual Step Indicator */}
      <div className="max-w-xl mx-auto flex items-center justify-between px-4 text-xs font-['Inter',sans-serif]">
        <div className="flex items-center gap-2 text-[#D4AF7C]">
          <span className="w-6 h-6 rounded-full bg-[#D4AF7C] text-[#0B0F14] font-bold flex items-center justify-center text-[11px]">
            1
          </span>
          <span className="font-semibold hidden sm:inline">Select Event</span>
        </div>
        <div className="h-[1px] flex-1 mx-3 bg-[#D4AF7C]/30" />
        <div className="flex items-center gap-2 text-[#D4AF7C]">
          <span className="w-6 h-6 rounded-full bg-[#D4AF7C] text-[#0B0F14] font-bold flex items-center justify-center text-[11px]">
            2
          </span>
          <span className="font-semibold hidden sm:inline">Fill Credentials</span>
        </div>
        <div className="h-[1px] flex-1 mx-3 bg-white/10" />
        <div className="flex items-center gap-2 text-[#A0A6B0]">
          <span className="w-6 h-6 rounded-full bg-white/10 text-[#A0A6B0] font-bold flex items-center justify-center text-[11px]">
            3
          </span>
          <span className="font-medium hidden sm:inline">Instant Pass</span>
        </div>
      </div>

      {/* Two-Column Master Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Form (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12161D]/90 backdrop-blur-xl border border-white/10 shadow-2xl space-y-7 relative overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF7C]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Section 1: Multi-Tournament Choice Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-[#D4AF7C] flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#D4AF7C]" />
                  <span>Select Tournament Event ({events.length} Available)</span>
                </label>
                <span className="text-[11px] text-[#A0A6B0] hidden sm:inline">
                  Click any card to load that tournament&apos;s registration form
                </span>
              </div>

              {/* Responsive Multi-Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-3">
                {events.map((event: any) => {
                  const isSelected = event.id === selectedEventId;
                  const isOpen = event.status === 'open';
                  const isClosingSoon = event.status === 'closing_soon';
                  const isClosed = event.status === 'closed';

                  const maxSlots = event.maxSlots || 64;
                  const registered = event.registeredCount || 0;
                  const capacityPercent = Math.min(100, Math.round((registered / maxSlots) * 100));
                  const spotsLeft = Math.max(0, maxSlots - registered);

                  return (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEventId(event.id);
                        if (typeof window !== 'undefined') {
                          window.history.replaceState(null, '', `?event=${event.id}`);
                        }
                      }}
                      className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#D4AF7C]/25 via-[#181D26] to-[#12161D] border-[#D4AF7C] shadow-xl shadow-[#D4AF7C]/20 scale-[1.02] ring-1 ring-[#D4AF7C]'
                          : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top Chips */}
                        <div className="flex items-center justify-between gap-1">
                          {isClosed ? (
                            <span className="text-[9px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
                              <span>● CLOSED</span>
                            </span>
                          ) : isClosingSoon ? (
                            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              <span>CLOSING SOON</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>OPEN</span>
                            </span>
                          )}

                          {isSelected ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF7C] text-[#0B0F14] shadow-sm">
                              ✓ Selected
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-[#D4AF7C] font-semibold">
                              {event.entryFee || 'Free'}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <div className="font-['Montserrat',sans-serif] font-bold text-xs text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors leading-tight line-clamp-2">
                          {event.title}
                        </div>

                        {/* Schedule & Venue Coordinates */}
                        <div className="space-y-1 text-[10px] text-[#A0A6B0]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#D4AF7C] shrink-0" />
                            <span className="truncate">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#D4AF7C] shrink-0" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        </div>

                        {/* Live Capacity Bar */}
                        <div className="pt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[9px] text-[#A0A6B0]">
                            <span>Capacity</span>
                            <span className="font-mono text-[#F5F5F5] font-semibold">
                              {registered}/{maxSlots} ({spotsLeft} left)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                capacityPercent >= 90
                                  ? 'bg-red-400'
                                  : capacityPercent >= 70
                                  ? 'bg-amber-400'
                                  : 'bg-[#D4AF7C]'
                              }`}
                              style={{ width: `${capacityPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Prize / Fee footer */}
                      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                        <span className="text-[#A0A6B0]">Format:</span>
                        <span className="font-semibold text-[#F5F5F5] truncate max-w-[120px] text-right">
                          {event.format?.split('•')[0] || event.format}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Link to Pass Verification */}
            <div className="p-3.5 rounded-2xl bg-[#12161D] border border-white/10 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#A0A6B0]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF7C]" />
                <span>Already registered for a tournament?</span>
              </div>
              <Link 
                href="/my-ticket"
                className="text-[#D4AF7C] hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>Check pass &amp; seat status</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Duplicate Registration Detected Banner */}
            {duplicateTicket && (
              <div className="p-5 rounded-2xl bg-[#D4AF7C]/15 border-2 border-[#D4AF7C] text-xs space-y-2 shadow-lg animate-in fade-in duration-300">
                <div className="flex items-center gap-2 font-bold text-[#D4AF7C] text-sm">
                  <Award className="w-5 h-5 text-[#D4AF7C]" />
                  <span>Existing Registration Found</span>
                </div>
                <p className="text-[#F5F5F5]">
                  You already have a confirmed entry for this tournament with Ticket ID: <strong className="font-mono text-[#D4AF7C]">{duplicateTicket}</strong>.
                </p>
                <div className="pt-1">
                  <Link
                    href={`/my-ticket?ticketId=${duplicateTicket}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF7C] text-[#0B0F14] font-bold text-xs hover:brightness-110 transition shadow"
                  >
                    <span>View &amp; Download Your Pass &rarr;</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3 animate-shake">
                <Info className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* REGISTRATION CLOSED BANNER VS DYNAMIC FORM */}
            {!isRegistrationOpen ? (
              <div className="p-8 sm:p-10 rounded-3xl bg-red-500/10 border-2 border-red-500/30 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 font-mono">
                    ARBITER STATUS: REGISTRATION CLOSED
                  </span>
                  <h3 className="font-['Montserrat',sans-serif] text-xl font-bold text-red-200">
                    Registration Window Closed
                  </h3>
                  <p className="text-xs text-[#A0A6B0] max-w-md mx-auto leading-relaxed pt-1">
                    Registrations for <span className="text-[#F5F5F5] font-semibold">{currentEvent.title}</span> have been closed by the Chief Arbiter. You can select another tournament above or choose from open events below:
                  </p>
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
                    {events.filter((e: any) => e.status !== 'closed' && e.id !== currentEvent.id).map((e: any) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => {
                          setSelectedEventId(e.id);
                          if (typeof window !== 'undefined') window.history.replaceState(null, '', `?event=${e.id}`);
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition cursor-pointer shadow-md shadow-[#D4AF7C]/20"
                      >
                        {e.title} &rarr;
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Main Dynamic Form Fields */
              <form onSubmit={handleSubmit} className="space-y-6 font-['Inter',sans-serif]">
                
                {/* Part 1: Player Identity */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
                      <User className="w-4 h-4 text-[#D4AF7C]" />
                      <span>Player Credentials</span>
                    </h3>
                    <span className="text-[10px] text-[#A0A6B0]">* Required fields</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isFieldEnabled('fullName') && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#A0A6B0]">
                          Full Legal Name {isFieldRequired('fullName') && '*'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required={isFieldRequired('fullName')}
                                            value={formData.fullName}
                            onChange={(e) => handleFieldChange('fullName', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] transition shadow-inner"
                          />
                        </div>
                      </div>
                    )}

                    {isFieldEnabled('rollNumber') && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#A0A6B0]">
                          College Roll / Registration ID {isFieldRequired('rollNumber') && '*'}
                        </label>
                        <input
                          type="text"
                          required={isFieldRequired('rollNumber')}
                          placeholder="e.g. 23101104"
                          value={formData.rollNumber}
                          onChange={(e) => handleFieldChange('rollNumber', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 font-mono focus:outline-none focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C] transition shadow-inner"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {isFieldEnabled('department') && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#A0A6B0]">
                          Department / Branch {isFieldRequired('department') && '*'}
                        </label>
                        <input
                          type="text"
                          required={isFieldRequired('department')}
                          placeholder="e.g. Computer Science & Engineering"
                          value={formData.department}
                          onChange={(e) => handleFieldChange('department', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition shadow-inner"
                        />
                      </div>
                    )}

                    {isFieldEnabled('year') && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#A0A6B0]">
                          Year of Study {isFieldRequired('year') && '*'}
                        </label>
                        <select
                          value={formData.year}
                          onChange={(e) => handleFieldChange('year', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C] transition cursor-pointer"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Postgraduate / Alumni">PG / Alumni</option>
                        </select>
                      </div>
                    )}

                    {isFieldEnabled('institution') && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#A0A6B0]">
                          Institution / College {isFieldRequired('institution') && '*'}
                        </label>
                        <input
                          type="text"
                          required={isFieldRequired('institution')}
                          placeholder="e.g. Jalpaiguri Government Engineering College"
                          value={formData.institution}
                          onChange={(e) => handleFieldChange('institution', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition shadow-inner"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Part 2: Contact Info */}
                {(isFieldEnabled('email') || isFieldEnabled('phone')) && (
                  <div className="space-y-4 pt-2">
                    <div className="border-b border-white/10 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#D4AF7C]" />
                        <span>Contact Coordinates</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isFieldEnabled('email') && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-[#A0A6B0]">
                            Email Address {isFieldRequired('email') && '*'}
                          </label>
                          <input
                            type="email"
                            required={isFieldRequired('email')}
                            placeholder="player@jgec.ac.in"
                            value={formData.email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition shadow-inner"
                          />
                        </div>
                      )}

                      {isFieldEnabled('phone') && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-[#A0A6B0]">
                            WhatsApp / Phone Number {isFieldRequired('phone') && '*'}
                          </label>
                          <input
                            type="tel"
                            required={isFieldRequired('phone')}
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 focus:outline-none focus:border-[#D4AF7C] transition shadow-inner"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Part 3: Chess Experience & Online Platform Verification */}
                {(isFieldEnabled('ratingCategory') || isFieldEnabled('chessUsername') || isFieldEnabled('fideId')) && (
                  <div className="space-y-5 pt-2">
                    <div className="border-b border-white/10 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#D4AF7C]" />
                        <span>Chess Skill &amp; Online Account Verification</span>
                      </h3>
                      <p className="text-[11px] text-[#A0A6B0] mt-1">
                        Select your platform (Chess.com or Lichess) and provide your authentic player ID for pairing &amp; rating checks.
                      </p>
                    </div>

                    {/* Skill Tier & Optional FIDE ID Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isFieldEnabled('ratingCategory') && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-[#A0A6B0]">
                            Rating / Skill Category {isFieldRequired('ratingCategory') && '*'}
                          </label>
                          <select
                            value={formData.ratingCategory}
                            onChange={(e) => handleFieldChange('ratingCategory', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C] transition cursor-pointer"
                          >
                            <option value="Beginner (< 1200)">Beginner (&lt; 1200)</option>
                            <option value="Club Player (1200 - 1600)">Club Player (1200 - 1600)</option>
                            <option value="Advanced (1600 - 2000)">Advanced (1600 - 2000)</option>
                            <option value="FIDE Rated / Master (2000+)">FIDE Rated (2000+)</option>
                          </select>
                        </div>
                      )}

                      {isFieldEnabled('fideId') && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-[#A0A6B0]">
                            FIDE ID {isFieldRequired('fideId') ? '*' : '(Optional)'}
                          </label>
                          <input
                            type="text"
                            required={isFieldRequired('fideId')}
                            placeholder="e.g. 25012345 (Leave empty if unrated)"
                            value={formData.fideId}
                            onChange={(e) => handleFieldChange('fideId', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 font-mono focus:outline-none focus:border-[#D4AF7C] transition shadow-inner"
                          />
                        </div>
                      )}
                    </div>

                    {/* Radio Button Selector for Chess.com or Lichess */}
                    {isFieldEnabled('chessUsername') && (
                      <div id="chess-platform-selector" className="space-y-3 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF7C] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#D4AF7C]" />
                            <span>Select Chess Platform {isFieldRequired('chessUsername') && '*'}</span>
                          </label>
                          <span className="text-[10px] text-[#A0A6B0]">Choose Chess.com or Lichess</span>
                        </div>

                        {/* Interactive Radio Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Chess.com Radio Card */}
                          <div
                            onClick={() => {
                              handleFieldChange('chessPlatform', 'chesscom');
                              if (formData.chessUsername) {
                                verifyChessAccount('chesscom', formData.chessUsername);
                              }
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-3.5 select-none ${
                              formData.chessPlatform === 'chesscom'
                                ? 'bg-gradient-to-r from-emerald-500/20 via-[#161B22] to-[#12161D] border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                                : 'bg-[#0B0F14] border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="chessPlatform"
                              value="chesscom"
                              checked={formData.chessPlatform === 'chesscom'}
                              onChange={() => {}}
                              className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                            />
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
                              <span className="text-lg">♟</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-['Montserrat',sans-serif] font-bold text-sm text-[#F5F5F5]">Chess.com</span>
                                {formData.chessPlatform === 'chesscom' && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#A0A6B0] truncate mt-0.5">
                                Verify via official Chess.com profile
                              </p>
                            </div>
                          </div>

                          {/* Lichess Radio Card */}
                          <div
                            onClick={() => {
                              handleFieldChange('chessPlatform', 'lichess');
                              if (formData.chessUsername) {
                                verifyChessAccount('lichess', formData.chessUsername);
                              }
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center gap-3.5 select-none ${
                              formData.chessPlatform === 'lichess'
                                ? 'bg-gradient-to-r from-[#D4AF7C]/20 via-[#161B22] to-[#12161D] border-[#D4AF7C] shadow-lg shadow-[#D4AF7C]/10 ring-1 ring-[#D4AF7C]/50'
                                : 'bg-[#0B0F14] border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="chessPlatform"
                              value="lichess"
                              checked={formData.chessPlatform === 'lichess'}
                              onChange={() => {}}
                              className="w-4 h-4 accent-[#D4AF7C] cursor-pointer shrink-0"
                            />
                            <div className="w-9 h-9 rounded-xl bg-[#D4AF7C]/20 border border-[#D4AF7C]/40 flex items-center justify-center shrink-0 shadow-inner">
                              <span className="text-lg">♞</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-['Montserrat',sans-serif] font-bold text-sm text-[#F5F5F5]">Lichess.org</span>
                                {formData.chessPlatform === 'lichess' && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#D4AF7C]/20 text-[#D4AF7C] font-bold border border-[#D4AF7C]/40">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#A0A6B0] truncate mt-0.5">
                                Verify via official Lichess.org profile
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Conditional ID Input Field (Only shows when player selects Chess.com or Lichess) */}
                        {formData.chessPlatform ? (
                          <div className="space-y-2.5 pt-2 animate-in fade-in slide-in-from-top-3 duration-300">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-medium text-[#A0A6B0] flex items-center gap-1.5">
                                <span>
                                  Type your {formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'} Username / ID
                                </span>
                                {isFieldRequired('chessUsername') && (
                                  <span className="text-red-400 font-bold">*</span>
                                )}
                              </label>
                              <span className="text-[10px] text-[#D4AF7C]">
                                Checked when you go to another field
                              </span>
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                id="chess-handle-input"
                                required={isFieldRequired('chessUsername')}
                                placeholder={
                                  formData.chessPlatform === 'chesscom'
                                    ? 'e.g. Hikaru or MagnusCarlsen'
                                    : 'e.g. thibault or DrNykterstein'
                                }
                                value={formData.chessUsername}
                                onChange={(e) => handleFieldChange('chessUsername', e.target.value)}
                                onBlur={() => {
                                  if (formData.chessUsername.trim()) {
                                    verifyChessAccount(formData.chessPlatform, formData.chessUsername);
                                  }
                                }}
                                className={`w-full px-4 py-3 pr-28 rounded-xl bg-[#0B0F14] border text-xs text-[#F5F5F5] placeholder-[#A0A6B0]/40 font-mono transition shadow-inner focus:outline-none ${
                                  chessVerification.result?.exists === true
                                    ? 'border-emerald-500/70 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500'
                                    : chessVerification.result?.exists === false
                                    ? 'border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                    : 'border-white/10 focus:border-[#D4AF7C] focus:ring-1 focus:ring-[#D4AF7C]'
                                }`}
                              />

                              {/* Right Inline Action Button / Status Badge */}
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {chessVerification.checking ? (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-[10px] text-[#D4AF7C] font-semibold border border-white/10">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF7C]" />
                                    <span>Checking...</span>
                                  </div>
                                ) : chessVerification.result?.exists === true ? (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-[10px] text-emerald-400 font-bold border border-emerald-500/40">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Verified</span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => verifyChessAccount(formData.chessPlatform, formData.chessUsername)}
                                    disabled={!formData.chessUsername.trim() || chessVerification.checking}
                                    className="px-3 py-1 rounded-lg bg-[#D4AF7C]/20 hover:bg-[#D4AF7C]/30 text-[#D4AF7C] font-bold text-[10px] transition cursor-pointer border border-[#D4AF7C]/30 disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    Verify ID
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Live Verification Status Cards */}
                            {chessVerification.checking && (
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#A0A6B0] flex items-center gap-2.5 animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF7C] shrink-0" />
                                <span>
                                  Checking official existence of &ldquo;<strong className="text-white font-mono">@{formData.chessUsername}</strong>&rdquo; on {formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'}...
                                </span>
                              </div>
                            )}

                            {!chessVerification.checking && chessVerification.result && (
                              chessVerification.result.exists ? (
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                                      <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold flex items-center gap-1.5 truncate">
                                        <span className="text-white">Genuine {chessVerification.result.platform} Player:</span>
                                        <span className="font-mono text-emerald-300 font-bold">@{chessVerification.result.username}</span>
                                        {chessVerification.result.title && (
                                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30">
                                            {chessVerification.result.title}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-emerald-300/80 font-mono mt-0.5 truncate">
                                        {chessVerification.result.ratings?.rapid ? `Rapid: ${chessVerification.result.ratings.rapid} • ` : ''}
                                        {chessVerification.result.ratings?.blitz ? `Blitz: ${chessVerification.result.ratings.blitz} • ` : ''}
                                        {chessVerification.result.ratings?.classical ? `Classical: ${chessVerification.result.ratings.classical} • ` : ''}
                                        {chessVerification.result.name ? `Name: ${chessVerification.result.name} • ` : ''}
                                        Account Verified &amp; Eligible
                                      </div>
                                    </div>
                                  </div>
                                  {chessVerification.result.avatar && (
                                    <img
                                      src={chessVerification.result.avatar}
                                      alt="Player Avatar"
                                      className="w-9 h-9 rounded-full border border-emerald-400/40 object-cover shrink-0"
                                    />
                                  )}
                                </div>
                              ) : chessVerification.result.unavailable ? (
                                <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-300 text-xs flex items-start justify-between gap-3 shadow-lg animate-in fade-in duration-200">
                                  <div className="flex items-start gap-3 min-w-0">
                                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                                    <div className="space-y-1 min-w-0">
                                      <div className="font-bold text-amber-200 text-xs">
                                        Verification Service Unavailable
                                      </div>
                                      <p className="text-[11px] text-amber-300/90 leading-relaxed">
                                        {chessVerification.result.message || 'Unable to contact verification service. Please retry in a few moments.'}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => verifyChessAccount(formData.chessPlatform, formData.chessUsername)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[11px] font-semibold shrink-0 transition-colors"
                                  >
                                    Retry
                                  </button>
                                </div>
                              ) : (
                                <div className="p-3.5 rounded-2xl bg-red-500/10 border-2 border-red-500/40 text-red-300 text-xs flex items-start gap-3 shadow-lg animate-in fade-in duration-200">
                                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                                  <div className="space-y-1">
                                    <div className="font-bold text-red-200 text-xs">
                                      Check your ID carefully!
                                    </div>
                                    <p className="text-[11px] text-red-300/90 leading-relaxed">
                                      No active player found with username &ldquo;<strong className="font-mono text-white">@{formData.chessUsername}</strong>&rdquo; on {formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'}. Please recheck your spelling. Without a correct ID, registration cannot be successful.
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-[#0B0F14]/70 border border-dashed border-white/10 text-center text-xs text-[#A0A6B0]">
                            <span>Please select <strong>Chess.com</strong> or <strong>Lichess</strong> above to enter your ID.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Part 4: Custom Questions Configured by Admin */}
                {currentEvent.customFields && currentEvent.customFields.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="border-b border-white/10 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#D4AF7C]" />
                        <span>Additional Tournament Questions</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentEvent.customFields.map((cf: any) => (
                        <div key={cf.id} className="space-y-1.5">
                          <label className="text-[11px] font-medium text-[#A0A6B0] flex items-center gap-1">
                            <span>{cf.label}</span>
                            {cf.required && <span className="text-red-400 font-bold">*</span>}
                          </label>
                          {cf.type === 'select' ? (
                            <select
                              required={cf.required}
                              value={customAnswers[cf.id] || ''}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [cf.id]: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C] transition"
                            >
                              <option value="">Select an option...</option>
                              {cf.options?.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : cf.type === 'checkbox' ? (
                            <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs text-[#F5F5F5]">
                              <input
                                type="checkbox"
                                checked={Boolean(customAnswers[cf.id])}
                                onChange={(e) => setCustomAnswers({ ...customAnswers, [cf.id]: e.target.checked })}
                                className="accent-[#D4AF7C] rounded w-4 h-4"
                              />
                              <span>Yes / Agreed</span>
                            </label>
                          ) : (
                            <input
                              type="text"
                              required={cf.required}
                              placeholder="Your answer..."
                              value={customAnswers[cf.id] || ''}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [cf.id]: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F14] border border-white/10 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D4AF7C] transition"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Part 4: Fair Play Pledge */}
              <div className="p-4 rounded-2xl bg-black/40 border border-[#D4AF7C]/20 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="mt-0.5 rounded bg-[#0B0F14] border-white/20 text-[#D4AF7C] focus:ring-0 cursor-pointer h-4 w-4"
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#F5F5F5] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF7C]" />
                      <span>FIDE Fair-Play &amp; Swiss System Agreement</span>
                    </span>
                    <p className="text-[11px] text-[#A0A6B0] leading-relaxed">
                      I certify that all details provided are authentic. I agree to comply with JGEC Chaturanga tournament bylaws, arbiter clocks, and FIDE fair-play standards.
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit CTA Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#A0A6B0]">
                  {chessVerification.checking ? (
                    <div className="flex items-center gap-1.5 text-[#D4AF7C]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying player ID...</span>
                    </div>
                  ) : chessVerification.result?.exists === true ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Player ID Verified &bull; Free Registration</span>
                    </div>
                  ) : chessVerification.result?.unavailable ? (
                    <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Verification service unavailable &bull; Retry required</span>
                    </div>
                  ) : chessVerification.result?.exists === false ? (
                    <div className="flex items-center gap-1.5 text-red-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Check your ID carefully before submitting</span>
                    </div>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>100% Free Entry &bull; Instant Confirmation</span>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || chessVerification.checking || (Boolean(formData.chessUsername) && chessVerification.result?.exists === false && !chessVerification.result?.unavailable)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-xs text-[#0B0F14] bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] hover:brightness-110 transition-all duration-200 shadow-xl shadow-[#D4AF7C]/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Recording Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit &amp; Generate Entry Pass</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

        </div>

        {/* Right Column: Live Pass Preview & Tournament Perks (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* LIVE DIGITAL PASS PREVIEW WIDGET */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF7C] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF7C]" />
                <span>Live Digital Pass Preview</span>
              </span>
              <span className="text-[10px] text-[#A0A6B0] font-mono">Updates as you type</span>
            </div>

            {/* Simulated Live Player Card */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#181D26] to-[#0E1217] border-2 border-[#D4AF7C]/40 p-6 shadow-2xl overflow-hidden font-['Inter',sans-serif]">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF7C]/15 rounded-full blur-2xl pointer-events-none" />

              {/* Pass Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF7C] text-[#0B0F14] flex items-center justify-center font-black text-sm">
                    ♞
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF7C] block">
                      CHATURANGA JGEC
                    </span>
                    <h4 className="font-['Montserrat',sans-serif] font-bold text-xs text-[#F5F5F5] leading-none mt-0.5">
                      {currentEvent.title}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-[#A0A6B0] block">PASS ID</span>
                  <span className="font-mono text-xs font-bold text-[#D4AF7C]">PREVIEW</span>
                </div>
              </div>

              {/* Live Mirrored Details */}
              <div className="py-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Player</span>
                    <span className="font-bold text-[#F5F5F5] text-sm truncate block">
                      {formData.fullName || 'Your Name'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Roll Number</span>
                    <span className="font-mono font-semibold text-[#D4AF7C] text-xs block">
                      {formData.rollNumber || '2310XXXX'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Department</span>
                    <span className="text-[#F5F5F5] truncate block">
                      {formData.department.split(' ')[0] || 'Department'} &bull; {formData.year.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Skill Tier</span>
                    <span className="text-[#D4AF7C] truncate block font-medium">
                      {formData.ratingCategory.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Verified Chess Profile Badge in Preview */}
                <div className="grid grid-cols-2 gap-3 text-[11px] p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Online Account</span>
                    <span className="text-[#F5F5F5] font-mono text-xs truncate block font-bold">
                      {formData.chessUsername
                        ? `@${formData.chessUsername}`
                        : 'None'}
                    </span>
                    <span className="text-[9px] text-[#D4AF7C] font-semibold block">
                      {formData.chessPlatform === 'chesscom' ? 'Chess.com' : (formData.chessPlatform === 'lichess' ? 'Lichess.org' : 'Select platform')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A0A6B0] block">Verification</span>
                    <div className="mt-0.5">
                      {chessVerification.result?.exists === true ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : chessVerification.result?.exists === false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Invalid ID</span>
                        </span>
                      ) : chessVerification.checking ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#D4AF7C]">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Checking</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#A0A6B0]">Pending</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-[#A0A6B0]">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF7C]" />
                    <span>{currentEvent.date}</span>
                  </div>
                  <div className="text-[#D4AF7C] font-semibold">
                    {currentEvent.time}
                  </div>
                </div>
              </div>

              {/* Barcode Simulator & Watermark */}
              <div className="pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-[10px] text-[#A0A6B0]">
                <div className="flex items-center gap-1 font-mono tracking-widest text-[#D4AF7C]">
                  ||| | |||| | ||| |||| |
                </div>
                <div className="uppercase font-bold tracking-wider text-[9px] text-[#A0A6B0]">
                  OFFICIAL ARBITER PASS
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Perks Card */}
          <div className="p-6 rounded-3xl bg-[#12161D] border border-white/10 space-y-4 font-['Inter',sans-serif]">
            <h4 className="font-['Montserrat',sans-serif] font-bold text-xs uppercase tracking-widest text-[#D4AF7C] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D4AF7C]" />
              <span>Tournament Rules &amp; Perks</span>
            </h4>

            <div className="space-y-3 text-xs text-[#A0A6B0]">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF7C] mt-1.5 shrink-0" />
                <span><strong>5-Round Swiss Format:</strong> Guaranteed multiple matches for every participant, regardless of win/loss record.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF7C] mt-1.5 shrink-0" />
                <span><strong>Official Clocks &amp; Boards:</strong> FIDE standard DGT digital chess clocks provided by JGEC Chaturanga.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF7C] mt-1.5 shrink-0" />
                <span><strong>Prizes &amp; Merit Trophies:</strong> Cash awards, top department shield, and best collegiate player trophy.</span>
              </div>
            </div>

            {/* Free Automation Note */}
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>
                <strong>100% Free Spreadsheet Automation:</strong> Every entry auto-syncs into the arbiter's live spreadsheet and generates instant visual charts.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F5F5] antialiased selection:bg-[#D4AF7C] selection:text-[#0B0F14] relative overflow-x-hidden">
      <Navbar />

      {/* Decorative Chess Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#D4AF7C_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#D4AF7C]/10 blur-[120px] pointer-events-none rounded-full" />

      <main className="w-full pt-28 pb-20 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 uppercase tracking-widest font-['Inter',sans-serif] shadow-lg shadow-[#D4AF7C]/10">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF7C]" />
              <span>COLLEGIATE TOURNAMENT ENTRY &bull; SEASON 2026</span>
            </div>
            
            <h1 className="font-['Montserrat',sans-serif] text-3xl sm:text-5xl font-black text-[#F5F5F5] tracking-tight leading-tight">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF7C] via-[#F3E2B8] to-[#D4AF7C]">the Board</span>
            </h1>
            
            <p className="font-['Poppins',sans-serif] text-xs sm:text-sm text-[#A0A6B0] leading-relaxed max-w-lg mx-auto">
              Register for upcoming championship matches. Receive an instant verified digital player pass with automated real-time tournament sheet synchronization.
            </p>
          </div>

          {/* Form inside Suspense for searchParams */}
          <Suspense fallback={
            <div className="py-20 text-center text-xs text-[#A0A6B0] flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#D4AF7C]" />
              <span>Loading registration portal...</span>
            </div>
          }>
            <RegisterForm />
          </Suspense>

        </div>
      </main>

      <Footer />
    </div>
  );
}
