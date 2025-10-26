
const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d');
const info = document.getElementById('info');
const score = document.getElementById('score'); score.classList.remove('hidden');

const size = 20, cols = cvs.width/size, rows = cvs.height/size;
let snake = [{x:10,y:10}], dir={x:1,y:0}, food = spawn(), pts=0, speed=120, timer;

function spawn(){
  return {x:Math.floor(Math.random()*cols), y:Math.floor(Math.random()*rows)};
}
function draw(){
  ctx.fillStyle = '#0b0f1a'; ctx.fillRect(0,0,cvs.width,cvs.height);
  // food
  ctx.fillStyle = '#6ee7ff'; ctx.fillRect(food.x*size, food.y*size, size, size);
  // snake
  ctx.fillStyle = '#a78bfa';
  snake.forEach((s,i)=>ctx.fillRect(s.x*size, s.y*size, size-1, size-1));
}
function step(){
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  // wrap
  head.x = (head.x+cols)%cols; head.y = (head.y+rows)%rows;
  // collide with self
  if(snake.some((s,i)=>i&&s.x===head.x&&s.y===head.y)){ gameOver(); return;}
  snake.unshift(head);
  if(head.x===food.x && head.y===food.y){ pts++; food=spawn(); if(speed>60){speed-=4; restart()} }
  else snake.pop();
  draw();
  score.textContent = `Score: ${pts}`;
}
function gameOver(){
  info.textContent='Game over! Restarting…';
  clearInterval(timer); setTimeout(reset, 900);
}
function reset(){
  snake=[{x:10,y:10}]; dir={x:1,y:0}; food=spawn(); pts=0; speed=120; restart();
}
function restart(){ clearInterval(timer); timer = setInterval(step, speed); }
window.addEventListener('keydown', e=>{
  if(e.key==='ArrowUp'&&dir.y!==1) dir={x:0,y:-1};
  if(e.key==='ArrowDown'&&dir.y!==-1) dir={x:0,y:1};
  if(e.key==='ArrowLeft'&&dir.x!==1) dir={x:-1,y:0};
  if(e.key==='ArrowRight'&&dir.x!==-1) dir={x:1,y:0};
});
info.textContent='Use arrow keys to move. Eat the squares.';
draw(); restart();
