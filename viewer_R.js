(function () {
  let scrambleMovesR = "";
  let appliedAlgR = "";

  const MOVES = ["U","U'","U2","R","R'","R2","F","F'","F2","L","L'","L2","B","B'","B2","D","D'","D2"];

  function generateRandomScramble(len) {
    const result = [];
    let prev = null;
    for (let i=0;i<len;i++){
      while(true){
        const mv = MOVES[Math.floor(Math.random()*MOVES.length)];
        if(mv[0]!==prev){
          result.push(mv);
          prev = mv[0];
          break;
        }
      }
    }
    return result.join(" ");
  }

  function getState(){
    const s = scrambleMovesR.trim();
    const a = appliedAlgR.trim();
    if(s && a) return s+" "+a;
    return s || a || "";
  }

  function buildMainConfig(){
    const st = getState();
    let c = "hover=none|flags=canvas";
    if(st) c = "setupmoves="+st+"|"+c;
    return c;
  }

  function buildCornerConfig(){
    const st = getState();
    let c = "hover=none|flags=canvas|solved=*-/c|colored=*/c";
    if(st) c = "setupmoves="+st+"|"+c;
    return c;
  }

  function rebuild(){
    if(!window.CubeAnimation){
      console.error("Roofpig missing");
      return;
    }
    document.getElementById("mainCubeR").innerHTML="";
    document.getElementById("cornerCubeR").innerHTML="";

    CubeAnimation.create_in_dom("#mainCubeR", buildMainConfig(), "class='roofpig'");
    CubeAnimation.create_in_dom("#cornerCubeR", buildCornerConfig(), "class='roofpig'");

    document.getElementById("scrambleTextR").value = scrambleMovesR;
    document.getElementById("stateMovesR").value = getState();
  }

  function init(){
    document.getElementById("btnRandomScrambleR").onclick = ()=>{
      scrambleMovesR = generateRandomScramble(20);
      appliedAlgR = "";
      rebuild();
    };
    document.getElementById("btnResetR").onclick = ()=>{
      scrambleMovesR = "";
      appliedAlgR = "";
      rebuild();
    };
    document.getElementById("btnApplyAlgR").onclick = ()=>{
      const a = document.getElementById("algInputR").value.trim();
      if(a){
        appliedAlgR = appliedAlgR ? appliedAlgR+" "+a : a;
        rebuild();
      }
    };
    rebuild();
  }
  document.addEventListener("DOMContentLoaded", init);
})();