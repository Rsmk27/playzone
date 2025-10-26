
const c = document.getElementById('flappy'); const x = c.getContext('2d');
const info = document.getElementById('info'); const scoreEl = document.getElementById('score'); scoreEl.classList.remove('hidden');

let bird = {x:100, y:250, v:0};
let pipes = []; let t=0, pts=0, alive=true;

function pipe(){ 
  const gap = 140; 
  const top = 60 + Math.random()*260; 
  return {x:c.width, top: top, gap: gap};
}

function reset(){
  bird={x:100,y:250,v:0}; pipes=[]; t=0; pts=0; alive=true;
}

function step(){
  if(alive){
    t++;
    if(t%90===0) pipes.push(pipe());
    // physics
    bird.v += 0.5; bird.y += bird.v;
    // collision ground/sky
    if(bird.y<0||bird.y>c.height){ alive=false; }
    // move & collide pipes
    pipes.forEach(p=>{ p.x -= 2; });
    pipes = pipes.filter(p=>p.x>-60);
    pipes.forEach(p=>{
      const inX = bird.x>p.x-20 && bird.x < p.x+60;
      const hitTop = bird.y < p.top;
      const hitBottom = bird.y > (p.top + p.gap);
      if(inX && (hitTop || hitBottom)) alive=false;
      if(p.x+60===bird.x) pts++;
    });
  }else{
    // auto reset after short pause
    if(t%60===0){ reset(); }
    t++;
  }
  draw();
  requestAnimationFrame(step);
}

function draw(){
  x.fillStyle='#0b0f1a'; x.fillRect(0,0,c.width,c.height);
  // bird
  x.fillStyle='#a78bfa'; x.fillRect(bird.x-10,bird.y-10,20,20);
  // pipes
  x.fillStyle='#6ee7ff';
  pipes.forEach(p=>{
    x.fillRect(p.x,0,60,p.top);
    x.fillRect(p.x,p.top+p.gap,60,c.height-(p.top+p.gap));
  });
  scoreEl.textContent = `Score: ${pts}`;
  if(!alive){ info.textContent='Crashed! Auto-restarting… Press Space to flap.'; } else { info.textContent='Press Space / click to flap.'; }
}

window.addEventListener('keydown', e=>{ if(e.code==='Space'){ bird.v = -7; } });
c.addEventListener('mousedown', ()=>{ bird.v = -7; });

reset(); step();
