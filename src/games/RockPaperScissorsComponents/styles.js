export const RPS_STYLES = `
  @keyframes rps-bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    40%       { transform: translateY(-18px) scale(1.15); }
    70%       { transform: translateY(-6px) scale(1.05); }
  }
  @keyframes rps-idle-float {
    0%, 100% { transform: translateY(0); opacity: 0.6; }
    50%       { transform: translateY(-8px); opacity: 1; }
  }
  @keyframes rps-countdown-pop {
    0%   { transform: scale(2.5); opacity: 0; }
    40%  { transform: scale(1); opacity: 1; }
    80%  { transform: scale(1); opacity: 1; }
    100% { transform: scale(0.5); opacity: 0; }
  }
  @keyframes rps-orb-drift {
    0%, 100% { transform: translate(0,0) scale(1); }
    33%       { transform: translate(30px,-20px) scale(1.05); }
    66%       { transform: translate(-20px,10px) scale(0.97); }
  }
  @keyframes rps-slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes rps-pulse-border {
    0%, 100% { box-shadow: 0 0 0 0 var(--choice-glow), inset 0 0 20px rgba(0,0,0,0.3); }
    50%       { box-shadow: 0 0 0 8px transparent, inset 0 0 20px rgba(0,0,0,0.3); }
  }
  @keyframes rps-streak-bounce {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.07); }
  }
  @keyframes rps-win-flash {
    0%   { box-shadow: 0 0 0 0 var(--slot-glow, rgba(74,222,128,0.6)); }
    50%  { box-shadow: 0 0 36px 12px var(--slot-glow, rgba(74,222,128,0.6)); }
    100% { box-shadow: 0 0 0 0 var(--slot-glow, rgba(74,222,128,0.6)); }
  }

  .rps-root {
    position: relative;
    min-height: 520px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 24px 16px 32px;
    overflow: hidden;
  }

  /* ── background orbs ── */
  .rps-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    pointer-events: none;
    animation: rps-orb-drift 8s ease-in-out infinite;
    z-index: 0;
  }
  .rps-orb-1 { width:300px; height:300px; background:rgba(139,92,246,0.18); top:-80px; left:-80px; animation-delay:0s; }
  .rps-orb-2 { width:250px; height:250px; background:rgba(6,182,212,0.14);  bottom:-60px; right:-60px; animation-delay:-3s; }
  .rps-orb-3 { width:200px; height:200px; background:rgba(248,113,113,0.1); top:40%; left:50%; animation-delay:-5s; }

  /* ── scoreboard ── */
  .rps-scoreboard {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 20px;
    background: rgba(15,23,42,0.6);
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 20px;
    padding: 14px 24px;
    backdrop-filter: blur(14px);
    width: 100%;
    max-width: 440px;
  }
  .rps-score-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1;
  }
  .rps-score-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
  .rps-score-value { font-size: 36px; font-weight: 800; color: var(--scolor); line-height: 1; }
  .rps-scoreboard-center { flex: 1.5; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .rps-rounds { font-size: 12px; color: #94a3b8; }
  .rps-winbar {
    width: 100%; height: 6px;
    background: rgba(139,92,246,0.15);
    border-radius: 99px; overflow: hidden;
  }
  .rps-winbar-fill {
    height: 100%;
    background: linear-gradient(90deg, #4ade80, #06b6d4);
    border-radius: 99px;
    transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
  }
  .rps-winpct { font-size: 11px; color: #94a3b8; }

  /* ── streak ── */
  .rps-streak {
    position: relative; z-index: 1;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    padding: 6px 18px;
    border-radius: 99px;
    font-size: 13px; font-weight: 700; color: #fff;
    animation: rps-streak-bounce 1.2s ease-in-out infinite;
    box-shadow: 0 4px 16px rgba(245,158,11,0.4);
  }

  /* ── countdown ── */
  .rps-countdown {
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 500; pointer-events: none;
  }
  .rps-countdown-num {
    font-size: 120px; font-weight: 900;
    background: linear-gradient(135deg, #8b5cf6, #06b6d4);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: rps-countdown-pop 0.58s ease forwards;
  }

  /* ── arena ── */
  .rps-arena {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 24px;
    background: rgba(15,23,42,0.55);
    border: 1px solid rgba(139,92,246,0.2);
    border-radius: 24px;
    padding: 24px 32px;
    backdrop-filter: blur(14px);
    width: 100%; max-width: 440px;
    min-height: 130px;
    animation: rps-slide-up 0.4s ease;
  }
  .rps-slot {
    flex: 1;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    transition: transform 0.3s ease;
  }
  .rps-slot-emoji {
    font-size: 56px; line-height: 1;
    display: block;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
    transition: all 0.3s ease;
  }
  .rps-slot-idle { animation: rps-idle-float 2.5s ease-in-out infinite; }
  .rps-slot-bounce { animation: rps-bounce 0.7s ease, rps-win-flash 1.2s ease 0.7s; }
  .rps-slot-name { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
  .rps-slot--win .rps-slot-emoji { filter: drop-shadow(0 0 18px var(--slot-glow, rgba(74,222,128,0.6))); }
  .rps-slot--lose .rps-slot-emoji { opacity: 0.45; filter: grayscale(1); }
  .rps-slot--draw .rps-slot-emoji { filter: drop-shadow(0 0 12px rgba(167,139,250,0.5)); }
  .rps-vs {
    font-size: 28px; font-weight: 900;
    transition: all 0.3s ease;
  }

  /* ── result message ── */
  .rps-result-msg {
    position: relative; z-index: 1;
    padding: 10px 28px;
    border-radius: 99px;
    font-size: 18px; font-weight: 800; color: #fff;
    animation: rps-slide-up 0.35s ease;
    box-shadow: 0 8px 28px rgba(0,0,0,0.35);
    letter-spacing: 0.5px;
  }

  /* ── prompt ── */
  .rps-prompt {
    position: relative; z-index: 1;
    color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;
  }

  /* ── choice cards ── */
  .rps-choices {
    position: relative; z-index: 1;
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
  }
  .rps-choice {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    width: 110px; padding: 20px 12px;
    background: rgba(15,23,42,0.65);
    border: 2px solid var(--choice-color, #8b5cf6);
    border-radius: 20px;
    cursor: pointer;
    transition: transform 0.18s cubic-bezier(.4,0,.2,1),
                box-shadow 0.25s ease,
                background 0.25s ease;
    animation: rps-pulse-border 2.5s ease-in-out infinite;
    backdrop-filter: blur(10px);
    position: relative; overflow: hidden;
  }
  .rps-choice::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at center, var(--choice-glow, transparent) 0%, transparent 70%);
    opacity: 0; transition: opacity 0.25s ease;
  }
  .rps-choice:hover {
    transform: translateY(-8px) scale(1.05);
    box-shadow: 0 16px 40px var(--choice-glow);
    background: rgba(30,27,75,0.8);
  }
  .rps-choice:hover::after { opacity: 1; }
  .rps-choice:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .rps-choice-emoji { font-size: 48px; line-height: 1; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4)); }
  .rps-choice-label { font-size: 13px; font-weight: 600; color: var(--choice-color); text-transform: uppercase; letter-spacing: 0.5px; }

  /* ── actions ── */
  .rps-actions {
    position: relative; z-index: 1;
    display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
    animation: rps-slide-up 0.4s ease;
  }
  .rps-btn {
    padding: 12px 28px;
    border-radius: 14px;
    font-size: 15px; font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.25s ease;
  }
  .rps-btn-primary {
    background: linear-gradient(135deg, #8b5cf6, #06b6d4);
    color: #fff;
    box-shadow: 0 6px 20px rgba(139,92,246,0.45);
  }
  .rps-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(139,92,246,0.6); }
  .rps-btn-ghost {
    background: rgba(30,27,75,0.6);
    border: 1.5px solid rgba(139,92,246,0.35);
    color: #94a3b8;
  }
  .rps-btn-ghost:hover { background: rgba(139,92,246,0.15); color: #f1f5f9; transform: translateY(-2px); }

  /* ── hint ── */
  .rps-hint {
    position: relative; z-index: 1;
    font-size: 12px; color: #64748b; letter-spacing: 0.5px;
  }
`;
