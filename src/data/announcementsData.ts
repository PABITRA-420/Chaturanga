export interface ClubAnnouncement {
  id: string;
  title: string;
  category: 'TOURNAMENT' | 'PRACTICE' | 'SELECTION' | 'GENERAL';
  date: string;
  badgeColor: string;
  summary: string;
  content: string;
  isUrgent?: boolean;
  linkText?: string;
  linkUrl?: string;
}

export const CLUB_ANNOUNCEMENTS: ClubAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Chaturanga Spring Blitz Open 2026: Registrations Now Live!',
    category: 'TOURNAMENT',
    date: 'April 02, 2026',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    summary: 'Registrations are open for the 7-round Swiss Rapid Championship on April 28, 2026. JGEC students enter free.',
    content: 'All players must register online before April 25, 2026. Entry is 100% free for bona fide students of Jalpaiguri Government Engineering College. Bring valid student ID card on tournament day. Total prize pool is ₹25,000 with trophies across Top 5 open and Best Department.',
    isUrgent: true,
    linkText: 'Register Now',
    linkUrl: '/register'
  },
  {
    id: 'ann-2',
    title: 'Weekly Collegiate Practice Sessions & Clock Sparring in Room 204',
    category: 'PRACTICE',
    date: 'March 28, 2026',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    summary: 'Join us every Wednesday & Friday from 4:30 PM to 6:30 PM for digital DGT clock practice and grandmaster game analysis.',
    content: 'Open to all years and skill levels. Beginners will be paired with rated club seniors for opening repertoire and tactical drills. Digital clocks and standard weighted Staunton pieces provided by the club.',
    linkText: 'Explore Events',
    linkUrl: '/upcoming'
  },
  {
    id: 'ann-3',
    title: 'Inter-College State Championship Trials Announced',
    category: 'SELECTION',
    date: 'March 20, 2026',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    summary: 'Official college team selection trials for the West Bengal Inter-University Chess Meet will take place on May 10, 2026.',
    content: 'Top 4 players from the selection tournament will represent Jalpaiguri Government Engineering College at the State Inter-University Championship with college sports sponsorship and travel allowance.',
    linkText: 'View Calendar',
    linkUrl: '/#calendar'
  }
];
