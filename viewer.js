// ==============================
// CF Method Cube Viewer v3.1.23
// ボタン挙動一式（3x3 + Corner）
// ==============================

var MOVES = ["U","D","L","R","F","B"];
var SUFF  = ["", "'", "2"];
var EDGE_BIASED_MOVES = ["U","D","F","B"]; // Last-6E 用(暫定)

var currentMode = "apply";   // "apply" or "immediate"
var immediateAlg = "";       // 即時モード用

function setMode(mode) {
  currentMode = mode;
}

// ---- Scramble 生成 ----
function generateScramble(n, moveset) {
  moveset = moveset || MOVES;
  var scr = [];
  var last = "";
  for (var i = 0; i < n; i++) {
    var m;
    do {
      m = moveset[Math.floor(Math.random() * moveset.length)];
    } while (m === last);
    last = m;
    var s = SUFF[Math.floor(Math.random() * SUFF.length)];
    scr.push(m + s);
  }
  return scr.join(" ");
}

function randomScramble() {
  var s = generateScramble(20, MOVES);
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
  var s = generateScramble(14, EDGE_BIASED_MOVES);
  document.getElementById("scrambleInput").value = s;
  applyScramble();
  applyScrambleToCorner();
}

// ---- Roofpig 設定系 ----
function buildConfig(alg, extra) {
  alg = (alg || "").trim();
  var base = "alg=" + alg + "|colors=F:g B:b U:w D:y R:r L:o";
  if (extra) base += "|" + extra;
  return base;
}

function reparseRoofpig() {
  if (window.Roofpig && typeof window.Roofpig.parseAll === "function") {
    Roofpig.parseAll();
  }
}

function applyConfigTo(divId, config) {
  var el = document.getElementById(divId);
  if (!el) return;
  el.setAttribute("data-config", config);
  reparseRoofpig();
}

// ---- 3x3 用 ----
function applyScramble() {
  var scr = document.getElementById("scrambleInput").value || "";
  var cfg = buildConfig(scr, "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
  // 即時モード用の履歴はリセット
  immediateAlg = "";
}

function resetCube() {
  var cfg = buildConfig("", "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
  immediateAlg = "";
}

// Apply型：手順欄に追記
function appendMove(m) {
  var ta  = document.getElementById("algInput");
  var cur = ta.value.trim();
  ta.value = cur ? cur + " " + m : m;
}

function applyAlg() {
  var alg = document.getElementById("algInput").value || "";
  var cfg = buildConfig(alg, "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
}

function clearAlg() {
  document.getElementById("algInput").value = "";
}

// 即時反映型
function immediateMove(m) {
  if (immediateAlg) {
    immediateAlg = immediateAlg + " " + m;
  } else {
    immediateAlg = m;
  }
  var cfg = buildConfig(immediateAlg, "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
}

function moveButton(m) {
  if (currentMode === "apply") {
    appendMove(m);
  } else {
    immediateMove(m);
  }
}

// ---- Corner-only 用 ----
function applyScrambleToCorner() {
  var scr = document.getElementById("scrambleInput").value || "";
  var cfg = buildConfig(scr, "pieces=corner|hover=3|speed=700");
  applyConfigTo("cube2", cfg);
}

function resetCorner() {
  var cfg = buildConfig("", "pieces=corner|hover=3|speed=700");
  applyConfigTo("cube2", cfg);
}

function applyAlgCorner() {
  var alg = document.getElementById("algInputCorner").value || "";
  var cfg = buildConfig(alg, "pieces=corner|hover=3|speed=700");
  applyConfigTo("cube2", cfg);
}

function clearAlgCorner() {
  document.getElementById("algInputCorner").value = "";
}

// ---- 初期化 ----
window.onload = function() {
  reparseRoofpig();
};
