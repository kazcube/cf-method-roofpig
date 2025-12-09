window.CFV = (function () {
  const MOVES = ["U", "D", "L", "R", "F", "B"];
  const SUFF = ["", "'", "2"];

  let fullAlg = "";
  let lastScrambleAlg = "";
  let stepIndex = 0;

  function getMainCube() {
    return document.getElementById("mainCube");
  }

  function getCornerCube() {
    return document.getElementById("cornerCube");
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
      stepIndex = 0;
      refreshCubes();
      playFromFraction(0);
      stepIndex = tokens.length;
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

    const baseTokens = parseMoves(fullAlg).slice(0, stepIndex);
    const newTokens = baseTokens.concat(addMoves);

    fullAlg = movesToString(newTokens);
    stepIndex = newTokens.length;
    refreshCubes();
  }

  function clearAlgInput() {
    const ta = document.getElementById("algInput");
    if (ta) ta.value = "";
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

    const currentTokens = parseMoves(fullAlg);
    const baseTokens = currentTokens.slice(0, scrMoves.length);
    const newTokens = baseTokens.concat(invMoves);

    fullAlg = movesToString(newTokens);

    const total = newTokens.length;
    const startIndex = scrMoves.length;
    stepIndex = startIndex;

    refreshCubes();

    if (total > 0) {
      const startFraction = startIndex / total;
      playFromFraction(startFraction);
    }
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
    stepForward,
    stepBackward,
    solveFromLastScramble,
  };
})();
