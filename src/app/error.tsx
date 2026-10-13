'use client';

import React from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center p-6 font-['Inter',sans-serif]">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-[#12161D] border border-white/10 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-[#D4AF7C]">
          ⚠️
        </div>
        <h2 className="text-xl font-bold font-['Montserrat',sans-serif] text-[#F5F5F5]">
          Something went wrong
        </h2>
        <p className="text-xs text-[#A0A6B0]">
          An unexpected error occurred while loading this page.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-[#D4AF7C] hover:bg-[#E6C98A] text-[#0B0F14] font-semibold text-xs rounded-full transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
