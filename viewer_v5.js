"use strict";

const CFV_VERSION = "v5.1.18";
const CFV_TIMESTAMP = "20260220-1159";

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

function getAlgString() {
  return moveHistory.map(toRoofpigMove).join(" ");
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

function updateRoofpig() {
  const cubeEl = document.querySelector("#cube-container .roofpig");
  if (!cubeEl) {
    console.error("[CFV] .roofpig element not found.");
    return;
  }

  const algString = getAlgString();
  cubeEl.setAttribute("data-config", `alg=${algString}|hover=none`);

  if (!window.Roofpig || typeof Roofpig.parseAll !== "function") {
    console.error("[CFV] Roofpig.parseAll is not available.");
    return;
  }

  Roofpig.parseAll();
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
    updateRoofpig();
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
    updateRoofpig();
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
  updateRoofpig();
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
