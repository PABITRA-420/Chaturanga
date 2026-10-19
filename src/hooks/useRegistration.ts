"use client";

import { useState, useEffect, useRef } from 'react';
import { Tournament } from '@/types/tournament';

export interface RegistrationFormData {
  fullName: string;
  rollNumber: string;
  institution: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  chessPlatform: 'chesscom' | 'lichess' | '';
  chessUsername: string;
  fideId: string;
  ratingCategory: string;
  acceptTerms: boolean;
}

export interface ChessVerificationState {
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
}

export function useRegistration(eventParam?: string | null) {
  const [events, setEvents] = useState<Tournament[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [selectedEventId, setSelectedEventId] = useState<string>(eventParam || '');
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [formData, setFormData] = useState<RegistrationFormData>({
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

  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [duplicateTicket, setDuplicateTicket] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sheetStatus, setSheetStatus] = useState<{ synced: boolean; configured: boolean; message?: string } | null>(null);

  const verifySequenceRef = useRef(0);
  const [chessVerification, setChessVerification] = useState<ChessVerificationState>({
    checking: false,
    hasChecked: false,
    lastCheckedHandle: '',
    lastCheckedPlatform: '',
    result: null
  });

  // Load upcoming tournaments from API
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
      .catch((err) => {
        console.error('Failed to load upcoming tournaments:', err);
      })
      .finally(() => setLoadingEvents(false));
  }, [eventParam]);

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

  const handleFieldChange = (field: string, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleCustomAnswerChange = (fieldId: string, val: any) => {
    setCustomAnswers(prev => ({ ...prev, [fieldId]: val }));
  };

  // Verify online chess account
  const verifyChessAccount = async (platform?: string, username?: string) => {
    const targetPlatform = platform || formData.chessPlatform;
    const targetHandle = (username !== undefined ? username : formData.chessUsername).trim();

    if (!targetPlatform || !targetHandle) {
      setChessVerification({
        checking: false,
        hasChecked: false,
        lastCheckedHandle: '',
        lastCheckedPlatform: '',
        result: null
      });
      return null;
    }

    const thisSequence = ++verifySequenceRef.current;
    setChessVerification(prev => ({
      ...prev,
      checking: true,
      lastCheckedHandle: targetHandle,
      lastCheckedPlatform: targetPlatform
    }));

    try {
      const res = await fetch(`/api/player/verify?platform=${targetPlatform}&username=${encodeURIComponent(targetHandle)}`);
      const data = await res.json();

      if (thisSequence !== verifySequenceRef.current) return null;

      const verResult = {
        exists: Boolean(data.exists),
        platform: data.platform,
        username: data.username,
        name: data.name,
        avatar: data.avatar,
        title: data.title,
        ratings: data.ratings,
        message: data.message,
        unavailable: Boolean(data.unavailable)
      };

      setChessVerification({
        checking: false,
        hasChecked: true,
        lastCheckedHandle: targetHandle,
        lastCheckedPlatform: targetPlatform,
        result: verResult
      });

      return verResult;
    } catch {
      if (thisSequence !== verifySequenceRef.current) return null;
      const failResult = {
        exists: false,
        unavailable: true,
        message: 'Could not connect to player verification server. Check your network.'
      };
      setChessVerification({
        checking: false,
        hasChecked: true,
        lastCheckedHandle: targetHandle,
        lastCheckedPlatform: targetPlatform,
        result: failResult
      });
      return failResult;
    }
  };

  // Validate and submit registration
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!isRegistrationOpen) {
      setErrorMsg('Registrations for this tournament are currently closed by the Arbiter.');
      return;
    }

    if (isFieldEnabled('fullName') && isFieldRequired('fullName') && !formData.fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      setCurrentStep(2);
      return;
    }
    if (isFieldEnabled('rollNumber') && isFieldRequired('rollNumber') && !formData.rollNumber.trim()) {
      setErrorMsg('Please enter your university/college roll number.');
      setCurrentStep(2);
      return;
    }
    if (isFieldEnabled('email') && isFieldRequired('email') && (!formData.email.trim() || !formData.email.includes('@'))) {
      setErrorMsg('Please enter a valid email address for pairing notifications.');
      setCurrentStep(2);
      return;
    }
    if (isFieldEnabled('phone') && isFieldRequired('phone') && (!formData.phone.trim() || formData.phone.length < 10)) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp/mobile number.');
      setCurrentStep(2);
      return;
    }

    // Strict Chess Platform Verification
    if (isFieldEnabled('chessUsername')) {
      const isRequired = isFieldRequired('chessUsername');
      const handle = formData.chessUsername.trim();

      if (isRequired) {
        if (!formData.chessPlatform) {
          setErrorMsg('Please select your chess platform: Chess.com or Lichess.');
          setCurrentStep(3);
          return;
        }
        if (!handle) {
          setErrorMsg('Please enter your player handle on your chosen chess platform.');
          setCurrentStep(3);
          return;
        }
      }

      if (handle) {
        if (chessVerification.checking) {
          setErrorMsg('Verifying your player account... Please wait a moment.');
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

        if (verResult && !verResult.exists && !verResult.unavailable) {
          setErrorMsg(`Player handle "@${handle}" does not exist on ${formData.chessPlatform === 'chesscom' ? 'Chess.com' : 'Lichess'}.`);
          setCurrentStep(3);
          return;
        }
      }
    }

    // Custom required questions
    if (currentEvent?.customFields) {
      for (const cf of currentEvent.customFields) {
        if (cf.required && !customAnswers[cf.id]) {
          setErrorMsg(`Please answer required question: "${cf.label}"`);
          setCurrentStep(4);
          return;
        }
      }
    }

    if (!formData.acceptTerms) {
      setErrorMsg('Please acknowledge adherence to official FIDE & Chaturanga Fair Play regulations.');
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customAnswers,
          tournament: currentEvent.title,
          tournamentId: currentEvent.id
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.isDuplicate && data.existingTicketId) {
          setDuplicateTicket(data.existingTicketId);
        }
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setTicketId(data.ticketId);
      setDuplicateTicket(null);
      setSheetStatus({
        synced: Boolean(data.syncedToSheet),
        configured: Boolean(data.sheetConfigured),
        message: data.message
      });
      setFormSubmitted(true);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormSubmitted(false);
    setSheetStatus(null);
    setCurrentStep(1);
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
    setCustomAnswers({});
  };

  return {
    events,
    loadingEvents,
    selectedEventId,
    setSelectedEventId,
    currentEvent,
    currentStep,
    setCurrentStep,
    formData,
    handleFieldChange,
    customAnswers,
    handleCustomAnswerChange,
    verifyChessAccount,
    chessVerification,
    isFieldEnabled,
    isFieldRequired,
    isRegistrationOpen,
    handleSubmit,
    handleReset,
    formSubmitted,
    ticketId,
    duplicateTicket,
    errorMsg,
    isSubmitting,
    sheetStatus
  };
}
