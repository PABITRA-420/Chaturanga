"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, ArrowRight } from 'lucide-react';
import { useRegistration } from '@/hooks/useRegistration';
import DigitalPassCard from '@/components/register/DigitalPassCard';
import RegistrationWizard from '@/components/register/RegistrationWizard';

function RegisterForm() {
  const searchParams = useSearchParams();
  const eventParam = searchParams.get('event');

  const {
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
    handleSubmit,
    handleReset,
    formSubmitted,
    ticketId,
    duplicateTicket,
    errorMsg,
    isSubmitting,
    sheetStatus
  } = useRegistration(eventParam);

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

  if (formSubmitted) {
    return (
      <DigitalPassCard
        ticketId={ticketId}
        formData={formData}
        currentEvent={currentEvent}
        sheetStatus={sheetStatus}
        onReset={handleReset}
      />
    );
  }

  return (
    <RegistrationWizard
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      events={events}
      selectedEventId={selectedEventId}
      onSelectEvent={(id) => {
        setSelectedEventId(id);
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `?event=${id}`);
        }
      }}
      formData={formData}
      onFieldChange={handleFieldChange}
      customAnswers={customAnswers}
      onCustomAnswerChange={handleCustomAnswerChange}
      onVerifyChess={verifyChessAccount}
      chessVerification={chessVerification}
      isFieldEnabled={isFieldEnabled}
      isFieldRequired={isFieldRequired}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      errorMsg={errorMsg}
      duplicateTicket={duplicateTicket}
    />
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#070A0E] text-[#F5F5F5] font-['Inter',sans-serif] selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Suspense fallback={
          <div className="p-12 rounded-3xl bg-[#12161D] border border-white/10 text-center space-y-4 max-w-xl mx-auto my-12 animate-pulse">
            <div className="w-14 h-14 rounded-2xl bg-white/5 mx-auto" />
            <div className="h-6 w-48 bg-white/10 rounded-full mx-auto" />
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
