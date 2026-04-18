import React, { useState } from 'react';

const SCENARIOS = [
  {
    id: 0, icon: '🌲', bg: '#1a0a3c',
    text: "You venture into the Ancient Forest. Two paths split before you — one glows with eerie light, the other smells of treasure.",
    choices: [
      { text: "Take the glowing path", icon: '✨', effect: 'hp -10', action: s => ({...s, hp: s.hp-10, scene:1}) },
      { text: "Follow the treasure scent", icon: '💰', effect: 'gold +10', action: s => ({...s, gold: s.gold+10, scene:2}) }
    ]
  },
  {
    id: 1, icon: '🐺', bg: '#2a0a0a',
    text: "A giant wolf emerges from the shadows, baring its fangs! Your heart races — fight or flee?",
    choices: [
      { text: "Draw your sword and fight!", icon: '⚔️', effect: 'hp -20 / gold +20 / XP +1', action: s => ({...s, hp:s.hp-20,gold:s.gold+20,level:s.level+1,scene:3}) },
      { text: "Sprint away!", icon: '💨', effect: 'hp -5', action: s => ({...s, hp:s.hp-5,scene:0}) }
    ]
  },
  {
    id: 2, icon: '🏺', bg: '#0a1a2a',
    text: "A glittering treasure chest lies before you. It could be rigged... or it could make you rich.",
    choices: [
      { text: "Open it boldly!", icon: '💎', effect: 'gold +50 / XP +1', action: s => ({...s, gold:s.gold+50,level:s.level+1,scene:4}) },
      { text: "Leave it alone", icon: '🚶', effect: 'safe', action: s => ({...s, scene:0}) }
    ]
  },
  {
    id: 3, icon: '🏆', bg: '#0a2a0a',
    text: "Victory! The wolf lies defeated. Its pelt gleams with magical energy, and a golden coin purse falls from its fur.",
    choices: [
      { text: "Continue your adventure", icon: '🗺️', effect: '', action: s => ({...s, scene: Math.floor(Math.random()*3)}) }
    ]
  },
  {
    id: 4, icon: '📜', bg: '#2a1a0a',
    text: "The chest bursts open! Gold coins and a healing potion spill out. The potion glows with restorative magic.",
    choices: [
      { text: "Drink the potion & proceed", icon: '🧪', effect: 'hp +20', action: s => ({...s, hp: Math.min(100,s.hp+20), scene: Math.floor(Math.random()*3)}) }
    ]
  },
  {
    id: -1, icon: '💀', bg: '#0a0a0a',
    text: "Your wounds are too great. The forest claims you... but a hero never truly dies.",
    choices: []
  }
]

export default function RPGAdventure() {
  const [state, setState] = useState({ hp: 100, gold: 0, level: 1, scene: 0, gameOver: false })
  const [animating, setAnim] = useState(false)
  const [lastEffect, setEffect] = useState(null)

  const scene = SCENARIOS.find(s => s.id === (state.gameOver ? -1 : state.scene)) || SCENARIOS[0]

  const makeChoice = (choice) => {
    if (animating || state.gameOver) return
    setEffect(choice.effect)
    setAnim(true)
    setTimeout(() => {
      const ns = choice.action(state)
      if (ns.hp <= 0) setState({ ...ns, gameOver: true })
      else setState(ns)
      setAnim(false)
      setTimeout(() => setEffect(null), 1500)
    }, 300)
  }

  const restart = () => setState({ hp: 100, gold: 0, level: 1, scene: 0, gameOver: false })

  const hpColor = state.hp > 60 ? '#4ade80' : state.hp > 30 ? '#fbbf24' : '#f87171'
  const hpPct   = state.hp

  return (
    <>
      <style>{RPG_STYLES}</style>
      <div className="rpg-root">
        {/* background based on scene */}
        <div className="rpg-scene-bg" style={{ background: scene.bg }} />

        {/* stats bar */}
        <div className="rpg-stats">
          <div className="rpg-stat-hp">
            <span className="rpg-stat-label">❤️ HP</span>
            <div className="rpg-hp-bar-wrap">
              <div className="rpg-hp-bar" style={{ width:`${hpPct}%`, background: hpColor }} />
            </div>
            <span className="rpg-hp-num" style={{ color: hpColor }}>{state.hp}</span>
          </div>
          <div className="rpg-stat-group">
            <div className="rpg-sbox" style={{'--c':'#fbbf24'}}>
              <span style={{fontSize:'16px'}}>💰</span>
              <span className="rpg-sbox-val">{state.gold}</span>
            </div>
            <div className="rpg-sbox" style={{'--c':'#a78bfa'}}>
              <span style={{fontSize:'16px'}}>⚡</span>
              <span className="rpg-sbox-val">Lv {state.level}</span>
            </div>
          </div>
        </div>

        {/* effect toast */}
        {lastEffect && (
          <div className="rpg-effect-toast">{lastEffect}</div>
        )}

        {/* scene card */}
        <div className={`rpg-scene-card ${animating?'rpg-scene-card--exit':''}`}>
          <div className="rpg-scene-icon">{scene.icon}</div>
          <p className="rpg-scene-text">{scene.text}</p>
        </div>

        {/* choices */}
        <div className="rpg-choices">
          {state.gameOver ? (
            <>
              <p className="rpg-over-msg">⚰️ You have fallen in battle.</p>
              <button className="rpg-choice-btn" onClick={restart}>🔄 Restart Adventure</button>
            </>
          ) : scene.choices.map((c, i) => (
            <button key={i} className="rpg-choice-btn" onClick={() => makeChoice(c)}>
              <span className="rpg-choice-icon">{c.icon}</span>
              <div className="rpg-choice-body">
                <span className="rpg-choice-text">{c.text}</span>
                {c.effect && <span className="rpg-choice-effect">{c.effect}</span>}
              </div>
              <span className="rpg-choice-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

const RPG_STYLES = `
  @keyframes rpg-bg { 0%,100%{opacity:0.6} 50%{opacity:0.85} }
  @keyframes rpg-card-in { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes rpg-card-out { from{opacity:1;transform:scale(1);} to{opacity:0;transform:scale(0.94) translateY(-10px)} }
  @keyframes rpg-toast { 0%{opacity:0;transform:translateY(10px) scale(0.9)} 20%,80%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-10px)} }
  @keyframes rpg-icon-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

  .rpg-root { position:relative;display:flex;flex-direction:column;gap:14px;padding:24px 16px 32px;overflow:hidden;min-height:540px; }
  .rpg-scene-bg { position:absolute;inset:0;z-index:0;transition:background 0.8s ease;animation:rpg-bg 4s ease-in-out infinite; }

  .rpg-stats { position:relative;z-index:1;display:flex;flex-direction:column;gap:8px;background:rgba(0,0,0,0.5);border:1px solid rgba(255,215,0,0.2);border-radius:16px;padding:12px 16px;backdrop-filter:blur(14px); }
  .rpg-stat-hp { display:flex;align-items:center;gap:8px; }
  .rpg-stat-label { font-size:12px;font-weight:700;color:#94a3b8;min-width:36px; }
  .rpg-hp-bar-wrap { flex:1;height:10px;border-radius:5px;background:rgba(255,255,255,0.1); }
  .rpg-hp-bar { height:100%;border-radius:5px;transition:width 0.6s ease, background 0.4s ease; }
  .rpg-hp-num { font-size:14px;font-weight:800;min-width:28px;text-align:right; }
  .rpg-stat-group { display:flex;gap:8px; }
  .rpg-sbox { display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,215,0,0.15); }
  .rpg-sbox-val { font-size:15px;font-weight:800;color:var(--c); }

  .rpg-effect-toast { position:absolute;top:120px;left:50%;transform:translateX(-50%);z-index:10;padding:8px 20px;border-radius:20px;background:rgba(0,0,0,0.85);border:1.5px solid rgba(255,215,0,0.4);color:#fbbf24;font-size:14px;font-weight:700;animation:rpg-toast 1.8s ease forwards;white-space:nowrap; }

  .rpg-scene-card { position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:10px;padding:24px;border-radius:20px;background:rgba(0,0,0,0.6);border:1.5px solid rgba(255,215,0,0.2);backdrop-filter:blur(14px);animation:rpg-card-in 0.4s ease; }
  .rpg-scene-card--exit { animation:rpg-card-out 0.3s ease forwards; }
  .rpg-scene-icon { font-size:56px;animation:rpg-icon-float 3s ease-in-out infinite; }
  .rpg-scene-text { font-size:15px;line-height:1.7;color:#e2e8f0;text-align:center;margin:0; }

  .rpg-choices { position:relative;z-index:1;display:flex;flex-direction:column;gap:10px; }
  .rpg-over-msg { text-align:center;color:#f87171;font-size:16px;font-weight:700; }
  .rpg-choice-btn { display:flex;align-items:center;gap:12px;padding:16px;border-radius:16px;background:rgba(255,215,0,0.08);border:1.5px solid rgba(255,215,0,0.3);color:#f1f5f9;cursor:pointer;text-align:left;transition:all 0.25s ease;backdrop-filter:blur(8px); }
  .rpg-choice-btn:hover { background:rgba(255,215,0,0.18);border-color:rgba(255,215,0,0.6);transform:translateX(6px);box-shadow:0 6px 20px rgba(255,215,0,0.15); }
  .rpg-choice-icon { font-size:24px;flex-shrink:0; }
  .rpg-choice-body { flex:1;display:flex;flex-direction:column;gap:2px; }
  .rpg-choice-text { font-size:14px;font-weight:700; }
  .rpg-choice-effect { font-size:11px;color:#fbbf24;font-weight:600; }
  .rpg-choice-arrow { font-size:18px;color:#fbbf24;flex-shrink:0; }
`
