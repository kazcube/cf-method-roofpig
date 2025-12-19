
// === GLOBAL SCOPE (NO IIFE) ===
const COLOR={w:"#fff",y:"#ff0",g:"#0a0",b:"#00a",r:"#d00",o:"#f80"};
const CORNER=new Set([0,2,6,8]);
let state;

function buildCube(el,isCorner){
  const faces=["U","D","F","B","R","L"];
  faces.forEach(f=>{
    const face=document.createElement("div");
    face.className="face face-"+f;
    for(let i=0;i<9;i++){
      const s=document.createElement("div");
      s.className="sticker";
      s.dataset.face=f;
      s.dataset.index=i;
      face.appendChild(s);
    }
    el.appendChild(face);
  });
}

buildCube(document.getElementById("cube-main"),false);
buildCube(document.getElementById("cube-corner"),true);

function resetState(){
  state={U:Array(9).fill("w"),R:Array(9).fill("r"),F:Array(9).fill("g"),
         D:Array(9).fill("y"),L:Array(9).fill("o"),B:Array(9).fill("b")};
  render();
}

function render(){
  document.querySelectorAll(".sticker").forEach(s=>{
    const f=s.dataset.face,i=s.dataset.index;
    const isCorner=CORNER.has(Number(i));
    if(s.closest("#cube-corner") && !isCorner){
      s.style.background="#555";
    }else{
      s.style.background=COLOR[state[f][i]];
    }
  });
}

function rotCW(a){return[a[6],a[3],a[0],a[7],a[4],a[1],a[8],a[5],a[2]];}
function rotCCW(a){return[a[2],a[5],a[8],a[1],a[4],a[7],a[0],a[3],a[6]];}

// Minimal move set (example)
function moveU(){state.U=rotCW(state.U);render();}
function moveUp(){state.U=rotCCW(state.U);render();}
function moveR(){state.R=rotCW(state.R);render();}
function moveRp(){state.R=rotCCW(state.R);render();}
function moveF(){state.F=rotCW(state.F);render();}
function moveFp(){state.F=rotCCW(state.F);render();}
function moveL(){state.L=rotCW(state.L);render();}
function moveLp(){state.L=rotCCW(state.L);render();}
function moveB(){state.B=rotCW(state.B);render();}
function moveBp(){state.B=rotCCW(state.B);render();}
function moveD(){state.D=rotCW(state.D);render();}
function moveDp(){state.D=rotCCW(state.D);render();}

resetState();
