"use strict";

const CFV_VERSION = "v5.1.17";
const CFV_TIMESTAMP = "20260219-1744";

function createInitialCubeState() {
  return {
    corners: {
      perm: [0, 1, 2, 3, 4, 5, 6, 7],
      ori: [0, 0, 0, 0, 0, 0, 0, 0],
    },
  };
}

let cubeState = createInitialCubeState();
const moveHistory = [];
const pendingMoves = [];
let mode = "immediate";
let isPlaying = false;
let applyStepDelayMs = 1000;
let roofpigInstance = null;

function rotateU(corners) {
  const p = corners.perm;
  const o = corners.ori;

  const newPerm = [...p];
  const newOri = [...o];

  newPerm[0] = p[3];
  newPerm[1] = p[0];
  newPerm[2] = p[1];
  newPerm[3] = p[2];

  return {
    perm: newPerm,
    ori: newOri,
  };
}

function applyMoveToState(move) {
  if (move === "U" || move === "U'" || move === "U2") {
    cubeState.corners = rotateU(cubeState.corners);
  }
}

function toRoofpigMove(move) {
  const flip = {
    U: "U'",
    "U'": "U",
    R: "R'",
    "R'": "R",
    L: "L'",
    "L'": "L",
  };
  return flip[move] || move;
}

function renderStatus() {
  const pendingText = document.getElementById("pending-text");
  if (pendingText) {
    pendingText.textContent = `Pending: ${pendingMoves.join(" ")}`;
  }

  const historyText = document.getElementById("history-text");
  if (historyText) {
    historyText.textContent = `History: ${moveHistory.join(" ")}`;
  }
}

function getFirstCubeInstance() {
  if (!window.CubeAnimation || !CubeAnimation.by_id) {
    return null;
  }
  const ids = Object.keys(CubeAnimation.by_id);
  if (ids.length === 0) {
    return null;
  }
  return CubeAnimation.by_id[ids[0]];
}

function initRoofpigOnce() {
  if (roofpigInstance) {
    return true;
  }

  roofpigInstance = getFirstCubeInstance();
  if (!roofpigInstance) {
    return false;
  }

  console.log("[CFV] roofpig initialized once");
  return true;
}

function playSingleMoveIncremental(move) {
  if (!initRoofpigOnce()) {
    console.error("[CFV] Roofpig instance is not ready.");
    return;
  }

  if (typeof Alg !== "function") {
    console.error("[CFV] Alg is not available.");
    return;
  }

  const mapped = toRoofpigMove(move);
  if (!/^[URL](2|'|)?$/.test(mapped)) {
    console.error("[CFV] Invalid mapped move:", move, mapped);
    return;
  }

  const alg = new Alg(
    mapped,
    roofpigInstance.world3d,
    roofpigInstance.algdisplay,
    roofpigInstance.config.speed,
    roofpigInstance.dom
  );
  roofpigInstance.add_changer("pieces", alg.play());
}

function resetRoofpigView() {
  if (!initRoofpigOnce()) {
    console.error("[CFV] Roofpig instance is not ready.");
    return;
  }

  if (typeof roofpigInstance.button_click === "function") {
    roofpigInstance.button_click("reset");
    return;
  }

  if (roofpigInstance.alg && typeof roofpigInstance.alg.to_start === "function" && typeof OneChange === "function") {
    roofpigInstance.add_changer(
      "pieces",
      new OneChange(() => roofpigInstance.alg.to_start(roofpigInstance.world3d))
    );
    return;
  }

  console.error("[CFV] Reset API is not available.");
}

function appendMoveHistory(move) {
  moveHistory.push(move);
}

function onMove(move) {
  if (isPlaying) {
    return;
  }

  applyMoveToState(move);

  if (mode === "immediate") {
    appendMoveHistory(move);
    playSingleMoveIncremental(move);
  } else {
    pendingMoves.push(move);
  }

  renderStatus();
}

function applyPendingMoves(event) {
  if (event) {
    event.preventDefault();
  }

  if (isPlaying || pendingMoves.length === 0) {
    renderStatus();
    return;
  }

  isPlaying = true;
  const movesToApply = pendingMoves.slice();
  pendingMoves.length = 0;
  renderStatus();

  const step = () => {
    if (!isPlaying) {
      return;
    }

    if (movesToApply.length === 0) {
      isPlaying = false;
      return;
    }

    const move = movesToApply.shift();
    appendMoveHistory(move);
    playSingleMoveIncremental(move);
    renderStatus();
    setTimeout(step, applyStepDelayMs);
  };

  step();
}

function clearPendingMoves(event) {
  if (event) {
    event.preventDefault();
  }

  pendingMoves.length = 0;
  renderStatus();
}

function resetAll(event) {
  if (event) {
    event.preventDefault();
  }

  isPlaying = false;
  moveHistory.length = 0;
  pendingMoves.length = 0;
  cubeState = createInitialCubeState();
  resetRoofpigView();
  renderStatus();
}

console.log(
  "%c[CFV]",
  "color:#4CAF50;font-weight:bold;",
  `CF Method Cube Viewer ${CFV_VERSION}`,
  `(JST ${CFV_TIMESTAMP})`
);

document.addEventListener("DOMContentLoaded", () => {
  const headerText = `CF Method Cube Viewer ${CFV_VERSION} | JST ${CFV_TIMESTAMP}`;
  document.title = headerText;

  const appTitle = document.getElementById("app-title");
  if (appTitle) {
    appTitle.textContent = headerText;
  }

  const waitForRoofpig = () => {
    if (!initRoofpigOnce()) {
      setTimeout(waitForRoofpig, 50);
    }
  };
  waitForRoofpig();

  const speedEl = document.getElementById("speed");
  const speedValEl = document.getElementById("speed-value");
  if (speedEl) {
    applyStepDelayMs = Number(speedEl.value) || 1000;
    if (speedValEl) {
      speedValEl.textContent = `${applyStepDelayMs}ms`;
    }

    speedEl.addEventListener("input", () => {
      applyStepDelayMs = Number(speedEl.value) || 1000;
      if (speedValEl) {
        speedValEl.textContent = `${applyStepDelayMs}ms`;
      }
    });
  }

  const modeRadios = document.querySelectorAll('input[name="mode"]');
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      mode = radio.value;
      renderStatus();
    });
  });

  document.querySelectorAll("#move-buttons [data-move]").forEach((btn) => {
    btn.addEventListener("click", () => {
      onMove(btn.dataset.move);
    });
  });

  const btnApply = document.getElementById("btn-apply");
  if (btnApply) {
    btnApply.addEventListener("click", applyPendingMoves);
  }

  const btnClear = document.getElementById("btn-clear");
  if (btnClear) {
    btnClear.addEventListener("click", clearPendingMoves);
  }

  const btnReset = document.getElementById("btn-reset");
  if (btnReset) {
    btnReset.addEventListener("click", resetAll);
  }

  renderStatus();
});