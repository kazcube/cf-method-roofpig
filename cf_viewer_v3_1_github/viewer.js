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

function applyConfigTo(divId, config){
  const old = document.getElementById(divId);
  const parent = old.parentNode;
  parent.removeChild(old);

  const newDiv = document.createElement("div");
  newDiv.id = divId;
  newDiv.className = "roofpig";
  newDiv.setAttribute("data-config", config);
  parent.appendChild(newDiv);

  if(window.Roofpig && typeof Roofpig.parseAll==="function"){
    Roofpig.parseAll();
  }
}

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

function applyScrambleToCorner(){
  let s = document.getElementById("scrambleInput").value.trim();
  let cfg = "alg="+s+"|colors=F:g B:b U:w D:y R:r L:o|pieces=corner|hover=3|speed=700";
  applyConfigTo("cube2", cfg);
}

function resetCube(){
  applyConfigTo("cube3","alg=|colors=F:g B:b U:w D:y R:r L:o|hover=3|speed=700");
}

function resetCorner(){
  applyConfigTo("cube2","alg=|colors=F:g B:b U:w D:y R:r L:o|pieces=corner|hover=3|speed=700");
}

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

let immediateAlg = "";
function immediateMove(m){
  immediateAlg = immediateAlg ? immediateAlg+" "+m : m;
  let cfg = "alg="+immediateAlg+"|colors=F:g B:b U:w D:y R:r L:o|hover=3|speed=700";
  applyConfigTo("cube3", cfg);
}

/* ============================================
   ここが最重要：初期化は window.onload に移動
   ============================================*/
window.onload = () => {
  if(window.Roofpig && typeof Roofpig.parseAll==="function"){
    Roofpig.parseAll();
  }
};
