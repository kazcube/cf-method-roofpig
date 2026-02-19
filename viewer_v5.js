"use strict";

const CFV_VERSION = "v5.1.16";
const CFV_TIMESTAMP = "20260219-1442";

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
let pendingMoves = [];
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
  const mapped = flip[move] || move;

  if (/\s/.test(mapped) || !/^[URL](2|'|)?$/.test(mapped)) {
    console.error("[CFV] Invalid mapped move:", move, mapped);
    return move;
  }

  return mapped;
}

function getAlgString() {
  const converted = [];
  for (const move of moveHistory) {
    const mapped = toRoofpigMove(move);
    converted.push(mapped);
  }
  const algString = converted.join(" ");
  console.log("algString=", algString);
  return algString;
}

function appendMoveHistory(move) {
  moveHistory.push(move);
  console.log("moveHistory=", moveHistory.join(" "));
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
  try {
    const algString = getAlgString();
    console.log("[updateRoofpig] moveHistory(raw)=", moveHistory.join(" "));
    console.log("[updateRoofpig] algString=", algString);

    const container = document.getElementById("cube-container");
    if (!container) {
      console.error("[CFV] cube-container not found.");
      return;
    }

    container.innerHTML = "";

    const div = document.createElement("div");
    div.className = "roofpig";
    const dataConfig = `alg=${algString}|hover=none`;
    div.setAttribute("data-config", dataConfig);
    console.log("[updateRoofpig] data-config=", dataConfig);
    container.appendChild(div);

    const oldScript = document.getElementById("roofpig-script");
    if (oldScript) {
      oldScript.remove();
    }

    const script = document.createElement("script");
    script.id = "roofpig-script";
    script.src = "roofpig_and_three.min.js";
    document.body.appendChild(script);
  } catch (error) {
    console.error("[CFV] updateRoofpig failed:", error);
  }
}

function onMove(move) {
  if (isPlaying) {
    return;
  }

  console.log("[onMove] input move=", move);
  console.log("[onMove] before push moveHistory(raw)=", moveHistory.join(" "));
  applyMoveToState(move);

  const mapped = toRoofpigMove(move);
  const lastMove = moveHistory[moveHistory.length - 1] || "";
  console.log("lastMove=", lastMove);
  console.log("move=", move, "mapped=", mapped);

  if (mode === "immediate") {
    appendMoveHistory(move);
    console.log("[onMove] after push moveHistory(raw)=", moveHistory.join(" "));
    updateRoofpig();
  } else {
    pendingMoves.push(move);
    console.log("pendingMoves=", pendingMoves.join(" "));
  }

  console.log("After move:", move, cubeState.corners);
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
    renderStatus();
    updateRoofpig();
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
  renderStatus();
  updateRoofpig();
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
