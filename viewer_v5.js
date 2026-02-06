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

const CFV_VERSION = "v5.1.5";
const CFV_TIMESTAMP = "20260206-1550";

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

  if (!window.CubeAnimation || !CubeAnimation.by_id) {
    console.error("[CFV] CubeAnimation.by_id is not available.");
    return;
  }

  const cubeIds = Object.keys(CubeAnimation.by_id);
  if (cubeIds.length === 0) {
    console.error("[CFV] No Roofpig cube instances were created.");
    return;
  }

  const rp = CubeAnimation.by_id[cubeIds[0]];

  if (!rp.world3d) {
    console.error("[CFV] rp.world3d is not available.");
    return;
  }

  if (typeof Alg !== "function") {
    console.error("[CFV] Alg is not available.");
    return;
  }

  const runSingleAlg = (algText) => {
    const alg = new Alg(algText, rp.world3d, rp.algdisplay, rp.config.speed, rp.dom);
    rp.add_changer("pieces", alg.play());
  };

  const runReset = () => {
    if (rp.alg && typeof rp.alg.to_start === "function" && typeof OneChange === "function") {
      rp.add_changer(
        "pieces",
        new OneChange(() => {
          return rp.alg.to_start(rp.world3d);
        })
      );
      return;
    }

    const alg = new Alg("", rp.world3d, rp.algdisplay, rp.config.speed, rp.dom);
    rp.add_changer("pieces", alg.play());
  };

  document.querySelector('[data-action="scramble"]').addEventListener("click", () => {
    runSingleAlg(createRandomScramble(20));
  });

  document.querySelector('[data-action="reset"]').addEventListener("click", () => {
    runReset();
  });

  document.querySelectorAll("#move-buttons [data-move]").forEach((btn) => {
    btn.addEventListener("click", () => {
      runSingleAlg(btn.dataset.move);
    });
  });
});
