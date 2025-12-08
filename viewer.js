// ==============================
// CF Method Cube Viewer v3.1.28
// algを書き換え + スライダーを末尾に送ってスクランブル表示
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

// ---- Roofpigインスタンス取得 ----
function getRoofpigInstance(divId) {
  try {
    if (!window.Roofpig || !Roofpig.Roofpiglet || !Roofpig.Roofpiglet.instances) return null;
    var inst = Roofpig.Roofpiglet.instances[divId];
    if (inst) return inst;
    for (var k in Roofpig.Roofpiglet.instances) {
      if (!Roofpig.Roofpiglet.instances.hasOwnProperty(k)) continue;
      var obj = Roofpig.Roofpiglet.instances[k];
      if (obj && (obj.divId === divId || (obj.div && obj.div.id === divId))) return obj;
    }
    return null;
  } catch (e) {
    console.warn("getRoofpigInstance error", e);
    return null;
  }
}

// ---- スライダー操作（末尾 or 先頭に送る）----
function setSlider(divId, toEnd) {
  var root = document.getElementById(divId);
  if (!root) return;
  var slider = root.querySelector('input[type="range"]');
  if (!slider) return;
  try {
    slider.value = toEnd ? slider.max : slider.min || 0;
    var ev = document.createEvent("Event");
    ev.initEvent("input", true, true);
    slider.dispatchEvent(ev);
  } catch (e) {
    console.warn("setSlider error", e);
  }
}

// ---- alg 更新 + 再描画（DOMはいじらない）----
function updateAlg(divId, alg, extra, toEnd) {
  var el = document.getElementById(divId);
  if (el) {
    var cfg = buildConfig(alg, extra);
    el.setAttribute("data-config", cfg);
  }

  var rp = getRoofpigInstance(divId);
  if (rp) {
    try {
      if (rp.options) rp.options.alg = alg;
      if (rp.config) rp.config.alg = alg;
      if (rp.state)  rp.state.alg  = alg;
      if (rp.alg)    rp.alg        = alg;

      if (typeof rp.recalc === "function") {
        rp.recalc();
      } else if (typeof rp.setupAnimation === "function") {
        rp.setupAnimation();
      } else if (typeof rp.init === "function") {
        rp.init();
      } else if (typeof rp.parse === "function") {
        rp.parse();
      }
    } catch (e) {
      console.warn("updateAlg error", e);
    }
  }

  // スライダー位置を更新（末尾 or 先頭）
  setSlider(divId, toEnd);
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
  updateAlg("cube3", currentAlg3, "hover=3|speed=700", true);
}

function randomScrambleApply() {
  randomScramble();
}

function randomScrambleApplyCorner() {
  randomScramble();
  currentAlg2 = currentAlg3;
  updateAlg("cube2", currentAlg2, "pieces=corner|hover=3|speed=700", true);
}

function last6EScramble() {
  var s = generateScramble(14, EDGE_BIASED_MOVES);
  document.getElementById("scrambleInput").value = s;
  currentAlg3 = s;
  updateAlg("cube3", currentAlg3, "hover=3|speed=700", true);
  currentAlg2 = s;
  updateAlg("cube2", currentAlg2, "pieces=corner|hover=3|speed=700", true);
}

// ---- 3x3 用 ----
function applyScramble() {
  var scr = document.getElementById("scrambleInput").value || "";
  currentAlg3 = scr;
  updateAlg("cube3", currentAlg3, "hover=3|speed=700", true);
}

function resetCube() {
  currentAlg3 = "";
  updateAlg("cube3", currentAlg3, "hover=3|speed=700", false);
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
  updateAlg("cube3", currentAlg3, "hover=3|speed=700", true);
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
  updateAlg("cube3", currentAlg3, "hover=3|speed=700", true);
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
  updateAlg("cube2", currentAlg2, "pieces=corner|hover=3|speed=700", true);
}

function resetCorner() {
  currentAlg2 = "";
  updateAlg("cube2", currentAlg2, "pieces=corner|hover=3|speed=700", false);
}

function applyAlgCorner() {
  var alg = document.getElementById("algInputCorner").value || "";
  currentAlg2 = alg;
  updateAlg("cube2", currentAlg2, "pieces=corner|hover=3|speed=700", true);
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
