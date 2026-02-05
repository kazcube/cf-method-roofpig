window.CFV = (function () {
  const MOVES = ["U", "D", "L", "R", "F", "B"];
  const SUFF = ["", "'", "2"];

  let fullAlg = "";
  let lastScrambleAlg = "";
  let stepIndex = 0;
  let faceMoveMode = "apply";

  function getMainCube() {
    return document.getElementById("mainCube");
  }

  function getCornerCube() {
    return document.getElementById("cornerCubeBack") || document.getElementById("cornerCube");
  }

  function parseMoves(str) {
    if (!str) return [];
    return str
      .split(/\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("//"));
  }

  function movesToString(moves) {
    return moves.join(" ");
  }

  function generateScramble(n = 20) {
    const out = [];
    let lastFace = "";
    for (let i = 0; i < n; i++) {
      let face;
      do {
        face = MOVES[Math.floor(Math.random() * MOVES.length)];
      } while (face === lastFace);
      lastFace = face;
      const suff = SUFF[Math.floor(Math.random() * SUFF.length)];
      out.push(face + suff);
    }
    return out;
  }

  function invertMoves(moves) {
    const inv = [];
    for (let i = moves.length - 1; i >= 0; i--) {
      const m = moves[i];
      if (!m) continue;
      if (m.endsWith("2")) {
        inv.push(m);
      } else if (m.endsWith("'")) {
        inv.push(m.slice(0, -1));
      } else {
        inv.push(m + "'");
      }
    }
    return inv;
  }

  function refreshCubes() {
    const main = getMainCube();
    const corner = getCornerCube();
    if (!main || !corner) return;

    const tokens = parseMoves(fullAlg);
    const clampedIndex = Math.max(0, Math.min(stepIndex, tokens.length));
    stepIndex = clampedIndex;

    const prefix = movesToString(tokens.slice(0, clampedIndex));
    main.alg = prefix;
    corner.alg = prefix;
  }

  function playFromFraction(t) {
    const main = getMainCube();
    const corner = getCornerCube();
    if (!main || !corner) return;

    main.alg = fullAlg;
    corner.alg = fullAlg;

    if (main.timeline && typeof main.timeline.set === "function") {
      try {
        main.timeline.set(Math.max(0, Math.min(1, t)));
      } catch (e) {
        console.warn("timeline.set エラー:", e);
      }
    }
    if (typeof main.play === "function") {
      main.play();
    }
  }

  function randomScramble() {
    const scrambleMoves = generateScramble(20);
    const scrambleStr = movesToString(scrambleMoves);

    lastScrambleAlg = scrambleStr;
    fullAlg = scrambleStr;

    const ta = document.getElementById("scrambleInput");
    if (ta) ta.value = scrambleStr;

    const showPath = document.getElementById("showScramblePath");
    const tokens = scrambleMoves;

    if (showPath && showPath.checked) {
      // 完成状態から 1 手ずつスクランブルを適用するアニメーション
      stepIndex = 0;
      refreshCubes();

      const main = getMainCube();
      const corner = getCornerCube();
      if (!main || !corner) return;

      let i = 0;
      function step() {
        if (i > tokens.length) return;
        stepIndex = i;
        refreshCubes();
        i += 1;
        if (i <= tokens.length) {
          setTimeout(step, 80);
        }
      }
      step();
    } else {
      stepIndex = tokens.length;
      refreshCubes();
    }
  }

  function applyScrambleFromText() {
    const ta = document.getElementById("scrambleInput");
    if (!ta) return;
    const moves = parseMoves(ta.value);
    const scrambleStr = movesToString(moves);

    lastScrambleAlg = scrambleStr;
    fullAlg = scrambleStr;
    stepIndex = moves.length;

    refreshCubes();
  }

  function resetAll() {
    fullAlg = "";
    lastScrambleAlg = "";
    stepIndex = 0;

    const main = getMainCube();
    const corner = getCornerCube();
    if (main) main.alg = "";
    if (corner) corner.alg = "";

    const taScr = document.getElementById("scrambleInput");
    const taAlg = document.getElementById("algInput");
    if (taScr) taScr.value = "";
    if (taAlg) taAlg.value = "";
  }

  function applyAlgFromText() {
    const ta = document.getElementById("algInput");
    if (!ta) return;
    const addMoves = parseMoves(ta.value);
    if (addMoves.length === 0) return;

    const modeEl = document.querySelector('input[name="algApplyMode"]:checked');
    const mode = modeEl ? modeEl.value : 'apply';

    const baseTokens = parseMoves(fullAlg).slice(0, stepIndex);
    const newTokens = baseTokens.concat(addMoves);
    fullAlg = movesToString(newTokens);

    if (mode === 'apply') {
      // 一発で適用
      stepIndex = newTokens.length;
      refreshCubes();
    } else {
      // Immediate: 現在位置から 1 手ずつ適用
      const tokens = newTokens;
      const main = getMainCube();
      const corner = getCornerCube();
      if (!main || !corner) return;

      let i = baseTokens.length;
      function step() {
        if (i > tokens.length) return;
        stepIndex = i;
        refreshCubes();
        i += 1;
        if (i <= tokens.length) {
          setTimeout(step, 80);
        }
      }
      step();
    }
  }

  function clearAlgInput() {
    const ta = document.getElementById("algInput");
    if (ta) ta.value = "";
  }

  function appendMoveToAlgInput(move) {
    if (!move) return;
    const ta = document.getElementById("algInput");
    if (!ta) return;
    const next = ta.value ? `${ta.value.trim()} ${move}` : move;
    ta.value = next;
  }

  function normalizeFaceMove(move) {
    if (!move) return "";
    return move.trim().replace("’", "'");
  }

  function isValidFaceMove(move) {
    return /^[URFDLB](?:'|2)?$/.test(move);
  }

  function applyFaceMoveToAlgInput(move) {
    if (!move) return;
    appendMoveToAlgInput(move);
  }

  function setMode(mode) {
    if (mode !== "apply" && mode !== "immediate") return;
    faceMoveMode = mode;
  }

   function moveButton(move) {
   const rawMove = move;
   if (!rawMove) return;

   const normalized = normalizeFaceMove(rawMove);
   if (!normalized) return;
   if (!isValidFaceMove(normalized)) return;

   if (faceMoveMode === "apply") {
     applyFaceMoveToAlgInput(normalized);
   }

   appendMove(normalized);
  }


  function appendMove(move) {
    if (!move) return;
    const baseTokens = parseMoves(fullAlg).slice(0, stepIndex);
    baseTokens.push(move);
    fullAlg = movesToString(baseTokens);
    stepIndex = baseTokens.length;
    refreshCubes();
  }

  function stepForward() {
    const tokens = parseMoves(fullAlg);
    if (stepIndex >= tokens.length) return;
    stepIndex += 1;
    refreshCubes();
  }

  function stepBackward() {
    if (stepIndex <= 0) return;
    stepIndex -= 1;
    refreshCubes();
  }

  function solveFromLastScramble() {
    const scrMoves = parseMoves(lastScrambleAlg);
    if (scrMoves.length === 0) {
      console.warn("Solve: lastScrambleAlg がありません。");
      return;
    }
    const invMoves = invertMoves(scrMoves);
    const tokens = scrMoves.concat(invMoves);

    fullAlg = movesToString(tokens);

    const main = getMainCube();
    const corner = getCornerCube();
    if (!main || !corner) return;

    // スクランブル状態にセット
    stepIndex = scrMoves.length;
    refreshCubes();

    // スクランブル状態から逆手順だけ 1 手ずつ再生
    let i = scrMoves.length;
    function step() {
      if (i > tokens.length) return;
      stepIndex = i;
      refreshCubes();
      i += 1;
      if (i <= tokens.length) {
        setTimeout(step, 80);
      }
    }
    step();
  }

  document.addEventListener("DOMContentLoaded", () => {
    refreshCubes();
  });

  return {
    randomScramble,
    applyScrambleFromText,
    resetAll,
    applyAlgFromText,
    clearAlgInput,
    appendMove,
    moveButton,
    stepForward,
    stepBackward,
    setMode,
    solveFromLastScramble,
  };
})();

if (window.CFV) {
  window.setMode = window.CFV.setMode;
  window.moveButton = window.CFV.moveButton;
}
