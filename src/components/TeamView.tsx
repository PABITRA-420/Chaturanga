'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { TeamMember } from '@/data/teamData';
import { 
  Users, 
  Trophy, 
  Shield, 
  Sparkles, 
  GraduationCap, 
  ArrowRight, 
  Award, 
  Swords, 
  CheckCircle2, 
  BookOpen 
} from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F5F5] antialiased selection:bg-[#D4AF7C] selection:text-[#0B0F14] relative overflow-x-hidden font-['Inter',sans-serif]">
      <Navbar />

      <main id="main-content" className="w-full pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 uppercase tracking-widest">
                <Users className="w-3.5 h-3.5" />
                <span>EXECUTIVE COUNCIL & LEADERSHIP</span>
              </div>
              <h1 className="font-['Montserrat',sans-serif] font-black text-3xl sm:text-5xl text-[#F5F5F5] tracking-tight">
                The Arbiters <span className="text-[#D4AF7C]">&</span> Guardians of 64 Squares
              </h1>
              <p className="text-sm sm:text-base text-[#A0A6B0] max-w-2xl font-['Poppins',sans-serif] leading-relaxed">
                Meet the collegiate organizers, FIDE-certified arbiters, and faculty patrons dedicated to advancing competitive chess culture at Jalpaiguri Government Engineering College.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
                    className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#D4AF7C] to-[#E6C98A] text-[#0B0F14] font-bold shadow-lg shadow-[#D4AF7C]/20'
                        : 'bg-[#12161D] text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5 border border-white/10'
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
                  className="rounded-3xl bg-[#12161D] border border-white/10 p-6 flex flex-col justify-between animate-pulse space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10" />
                      <div className="w-20 h-6 rounded-full bg-white/5" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-5 w-3/4 rounded-md bg-white/10" />
                      <div className="h-3.5 w-1/2 rounded-md bg-white/5" />
                      <div className="h-3 w-2/3 rounded-md bg-white/5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 w-full rounded bg-white/5" />
                      <div className="h-3 w-5/6 rounded bg-white/5" />
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                      <div className="h-3 w-1/3 rounded bg-white/10" />
                      <div className="h-3 w-2/3 rounded bg-white/5" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="h-3 w-20 rounded bg-white/5" />
                    <div className="h-3 w-16 rounded bg-white/5" />
                  </div>
                </div>
              ))
            ) : filteredMembers.length === 0 ? (
              <div className="col-span-full py-16 px-6 text-center rounded-3xl bg-[#12161D]/60 border border-white/5 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#D4AF7C]/10 border border-[#D4AF7C]/20 flex items-center justify-center mx-auto text-[#D4AF7C]">
                  <Users className="w-8 h-8 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-['Montserrat',sans-serif] text-white/90">
                    No Team Members Found
                  </h3>
                  <p className="text-sm text-[#A0A6B0] max-w-md mx-auto font-['Poppins',sans-serif]">
                    {activeTab === 'all' 
                      ? 'Leadership roster is being finalized for the upcoming collegiate session.' 
                      : `No members currently listed under the ${activeTab} category.`}
                  </p>
                </div>
                {activeTab !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="text-xs font-semibold text-[#D4AF7C] hover:underline cursor-pointer"
                  >
                    View all leadership &rarr;
                  </button>
                )}
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="group relative rounded-3xl bg-[#12161D] border border-white/10 hover:border-[#D4AF7C]/50 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 overflow-hidden"
                >
                  {/* Gold Sheen on Hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF7C]/5 rounded-full blur-2xl group-hover:bg-[#D4AF7C]/15 transition-all pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    
                    {/* Top Avatar with Portrait and Insignia */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        {member.imageUrl ? (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#D4AF7C]/50 shadow-md group-hover:border-[#D4AF7C] transition-all bg-black/60">
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.avatarColor} border-2 border-[#D4AF7C]/50 flex items-center justify-center text-[#0B0F14] font-black text-2xl shadow-md`}>
                            {member.chessPiece === 'King' ? '♚' :
                             member.chessPiece === 'Queen' ? '♛' :
                             member.chessPiece === 'Rook' ? '♜' :
                             member.chessPiece === 'Bishop' ? '♝' : '♞'}
                          </div>
                        )}
                        
                        {/* Chess Piece Insignia Badge */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#12161D] border-2 border-[#D4AF7C] flex items-center justify-center text-[10px] text-[#D4AF7C]" title={member.titleBadge}>
                          {member.chessPiece === 'King' ? '♚' :
                           member.chessPiece === 'Queen' ? '♛' :
                           member.chessPiece === 'Rook' ? '♜' :
                           member.chessPiece === 'Bishop' ? '♝' : '♞'}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold text-[#F3E2B8] bg-[#D4AF7C]/15 border border-[#D4AF7C]/40 shadow-sm">
                          {member.elo}
                        </span>
                        {member.fideId && (
                          <div className="text-xs text-[#A0A6B0] font-mono mt-1">
                            {member.fideId.startsWith('@') ? (
                              <a
                                href={`https://lichess.org/@/${member.fideId.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-300 hover:text-sky-200 hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>Lichess: {member.fideId}</span>
                                <span>↗</span>
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
                      <h2 className="font-['Montserrat',sans-serif] font-bold text-lg text-[#F5F5F5] group-hover:text-[#D4AF7C] transition-colors">
                        {member.name}
                      </h2>
                      <div className="text-xs font-bold text-[#D4AF7C]">
                        {member.role}
                      </div>
                      <div className="text-xs text-[#A0A6B0]">
                        {member.year} • {member.titleBadge || 'Club Member'}
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-[#A0A6B0] font-['Poppins',sans-serif] leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>

                    {/* Favorite Opening */}
                    <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF7C] flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-[#D4AF7C]" />
                        <span>Signature Opening</span>
                      </div>
                      <div className="text-xs text-[#F5F5F5] font-mono font-medium truncate">
                        {member.favoriteOpening}
                      </div>
                    </div>

                    {/* Core Achievements */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF7C]">
                        Key Highlights
                      </div>
                      <ul className="space-y-1 text-xs text-[#A0A6B0]">
                        {member.achievements.slice(0, 2).map((ach, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF7C] shrink-0 mt-0.5" />
                            <span className="leading-tight">{ach}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Card Footer: Category badge */}
                  <div className="pt-4 mt-5 border-t border-white/10 flex items-center justify-between text-xs text-[#A0A6B0] relative z-10">
                    <span className="capitalize font-medium">{member.category} Committee</span>
                    <span className="text-[#D4AF7C] font-semibold">Active 2026</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Club Governance & Elections Callout */}
          <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#12161D] via-[#161B22] to-[#12161D] border border-white/10 space-y-6 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#D4AF7C] bg-[#D4AF7C]/10 border border-[#D4AF7C]/30 uppercase tracking-widest">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>CLUB GOVERNANCE & ELECTIONS</span>
                </div>
                <h2 className="font-['Montserrat',sans-serif] text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
                  Interested in Joining the Executive Council?
                </h2>
                <p className="text-xs sm:text-sm text-[#A0A6B0] leading-relaxed max-w-2xl font-['Poppins',sans-serif]">
                  Elections and arbiter council inductions are conducted every Spring semester. Active club members with demonstrable tournament participation or arbitration background are eligible to run for coordinator and executive positions.
                </p>
              </div>

              <div className="lg:col-span-4 flex lg:justify-end">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold text-[#0B0F14] bg-[#D4AF7C] hover:bg-[#E6C98A] transition-all shadow-md shadow-[#D4AF7C]/20 hover:scale-[1.02] cursor-pointer"
                >
                  <span>Join Chaturanga First</span>
                  <ArrowRight className="w-4 h-4" />
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
