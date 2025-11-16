
const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d');
const info = document.getElementById('info');
const score = document.getElementById('score'); score.classList.remove('hidden');

const size = 20, cols = cvs.width/size, rows = cvs.height/size;
let snake = [{x:10,y:10}], dir={x:1,y:0}, food = spawn(), pts=0, speed=120, timer, paused=false;
let highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');

function spawn(){
  return {x:Math.floor(Math.random()*cols), y:Math.floor(Math.random()*rows)};
}
function draw(){
  ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0,0,cvs.width,cvs.height);
  // food
  ctx.fillStyle = '#6ee7ff'; ctx.fillRect(food.x*size, food.y*size, size, size);
  // snake
  ctx.fillStyle = '#a78bfa';
  snake.forEach((s,i)=>{
    ctx.fillRect(s.x*size, s.y*size, size-1, size-1);
    if(i===0){
      ctx.fillStyle = '#c4b5fd';
      ctx.fillRect(s.x*size+6, s.y*size+6, 8, 8);
      ctx.fillStyle = '#a78bfa';
    }
  });
  if(paused){
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0,0,cvs.width,cvs.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', cvs.width/2, cvs.height/2);
    ctx.font = '16px system-ui';
    ctx.fillText('Press SPACE to resume', cvs.width/2, cvs.height/2+30);
  }
}
function step(){
  if(paused) return;
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  // wrap
  head.x = (head.x+cols)%cols; head.y = (head.y+rows)%rows;
  // collide with self
  if(snake.some((s,i)=>i&&s.x===head.x&&s.y===head.y)){ gameOver(); return;}
  snake.unshift(head);
  if(head.x===food.x && head.y===food.y){ pts++; food=spawn(); if(speed>60){speed-=4; restart()} }
  else snake.pop();
  draw();
  updateScore();
}
function updateScore(){
  score.textContent = `Score: ${pts} | High: ${highScore}`;
}
function gameOver(){
  if(pts > highScore){
    highScore = pts;
    localStorage.setItem('snakeHighScore', highScore.toString());
    info.textContent='🎉 New High Score! Game over. Restarting…';
  } else {
    info.textContent='Game over! Restarting…';
  }
  clearInterval(timer); setTimeout(reset, 1500);
}
function reset(){
  snake=[{x:10,y:10}]; dir={x:1,y:0}; food=spawn(); pts=0; speed=120; paused=false; restart();
}
function restart(){ clearInterval(timer); timer = setInterval(step, speed); }
window.addEventListener('keydown', e=>{
  if(e.key===' '||e.key==='Escape'){
    paused = !paused;
    draw();
    info.textContent = paused ? 'Game paused. Press SPACE to resume.' : 'Use arrow keys or on-screen controls to move. Eat the squares.';
    return;
  }
  if(paused) return;
  if(e.key==='ArrowUp'&&dir.y!==1) dir={x:0,y:-1};
  if(e.key==='ArrowDown'&&dir.y!==-1) dir={x:0,y:1};
  if(e.key==='ArrowLeft'&&dir.x!==1) dir={x:-1,y:0};
  if(e.key==='ArrowRight'&&dir.x!==-1) dir={x:1,y:0};
});
// Make canvas responsive
makeCanvasResponsive(cvs, 400, 400);

// Add touch controls
createDirectionalPad({
  onStart: (key) => {
    if(key === 'up' && dir.y !== 1) dir = {x:0, y:-1};
    if(key === 'down' && dir.y !== -1) dir = {x:0, y:1};
    if(key === 'left' && dir.x !== 1) dir = {x:-1, y:0};
    if(key === 'right' && dir.x !== -1) dir = {x:1, y:0};
  },
  onEnd: () => {}
});

info.textContent='Use arrow keys or on-screen controls to move. Press SPACE to pause.';
draw(); restart(); updateScore();
