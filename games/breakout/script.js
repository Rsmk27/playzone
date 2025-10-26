
const cv = document.getElementById('bo'); const ctx = cv.getContext('2d');
const info = document.getElementById('info'); const scoreEl = document.getElementById('score'); scoreEl.classList.remove('hidden');
let x= cv.width/2, y=cv.height-30, dx=2, dy=-2, r=7;
let paddleH=10, paddleW=75, px=(cv.width-paddleW)/2; let right=false, left=false;
const rows=4, cols=7, bw=50, bh=16, pad=8, offsetTop=30, offsetLeft=30;
let bricks=[], pts=0;

function setup(){
  bricks=[]; for(let c=0;c<cols;c++){ bricks[c]=[]; for(let r=0;r<rows;r++){ bricks[c][r]={x:0,y:0,alive:true}; } }
}
document.addEventListener('keydown', e=>{ if(e.key==='ArrowRight') right=true; if(e.key==='ArrowLeft') left=true;});
document.addEventListener('keyup', e=>{ if(e.key==='ArrowRight') right=false; if(e.key==='ArrowLeft') left=false;});
cv.addEventListener('mousemove', e=>{
  const rect=cv.getBoundingClientRect();
  const rel = e.clientX - rect.left;
  px = Math.max(0, Math.min(rel - paddleW/2, cv.width-paddleW));
});

function drawBall(){ ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle='#a78bfa'; ctx.fill(); ctx.closePath(); }
function drawPaddle(){ ctx.fillStyle='#6ee7ff'; ctx.fillRect(px, cv.height-paddleH-5, paddleW, paddleH); }
function drawBricks(){
  for(let c=0;c<cols;c++){ for(let r=0;r<rows;r++){ if(bricks[c][r].alive){ const bx=(c*(bw+pad))+offsetLeft; const by=(r*(bh+pad))+offsetTop; bricks[c][r].x=bx; bricks[c][r].y=by; ctx.fillStyle='#2a3553'; ctx.fillRect(bx,by,bw,bh); } } }
}

function collide(){
  for(let c=0;c<cols;c++){ for(let r=0;r<rows;r++){ const b=bricks[c][r]; if(b.alive){ if(x> b.x && x < b.x+bw && y > b.y && y < b.y+bh){ dy=-dy; b.alive=false; pts++; } } } }
}

function step(){
  ctx.fillStyle='#0b0f1a'; ctx.fillRect(0,0,cv.width,cv.height);
  drawBricks(); drawBall(); drawPaddle(); collide();
  // walls
  if(x+r>cv.width || x-r<0) dx=-dx;
  if(y-r<0) dy=-dy;
  // paddle
  if(y+r>cv.height-paddleH-5 && x>px && x<px+paddleW){ dy=-dy; }
  if(y+r>cv.height){ info.textContent='Missed! Resetting board…'; reset(); }
  // move
  x+=dx; y+=dy;
  if(right) px = Math.min(px+4, cv.width-paddleW);
  if(left) px = Math.max(px-4, 0);
  scoreEl.textContent = `Bricks: ${pts}/${rows*cols}`;
  requestAnimationFrame(step);
}

function reset(){
  x= cv.width/2; y=cv.height-30; dx=2*(Math.random()>0.5?1:-1); dy=-2;
  setup();
}

setup(); step();
