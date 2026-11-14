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
import { Skeleton } from '@/components/ui/Skeleton';

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
    sheetStatus,
  } = useRegistration(eventParam);

  if (loadingEvents) {
    return (
      <div className="p-12 rounded-md bg-surface border border-border text-center space-y-4 max-w-xl mx-auto my-12">
        <Skeleton className="w-12 h-12 mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
    );
  }

  if (events.length === 0 || !currentEvent) {
    return (
      <div className="p-10 sm:p-14 rounded-md bg-surface border border-border text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-sm bg-surface-elevated border border-border flex items-center justify-center mx-auto text-accent">
          <Calendar className="w-7 h-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-xl text-fg">
            No Open Tournament Registrations
          </h3>
          <p className="text-xs sm:text-sm text-fg-muted leading-relaxed font-body">
            There are currently no scheduled tournaments accepting registrations. Please check back soon or browse our tournament calendar for upcoming announcements.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/upcoming"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xs text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors"
          >
            <span>View Tournament Calendar</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
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
    <div className="min-h-screen bg-bg text-fg font-ui selection:bg-accent selection:text-on-accent flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Suspense fallback={
          <div className="p-12 rounded-md bg-surface border border-border text-center space-y-4 max-w-xl mx-auto my-12">
            <Skeleton className="w-12 h-12 mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
