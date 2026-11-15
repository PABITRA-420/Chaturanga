'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { TeamMember } from '@/data/teamData';
import {
  Users,
  ArrowRight,
  Swords,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'core' | 'coordinator' | 'mentor'>('all');

  useEffect(() => {
    let isMounted = true;
    async function fetchTeam() {
      try {
        setLoading(true);
        const res = await fetch('/api/team');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.teamMembers)) {
            setMembers(data.teamMembers);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch team members:', err);
      }
      if (isMounted) {
        setMembers([]);
        setLoading(false);
      }
    }
    fetchTeam();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMembers = members.filter(m => {
    if (activeTab === 'all') return true;
    return m.category === activeTab;
  });

  const getChessPieceGlyph = (piece?: string) => {
    switch (piece) {
      case 'King': return '♚';
      case 'Queen': return '♛';
      case 'Rook': return '♜';
      case 'Bishop': return '♝';
      default: return '♞';
    }
  };

  return (
    <div className="min-h-screen bg-bg text-fg antialiased selection:bg-accent selection:text-on-accent relative overflow-x-hidden font-ui">
      <Navbar />

      <main id="main-content" className="w-full pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-accent uppercase tracking-[0.2em]">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>EXECUTIVE COUNCIL &amp; LEADERSHIP</span>
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-fg tracking-tight">
                The Arbiters <span className="text-accent">&amp;</span> Guardians of 64 Squares
              </h1>
              <p className="text-sm sm:text-base text-fg-muted max-w-2xl font-body leading-relaxed">
                Meet the collegiate organizers, FIDE-certified arbiters, and faculty patrons dedicated to advancing competitive chess culture at Jalpaiguri Government Engineering College.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {[
                { id: 'all', label: 'All Leadership' },
                { id: 'core', label: 'Core Executive' },
                { id: 'coordinator', label: 'Coordinators' },
                { id: 'mentor', label: 'Faculty & Mentors' },
              ].map(tab => {
                const count = !loading ? members.filter(m => tab.id === 'all' || m.category === tab.id).length : null;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xs text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap border ${
                      activeTab === tab.id
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface text-fg-muted hover:text-fg border-border hover:border-border-strong'
                    }`}
                  >
                    {tab.label}{count !== null ? ` (${count})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="rounded-md bg-surface border border-border p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <Skeleton className="w-14 h-14" />
                      <Skeleton className="w-20 h-6" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3.5 w-1/2" />
                    </div>
                    <Skeleton className="h-14 w-full" />
                  </div>
                </div>
              ))
            ) : filteredMembers.length === 0 ? (
              <div className="col-span-full py-16 px-6 text-center rounded-md bg-surface border border-border space-y-4">
                <div className="w-14 h-14 rounded-sm bg-surface-elevated border border-border flex items-center justify-center mx-auto text-accent">
                  <Users className="w-7 h-7 opacity-70" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-heading text-fg">
                    No Team Members Found
                  </h3>
                  <p className="text-sm text-fg-muted max-w-md mx-auto font-body">
                    {activeTab === 'all'
                      ? 'Leadership roster is being finalized for the upcoming collegiate session.'
                      : `No members currently listed under the ${activeTab} category.`}
                  </p>
                </div>
                {activeTab !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="text-xs font-mono font-semibold text-accent hover:underline cursor-pointer"
                  >
                    View all leadership →
                  </button>
                )}
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="group relative rounded-md bg-surface border border-border hover:border-border-strong p-6 flex flex-col justify-between transition-colors overflow-hidden"
                >
                  <div className="space-y-4 relative z-10">
                    
                    {/* Top Avatar + Elo */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        {member.imageUrl ? (
                          <div className="w-14 h-14 rounded-sm overflow-hidden border border-border-strong bg-surface-elevated">
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-sm bg-surface-elevated border border-border-strong flex items-center justify-center text-accent font-serif text-2xl">
                            {getChessPieceGlyph(member.chessPiece)}
                          </div>
                        )}
                        
                        <div
                          className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-xs bg-surface border border-border-strong flex items-center justify-center text-[11px] text-accent"
                          title={member.titleBadge}
                          aria-hidden="true"
                        >
                          {getChessPieceGlyph(member.chessPiece)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2.5 py-1 rounded-xs text-xs font-mono font-bold text-accent bg-surface-elevated border border-border tabular-nums">
                          {member.elo}
                        </span>
                        {member.fideId && (
                          <div className="text-[11px] text-fg-muted font-mono mt-1">
                            {member.fideId.startsWith('@') ? (
                              <a
                                href={`https://lichess.org/@/${member.fideId.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-info hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>Lichess: {member.fideId}</span>
                                <span aria-hidden="true">↗</span>
                              </a>
                            ) : (
                              <span>FIDE: {member.fideId}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name & Role */}
                    <div className="space-y-1">
                      <h2 className="font-heading font-bold text-lg text-fg group-hover:text-accent transition-colors">
                        {member.name}
                      </h2>
                      <div className="text-xs font-mono font-bold text-accent">
                        {member.role}
                      </div>
                      <div className="text-xs text-fg-muted font-body">
                        {member.year} • {member.titleBadge || 'Club Member'}
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-fg-muted font-body leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>

                    {/* Favorite Opening */}
                    <div className="p-3 rounded-sm bg-surface-elevated border border-border space-y-1">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                        <span>Signature Opening</span>
                      </div>
                      <div className="text-xs text-fg font-mono font-medium truncate">
                        {member.favoriteOpening}
                      </div>
                    </div>

                    {/* Key Highlights */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted">
                        Key Highlights
                      </div>
                      <ul className="space-y-1 text-xs text-fg-muted">
                        {member.achievements.slice(0, 2).map((ach, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                            <span className="leading-tight font-body">{ach}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-5 border-t border-border flex items-center justify-between text-xs font-mono text-fg-muted">
                    <span className="capitalize font-medium">{member.category}</span>
                    <span className="text-accent font-semibold">Active 2026</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Club Governance & Elections Callout */}
          <section className="p-8 sm:p-10 rounded-md bg-surface border border-border-strong relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-accent" aria-hidden="true" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-accent uppercase tracking-[0.2em]">
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>CLUB GOVERNANCE &amp; ELECTIONS</span>
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-fg">
                  Interested in Joining the Executive Council?
                </h2>
                <p className="text-xs sm:text-sm text-fg-muted leading-relaxed max-w-2xl font-body">
                  Elections and arbiter council inductions are conducted every Spring semester. Active club members with demonstrable tournament participation or arbitration background are eligible to run for coordinator and executive positions.
                </p>
              </div>

              <div className="lg:col-span-4 flex lg:justify-end">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xs text-xs font-bold uppercase tracking-wider text-on-accent bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
                >
                  <span>Join Chaturanga First</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
