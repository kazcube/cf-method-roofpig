// ==============================
// CF Method Cube Viewer v3.1.22
// ボタン挙動一式（3x3 + Corner）
// ==============================

const MOVES = ["U","D","L","R","F","B"];
const SUFF  = ["", "'", "2"];
const EDGE_BIASED_MOVES = ["U","D","F","B"]; // Last-6E 用(暫定)

// ---- Scramble 生成 ----
function generateScramble(n, moveset) {
  moveset = moveset || MOVES;
  let scr = [];
  let last = "";
  for (let i = 0; i < n; i++) {
    let m;
    do {
      m = moveset[Math.floor(Math.random() * moveset.length)];
    } while (m === last);
    last = m;
    let s = SUFF[Math.floor(Math.random() * SUFF.length)];
    scr.push(m + s);
  }
  return scr.join(" ");
}

function randomScramble() {
  const s = generateScramble(20, MOVES);
  document.getElementById("scrambleInput").value = s;
}

function randomScrambleApply() {
  randomScramble();
  applyScramble();
}

function randomScrambleApplyCorner() {
  randomScramble();
  applyScramble();
  applyScrambleToCorner();
}

function last6EScramble() {
  const s = generateScramble(14, EDGE_BIASED_MOVES);
  document.getElementById("scrambleInput").value = s;
  applyScramble();
  applyScrambleToCorner();
}

// ---- Roofpig 設定系 ----
function buildConfig(alg, extra) {
  alg = (alg || "").trim();
  let base = "alg=" + alg + "|colors=F:g B:b U:w D:y R:r L:o";
  if (extra) base += "|" + extra;
  return base;
}

function reparseRoofpig() {
  if (window.Roofpig && typeof window.Roofpig.parseAll === "function") {
    Roofpig.parseAll();
  }
}

function applyConfigTo(divId, config) {
  const el = document.getElementById(divId);
  if (!el) return;
  el.setAttribute("data-config", config);
  reparseRoofpig();
}

// ---- 3x3 用 ----
function applyScramble() {
  const scr = document.getElementById("scrambleInput").value || "";
  const cfg = buildConfig(scr, "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
}

function resetCube() {
  const cfg = buildConfig("", "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
}

// Apply型：手順欄に追記
function appendMove(m) {
  const ta  = document.getElementById("algInput");
  const cur = ta.value.trim();
  ta.value = cur ? cur + " " + m : m;
}

function applyAlg() {
  const alg = document.getElementById("algInput").value || "";
  const cfg = buildConfig(alg, "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
}

function clearAlg() {
  document.getElementById("algInput").value = "";
}

// 即時反映型
let immediateAlg = "";

function immediateMove(m) {
  immediateAlg = immediateAlg ? immediateAlg + " " + m : m;
  const cfg = buildConfig(immediateAlg, "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
}

// ---- Corner-only 用 ----
function applyScrambleToCorner() {
  const scr = document.getElementById("scrambleInput").value || "";
  const cfg = buildConfig(scr, "pieces=corner|hover=3|speed=700");
  applyConfigTo("cube2", cfg);
}

function resetCorner() {
  const cfg = buildConfig("", "pieces=corner|hover=3|speed=700");
  applyConfigTo("cube2", cfg);
}

function applyAlgCorner() {
  const alg = document.getElementById("algInputCorner").value || "";
  const cfg = buildConfig(alg, "pieces=corner|hover=3|speed=700");
  applyConfigTo("cube2", cfg);
}

function clearAlgCorner() {
  document.getElementById("algInputCorner").value = "";
}

// ---- 初期化 ----
window.onload = function() {
  reparseRoofpig();
};
