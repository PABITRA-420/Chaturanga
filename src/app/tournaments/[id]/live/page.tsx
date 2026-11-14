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
    <div className="min-h-screen bg-bg text-fg font-ui flex flex-col selection:bg-accent selection:text-on-accent">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <LiveTournamentView tournamentId={id} />
      </main>

      <Footer />
    </div>
  );
}
