(function(){

  let scrambleMovesR = "";
  let appliedAlgR = "";

  const MOVES = ["U","U'","U2","R","R'","R2","F","F'","F2","L","L'","L2","B","B'","B2","D","D'","D2"];

  function generateRandomScramble(len){
    let res=[],prev=null;
    for(let i=0;i<len;i++){
      while(true){
        let mv = MOVES[Math.floor(Math.random()*MOVES.length)];
        if(mv[0]!==prev){ res.push(mv); prev=mv[0]; break; }
      }
    }
    return res.join(" ");
  }

  function invertMoves(str){
    let arr=str.trim().split(/\s+/).filter(Boolean);
    let out=[];
    for(let i=arr.length-1;i>=0;i--){
      let m=arr[i];
      if(m.endsWith("2")) out.push(m);
      else if(m.endsWith("'")) out.push(m.replace("'",""));
      else out.push(m+"'");
    }
    return out.join(" ");
  }

  function getState(){
    if(scrambleMovesR && appliedAlgR) return scrambleMovesR+" "+appliedAlgR;
    return scrambleMovesR || appliedAlgR || "";
  }

  function cfgMain(){
    let st=getState();
    let cfg="hover=none|flags=canvas";
    if(st) cfg="setupmoves="+st+"|"+cfg;
    return cfg;
  }

  function cfgCorner(){
    let st=getState();
    let cfg="hover=none|flags=canvas|solved=*-/c|colored=*/c";
    if(st) cfg="setupmoves="+st+"|"+cfg;
    return cfg;
  }

  function rebuild(){
    if(!window.CubeAnimation) return;
    document.getElementById("mainCubeR").innerHTML="";
    document.getElementById("cornerCubeR").innerHTML="";
    CubeAnimation.create_in_dom("#mainCubeR", cfgMain(), "class='roofpig'");
    CubeAnimation.create_in_dom("#cornerCubeR", cfgCorner(), "class='roofpig'");
    document.getElementById("scrambleTextR").value=scrambleMovesR;
    document.getElementById("stateMovesR").value=getState();
  }

  function setup(){
    document.getElementById("btnRandomScrambleR").onclick=()=>{
      scrambleMovesR=generateRandomScramble(20);
      appliedAlgR="";
      rebuild();
    };

    document.getElementById("btnResetR").onclick=()=>{
      scrambleMovesR="";
      appliedAlgR="";
      rebuild();
    };

    document.getElementById("btnApplyScrambleR").onclick=()=>{
      scrambleMovesR=document.getElementById("scrambleTextR").value.trim();
      appliedAlgR="";
      rebuild();
    };

    document.getElementById("btnSolveR").onclick=()=>{
      appliedAlgR=invertMoves(scrambleMovesR);
      rebuild();
    };

    document.getElementById("btnApplyAlgR").onclick=()=>{
      let a=document.getElementById("algInputR").value.trim();
      if(a) appliedAlgR = appliedAlgR? appliedAlgR+" "+a : a;
      rebuild();
    };

    document.getElementById("btnClearAlgR").onclick=()=>{
      appliedAlgR="";
      document.getElementById("algInputR").value="";
      rebuild();
    };

    document.querySelectorAll(".move-btn").forEach(btn=>{
      btn.onclick=()=>{
        let mv=btn.getAttribute("data-move");
        let box=document.getElementById("algInputR");
        box.value = box.value? box.value+" "+mv : mv;
      };
    });
  }

  document.addEventListener("DOMContentLoaded",()=>{
    setup();
    rebuild();
  });

})();
