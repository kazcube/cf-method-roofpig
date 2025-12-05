
let currentSetup = "";
const BASE_CONFIG = "speed=400|hover=near|pov=Ufr|flags=canvas|algdisplay=fancy2s";

function normalizeMoves(alg){
  return alg.replace(/\s+/g," ").trim();
}

function renderCubes(){
  const setup = currentSetup ? "|setupmoves=" + currentSetup : "";
  $("#cube3").empty();
  CubeAnimation.create_in_dom("#cube3", BASE_CONFIG + setup, "");
  $("#cubeCorner").empty();
  CubeAnimation.create_in_dom("#cubeCorner", BASE_CONFIG + setup, "");
  document.getElementById("currentState").innerText = currentSetup || "(solved)";
}

function appendToState(alg){
  alg = normalizeMoves(alg);
  if(!alg){ renderCubes(); return; }
  currentSetup = currentSetup ? currentSetup + " " + alg : alg;
  renderCubes();
}

function setStateFromAlg(alg){
  currentSetup = normalizeMoves(alg);
  renderCubes();
}

function generateRandomScramble(len){
  const moves=["U","U'","U2","R","R'","R2","F","F'","F2","L","L'","L2","B","B'","B2","D","D'","D2"];
  let out=[], last="";
  for(let i=0;i<len;i++){
    let m, face;
    do{
      m=moves[Math.floor(Math.random()*moves.length)];
      face=m[0];
    }while(face===last);
    out.push(m);
    last=face;
  }
  return out.join(" ");
}

function generate6EScramble(){
  const moves=["U","U'","U2","D","D'","D2"];
  let out=[], last="";
  for(let i=0;i<12;i++){
    let m;
    do{
      m=moves[Math.floor(Math.random()*moves.length)];
    }while(m[0]===last);
    out.push(m);
    last=m[0];
  }
  return out.join(" ");
}

$(function(){
  renderCubes();

  $("#btnApply").on("click", ()=> appendToState($("#algInput").val()));
  $("#btnImmediate").on("click", ()=>{
    appendToState($("#algInput").val());
    $("#algInput").val("");
  });
  $("#btnReset").on("click", ()=>{ currentSetup=""; renderCubes(); });

  $("#btnRandom20").on("click", ()=>{
    const scr=generateRandomScramble(20);
    $("#randomScrambleText").text(scr);
  });

  $("#btnRandomApply").on("click", ()=>{
    const scr=generateRandomScramble(20);
    $("#randomScrambleText").text(scr);
    setStateFromAlg(scr);
  });

  $("#btnRandomApplyCorner").on("click", ()=>{
    const scr=generateRandomScramble(20);
    $("#randomScrambleText").text(scr+" (corner)");
    setStateFromAlg(scr);
  });

  $("#btn6E").on("click", ()=>{
    const scr=generate6EScramble();
    $("#scramble6EText").text(scr);
    setStateFromAlg(scr);
  });
});
