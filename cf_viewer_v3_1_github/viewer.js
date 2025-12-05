
// ========= 基礎 ==========
const MOVES = ["U","D","L","R","F","B"];
const SUFF = ["", "'", "2"];

function generateScramble(n){
  let out=[], last="";
  for(let i=0;i<n;i++){
    let m;
    do{ m = MOVES[Math.floor(Math.random()*MOVES.length)] } while(m===last);
    last=m;
    let s = SUFF[Math.floor(Math.random()*SUFF.length)];
    out.push(m+s);
  }
  return out.join(" ");
}

// ========= 超重要：Roofpig 再描画の完全版 ==========
function applyConfigTo(divId, config){
  const old = document.getElementById(divId);
  const parent = old.parentNode;

  // 旧要素削除
  parent.removeChild(old);

  // 新要素
  const newDiv = document.createElement("div");
  newDiv.id = divId;
  newDiv.className = "roofpig";
  newDiv.setAttribute("data-config", config);

  parent.appendChild(newDiv);

  // Roofpig再初期化
  if(window.Roofpig && typeof Roofpig.parseAll==="function"){
    Roofpig.parseAll();
  }
}

// ========= Scramble 系 ==========
function randomScramble(){
  document.getElementById("scrambleInput").value = generateScramble(20);
}

function applyScramble(){
  let s = document.getElementById("scrambleInput").value.trim();
  let cfg = "alg="+s+"|colors=F:g B:b U:w D:y R:r L:o|hover=3|speed=700";
  applyConfigTo("cube3", cfg);
}

function randomScrambleApply(){
  randomScramble();
  applyScramble();
}

function randomScrambleApplyCorner(){
  randomScramble();
  applyScramble();
  applyScrambleToCorner();
}

// ========= Corner Scramble ==========
function applyScrambleToCorner(){
  let s = document.getElementById("scrambleInput").value.trim();
  let cfg = "alg="+s+"|colors=F:g B:b U:w D:y R:r L:o|pieces=corner|hover=3|speed=700";
  applyConfigTo("cube2", cfg);
}

// ========= Reset ==========
function resetCube(){
  applyConfigTo("cube3","alg=|colors=F:g B:b U:w D:y R:r L:o|hover=3|speed=700");
}

function resetCorner(){
  applyConfigTo("cube2","alg=|colors=F:g B:b U:w D:y R:r L:o|pieces=corner|hover=3|speed=700");
}

// ========= Apply型 ==========
function applyAlg(){
  let alg = document.getElementById("algInput").value.trim();
  let cfg = "alg="+alg+"|colors=F:g B:b U:w D:y R:r L:o|hover=3|speed=700";
  applyConfigTo("cube3", cfg);
}

function clearAlg(){
  document.getElementById("algInput").value="";
}

function applyAlgCorner(){
  let alg = document.getElementById("algInputCorner").value.trim();
  let cfg = "alg="+alg+"|colors=F:g B:b U:w D:y R:r L:o|pieces=corner|hover=3|speed=700";
  applyConfigTo("cube2", cfg);
}

function clearAlgCorner(){
  document.getElementById("algInputCorner").value="";
}

// ========= Immediate 型 ==========
let immediateAlg = "";

function immediateMove(m){
  immediateAlg = immediateAlg ? immediateAlg+" "+m : m;
  let cfg = "alg="+immediateAlg+"|colors=F:g B:b U:w D:y R:r L:o|hover=3|speed=700";
  applyConfigTo("cube3", cfg);
}

// ========= 初期化 ==========
document.addEventListener("DOMContentLoaded", ()=> {
  if(window.Roofpig) Roofpig.parseAll();
});
