
const board = document.getElementById('board');
const info = document.getElementById('info');
const score = document.getElementById('score');
score.classList.remove('hidden');

let grid = Array(9).fill(null);
let turn = 'X';
let tally = {X:0, O:0, games:0};

function cell(i){
  const d = document.createElement('div');
  d.className='cell';
  d.onclick = ()=>move(i,d);
  return d;
}

function render(){
  board.innerHTML='';
  for(let i=0;i<9;i++){
    const d = cell(i);
    d.textContent = grid[i] || '';
    board.appendChild(d);
  }
  info.textContent = `Turn: ${turn}`;
  score.textContent = `Wins • X ${tally.X} : ${tally.O} O • Games ${tally.games}`;
}

function lines(){
  return [[0,1,2],[3,4,5],[6,7,8],
          [0,3,6],[1,4,7],[2,5,8],
          [0,4,8],[2,4,6]];
}

function winner(){
  for(const [a,b,c] of lines()){
    if(grid[a] && grid[a]===grid[b] && grid[a]===grid[c]) return grid[a];
  }
  if(grid.every(Boolean)) return 'Draw';
  return null;
}

function reset(){
  grid = Array(9).fill(null);
  turn = 'X';
  render();
}

function move(i,el){
  if(grid[i] || winner()) return;
  grid[i] = turn;
  el.textContent = turn;
  const w = winner();
  if(w){
    tally.games++;
    if(w==='X'||w==='O'){tally[w]++; info.textContent = `${w} wins!`; }
    else info.textContent = 'Draw!';
    setTimeout(reset, 800);
  }else{
    turn = turn==='X'?'O':'X';
    info.textContent = `Turn: ${turn}`;
  }
  score.textContent = `Wins • X ${tally.X} : ${tally.O} O • Games ${tally.games}`;
}

render();
