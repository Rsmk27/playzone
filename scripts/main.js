
const GAMES = [{"slug": "rock-paper-scissors", "title": "Rock\u2013Paper\u2013Scissors", "category": "Beginner", "emoji": "\u270a\u270b\u270c\ufe0f"}, {"slug": "tic-tac-toe", "title": "Tic\u2013Tac\u2013Toe", "category": "Beginner", "emoji": "\u274c\u2b55"}, {"slug": "number-guessing", "title": "Number Guessing", "category": "Beginner", "emoji": "\ud83d\udd22"}, {"slug": "coin-toss", "title": "Coin Toss", "category": "Beginner", "emoji": "\ud83e\ude99"}, {"slug": "dice-roller", "title": "Dice Roller", "category": "Beginner", "emoji": "\ud83c\udfb2"}, {"slug": "quiz", "title": "Quiz / Trivia", "category": "Beginner", "emoji": "\u2753"}, {"slug": "typing-test", "title": "Typing Speed Test", "category": "Beginner", "emoji": "\u2328\ufe0f"}, {"slug": "color-guessing", "title": "Color Guessing", "category": "Beginner", "emoji": "\ud83c\udfa8"}, {"slug": "whack-a-mole", "title": "Whack\u2011a\u2011Mole", "category": "Beginner", "emoji": "\ud83d\udc39"}, {"slug": "memory-cards", "title": "Memory Cards", "category": "Medium", "emoji": "\ud83c\udccf"}, {"slug": "hangman", "title": "Hangman", "category": "Medium", "emoji": "\ud83d\udd24"}, {"slug": "connect-four", "title": "Connect Four", "category": "Medium", "emoji": "\ud83d\udd34\ud83d\udfe1"}, {"slug": "simon-says", "title": "Simon Says", "category": "Medium", "emoji": "\ud83c\udfb6"}, {"slug": "sliding-puzzle", "title": "Sliding Puzzle", "category": "Medium", "emoji": "\ud83e\udde9"}, {"slug": "minesweeper", "title": "Minesweeper", "category": "Medium", "emoji": "\ud83d\udca3"}, {"slug": "sudoku", "title": "Sudoku", "category": "Medium", "emoji": "\ud83d\udd22"}, {"slug": "word-search", "title": "Word Search", "category": "Medium", "emoji": "\u270f\ufe0f"}, {"slug": "tower-of-hanoi", "title": "Tower of Hanoi", "category": "Medium", "emoji": "\ud83d\uddfc"}, {"slug": "snake", "title": "Snake", "category": "Arcade", "emoji": "\ud83d\udc0d"}, {"slug": "flappy-bird", "title": "Flappy Bird", "category": "Arcade", "emoji": "\ud83d\udc24"}, {"slug": "breakout", "title": "Breakout", "category": "Arcade", "emoji": "\ud83e\uddf1"}, {"slug": "pong", "title": "Pong", "category": "Arcade", "emoji": "\ud83c\udfd3"}, {"slug": "space-invaders", "title": "Space Invaders", "category": "Arcade", "emoji": "\ud83d\udc7e"}, {"slug": "asteroids", "title": "Asteroids", "category": "Arcade", "emoji": "\ud83d\udef8"}, {"slug": "helicopter", "title": "Helicopter", "category": "Arcade", "emoji": "\ud83d\ude81"}, {"slug": "car-racing", "title": "Car Racing", "category": "Arcade", "emoji": "\ud83d\ude97"}, {"slug": "platformer", "title": "Platformer", "category": "Arcade", "emoji": "\ud83c\udfc3"}, {"slug": "chess", "title": "Chess", "category": "Advanced", "emoji": "\u265f\ufe0f"}, {"slug": "checkers", "title": "Checkers", "category": "Advanced", "emoji": "\u2b1b\u2b1c"}, {"slug": "ludo", "title": "Ludo", "category": "Advanced", "emoji": "\ud83c\udfb2"}, {"slug": "reversi", "title": "Reversi / Othello", "category": "Advanced", "emoji": "\u26ab\u26aa"}, {"slug": "rpg-adventure", "title": "RPG Adventure", "category": "Advanced", "emoji": "\ud83c\udfde\ufe0f"}, {"slug": "shooter-2d", "title": "2D Shooter", "category": "Advanced", "emoji": "\ud83c\udfaf"}, {"slug": "physics-balls", "title": "Physics Sandbox", "category": "Advanced", "emoji": "\u2696\ufe0f"}, {"slug": "reaction-test", "title": "Reaction Tester", "category": "Extras", "emoji": "\u26a1"}, {"slug": "maze", "title": "Maze Generator", "category": "Extras", "emoji": "\ud83c\udf00"}, {"slug": "catch-object", "title": "Catch Object", "category": "Extras", "emoji": "\ud83c\udf4e"}, {"slug": "typing-attack", "title": "Typing Attack", "category": "Extras", "emoji": "\ud83d\udd20"}, {"slug": "cps-counter", "title": "CPS Counter", "category": "Extras", "emoji": "\ud83d\uddb1\ufe0f"}, {"slug": "2048", "title": "2048 Puzzle", "category": "Extras", "emoji": "\ud83d\udfe8"}, {"slug": "lights-out", "title": "Lights Out", "category": "Extras", "emoji": "\ud83d\udca1"}, {"slug": "math-quiz", "title": "Math Quiz", "category": "Extras", "emoji": "\u2795"}];

const cardsEl = document.getElementById('cards');
const searchEl = document.getElementById('search');

function makeCard(game){
  const url = `games/${game.slug}/index.html`;
  const el = document.createElement('a');
  el.href = url;
  el.className = 'card';
  el.dataset.category = game.category;
  el.dataset.title = game.title.toLowerCase();
  el.innerHTML = `
    <div class="thumb">${game.emoji}</div>
    <div class="badge">${game.category}</div>
    <h3>${game.title}</h3>
    <button class="btn">Play Now</button>
  `;
  return el;
}

function render(list){
  cardsEl.innerHTML = '';
  list.forEach(g => cardsEl.appendChild(makeCard(g)));
}

render(GAMES);

searchEl.addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase().trim();
  const filtered = GAMES.filter(g => g.title.toLowerCase().includes(q) || g.slug.includes(q) || g.category.toLowerCase().includes(q));
  render(filtered);
});
