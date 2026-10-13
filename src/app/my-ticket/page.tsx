import type { Metadata } from 'next';
import MyTicketView from '@/components/MyTicketView';

export const metadata: Metadata = {
  title: 'Check Registration & Digital Pass • CHATURANGA JGEC',
  description: 'Lookup your tournament seat, check reporting venue, and reprint your official player digital pass for JGEC chess tournaments.',
  openGraph: {
    title: 'Verify Tournament Pass • CHATURANGA JGEC',
    description: 'Lookup registration and verified collegiate player passes.',
    siteName: 'CHATURANGA JGEC',
  },
};

export default function MyTicketPage() {
  return <MyTicketView />;
}
