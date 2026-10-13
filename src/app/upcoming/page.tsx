import type { Metadata } from 'next';
import UpcomingEventsView from '@/components/UpcomingEventsView';

export const metadata: Metadata = {
  title: 'Upcoming Tournaments & Calendar • CHATURANGA JGEC',
  description: 'View the official 2026 collegiate chess tournament schedule, Swiss rapid championships, and blitz arena dates at Jalpaiguri Government Engineering College.',
  openGraph: {
    title: 'Upcoming Chess Tournaments • CHATURANGA JGEC',
    description: 'Upcoming Swiss championships, prize pools, and live calendar dates.',
    siteName: 'CHATURANGA JGEC',
  },
};

export default function UpcomingPage() {
  return <UpcomingEventsView />;
}
