import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MobileControls from './MobileControls';

describe('MobileControls Component', () => {
  let dispatchEventSpy;

  beforeEach(() => {
    dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
  });

  it('renders correctly without errors', () => {
    render(<MobileControls />);

    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('ACT')).toBeInTheDocument();
  });

  it('dispatches keydown events for Space when ACT button is pressed', () => {
    render(<MobileControls />);
    const actButton = screen.getByText('ACT');

    fireEvent.pointerDown(actButton);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
    expect(dispatchEventSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({ type: 'keydown', key: 'Space', code: 'Space' }));
    expect(dispatchEventSpy).toHaveBeenNthCalledWith(2, expect.objectContaining({ type: 'keydown', key: ' ', code: ' ' }));
  });

  it('dispatches keyup events for Space when ACT button is released', () => {
    render(<MobileControls />);
    const actButton = screen.getByText('ACT');

    fireEvent.pointerUp(actButton);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
    expect(dispatchEventSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({ type: 'keyup', key: 'Space', code: 'Space' }));
    expect(dispatchEventSpy).toHaveBeenNthCalledWith(2, expect.objectContaining({ type: 'keyup', key: ' ', code: ' ' }));
  });

  it('dispatches keydown events for ArrowUp when UP dpad button is pressed', () => {
    render(<MobileControls />);
    const upButton = screen.getByText('↑');

    fireEvent.pointerDown(upButton);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(3);
    expect(dispatchEventSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({ type: 'keydown', key: 'ArrowUp', code: 'ArrowUp' }));
    expect(dispatchEventSpy).toHaveBeenNthCalledWith(2, expect.objectContaining({ type: 'keydown', key: 'w', code: 'w' }));
    expect(dispatchEventSpy).toHaveBeenNthCalledWith(3, expect.objectContaining({ type: 'keydown', key: 'W', code: 'W' }));
  });
});
