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

export default function HomeView() {
  const [participantsCount, setParticipantsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [peakElo, setPeakElo] = useState<number | undefined>(undefined);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<any>(null);

  // Fetch dynamic tournaments
  useEffect(() => {
    fetch('/api/tournaments?type=upcoming')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tournaments)) {
          setUpcomingEvents(data.tournaments);
          const featured = data.tournaments.find((t: any) => t.isFeatured) || data.tournaments[0] || null;
          setFeaturedEvent(featured);
        }
      })
      .catch(() => {});

    fetch('/api/tournaments?type=past')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.tournaments)) {
          setPastEvents(data.tournaments);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch live statistics and animate counters
  useEffect(() => {
    let animationFrameId: number;

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          const targetParticipants = Number(data.stats.competitors) || 0;
          const targetEvents = Number(data.stats.tournaments) || 0;
          const targetElo = Number(data.stats.peakElo) || 0;

          const duration = 1600;
          const startTime = performance.now();

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
