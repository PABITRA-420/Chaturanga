'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import TickerMarquee from '@/components/home/TickerMarquee';
import AnnouncementsBanner from '@/components/home/AnnouncementsBanner';
import BentoAbout from '@/components/home/BentoAbout';
import HomeLeaderboardPreview from '@/components/home/HomeLeaderboardPreview';
import HomeTournaments from '@/components/home/HomeTournaments';
import RegisterCta from '@/components/home/RegisterCta';
import { UPCOMING_EVENTS, PAST_EVENTS } from '@/data/tournamentData';

const FaqAccordion = dynamic(() => import('@/components/ui/FaqAccordion'), { ssr: true });

const EMPTY_TOURNAMENT_FALLBACK = {
  isNeutral: true,
  badgeText: 'Official Collegiate Chess Club'
};

const BASELINE_STATS = {
  competitors: 48,
  tournaments: 12,
  peakElo: 2140,
};

const initialFeatured = UPCOMING_EVENTS.find(t => t.isFeatured) || UPCOMING_EVENTS[0] || EMPTY_TOURNAMENT_FALLBACK;

export default function HomeView() {
  const [participantsCount, setParticipantsCount] = useState<number>(BASELINE_STATS.competitors);
  const [eventsCount, setEventsCount] = useState<number>(BASELINE_STATS.tournaments);
  const [peakElo, setPeakElo] = useState<number | undefined>(BASELINE_STATS.peakElo);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>(UPCOMING_EVENTS);
  const [pastEvents, setPastEvents] = useState<any[]>(PAST_EVENTS);
  const [featuredEvent, setFeaturedEvent] = useState<any>(initialFeatured);
  const [loadingTournaments, setLoadingTournaments] = useState<boolean>(false);

  // Background SWR fetch to update live tournaments if modified in admin
  useEffect(() => {
    try {
      const cachedUpcoming = sessionStorage.getItem('chaturanga_upcoming');
      if (cachedUpcoming) {
        const parsed = JSON.parse(cachedUpcoming);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUpcomingEvents(parsed);
          const feat = parsed.find((t: any) => t.isFeatured) || parsed[0];
          if (feat) setFeaturedEvent(feat);
        }
      }
      const cachedPast = sessionStorage.getItem('chaturanga_past');
      if (cachedPast) {
        const parsed = JSON.parse(cachedPast);
        if (Array.isArray(parsed) && parsed.length > 0) setPastEvents(parsed);
      }
    } catch {}

    fetch('/api/tournaments?type=upcoming')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tournaments) && data.tournaments.length > 0) {
          setUpcomingEvents(data.tournaments);
          const featured =
            data.tournaments.find((t: any) => t.isFeatured) ||
            data.tournaments[0] ||
            EMPTY_TOURNAMENT_FALLBACK;
          setFeaturedEvent(featured);
          try {
            sessionStorage.setItem('chaturanga_upcoming', JSON.stringify(data.tournaments));
          } catch {}
        }
      })
      .catch(() => {});

    fetch('/api/tournaments?type=past')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tournaments) && data.tournaments.length > 0) {
          setPastEvents(data.tournaments);
          try {
            sessionStorage.setItem('chaturanga_past', JSON.stringify(data.tournaments));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Background SWR fetch for real-time club statistics
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('chaturanga_hero_stats');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.competitors) setParticipantsCount(Number(parsed.competitors));
        if (parsed.tournaments) setEventsCount(Number(parsed.tournaments));
        if (parsed.peakElo) setPeakElo(Number(parsed.peakElo));
      }
    } catch {}

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          const liveParticipants = Number(data.stats.competitors);
          const liveEvents = Number(data.stats.tournaments);
          const liveElo = Number(data.stats.peakElo);

          if (liveParticipants > 0) setParticipantsCount(liveParticipants);
          if (liveEvents > 0) setEventsCount(liveEvents);
          if (liveElo > 0) setPeakElo(liveElo);

          try {
            sessionStorage.setItem('chaturanga_hero_stats', JSON.stringify(data.stats));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleRegisterClick = () => {
    const regSection = document.getElementById('register');
    if (regSection) {
      regSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F5F5] antialiased selection:bg-[#D4AF7C] selection:text-[#0B0F14] relative overflow-x-hidden">
      {/* NAVBAR */}
      <Navbar onRegisterClick={handleRegisterClick} />

      {/* MAIN SECTIONS */}
      <main id="main-content" className="w-full pt-20 space-y-4">
        
        {/* 1. Hero */}
        <HeroSection
          participantsCount={participantsCount}
          eventsCount={eventsCount}
          peakElo={peakElo}
          featuredEvent={featuredEvent}
          onRegisterClick={handleRegisterClick}
        />

        {/* 2. Live Marquee Ticker */}
        <TickerMarquee />

        {/* 3. Official Announcements Feed */}
        <div className="content-visibility-auto">
          <AnnouncementsBanner />
        </div>

        {/* 4. Bento About Institutional Heritage */}
        <div className="content-visibility-auto">
          <BentoAbout />
        </div>

        {/* 5. Live Leaderboard Top Board Preview */}
        <div className="content-visibility-auto">
          <HomeLeaderboardPreview />
        </div>

        {/* 6. Tournaments & Interactive Calendar */}
        <div className="content-visibility-auto">
          <HomeTournaments
            upcomingEvents={upcomingEvents}
            pastEvents={pastEvents}
            loading={loadingTournaments}
          />
        </div>

        {/* 7. Collegiate FAQ Accordion */}
        <div className="content-visibility-auto">
          <FaqAccordion />
        </div>

        {/* 8. Bottom Registration Callout */}
        <div className="content-visibility-auto">
          <RegisterCta />
        </div>

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
