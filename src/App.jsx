import { useState, useEffect, useCallback, useRef } from "react";
import * as Tone from "tone";

// ---------- Avatars ----------
const AVATARS = [
  { id:"dog",emoji:"🐶"},{ id:"cat",emoji:"🐱"},{ id:"rabbit",emoji:"🐰"},{ id:"squirrel",emoji:"🐿️"},
  { id:"bird",emoji:"🐦"},{ id:"fox",emoji:"🦊"},{ id:"bear",emoji:"🐻"},{ id:"tiger",emoji:"🐯"},
  { id:"alien",emoji:"👾",monster:true},{ id:"ogre",emoji:"👹",monster:true},{ id:"goblin",emoji:"👺",monster:true},
  { id:"blob",emoji:"🫠",monster:true},{ id:"ghost",emoji:"👻",monster:true},
  { id:"reaper",emoji:"☠️",elite:true},{ id:"dragon",emoji:"🐉",elite:true},{ id:"moai",emoji:"🗿",elite:true},
  { id:"fairy",emoji:"🧚",legend:true},{ id:"unicorn",emoji:"🦄",legend:true},
  { id:"god",emoji:"✨",god:true},
];

// ---------- Themes ----------
const THEMES = {
  wood:{id:"wood",O:"#f0e4d0",X:"#1c0f06",Olabel:"◯",Xlabel:"✕",
    light:"#f0e4d0",dark:"#1c0f06",text:"#d4c4a8",textDim:"#9c8b70",textFaint:"#6b5c47",
    accent:"#c9a66b",warn:"#c9a66b",cardBg:"rgba(40,22,10,0.85)",cardBorder:"rgba(180,140,80,0.25)",
    sqBg:"rgba(160,128,80,0.45)",sqHl:"rgba(201,166,107,0.35)",sqFade:"rgba(120,90,50,0.2)",
    sqBorder:"rgba(100,75,40,0.4)",boardBg:"rgba(140,108,60,0.2)",boardBorder:"rgba(140,108,60,0.25)",
    btnPrimBg:"linear-gradient(135deg,#8b5e34,#6b4423)",btnPrimColor:"#f0e4d0",btnPrimBorder:"rgba(180,140,80,0.4)",
    btnGhostColor:"#c9a66b",btnGhostBorder:"rgba(180,140,80,0.3)",
    toggleOn:"#8b5e34",toggleOff:"rgba(80,50,25,0.6)",toggleKnob:"#f5e6c8",
    fontTitle:"'Shippori Mincho B1',serif",fontBody:"'Noto Sans JP','Shippori Mincho B1',sans-serif",
    titleJa:t=><><span style={{color:t.O}}>◯</span><span style={{color:t.X}}>✕</span></>,
    css:`@import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;700;800&family=Noto+Sans+JP:wght@400;700;800&display=swap');
.theme-bg{min-height:100vh;background:repeating-linear-gradient(90deg,transparent,rgba(139,90,43,0.03) 2px,transparent 4px,rgba(101,67,33,0.02) 8px),repeating-linear-gradient(180deg,transparent,rgba(139,90,43,0.015) 40px,transparent 80px),linear-gradient(175deg,#c9a66b 0%,#b8944f 15%,#c4a060 30%,#b08840 50%,#a37c38 70%,#c09850 85%,#b8904a 100%);}
.theme-bg::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background:repeating-linear-gradient(92deg,transparent,rgba(80,50,20,0.04) 1px,transparent 3px,rgba(60,35,10,0.03) 7px,transparent 11px);}
.theme-bg::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse at 30% 20%,rgba(255,240,200,0.15) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(0,0,0,0.1) 0%,transparent 50%);}`,
    sub:"— まるばつゲーム —",subColor:"#6b5c47"},
  comic:{id:"comic",O:"#2563eb",X:"#dc2626",Olabel:"O",Xlabel:"X",
    light:"#fef9c3",dark:"#1e1b4b",text:"#fef9c3",textDim:"#fde68a",textFaint:"#fbbf24",
    accent:"#f59e0b",warn:"#fb923c",cardBg:"rgba(30,10,60,0.9)",cardBorder:"3px solid #fbbf24",
    sqBg:"#fef9c3",sqHl:"#fde047",sqFade:"#e2e8f0",
    sqBorder:"3px solid #1e1b4b",boardBg:"#1e1b4b",boardBorder:"4px solid #fbbf24",
    btnPrimBg:"linear-gradient(135deg,#dc2626,#b91c1c)",btnPrimColor:"#fff",btnPrimBorder:"3px solid #1e1b4b",
    btnGhostColor:"#fef9c3",btnGhostBorder:"3px solid #fef9c3",
    toggleOn:"#dc2626",toggleOff:"#4338ca",toggleKnob:"#fef9c3",
    fontTitle:"'Bangers',cursive",fontBody:"'Fredoka',sans-serif",
    titleJa:t=><><span style={{color:t.O}}>O</span><span style={{color:t.X}}>X</span></>,
    css:`@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Fredoka:wght@400;600;700&display=swap');
.theme-bg{min-height:100vh;background:#4338ca;background-image:radial-gradient(circle at 20% 80%,#7c3aed 0%,transparent 50%),radial-gradient(circle at 80% 20%,#dc2626 0%,transparent 40%),radial-gradient(circle at 50% 50%,#4338ca 0%,#1e1b4b 100%);}
.theme-bg::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(circle,rgba(0,0,0,0.12) 1px,transparent 1px);background-size:6px 6px;}
.theme-bg::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;}
.comic-card{border-radius:16px!important;box-shadow:6px 6px 0 #1e1b4b!important;border:3px solid #fbbf24!important;}`,
    sub:"— COMIC BATTLE —",subColor:"#fde68a"},
};

// ---------- i18n ----------
const LANG={
  ja:{title:"ゲーム",desc:"盤上に置けるのは3つまで！4つ目を置くと一番古いやつが消えるよ",
    settings:"⚙ 設定",hintLabel:"消えるマークを教える",langLabel:"English",muteLabel:"消音",themeLabel:"テーマ切替",blindLabel:"ブラインドモード",
    pvp:"👫 ふたりで遊ぶ",cpuBattle:"vs CPU 🤖",online:"🌐 ネット対戦",ranking:"🏅 ランキング",practice:"📖 れんしゅう",
    chooseLv:"レベルを選んでね",start:"いざ勝負！",turnOrder:"手番",first:"先手",second:"後手",random:"ランダム",
    lvLabels:["","😊 よわよわ","🙂 まあまあ","😐 ふつう","😈 つよつよ","👹 鬼"],
    youLabel:T=>`きみ ${T.Olabel}`,cpuLabel:T=>`CPU ${T.Xlabel}`,
    winPlayer:"やったね！きみの勝ち！",winCpu:"CPUの勝ち…くやしい！",
    roasts:["それ、目ぇつぶってても勝てたわ 😴","回線切れたんかと思ったわ (・_・)","おかんに代わってもろてええか？ 😇","今の見てた？見てへんかったやろ (´σ_σ`)","三目並べの才能、他で使いや 🥲","もしかして相手勝たせるゲームやと思てる？ 🤡","きみの戦略、意味不明すぎて逆にすごいわ ( ˙▿˙ )","AIにも感情あったら今ちょっと申し訳ないねんけど 🥱","次は指やなくて頭使ってみぃや (ーωー)","あれ、これ初めて？3回目？…えっ、マジで？ (°д°)","きみの実力、盤面にモロ出てるで 😬","弱すぎてログ残したないレベルやわ ( ´_ゝ`)","もうちょい粘ると思てたわ。買いかぶりやったな ┐(´д`)┌","今のは練習やんな？…練習やんな？ ( ；∀；)","きみの打ち方、新ジャンルやな 🤪"],
    winMark:m=>`${m} の勝ち！`,thinking:"CPU考え中…",
    yourTurn:"きみの番だよ",turnMark:m=>`${m} の番だよ`,hintOff:"ヒントOFF",blindOn:"🙈 ブラインド",
    vanishWarn:w=>`${w}の古いマークが消えるよ`,vanishWarnGeneric:"次に置くとどれか消えるよ",
    remaining:n=>`あと ${n} つ置ける`,youWho:"きみ",
    retry:"もっかい！",backMenu:"メニューに戻る",close:"とじる",
    rankLabel:"ランク",rankUp:"昇級",rankUpDan:"昇段",
    rankNames:["10級","9級","8級","7級","6級","5級","4級","3級","2級","1級","初段","二段","三段","四段","五段","六段","七段","八段","九段","十段","十一段"],
    nextReq:"次",reqLv3:"Lv.3に勝利",reqLv4:"Lv.4に勝利",reqLv5:"👹鬼に勝利",reqLv5NoHint:"👹鬼に勝利（ヒントOFF）",
    reqStreak:n=>`👹鬼ヒントOFFで${n}連勝`,reqBlind:n=>`👹鬼ブラインドで${n}連勝`,
    streakProgress:(c,n)=>`${c}/${n}連勝`,maxRank:"✨ 最高位",
    resetRank:"ランクリセット",resetConfirm:"ランクを10級に戻す？",yes:"うん",no:"やめとく",
    createRoom:"部屋をつくる",roomCode:"コード",join:"入る",cancel:"やめる",
    waiting:"相手を待ってるよ…",shareCode:"このコードを相手に教えてね！",
    opponentTurn:"相手の番だよ…",youWin:"きみの勝ち！",youLose:"相手の勝ち…",
    roomNotFound:"部屋が見つからないよ",roomFull:"満員だよ",
    leave:"退出",copyCode:"コピー",copied:"コピーした！",
    chooseAvatar:"アイコンを選んでね",monsterLock:"🔒 初段以上",eliteLock:"🔒 五段以上",legendLock:"🔒 八段以上",godLock:"🔒 十一段で解放",
    vs:"vs",replay:"ふりかえり",replayStep:(c,t)=>`${c} / ${t} 手目`,replayEnd:"終局",
    practiceTitle:"📖 れんしゅうモード",
    advGreat:"✨ ナイス！最善手だよ！",advGood:"👍 いい手だね！",advOk:"🤔 悪くはないけど…",advBad:"😥 もっといい手があったよ",advMiss:"💀 あちゃ〜…ここは危なかった",
    tipBest:p=>`💡 最善手は ${p} だったよ`,
    tips:["💡 中央(5)は最強のマス！迷ったらここ","💡 角(1,3,7,9)は次に強い。端より角を狙おう","💡 相手がリーチならまずブロック！","💡 消えるマークを忘れずに数えよう","💡 相手の古いマークがどこか意識しよう","💡 自分のリーチを2つ作ると勝ちやすい","💡 後手は中央を取られたら角で対抗"],
    showHints:"ヒントを表示",
    rankingTitle:"🏅 ランキング",noData:"まだデータがないよ",you:"(きみ)",registerName:"名前を登録してね",register:"登録",
  },
  en:{title:"Game",desc:"Max 3 marks! The oldest disappears on the 4th",
    settings:"⚙ Settings",hintLabel:"Show vanishing marks",langLabel:"日本語",muteLabel:"Mute",themeLabel:"Theme",blindLabel:"Blind mode",
    pvp:"👫 Two Players",cpuBattle:"vs CPU 🤖",online:"🌐 Online",ranking:"🏅 Ranking",practice:"📖 Practice",
    chooseLv:"Pick a level",start:"Let's go!",turnOrder:"Turn",first:"1st",second:"2nd",random:"Random",
    lvLabels:["","😊 Easy","🙂 Mild","😐 Normal","😈 Hard","👹 Demon"],
    youLabel:T=>`You ${T.Olabel}`,cpuLabel:T=>`CPU ${T.Xlabel}`,
    winPlayer:"You win!",winCpu:"CPU wins…",winMark:m=>`${m} wins!`,thinking:"CPU thinking…",
    roasts:["that's why she left you 😢","I've seen better moves from a screensaver 😴","are you even trying or just vibing 😶‍🌫️","my RAM could beat you and I only have 4KB 🤖","you play like you googled 'how to lose' 🫠","I'd say GG but there was no G on your side 😶","bro really said 'hold my brain' and put it down 🙄","plot twist: you were the tutorial all along 🤡","losing builds character… you must have a LOT 😬","I've been going easy. this WAS easy mode 😏","you sure you're not playing for MY team? 🫣","that move had reply-all energy 😳","your strategy is giving 'random number generator' 🥴","a chess AI just felt second-hand embarrassment 😮‍💨","I'd let you win but my code has standards 😌"],
    yourTurn:"Your turn",turnMark:m=>`${m}'s turn`,hintOff:"Hints OFF",blindOn:"🙈 Blind",
    vanishWarn:w=>`${w}'s oldest vanishes`,vanishWarnGeneric:"A mark will disappear",
    remaining:n=>`${n} left`,youWho:"You",
    retry:"Again!",backMenu:"Menu",close:"Close",
    rankLabel:"Rank",rankUp:"Rank Up",rankUpDan:"Dan Up",
    rankNames:["10-kyū","9-kyū","8-kyū","7-kyū","6-kyū","5-kyū","4-kyū","3-kyū","2-kyū","1-kyū","Shodan","2-dan","3-dan","4-dan","5-dan","6-dan","7-dan","8-dan","9-dan","10-dan","11-dan"],
    nextReq:"Next",reqLv3:"Beat Lv.3",reqLv4:"Beat Lv.4",reqLv5:"Beat 👹",reqLv5NoHint:"Beat 👹 (hints OFF)",
    reqStreak:n=>`${n}W vs 👹 (no hints)`,reqBlind:n=>`${n}W vs 👹 Blind`,
    streakProgress:(c,n)=>`${c}/${n} streak`,maxRank:"✨ Supreme",
    resetRank:"Reset rank",resetConfirm:"Reset?",yes:"Yes",no:"No",
    createRoom:"Create Room",roomCode:"Code",join:"Join",cancel:"Cancel",
    waiting:"Waiting…",shareCode:"Share this code!",
    opponentTurn:"Opponent's turn…",youWin:"You win!",youLose:"Opponent wins…",
    roomNotFound:"Not found",roomFull:"Full",
    leave:"Leave",copyCode:"Copy",copied:"Copied!",
    chooseAvatar:"Choose icon",monsterLock:"🔒 Shodan+",eliteLock:"🔒 5-dan+",legendLock:"🔒 8-dan+",godLock:"🔒 11-dan",
    vs:"vs",replay:"Replay",replayStep:(c,t)=>`${c}/${t}`,replayEnd:"Final",
    practiceTitle:"📖 Practice Mode",
    advGreat:"✨ Perfect! Best move!",advGood:"👍 Nice move!",advOk:"🤔 Not bad, but…",advBad:"😥 There was a better move",advMiss:"💀 Oops… that was risky",
    tipBest:p=>`💡 Best was square ${p}`,
    tips:["💡 Center (5) is king! Go there when in doubt","💡 Corners (1,3,7,9) beat edges. Aim for corners","💡 Block opponent's winning lines first!","💡 Keep track of vanishing marks","💡 Watch where opponent's oldest mark is","💡 Try to create two winning threats at once","💡 If you go second, counter center with corners"],
    showHints:"Show hints",
    rankingTitle:"🏅 Ranking",noData:"No data yet",you:"(you)",registerName:"Enter your name",register:"Register",
  },
};

// ---------- Rank (0-20: 10kyu..10dan, 11dan) ----------
function getRS(ri){if(ri<9)return 1;if(ri===19)return 5;return ri-7;}
function getPR(ri,t){if(ri>=20)return t.maxRank;if(ri<6)return t.reqLv3;if(ri===6)return t.reqLv4;if(ri===7)return t.reqLv5;if(ri===8)return t.reqLv5NoHint;if(ri===19)return t.reqBlind(5);return t.reqStreak(getRS(ri));}
function chkP(ri,lv,hint,blind,streak){if(ri>=20)return false;if(ri<6)return lv>=3;if(ri===6)return lv>=4;if(ri===7)return lv>=5;if(ri===8)return lv>=5&&!hint;if(ri===19)return lv>=5&&blind&&streak>=5;if(lv<5||hint)return false;return streak>=getRS(ri);}
function qualifies(ri,lv,hint,blind){if(ri===19)return lv>=5&&blind;if(ri>=9)return lv>=5&&!hint;return true;}

// ---------- Sound ----------
const SR={current:null,init:false};
function initA(){if(SR.init)return;SR.current={pO:new Tone.Synth({oscillator:{type:"sine"},envelope:{attack:0.01,decay:0.15,sustain:0,release:0.1}}).toDestination(),pX:new Tone.Synth({oscillator:{type:"triangle"},envelope:{attack:0.01,decay:0.12,sustain:0,release:0.1}}).toDestination(),van:new Tone.Synth({oscillator:{type:"sine"},envelope:{attack:0.01,decay:0.3,sustain:0,release:0.2}}).toDestination(),win:new Tone.PolySynth(Tone.Synth,{maxPolyphony:4,voice:Tone.Synth,options:{oscillator:{type:"triangle"},envelope:{attack:0.02,decay:0.3,sustain:0.2,release:0.4}}}).toDestination(),lose:new Tone.PolySynth(Tone.Synth,{maxPolyphony:4,voice:Tone.Synth,options:{oscillator:{type:"sawtooth"},envelope:{attack:0.02,decay:0.4,sustain:0.1,release:0.5}}}).toDestination(),rU:new Tone.PolySynth(Tone.Synth,{maxPolyphony:6,voice:Tone.Synth,options:{oscillator:{type:"triangle"},envelope:{attack:0.02,decay:0.2,sustain:0.3,release:0.6}}}).toDestination(),dU:new Tone.PolySynth(Tone.Synth,{maxPolyphony:8,voice:Tone.Synth,options:{oscillator:{type:"sine"},envelope:{attack:0.03,decay:0.3,sustain:0.4,release:0.8}}}).toDestination()};SR.current.win.volume.value=-8;SR.current.lose.volume.value=-10;SR.current.van.volume.value=-12;SR.current.rU.volume.value=-6;SR.current.dU.volume.value=-4;SR.init=true;}
async function ensA(){if(Tone.context.state!=="running")await Tone.start();initA();}
let MU=false;
function sP(m){if(MU||!SR.current)return;if(m==="O")SR.current.pO.triggerAttackRelease("C5","16n");else SR.current.pX.triggerAttackRelease("G4","16n");}
function sV(){if(MU||!SR.current)return;SR.current.van.triggerAttackRelease("E3","8n");}
function sW(){if(MU||!SR.current)return;const n=Tone.now();SR.current.win.triggerAttackRelease("C5","8n",n);SR.current.win.triggerAttackRelease("E5","8n",n+.12);SR.current.win.triggerAttackRelease("G5","8n",n+.24);SR.current.win.triggerAttackRelease("C6","4n",n+.36);}
function sL(){if(MU||!SR.current)return;const n=Tone.now();SR.current.lose.triggerAttackRelease("E4","8n",n);SR.current.lose.triggerAttackRelease("Eb4","8n",n+.2);SR.current.lose.triggerAttackRelease("D4","8n",n+.4);SR.current.lose.triggerAttackRelease("C3","2n",n+.6);}
function sRUp(){if(MU||!SR.current)return;const n=Tone.now();SR.current.rU.triggerAttackRelease("G4","8n",n);SR.current.rU.triggerAttackRelease("C5","8n",n+.1);SR.current.rU.triggerAttackRelease("E5","8n",n+.2);SR.current.rU.triggerAttackRelease("G5","8n",n+.3);SR.current.rU.triggerAttackRelease("C6","4n",n+.4);}
function sDUp(){if(MU||!SR.current)return;const n=Tone.now();const s=SR.current.dU;s.triggerAttackRelease("C4","8n",n);s.triggerAttackRelease("E4","8n",n+.12);s.triggerAttackRelease("G4","8n",n+.24);s.triggerAttackRelease("C5","8n",n+.38);s.triggerAttackRelease("E5","8n",n+.52);s.triggerAttackRelease("G5","4n",n+.66);s.triggerAttackRelease("C6","4n",n+.82);s.triggerAttackRelease("E6","2n",n+1.0);}

// ---------- Game Logic ----------
const WL=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function cW(b){for(const[a,x,c]of WL){if(b[a]&&b[a]===b[x]&&b[a]===b[c])return{winner:b[a],line:[a,x,c]};}return null;}
function gE(b){return b.map((v,i)=>(v===null?i:-1)).filter(i=>i>=0);}
function sm(b,h,p,idx){const n=[...b];const nh={X:[...h.X],O:[...h.O]};if(nh[p].length>=3){n[nh[p].shift()]=null;}n[idx]=p;nh[p].push(idx);return{board:n,history:nh};}
function aR(b){const e=gE(b);return e[Math.floor(Math.random()*e.length)];}
function fW(b,h,p){for(const i of gE(b)){const{board:nb}=sm(b,h,p,i);if(cW(nb)?.winner===p)return i;}return null;}
function a2(b,h,m){const w=fW(b,h,m);return w!==null?w:aR(b);}
function a3(b,h,m){const o=m==="X"?"O":"X";const w=fW(b,h,m);if(w!==null)return w;const bl=fW(b,h,o);if(bl!==null)return bl;if(b[4]===null)return 4;return aR(b);}
function ev(b,m){const o=m==="X"?"O":"X";let s=0;for(const[a,x,c]of WL){const cl=[b[a],b[x],b[c]];const mc=cl.filter(v=>v===m).length;const oc=cl.filter(v=>v===o).length;if(mc>0&&oc===0)s+=mc===2?10:1;if(oc>0&&mc===0)s-=oc===2?10:1;}for(const c of[0,2,6,8]){if(b[c]===m)s+=2;if(b[c]===o)s-=2;}if(b[4]===m)s+=3;if(b[4]===o)s-=3;return s;}
function mmx(b,h,isM,m,d,mD,a,bt){const o=m==="X"?"O":"X";const r=cW(b);if(r?.winner===m)return 1000-d;if(r?.winner===o)return-1000+d;if(d>=mD)return ev(b,m);const p=isM?m:o;const e=gE(b);if(!e.length)return 0;let best=isM?-Infinity:Infinity;for(const i of e){const{board:nb,history:nh}=sm(b,h,p,i);const v=mmx(nb,nh,!isM,m,d+1,mD,a,bt);if(isM){best=Math.max(best,v);a=Math.max(a,v);}else{best=Math.min(best,v);bt=Math.min(bt,v);}if(bt<=a)break;}return best;}
function a4(b,h,m){const o=m==="X"?"O":"X";let w=fW(b,h,m);if(w!==null)return w;w=fW(b,h,o);if(w!==null)return w;const e=gE(b);let bs=-Infinity,bm=[];for(const i of e){const{board:nb,history:nh}=sm(b,h,m,i);const s=mmx(nb,nh,false,m,0,4,-Infinity,Infinity);if(s>bs){bs=s;bm=[i];}else if(s===bs)bm.push(i);}return bm[Math.floor(Math.random()*bm.length)];}
function a5(b,h,m){const o=m==="X"?"O":"X";let w=fW(b,h,m);if(w!==null)return w;w=fW(b,h,o);if(w!==null)return w;const e=gE(b);let best=e[0];const t0=performance.now();for(let d=2;d<=12;d++){if(performance.now()-t0>400)break;let bs=-Infinity,ca=e[0],to=false;for(const i of e){if(performance.now()-t0>400){to=true;break;}const{board:nb,history:nh}=sm(b,h,m,i);const s=mmx(nb,nh,false,m,0,d,-Infinity,Infinity);if(s>bs){bs=s;ca=i;}}if(!to){best=ca;if(bs>=900)break;}}return best;}
function getAI(lv,b,h,m){switch(lv){case 1:return aR(b);case 2:return a2(b,h,m);case 3:return a3(b,h,m);case 4:return a4(b,h,m);case 5:return a5(b,h,m);default:return aR(b);}}

// Evaluate all possible moves for practice mode, returns sorted [{idx,score}]
function evalMoves(b,h,m){const e=gE(b);const scored=e.map(i=>{const{board:nb,history:nh}=sm(b,h,m,i);const w=cW(nb);if(w?.winner===m)return{idx:i,score:9999};const opp=m==="X"?"O":"X";if(w?.winner===opp)return{idx:i,score:-9999};return{idx:i,score:mmx(nb,nh,false,m,0,6,-Infinity,Infinity)};});scored.sort((a,b)=>b.score-a.score);return scored;}
function gradeMove(chosen,ranked){if(!ranked.length)return"great";const best=ranked[0].score;const mine=ranked.find(r=>r.idx===chosen);if(!mine)return"bad";const diff=best-mine.score;if(diff===0)return"great";if(diff<=5)return"good";if(diff<=20)return"ok";if(diff<=100)return"bad";return"miss";}
const POS_NAMES=["1↖","2↑","3↗","4←","5◆","6→","7↙","8↓","9↘"];
const P=i=>POS_NAMES[i];

// Detect tactical patterns on board
function detectCtx(b,h,m,move,ranked){
  const opp=m==="O"?"X":"O";const r=[];
  // Check if this move wins
  const{board:nb}=sm(b,h,m,move);if(cW(nb)?.winner===m){r.push("win");return r;}
  // Check if opponent had a winning threat we needed to block
  const oppWin=fW(b,h,opp);if(oppWin!==null){r.push(move===oppWin?"block":"missBlock");return r;}
  // Check if this creates a fork (2+ winning threats)
  const{board:afterB,history:afterH}=sm(b,h,m,move);
  let threats=0;for(const[a,x,c]of WL){const cl=[afterB[a],afterB[x],afterB[c]];const mc=cl.filter(v=>v===m).length;const nc=cl.filter(v=>v===null).length;if(mc===2&&nc===1)threats++;}
  if(threats>=2)r.push("fork");
  // Center
  if(move===4&&!b[4])r.push("center");
  // Corner
  if([0,2,6,8].includes(move)&&!b[move])r.push("corner");
  // Edge (weaker)
  if([1,3,5,7].includes(move))r.push("edge");
  // Creates a line threat
  if(threats===1)r.push("threat");
  // About to lose a mark (vanish)
  if(h[m].length>=3)r.push("vanish");
  // Opponent's mark will vanish soon
  if(h[opp].length>=3)r.push("oppVanish");
  // Best move analysis
  if(ranked.length>0&&ranked[0].idx!==move){
    const bestI=ranked[0].idx;
    const{board:bestB,history:bestH}=sm(b,h,m,bestI);
    let bestThreats=0;for(const[a,x,c]of WL){const cl=[bestB[a],bestB[x],bestB[c]];const mc=cl.filter(v=>v===m).length;const nc=cl.filter(v=>v===null).length;if(mc===2&&nc===1)bestThreats++;}
    if(bestThreats>=2)r.push("bestWasFork");
    if(bestI===4)r.push("bestWasCenter");
    if(fW(bestB,bestH,m)!==null||cW(bestB)?.winner===m)r.push("bestWasWin");
  }
  return r;
}

function genComment(ctx,grade,move,bestIdx,lang){
  const ja=lang==="ja";const p=P(move);const bp=bestIdx!=null?P(bestIdx):"";
  // Winning move
  if(ctx.includes("win"))return ja?`${p}で三目揃って勝ち！完璧な一手だね`:`${p} completes three in a row! Perfect move`;
  // Missed block
  if(ctx.includes("missBlock"))return ja?`相手のリーチを見逃しちゃった！${bp}でブロックが必要だったよ`:`Missed opponent's winning threat! Should've blocked at ${bp}`;
  // Blocked opponent
  if(ctx.includes("block"))return ja?`ナイスブロック！${p}で相手のリーチを止めたね。これ逃すと負けてたよ`:`Nice block at ${p}! Opponent was about to win there`;
  // Great move
  if(grade==="great"){
    if(ctx.includes("fork"))return ja?`${p}で二方向のリーチを作った！相手は両方止められないから超有利だよ`:`${p} creates two threats at once! Opponent can't block both — dominant position`;
    if(ctx.includes("center"))return ja?`中央${p}は最強のマス。4つのラインに関わるから攻守ともに強い！`:`Center ${p} is the strongest square — it connects to 4 winning lines`;
    if(ctx.includes("corner"))return ja?`角${p}はいい選択！3つのラインに関わるし、中央の次に価値が高いよ`:`Corner ${p} is a strong choice — connects to 3 lines, second only to center`;
    if(ctx.includes("threat"))return ja?`${p}でリーチを作ったね！相手にプレッシャーをかけてるよ`:`${p} creates a winning threat — putting pressure on opponent`;
    if(ctx.includes("vanish"))return ja?`自分のマークが消える状況でもベストな${p}を選んだね！消えた後も有利なポジションだよ`:`Great ${p} even with a vanishing mark! Still holds a strong position after the swap`;
    return ja?`${p}は今の局面で最善手。盤面のバランスがいい位置だよ`:`${p} is the best move here — well-balanced board position`;
  }
  if(grade==="good"){
    if(ctx.includes("bestWasFork"))return ja?`${p}も悪くないけど、${bp}なら二方向リーチが作れてもっと有利だったよ`:`${p} is okay, but ${bp} would've created a double threat — much stronger`;
    if(ctx.includes("bestWasCenter")&&move!==4)return ja?`${p}より中央${bp}のほうが強かったかも。中央は攻守で最強のマスだよ`:`${p} is fine, but center ${bp} would've been stronger — it controls 4 lines`;
    return ja?`${p}もいいけど、${bp}のほうがちょっとだけ得だったよ`:`${p} works, but ${bp} was slightly better here`;
  }
  if(grade==="ok"){
    if(ctx.includes("edge"))return ja?`端の${p}は弱い手になりがち。2つのラインにしか関わらないからね。${bp}のほうが有利だったよ`:`Edge ${p} is often weak — only 2 lines. ${bp} was better here`;
    if(ctx.includes("bestWasFork"))return ja?`${bp}なら二方向リーチが作れた！2つの脅威を同時に作ると相手は止められないよ`:`${bp} would've created a fork! Two threats at once is usually game over`;
    return ja?`${p}は無難だけど攻めが弱いかも。${bp}のほうが展開が良くなるよ`:`${p} is safe but passive. ${bp} leads to a better position`;
  }
  if(grade==="bad"){
    if(ctx.includes("bestWasWin"))return ja?`${bp}で勝てたのに見逃しちゃった！自分のリーチを常にチェックしよう`:`Could've won at ${bp}! Always check for your own winning moves first`;
    if(ctx.includes("bestWasFork"))return ja?`${bp}で二方向リーチを作れたんだけどな…分岐を見つける練習をしよう`:`${bp} was a fork opportunity! Practice spotting double threats`;
    if(ctx.includes("edge"))return ja?`端${p}はもったいない！角や中央のほうがずっと強いよ`:`Edge ${p} wastes potential! Corners and center are much stronger`;
    return ja?`${bp}のほうがかなり良かったよ。相手の動きも考えて手を選ぼう`:`${bp} was significantly better. Try reading the opponent's next move too`;
  }
  // miss
  if(ctx.includes("bestWasWin"))return ja?`勝ちを逃しちゃった！${bp}で三目揃ったのに…まずリーチを探す癖をつけよう`:`Missed the win! ${bp} was three in a row. Always scan for your lines first`;
  return ja?`ここは${bp}がはるかに良かったよ。局面をよく見てみよう`:`${bp} was much better here. Take time to read the board carefully`;
}


function genCode(){const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let r="";for(let i=0;i<4;i++)r+=c[Math.floor(Math.random()*c.length)];return r;}
function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
const RK=c=>`ox-room:${c}`;
function gAE(id){return AVATARS.find(a=>a.id===id)?.emoji||"❓";}

const baseCss=`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes blindFade{0%{opacity:1}70%{opacity:1}100%{opacity:0}}@keyframes roastIn{0%{opacity:0}100%{opacity:1}}`;

// ---------- UI ----------
function Sq({value,onClick,highlight,fading,lastMove,T,blind,visible,hintDot}){
  const isC=T.id==="comic";const bg=highlight?T.sqHl:fading?T.sqFade:T.sqBg;
  const border=highlight?`2px solid ${T.accent}`:fading?`2px dashed ${T.textDim}`:T.sqBorder;
  const show=!blind||visible||highlight;
  return(<button onClick={onClick} style={{width:96,height:96,fontSize:isC?48:44,fontWeight:800,border,borderRadius:isC?12:2,background:bg,
    color:show?(value==="O"?T.O:value==="X"?T.X:"transparent"):"transparent",
    cursor:"pointer",transition:"color 0.3s, background 0.2s",fontFamily:T.fontTitle,opacity:fading?0.4:1,
    boxShadow:isC?(highlight?"0 0 16px "+T.accent:"4px 4px 0 #1e1b4b"):(lastMove&&!highlight?"inset 0 0 0 2px rgba(201,166,107,0.5)":"inset 0 1px 3px rgba(0,0,0,0.15)"),
    textShadow:isC?"2px 2px 0 rgba(0,0,0,0.2)":"none",position:"relative",
  }}
    onMouseEnter={e=>{if(!value)e.currentTarget.style.background=isC?"#fde68a":"rgba(180,140,80,0.3)";}}
    onMouseLeave={e=>{e.currentTarget.style.background=bg;}}>
    {value}
    {hintDot&&!value&&<span style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:10,height:10,borderRadius:5,background:T.accent,opacity:0.5}}/>}
  </button>);
}

function Toggle({checked,onChange,label,T}){
  return(<div onClick={onChange} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:T.text,userSelect:"none",fontFamily:T.fontBody}}>
    <div style={{width:40,height:22,borderRadius:11,padding:2,background:checked?T.toggleOn:T.toggleOff,transition:"background 0.2s",display:"flex",alignItems:"center",flexShrink:0,border:`1px solid ${T.cardBorder}`}}>
      <div style={{width:18,height:18,borderRadius:9,background:T.toggleKnob,transition:"transform 0.2s",transform:checked?"translateX(18px)":"translateX(0)"}}/>
    </div>{label}
  </div>);
}
function RB({rankIdx,t,small,T}){const name=t.rankNames[Math.min(rankIdx,20)];const isDan=rankIdx>=10;const isGod=rankIdx>=20;
  const color=isGod?"#e879f9":isDan?T.accent:T.text;
  return(<div style={{display:"inline-flex",background:T.cardBg,border:`1px solid ${isGod?"#e879f9":T.textDim}44`,borderRadius:20,padding:small?"3px 10px":"5px 14px",boxShadow:isGod?"0 0 12px rgba(232,121,249,0.3)":"none"}}>
    <span style={{fontSize:small?11:14,fontWeight:800,color,fontFamily:T.fontTitle}}>{name}</span>
  </div>);}

function AP({selected,onSelect,label,rankIdx,lockLabel,eliteLockLabel,legendLockLabel,godLockLabel,T}){
  const isDan=rankIdx>=10;const isElite=rankIdx>=14;const isLeg=rankIdx>=17;const isGod=rankIdx>=20;
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
    <div style={{fontSize:13,fontWeight:700,color:T.text,fontFamily:T.fontBody}}>{label}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4, 46px)",gap:5}}>
      {AVATARS.map(a=>{const lk=a.god?!isGod:a.legend?!isLeg:a.elite?!isElite:a.monster?!isDan:false;const sS=lk&&a.elite;const sH=lk&&(a.legend||a.god);
        return(<button key={a.id} onClick={()=>!lk&&onSelect(a.id)} style={{width:46,height:46,fontSize:24,borderRadius:8,
          border:selected===a.id?`2px solid ${T.accent}`:`1px solid ${lk?"rgba(80,50,25,0.3)":T.cardBorder}`,
          background:selected===a.id?T.cardBg:lk?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.15)",
          cursor:lk?"not-allowed":"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center",
          opacity:lk&&!sS&&!sH?0.35:1,position:"relative",
          boxShadow:!lk&&a.god?"0 0 14px rgba(232,121,249,0.5)":"none",
        }}>{sH?<span style={{fontSize:20,fontWeight:800,color:a.god?"#e879f9":T.textDim}}>❓</span>:sS?<span style={{fontSize:24,filter:"brightness(0)",opacity:0.5}}>{a.emoji}</span>:a.emoji}
          {lk&&!sH&&<span style={{position:"absolute",bottom:1,right:1,fontSize:9}}>🔒</span>}
        </button>);})}
    </div>
    {!isDan&&<div style={{fontSize:10,color:T.textFaint}}>{lockLabel}</div>}
    {isDan&&!isElite&&<div style={{fontSize:10,color:T.accent}}>{eliteLockLabel}</div>}
    {isElite&&!isLeg&&<div style={{fontSize:10,color:T.textDim}}>{legendLockLabel}</div>}
    {isLeg&&!isGod&&<div style={{fontSize:10,color:"#e879f9"}}>{godLockLabel}</div>}
  </div>);
}

function SetM({t,T,showHint,setShowHint,lang,setLang,muted,setMuted,theme,setTheme,blind,setBlind,onRR,onClose}){
  const[cr,setCr]=useState(false);const isC=T.id==="comic";
  return(<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:isC?"linear-gradient(135deg,#312e81,#1e1b4b)":T.cardBg,border:T.cardBorder,borderRadius:isC?16:12,padding:"24px 28px",width:280,display:"flex",flexDirection:"column",gap:14,boxShadow:isC?"6px 6px 0 #0f0a2a":"0 20px 60px rgba(0,0,0,0.5)"}}>
      <div style={{fontSize:18,fontWeight:800,textAlign:"center",color:T.light,fontFamily:T.fontTitle}}>{t.settings}</div>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        <Toggle checked={showHint} onChange={()=>setShowHint(!showHint)} label={t.hintLabel} T={T}/>
        <Toggle checked={blind} onChange={()=>setBlind(!blind)} label={t.blindLabel+" 🙈"} T={T}/>
        <Toggle checked={muted} onChange={()=>setMuted(!muted)} label={t.muteLabel} T={T}/>
        <Toggle checked={lang==="en"} onChange={()=>setLang(l=>l==="ja"?"en":"ja")} label={t.langLabel} T={T}/>
        <Toggle checked={theme==="comic"} onChange={()=>setTheme(theme==="wood"?"comic":"wood")} label={t.themeLabel+(theme==="wood"?" 🪵":" 💥")} T={T}/>
      </div>
      <div style={{borderTop:`1px solid ${T.textFaint}33`,paddingTop:10}}>
        {!cr?<button onClick={()=>setCr(true)} style={{padding:"7px 0",fontSize:12,fontWeight:700,border:"1px solid rgba(180,80,80,0.4)",borderRadius:8,background:"transparent",color:"#c0908a",width:"100%",cursor:"pointer",fontFamily:T.fontBody}}>{t.resetRank}</button>
        :<div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
          <div style={{fontSize:12,color:"#c0908a",fontFamily:T.fontBody}}>{t.resetConfirm}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{onRR();setCr(false);}} style={{padding:"6px 20px",fontSize:12,fontWeight:700,border:"none",borderRadius:6,background:"#8b4040",color:"#fff",cursor:"pointer"}}>{t.yes}</button>
            <button onClick={()=>setCr(false)} style={{padding:"6px 20px",fontSize:12,fontWeight:700,border:`1px solid ${T.btnGhostBorder}`,borderRadius:6,background:"transparent",color:T.btnGhostColor,cursor:"pointer"}}>{t.no}</button>
          </div></div>}
      </div>
      <button onClick={onClose} style={{padding:"9px 0",fontSize:14,fontWeight:700,border:`1px solid ${T.btnGhostBorder}`,borderRadius:8,background:"transparent",color:T.btnGhostColor,cursor:"pointer",fontFamily:T.fontBody,width:"100%"}}>{t.close}</button>
    </div>
  </div>);
}

function RUO({rankIdx,t,T,onClose}){const isDan=rankIdx>=10;const isC=T.id==="comic";const isGod=rankIdx>=20;
  return(<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:isC?"linear-gradient(135deg,#312e81,#1e1b4b)":T.cardBg,border:`3px solid ${isGod?"#e879f9":T.accent}`,borderRadius:isC?20:16,padding:"32px 40px",display:"flex",flexDirection:"column",alignItems:"center",gap:16,boxShadow:isGod?"0 0 80px rgba(232,121,249,0.5)":`0 0 60px ${T.accent}40`}}>
      <div style={{fontSize:isC?32:26,fontWeight:800,fontFamily:T.fontTitle,color:isGod?"#e879f9":T.light}}>{isDan?t.rankUpDan:t.rankUp}!</div>
      <RB rankIdx={rankIdx} t={t} T={T}/>
      {isGod&&<div style={{fontSize:36}}>✨</div>}
      <button onClick={onClose} style={{marginTop:8,padding:"10px 32px",fontSize:14,fontWeight:700,border:"none",borderRadius:8,background:isGod?"linear-gradient(135deg,#e879f9,#a855f7)":T.btnPrimBg,color:isGod?"#fff":T.btnPrimColor,cursor:"pointer",fontFamily:T.fontBody}}>{t.close}</button>
    </div>
  </div>);
}

function RPB({snapshots,t,T,onClose}){const[step,setStep]=useState(snapshots.length-1);const snap=snapshots[step];const total=snapshots.length-1;const isEnd=step===total;const wR=cW(snap.board);const isC=T.id==="comic";
  return(<div style={{position:"fixed",inset:0,zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{fontSize:18,fontWeight:800,color:T.light,fontFamily:T.fontTitle}}>{t.replay}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3, 80px)",gap:3,background:T.boardBg,padding:3,borderRadius:isC?10:4,border:T.boardBorder}}>
        {snap.board.map((v,i)=>{const hl=wR?.line?.includes(i)&&isEnd;return(<div key={i} style={{width:80,height:80,fontSize:34,fontWeight:800,borderRadius:isC?8:2,border:hl?`2px solid ${T.accent}`:`1px solid ${T.sqBorder}`,background:hl?T.sqHl:T.sqBg,color:v==="O"?T.O:v==="X"?T.X:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.fontTitle}}>{v}</div>);})}
      </div>
      <div style={{fontSize:13,color:T.text,fontFamily:T.fontTitle}}>{isEnd?t.replayEnd:step===0?"Start":t.replayStep(step,total)}</div>
      <div style={{display:"flex",gap:6}}>{[["⏮",()=>setStep(0),step===0],["◀",()=>setStep(Math.max(0,step-1)),step===0],["▶",()=>setStep(Math.min(total,step+1)),isEnd],["⏭",()=>setStep(total),isEnd]].map(([l,fn,dis],i)=>(
        <button key={i} onClick={fn} disabled={dis} style={{padding:"6px 12px",fontSize:16,fontWeight:700,border:`1px solid ${T.btnGhostBorder}`,borderRadius:6,background:"transparent",color:T.btnGhostColor,cursor:dis?"default":"pointer",opacity:dis?0.3:1}}>{l}</button>
      ))}</div>
      <button onClick={onClose} style={{padding:"8px 24px",fontSize:13,fontWeight:700,border:`1px solid ${T.btnGhostBorder}`,borderRadius:6,background:"transparent",color:T.btnGhostColor,cursor:"pointer"}}>{t.close}</button>
    </div>
  </div>);
}

// ---------- Ranking Page ----------
function RankingPage({t,T,rI,playerName,setPlayerName,onBack}){
  const[list,setList]=useState([]);const[loading,setLoading]=useState(true);const[nameInput,setNameInput]=useState(playerName);
  const isC=T.id==="comic";
  useEffect(()=>{(async()=>{try{const r=await window.storage.list("ox-lb:",true);const items=[];for(const k of (r?.keys||[])){try{const v=await window.storage.get(k,true);if(v?.value)items.push(JSON.parse(v.value));}catch(e){}}items.sort((a,b)=>b.rankIdx-a.rankIdx||(b.wins||0)-(a.wins||0));setList(items);}catch(e){}setLoading(false);})();},[]);
  async function registerScore(){if(!nameInput.trim())return;const data={name:nameInput.trim(),rankIdx:rI,ts:Date.now()};
    try{await window.storage.set("ox-lb:"+nameInput.trim(),JSON.stringify(data),true);setPlayerName(nameInput.trim());setList(prev=>{const f=prev.filter(x=>x.name!==nameInput.trim());return[...f,data].sort((a,b)=>b.rankIdx-a.rankIdx);});}catch(e){}}
  const rNames=t.rankNames;
  return(
    <div className="theme-bg"><style>{baseCss}{T.css}</style><div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh",fontFamily:T.fontBody,gap:18}}>
      <div style={{fontSize:24,fontWeight:800,color:T.light,fontFamily:T.fontTitle}}>{t.rankingTitle}</div>
      <div style={{display:"flex",gap:6,width:260}}>
        <input value={nameInput} onChange={e=>setNameInput(e.target.value)} placeholder={t.registerName} maxLength={12} style={{flex:1,padding:"8px 12px",fontSize:14,fontWeight:600,borderRadius:isC?10:6,border:isC?`3px solid ${T.text}`:`1px solid ${T.cardBorder}`,background:"rgba(0,0,0,0.3)",color:T.light,fontFamily:T.fontBody}}/>
        <button onClick={registerScore} style={{padding:"8px 16px",fontSize:13,fontWeight:700,borderRadius:isC?10:8,border:isC?`3px solid ${T.dark}`:`1px solid ${T.btnPrimBorder}`,background:T.btnPrimBg,color:T.btnPrimColor,cursor:"pointer",fontFamily:T.fontBody,boxShadow:isC?"3px 3px 0 "+T.dark:"none"}}>{t.register}</button>
      </div>
      <div style={{width:280,maxHeight:360,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
        {loading?<div style={{color:T.textDim,textAlign:"center"}}>...</div>
        :list.length===0?<div style={{color:T.textDim,textAlign:"center",fontSize:13}}>{t.noData}</div>
        :list.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,background:i===0?"rgba(201,166,107,0.15)":"rgba(0,0,0,0.15)",border:`1px solid ${i===0?T.accent+"44":T.cardBorder}`}}>
            <span style={{fontSize:14,fontWeight:800,color:i<3?T.accent:T.textDim,width:24,textAlign:"right",fontFamily:T.fontTitle}}>{i+1}</span>
            <span style={{flex:1,fontSize:13,fontWeight:700,color:T.light,fontFamily:T.fontBody}}>{item.name}{item.name===playerName?<span style={{color:T.textDim,fontSize:11}}> {t.you}</span>:""}</span>
            <span style={{fontSize:12,fontWeight:800,color:item.rankIdx>=20?"#e879f9":item.rankIdx>=10?T.accent:T.text,fontFamily:T.fontTitle}}>{rNames[Math.min(item.rankIdx,20)]}</span>
          </div>
        ))}
      </div>
      <button onClick={onBack} style={{padding:"10px 28px",fontSize:14,fontWeight:700,borderRadius:isC?10:8,border:isC?`3px solid ${T.text}`:`1px solid ${T.btnGhostBorder}`,background:"transparent",color:T.btnGhostColor,cursor:"pointer",fontFamily:T.fontBody,boxShadow:isC?"3px 3px 0 rgba(0,0,0,0.2)":"none"}}>{t.backMenu}</button>
    </div></div>
  );
}

// ---------- Main App ----------
export default function OXGame(){
  const[lang,setLang]=useState("ja");const t=LANG[lang];
  const[theme,setTheme]=useState("wood");const T=THEMES[theme];
  const[mode,setMode]=useState(null);const[aiLv,setAiLv]=useState(3);const[turnOrd,setTurnOrd]=useState("first");const[pMark,setPMark]=useState("O");
  const[showHint,setSH]=useState(true);const[muted,setMuted]=useState(false);const[blind,setBlind]=useState(false);
  const[sOpen,setSOpen]=useState(false);
  const[board,setBoard]=useState(Array(9).fill(null));const[isON,setIsON]=useState(true);
  const[score,setScore]=useState({O:0,X:0});const[hist,setHist]=useState({X:[],O:[]});
  const[gO,setGO]=useState(false);const[think,setThink]=useState(false);
  const[rI,setRI]=useState(0);const[stk,setStk]=useState(0);
  const[showRU,setShowRU]=useState(false);const[rL,setRLd]=useState(false);
  const[rC,setRC]=useState("");const[jC,setJC]=useState("");
  const[pId]=useState(()=>genId());const[mM,setMM]=useState("O");
  const[oMsg,setOMsg]=useState("");const[cop,setCop]=useState(false);
  const[mA,setMA]=useState("dog");const[oA,setOA]=useState(null);
  const[playerName,setPN]=useState("");
  const pR=useRef(null);const rR=useRef(null);
  const[snaps,setSnaps]=useState([{board:Array(9).fill(null),history:{X:[],O:[]}}]);
  const[sRP,setSRP]=useState(false);
  // Practice mode state
  const[advice,setAdvice]=useState(null); // {grade,bestIdx,tip}
  const[showBestHint,setShowBestHint]=useState(true); // show dots on good squares
  const[bestMoves,setBestMoves]=useState([]); // indices of top moves
  const[roast,setRoast]=useState(null);
  // Blind mode visibility: tracks which cells are currently visible
  const[visible,setVisible]=useState(Array(9).fill(false));
  const blindTimers=useRef({});

  function addS(b,h){setSnaps(p=>[...p,{board:[...b],history:{X:[...h.X],O:[...h.O]}}]);}
  function showCell(idx){
    setVisible(v=>{const n=[...v];n[idx]=true;return n;});
    if(blindTimers.current[idx])clearTimeout(blindTimers.current[idx]);
    blindTimers.current[idx]=setTimeout(()=>{setVisible(v=>{const n=[...v];n[idx]=false;return n;});},1000);
  }

  useEffect(()=>{(async()=>{try{const r=await window.storage.get("ox-rank");if(r?.value){const d=JSON.parse(r.value);setRI(d.rankIdx||0);setStk(d.streak||0);}}catch(e){}try{const r=await window.storage.get("ox-avatar");if(r?.value)setMA(r.value);}catch(e){}try{const r=await window.storage.get("ox-theme");if(r?.value&&THEMES[r.value])setTheme(r.value);}catch(e){}try{const r=await window.storage.get("ox-name");if(r?.value)setPN(r.value);}catch(e){}setRLd(true);})();},[]);
  useEffect(()=>{if(!rL)return;(async()=>{try{await window.storage.set("ox-rank",JSON.stringify({rankIdx:rI,streak:stk}));}catch(e){}})();},[rI,stk,rL]);
  useEffect(()=>{(async()=>{try{await window.storage.set("ox-avatar",mA);}catch(e){}})();},[mA]);
  useEffect(()=>{(async()=>{try{await window.storage.set("ox-theme",theme);}catch(e){}})();},[theme]);
  useEffect(()=>{(async()=>{try{await window.storage.set("ox-name",playerName);}catch(e){}})();},[playerName]);
  useEffect(()=>{MU=muted;},[muted]);
  useEffect(()=>{return()=>{if(pR.current)clearInterval(pR.current);Object.values(blindTimers.current).forEach(clearTimeout);};},[]);

  const cpuM=pMark==="O"?"X":"O";
  const res=cW(board);const winner=res?.winner;const wLine=res?.line||[];
  const cP=isON?"O":"X";
  const fI=showHint&&!gO&&!winner&&hist[cP].length>=3?hist[cP][0]:null;
  const isCT=(mode==="cpu"||mode==="practice")&&cP===cpuM&&!winner&&!gO;
  const lM=hist[isON?"X":"O"]?.slice(-1)[0]??null;

  function hWR(wm){setScore(s=>({...s,[wm]:s[wm]+1}));setGO(true);
    setVisible(Array(9).fill(true));Object.values(blindTimers.current).forEach(clearTimeout);
    if(mode==="cpu"&&wm===pMark){
      const q=qualifies(rI,aiLv,showHint,blind);const ns=q?stk+1:stk;if(q)setStk(ns);
      if(chkP(rI,aiLv,showHint,blind,ns)){const nr=rI+1;setTimeout(()=>{setRI(nr);setStk(0);setShowRU(true);if(nr>=10)sDUp();else sRUp();},800);}
      setTimeout(()=>sW(),200);
    }else if(mode==="cpu"&&wm===cpuM){
      if(qualifies(rI,aiLv,showHint,blind))setStk(0);
      setTimeout(()=>sL(),200);
      setRoast(t.roasts[Math.floor(Math.random()*t.roasts.length)]);
    }else if(mode==="practice"){
      setTimeout(()=>{if(wm===pMark)sW();else{sL();setRoast(t.roasts[Math.floor(Math.random()*t.roasts.length)]);}},200);
    }else if(mode==="online"){setTimeout(()=>{if(wm===mM)sW();else sL();},200);
    }else{setTimeout(()=>sW(),200);}}

  // Compute hints for practice mode
  useEffect(()=>{
    if(mode!=="practice"||gO||winner||cP===cpuM)return;
    const ranked=evalMoves(board,hist,pMark);
    if(ranked.length>0){const topScore=ranked[0].score;setBestMoves(ranked.filter(r=>r.score>=topScore-5).map(r=>r.idx));}else{setBestMoves([]);}
  },[board,mode,gO,winner,cP,cpuM,pMark,hist]);

  const doAI=useCallback(()=>{if(!isCT)return;setThink(true);setAdvice(null);setTimeout(async()=>{await ensA();const lv=mode==="practice"?3:aiLv;const mv=getAI(lv,board,hist,cpuM);
    if(mv==null){setThink(false);return;}
    // Pre-compute commentary for CPU move in practice
    let cpuComment=null;
    if(mode==="practice"){const ranked=evalMoves(board,hist,cpuM);const ctx=detectCtx(board,hist,cpuM,mv,ranked);cpuComment=genComment(ctx,"great",mv,null,lang);}
    const next=[...board];const nh={X:[...hist.X],O:[...hist.O]};const hv=nh[cpuM].length>=3;if(hv){next[nh[cpuM].shift()]=null;}next[mv]=cpuM;nh[cpuM].push(mv);if(hv)sV();setTimeout(()=>sP(cpuM),hv?80:0);setBoard(next);setHist(nh);setIsON(cpuM==="X");setThink(false);addS(next,nh);if(blind)showCell(mv);
    if(cpuComment)setAdvice({grade:"cpu",msg:lang==="ja"?"🤖 CPUの手":"🤖 CPU's move",comment:cpuComment,bestIdx:null});
    const r=cW(next);if(r?.winner)hWR(r.winner);},350);},[isCT,aiLv,board,hist,rI,stk,showHint,blind,cpuM,mode,lang]);
  useEffect(()=>{doAI();},[doAI]);

  // Online
  async function createR(){const code=genCode();setRC(code);const room={host:pId,guest:null,board:Array(9).fill(null),history:{X:[],O:[]},isONext:true,gameOver:false,winner:null,ts:Date.now(),round:0,hostAvatar:mA,guestAvatar:null};try{await window.storage.set(RK(code),JSON.stringify(room),true);}catch(e){}rR.current=room;setMM("O");setMode("online-create");setOA(null);stPl(code,"O");}
  async function joinR(){const code=jC.toUpperCase().trim();if(!code)return;try{const r=await window.storage.get(RK(code),true);if(!r?.value){setOMsg(t.roomNotFound);return;}const room=JSON.parse(r.value);if(room.guest&&room.guest!==pId){setOMsg(t.roomFull);return;}room.guest=pId;room.guestAvatar=mA;room.ts=Date.now();await window.storage.set(RK(code),JSON.stringify(room),true);rR.current=room;setRC(code);setMM("X");setBoard(room.board);setHist(room.history);setIsON(room.isONext);setGO(room.gameOver);setOA(room.hostAvatar);setMode("online");stPl(code,"X");}catch(e){setOMsg(t.roomNotFound);}}
  function stPl(code,mark){if(pR.current)clearInterval(pR.current);pR.current=setInterval(async()=>{try{const r=await window.storage.get(RK(code),true);if(!r?.value)return;const room=JSON.parse(r.value);rR.current=room;if(mark==="O"&&room.guest){setMode(m=>m==="online-create"?"online":m);if(room.guestAvatar)setOA(room.guestAvatar);}if(mark==="X"&&room.hostAvatar)setOA(room.hostAvatar);setBoard(room.board);setHist(room.history);setIsON(room.isONext);if(room.gameOver&&room.winner){setGO(true);setScore(s=>({...s,[room.winner]:s[room.winner]+1}));}}catch(e){}},1500);}
  async function olP(i){const room=rR.current;if(!room)return;const cp=room.isONext?"O":"X";if(cp!==mM||room.board[i]||room.gameOver)return;await ensA();const next=[...room.board];const nh={X:[...room.history.X],O:[...room.history.O]};const hv=nh[mM].length>=3;if(hv){next[nh[mM].shift()]=null;}next[i]=mM;nh[mM].push(i);if(hv)sV();setTimeout(()=>sP(mM),hv?80:0);const r=cW(next);const u={...room,board:next,history:nh,isONext:!room.isONext,ts:Date.now()};if(r?.winner){u.gameOver=true;u.winner=r.winner;}try{await window.storage.set(RK(rC),JSON.stringify(u),true);}catch(e){}rR.current=u;setBoard(next);setHist(nh);setIsON(!room.isONext);addS(next,nh);if(r?.winner)hWR(r.winner);}
  async function olRst(){const room=rR.current;if(!room)return;const u={...room,board:Array(9).fill(null),history:{X:[],O:[]},isONext:true,gameOver:false,winner:null,round:(room.round||0)+1,ts:Date.now()};try{await window.storage.set(RK(rC),JSON.stringify(u),true);}catch(e){}rR.current=u;setBoard(u.board);setHist(u.history);setIsON(true);setGO(false);setSnaps([{board:Array(9).fill(null),history:{X:[],O:[]}}]);}
  function leaveOl(){if(pR.current)clearInterval(pR.current);pR.current=null;rR.current=null;setMode(null);setRC("");setJC("");setOMsg("");setOA(null);setBoard(Array(9).fill(null));setHist({X:[],O:[]});setIsON(true);setGO(false);setScore({O:0,X:0});setSnaps([{board:Array(9).fill(null),history:{X:[],O:[]}}]);}

  function hClick(i){if(mode==="online"){olP(i);return;}if(board[i]||winner||gO||think)return;if((mode==="cpu"||mode==="practice")&&cP===cpuM)return;
    // Practice mode: evaluate before placing
    let practiceGrade=null;let practiceBest=null;let practiceCtx=null;
    if(mode==="practice"){
      const ranked=evalMoves(board,hist,pMark);
      practiceGrade=gradeMove(i,ranked);
      if(ranked.length>0&&ranked[0].idx!==i)practiceBest=ranked[0].idx;
      practiceCtx=detectCtx(board,hist,pMark,i,ranked);
    }
    ensA().then(()=>{const next=[...board];const nh={X:[...hist.X],O:[...hist.O]};const p=cP;const hv=nh[p].length>=3;if(hv){next[nh[p].shift()]=null;}next[i]=p;nh[p].push(i);if(hv)sV();setTimeout(()=>sP(p),hv?80:0);setBoard(next);setHist(nh);setIsON(!isON);addS(next,nh);if(blind)showCell(i);
      if(mode==="practice"&&practiceGrade){
        const advKey={great:"advGreat",good:"advGood",ok:"advOk",bad:"advBad",miss:"advMiss"}[practiceGrade];
        const comment=genComment(practiceCtx,practiceGrade,i,practiceBest,lang);
        setAdvice({grade:practiceGrade,msg:t[advKey],comment,bestIdx:practiceBest});
        setBestMoves([]);
      }
      const r=cW(next);if(r?.winner)hWR(r.winner);});}

  function reset(){setBoard(Array(9).fill(null));setHist({X:[],O:[]});setIsON(true);setGO(false);setThink(false);setSnaps([{board:Array(9).fill(null),history:{X:[],O:[]}}]);setVisible(Array(9).fill(false));Object.values(blindTimers.current).forEach(clearTimeout);setAdvice(null);setBestMoves([]);setRoast(null);}
  function bMenu(){if(mode==="online"){leaveOl();return;}reset();setScore({O:0,X:0});setMode(null);}
  function rRank(){setRI(0);setStk(0);const av=AVATARS.find(a=>a.id===mA);if(av?.monster||av?.elite||av?.legend||av?.god)setMA("dog");}

  const isC=T.id==="comic";
  const lvC=isC?["","#86efac","#a3e635","#fbbf24","#fb923c","#ef4444"]:["",T.text,T.text,T.accent,T.accent,T.light];
  const sM=sOpen&&<SetM t={t} T={T} showHint={showHint} setShowHint={setSH} lang={lang} setLang={setLang} muted={muted} setMuted={setMuted} theme={theme} setTheme={setTheme} blind={blind} setBlind={setBlind} onRR={rRank} onClose={()=>setSOpen(false)}/>;
  const ruO=showRU&&<RUO rankIdx={rI} t={t} T={T} onClose={()=>setShowRU(false)}/>;
  const gear=<button onClick={()=>setSOpen(true)} style={{position:"absolute",top:16,right:16,width:38,height:38,borderRadius:isC?10:8,border:isC?`3px solid ${T.text}`:`1px solid ${T.cardBorder}`,background:isC?"rgba(30,10,60,0.8)":T.cardBg,color:T.textDim,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{"\u2699"}</button>;
  const rn=getRS(rI);const sSP=rI>=9&&rI<20;
  const Btn=({children,primary,style:s,...p})=>(<button {...p} style={{padding:"10px 22px",fontSize:14,fontWeight:700,borderRadius:isC?10:8,cursor:"pointer",fontFamily:T.fontBody,transition:"all 0.2s",...(primary?{background:T.btnPrimBg,color:T.btnPrimColor,border:isC?`3px solid ${T.dark}`:T.btnPrimBorder,boxShadow:isC?"4px 4px 0 "+T.dark:"none"}:{background:"transparent",color:T.btnGhostColor,border:isC?`3px solid ${T.text}`:`1px solid ${T.btnGhostBorder}`,boxShadow:isC?"3px 3px 0 rgba(0,0,0,0.2)":"none"}),...s}}>{children}</button>);
  const Title=({size})=>(<h1 style={{fontSize:size||40,fontWeight:800,margin:0,letterSpacing:isC?4:6,fontFamily:T.fontTitle,color:T.light,textShadow:isC?"3px 3px 0 rgba(0,0,0,0.3)":"0 2px 8px rgba(0,0,0,0.4)"}}>{T.titleJa(T)} {lang==="ja"?t.title:"Tic Tac Toe"}</h1>);
  const Wrap=({children,gap})=>(<div className="theme-bg"><style>{baseCss}{T.css}</style><div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,minHeight:"100vh",fontFamily:T.fontBody,gap:gap||22}}>{children}</div></div>);

  // ========== RANKING ==========
  if(mode==="ranking")return <RankingPage t={t} T={T} rI={rI} playerName={playerName} setPlayerName={setPN} onBack={()=>setMode(null)}/>;

  // ========== MENU ==========
  if(mode===null){return(<Wrap>
    {gear}{sM}{ruO}
    <div style={{textAlign:"center",animation:"fadeIn 0.6s ease"}}><Title/><div style={{fontSize:11,color:T.subColor||T.textFaint,fontFamily:T.fontTitle,marginTop:4,letterSpacing:3}}>{T.sub}</div></div>
    <div style={{display:"flex",alignItems:"center",gap:12,animation:"fadeIn 0.6s ease 0.1s both"}}>
      <RB rankIdx={rI} t={t} T={T}/><div style={{fontSize:10,color:T.textFaint}}>{t.nextReq}: <span style={{color:T.textDim}}>{getPR(rI,t)}</span></div>
    </div>
    {sSP&&<div style={{fontSize:10,color:T.accent,marginTop:-14}}>{t.streakProgress(stk,rn)}</div>}
    <div style={{display:"flex",flexDirection:"column",gap:10,width:260,animation:"fadeIn 0.6s ease 0.2s both"}}>
      <Btn primary onClick={()=>setMode("pvp")} style={{padding:"14px 0",fontSize:17,width:"100%"}}>{t.pvp}</Btn>
      <Btn onClick={()=>{setPMark("O");setMode("practice");}} style={{padding:"12px 0",fontSize:15,width:"100%"}}>{t.practice}</Btn>
      <div className={isC?"comic-card":""} style={{background:isC?"linear-gradient(135deg,rgba(30,10,60,0.9),rgba(20,5,40,0.95))":T.cardBg,border:isC?undefined:`1px solid ${T.cardBorder}`,borderRadius:12,padding:"16px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <div style={{fontSize:15,fontWeight:700,color:T.light,fontFamily:T.fontTitle}}>{t.cpuBattle}</div>
        <div style={{display:"flex",gap:5}}>
          {[1,2,3,4,5].map(lv=>(<button key={lv} onClick={()=>setAiLv(lv)} style={{width:42,height:42,fontSize:16,fontWeight:800,borderRadius:isC?8:6,border:aiLv===lv?`2px solid ${lvC[lv]}`:`1px solid ${T.cardBorder}`,background:aiLv===lv?"rgba(180,140,80,0.15)":"transparent",color:aiLv===lv?lvC[lv]:T.textFaint,cursor:"pointer",fontFamily:T.fontBody}}>{lv}</button>))}
        </div>
        <div style={{fontSize:13,fontWeight:700,color:lvC[aiLv],minHeight:20}}>{t.lvLabels[aiLv]}</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:T.textDim,fontFamily:T.fontBody}}>{t.turnOrder}:</span>
          {[["first",t.first],["second",t.second],["random",t.random]].map(([k,lb])=>(<button key={k} onClick={()=>setTurnOrd(k)} style={{padding:"4px 10px",fontSize:12,fontWeight:700,borderRadius:6,border:turnOrd===k?`2px solid ${T.accent}`:`1px solid ${T.cardBorder}`,background:turnOrd===k?"rgba(180,140,80,0.15)":"transparent",color:turnOrd===k?T.accent:T.textFaint,cursor:"pointer",fontFamily:T.fontBody}}>{lb}</button>))}
        </div>
        <Btn primary onClick={()=>{const m=turnOrd==="first"?"O":turnOrd==="second"?"X":Math.random()<0.5?"O":"X";setPMark(m);setMode("cpu");}} style={{padding:"10px 0",width:"100%"}}>{t.start}</Btn>
      </div>
      <Btn onClick={()=>setMode("online-lobby")} style={{padding:"14px 0",fontSize:17,width:"100%"}}>{t.online}</Btn>
      <Btn onClick={()=>setMode("ranking")} style={{padding:"12px 0",fontSize:15,width:"100%"}}>{t.ranking}</Btn>
    </div>
    <div style={{fontSize:10,color:T.textFaint,marginTop:4}}>{t.desc}</div>
  </Wrap>);}

  // ========== ONLINE LOBBY ==========
  if(mode==="online-lobby"){return(<Wrap>
    {gear}{sM}<Title size={28}/><div style={{fontSize:13,color:T.textDim,fontFamily:T.fontTitle}}>{t.online}</div>
    <AP selected={mA} onSelect={setMA} label={t.chooseAvatar} rankIdx={rI} lockLabel={t.monsterLock} eliteLockLabel={t.eliteLock} legendLockLabel={t.legendLock} godLockLabel={t.godLock} T={T}/>
    <div style={{display:"flex",flexDirection:"column",gap:10,width:260}}>
      <Btn primary onClick={createR} style={{padding:"14px 0",fontSize:16,width:"100%"}}>{t.createRoom}</Btn>
      <div style={{display:"flex",gap:6,width:"100%"}}>
        <input value={jC} onChange={e=>setJC(e.target.value.toUpperCase())} placeholder={t.roomCode} maxLength={4} style={{flex:1,padding:"10px 12px",fontSize:15,fontWeight:700,borderRadius:isC?10:6,border:isC?`3px solid ${T.text}`:`1px solid ${T.cardBorder}`,background:"rgba(0,0,0,0.3)",color:T.light,textAlign:"center",letterSpacing:4,fontFamily:"monospace"}}/>
        <Btn primary onClick={joinR} style={{padding:"10px 20px",fontSize:15}}>{t.join}</Btn>
      </div>
      {oMsg&&<div style={{fontSize:12,color:"#fca5a5",textAlign:"center"}}>{oMsg}</div>}
    </div>
    <Btn onClick={()=>{setMode(null);setOMsg("");}}>{t.backMenu}</Btn>
  </Wrap>);}

  // ========== ONLINE WAIT ==========
  if(mode==="online-create"){return(<Wrap gap={20}>
    {gear}{sM}<Title size={26}/><div style={{fontSize:48}}>{gAE(mA)}</div>
    <div style={{fontSize:14,color:T.textDim}}>{t.waiting}</div>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{fontSize:28,fontWeight:800,letterSpacing:8,fontFamily:"monospace",color:T.light,background:T.cardBg,padding:"10px 22px",borderRadius:10,border:`1px solid ${T.cardBorder}`}}>{rC}</div>
      <Btn onClick={async()=>{try{await navigator.clipboard.writeText(rC);setCop(true);setTimeout(()=>setCop(false),1500);}catch(e){}}} style={{padding:"10px 14px",fontSize:12}}>{cop?t.copied:t.copyCode}</Btn>
    </div>
    <div style={{fontSize:12,color:T.textFaint}}>{t.shareCode}</div>
    <div style={{fontSize:22,color:T.textDim}}><span style={{animation:"pulse 1.5s infinite"}}>●</span>{" "}<span style={{animation:"pulse 1.5s infinite 0.3s"}}>●</span>{" "}<span style={{animation:"pulse 1.5s infinite 0.6s"}}>●</span></div>
    <Btn onClick={leaveOl}>{t.cancel}</Btn>
  </Wrap>);}

  // ========== GAME ==========
  const isOl=mode==="online";const myT=isOl?(cP===mM):true;
  const isCpuLike=mode==="cpu"||mode==="practice";
  const status=winner?isOl?winner===mM?t.youWin:t.youLose:isCpuLike?winner===pMark?t.winPlayer:t.winCpu:t.winMark(winner):think?t.thinking:isOl?myT?(mM==="O"?t.yourTurn:t.turnMark("X")):t.opponentTurn:isCpuLike?t.yourTurn:t.turnMark(cP);
  const mInfo=!winner&&!think&&!isOl&&hist[cP].length>=3?showHint?t.vanishWarn(isCpuLike&&cP===pMark?t.youWho:cP):t.vanishWarnGeneric:!winner&&!think&&isOl&&myT&&hist[mM].length>=3?showHint?t.vanishWarn(t.youWho):t.vanishWarnGeneric:!winner&&!think&&!isOl?t.remaining(3-hist[cP].length):!winner&&!think&&isOl&&myT?t.remaining(3-hist[mM].length):"";

  return(<Wrap gap={12}>
    {gear}{sM}{ruO}
    {sRP&&<RPB snapshots={snaps} t={t} T={T} onClose={()=>setSRP(false)}/>}
    <Title size={22}/>
    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
      {mode==="practice"&&<div style={{fontSize:12,fontWeight:700,color:T.accent,background:T.cardBg,padding:"3px 12px",borderRadius:20,border:`1px solid ${T.accent}33`,fontFamily:T.fontBody}}>{t.practiceTitle}</div>}
      {mode==="cpu"&&<div style={{fontSize:12,fontWeight:700,color:lvC[aiLv],background:T.cardBg,padding:"3px 12px",borderRadius:20,border:`1px solid ${lvC[aiLv]}33`}}>Lv.{aiLv} {t.lvLabels[aiLv]}</div>}
      {mode==="cpu"&&<RB rankIdx={rI} t={t} T={T} small/>}
    </div>
    {isOl&&(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:14,fontWeight:700}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:30}}>{mM==="O"?gAE(mA):gAE(oA)}</span><span style={{color:T.O,fontSize:11}}>{T.Olabel} {score.O}</span></div>
      <span style={{color:T.textFaint,fontSize:12}}>{t.vs}</span>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:30}}>{mM==="X"?gAE(mA):gAE(oA)}</span><span style={{color:T.X,fontSize:11}}>{T.Xlabel} {score.X}</span></div>
    </div>)}
    <div style={{display:"flex",gap:8}}>
      {!showHint&&<div style={{fontSize:10,color:T.warn,background:T.warn+"15",padding:"3px 10px",borderRadius:10}}>{t.hintOff}</div>}
      {blind&&<div style={{fontSize:10,color:"#e879f9",background:"rgba(232,121,249,0.1)",padding:"3px 10px",borderRadius:10,border:"1px solid rgba(232,121,249,0.2)"}}>{t.blindOn}</div>}
    </div>
    {mode==="cpu"&&sSP&&<div style={{fontSize:10,color:T.textDim}}>{t.streakProgress(stk,rn)}</div>}
    {!isOl&&(<div style={{display:"flex",gap:20,fontSize:14,fontWeight:600}}>
      <span style={{color:T.O}}>{isCpuLike?(pMark==="O"?t.youLabel(T):t.cpuLabel(T)):"O"}: {score.O}</span>
      <span style={{color:T.X}}>{isCpuLike?(pMark==="X"?t.youLabel(T):t.cpuLabel(T)):"X"}: {score.X}</span>
    </div>)}
    <div style={{fontSize:17,fontWeight:700,minHeight:26,color:winner?T.accent:think?T.textDim:!myT&&isOl?T.textFaint:T.light,fontFamily:T.fontTitle}}>{status}</div>
    {roast&&gO&&<div style={{position:"fixed",zIndex:50,top:"50%",left:"50%",transform:"translate(-50%,-50%)",whiteSpace:"nowrap",padding:"16px 28px",borderRadius:20,background:"rgba(255,255,255,0.8)",backdropFilter:"blur(2px)",color:"#1a1a1a",fontSize:18,fontWeight:700,fontStyle:"italic",textAlign:"center",fontFamily:T.fontBody,animation:"roastIn 1.5s ease",lineHeight:1,boxShadow:"0 4px 24px rgba(0,0,0,0.15)"}}>
      {roast}
      <div style={{position:"absolute",bottom:-10,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:"10px solid rgba(255,255,255,0.8)"}}/>
    </div>}
    <div style={{fontSize:11,color:T.warn,minHeight:14,fontWeight:600}}>{mInfo}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3, 96px)",gap:isC?5:3,background:T.boardBg,padding:isC?5:3,borderRadius:isC?14:4,border:T.boardBorder,boxShadow:isC?"8px 8px 0 rgba(0,0,0,0.3)":"0 4px 20px rgba(0,0,0,0.3)"}}>
      {board.map((v,i)=>(<Sq key={i} value={v} onClick={()=>hClick(i)} highlight={wLine.includes(i)} fading={fI===i} lastMove={!gO&&lM===i} T={T} blind={blind&&!gO} visible={visible[i]} hintDot={mode==="practice"&&showBestHint&&bestMoves.includes(i)}/>))}
    </div>
    {mode==="practice"&&advice&&!think&&(
      <div style={{maxWidth:290,padding:"10px 16px",borderRadius:isC?14:10,background:T.cardBg,border:`1px solid ${advice.grade==="cpu"?T.textDim+"44":T.cardBorder}`,textAlign:"center",display:"flex",flexDirection:"column",gap:6,animation:"fadeIn 0.3s ease"}}>
        <div style={{fontSize:13,fontWeight:700,color:advice.grade==="cpu"?T.textDim:advice.grade==="great"||advice.grade==="good"?"#86efac":advice.grade==="ok"?T.accent:"#fca5a5",fontFamily:T.fontBody}}>{advice.msg}</div>
        <div style={{fontSize:12,color:advice.grade==="cpu"?T.textDim:T.text,fontFamily:T.fontBody,lineHeight:1.5,textAlign:"left"}}>{advice.comment}</div>
      </div>
    )}
    {mode==="practice"&&!gO&&(<div onClick={()=>setShowBestHint(!showBestHint)} style={{fontSize:11,color:T.textDim,cursor:"pointer",userSelect:"none",opacity:0.7}}>{showBestHint?"●":"○"} {t.showHints}</div>)}
    <div style={{display:"flex",gap:8,marginTop:6}}>
      <Btn primary onClick={isOl?olRst:reset}>{t.retry}</Btn>
      {gO&&snaps.length>1&&<Btn onClick={()=>setSRP(true)} style={{fontSize:13}}>{t.replay}</Btn>}
      <Btn onClick={bMenu}>{isOl?t.leave:t.backMenu}</Btn>
    </div>
  </Wrap>);
}
