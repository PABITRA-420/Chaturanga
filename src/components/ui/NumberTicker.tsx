'use client';

import React, { useEffect, useState, useRef } from 'react';

interface NumberTickerProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export default function NumberTicker({
  value,
  duration = 1000,
  className = '',
  prefix = '',
  suffix = '',
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const startRef = useRef<number | null>(null);
  const prevValueRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;
    const startNum = prevValueRef.current;
    const endNum = value;
    startRef.current = null;

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      // Quintic ease out for crisp snappy deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startNum + (endNum - startNum) * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endNum);
        prevValueRef.current = endNum;
      }
    };

    animId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  return (
    <span className={`inline-block tabular-nums font-mono ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
