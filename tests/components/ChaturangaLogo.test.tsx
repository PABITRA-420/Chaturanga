import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ChaturangaLogo from '@/components/ChaturangaLogo';

describe('ChaturangaLogo Component (ChaturangaLogo.tsx)', () => {
  it('renders an SVG element with correct default attributes', () => {
    const { container } = render(<ChaturangaLogo />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 501 498');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveClass('w-full', 'h-full', 'object-contain');
  });

  it('accepts and applies custom className and dimensions', () => {
    const { container } = render(
      <ChaturangaLogo className="w-12 h-12 custom-logo-class" width={48} height={48} />
    );
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('custom-logo-class');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
  });

  it('renders internal chess knight path marks', () => {
    const { container } = render(<ChaturangaLogo />);
    const paths = container.querySelectorAll('path');

    expect(paths.length).toBeGreaterThan(0);
  });
});
