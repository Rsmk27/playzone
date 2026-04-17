
const info = document.getElementById('info'); const controls = document.getElementById('controls'); const score=document.getElementById('score'); score.classList.remove('hidden');
const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Roll d6'; controls.appendChild(btn);
btn.onclick = ()=>{ const n = Math.floor(Math.random()*6)+1; info.textContent = `You rolled: ${n}`; score.textContent=`History: ${(score.textContent.replace('History: ','')+' '+n).trim()}`; }
info.textContent='Click to roll a six-sided die.'; score.textContent='History: ';
