
(() => {
  const cubeMain = document.getElementById("cube-main");
  const cubeCorner = document.getElementById("cube-corner");
  const sceneMain = document.getElementById("scene-main");
  const sceneCorner = document.getElementById("scene-corner");
  const algInput = document.getElementById("algInput");
  const stateMovesArea = document.getElementById("stateMoves");

  let rotX = -30, rotY = 35;
  let dragging = false, lastX = 0, lastY = 0;

  function applyViewTransform() {
    const t = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    cubeMain.style.transform = t;
    cubeCorner.style.transform = t;
  }

  function pointerXY(e){
    if (e.touches && e.touches.length) return {x:e.touches[0].clientX, y:e.touches[0].clientY};
    return {x:e.clientX, y:e.clientY};
  }

  function onDown(e){
    dragging = true;
    sceneMain.classList.add("dragging");
    sceneCorner.classList.add("dragging");
    const p = pointerXY(e);
    lastX = p.x; lastY = p.y;
    e.preventDefault();
  }
  function onMove(e){
    if (!dragging) return;
    const p = pointerXY(e);
    const dx = p.x - lastX;
    const dy = p.y - lastY;
    rotY += dx * 0.4;
    rotX -= dy * 0.4;
    if (rotX > 85) rotX = 85;
    if (rotX < -85) rotX = -85;
    lastX = p.x; lastY = p.y;
    applyViewTransform();
    e.preventDefault();
  }
  function onUp(){
    if (!dragging) return;
    dragging = false;
    sceneMain.classList.remove("dragging");
    sceneCorner.classList.remove("dragging");
  }

  sceneMain.addEventListener("mousedown", onDown);
  sceneCorner.addEventListener("mousedown", onDown);
  sceneMain.addEventListener("touchstart", onDown, {passive:false});
  sceneCorner.addEventListener("touchstart", onDown, {passive:false});
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, {passive:false});
  window.addEventListener("mouseup", onUp);
  window.addEventListener("touchend", onUp);
  window.addEventListener("touchcancel", onUp);

  const COLOR = { w:"#fff", y:"#ff0", g:"#0a0", b:"#00a", r:"#d00", o:"#f80" };
  const CORNER_IDX = new Set([0,2,6,8]);
  let state;

  function rotateFaceCW(a){ return [a[6],a[3],a[0], a[7],a[4],a[1], a[8],a[5],a[2]]; }
  function rotateFaceCCW(a){ return [a[2],a[5],a[8], a[1],a[4],a[7], a[0],a[3],a[6]]; }

  function resetState(){
    state = {
      U:Array(9).fill("w"),
      R:Array(9).fill("r"),
      F:Array(9).fill("g"),
      D:Array(9).fill("y"),
      L:Array(9).fill("o"),
      B:Array(9).fill("b"),
    };
    stateMovesArea.value = "";
    algInput.value = "";
    render();
  }

  function render(){
    for (const face of ["U","R","F","D","L","B"]){
      const main = cubeMain.querySelectorAll(`.face-${face} .sticker`);
      main.forEach((el,i)=>{ el.style.background = COLOR[state[face][i]]; });

      const corner = cubeCorner.querySelectorAll(`.face-${face} .sticker`);
      corner.forEach((el,i)=>{
        el.style.background = CORNER_IDX.has(i) ? COLOR[state[face][i]] : "#555";
      });
    }
  }

  function appendMove(m){
    stateMovesArea.value = stateMovesArea.value.trim() ? (stateMovesArea.value + " " + m) : m;
  }

  // Moves (same set as before; focus in v1.2.15N is wiring + corner colors)
  function U(){ state.U=rotateFaceCW(state.U);
    const f=state.F.slice(), r=state.R.slice(), b=state.B.slice(), l=state.L.slice();
    state.R[0]=f[0]; state.R[1]=f[1]; state.R[2]=f[2];
    state.B[0]=r[0]; state.B[1]=r[1]; state.B[2]=r[2];
    state.L[0]=b[0]; state.L[1]=b[1]; state.L[2]=b[2];
    state.F[0]=l[0]; state.F[1]=l[1]; state.F[2]=l[2];
  }
  function Up(){ state.U=rotateFaceCCW(state.U);
    const f=state.F.slice(), r=state.R.slice(), b=state.B.slice(), l=state.L.slice();
    state.F[0]=r[0]; state.F[1]=r[1]; state.F[2]=r[2];
    state.R[0]=b[0]; state.R[1]=b[1]; state.R[2]=b[2];
    state.B[0]=l[0]; state.B[1]=l[1]; state.B[2]=l[2];
    state.L[0]=f[0]; state.L[1]=f[1]; state.L[2]=f[2];
  }

  function R(){ state.R=rotateFaceCW(state.R);
    const u=state.U.slice(), f=state.F.slice(), d=state.D.slice(), b=state.B.slice();
    state.F[2]=u[2]; state.F[5]=u[5]; state.F[8]=u[8];
    state.D[2]=f[2]; state.D[5]=f[5]; state.D[8]=f[8];
    state.B[6]=d[2]; state.B[3]=d[5]; state.B[0]=d[8];
    state.U[2]=b[6]; state.U[5]=b[3]; state.U[8]=b[0];
  }
  function Rp(){ state.R=rotateFaceCCW(state.R);
    const u=state.U.slice(), f=state.F.slice(), d=state.D.slice(), b=state.B.slice();
    state.U[2]=f[2]; state.U[5]=f[5]; state.U[8]=f[8];
    state.F[2]=d[2]; state.F[5]=d[5]; state.F[8]=d[8];
    state.D[2]=b[6]; state.D[5]=b[3]; state.D[8]=b[0];
    state.B[6]=u[2]; state.B[3]=u[5]; state.B[0]=u[8];
  }

  function F(){ state.F=rotateFaceCW(state.F);
    const u=state.U.slice(), r=state.R.slice(), d=state.D.slice(), l=state.L.slice();
    state.R[0]=u[6]; state.R[3]=u[7]; state.R[6]=u[8];
    state.D[0]=r[6]; state.D[1]=r[3]; state.D[2]=r[0];
    state.L[8]=d[0]; state.L[5]=d[1]; state.L[2]=d[2];
    state.U[6]=l[2]; state.U[7]=l[5]; state.U[8]=l[8];
  }
  function Fp(){ state.F=rotateFaceCCW(state.F);
    const u=state.U.slice(), r=state.R.slice(), d=state.D.slice(), l=state.L.slice();
    state.L[2]=u[6]; state.L[5]=u[7]; state.L[8]=u[8];
    state.D[0]=l[8]; state.D[1]=l[5]; state.D[2]=l[2];
    state.R[0]=d[2]; state.R[3]=d[1]; state.R[6]=d[0];
    state.U[6]=r[0]; state.U[7]=r[3]; state.U[8]=r[6];
  }

  function L(){ state.L=rotateFaceCW(state.L);
    const u=state.U.slice(), f=state.F.slice(), d=state.D.slice(), b=state.B.slice();
    state.F[0]=u[0]; state.F[3]=u[3]; state.F[6]=u[6];
    state.D[0]=f[0]; state.D[3]=f[3]; state.D[6]=f[6];
    state.B[8]=d[0]; state.B[5]=d[3]; state.B[2]=d[6];
    state.U[0]=b[8]; state.U[3]=b[5]; state.U[6]=b[2];
  }
  function Lp(){ state.L=rotateFaceCCW(state.L);
    const u=state.U.slice(), f=state.F.slice(), d=state.D.slice(), b=state.B.slice();
    state.U[0]=f[0]; state.U[3]=f[3]; state.U[6]=f[6];
    state.F[0]=d[0]; state.F[3]=d[3]; state.F[6]=d[6];
    state.D[0]=b[8]; state.D[3]=b[5]; state.D[6]=b[2];
    state.B[8]=u[0]; state.B[5]=u[3]; state.B[2]=u[6];
  }

  function B(){ state.B=rotateFaceCW(state.B);
    const u=state.U.slice(), r=state.R.slice(), d=state.D.slice(), l=state.L.slice();
    state.R[2]=u[0]; state.R[5]=u[1]; state.R[8]=u[2];
    state.D[6]=r[2]; state.D[7]=r[5]; state.D[8]=r[8];
    state.L[0]=d[6]; state.L[3]=d[7]; state.L[6]=d[8];
    state.U[0]=l[6]; state.U[1]=l[3]; state.U[2]=l[0];
  }
  function Bp(){ state.B=rotateFaceCCW(state.B);
    const u=state.U.slice(), r=state.R.slice(), d=state.D.slice(), l=state.L.slice();
    state.L[6]=u[0]; state.L[3]=u[1]; state.L[0]=u[2];
    state.D[6]=l[0]; state.D[7]=l[3]; state.D[8]=l[6];
    state.R[2]=d[6]; state.R[5]=d[7]; state.R[8]=d[8];
    state.U[0]=r[2]; state.U[1]=r[5]; state.U[2]=r[8];
  }

  function D(){ state.D=rotateFaceCW(state.D);
    const f=state.F.slice(), r=state.R.slice(), b=state.B.slice(), l=state.L.slice();
    state.L[6]=f[6]; state.L[7]=f[7]; state.L[8]=f[8];
    state.B[6]=l[6]; state.B[7]=l[7]; state.B[8]=l[8];
    state.R[6]=b[6]; state.R[7]=b[7]; state.R[8]=b[8];
    state.F[6]=r[6]; state.F[7]=r[7]; state.F[8]=r[8];
  }
  function Dp(){ state.D=rotateFaceCCW(state.D);
    const f=state.F.slice(), r=state.R.slice(), b=state.B.slice(), l=state.L.slice();
    state.R[6]=f[6]; state.R[7]=f[7]; state.R[8]=f[8];
    state.B[6]=r[6]; state.B[7]=r[7]; state.B[8]=r[8];
    state.L[6]=b[6]; state.L[7]=b[7]; state.L[8]=b[8];
    state.F[6]=l[6]; state.F[7]=l[7]; state.F[8]=l[8];
  }

  const FACE_REMAP = { R:"F", F:"L", L:"B", B:"R", U:"U", D:"D" };

  function execute(face, prime){
    const mapped = FACE_REMAP[face] || face;
    if (mapped==="U") { prime?Up():U(); return; }
    if (mapped==="R") { prime?Rp():R(); return; }
    if (mapped==="F") { prime?Fp():F(); return; }
    if (mapped==="L") { prime?Lp():L(); return; }
    if (mapped==="B") { prime?Bp():B(); return; }
    if (mapped==="D") { prime?Dp():D(); return; }
  }

  function parseToken(t){
    const face = t[0];
    if (!"URFDLB".includes(face)) return null;
    let prime=false, times=1;
    if (t.includes("2")) times=2;
    if (t.includes("'")) prime=true;
    return {face, prime, times};
  }

  function applyAlg(str){
    const tokens = str.trim().split(/\s+/).filter(Boolean);
    for (const tok of tokens){
      const m = parseToken(tok);
      if (!m) continue;
      for (let i=0;i<m.times;i++){
        execute(m.face, m.prime);
        appendMove(tok);
      }
    }
    render();
  }

  window.doMove = (moveStr) => applyAlg(moveStr);
  window.applyAlgFromInput = () => applyAlg(algInput.value || "");
  window.resetAll = () => resetState();

  applyViewTransform();
  resetState();
})();


// === Direct button handlers for prime moves (v1.2.15N) ===
window.moveU  = () => { U();  render(); appendMove("U"); };
window.moveUp = () => { Up(); render(); appendMove("U'"); };
window.moveR  = () => { R();  render(); appendMove("R"); };
window.moveRp = () => { Rp(); render(); appendMove("R'"); };
window.moveF  = () => { F();  render(); appendMove("F"); };
window.moveFp = () => { Fp(); render(); appendMove("F'"); };
window.moveL  = () => { L();  render(); appendMove("L"); };
window.moveLp = () => { Lp(); render(); appendMove("L'"); };
window.moveB  = () => { B();  render(); appendMove("B"); };
window.moveBp = () => { Bp(); render(); appendMove("B'"); };
window.moveD  = () => { D();  render(); appendMove("D"); };
window.moveDp = () => { Dp(); render(); appendMove("D'"); };
