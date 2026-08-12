import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import ParticleBurst from '../../src/components/ParticleBurst';

describe('ParticleBurst Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the default number of particles (18) when no count prop is provided', () => {
    const { container } = render(<ParticleBurst x={100} y={200} color="#ff0000" />);
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(18);
  });

  it('renders the specified number of particles when the count prop is provided', () => {
    const { container } = render(<ParticleBurst x={100} y={200} color="#ff0000" count={10} />);
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(10);
  });

  it('renders with the correct positioning (x, y) and color props applied to the particle styles', () => {
    const { container } = render(<ParticleBurst x={150} y={250} color="#00ff00" count={1} />);
    const span = container.querySelector('span');

    expect(span).toBeInTheDocument();

    expect(span.style.left).toBe('150px');
    expect(span.style.top).toBe('250px');
    expect(span.style.color).toBe('rgb(0, 255, 0)');
    expect(span.style.position).toBe('fixed');
    expect(span.style.pointerEvents).toBe('none');
    expect(span.style.zIndex).toBe('9999');

    const tx = span.style.getPropertyValue('--tx');
    const ty = span.style.getPropertyValue('--ty');
    expect(tx).toMatch(/px$/);
    expect(ty).toMatch(/px$/);
    expect(span.style.fontSize).toBe('12px'); // 8 + 0.5 * 8 = 12
  });
});
