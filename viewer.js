// CF Method Cube Viewer v4.5.2
//  - Scramble 過程 ON: 完成 -> スクランブル までをアニメ再生し、スクランブル状態で停止
//  - Scramble 過程 OFF: 一気にスクランブル状態へ
//  - Solve: 直近 Scramble の逆手順を、スクランブル状態から完成まで再生
//  - 1手進む / 1手戻る: fullAlg 全体を stepIndex で部分適用
//  - Corner Viewer: mainCube と同じ構図・色・手順で同期表示（コーナーのみ強調）

window.CFV = (function () {
  const MOVES = ["U", "D", "L", "R", "F", "B"];
  const SUFF = ["", "'", "2"];

  let fullAlg = "";        // 現在の「全手順」
  let lastScrambleAlg = ""; // 直近の Scramble 手順
  let stepIndex = 0;       // 何手目まで適用しているか

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
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("//"));
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

  function randomScramble() {
    const scrambleMoves = generateScramble(20);
    const scrambleStr = movesToString(scrambleMoves);

    lastScrambleAlg = scrambleStr;
    fullAlg = scrambleStr;

    const ta = document.getElementById("scrambleInput");
    if (ta) ta.value = scrambleStr;

    const showPath = document.getElementById("showScramblePath");
    const main = getMainCube();
    const corner = getCornerCube();
    if (!main || !corner) return;

    if (showPath && showPath.checked) {
      // 完成 -> スクランブル までをアニメーション再生
      stepIndex = 0;

      // いったん停止＆初期化
      if (typeof main.pause === "function") {
        try { main.pause(); } catch (e) { console.warn("pause エラー:", e); }
      }

      // Scramble 手順を新たにセット
      main.alg = scrambleStr;
      corner.alg = scrambleStr;

      // タイムラインを先頭に戻す
      if (main.timeline && typeof main.timeline.set === "function") {
        try {
          main.timeline.set(0);
        } catch (e) {
          console.warn("timeline.set エラー:", e);
        }
      }

      // 状態が反映されてから再生開始
      setTimeout(function () {
        if (typeof main.play === "function") {
          try {
            main.play();
          } catch (e) {
            console.warn("play エラー:", e);
          }
        }
      }, 0);

      // 内部状態としては「スクランブル完了位置」まで進んだことにしておく
      stepIndex = scrambleMoves.length;
    } else {
      // 過程なし：スクランブル状態のみ表示
      stepIndex = scrambleMoves.length;
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

    const main = getMainCube();
    const corner = getCornerCube();
    if (!main || !corner) return;

    // solve 部分のみを再生するため、全体を渡して startIndex/total から再生
    if (typeof main.pause === "function") {
      try { main.pause(); } catch (e) { console.warn("pause エラー:", e); }
    }

    main.alg = fullAlg;
    corner.alg = fullAlg;

    if (main.timeline && typeof main.timeline.set === "function") {
      try {
        main.timeline.set(startIndex / total);
      } catch (e) {
        console.warn("timeline.set エラー:", e);
      }
    }

    setTimeout(function () {
      if (typeof main.play === "function") {
        try {
          main.play();
        } catch (e) {
          console.warn("play エラー:", e);
        }
      }
    }, 0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    refreshCubes();
  });

  return {
    randomScramble: randomScramble,
    applyScrambleFromText: applyScrambleFromText,
    resetAll: resetAll,
    applyAlgFromText: applyAlgFromText,
    clearAlgInput: clearAlgInput,
    appendMove: appendMove,
    stepForward: stepForward,
    stepBackward: stepBackward,
    solveFromLastScramble: solveFromLastScramble
  };
})();
