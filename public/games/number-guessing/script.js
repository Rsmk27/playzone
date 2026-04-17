
const info = document.getElementById('info'); const controls = document.getElementById('controls'); const score=document.getElementById('score'); score.classList.remove('hidden');
let secret = Math.floor(Math.random()*100)+1, tries=0;
const input = document.createElement('input'); input.type='number'; input.placeholder='1-100'; input.className='search';
const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Guess';
controls.appendChild(input); controls.appendChild(btn);
btn.onclick = ()=>{
  const n = +input.value; if(!n) return;
  tries++; if(n===secret){ info.textContent=`Correct! It was ${secret}. Resetting…`; score.textContent=`Tries: ${tries}`; setTimeout(()=>{secret=Math.floor(Math.random()*100)+1; tries=0; info.textContent='New number. Guess again!'; score.textContent='Tries: 0'; input.value='';}, 800); }
  else if(n<secret){ info.textContent='Too low!'; }
  else { info.textContent='Too high!'; }
  score.textContent=`Tries: ${tries}`;
};
info.textContent='Guess a number between 1 and 100.';
