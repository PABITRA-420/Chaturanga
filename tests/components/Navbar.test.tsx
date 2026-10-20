import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Navbar from '@/components/Navbar';
import { usePathname, useRouter } from 'next/navigation';

describe('Navbar Component (Navbar.tsx)', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue('/');
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn()
    } as any);
  });

  it('renders brand title, chess club subtitle, and logo', () => {
    render(<Navbar />);

    expect(screen.getByText('CHATURANGA')).toBeInTheDocument();
    expect(screen.getByText('CHESS CLUB')).toBeInTheDocument();
    const logoLink = screen.getByRole('link', { name: /CHATURANGA/i });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders all primary desktop navigation links', () => {
    render(<Navbar />);

    const expectedLinks = [
      'Home',
      'Upcoming',
      'Past Events',
      'Leaderboard',
      'Gallery',
      'Our Team',
      'Check Pass',
      'Register'
    ];

    expectedLinks.forEach((linkName) => {
      const elements = screen.getAllByText(linkName);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('highlights active route according to usePathname', () => {
    vi.mocked(usePathname).mockReturnValue('/leaderboard');

    render(<Navbar />);

    // In Navbar, active link text is contained inside a Link with class containing bg-[#D4AF7C]/15
    const leaderboardLinks = screen.getAllByRole('link', { name: /Leaderboard/i });
    const activeDesktopLink = leaderboardLinks.find((el) =>
      el.className.includes('bg-[#D4AF7C]/15')
    );
    expect(activeDesktopLink).toBeDefined();
  });

  it('toggles mobile menu drawer when hamburger button is clicked', () => {
    render(<Navbar />);

    const toggleButton = screen.getByRole('button', { name: /Toggle Navigation/i });
    expect(toggleButton).toBeInTheDocument();

    // Initially mobile drawer contains max-h-0
    const drawer = toggleButton.closest('header')?.querySelector('.overflow-hidden');
    expect(drawer?.className).toContain('max-h-0');

    // Click to open
    fireEvent.click(toggleButton);
    expect(drawer?.className).toContain('max-h-[500px]');

    // Click again to close
    fireEvent.click(toggleButton);
    expect(drawer?.className).toContain('max-h-0');
  });

  it('calls onRegisterClick callback when Join Us button is clicked and prop is provided', () => {
    const handleRegisterClick = vi.fn();
    render(<Navbar onRegisterClick={handleRegisterClick} />);

    const joinButtons = screen.getAllByRole('button', { name: /Join Us/i });
    fireEvent.click(joinButtons[0]);

    expect(handleRegisterClick).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('navigates to /register via router.push when Join Us is clicked without callback prop', () => {
    render(<Navbar />);

    const joinButtons = screen.getAllByRole('button', { name: /Join Us/i });
    fireEvent.click(joinButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/register');
  });

  it('toggles scrolled styling when window scroll position changes', () => {
    render(<Navbar />);
    const header = screen.getByRole('banner');

    expect(header.className).toContain('bg-[#0B0F14]/70');

    // Simulate scroll past 15px
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(header.className).toContain('bg-[#0B0F14]/90');
    expect(header.className).toContain('shadow-2xl');

    // Scroll back to top
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(header.className).toContain('bg-[#0B0F14]/70');
  });
});
