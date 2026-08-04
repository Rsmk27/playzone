import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ParticleBurst from '../../src/components/ParticleBurst';

describe('ParticleBurst', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders default number of particles (18)', () => {
    const { container } = render(<ParticleBurst x={100} y={200} color="red" />);
    const particles = container.querySelectorAll('span');
    expect(particles.length).toBe(18);
  });

  it('renders custom number of particles based on count prop', () => {
    const { container } = render(<ParticleBurst x={100} y={200} color="red" count={5} />);
    const particles = container.querySelectorAll('span');
    expect(particles.length).toBe(5);
  });

  it('applies correct initial styles based on props', () => {
    const { container } = render(<ParticleBurst x={150} y={250} color="#00ff00" count={1} />);
    const particle = container.querySelector('span');
    expect(particle).not.toBeNull();

    const style = particle.getAttribute('style');
    // x = 150 -> left: 150px
    expect(style).toContain('left: 150px;');
    // y = 250 -> top: 250px
    expect(style).toContain('top: 250px;');
    // color = #00ff00. jsdom converts to rgb
    expect(style).toContain('color: rgb(0, 255, 0);');
    // Math.random() is 0.5. size = 8 + 0.5 * 8 = 12px
    expect(style).toContain('font-size: 12px;');
  });
});