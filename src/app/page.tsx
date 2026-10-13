import type { Metadata } from 'next';
import HomeView from '@/components/HomeView';

export const metadata: Metadata = {
  title: 'CHATURANGA • JGEC Chess Club | Official Collegiate Chess Platform',
  description: 'Official Chess Club of Jalpaiguri Government Engineering College. Organizing FIDE Swiss rapid championships, collegiate blitz arenas, live ratings leaderboards, and arbitrated tournaments since 2012.',
  keywords: [
    'JGEC Chess Club',
    'Chaturanga JGEC',
    'Jalpaiguri Government Engineering College Chess',
    'College Chess Tournament',
    'Swiss Rapid Chess',
    'FIDE Collegiate Chess',
    'West Bengal University Chess',
  ],
  openGraph: {
    title: 'CHATURANGA JGEC • Official Chess Club Platform',
    description: 'Join Jalpaiguri Government Engineering College’s premier chess club. Register for upcoming championships and track collegiate Elo ratings.',
    siteName: 'CHATURANGA JGEC',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHATURANGA • JGEC Chess Club',
    description: 'Official collegiate chess tournaments, Swiss rapid pairings, and live rankings at Jalpaiguri Government Engineering College.',
  },
};

export default function HomePage() {
  return <HomeView />;
}
