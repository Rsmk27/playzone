
const cv = document.getElementById('bo'); const ctx = cv.getContext('2d');
const info = document.getElementById('info'); const scoreEl = document.getElementById('score'); scoreEl.classList.remove('hidden');

// Game state
let x = cv.width/2, y = cv.height-30, dx = 2, dy = -2, r = 7;
let paddleH = 10, paddleW = 75, px = (cv.width-paddleW)/2; 
let right = false, left = false;
const rows = 5, cols = 7, bw = 50, bh = 16, pad = 8, offsetTop = 30, offsetLeft = 30;
let bricks = [];
let score = 0, lives = 3, level = 1, gameState = 'playing', paused = false;
let particles = [];
let highScore = parseInt(localStorage.getItem('breakoutHighScore')) || 0;

// Brick colors by row (from top to bottom) with point values
const brickColors = [
  { color: '#ff6b6b', points: 50 },  // Red - top row (most points)
  { color: '#ffd93d', points: 40 },  // Yellow
  { color: '#6bcf7f', points: 30 },  // Green
  { color: '#4dabf7', points: 20 },  // Blue
  { color: '#a78bfa', points: 10 }   // Purple - bottom row (least points)
];

function setup(){
  bricks = [];
  for(let c = 0; c < cols; c++) {
    bricks[c] = [];
    for(let r = 0; r < rows; r++) {
      bricks[c][r] = {
        x: 0, 
        y: 0, 
        alive: true, 
        color: brickColors[r].color,
        points: brickColors[r].points
      };
    }
  }
}

// Keyboard controls
document.addEventListener('keydown', e => {
  if(e.key === 'ArrowRight') right = true;
  if(e.key === 'ArrowLeft') left = true;
  if(e.key === 'p' || e.key === 'P') togglePause();
  if((e.key === ' ' || e.key === 'Enter') && gameState !== 'playing') {
    restartGame();
  }
});

document.addEventListener('keyup', e => {
  if(e.key === 'ArrowRight') right = false;
  if(e.key === 'ArrowLeft') left = false;
});

// Mouse controls
cv.addEventListener('mousemove', e => {
  if(gameState !== 'playing' || paused) return;
  const rect = cv.getBoundingClientRect();
  const rel = e.clientX - rect.left;
  px = Math.max(0, Math.min(rel - paddleW/2, cv.width-paddleW));
});

// Touch controls
cv.addEventListener('touchmove', e => {
  if(gameState !== 'playing' || paused) return;
  e.preventDefault();
  const rect = cv.getBoundingClientRect();
  const touch = e.touches[0];
  const rel = touch.clientX - rect.left;
  px = Math.max(0, Math.min(rel - paddleW/2, cv.width-paddleW));
}, { passive: false });

function togglePause() {
  if(gameState === 'playing') {
    paused = !paused;
    info.textContent = paused ? 'PAUSED - Press P to resume' : `Level ${level} - Lives: ${lives}`;
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#a78bfa';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#a78bfa';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.closePath();
}

function drawPaddle() {
  ctx.fillStyle = '#6ee7ff';
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#6ee7ff';
  ctx.fillRect(px, cv.height-paddleH-5, paddleW, paddleH);
  ctx.shadowBlur = 0;
}

function drawBricks() {
  for(let c = 0; c < cols; c++) {
    for(let r = 0; r < rows; r++) {
      if(bricks[c][r].alive) {
        const bx = (c * (bw + pad)) + offsetLeft;
        const by = (r * (bh + pad)) + offsetTop;
        bricks[c][r].x = bx;
        bricks[c][r].y = by;
        
        ctx.fillStyle = bricks[c][r].color;
        ctx.fillRect(bx, by, bw, bh);
        
        // Add border for depth
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
      }
    }
  }
}

// Particle system for brick breaking effect
function createParticles(x, y, color) {
  for(let i = 0; i < 8; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      color: color
    });
  }
}

function updateParticles() {
  particles = particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.02;
    return p.life > 0;
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fillRect(p.x, p.y, 3, 3);
  });
  ctx.globalAlpha = 1;
}

function collide() {
  for(let c = 0; c < cols; c++) {
    for(let r = 0; r < rows; r++) {
      const b = bricks[c][r];
      if(b.alive) {
        if(x > b.x && x < b.x + bw && y > b.y && y < b.y + bh) {
          dy = -dy;
          b.alive = false;
          score += b.points;
          createParticles(b.x + bw/2, b.y + bh/2, b.color);
          
          // Check if level complete
          if(checkLevelComplete()) {
            levelComplete();
          }
        }
      }
    }
  }
}

function checkLevelComplete() {
  for(let c = 0; c < cols; c++) {
    for(let r = 0; r < rows; r++) {
      if(bricks[c][r].alive) return false;
    }
  }
  return true;
}

function levelComplete() {
  gameState = 'levelComplete';
  level++;
  info.textContent = `Level ${level - 1} Complete! Press SPACE or ENTER to continue`;
  
  // Update high score
  if(score > highScore) {
    highScore = score;
    localStorage.setItem('breakoutHighScore', highScore);
  }
}

function nextLevel() {
  setup();
  x = cv.width/2;
  y = cv.height - 30;
  dx = 2 * (Math.random() > 0.5 ? 1 : -1) * (1 + level * 0.1);
  dy = -2 * (1 + level * 0.1);
  gameState = 'playing';
  info.textContent = `Level ${level} - Lives: ${lives}`;
}

function loseLife() {
  lives--;
  if(lives <= 0) {
    gameOver();
  } else {
    x = cv.width/2;
    y = cv.height - 30;
    dx = 2 * (Math.random() > 0.5 ? 1 : -1);
    dy = -2;
    info.textContent = `Life lost! ${lives} lives remaining`;
    setTimeout(() => {
      if(gameState === 'playing') {
        info.textContent = `Level ${level} - Lives: ${lives}`;
      }
    }, 2000);
  }
}

function gameOver() {
  gameState = 'gameOver';
  info.textContent = `Game Over! Score: ${score} | High Score: ${highScore} | Press SPACE or ENTER to restart`;
  
  // Update high score
  if(score > highScore) {
    highScore = score;
    localStorage.setItem('breakoutHighScore', highScore);
  }
}

function restartGame() {
  score = 0;
  lives = 3;
  level = 1;
  gameState = 'playing';
  particles = [];
  setup();
  x = cv.width/2;
  y = cv.height - 30;
  dx = 2 * (Math.random() > 0.5 ? 1 : -1);
  dy = -2;
  info.textContent = `Level ${level} - Lives: ${lives}`;
}

function step() {
  if(paused) {
    requestAnimationFrame(step);
    return;
  }
  
  // Clear canvas
  ctx.fillStyle = '#0b0f1a';
  ctx.fillRect(0, 0, cv.width, cv.height);
  
  // Draw game elements
  drawBricks();
  drawParticles();
  drawBall();
  drawPaddle();
  
  if(gameState === 'playing') {
    collide();
    updateParticles();
    
    // Wall collision
    if(x + r > cv.width || x - r < 0) dx = -dx;
    if(y - r < 0) dy = -dy;
    
    // Paddle collision with angle variation
    if(y + r > cv.height - paddleH - 5 && y + r < cv.height - paddleH && x > px && x < px + paddleW) {
      dy = -dy;
      // Add angle variation based on where ball hits paddle
      const hitPos = (x - px) / paddleW; // 0 to 1
      dx = (hitPos - 0.5) * 6; // Vary horizontal speed based on hit position
    }
    
    // Ball missed
    if(y + r > cv.height) {
      loseLife();
    }
    
    // Move ball
    x += dx;
    y += dy;
    
    // Move paddle with keyboard
    if(right) px = Math.min(px + 5, cv.width - paddleW);
    if(left) px = Math.max(px - 5, 0);
  } else if(gameState === 'levelComplete') {
    updateParticles();
  }
  
  // Update score display
  scoreEl.textContent = `Score: ${score} | Lives: ${lives} | Level: ${level} | High: ${highScore}`;
  
  requestAnimationFrame(step);
}

// Make canvas responsive
makeCanvasResponsive(cv, cv.width, cv.height);

// Initialize game
setup();
info.textContent = `Level ${level} - Lives: ${lives} | Press P to pause`;
step();
