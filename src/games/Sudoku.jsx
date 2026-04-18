import { useState, useEffect, useCallback } from 'react'

function Sudoku() {
  const [solution, setSolution]   = useState([])
  const [puzzle, setPuzzle]       = useState([])
  const [userInput, setUserInput] = useState([])
  const [selected, setSelected]   = useState(null)
  const [errors, setErrors]       = useState(new Set())
  const [checked, setChecked]     = useState(false)
  const [solved, setSolved]       = useState(false)

  const isValid = (grid,row,col,num) => {
    for(let x=0;x<9;x++) if(grid[row][x]===num||grid[x][col]===num) return false
    const sr=row-row%3,sc=col-col%3
    for(let i=0;i<3;i++) for(let j=0;j<3;j++) if(grid[i+sr][j+sc]===num) return false
    return true
  }

  const fillRemaining = (grid,i,j) => {
    if(j>=9&&i<8){i++;j=0}
    if(i>=9&&j>=9) return true
    if(i<3){if(j<3)j=3}
    else if(i<6){if(j===Math.floor(i/3)*3)j+=3}
    else{if(j===6){i++;j=0;if(i>=9)return true}}
    for(let n=1;n<=9;n++){
      if(isValid(grid,i,j,n)){grid[i][j]=n;if(fillRemaining(grid,i,j+1))return true;grid[i][j]=0}
    }
    return false
  }

  const generateSudoku = useCallback(() => {
    const sol=Array(9).fill().map(()=>Array(9).fill(0))
    for(let i=0;i<9;i+=3){
      const nums=[1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5)
      let idx=0
      for(let r=0;r<3;r++) for(let c=0;c<3;c++) sol[i+r][i+c]=nums[idx++]
    }
    fillRemaining(sol,0,3)
    setSolution(sol.map(r=>[...r]))
    const puz=sol.map(r=>[...r])
    let count=35
    while(count>0){
      const r=Math.floor(Math.random()*9),c=Math.floor(Math.random()*9)
      if(puz[r][c]!==0){puz[r][c]=0;count--}
    }
    setPuzzle(puz)
    setUserInput(puz.map(r=>r.map(c=>c===0?'':c)))
    setSelected(null)
    setErrors(new Set())
    setChecked(false)
    setSolved(false)
  },[])

  useEffect(()=>{generateSudoku()},[generateSudoku])

  const setVal = (r,c,val) => {
    if(puzzle[r][c]!==0) return
    if(val!==''&&!/^[1-9]$/.test(val)) return
    const nu=userInput.map((row,ri)=>row.map((cell,ci)=>(ri===r&&ci===c)?val:cell))
    setUserInput(nu)
    setChecked(false)
  }

  const handleCellClick = (r,c) => { setSelected(`${r}-${c}`) }

  const handleKey = (r,c,e) => {
    if(e.key>='1'&&e.key<='9') setVal(r,c,e.key)
    else if(e.key==='Backspace'||e.key==='Delete') setVal(r,c,'')
  }

  const check = () => {
    const errs=new Set()
    let ok=true
    userInput.forEach((row,r)=>row.forEach((cell,c)=>{
      if(parseInt(cell)!==solution[r][c]){errs.add(`${r}-${c}`);ok=false}
    }))
    setErrors(errs)
    setChecked(true)
    if(ok) setSolved(true)
  }

  const boxBorder=(r,c)=>({
    borderRight: (c+1)%3===0&&c<8?'2px solid rgba(139,92,246,0.6)':'',
    borderBottom: (r+1)%3===0&&r<8?'2px solid rgba(139,92,246,0.6)':'',
  })

  const numColor=(r,c)=>{
    if(puzzle[r][c]!==0) return '#f1f5f9'
    if(checked&&errors.has(`${r}-${c}`)) return '#f87171'
    return '#a78bfa'
  }

  return (
    <>
      <style>{SDK_STYLES}</style>
      <div className="sdk-root">
        <div className="sdk-orb sdk-orb-1"/><div className="sdk-orb sdk-orb-2"/>

        <div className="sdk-header">
          {solved
            ? <div className="sdk-badge sdk-badge--win">🎉 Solved!</div>
            : checked&&errors.size>0
            ? <div className="sdk-badge sdk-badge--err">❌ {errors.size} error{errors.size>1?'s':''}</div>
            : <div className="sdk-subtitle">Fill in the numbers 1–9</div>
          }
        </div>

        <div className="sdk-grid">
          {userInput.map((row,r)=>row.map((cell,c)=>{
            const isSel=selected===`${r}-${c}`
            const isGiven=puzzle[r]&&puzzle[r][c]!==0
            const hasErr=checked&&errors.has(`${r}-${c}`)
            return (
              <div
                key={`${r}-${c}`}
                className={`sdk-cell ${isSel?'sdk-cell--sel':''} ${isGiven?'sdk-cell--given':''} ${hasErr?'sdk-cell--err':''}`}
                style={boxBorder(r,c)}
                onClick={()=>handleCellClick(r,c)}
                tabIndex={0}
                onKeyDown={e=>handleKey(r,c,e)}
              >
                <span style={{color:numColor(r,c),fontWeight:isGiven?'900':'700'}}>{cell}</span>
              </div>
            )
          }))}
        </div>

        {/* numpad */}
        {selected && puzzle[parseInt(selected.split('-')[0])][parseInt(selected.split('-')[1])]===0 && (
          <div className="sdk-numpad">
            {[1,2,3,4,5,6,7,8,9].map(n=>(
              <button
                key={n}
                className="sdk-np-btn"
                onClick={()=>{const[r,c]=selected.split('-').map(Number);setVal(r,c,String(n))}}
              >{n}</button>
            ))}
          </div>
        )}

        <div className="sdk-btns">
          <button className="sdk-btn sdk-btn--primary" onClick={check}>✓ Check</button>
          <button className="sdk-btn sdk-btn--ghost" onClick={generateSudoku}>🔄 New Game</button>
        </div>
      </div>
    </>
  )
}

const SDK_STYLES=`
  @keyframes sdk-orb{0%,100%{transform:translate(0,0)}40%{transform:translate(20px,-15px)}70%{transform:translate(-12px,8px)}}
  @keyframes sdk-err-flash{0%,100%{background:rgba(248,113,113,0.15)}50%{background:rgba(248,113,113,0.3)}}
  @keyframes sdk-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

  .sdk-root{position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 32px;overflow:hidden;}
  .sdk-orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0;animation:sdk-orb 9s ease-in-out infinite;}
  .sdk-orb-1{width:240px;height:240px;background:rgba(139,92,246,0.12);top:-50px;left:-40px;}
  .sdk-orb-2{width:200px;height:200px;background:rgba(6,182,212,0.1);bottom:-40px;right:-40px;animation-delay:-4s;}

  .sdk-header{position:relative;z-index:1;animation:sdk-in 0.4s ease;}
  .sdk-badge{padding:8px 20px;border-radius:14px;font-size:15px;font-weight:700;}
  .sdk-badge--win{background:rgba(74,222,128,0.15);border:1.5px solid rgba(74,222,128,0.4);color:#4ade80;}
  .sdk-badge--err{background:rgba(248,113,113,0.15);border:1.5px solid rgba(248,113,113,0.4);color:#f87171;}
  .sdk-subtitle{font-size:13px;color:#64748b;}

  .sdk-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(9,1fr);background:rgba(15,23,42,0.8);border:2px solid rgba(139,92,246,0.4);border-radius:14px;overflow:hidden;width:100%;max-width:360px;backdrop-filter:blur(14px);box-shadow:0 12px 40px rgba(0,0,0,0.4);}
  .sdk-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;border:1px solid rgba(255,255,255,0.06);background:transparent;outline:none;transition:background 0.15s ease;}
  .sdk-cell:hover{background:rgba(139,92,246,0.08);}
  .sdk-cell--sel{background:rgba(139,92,246,0.22)!important;}
  .sdk-cell--given{background:rgba(255,255,255,0.04);}
  .sdk-cell--err{animation:sdk-err-flash 1s ease-in-out infinite;}

  .sdk-numpad{position:relative;z-index:1;display:grid;grid-template-columns:repeat(9,1fr);gap:4px;width:100%;max-width:360px;}
  .sdk-np-btn{aspect-ratio:1;border-radius:8px;background:rgba(139,92,246,0.18);border:1.5px solid rgba(139,92,246,0.3);color:#a78bfa;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.15s ease;}
  .sdk-np-btn:hover{background:rgba(139,92,246,0.35);color:#f1f5f9;}

  .sdk-btns{position:relative;z-index:1;display:flex;gap:10px;}
  .sdk-btn{padding:11px 24px;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.25s ease;border:none;}
  .sdk-btn--primary{background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;box-shadow:0 6px 18px rgba(139,92,246,0.4);}
  .sdk-btn--primary:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(139,92,246,0.55);}
  .sdk-btn--ghost{background:rgba(15,23,42,0.6);border:1.5px solid rgba(139,92,246,0.3);color:#94a3b8;}
  .sdk-btn--ghost:hover{border-color:rgba(139,92,246,0.6);color:#f1f5f9;}
`

export default Sudoku
