(() => {

const V6_VERSION = "v6.0.0";

const cubeState = {
  history: [],
  pending: [],
  mode: "immediate",
  speedMs: 600,
  isPlaying: false,
  nowMove: ""
};

const COLORS_STANDARD = "colors=U:w D:y F:g B:b R:r L:o";
const FLAGS = "flags=startsolved";

const BASE_CFG = [
  "pov=Ufr",
  "size=260",
  "view=3d",
  COLORS_STANDARD,
  FLAGS
];

const elCubeHost = document.getElementById("cubeHost");
const elStatus = document.getElementById("statusBox");
const elSpeedRange = document.getElementById("speedRange");
const elSpeedLabel = document.getElementById("speedLabel");

function joinAlg(moves) {
  return moves.join(" ").trim();
}

function renderStatus() {
  elStatus.textContent =
`history : ${joinAlg(cubeState.history) || "(empty)"}
pending : ${joinAlg(cubeState.pending) || "(empty)"}
mode    : ${cubeState.mode}
speed   : ${cubeState.speedMs} ms
nowMove : ${cubeState.nowMove || "-"}`;
}

function buildConfig(setupMoves, algMoves, speedMs) {
  const parts = [...BASE_CFG];
  parts.push(`speed=${speedMs}`);
  if (setupMoves) parts.push(`setupmoves=${setupMoves}`);
  if (algMoves) parts.push(`alg=${algMoves}`);
  return parts.join(" | ");
}

function recreate(setupMoves, algMoves, speedMs) {
  elCubeHost.innerHTML = "";
  const cfg = buildConfig(setupMoves, algMoves, speedMs);
  CubeAnimation.create_in_dom(elCubeHost, cfg, "class='roofpig'");
}

function animateSingle(move) {
  const prefix = cubeState.history.slice(0, -1);
  recreate(joinAlg(prefix), move, cubeState.speedMs);
}

function showState() {
  recreate(joinAlg(cubeState.history), "", 0);
}

function execute(move) {
  if (cubeState.mode === "immediate") {
    cubeState.history.push(move);
    cubeState.nowMove = move;
    renderStatus();
    animateSingle(move);
    setTimeout(() => {
      cubeState.nowMove = "";
      renderStatus();
    }, cubeState.speedMs + 50);
  } else {
    cubeState.pending.push(move);
    renderStatus();
  }
}

function applyQueue() {
  if (cubeState.pending.length === 0) return;
  const step = () => {
    if (cubeState.pending.length === 0) return;
    const mv = cubeState.pending.shift();
    cubeState.history.push(mv);
    cubeState.nowMove = mv;
    renderStatus();
    animateSingle(mv);
    setTimeout(step, cubeState.speedMs + 80);
  };
  step();
}

document.querySelectorAll("button[data-m]").forEach(btn => {
  btn.addEventListener("click", () => execute(btn.dataset.m));
});

document.getElementById("btnApply").onclick = applyQueue;
document.getElementById("btnClear").onclick = () => {
  cubeState.pending = [];
  renderStatus();
};
document.getElementById("btnReset").onclick = () => {
  cubeState.history = [];
  cubeState.pending = [];
  cubeState.nowMove = "";
  renderStatus();
  showState();
};

document.querySelectorAll("input[name='mode']").forEach(r => {
  r.addEventListener("change", () => {
    if (r.checked) cubeState.mode = r.value;
  });
});

elSpeedRange.oninput = () => {
  cubeState.speedMs = parseInt(elSpeedRange.value, 10);
  elSpeedLabel.textContent = cubeState.speedMs + " ms";
  renderStatus();
};

renderStatus();
showState();

})();