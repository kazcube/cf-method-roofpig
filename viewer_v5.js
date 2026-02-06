"use strict";

function getJstTimestamp() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    jst.getUTCFullYear() +
    pad(jst.getUTCMonth() + 1) +
    pad(jst.getUTCDate()) +
    "-" +
    pad(jst.getUTCHours()) +
    pad(jst.getUTCMinutes())
  );
}

const CFV_VERSION = "v5.1.0";
const CFV_TIMESTAMP = getJstTimestamp();

console.log(
  "%c[CFV]",
  "color:#4CAF50;font-weight:bold;",
  `CF Method Cube Viewer ${CFV_VERSION}`,
  `(JST ${CFV_TIMESTAMP})`
);

function createRandomScramble(length = 20) {
  const faces = ["U", "D", "R", "L", "F", "B"];
  const suffixes = ["", "'", "2"];
  const scramble = [];

  while (scramble.length < length) {
    const face = faces[Math.floor(Math.random() * faces.length)];
    const prev = scramble[scramble.length - 1];

    if (prev && prev[0] === face) {
      continue;
    }

    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    scramble.push(face + suffix);
  }

  return scramble.join(" ");
}

document.addEventListener("DOMContentLoaded", () => {
  const headerText = `CF Method Cube Viewer ${CFV_VERSION} | JST ${CFV_TIMESTAMP}`;
  document.title = headerText;

  const appTitle = document.getElementById("app-title");
  if (appTitle) {
    appTitle.textContent = headerText;
  }

  if (!window.Roofpig || typeof Roofpig.parseAll !== "function") {
    console.error("[CFV] Roofpig not found. Check roofpig script path.");
    return;
  }

  Roofpig.parseAll();

  const rp = document.getElementById("cube");
  if (!rp) {
    return;
  }

  const runSingleAlg = (alg) => {
    rp.alg = alg;
    rp.setMove(0);
    rp.play();
  };

  document.querySelector('[data-action="scramble"]').addEventListener("click", () => {
    runSingleAlg(createRandomScramble(20));
  });

  document.querySelector('[data-action="reset"]').addEventListener("click", () => {
    runSingleAlg("");
  });

  document.querySelectorAll("#move-buttons [data-move]").forEach((btn) => {
    btn.addEventListener("click", () => {
      runSingleAlg(btn.dataset.move);
    });
  });
});
