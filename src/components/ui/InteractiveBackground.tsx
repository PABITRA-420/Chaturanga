'use client';

import React, { useState, useEffect } from 'react';

export default function InteractiveBackground() {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* 21st.dev Mouse Tracking Atmospheric Radial Halo */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full transition-transform duration-300 ease-out -translate-x-1/2 -translate-y-1/2 opacity-25 blur-[120px]"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          background: 'radial-gradient(circle, rgba(212,175,124,0.35) 0%, rgba(18,22,29,0) 70%)',
        }}
      />
    </div>
  );
}
