'use client';

import React from 'react';

export default function InteractiveBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden chess-bg-pattern opacity-60"
    />
  );
}
