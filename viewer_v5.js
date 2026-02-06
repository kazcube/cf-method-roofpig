"use strict";

const CFV_VERSION = "v5.1.5";
const CFV_TIMESTAMP = "20260206-1550";

const cubeState = {
  corners: {
    perm: [0, 1, 2, 3, 4, 5, 6, 7],
    ori: [0, 0, 0, 0, 0, 0, 0, 0],
  },
};

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
    console.log("After U:", cubeState.corners);
  });
});
