import type { Metadata } from 'next';
import LeaderboardView from '@/components/LeaderboardView';

export const metadata: Metadata = {
  title: 'Club Elo Leaderboard • CHATURANGA JGEC Chess Club',
  description: 'Official Collegiate Elo Rankings, Rapid, Blitz, and Classical ratings of Jalpaiguri Government Engineering College Chess Club players.',
  openGraph: {
    title: 'CHATURANGA JGEC • Official Chess Club Elo Leaderboard',
    description: 'Check official ratings, win percentages, and standings of JGEC chess players across tournaments.',
    siteName: 'CHATURANGA JGEC',
  },
};

export default function LeaderboardPage() {
  return <LeaderboardView />;
}
