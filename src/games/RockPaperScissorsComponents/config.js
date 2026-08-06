export const OPTIONS = [
  { id: 'Rock',     emoji: '✊', label: 'Rock',     color: '#f87171', glow: 'rgba(248,113,113,0.5)' },
  { id: 'Paper',    emoji: '✋', label: 'Paper',    color: '#60a5fa', glow: 'rgba(96,165,250,0.5)'  },
  { id: 'Scissors', emoji: '✌️', label: 'Scissors', color: '#4ade80', glow: 'rgba(74,222,128,0.5)' },
]

export const BEATS = { Rock: 'Scissors', Paper: 'Rock', Scissors: 'Paper' }

export const RESULT_CONFIG = {
  Player: { label: '🎉 You Win!',   gradient: 'linear-gradient(135deg, #4ade80, #06b6d4)', particleColor: '#4ade80' },
  CPU:    { label: '💀 CPU Wins!',  gradient: 'linear-gradient(135deg, #f87171, #f59e0b)', particleColor: '#f87171' },
  Draw:   { label: "🤝 It's a Draw!", gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', particleColor: '#a78bfa' },
}
