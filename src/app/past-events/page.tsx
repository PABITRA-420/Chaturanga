import type { Metadata } from 'next';
import PastEventsView from '@/components/PastEventsView';

export const metadata: Metadata = {
  title: 'Past Tournaments & Hall of Fame • CHATURANGA JGEC',
  description: 'Explore historical chess championship results, podium finishers, and round-by-round crosstables of JGEC chess tournaments.',
  openGraph: {
    title: 'Past Chess Tournaments • CHATURANGA JGEC',
    description: 'Championship archives, winners, and crosstables from past editions.',
    siteName: 'CHATURANGA JGEC',
  },
};

export default function PastEventsPage() {
  return <PastEventsView />;
}
