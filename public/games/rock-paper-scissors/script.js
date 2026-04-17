
const options = ['Rock','Paper','Scissors'];
const info = document.getElementById('info');
const controls = document.getElementById('controls');
const scoreEl = document.getElementById('score');
scoreEl.classList.remove('hidden');

let s = {player:0, cpu:0, rounds:0};

function btn(label){
  const b = document.createElement('button');
  b.className='btn'; b.textContent = label;
  return b;
}

['Rock','Paper','Scissors'].forEach(v=>{
  const b = btn(v);
  b.onclick = ()=>play(v);
  controls.appendChild(b);
});

function pick(){ return options[Math.floor(Math.random()*3)]; }

function winner(p,c){
  if(p===c) return 'Draw';
  if((p==='Rock'&&c==='Scissors')||(p==='Paper'&&c==='Rock')||(p==='Scissors'&&c==='Paper')) return 'Player';
  return 'CPU';
}

function play(player){
  const cpu = pick();
  const w = winner(player,cpu);
  s.rounds++;
  if(w==='Player') s.player++; else if(w==='CPU') s.cpu++;
  info.innerHTML = `You chose <b>${player}</b>. CPU chose <b>${cpu}</b>. <b>${w}</b> wins.`;
  scoreEl.textContent = `Score • You ${s.player} : ${s.cpu} CPU • Rounds ${s.rounds}`;
}

info.textContent = 'Pick Rock, Paper, or Scissors.';
scoreEl.textContent = 'Score • You 0 : 0 CPU • Rounds 0';
