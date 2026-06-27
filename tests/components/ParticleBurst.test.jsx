import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ParticleBurst from '../../src/components/ParticleBurst';

describe('ParticleBurst', () => {
  it('renders default number of particles (18)', () => {
    const { container } = render(<ParticleBurst x={100} y={100} color="red" />);
    const particles = container.querySelectorAll('span');
    expect(particles.length).toBe(18);
  });

  it('renders exactly the requested number of particles', () => {
    const { container } = render(<ParticleBurst x={100} y={100} color="blue" count={5} />);
    const particles = container.querySelectorAll('span');
    expect(particles.length).toBe(5);
  });

  it('applies correct inline styles based on props', () => {
    const x = 250;
    const y = 300;
    const color = 'green';
    const { container } = render(<ParticleBurst x={x} y={y} color={color} count={1} />);

    const particle = container.querySelector('span');
    expect(particle).not.toBeNull();

    // Check styles that come from props
    expect(particle.style.left).toBe(`${x}px`);
    expect(particle.style.top).toBe(`${y}px`);
    expect(particle.style.color).toBe(color);

    // Check some fixed styles
    expect(particle.style.position).toBe('fixed');
    expect(particle.style.pointerEvents).toBe('none');
  });

  it('renders characters from the predefined array', () => {
    const CHARS = ['✦', '★', '◆', '●', '▲', '♥', '✸'];
    const { container } = render(<ParticleBurst x={0} y={0} color="red" count={10} />);

    const particles = container.querySelectorAll('span');
    particles.forEach((particle) => {
      expect(CHARS).toContain(particle.textContent);
    });
  });
});
