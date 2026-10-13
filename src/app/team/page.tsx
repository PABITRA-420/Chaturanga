import type { Metadata } from 'next';
import TeamView from '@/components/TeamView';

export const metadata: Metadata = {
  title: 'Executive Council & Arbiters • CHATURANGA JGEC',
  description: 'Meet the student leadership, FIDE certified arbiters, tournament directors, and faculty patrons of the Jalpaiguri Government Engineering College Chess Club.',
  openGraph: {
    title: 'CHATURANGA JGEC • Executive Council & Club Mentors',
    description: 'Meet the arbiters and student council leading competitive chess at JGEC.',
    siteName: 'CHATURANGA JGEC',
  },
};

export default function TeamPage() {
  return <TeamView />;
}
