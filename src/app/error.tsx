'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg flex items-center justify-center p-6 font-ui">
      <div className="max-w-md w-full text-center space-y-5 p-8 rounded-md bg-surface border border-border">
        <div className="w-12 h-12 rounded-sm bg-warning/10 border border-warning/30 flex items-center justify-center mx-auto text-warning">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold font-heading text-fg">
            Something went wrong
          </h2>
          <p className="text-xs text-fg-muted">
            An unexpected error occurred while loading this page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-2.5 bg-primary hover:opacity-90 text-on-primary font-semibold text-xs uppercase tracking-wider rounded-sm transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
