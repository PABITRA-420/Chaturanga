import React from 'react';
import { Metadata } from 'next';
import { LiveTournamentView } from '@/components/LiveTournamentView';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Live Tournament Broadcast & Board Pairings | Chaturanga JGEC',
  description:
    'Follow live round pairings, digital countdown clocks, collegiate FIDE tie-break standings, and interactive PGN boards from Chaturanga JGEC.',
};

export default async function LiveTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#070A0E] text-[#F5F5F5] font-['Inter',sans-serif] flex flex-col selection:bg-[#D4AF7C] selection:text-[#0B0F14]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <LiveTournamentView tournamentId={id} />
      </main>

      <Footer />
    </div>
  );
}
