import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import CountdownTimer from '@/components/CountdownTimer';

describe('CountdownTimer Component (CountdownTimer.tsx)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders future target date with calculated DAYS, HOURS, MINUTES, and SECONDS', () => {
    // Set base time to 2026-10-01T00:00:00.000Z
    const baseTime = new Date('2026-10-01T00:00:00.000Z').getTime();
    vi.setSystemTime(baseTime);

    // Target is 2 days, 3 hours, 4 minutes, and 5 seconds in future
    // 2d = 172800s, 3h = 10800s, 4m = 240s, 5s = 5s -> total ms = (172800 + 10800 + 240 + 5) * 1000
    const targetDate = new Date(baseTime + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000).toISOString();

    render(<CountdownTimer targetDate={targetDate} />);

    expect(screen.getByText('DAYS')).toBeInTheDocument();
    expect(screen.getByText('HOURS')).toBeInTheDocument();
    expect(screen.getByText('MINUTES')).toBeInTheDocument();
    expect(screen.getByText('SECONDS')).toBeInTheDocument();

    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('04')).toBeInTheDocument();
    expect(screen.getByText('05')).toBeInTheDocument();
  });

  it('decrements seconds accurately when timer advances by 1000ms', () => {
    const baseTime = new Date('2026-10-01T00:00:00.000Z').getTime();
    vi.setSystemTime(baseTime);

    const targetDate = new Date(baseTime + 10000).toISOString(); // 10 seconds in future

    render(<CountdownTimer targetDate={targetDate} />);

    expect(screen.getByText('10')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('09')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('06')).toBeInTheDocument();
  });

  it('renders "Event Live or Concluded" indicator when target date is in the past', () => {
    const baseTime = new Date('2026-10-01T12:00:00.000Z').getTime();
    vi.setSystemTime(baseTime);

    // Target was 1 hour ago
    const pastDate = new Date(baseTime - 3600 * 1000).toISOString();

    render(<CountdownTimer targetDate={pastDate} />);

    expect(screen.getByText('Event Live or Concluded')).toBeInTheDocument();
    expect(screen.queryByText('DAYS')).not.toBeInTheDocument();
    expect(screen.queryByText('SECONDS')).not.toBeInTheDocument();
  });

  it('transitions to "Event Live or Concluded" when countdown reaches zero', () => {
    const baseTime = new Date('2026-10-01T12:00:00.000Z').getTime();
    vi.setSystemTime(baseTime);

    const targetDate = new Date(baseTime + 2000).toISOString(); // 2 seconds in future

    render(<CountdownTimer targetDate={targetDate} />);

    expect(screen.getByText('02')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByText('Event Live or Concluded')).toBeInTheDocument();
  });
});
