'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

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
    answer: 'Yes. All regular collegiate championships, blitz arenas, and Swiss rounds organized by Chaturanga are 100% free for all enrolled students across North Bengal and West Bengal colleges.',
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
  const [searchQuery] = useState('');

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
      <div className="p-6 sm:p-10 rounded-md bg-surface border border-border space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>COLLEGIATE PLAYBOOK &amp; GUIDELINES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-fg tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-fg-muted max-w-xl font-body">
              Tournament entry, Swiss pairings, rating calibration, and official FIDE arbiter regulations.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors pill-tactile border ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-elevated text-fg-muted hover:text-fg border-border hover:border-border-strong'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Items List */}
        <div className="divide-y divide-border border border-border rounded-sm font-ui">
          {filteredFaqs.length === 0 ? (
            <div className="p-10 bg-surface-elevated text-center text-fg-muted text-xs">
              No questions found matching your filter.
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openIds.includes(item.id);
              const indexLabel = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={item.id}
                  className={`transition-colors duration-150 ${
                    isOpen ? 'bg-surface-elevated' : 'bg-surface hover:bg-surface-elevated/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none group"
                  >
                    <div className="flex items-baseline gap-3.5 min-w-0">
                      <span className="font-mono text-[11px] font-bold text-accent shrink-0 tabular-nums">
                        {indexLabel}
                      </span>
                      <span className="font-semibold text-sm sm:text-base text-fg group-hover:text-accent transition-colors leading-snug">
                        {item.question}
                      </span>
                    </div>

                    <div
                      className={`p-1.5 rounded-sm border transition-all duration-150 shrink-0 ${
                        isOpen
                          ? 'rotate-180 bg-accent text-on-accent border-accent'
                          : 'bg-surface border-border text-fg-muted group-hover:text-fg group-hover:border-border-strong'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </button>

                  {/* Collapsible Answer */}
                  <div
                    className={`grid transition-all duration-200 ease-in-out px-5 sm:px-6 ${
                      isOpen ? 'grid-rows-[1fr] pb-5 sm:pb-6 opacity-100' : 'grid-rows-[0fr] pb-0 opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pl-7 pt-2 border-t border-border text-xs sm:text-sm text-fg-muted leading-relaxed font-body">
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
