// CF Method Cube Viewer v1.0.1R (Roofpig ベース)
// Scramble + 追加アルゴリズムで「最終状態」を表示する Viewer。
// レイアウトは v4.8.0 系に近づけてあります。

(function () {
  // 現在の scramble（20手）と、そこからの追加アルゴリズム
  let scrambleMovesR = "";
  let appliedAlgR = "";

  // 使用する手のリスト
  const MOVES = [
    "U", "U'", "U2",
    "R", "R'", "R2",
    "F", "F'", "F2",
    "L", "L'", "L2",
    "B", "B'", "B2",
    "D", "D'", "D2"
  ];

  // 20手のランダムスクランブル生成
  function generateRandomScramble(len) {
    const result = [];
    let prevFace = null;

    for (let i = 0; i < len; i++) {
      while (true) {
        const move = MOVES[Math.floor(Math.random() * MOVES.length)];
        const face = move[0]; // U,R,F,L,B,D
        if (face !== prevFace) {
          result.push(move);
          prevFace = face;
          break;
        }
      }
    }
    return result.join(" ");
  }

  // 現在の状態（scramble + appliedAlg）を 1 つの文字列として返す
  function getCurrentStateMoves() {
    const s = scrambleMovesR.trim();
    const a = appliedAlgR.trim();
    if (s && a) return (s + " " + a).trim();
    if (s) return s;
    if (a) return a;
    return "";
  }

  // Scramble の逆手順を求める（Solve 用）
  function invertMoves(movesStr) {
    const tokens = movesStr.trim().split(/\s+/).filter(Boolean);
    const inv = [];
    for (let i = tokens.length - 1; i >= 0; i--) {
      const m = tokens[i];
      if (!m) continue;
      if (m.endsWith("2") || m.endsWith("2'")) {
        inv.push(m.replace(/2'?$/, "2")); // 2, 2' は 2 に統一
      } else if (m.endsWith("'")) {
        inv.push(m.slice(0, -1)); // R' -> R
      } else {
        inv.push(m + "'");        // R  -> R'
      }
    }
    return inv.join(" ");
  }

  // Roofpig の config 文字列生成（左ビュー用）
  function buildMainConfig() {
    const state = getCurrentStateMoves();
    // flags=canvas で 2D canvas 優先（古い環境でも動作しやすくする）
    let config = "hover=none|flags=canvas";
    if (state) {
      config = "setupmoves=" + state + "|" + config;
    }
    return config;
  }

  // Roofpig の config 文字列生成（右ビュー用：コーナー強調）
  function buildCornerConfig() {
    const state = getCurrentStateMoves();
    // solved=*-/c で コーナー以外を dark gray / colored=*/c でコーナーのみフルカラー
    let config = "hover=none|flags=canvas|solved=*-/c|colored=*/c";
    if (state) {
      config = "setupmoves=" + state + "|" + config;
    }
    return config;
  }

  // Cube を再生成
  function rebuildCubes() {
    if (!window.CubeAnimation) {
      console.error("CubeAnimation (Roofpig) が見つかりません。roofpig_and_three.min.js の読み込みを確認してください。");
      return;
    }

    const mainParent = document.getElementById("mainCubeR");
    const cornerParent = document.getElementById("cornerCubeR");
    if (!mainParent || !cornerParent) return;

    // 既存の中身をクリアして作り直す
    mainParent.innerHTML = "";
    cornerParent.innerHTML = "";

    const mainConfig = buildMainConfig();
    const cornerConfig = buildCornerConfig();

    // 左ビュー（通常 3x3）
    CubeAnimation.create_in_dom("#mainCubeR", mainConfig, "class='roofpig main-view'");

    // 右ビュー（コーナー強調）
    CubeAnimation.create_in_dom("#cornerCubeR", cornerConfig, "class='roofpig corner-view'");

    // テキストエリアを更新
    const scrambleText = document.getElementById("scrambleTextR");
    const stateText = document.getElementById("stateMovesR");
    if (scrambleText) scrambleText.value = scrambleMovesR;
    if (stateText) stateText.value = getCurrentStateMoves();
  }

  // イベントハンドラ設定
  function setupEvents() {
    const btnRandom = document.getElementById("btnRandomScrambleR");
    const btnApplyScramble = document.getElementById("btnApplyScrambleR");
    const btnReset = document.getElementById("btnResetR");
    const btnSolve = document.getElementById("btnSolveR");
    const btnApplyAlg = document.getElementById("btnApplyAlgR");
    const btnClearAlg = document.getElementById("btnClearAlgR");
    const algInput = document.getElementById("algInputR");
    const moveButtons = document.querySelectorAll(".move-btn");

    if (btnRandom) {
      btnRandom.addEventListener("click", function () {
        scrambleMovesR = generateRandomScramble(20);
        appliedAlgR = "";
        rebuildCubes();
      });
    }

    if (btnApplyScramble) {
      btnApplyScramble.addEventListener("click", function () {
        const textarea = document.getElementById("scrambleTextR");
        if (!textarea) return;
        const text = textarea.value.trim();
        scrambleMovesR = text;
        appliedAlgR = "";
        rebuildCubes();
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", function () {
        scrambleMovesR = "";
        appliedAlgR = "";
        rebuildCubes();
      });
    }

    if (btnSolve) {
      btnSolve.addEventListener("click", function () {
        if (!scrambleMovesR.trim()) {
          // Scramble がない場合は単純に完成状態に戻す
          appliedAlgR = "";
        } else {
          // Scramble の逆手順を alg として適用
          appliedAlgR = invertMoves(scrambleMovesR);
        }
        rebuildCubes();
      });
    }

    if (btnApplyAlg && algInput) {
      btnApplyAlg.addEventListener("click", function () {
        const alg = algInput.value.trim();
        if (!alg) return;
        if (appliedAlgR) {
          appliedAlgR = (appliedAlgR + " " + alg).trim();
        } else {
          appliedAlgR = alg;
        }
        rebuildCubes();
      });
    }

    if (btnClearAlg && algInput) {
      btnClearAlg.addEventListener("click", function () {
        appliedAlgR = "";
        algInput.value = "";
        rebuildCubes();
      });
    }

    // 1手追加ボタン
    if (moveButtons && moveButtons.length) {
      moveButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          const mv = btn.getAttribute("data-move");
          if (!mv) return;
          if (algInput) {
            // 入力欄の末尾に追記（見やすさ重視）
            const cur = algInput.value.trim();
            algInput.value = cur ? (cur + " " + mv) : mv;
          }
        });
      });
    }
  }

  // 初期化
  function init() {
    setupEvents();
    scrambleMovesR = "";
    appliedAlgR = "";
    rebuildCubes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();