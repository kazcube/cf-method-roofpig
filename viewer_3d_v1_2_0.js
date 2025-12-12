
// v1.2.0N - CSS 3D Rubik's Cube with internal state + U / U' moves only (no animation yet)

(function () {
  const cubeMain = document.getElementById("cube-main");
  const cubeCorner = document.getElementById("cube-corner");
  const sceneMain = document.getElementById("scene-main");
  const sceneCorner = document.getElementById("scene-corner");

  const algInput = document.getElementById("algInput");
  const stateMovesArea = document.getElementById("stateMoves");

  // === 3D view rotation (same as v1.1.0N) ===
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

  // === Internal cube state (U/R/F/D/L/B each 0..8) ===

  const FACE_COLORS = {
    U: "w",
    R: "r",
    F: "g",
    D: "y",
    L: "o",
    B: "b",
  };

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

  // Apply current state to both cubes
  function updateStickers() {
    // main cube
    ["U", "D", "F", "B", "R", "L"].forEach(face => {
      const stickersMain = cubeMain.querySelectorAll(`.face-${face} .sticker`);
      stickersMain.forEach((el, idx) => {
        const col = COLOR_TO_CSS[state[face][idx]];
        el.style.background = col;
      });

      const stickersCorner = cubeCorner.querySelectorAll(`.face-${face} .sticker`);
      stickersCorner.forEach((el, idx) => {
        const isCorner =
          idx === 0 || idx === 2 || idx === 6 || idx === 8;
        if (isCorner) {
          const col = COLOR_TO_CSS[state[face][idx]];
          el.style.background = col;
        } else {
          el.style.background = "#555555";
        }
      });
    });
  }

  // Rotate a face array (clockwise)
  function rotateFaceCW(faceArr) {
    return [
      faceArr[6], faceArr[3], faceArr[0],
      faceArr[7], faceArr[4], faceArr[1],
      faceArr[8], faceArr[5], faceArr[2],
    ];
  }

  // Rotate face array (counter-clockwise)
  function rotateFaceCCW(faceArr) {
    return [
      faceArr[2], faceArr[5], faceArr[8],
      faceArr[1], faceArr[4], faceArr[7],
      faceArr[0], faceArr[3], faceArr[6],
    ];
  }

  // For v1.2.0N, only U / U' を実装
  function moveU() {
    // U face
    state.U = rotateFaceCW(state.U);

    // Side faces: top rows of F, R, B, L
    const f = state.F.slice();
    const r = state.R.slice();
    const b = state.B.slice();
    const l = state.L.slice();

    // cycle: F -> R -> B -> L -> F （上から見たときの時計回り）
    state.R[0] = f[0]; state.R[1] = f[1]; state.R[2] = f[2];
    state.B[0] = r[0]; state.B[1] = r[1]; state.B[2] = r[2];
    state.L[0] = b[0]; state.L[1] = b[1]; state.L[2] = b[2];
    state.F[0] = l[0]; state.F[1] = l[1]; state.F[2] = l[2];

    updateStickers();
    appendMoveToState("U");
  }

  function moveUprime() {
    // U' is three times U, but implement directly for精度
    state.U = rotateFaceCCW(state.U);

    const f = state.F.slice();
    const r = state.R.slice();
    const b = state.B.slice();
    const l = state.L.slice();

    // cycle: F <- R <- B <- L <- F
    state.R[0] = b[0]; state.R[1] = b[1]; state.R[2] = b[2];
    state.B[0] = l[0]; state.B[1] = l[1]; state.B[2] = l[2];
    state.L[0] = f[0]; state.L[1] = f[1]; state.L[2] = f[2];
    state.F[0] = r[0]; state.F[1] = r[1]; state.F[2] = r[2];

    updateStickers();
    appendMoveToState("U'");
  }

  // Update stateMovesArea text
  function appendMoveToState(m) {
    if (!stateMovesArea.value.trim()) {
      stateMovesArea.value = m;
    } else {
      stateMovesArea.value += " " + m;
    }
  }

  // Apply algorithm string (今は U / U' のみ解釈)
  function applyAlg(str) {
    const tokens = str.split(/\s+/).map(t => t.trim()).filter(Boolean);
    for (const t of tokens) {
      if (t === "U") moveU();
      else if (t === "U'") moveUprime();
      // 今後 R, F, L, B, D もここに追加予定
    }
  }

  function setupUI() {
    // move buttons
    document.querySelectorAll(".btn-move").forEach(btn => {
      btn.addEventListener("click", () => {
        const mv = btn.dataset.move;
        if (mv === "U") moveU();
        else if (mv === "U'") moveUprime();
      });
    });

    document.getElementById("btnResetState").addEventListener("click", resetState);

    document.getElementById("btnApplyAlg").addEventListener("click", () => {
      const s = algInput.value.trim();
      if (!s) return;
      applyAlg(s);
    });

    document.getElementById("btnClearAlg").addEventListener("click", () => {
      algInput.value = "";
      stateMovesArea.value = "";
      resetState();
    });
  }

  function init() {
    // 3D rotation
    applyTransform();
    initDrag(sceneMain);
    initDrag(sceneCorner);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);

    // state
    resetState();
    setupUI();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
