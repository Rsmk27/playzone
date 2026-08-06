const { performance } = require('perf_hooks');

const OPTIONS = [
  { id: 'Rock',     emoji: '✊', label: 'Rock',     color: '#f87171', glow: 'rgba(248,113,113,0.5)' },
  { id: 'Paper',    emoji: '✋', label: 'Paper',    color: '#60a5fa', glow: 'rgba(96,165,250,0.5)'  },
  { id: 'Scissors', emoji: '✌️', label: 'Scissors', color: '#4ade80', glow: 'rgba(74,222,128,0.5)' },
]

function benchmarkArrayFind(iterations) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const pOpt = OPTIONS.find(o => o.id === 'Rock');
    const cOpt = OPTIONS.find(o => o.id === 'Scissors');
  }
  const end = performance.now();
  return end - start;
}

const OPTIONS_MAP = {
  'Rock':     { id: 'Rock',     emoji: '✊', label: 'Rock',     color: '#f87171', glow: 'rgba(248,113,113,0.5)' },
  'Paper':    { id: 'Paper',    emoji: '✋', label: 'Paper',    color: '#60a5fa', glow: 'rgba(96,165,250,0.5)'  },
  'Scissors': { id: 'Scissors', emoji: '✌️', label: 'Scissors', color: '#4ade80', glow: 'rgba(74,222,128,0.5)' },
};

function benchmarkMapLookup(iterations) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const pOpt = OPTIONS_MAP['Rock'];
    const cOpt = OPTIONS_MAP['Scissors'];
  }
  const end = performance.now();
  return end - start;
}

const iterations = 10_000_000;

console.log("Warming up...");
benchmarkArrayFind(100000);
benchmarkMapLookup(100000);

console.log(`Running ${iterations} iterations...`);
const arrayTime = benchmarkArrayFind(iterations);
const mapTime = benchmarkMapLookup(iterations);

console.log(`Array.find: ${arrayTime.toFixed(2)} ms`);
console.log(`Map Lookup: ${mapTime.toFixed(2)} ms`);
console.log(`Improvement: ${((arrayTime - mapTime) / arrayTime * 100).toFixed(2)}% faster`);
