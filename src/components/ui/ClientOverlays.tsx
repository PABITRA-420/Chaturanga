'use client';

import dynamic from 'next/dynamic';
import SmoothEntranceLoader from '@/components/ui/SmoothEntranceLoader';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';

const SlowNetworkIndicator = dynamic(() => import('@/components/ui/SlowNetworkIndicator'), { ssr: false });
const FloatingContactButton = dynamic(() => import('@/components/ui/FloatingContactButton'), { ssr: false });
const GlobalModals = dynamic(() => import('@/components/ui/GlobalModals'), { ssr: false });

export default function ClientOverlays() {
  return (
    <>
      <ScrollProgressBar />
      <SmoothEntranceLoader />
      <ScrollToTopButton />
      <SlowNetworkIndicator />
      <FloatingContactButton />
      <GlobalModals />
    </>
  );
}

