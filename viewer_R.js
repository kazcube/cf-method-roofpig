// CF Method Cube Viewer v1.0.0R (Roofpig ベース)
// Scramble + 追加アルゴリズムで「状態」を更新して表示する簡易版。
// 将来的にステップ再生などを追加する前提の初期実装です。

(function () {
  // 現在の scramble（20手）と、そこからの追加アルゴリズム
  let scrambleMovesR = "";
  let appliedAlgR = "";

  // 使用する手のリスト（シンプル版）
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

  // 現在の状態（scramble + appliedAlg）を 1 つのアルゴリズム文字列として返す
  function getCurrentStateMoves() {
    const s = scrambleMovesR.trim();
    const a = appliedAlgR.trim();
    if (s && a) return (s + " " + a).trim();
    if (s) return s;
    if (a) return a;
    return "";
  }

  // Roofpig の config 文字列生成（左ビュー用）
  function buildMainConfig() {
    const state = getCurrentStateMoves();
    // flags=canvas で WebGL を避ける（古い環境でも動作しやすくする）
    // setupmoves に状態を入れて、静的にその状態を表示。
    let config = "hover=none|flags=canvas";
    if (state) {
      config = "setupmoves=" + state + "|" + config;
    }
    return config;
  }

  // Roofpig の config 文字列生成（右ビュー用：コーナー強調）
  function buildCornerConfig() {
    const state = getCurrentStateMoves();
    // solved=*-/c で 「コーナー以外」を solved（暗く）
    // colored=*/c で コーナーのみ色付きになる想定
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

    // 左ビュー
    CubeAnimation.create_in_dom("#mainCubeR", mainConfig, "class='roofpig main-view'");

    // 右ビュー（corner-view クラスを追加して CSS で調整しやすくする）
    CubeAnimation.create_in_dom("#cornerCubeR", cornerConfig, "class='roofpig corner-view'");

    // テキストエリアも更新
    const scrambleText = document.getElementById("scrambleTextR");
    const stateText = document.getElementById("stateMovesR");
    if (scrambleText) scrambleText.value = scrambleMovesR;
    if (stateText) stateText.value = getCurrentStateMoves();
  }

  // イベントハンドラ設定
  function setupEvents() {
    const btnRandom = document.getElementById("btnRandomScrambleR");
    const btnReset = document.getElementById("btnResetR");
    const btnApply = document.getElementById("btnApplyAlgR");
    const algInput = document.getElementById("algInputR");

    if (btnRandom) {
      btnRandom.addEventListener("click", function () {
        scrambleMovesR = generateRandomScramble(20);
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

    if (btnApply && algInput) {
      btnApply.addEventListener("click", function () {
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
  }

  // 初期化
  function init() {
    setupEvents();
    // デフォルトは「何もしていない完成状態」
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