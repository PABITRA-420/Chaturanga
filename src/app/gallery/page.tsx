import type { Metadata } from 'next';
import GalleryView from '@/components/GalleryView';

export const metadata: Metadata = {
  title: 'Tournament Photo Gallery • CHATURANGA JGEC Chess Club',
  description: 'View photos, award ceremonies, and championship memories from Jalpaiguri Government Engineering College Chess Club tournaments.',
  openGraph: {
    title: 'CHATURANGA JGEC • Tournament Photo Gallery',
    description: 'Explore collegiate chess tournament memories, awards, and blitz night highlights.',
    siteName: 'CHATURANGA JGEC',
  },
};

export default function GalleryPage() {
  return <GalleryView />;
}
