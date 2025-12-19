
// v1.2.12N - CSS 3D Rubik's Cube with internal state + full 6-face moves (no animation)
// - Face mapping adjusted: R->old F, F->old L, L->old B, B->old R (U/D unchanged)
// - D direction flipped (per earlier observation). B is WCA-standard in v1.2.12N.

(function () {
  const cubeMain = document.getElementById("cube-main");
  const cubeCorner = document.getElementById("cube-corner");
  const sceneMain = document.getElementById("scene-main");
  const sceneCorner = document.getElementById("scene-corner");

  const algInput = document.getElementById("algInput");
  const stateMovesArea = document.getElementById("stateMoves");

  // === 3D view rotation ===
  let rotX = -30;
  let rotY = 35;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  function applyTransform() {
    const transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    cubeMain.style.transform = transform;
    cubeCorner.style.transform = transform;
  }

  function onDown(e) {
    dragging = true;
    sceneMain.classList.add("dragging");
    sceneCorner.classList.add("dragging");

    if (e.touches && e.touches.length > 0) {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    } else {
      lastX = e.clientX;
      lastY = e.clientY;
    }
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    let x, y;
    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }

    const dx = x - lastX;
    const dy = y - lastY;

    rotY += dx * 0.4;
    rotX -= dy * 0.4;

    if (rotX > 85) rotX = 85;
    if (rotX < -85) rotX = -85;

    lastX = x;
    lastY = y;

    applyTransform();
    e.preventDefault();
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    sceneMain.classList.remove("dragging");
    sceneCorner.classList.remove("dragging");
  }

  function initDrag(scene) {
    scene.addEventListener("mousedown", onDown);
    scene.addEventListener("touchstart", onDown, { passive: false });
  }

  // === Internal cube state ===
  const COLOR_TO_CSS = {
    w: "#ffffff",
    y: "#ffff00",
    g: "#00aa00",
    b: "#0000aa",
    r: "#dd0000",
    o: "#ff8800",
  };

  let state = {};

  function resetState() {
    state = {
      U: Array(9).fill("w"),
      R: Array(9).fill("r"),
      F: Array(9).fill("g"),
      D: Array(9).fill("y"),
      L: Array(9).fill("o"),
      B: Array(9).fill("b"),
    };
    stateMovesArea.value = "";
    algInput.value = "";
    updateStickers();
  }

  function updateStickers() {
    ["U", "D", "F", "B", "R", "L"].forEach(face => {
      const mainStickers = cubeMain.querySelectorAll(`.face-${face} .sticker`);
      mainStickers.forEach((el, idx) => {
        el.style.background = COLOR_TO_CSS[state[face][idx]];
      });

      const cornerStickers = cubeCorner.querySelectorAll(`.face-${face} .sticker`);
      cornerStickers.forEach((el, idx) => {
        const isCorner = (idx === 0 || idx === 2 || idx === 6 || idx === 8);
        el.style.background = isCorner ? COLOR_TO_CSS[state[face][idx]] : "#555555";
      });
    });
  }

  function rotateFaceCW(faceArr) {
    return [
      faceArr[6], faceArr[3], faceArr[0],
      faceArr[7], faceArr[4], faceArr[1],
      faceArr[8], faceArr[5], faceArr[2],
    ];
  }
  function rotateFaceCCW(faceArr) {
    return [
      faceArr[2], faceArr[5], faceArr[8],
      faceArr[1], faceArr[4], faceArr[7],
      faceArr[0], faceArr[3], faceArr[6],
    ];
  }

  // === Moves (base layer logic) ===
  
  function moveU() {
    state.U = rotateFaceCCW(state.U);
    const f = state.F.slice(), r = state.R.slice(), b = state.B.slice(), l = state.L.slice();
    state.F[0]=r[0]; state.F[1]=r[1]; state.F[2]=r[2];
    state.L[0]=f[0]; state.L[1]=f[1]; state.L[2]=f[2];
    state.B[0]=l[0]; state.B[1]=l[1]; state.B[2]=l[2];
    state.R[0]=b[0]; state.R[1]=b[1]; state.R[2]=b[2];
    updateStickers(); appendMoveToState("U");
  }
  function moveUprime() {
    state.U = rotateFaceCW(state.U);
    const f = state.F.slice(), r = state.R.slice(), b = state.B.slice(), l = state.L.slice();
    state.R[0]=f[0]; state.R[1]=f[1]; state.R[2]=f[2];
    state.B[0]=r[0]; state.B[1]=r[1]; state.B[2]=r[2];
    state.L[0]=b[0]; state.L[1]=b[1]; state.L[2]=b[2];
    state.F[0]=l[0]; state.F[1]=l[1]; state.F[2]=l[2];
    updateStickers(); appendMoveToState("U'");
  }


  function moveR() {
    state.R = rotateFaceCW(state.R);
    const u = state.U.slice(), f = state.F.slice(), d = state.D.slice(), b = state.B.slice();
    state.F[2] = u[2]; state.F[5] = u[5]; state.F[8] = u[8];
    state.D[2] = f[2]; state.D[5] = f[5]; state.D[8] = f[8];
    state.B[6] = d[2]; state.B[3] = d[5]; state.B[0] = d[8];
    state.U[2] = b[6]; state.U[5] = b[3]; state.U[8] = b[0];
    updateStickers(); appendMoveToState("R");
  }
  function moveRprime() {
    state.R = rotateFaceCCW(state.R);
    const u = state.U.slice(), f = state.F.slice(), d = state.D.slice(), b = state.B.slice();
    state.U[2] = f[2]; state.U[5] = f[5]; state.U[8] = f[8];
    state.F[2] = d[2]; state.F[5] = d[5]; state.F[8] = d[8];
    state.D[2] = b[6]; state.D[5] = b[3]; state.D[8] = b[0];
    state.B[6] = u[2]; state.B[3] = u[5]; state.B[0] = u[8];
    updateStickers(); appendMoveToState("R'");
  }

  function moveF() {
    state.F = rotateFaceCW(state.F);
    const u = state.U.slice(), r = state.R.slice(), d = state.D.slice(), l = state.L.slice();
    state.R[0] = u[6]; state.R[3] = u[7]; state.R[6] = u[8];
    state.D[0] = r[6]; state.D[1] = r[3]; state.D[2] = r[0];
    state.L[8] = d[0]; state.L[5] = d[1]; state.L[2] = d[2];
    state.U[6] = l[2]; state.U[7] = l[5]; state.U[8] = l[8];
    updateStickers(); appendMoveToState("F");
  }
  function moveFprime() {
    state.F = rotateFaceCCW(state.F);
    const u = state.U.slice(), r = state.R.slice(), d = state.D.slice(), l = state.L.slice();
    state.L[2] = u[6]; state.L[5] = u[7]; state.L[8] = u[8];
    state.D[0] = l[8]; state.D[1] = l[5]; state.D[2] = l[2];
    state.R[0] = d[2]; state.R[3] = d[1]; state.R[6] = d[0];
    state.U[6] = r[0]; state.U[7] = r[3]; state.U[8] = r[6];
    updateStickers(); appendMoveToState("F'");
  }

  
  
  // --- L (fixed direction) ---
  
  // --- L (WCA definition: clockwise when looking directly at L face) ---
  function moveLprime() {
    state.L = rotateFaceCCW(state.L);
    const u = state.U.slice(), f = state.F.slice(), d = state.D.slice(), b = state.B.slice();
    // inverse cycle
    state.U[0] = f[0]; state.U[3] = f[3]; state.U[6] = f[6];
    state.F[0] = d[0]; state.F[3] = d[3]; state.F[6] = d[6];
    state.D[0] = b[8]; state.D[3] = b[5]; state.D[6] = b[2];
    state.B[8] = u[0]; state.B[5] = u[3]; state.B[2] = u[6];
    updateStickers(); appendMoveToState("L'");
  }
function moveL'() {
    // NOTE: From global cube coordinates this is CCW, but from L'-face view it is CW.
    state.L' = rotateFaceCW(state.L');
    const u = state.U.slice(), f = state.F.slice(), d = state.D.slice(), b = state.B.slice();
    // U left col -> F left col -> D left col -> B right col -> U left col
    state.F[0] = u[0]; state.F[3] = u[3]; state.F[6] = u[6];
    state.D[0] = f[0]; state.D[3] = f[3]; state.D[6] = f[6];
    state.B[8] = d[0]; state.B[5] = d[3]; state.B[2] = d[6];
    state.U[0] = b[8]; state.U[3] = b[5]; state.U[6] = b[2];
    updateStickers(); appendMoveToState("L'");
  }




  // --- NOTE: D was flipped per earlier report. B is WCA-standard in v1.2.12N ---
  // We keep D flipped; B is not flipped.
  
  // --- B (WCA standard) ---
  function moveB() {
    state.B = rotateFaceCW(state.B);
    const u = state.U.slice(), r = state.R.slice(), d = state.D.slice(), l = state.L.slice();
    // U top row -> R right col -> D bottom row -> L left col -> U top row
    state.R[2] = u[0]; state.R[5] = u[1]; state.R[8] = u[2];
    state.D[6] = r[2]; state.D[7] = r[5]; state.D[8] = r[8];
    state.L[0] = d[6]; state.L[3] = d[7]; state.L[6] = d[8];
    state.U[0] = l[6]; state.U[1] = l[3]; state.U[2] = l[0];
    updateStickers(); appendMoveToState("B");
  }
  function moveBprime() {
    state.B = rotateFaceCCW(state.B);
    const u = state.U.slice(), r = state.R.slice(), d = state.D.slice(), l = state.L.slice();
    // inverse cycle
    state.L[6] = u[0]; state.L[3] = u[1]; state.L[0] = u[2];
    state.D[6] = l[0]; state.D[7] = l[3]; state.D[8] = l[6];
    state.R[2] = d[6]; state.R[5] = d[7]; state.R[8] = d[8];
    state.U[0] = r[2]; state.U[1] = r[5]; state.U[2] = r[8];
    updateStickers(); appendMoveToState("B'");
  }

function moveD() {
    // (flipped) previously D'
    state.D = rotateFaceCCW(state.D);
    const f = state.F.slice(), r = state.R.slice(), b = state.B.slice(), l = state.L.slice();
    state.R[6] = f[6]; state.R[7] = f[7]; state.R[8] = f[8];
    state.B[6] = r[6]; state.B[7] = r[7]; state.B[8] = r[8];
    state.L[6] = b[6]; state.L[7] = b[7]; state.L[8] = b[8];
    state.F[6] = l[6]; state.F[7] = l[7]; state.F[8] = l[8];
    updateStickers(); appendMoveToState("D");
  }
  function moveDprime() {
    // (flipped) previously D
    state.D = rotateFaceCW(state.D);
    const f = state.F.slice(), r = state.R.slice(), b = state.B.slice(), l = state.L.slice();
    state.L[6] = f[6]; state.L[7] = f[7]; state.L[8] = f[8];
    state.B[6] = l[6]; state.B[7] = l[7]; state.B[8] = l[8];
    state.R[6] = b[6]; state.R[7] = b[7]; state.R[8] = b[8];
    state.F[6] = r[6]; state.F[7] = r[7]; state.F[8] = r[8];
    updateStickers(); appendMoveToState("D'");
  }

  function appendMoveToState(m) {
    stateMovesArea.value = stateMovesArea.value.trim() ? (stateMovesArea.value + " " + m) : m;
  }

  // === Face remap (buttons / alg input) ===
  // User mapping:
  // R -> old F
  // F -> old L
  // L -> old B
  // B -> old R
  const FACE_REMAP = { R: "F", F: "L", L: "B", B: "R", U: "U", D: "D" };

  function parseMoveToken(token) {
    let face = token[0];
    if (!"URFDLB".includes(face)) return null;
    let prime = false;
    let times = 1;
    if (token.length > 1) {
      if (token[1] === "'") {
        prime = true;
        if (token.length > 2 && token[2] === "2") times = 2;
      } else if (token[1] === "2") {
        times = 2;
      }
    }
    return { face, prime, times };
  }

  function executeMove(face, prime) {
    const mapped = FACE_REMAP[face] || face;

    if (mapped === "U") { prime ? moveUprime() : moveU(); return; }
    if (mapped === "R") { prime ? moveRprime() : moveR(); return; }
    if (mapped === "F") { prime ? moveFprime() : moveF(); return; }
    if (mapped === "L") { prime ? moveLprime() : moveL(); return; }
    if (mapped === "B") { prime ? moveBprime() : moveB(); return; }
    if (mapped === "D") { prime ? moveDprime() : moveD(); return; }
  }

  function applyAlg(str) {
    const tokens = str.split(/\s+/).map(t => t.trim()).filter(Boolean);
    for (const t of tokens) {
      const m = parseMoveToken(t);
      if (!m) continue;
      for (let i = 0; i < (m.times || 1); i++) {
        executeMove(m.face, m.prime);
      }
    }
  }

  function setupUI() {
    document.querySelectorAll(".btn-move").forEach(btn => {
      btn.addEventListener("click", () => applyAlg(btn.dataset.move));
    });

    document.getElementById("btnResetState").addEventListener("click", resetState);

    document.getElementById("btnApplyAlg").addEventListener("click", () => {
      const s = algInput.value.trim();
      if (s) applyAlg(s);
    });

    document.getElementById("btnClearAlg").addEventListener("click", () => resetState());
  }

  function init() {
    applyTransform();
    initDrag(sceneMain);
    initDrag(sceneCorner);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);

    resetState();
    setupUI();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
