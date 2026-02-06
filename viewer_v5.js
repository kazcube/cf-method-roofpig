"use strict";

const CFV_VERSION = "v5.1.8";
const CFV_TIMESTAMP = "20260206-1659";

const cubeState = {
  corners: {
    perm: [0, 1, 2, 3, 4, 5, 6, 7],
    ori: [0, 0, 0, 0, 0, 0, 0, 0],
  },
};

const moveHistory = [];

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

function toRoofpigMove(move) {
  if (move === "U") return "U'";
  if (move === "U'") return "U";
  return move;
}

function getAlgString() {
  return moveHistory.join(" ");
}

function updateRoofpig() {
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

  const oldScript = document.querySelector('script[src="roofpig_and_three.min.js"]');
  if (oldScript) {
    oldScript.remove();
  }

  const script = document.createElement("script");
  script.id = "roofpig-script";
  script.src = "roofpig_and_three.min.js";
  document.body.appendChild(script);
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

  const btnU = document.getElementById("btn-u");
  if (!btnU) {
    console.error("[CFV] U button not found.");
    return;
  }

  btnU.addEventListener("click", () => {
    cubeState.corners = rotateU(cubeState.corners);
    moveHistory.push(toRoofpigMove("U"));
    console.log("After U:", cubeState.corners);
    updateRoofpig();
  });
});
