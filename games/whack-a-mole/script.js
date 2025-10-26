
const holes = document.getElementById('holes');
const info = document.getElementById('info');
const scoreEl = document.getElementById('score'); scoreEl.classList.remove('hidden');
let pts=0, active=-1, t=0;

function render(){
  holes.innerHTML='';
  for(let i=0;i<16;i++){
    const d = document.createElement('div');
    d.className='card-min'; d.style.height='80px'; d.style.display='flex'; d.style.alignItems='center'; d.style.justifyContent='center';
    d.style.cursor='pointer';
    d.textContent = (i===active)?'🐹':'🕳️';
    d.onclick = ()=>{ if(i===active){ pts++; active=-1; scoreEl.textContent=`Score: ${pts}`; } };
    holes.appendChild(d);
  }
}
function loop(){
  t++;
  if(t%40===0){ active = Math.floor(Math.random()*16); render(); }
  requestAnimationFrame(loop);
}
info.textContent='Click the mole when it appears!';
scoreEl.textContent='Score: 0';
render(); loop();
