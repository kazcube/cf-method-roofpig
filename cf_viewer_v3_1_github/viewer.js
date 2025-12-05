
// === v3.1 logic based on working v3 HTML ===
const MOVES = ["U","D","L","R","F","B"];
const SUFF = ["", "'", "2"];

function generateScramble(n) {
  let scr = [];
  let lastMove = "";
  for (let i = 0; i < n; i++) {
    let m;
    do {
      m = MOVES[Math.floor(Math.random() * MOVES.length)];
    } while (m === lastMove);
    lastMove = m;
    let s = SUFF[Math.floor(Math.random() * SUFF.length)];
    scr.push(m + s);
  }
  return scr.join(" ");
}

function randomScramble() {
  const s = generateScramble(20);
  document.getElementById("scrambleInput").value = s;
}

function randomScrambleApply() {
  const s = generateScramble(20);
  document.getElementById("scrambleInput").value = s;
  applyScramble();
}

function randomScrambleApplyCorner() {
  const s = generateScramble(20);
  document.getElementById("scrambleInput").value = s;
  applyScramble();
  applyScrambleToCorner();
}

// Last-6E 近似：エッジ寄りを意識して U/D/F/B のみからスクランブル生成
const EDGE_BIASED_MOVES = ["U","D","F","B"];

function generateEdgeBiasedScramble(n) {
  let scr = [];
  let lastMove = "";
  for (let i = 0; i < n; i++) {
    let m;
    do {
      m = EDGE_BIASED_MOVES[Math.floor(Math.random() * EDGE_BIASED_MOVES.length)];
    } while (m === lastMove);
    lastMove = m;
    let s = SUFF[Math.floor(Math.random() * SUFF.length)];
    scr.push(m + s);
  }
  return scr.join(" ");
}

function last6EScramble() {
  const s = generateEdgeBiasedScramble(14);
  document.getElementById("scrambleInput").value = s;
  applyScramble();
  applyScrambleToCorner();
}

function buildConfig(alg, extra) {
  alg = alg || "";
  alg = alg.trim();
  var base = "alg=" + alg + "|colors=F:g B:b U:w D:y R:r L:o";
  if (extra) base += "|" + extra;
  return base;
}

function reparseRoofpig() {
  if (window.Roofpig && typeof window.Roofpig.parseAll === "function") {
    window.Roofpig.parseAll();
  }
}

function applyConfigTo(divId, config) {
  var el = document.getElementById(divId);
  if (!el) return;
  el.setAttribute("data-config", config);
  reparseRoofpig();
}

function applyScramble() {
  var scr = document.getElementById("scrambleInput").value || "";
  var cfg = buildConfig(scr, "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
}

function resetCube() {
  var cfg = buildConfig("", "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
}

// Apply型：手順欄に追記だけ
function appendMove(m) {
  var ta = document.getElementById("algInput");
  var cur = ta.value.trim();
  if (cur.length > 0) {
    ta.value = cur + " " + m;
  } else {
    ta.value = m;
  }
}

function applyAlg() {
  var alg = document.getElementById("algInput").value || "";
  var cfg = buildConfig(alg, "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
}

function clearAlg() {
  document.getElementById("algInput").value = "";
}

// 即時反映型：現在の alg に 1手追記してその場で反映
let immediateAlg = ""; // 現在の即時モード用 alg

function immediateMove(m) {
  if (immediateAlg && immediateAlg.length > 0) {
    immediateAlg = immediateAlg + " " + m;
  } else {
    immediateAlg = m;
  }
  var cfg = buildConfig(immediateAlg, "hover=3|speed=700");
  applyConfigTo("cube3", cfg);
}

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

document.addEventListener("DOMContentLoaded", function() {
  reparseRoofpig();
});
