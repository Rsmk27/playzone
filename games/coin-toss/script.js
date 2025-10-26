
const info = document.getElementById('info'); const controls = document.getElementById('controls'); const score=document.getElementById('score'); score.classList.remove('hidden');
let tally={H:0,T:0};
function add(label){ const b=document.createElement('button'); b.className='btn'; b.textContent=label; b.onclick=()=>flip(label[0].toUpperCase()); controls.appendChild(b); }
add('Heads'); add('Tails');
function flip(choice){
  const val = Math.random()<0.5?'H':'T';
  if(val==='H') tally.H++; else tally.T++;
  info.textContent = `It was ${val==='H'?'Heads':'Tails'}. You picked ${choice==='H'?'Heads':'Tails'}.`;
  score.textContent = `Heads: ${tally.H} • Tails: ${tally.T}`;
}
info.textContent='Pick Heads or Tails and flip the coin.'; score.textContent='Heads: 0 • Tails: 0';
