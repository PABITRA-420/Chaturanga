'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import TickerMarquee from '@/components/home/TickerMarquee';
import AnnouncementsBanner from '@/components/home/AnnouncementsBanner';
import BentoAbout from '@/components/home/BentoAbout';
import HomeLeaderboardPreview from '@/components/home/HomeLeaderboardPreview';
import HomeTournaments from '@/components/home/HomeTournaments';
import RegisterCta from '@/components/home/RegisterCta';

const EMPTY_TOURNAMENT_FALLBACK = {
  isNeutral: true,
  badgeText: 'Official Collegiate Chess Club'
};

const BASELINE_STATS = {
  competitors: 48,
  tournaments: 12,
  peakElo: 2140,
};

export default function HomeView() {
  const [participantsCount, setParticipantsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [peakElo, setPeakElo] = useState<number | undefined>(undefined);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<any>(EMPTY_TOURNAMENT_FALLBACK);

  // Fetch dynamic tournaments with instant session cache for zero-lag page open
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
        if (Array.isArray(parsed)) setPastEvents(parsed);
      }
    } catch {}

    fetch('/api/tournaments?type=upcoming')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tournaments)) {
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
        if (data.success && Array.isArray(data.tournaments)) {
          setPastEvents(data.tournaments);
          try {
            sessionStorage.setItem('chaturanga_past', JSON.stringify(data.tournaments));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Animate counters IMMEDIATELY on page mount (no waiting for network delay!)
  useEffect(() => {
    let animationFrameId: number;

    // Read cached stats if available from previous page view
    let targetParticipants = BASELINE_STATS.competitors;
    let targetEvents = BASELINE_STATS.tournaments;
    let targetElo = BASELINE_STATS.peakElo;

    try {
      const cached = sessionStorage.getItem('chaturanga_hero_stats');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.competitors) targetParticipants = Number(parsed.competitors);
        if (parsed.tournaments) targetEvents = Number(parsed.tournaments);
        if (parsed.peakElo) targetElo = Number(parsed.peakElo);
      }
    } catch {}

    const duration = 1200;
    const startTime = performance.now();

    // 1. Kick off smooth counting animation immediately on frame 1
    const animateCounts = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setParticipantsCount(Math.floor(easeOut * targetParticipants));
      setEventsCount(Math.floor(easeOut * targetEvents));
      if (targetElo > 0) {
        setPeakElo(Math.floor(easeOut * targetElo));
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCounts);
      } else {
        setParticipantsCount(targetParticipants);
        setEventsCount(targetEvents);
        if (targetElo > 0) {
          setPeakElo(targetElo);
        }
      }
    };

    animationFrameId = requestAnimationFrame(animateCounts);

    // 2. Concurrently fetch fresh live statistics from cached API
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          const liveParticipants = Number(data.stats.competitors) || targetParticipants;
          const liveEvents = Number(data.stats.tournaments) || targetEvents;
          const liveElo = Number(data.stats.peakElo) || targetElo;

          try {
            sessionStorage.setItem('chaturanga_hero_stats', JSON.stringify(data.stats));
          } catch {}

          // Update final numbers seamlessly
          setParticipantsCount(liveParticipants);
          setEventsCount(liveEvents);
          if (liveElo > 0) {
            setPeakElo(liveElo);
          }
        }
      })
      .catch(() => {});

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
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
        <AnnouncementsBanner />

        {/* 4. Bento About Institutional Heritage */}
        <BentoAbout />

        {/* 5. Live Leaderboard Top Board Preview */}
        <HomeLeaderboardPreview />

        {/* 6. Tournaments & Interactive Calendar */}
        <HomeTournaments
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
        />

        {/* 7. Bottom Registration Callout */}
        <RegisterCta />

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
