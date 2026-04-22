import React, { useEffect, useState } from 'react';

const MobileControls = () => {
  const simulateKey = (keyName) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, code: keyName }));
  };

  const simulateKeyUp = (keyName) => {
    window.dispatchEvent(new KeyboardEvent('keyup', { key: keyName, code: keyName }));
  };

  return (
    <div className="mobile-controls-overlay">
      <div className="dpad">
        <button 
          onPointerDown={(e) => { e.preventDefault(); simulateKey('ArrowUp'); simulateKey('w'); simulateKey('W'); }}
          onPointerUp={(e) => { e.preventDefault(); simulateKeyUp('ArrowUp'); simulateKeyUp('w'); simulateKeyUp('W'); }}
          className="dpad-btn up">↑</button>
        <button 
          onPointerDown={(e) => { e.preventDefault(); simulateKey('ArrowLeft'); simulateKey('a'); simulateKey('A'); }}
          onPointerUp={(e) => { e.preventDefault(); simulateKeyUp('ArrowLeft'); simulateKeyUp('a'); simulateKeyUp('A'); }}
          className="dpad-btn left">←</button>
        <button 
          onPointerDown={(e) => { e.preventDefault(); simulateKey('ArrowRight'); simulateKey('d'); simulateKey('D'); }}
          onPointerUp={(e) => { e.preventDefault(); simulateKeyUp('ArrowRight'); simulateKeyUp('d'); simulateKeyUp('D'); }}
          className="dpad-btn right">→</button>
        <button 
          onPointerDown={(e) => { e.preventDefault(); simulateKey('ArrowDown'); simulateKey('s'); simulateKey('S'); }}
          onPointerUp={(e) => { e.preventDefault(); simulateKeyUp('ArrowDown'); simulateKeyUp('s'); simulateKeyUp('S'); }}
          className="dpad-btn down">↓</button>
      </div>
      <div className="action-buttons">
        <button 
          onPointerDown={(e) => { e.preventDefault(); simulateKey('Space'); simulateKey(' '); }}
          onPointerUp={(e) => { e.preventDefault(); simulateKeyUp('Space'); simulateKeyUp(' '); }}
          className="action-btn">ACT</button>
      </div>
    </div>
  );
};

export default MobileControls;
