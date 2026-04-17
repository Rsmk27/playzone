
const icons = ['🚗','🚒','🏎️','🚑','✈️','🛥️','🚁','🏍️'];
let cards = [...icons, ...icons].sort(()=>Math.random()-0.5).map((v,i)=>({id:i, val:v, open:false, done:false}));
const grid = document.getElementById('mem-grid');
const info = document.getElementById('info');
const score = document.getElementById('score');
score.classList.remove('hidden');
let moves = 0, matched = 0, openSel = [];

function render(){
  grid.innerHTML='';
  cards.forEach(c=>{
    const el = document.createElement('div');
    el.className = 'card-min';
    el.style.height='80px';
    el.style.display='flex'; el.style.alignItems='center'; el.style.justifyContent='center';
    el.style.cursor='pointer';
    el.onclick = ()=>flip(c);
    el.textContent = (c.open||c.done)? c.val : '🂠';
    if(c.done){ el.style.opacity=.6; el.style.filter='grayscale(1)'}
    grid.appendChild(el);
  });
  score.textContent = `Moves: ${moves} • Matched: ${matched}/8`;
}
function flip(c){
  if(c.done || c.open || openSel.length===2) return;
  c.open = true; openSel.push(c); render();
  if(openSel.length===2){
    moves++;
    setTimeout(()=>{
      const [a,b]=openSel;
      if(a.val===b.val){ a.done=b.done=true; matched++; }
      a.open=b.open=false; openSel=[]; render();
      if(matched===8){ info.textContent='Great memory! Resetting…'; setTimeout(reset,1000);}
    }, 450);
  }
}
function reset(){
  moves=0; matched=0; openSel=[];
  cards = [...icons, ...icons].sort(()=>Math.random()-0.5).map((v,i)=>({id:i, val:v, open:false, done:false}));
  render();
}
info.textContent = 'Flip two matching cards.';
render();
