// ==============================
// CF Method Cube Viewer v3.1.26
// DOM再生成方式（replaceChild） + シンプル状態管理
// ==============================

var MOVES = ["U","D","L","R","F","B"];
var SUFF  = ["", "'", "2"];
var EDGE_BIASED_MOVES = ["U","D","F","B"]; // Last-6E 用(暫定)

var currentMode  = "apply"; // "apply" or "immediate"
var currentAlg3  = "";      // 3x3 の現在の alg 全体
var currentAlg2  = "";      // Corner の現在の alg 全体

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

// ---- DOM再生成（replaceChild で安全に差し替え） ----
function rebuildCube(divId, alg, extra) {
  var old = document.getElementById(divId);
  if (!old) return;
  var parent = old.parentNode;

  var newDiv = document.createElement("div");
  newDiv.id = divId;
  newDiv.className = "roofpig";
  newDiv.style.width  = "260px";
  newDiv.style.height = "320px";
  newDiv.style.margin = "0 auto 12px auto";

  var cfg = buildConfig(alg, extra);
  newDiv.setAttribute("data-config", cfg);

  parent.replaceChild(newDiv, old);

  if (window.Roofpig && typeof Roofpig.parseAll === "function") {
    Roofpig.parseAll();
  }
}

// ---- Config 文字列生成 ----
function buildConfig(alg, extra) {
  alg = (alg || "").trim();
  var base = "alg=" + alg + "|colors=F:g B:b U:w D:y R:r L:o";
  if (extra) base += "|" + extra;
  return base;
}

// ---- Scramble 系 ----
function randomScramble() {
  var s = generateScramble(20, MOVES);
  document.getElementById("scrambleInput").value = s;
  currentAlg3 = s;
  rebuildCube("cube3", currentAlg3, "hover=3|speed=700");
}

function randomScrambleApply() {
  randomScramble();
}

function randomScrambleApplyCorner() {
  randomScramble();
  currentAlg2 = currentAlg3;
  rebuildCube("cube2", currentAlg2, "pieces=corner|hover=3|speed=700");
}

function last6EScramble() {
  var s = generateScramble(14, EDGE_BIASED_MOVES);
  document.getElementById("scrambleInput").value = s;
  currentAlg3 = s;
  rebuildCube("cube3", currentAlg3, "hover=3|speed=700");
  currentAlg2 = s;
  rebuildCube("cube2", currentAlg2, "pieces=corner|hover=3|speed=700");
}

// ---- 3x3 用 ----
function applyScramble() {
  var scr = document.getElementById("scrambleInput").value || "";
  currentAlg3 = scr;
  rebuildCube("cube3", currentAlg3, "hover=3|speed=700");
}

function resetCube() {
  currentAlg3 = "";
  rebuildCube("cube3", currentAlg3, "hover=3|speed=700");
}

// Apply型：手順欄に追記
function appendMove(m) {
  var ta  = document.getElementById("algInput");
  var cur = ta.value.trim();
  ta.value = cur ? cur + " " + m : m;
}

function applyAlg() {
  var alg = document.getElementById("algInput").value || "";
  currentAlg3 = alg;
  rebuildCube("cube3", currentAlg3, "hover=3|speed=700");
}

function clearAlg() {
  document.getElementById("algInput").value = "";
}

// 即時反映型（currentAlg3 に直書き）
function immediateMove(m) {
  if (currentAlg3) {
    currentAlg3 = currentAlg3 + " " + m;
  } else {
    currentAlg3 = m;
  }
  rebuildCube("cube3", currentAlg3, "hover=3|speed=700");
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
  currentAlg2 = scr;
  rebuildCube("cube2", currentAlg2, "pieces=corner|hover=3|speed=700");
}

function resetCorner() {
  currentAlg2 = "";
  rebuildCube("cube2", currentAlg2, "pieces=corner|hover=3|speed=700");
}

function applyAlgCorner() {
  var alg = document.getElementById("algInputCorner").value || "";
  currentAlg2 = alg;
  rebuildCube("cube2", currentAlg2, "pieces=corner|hover=3|speed=700");
}

function clearAlgCorner() {
  document.getElementById("algInputCorner").value = "";
}

// ---- 初期化 ----
window.onload = function() {
  if (window.Roofpig && typeof Roofpig.parseAll === "function") {
    Roofpig.parseAll();
  }
};
