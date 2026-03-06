import { useState, useEffect, useCallback } from "react";
import * as Tone from "tone";

// ---------- Avatars ----------
const AVATARS = [
  { id: "dog", emoji: "🐶" },
  { id: "cat", emoji: "🐱" },
  { id: "rabbit", emoji: "🐰" },
  { id: "squirrel", emoji: "🐿️" },
  { id: "bird", emoji: "🐦" },
  { id: "fox", emoji: "🦊" },
  { id: "bear", emoji: "🐻" },
  { id: "tiger", emoji: "🐯" },
  { id: "alien", emoji: "👾", monster: true },
  { id: "ogre", emoji: "👹", monster: true },
  { id: "goblin", emoji: "👺", monster: true },
  { id: "blob", emoji: "🫠", monster: true },
  { id: "ghost", emoji: "👻", monster: true },
  { id: "reaper", emoji: "☠️", elite: true },
  { id: "dragon", emoji: "🐉", elite: true },
  { id: "moai", emoji: "🗿", elite: true },
  { id: "fairy", emoji: "🧚", legend: true },
  { id: "unicorn", emoji: "🦄", legend: true },
];

// ---------- localStorage helpers ----------
function loadJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function loadString(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}
function saveString(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

// ---------- i18n ----------
const LANG = {
  ja: {
    title: "⭕✖ ゲーム", desc: "盤上に置けるのは3つまで！4つ目を置くと一番古いやつが消えるよ",
    settings: "⚙ 設定", hintLabel: "消えるマークを教える", langLabel: "English", muteLabel: "消音",
    pvp: "👫 ふたりで遊ぶ", cpuBattle: "vs CPU 🤖", online: "🌐 ネット対戦",
    chooseLv: "レベルを選んでね", start: "いざ勝負！",
    lvLabels: ["","😊 よわよわ","🙂 まあまあ","😐 ふつう","😈 つよつよ","👹 鬼"],
    youLabel: "きみ ⭕", cpuLabel: "CPU ✖",
    winPlayer: "🎉 やったね！きみの勝ち！", winCpu: "😢 CPUの勝ち…くやしい！",
    winMark: m=>`🎉 ${m} の勝ち！`, thinking: "🤔 CPU考え中…",
    yourTurn: "きみの番だよ (⭕)", turnMark: m=>`${m} の番だよ`,
    hintOff: "ヒントOFF: どれが消えるかわからないよ！",
    vanishWarn: w=>`⚠ ${w}の一番古いマークが消えるよ`, vanishWarnGeneric: "⚠ 次に置くとどれか消えるよ",
    remaining: n=>`あと ${n} つ置ける`, youWho: "きみ",
    retry: "もっかい！", backMenu: "メニューに戻る", close: "とじる",
    rankLabel: "ランク", rankUp: "🎊 昇級！", rankUpDan: "🎊 昇段！",
    rankNames: ["10級","9級","8級","7級","6級","5級","4級","3級","2級","1級","初段","二段","三段","四段","五段","六段","七段","八段","九段","十段"],
    nextReq: "次の昇級条件", reqLv3: "Lv.3に勝利", reqLv4: "Lv.4に勝利",
    reqLv5: "👹鬼に勝利", reqLv5NoHint: "👹鬼に勝利（ヒントOFF）",
    reqStreak: n=>`👹鬼にヒントOFFで${n}連勝`, streakProgress: (c,n)=>`連勝中: ${c}/${n}`,
    maxRank: "🏆 最高段位に到達！", resetRank: "ランクリセット", resetConfirm: "ランクを10級に戻す？",
    yes: "うん", no: "やめとく",
    onlineComingSoon: "🚧 ネット対戦は準備中だよ！",
    chooseAvatar: "アイコンを選んでね",
    monsterLock: "🔒 モンスターは初段以上で解放！",
    eliteLock: "🔒 進化形は五段以上で解放！",
    legendLock: "🔒 幻の妖精は八段以上で解放！",
  },
  en: {
    title: "Tic Tac Toe", desc: "You can only have 3 marks on the board! The oldest one disappears when you place a 4th",
    settings: "⚙ Settings", hintLabel: "Show which mark disappears", langLabel: "日本語", muteLabel: "Mute",
    pvp: "👫 Two Players", cpuBattle: "vs CPU 🤖", online: "🌐 Online",
    chooseLv: "Pick a level", start: "Let's go!",
    lvLabels: ["","😊 Easy","🙂 Mild","😐 Normal","😈 Hard","👹 Demon"],
    youLabel: "You ⭕", cpuLabel: "CPU ✖",
    winPlayer: "🎉 You win! Nice!", winCpu: "😢 CPU wins… tough luck!",
    winMark: m=>`🎉 ${m} wins!`, thinking: "🤔 CPU thinking…",
    yourTurn: "Your turn (⭕)", turnMark: m=>`${m}'s turn`,
    hintOff: "Hints OFF: figure out which one disappears!",
    vanishWarn: w=>`⚠ ${w}'s oldest mark will vanish`, vanishWarnGeneric: "⚠ One of your marks will disappear",
    remaining: n=>`${n} more to place`, youWho: "You",
    retry: "Again!", backMenu: "Back to menu", close: "Close",
    rankLabel: "Rank", rankUp: "🎊 Rank Up!", rankUpDan: "🎊 Dan Promotion!",
    rankNames: ["10-kyū","9-kyū","8-kyū","7-kyū","6-kyū","5-kyū","4-kyū","3-kyū","2-kyū","1-kyū","Shodan","2-dan","3-dan","4-dan","5-dan","6-dan","7-dan","8-dan","9-dan","10-dan"],
    nextReq: "Next rank requirement", reqLv3: "Beat Lv.3", reqLv4: "Beat Lv.4",
    reqLv5: "Beat 👹 Demon", reqLv5NoHint: "Beat 👹 Demon (hints OFF)",
    reqStreak: n=>`${n} consecutive wins vs 👹 Demon (hints OFF)`, streakProgress: (c,n)=>`Win streak: ${c}/${n}`,
    maxRank: "🏆 Maximum rank achieved!", resetRank: "Reset rank", resetConfirm: "Reset rank to 10-kyū?",
    yes: "Yes", no: "No",
    onlineComingSoon: "🚧 Online play coming soon!",
    chooseAvatar: "Choose your icon",
    monsterLock: "🔒 Monsters unlock at Shodan!",
    eliteLock: "🔒 Evolved forms unlock at 5-dan!",
    legendLock: "🔒 Mythical fairies unlock at 8-dan!",
  },
};

// ---------- Rank ----------
function getRequiredStreak(ri){if(ri<9)return 1;return ri-7;}
function getPromotionReq(ri,t){if(ri>=19)return t.maxRank;if(ri<6)return t.reqLv3;if(ri===6)return t.reqLv4;if(ri===7)return t.reqLv5;if(ri===8)return t.reqLv5NoHint;return t.reqStreak(getRequiredStreak(ri));}
function checkPromotion(ri,lv,hint,streak){if(ri>=19)return false;if(ri<6)return lv>=3;if(ri===6)return lv>=4;if(ri===7)return lv>=5;if(ri===8)return lv>=5&&!hint;if(lv<5||hint)return false;return streak>=getRequiredStreak(ri);}

// ---------- Sound ----------
const synthRef={current:null,initialized:false};
function initAudio(){
  if(synthRef.initialized)return;
  synthRef.current={
    placeO:new Tone.Synth({oscillator:{type:"sine"},envelope:{attack:0.01,decay:0.15,sustain:0,release:0.1}}).toDestination(),
    placeX:new Tone.Synth({oscillator:{type:"triangle"},envelope:{attack:0.01,decay:0.12,sustain:0,release:0.1}}).toDestination(),
    vanish:new Tone.Synth({oscillator:{type:"sine"},envelope:{attack:0.01,decay:0.3,sustain:0,release:0.2}}).toDestination(),
    win:new Tone.PolySynth(Tone.Synth,{maxPolyphony:4,voice:Tone.Synth,options:{oscillator:{type:"triangle"},envelope:{attack:0.02,decay:0.3,sustain:0.2,release:0.4}}}).toDestination(),
    lose:new Tone.PolySynth(Tone.Synth,{maxPolyphony:4,voice:Tone.Synth,options:{oscillator:{type:"sawtooth"},envelope:{attack:0.02,decay:0.4,sustain:0.1,release:0.5}}}).toDestination(),
    rankUp:new Tone.PolySynth(Tone.Synth,{maxPolyphony:6,voice:Tone.Synth,options:{oscillator:{type:"triangle"},envelope:{attack:0.02,decay:0.2,sustain:0.3,release:0.6}}}).toDestination(),
    danUp:new Tone.PolySynth(Tone.Synth,{maxPolyphony:8,voice:Tone.Synth,options:{oscillator:{type:"sine"},envelope:{attack:0.03,decay:0.3,sustain:0.4,release:0.8}}}).toDestination(),
  };
  synthRef.current.win.volume.value=-8;synthRef.current.lose.volume.value=-10;synthRef.current.vanish.volume.value=-12;
  synthRef.current.rankUp.volume.value=-6;synthRef.current.danUp.volume.value=-4;
  synthRef.initialized=true;
}
async function ensureAudio(){if(Tone.context.state!=="running")await Tone.start();initAudio();}
let muteGlobal=false;
function playPlace(m){if(muteGlobal||!synthRef.current)return;if(m==="O")synthRef.current.placeO.triggerAttackRelease("C5","16n");else synthRef.current.placeX.triggerAttackRelease("G4","16n");}
function playVanish(){if(muteGlobal||!synthRef.current)return;synthRef.current.vanish.triggerAttackRelease("E3","8n");}
function playWin(){if(muteGlobal||!synthRef.current)return;const n=Tone.now();synthRef.current.win.triggerAttackRelease("C5","8n",n);synthRef.current.win.triggerAttackRelease("E5","8n",n+.12);synthRef.current.win.triggerAttackRelease("G5","8n",n+.24);synthRef.current.win.triggerAttackRelease("C6","4n",n+.36);}
function playLose(){if(muteGlobal||!synthRef.current)return;const n=Tone.now();synthRef.current.lose.triggerAttackRelease("E4","8n",n);synthRef.current.lose.triggerAttackRelease("Eb4","8n",n+.2);synthRef.current.lose.triggerAttackRelease("D4","8n",n+.4);synthRef.current.lose.triggerAttackRelease("C3","2n",n+.6);}
function playRankUp(){if(muteGlobal||!synthRef.current)return;const n=Tone.now();synthRef.current.rankUp.triggerAttackRelease("G4","8n",n);synthRef.current.rankUp.triggerAttackRelease("C5","8n",n+.1);synthRef.current.rankUp.triggerAttackRelease("E5","8n",n+.2);synthRef.current.rankUp.triggerAttackRelease("G5","8n",n+.3);synthRef.current.rankUp.triggerAttackRelease("C6","4n",n+.4);}
function playDanUp(){if(muteGlobal||!synthRef.current)return;const n=Tone.now();const s=synthRef.current.danUp;s.triggerAttackRelease("C4","8n",n);s.triggerAttackRelease("E4","8n",n+.12);s.triggerAttackRelease("G4","8n",n+.24);s.triggerAttackRelease("C5","8n",n+.38);s.triggerAttackRelease("E5","8n",n+.52);s.triggerAttackRelease("G5","4n",n+.66);s.triggerAttackRelease("C6","4n",n+.82);s.triggerAttackRelease("E6","2n",n+1.0);}

// ---------- Game Logic ----------
const WINNING_LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function checkWinner(b){for(const[a,x,c]of WINNING_LINES){if(b[a]&&b[a]===b[x]&&b[a]===b[c])return{winner:b[a],line:[a,x,c]};}return null;}
function getEmpty(b){return b.map((v,i)=>(v===null?i:-1)).filter(i=>i>=0);}
function simulateMove(b,h,p,idx){const n=[...b];const nh={X:[...h.X],O:[...h.O]};if(nh[p].length>=3){const rm=nh[p].shift();n[rm]=null;}n[idx]=p;nh[p].push(idx);return{board:n,history:nh};}
function aiRandom(b){const e=getEmpty(b);return e[Math.floor(Math.random()*e.length)];}
function findWin(b,h,p){for(const i of getEmpty(b)){const{board:nb}=simulateMove(b,h,p,i);if(checkWinner(nb)?.winner===p)return i;}return null;}
function aiL2(b,h,m){const w=findWin(b,h,m);return w!==null?w:aiRandom(b);}
function aiL3(b,h,m){const o=m==="X"?"O":"X";const w=findWin(b,h,m);if(w!==null)return w;const bl=findWin(b,h,o);if(bl!==null)return bl;if(b[4]===null)return 4;return aiRandom(b);}
function evaluate(b,m){const o=m==="X"?"O":"X";let s=0;for(const[a,x,c]of WINNING_LINES){const cl=[b[a],b[x],b[c]];const mc=cl.filter(v=>v===m).length;const oc=cl.filter(v=>v===o).length;if(mc>0&&oc===0)s+=mc===2?10:1;if(oc>0&&mc===0)s-=oc===2?10:1;}for(const c of[0,2,6,8]){if(b[c]===m)s+=2;if(b[c]===o)s-=2;}if(b[4]===m)s+=3;if(b[4]===o)s-=3;return s;}
function minimax(b,h,isM,m,d,mD,a,bt){const o=m==="X"?"O":"X";const r=checkWinner(b);if(r?.winner===m)return 1000-d;if(r?.winner===o)return-1000+d;if(d>=mD)return evaluate(b,m);const p=isM?m:o;const e=getEmpty(b);if(!e.length)return 0;let best=isM?-Infinity:Infinity;for(const i of e){const{board:nb,history:nh}=simulateMove(b,h,p,i);const v=minimax(nb,nh,!isM,m,d+1,mD,a,bt);if(isM){best=Math.max(best,v);a=Math.max(a,v);}else{best=Math.min(best,v);bt=Math.min(bt,v);}if(bt<=a)break;}return best;}
function aiL4(b,h,m){const o=m==="X"?"O":"X";let w=findWin(b,h,m);if(w!==null)return w;w=findWin(b,h,o);if(w!==null)return w;const e=getEmpty(b);let bs=-Infinity,bm=[];for(const i of e){const{board:nb,history:nh}=simulateMove(b,h,m,i);const s=minimax(nb,nh,false,m,0,4,-Infinity,Infinity);if(s>bs){bs=s;bm=[i];}else if(s===bs)bm.push(i);}return bm[Math.floor(Math.random()*bm.length)];}
function aiL5(b,h,m){const o=m==="X"?"O":"X";let w=findWin(b,h,m);if(w!==null)return w;w=findWin(b,h,o);if(w!==null)return w;const e=getEmpty(b);let best=e[0];const t0=performance.now();for(let d=2;d<=12;d++){if(performance.now()-t0>400)break;let bs=-Infinity,ca=e[0],to=false;for(const i of e){if(performance.now()-t0>400){to=true;break;}const{board:nb,history:nh}=simulateMove(b,h,m,i);const s=minimax(nb,nh,false,m,0,d,-Infinity,Infinity);if(s>bs){bs=s;ca=i;}}if(!to){best=ca;if(bs>=900)break;}}return best;}
function getAI(lv,b,h,m){switch(lv){case 1:return aiRandom(b);case 2:return aiL2(b,h,m);case 3:return aiL3(b,h,m);case 4:return aiL4(b,h,m);case 5:return aiL5(b,h,m);default:return aiRandom(b);}}

// ---------- UI Components ----------
function Square({value,onClick,highlight,fading}){
  const colors={O:"#3b82f6",X:"#ef4444"};
  return(<button onClick={onClick} style={{width:100,height:100,fontSize:42,fontWeight:800,border:highlight?"3px solid #facc15":fading?"2px dashed #f97316":"2px solid #334155",borderRadius:12,background:highlight?"#fef9c3":fading?"#1e1b4b":"#f8fafc",color:fading?(colors[value]||"#000")+"55":colors[value]||"#000",cursor:"pointer",transition:"all 0.2s",fontFamily:"system-ui, sans-serif",opacity:fading?0.5:1}}
    onMouseEnter={e=>{if(!value)e.currentTarget.style.background="#e2e8f0";}}
    onMouseLeave={e=>{if(!highlight&&!fading)e.currentTarget.style.background="#f8fafc";if(fading)e.currentTarget.style.background="#1e1b4b";}}>
    {value}
  </button>);
}
function Toggle({checked,onChange,label}){
  return(<div onClick={onChange} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"#cbd5e1",userSelect:"none"}}>
    <div style={{width:40,height:22,borderRadius:11,padding:2,background:checked?"#6366f1":"#475569",transition:"background 0.2s",display:"flex",alignItems:"center",flexShrink:0}}>
      <div style={{width:18,height:18,borderRadius:9,background:"#fff",transition:"transform 0.2s",transform:checked?"translateX(18px)":"translateX(0)"}}/>
    </div>{label}
  </div>);
}
function RankBadge({rankIdx,t,small}){
  const name=t.rankNames[rankIdx];const isDan=rankIdx>=10;
  const color=rankIdx>=19?"#fbbf24":isDan?"#f97316":rankIdx<=3?"#22c55e":rankIdx<=6?"#3b82f6":"#a78bfa";
  return(<div style={{display:"inline-flex",alignItems:"center",gap:6,background:color+"18",border:`1px solid ${color}44`,borderRadius:20,padding:small?"3px 10px":"5px 14px"}}>
    <span style={{fontSize:small?12:15,fontWeight:800,color}}>{name}</span>
  </div>);
}

function AvatarPicker({selected,onSelect,label,rankIdx,lockLabel,eliteLockLabel,legendLockLabel}){
  const isDan=rankIdx>=10;const isElite=rankIdx>=14;const isLegend=rankIdx>=17;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
      <div style={{fontSize:14,fontWeight:700,color:"#cbd5e1"}}>{label}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4, 48px)",gap:6}}>
        {AVATARS.map(a=>{
          const locked=a.legend?!isLegend:a.elite?!isElite:a.monster?!isDan:false;
          const borderColor=selected===a.id?"#6366f1":locked?"#1e293b":a.legend?"#e879f9":a.elite?"#fbbf24":a.monster?"#f97316":"#334155";
          const showSilhouette=locked&&a.elite;
          const showHidden=locked&&a.legend;
          return(
            <button key={a.id} onClick={()=>!locked&&onSelect(a.id)} title={locked?(a.legend?legendLockLabel:a.elite?eliteLockLabel:lockLabel):""} style={{
              width:48,height:48,fontSize:26,borderRadius:10,
              border:`2px solid ${borderColor}`,
              background:selected===a.id?"#6366f120":locked?"#0f172a":a.legend?"#e879f908":a.elite?"#fbbf2408":"transparent",
              cursor:locked?"not-allowed":"pointer",
              transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center",
              opacity:locked&&!showSilhouette&&!showHidden?0.35:1,position:"relative",
              boxShadow:!locked&&a.legend?"0 0 12px rgba(232,121,249,0.3)":"none",
            }}>
              {showHidden?(<span style={{fontSize:22,fontWeight:800,color:"#e879f9"}}>❓</span>
              ):showSilhouette?(<span style={{fontSize:26,filter:"brightness(0)",opacity:0.5}}>{a.emoji}</span>
              ):(a.emoji)}
              {locked&&!showHidden&&<span style={{position:"absolute",bottom:2,right:2,fontSize:10}}>🔒</span>}
            </button>
          );
        })}
      </div>
      {!isDan&&<div style={{fontSize:10,color:"#64748b"}}>{lockLabel}</div>}
      {isDan&&!isElite&&<div style={{fontSize:10,color:"#fbbf24"}}>{eliteLockLabel}</div>}
      {isElite&&!isLegend&&<div style={{fontSize:10,color:"#e879f9"}}>{legendLockLabel}</div>}
    </div>
  );
}

function SettingsModal({t,showHint,setShowHint,lang,setLang,muted,setMuted,onResetRank,onClose}){
  const[cr,setCr]=useState(false);
  return(<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#1e293b",border:"1px solid #475569",borderRadius:16,padding:"24px 28px",width:280,display:"flex",flexDirection:"column",gap:16,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
      <div style={{fontSize:18,fontWeight:800,color:"#f1f5f9",textAlign:"center"}}>{t.settings}</div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Toggle checked={showHint} onChange={()=>setShowHint(!showHint)} label={t.hintLabel}/>
        <Toggle checked={muted} onChange={()=>setMuted(!muted)} label={t.muteLabel}/>
        <Toggle checked={lang==="en"} onChange={()=>setLang(l=>l==="ja"?"en":"ja")} label={t.langLabel}/>
      </div>
      <div style={{borderTop:"1px solid #334155",paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
        {!cr?(<button onClick={()=>setCr(true)} style={{padding:"8px 0",fontSize:13,fontWeight:600,border:"1px solid #dc2626",borderRadius:8,background:"transparent",color:"#f87171",cursor:"pointer"}}>{t.resetRank}</button>
        ):(<div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
          <div style={{fontSize:13,color:"#f87171",fontWeight:600}}>{t.resetConfirm}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{onResetRank();setCr(false);}} style={{padding:"6px 20px",fontSize:13,fontWeight:700,border:"none",borderRadius:6,background:"#dc2626",color:"#fff",cursor:"pointer"}}>{t.yes}</button>
            <button onClick={()=>setCr(false)} style={{padding:"6px 20px",fontSize:13,fontWeight:700,border:"1px solid #475569",borderRadius:6,background:"transparent",color:"#94a3b8",cursor:"pointer"}}>{t.no}</button>
          </div></div>)}
      </div>
      <button onClick={onClose} style={{padding:"10px 0",fontSize:15,fontWeight:700,border:"1px solid #475569",borderRadius:8,background:"transparent",color:"#94a3b8",cursor:"pointer"}}>{t.close}</button>
    </div>
  </div>);
}

function RankUpOverlay({rankIdx,t,onClose}){
  const isDan=rankIdx>=10;
  return(<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(135deg,#1e293b,#0f172a)",border:`2px solid ${isDan?"#f97316":"#fbbf24"}`,borderRadius:20,padding:"32px 40px",display:"flex",flexDirection:"column",alignItems:"center",gap:16,boxShadow:`0 0 60px ${isDan?"rgba(249,115,22,0.4)":"rgba(251,191,36,0.3)"}`}}>
      <div style={{fontSize:28,fontWeight:800}}>{isDan?t.rankUpDan:t.rankUp}</div>
      <RankBadge rankIdx={rankIdx} t={t}/>
      <button onClick={onClose} style={{marginTop:8,padding:"10px 32px",fontSize:15,fontWeight:700,border:"none",borderRadius:8,background:isDan?"#f97316":"#fbbf24",color:"#0f172a",cursor:"pointer"}}>{t.close}</button>
    </div>
  </div>);
}

// ---------- Main App ----------
export default function App(){
  const[lang,setLang]=useState("ja");const t=LANG[lang];
  const[mode,setMode]=useState(null);
  const[aiLevel,setAiLevel]=useState(3);
  const[showHint,setShowHint]=useState(true);
  const[muted,setMuted]=useState(false);
  const[settingsOpen,setSettingsOpen]=useState(false);
  const[board,setBoard]=useState(Array(9).fill(null));
  const[isONext,setIsONext]=useState(true);
  const[score,setScore]=useState({O:0,X:0});
  const[history,setHistory]=useState({X:[],O:[]});
  const[gameOver,setGameOver]=useState(false);
  const[thinking,setThinking]=useState(false);

  // Rank (loaded from localStorage)
  const savedRank = loadJSON("ox-rank", { rankIdx: 0, streak: 0 });
  const[rankIdx,setRankIdx]=useState(savedRank.rankIdx);
  const[streak,setStreak]=useState(savedRank.streak);
  const[showRankUp,setShowRankUp]=useState(false);

  // Avatar (loaded from localStorage)
  const savedAvatar = loadString("ox-avatar", "dog");
  const initAvatar = (() => {
    const av = AVATARS.find(a => a.id === savedAvatar);
    if (av?.legend && savedRank.rankIdx < 17) return "dog";
    if (av?.elite && savedRank.rankIdx < 14) return "dog";
    if (av?.monster && savedRank.rankIdx < 10) return "dog";
    return savedAvatar;
  })();
  const[myAvatar,setMyAvatar]=useState(initAvatar);

  // Save rank to localStorage when it changes
  useEffect(()=>{saveJSON("ox-rank",{rankIdx,streak});},[rankIdx,streak]);
  useEffect(()=>{saveString("ox-avatar",myAvatar);},[myAvatar]);
  useEffect(()=>{muteGlobal=muted;},[muted]);

  const result=checkWinner(board);const winner=result?.winner;const winLine=result?.line||[];
  const currentPlayer=isONext?"O":"X";
  const fadingIndex=showHint&&!gameOver&&!winner&&history[currentPlayer].length>=3?history[currentPlayer][0]:null;
  const isCpuTurn=mode==="cpu"&&currentPlayer==="X"&&!winner&&!gameOver;

  function handleWinResult(wm){
    setScore(s=>({...s,[wm]:s[wm]+1}));setGameOver(true);
    if(mode==="cpu"&&wm==="O"){
      const q=rankIdx>=9?(aiLevel>=5&&!showHint):true;
      const ns=q?streak+1:streak;if(q)setStreak(ns);
      if(checkPromotion(rankIdx,aiLevel,showHint,ns)){const nr=rankIdx+1;setTimeout(()=>{setRankIdx(nr);setStreak(0);setShowRankUp(true);if(nr>=10)playDanUp();else playRankUp();},800);}
      setTimeout(()=>playWin(),200);
    }else if(mode==="cpu"&&wm==="X"){
      if(rankIdx>=9&&aiLevel>=5&&!showHint)setStreak(0);
      setTimeout(()=>playLose(),200);
    }else{setTimeout(()=>playWin(),200);}
  }

  const doAIMove=useCallback(()=>{
    if(!isCpuTurn)return;setThinking(true);
    setTimeout(async()=>{
      await ensureAudio();const mv=getAI(aiLevel,board,history,"X");
      if(mv==null){setThinking(false);return;}
      const next=[...board];const nh={X:[...history.X],O:[...history.O]};
      const hv=nh.X.length>=3;if(hv){next[nh.X.shift()]=null;}
      next[mv]="X";nh.X.push(mv);
      if(hv)playVanish();setTimeout(()=>playPlace("X"),hv?80:0);
      setBoard(next);setHistory(nh);setIsONext(true);setThinking(false);
      const res=checkWinner(next);if(res?.winner)handleWinResult(res.winner);
    },350);
  },[isCpuTurn,aiLevel,board,history,rankIdx,streak,showHint]);
  useEffect(()=>{doAIMove();},[doAIMove]);

  function handleClick(i){
    if(board[i]||winner||gameOver||thinking)return;
    if(mode==="cpu"&&currentPlayer==="X")return;
    ensureAudio().then(()=>{
      const next=[...board];const nh={X:[...history.X],O:[...history.O]};const p=currentPlayer;
      const hv=nh[p].length>=3;if(hv){next[nh[p].shift()]=null;}
      next[i]=p;nh[p].push(i);
      if(hv)playVanish();setTimeout(()=>playPlace(p),hv?80:0);
      setBoard(next);setHistory(nh);setIsONext(!isONext);
      const res=checkWinner(next);if(res?.winner)handleWinResult(res.winner);
    });
  }

  function reset(){setBoard(Array(9).fill(null));setHistory({X:[],O:[]});setIsONext(true);setGameOver(false);setThinking(false);}
  function backToMenu(){reset();setScore({O:0,X:0});setMode(null);}
  function resetRank(){setRankIdx(0);setStreak(0);const av=AVATARS.find(a=>a.id===myAvatar);if(av?.monster||av?.elite||av?.legend)setMyAvatar("dog");}

  const levelColors=["","#22c55e","#84cc16","#eab308","#f97316","#ef4444"];
  const wrap={minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"system-ui, sans-serif",background:"linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",color:"#f1f5f9",padding:20};
  const settingsModal=settingsOpen&&<SettingsModal t={t} showHint={showHint} setShowHint={setShowHint} lang={lang} setLang={setLang} muted={muted} setMuted={setMuted} onResetRank={resetRank} onClose={()=>setSettingsOpen(false)}/>;
  const rankUpOverlay=showRankUp&&<RankUpOverlay rankIdx={rankIdx} t={t} onClose={()=>setShowRankUp(false)}/>;
  const gearBtn=<button onClick={()=>setSettingsOpen(true)} style={{position:"absolute",top:16,right:16,width:40,height:40,borderRadius:10,border:"1px solid #475569",background:"rgba(30,41,59,0.8)",color:"#94a3b8",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>⚙</button>;
  const reqNeeded=getRequiredStreak(rankIdx);const showSP=rankIdx>=9&&rankIdx<19;

  // ---------- Menu ----------
  if(mode===null){
    return(
      <div style={{...wrap,gap:18,position:"relative"}}>
        {gearBtn}{settingsModal}{rankUpOverlay}
        <h1 style={{fontSize:36,fontWeight:800,margin:0,letterSpacing:2}}>{t.title}</h1>
        <div style={{fontSize:13,color:"#94a3b8",textAlign:"center",maxWidth:300}}>{t.desc}</div>

        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,background:"#0f172a",border:"1px solid #334155",borderRadius:14,padding:"14px 24px",width:280}}>
          <div style={{fontSize:12,color:"#64748b",fontWeight:600}}>{t.rankLabel}</div>
          <RankBadge rankIdx={rankIdx} t={t}/>
          <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{t.nextReq}: <span style={{color:"#cbd5e1"}}>{getPromotionReq(rankIdx,t)}</span></div>
          {showSP&&<div style={{fontSize:11,color:"#f97316"}}>{t.streakProgress(streak,reqNeeded)}</div>}
        </div>

        <button onClick={()=>setMode("pvp")} style={{padding:"14px 0",fontSize:18,fontWeight:700,border:"none",borderRadius:10,background:"#6366f1",color:"#fff",cursor:"pointer",width:280}}>{t.pvp}</button>

        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,background:"#1e293b",border:"1px solid #334155",borderRadius:14,padding:"20px 28px",width:280}}>
          <div style={{fontSize:16,fontWeight:700}}>{t.cpuBattle}</div>
          <div style={{fontSize:13,color:"#94a3b8"}}>{t.chooseLv}</div>
          <div style={{display:"flex",gap:6}}>
            {[1,2,3,4,5].map(lv=>(<button key={lv} onClick={()=>setAiLevel(lv)} style={{width:44,height:44,fontSize:18,fontWeight:800,border:aiLevel===lv?`2px solid ${levelColors[lv]}`:"2px solid #475569",borderRadius:8,background:aiLevel===lv?levelColors[lv]+"22":"transparent",color:aiLevel===lv?levelColors[lv]:"#94a3b8",cursor:"pointer"}}>{lv}</button>))}
          </div>
          <div style={{fontSize:15,fontWeight:700,color:levelColors[aiLevel],minHeight:24}}>{t.lvLabels[aiLevel]}</div>
          <button onClick={()=>setMode("cpu")} style={{padding:"12px 0",fontSize:16,fontWeight:700,border:"none",borderRadius:10,background:levelColors[aiLevel],color:"#fff",cursor:"pointer",width:"100%"}}>{t.start}</button>
        </div>

        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,background:"#1e293b",border:"1px solid #334155",borderRadius:14,padding:"20px 28px",width:280,opacity:0.6}}>
          <div style={{fontSize:16,fontWeight:700}}>{t.online}</div>
          <AvatarPicker selected={myAvatar} onSelect={setMyAvatar} label={t.chooseAvatar} rankIdx={rankIdx} lockLabel={t.monsterLock} eliteLockLabel={t.eliteLock} legendLockLabel={t.legendLock}/>
          <div style={{fontSize:13,color:"#94a3b8",textAlign:"center",padding:"8px 0"}}>{t.onlineComingSoon}</div>
        </div>
      </div>
    );
  }

  // ---------- Game ----------
  const status=winner
    ? mode==="cpu"? winner==="O"?t.winPlayer:t.winCpu : t.winMark(winner)
    : thinking? t.thinking
    : mode==="cpu"? t.yourTurn : t.turnMark(currentPlayer);

  const moveInfo=!winner&&!thinking&&history[currentPlayer].length>=3
    ? showHint? t.vanishWarn(mode==="cpu"&&currentPlayer==="O"?t.youWho:currentPlayer) : t.vanishWarnGeneric
    : !winner&&!thinking? t.remaining(3-history[currentPlayer].length) : "";

  return(
    <div style={{...wrap,gap:14,position:"relative"}}>
      {gearBtn}{settingsModal}{rankUpOverlay}
      <h1 style={{fontSize:26,fontWeight:800,margin:0,letterSpacing:2}}>{t.title}</h1>

      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
        {mode==="cpu"&&(<div style={{fontSize:13,fontWeight:700,color:levelColors[aiLevel],background:levelColors[aiLevel]+"18",padding:"4px 14px",borderRadius:20}}>CPU Lv.{aiLevel} {t.lvLabels[aiLevel]}</div>)}
        {mode==="cpu"&&<RankBadge rankIdx={rankIdx} t={t} small/>}
      </div>

      {!showHint&&<div style={{fontSize:11,color:"#f97316",background:"#f9731612",padding:"3px 12px",borderRadius:12}}>{t.hintOff}</div>}
      {mode==="cpu"&&showSP&&<div style={{fontSize:11,color:"#a78bfa"}}>{t.streakProgress(streak,reqNeeded)}</div>}

      <div style={{display:"flex",gap:24,fontSize:15,fontWeight:600}}>
        <span style={{color:"#3b82f6"}}>{mode==="cpu"?t.youLabel:"O"}: {score.O}</span>
        <span style={{color:"#ef4444"}}>{mode==="cpu"?t.cpuLabel:"X"}: {score.X}</span>
      </div>

      <div style={{fontSize:20,fontWeight:700,minHeight:32,color:winner?"#facc15":thinking?"#a78bfa":"#cbd5e1"}}>{status}</div>
      <div style={{fontSize:13,color:"#f97316",minHeight:18,fontWeight:600}}>{moveInfo}</div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3, 100px)",gap:8}}>
        {board.map((val,i)=>(<Square key={i} value={val} onClick={()=>handleClick(i)} highlight={winLine.includes(i)} fading={fadingIndex===i}/>))}
      </div>

      <div style={{display:"flex",gap:10,marginTop:8}}>
        <button onClick={reset} style={{padding:"10px 28px",fontSize:15,fontWeight:700,border:"none",borderRadius:8,background:"#6366f1",color:"#fff",cursor:"pointer"}}>{t.retry}</button>
        <button onClick={backToMenu} style={{padding:"10px 28px",fontSize:15,fontWeight:700,border:"1px solid #475569",borderRadius:8,background:"transparent",color:"#94a3b8",cursor:"pointer"}}>{t.backMenu}</button>
      </div>
    </div>
  );
}
