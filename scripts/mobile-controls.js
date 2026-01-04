/**
 * PlayZone Mobile Controls Utility
 * Provides touch controls and responsive canvas scaling for mobile devices
 */

// Prevent default touch behaviors to avoid scrolling during gameplay
function preventMobileScrolling() {
  document.body.style.touchAction = 'none';
  document.body.style.overscrollBehavior = 'none';
  
  // Prevent pull-to-refresh and other default touch behaviors
  document.addEventListener('touchmove', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

// Make canvas responsive while maintaining aspect ratio
function makeCanvasResponsive(canvas, originalWidth, originalHeight) {
  const container = canvas.parentElement;
  
  function resize() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const aspectRatio = originalWidth / originalHeight;
    
    let newWidth = containerWidth - 20; // padding
    let newHeight = newWidth / aspectRatio;
    
    // If height exceeds container, scale by height instead
    if (newHeight > containerHeight - 100) {
      newHeight = containerHeight - 100;
      newWidth = newHeight * aspectRatio;
    }
    
    // Set display size
    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';
    
    // Keep internal resolution
    canvas.width = originalWidth;
    canvas.height = originalHeight;
  }
  
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
}

// Create on-screen directional pad for arrow key controls
function createDirectionalPad(callbacks) {
  const controls = document.getElementById('controls');
  if (!controls) return;
  
  const dpad = document.createElement('div');
  dpad.className = 'dpad';
  dpad.innerHTML = `
    <div class="dpad-grid">
      <div class="dpad-btn" data-key="up">↑</div>
      <div class="dpad-row">
        <div class="dpad-btn" data-key="left">←</div>
        <div class="dpad-center"></div>
        <div class="dpad-btn" data-key="right">→</div>
      </div>
      <div class="dpad-btn" data-key="down">↓</div>
    </div>
  `;
  
  // Add CSS
  const style = document.createElement('style');
  style.textContent = `
    .dpad {
      display: flex;
      justify-content: center;
      margin: 20px auto;
      max-width: 300px;
    }
    .dpad-grid {
      display: grid;
      grid-template-rows: auto auto auto;
      gap: 10px;
      width: 100%;
    }
    .dpad-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }
    .dpad-btn {
      background:linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2));
      border:2px solid rgba(139, 92, 246, 0.4);
      border-radius:14px;
      color:#6ee7ff;
      font-size:28px;
      padding:22px;
      display:flex;
      align-items:center;
      justify-content:center;
      user-select:none;
      -webkit-user-select:none;
      touch-action:none;
      cursor:pointer;
      min-height:70px;
      font-weight:bold;
      transition:all 0.2s ease;
      box-shadow:0 4px 16px rgba(139, 92, 246, 0.3);
      backdrop-filter:blur(10px);
    }
    .dpad-btn:active {
      background:linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4));
      transform:scale(0.95);
      box-shadow:0 2px 8px rgba(139, 92, 246, 0.4);
    }
    .dpad-center {
      background:transparent;
      border:2px solid rgba(139, 92, 246, 0.2);
      border-radius:14px;
      min-height:70px;
    }
    @media (max-width: 600px) {
      .dpad {
        max-width: 260px;
      }
      .dpad-btn {
        padding: 18px;
        min-height: 60px;
        font-size: 24px;
      }
      .dpad-center {
        min-height: 60px;
      }
    }
  `;
  document.head.appendChild(style);
  
  controls.appendChild(dpad);
  
  // Add touch event handlers
  const buttons = dpad.querySelectorAll('.dpad-btn');
  buttons.forEach(btn => {
    const key = btn.dataset.key;
    
    const handleStart = (e) => {
      e.preventDefault();
      if (callbacks.onStart) callbacks.onStart(key);
    };
    
    const handleEnd = (e) => {
      e.preventDefault();
      if (callbacks.onEnd) callbacks.onEnd(key);
    };
    
    btn.addEventListener('touchstart', handleStart, { passive: false });
    btn.addEventListener('touchend', handleEnd, { passive: false });
    btn.addEventListener('touchcancel', handleEnd, { passive: false });
    btn.addEventListener('mousedown', handleStart);
    btn.addEventListener('mouseup', handleEnd);
    btn.addEventListener('mouseleave', handleEnd);
  });
  
  return dpad;
}

// Create on-screen action buttons (Space, Enter, etc.)
function createActionButtons(buttons) {
  const controls = document.getElementById('controls');
  if (!controls) return;
  
  const container = document.createElement('div');
  container.className = 'action-buttons';
  
  const style = document.createElement('style');
  style.textContent = `
    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
      margin: 20px auto;
    }
    .action-btn {
      background:linear-gradient(135deg, #8b5cf6, #06b6d4);
      border:2px solid transparent;
      border-radius:14px;
      color:#fff;
      font-size:16px;
      font-weight:700;
      padding:18px 36px;
      user-select:none;
      -webkit-user-select:none;
      touch-action:none;
      cursor:pointer;
      min-width:140px;
      text-align:center;
      transition:all 0.2s ease;
      box-shadow:0 4px 16px rgba(139, 92, 246, 0.4);
      position:relative;
      overflow:hidden;
    }
    .action-btn::before{
      content:'';
      position:absolute;
      inset:0;
      background:linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
      opacity:0;
      transition:opacity 0.2s ease;
    }
    .action-btn:active {
      background:linear-gradient(135deg, #7c3aed, #0891b2);
      transform:scale(0.95);
      box-shadow:0 2px 8px rgba(139, 92, 246, 0.4);
    }
    .action-btn:active::before{opacity:1}
    @media (max-width: 600px) {
      .action-btn {
        padding: 16px 28px;
        min-width: 120px;
        font-size: 15px;
      }
    }
  `;
  document.head.appendChild(style);
  
  buttons.forEach(btnConfig => {
    const btn = document.createElement('div');
    btn.className = 'action-btn';
    btn.textContent = btnConfig.label;
    
    const handlePress = (e) => {
      e.preventDefault();
      if (btnConfig.onPress) btnConfig.onPress();
    };
    
    btn.addEventListener('touchstart', handlePress, { passive: false });
    btn.addEventListener('mousedown', handlePress);
    
    container.appendChild(btn);
  });
  
  controls.appendChild(container);
  return container;
}

// Add swipe gesture detection
function addSwipeGesture(element, callbacks) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  
  const minSwipeDistance = 50;
  
  element.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  element.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && callbacks.onSwipeRight) {
          callbacks.onSwipeRight();
        } else if (deltaX < 0 && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && callbacks.onSwipeDown) {
          callbacks.onSwipeDown();
        } else if (deltaY < 0 && callbacks.onSwipeUp) {
          callbacks.onSwipeUp();
        }
      }
    }
  }
}

// Simulate keyboard events from touch controls
function simulateKeyPress(key, type = 'keydown') {
  const event = new KeyboardEvent(type, {
    key: key,
    code: key,
    keyCode: getKeyCode(key),
    which: getKeyCode(key),
    bubbles: true
  });
  window.dispatchEvent(event);
}

function getKeyCode(key) {
  const keyCodes = {
    'ArrowUp': 38,
    'ArrowDown': 40,
    'ArrowLeft': 37,
    'ArrowRight': 39,
    ' ': 32,
    'Space': 32,
    'Enter': 13
  };
  return keyCodes[key] || 0;
}

// Initialize mobile optimizations
function initMobileControls() {
  preventMobileScrolling();
}

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileControls);
} else {
  initMobileControls();
}
