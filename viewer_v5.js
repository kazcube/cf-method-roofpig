"use strict";

const CFV_VERSION = "v5.1.11";
const CFV_TIMESTAMP = "20260216-1551";

const cubeState = {
  corners: {
    perm: [0, 1, 2, 3, 4, 5, 6, 7],
    ori: [0, 0, 0, 0, 0, 0, 0, 0],
  },
};

const moveHistory = [];
let pendingMoves = [];
let mode = "immediate";
let isPlaying = false;
const APPLY_STEP_DELAY_MS = 350;

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
  return moveHistory.join(" ");
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
    const container = document.getElementById("cube-container");
    if (!container) {
      console.error("[CFV] cube-container not found.");
      return;
    }

    container.innerHTML = "";

    const div = document.createElement("div");
    div.className = "roofpig";
    div.setAttribute("data-config", `alg=${getAlgString()}|hover=none`);
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

  applyMoveToState(move);

  const roofpigMove = toRoofpigMove(move);
  if (mode === "immediate") {
    moveHistory.push(roofpigMove);
    updateRoofpig();
  } else {
    pendingMoves.push(roofpigMove);
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

  let i = 0;
  const step = () => {
    if (i >= movesToApply.length) {
      isPlaying = false;
      return;
    }

    moveHistory.push(movesToApply[i]);
    renderStatus();
    updateRoofpig();
    i += 1;
    setTimeout(step, APPLY_STEP_DELAY_MS);
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

  renderStatus();
});
