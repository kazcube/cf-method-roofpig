
// CF Method Cube Viewer v1.0.0N (Non-WebGL)
// 2D Canvas で常に「完成状態」を描画するテスト版。
// 将来的に Scramble / Alg と連動させていく前提の土台です。

(function () {
  const mainCanvas = document.getElementById("mainCanvas");
  const cornerCanvas = document.getElementById("cornerCanvas");
  const scrambleText = document.getElementById("scrambleText");
  const stateMoves = document.getElementById("stateMoves");
  const algInput = document.getElementById("algInput");

  const ctxMain = mainCanvas.getContext("2d");
  const ctxCorner = cornerCanvas.getContext("2d");

  // 色設定（標準色）
  const colors = {
    U: "#ffffff", // white
    D: "#ffff00", // yellow
    F: "#00aa00", // green
    B: "#0000aa", // blue
    R: "#dd0000", // red
    L: "#ff8800", // orange
    border: "#222222",
  };

  // 完成状態のシンプルな 2D 表示：上(U) + 前(F) + 右(R) を斜めに描画
  function drawSolvedCube(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const size = 40;      // 1 sticker size
    const gap = 2;
    const offsetX = 20;
    const offsetY = 20;

    // U face (3x3)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = offsetX + c * (size + gap);
        const y = offsetY + r * (size + gap);
        drawSticker(ctx, x, y, size, colors.U);
      }
    }

    // F face (3x3) 下に
    const fy = offsetY + 3 * (size + gap) + 5;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = offsetX + c * (size + gap);
        const y = fy + r * (size + gap);
        drawSticker(ctx, x, y, size, colors.F);
      }
    }

    // R face (3x3) 右に
    const rx = offsetX + 3 * (size + gap) + 5;
    const ry = offsetY + 3 * (size + gap) + 5;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = rx + c * (size + gap);
        const y = ry + r * (size + gap);
        drawSticker(ctx, x, y, size, colors.R);
      }
    }
  }

  // Corner 強調ビュー：Corner を色付き、Edge/Center をグレーに
  function drawSolvedCornerView(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const size = 40;
    const gap = 2;
    const offsetX = 20;
    const offsetY = 20;

    // U face
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = offsetX + c * (size + gap);
        const y = offsetY + r * (size + gap);
        const isCorner = (r === 0 || r === 2) && (c === 0 || c === 2);
        const color = isCorner ? colors.U : "#555555";
        drawSticker(ctx, x, y, size, color);
      }
    }

    // F face
    const fy = offsetY + 3 * (size + gap) + 5;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = offsetX + c * (size + gap);
        const y = fy + r * (size + gap);
        const isCorner = (r === 0 || r === 2) && (c === 0 || c === 2);
        const color = isCorner ? colors.F : "#555555";
        drawSticker(ctx, x, y, size, color);
      }
    }

    // R face
    const rx = offsetX + 3 * (size + gap) + 5;
    const ry = offsetY + 3 * (size + gap) + 5;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x = rx + c * (size + gap);
        const y = ry + r * (size + gap);
        const isCorner = (r === 0 || r === 2) && (c === 0 || c === 2);
        const color = isCorner ? colors.R : "#555555";
        drawSticker(ctx, x, y, size, color);
      }
    }
  }

  function drawSticker(ctx, x, y, size, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  }

  // Scramble 生成（手順テキストのみ）
  const basicMoves = [
    "U","U'","U2",
    "R","R'","R2",
    "F","F'","F2",
    "L","L'","L2",
    "B","B'","B2",
    "D","D'","D2"
  ];

  function generateScramble(n) {
    const res = [];
    let prevFace = null;
    for (let i = 0; i < n; i++) {
      let mv;
      while (true) {
        mv = basicMoves[Math.floor(Math.random() * basicMoves.length)];
        const face = mv[0];
        if (face !== prevFace) {
          prevFace = face;
          break;
        }
      }
      res.push(mv);
    }
    return res.join(" ");
  }

  function updateStateText(scramble, alg) {
    const parts = [];
    if (scramble) parts.push(scramble);
    if (alg) parts.push(alg);
    stateMoves.value = parts.join(" ");
  }

  // イベント設定
  function setupUI() {
    document.getElementById("btnRandomScramble").onclick = () => {
      const s = generateScramble(20);
      scrambleText.value = s;
      updateStateText(s, algInput.value.trim());
    };

    document.getElementById("btnReset").onclick = () => {
      scrambleText.value = "";
      algInput.value = "";
      updateStateText("", "");
    };

    document.getElementById("btnApplyAlg").onclick = () => {
      updateStateText(scrambleText.value.trim(), algInput.value.trim());
    };

    document.getElementById("btnClearAlg").onclick = () => {
      algInput.value = "";
      updateStateText(scrambleText.value.trim(), "");
    };
  }

  function init() {
    drawSolvedCube(ctxMain);
    drawSolvedCornerView(ctxCorner);
    setupUI();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
