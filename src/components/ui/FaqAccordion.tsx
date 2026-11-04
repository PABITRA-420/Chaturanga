'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Trophy, Ticket, Clock, Sparkles } from 'lucide-react';

export interface FaqItem {
  id: string;
  category: 'Registration' | 'Ratings' | 'Arbiter Rules' | 'General';
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'reg-free',
    category: 'Registration',
    question: 'Is participation in official Chaturanga tournaments free for students?',
    answer: 'Yes! All regular collegiate championships, blitz arenas, and Swiss rounds organized by Chaturanga are 100% free for all enrolled students across North Bengal and West Bengal colleges.',
  },
  {
    id: 'pass-qr',
    category: 'Registration',
    question: 'How do I check in at the tournament hall using my digital pass?',
    answer: 'Upon completing online registration, you receive a digital pass with an embedded QR code and unique Ticket ID. On tournament day, present this pass on your phone or printed along with your college student ID card at the Arbiter Reception Desk to receive your table and board assignment.',
  },
  {
    id: 'rating-calc',
    category: 'Ratings',
    question: 'How are player ratings calibrated on the official Club Elo Leaderboard?',
    answer: 'Ratings are calibrated using an automated hybrid FIDE-based calculation combining official collegiate offline tournament performance (30+ classical and rapid Swiss rounds) synced with verified Lichess & Chess.com performance metrics.',
  },
  {
    id: 'chess-verify',
    category: 'Ratings',
    question: 'Can I verify both my Lichess and Chess.com handles?',
    answer: 'Yes. You can verify either or both handles during tournament registration or from the leaderboard. Our server directly queries the official Lichess and Chess.com public APIs to verify your handle and display your peak blitz and rapid ratings.',
  },
  {
    id: 'touch-move',
    category: 'Arbiter Rules',
    question: 'What touch-move and illegal move rules are enforced?',
    answer: 'Official FIDE Laws of Chess are strictly adhered to. The touch-move rule is active on all boards: if you deliberately touch a piece with legal moves, you must move it. A completed illegal move incurs a 2-minute penalty to the opponent on the first occurrence, and forfeiture on the second.',
  },
  {
    id: 'late-arrival',
    category: 'Arbiter Rules',
    question: 'What is the default reporting time before a match is forfeited?',
    answer: 'The default reporting grace window is 15 minutes after the Chief Arbiter announces the start of the round and starts the chess clocks. A player failing to report to their assigned board within this window forfeits the round.',
  },
  {
    id: 'spectators',
    category: 'General',
    question: 'Are spectators and batchmates allowed inside the playing arena?',
    answer: 'Spectators are welcome inside the designated viewing gallery, provided complete silence is maintained. Mobile phones, electronic wristwatches, and analysis gadgets must remain completely powered off inside the playing hall.',
  },
];

export default function FaqAccordion() {
  const [openIds, setOpenIds] = useState<string[]>(['reg-free', 'touch-move']);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Registration', 'Ratings', 'Arbiter Rules', 'General'];

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12" id="faq">
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#141820] to-[#0D1016] border border-white/10 shadow-2xl relative overflow-hidden space-y-8">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF7C]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>COLLEGIATE PLAYBOOK &amp; GUIDELINES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-['Montserrat',sans-serif] text-[#F5F5F5]">
              Frequently Asked <span className="text-[#D4AF7C]">Questions</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A6B0] mt-1 max-w-xl font-['Poppins',sans-serif]">
              Everything you need to know about tournament entry, Swiss pairings, rating calibration, and official FIDE arbiter regulations.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all pill-tactile ${
                  activeCategory === cat
                    ? 'bg-[#D4AF7C] text-[#0B0F14] shadow-md shadow-[#D4AF7C]/20 font-bold'
                    : 'bg-white/[0.04] text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/[0.08] border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Items List */}
        <div className="space-y-3 font-['Inter',sans-serif]">
          {filteredFaqs.length === 0 ? (
            <div className="p-10 rounded-2xl bg-black/30 border border-white/5 text-center text-[#A0A6B0] text-xs">
              No questions found matching your filter.
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = openIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-[#12161D]/90 border-[#D4AF7C]/40 shadow-lg shadow-black/40'
                      : 'bg-black/30 border-white/5 hover:border-white/15'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF7C] shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="font-semibold text-sm sm:text-base text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors leading-snug">
                        {item.question}
                      </span>
                    </div>

                    <div className={`p-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[#D4AF7C] transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 bg-[#D4AF7C]/15 border-[#D4AF7C]/30' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Smooth Collapsible Content */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out px-5 sm:px-6 ${
                      isOpen ? 'grid-rows-[1fr] pb-5 sm:pb-6 opacity-100' : 'grid-rows-[0fr] pb-0 opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pt-2 border-t border-white/5 text-xs sm:text-sm text-[#A0A6B0] leading-relaxed font-['Poppins',sans-serif]">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}

