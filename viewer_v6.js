/* CF Method Cube Viewer v6.0.0
   - Roofpig: DOM再生成 + CubeAnimation.create_in_dom() のみ使用
   - next_move / Alg内部操作は禁止
   - Single Source of Truth: cubeState
*/

(() => {
  const V6_VERSION = "v6.0.0";
  const JSTStamp = () => {
    // JST固定で表示（UTC+9）
    const d = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const iso = d.toISOString().replace("T", " ").slice(0, 19);
    return `${iso} JST`;
  };

  // ====== Single Source of Truth ======
  const cubeState = {
    history: [],       // 確定手順
    pending: [],       // Apply待ち
    mode: "immediate", // "immediate" | "apply"
    speedMs: 600,
    isPlaying: false,
    nowMove: ""
  };

  // ====== Roofpig config ======
  // 世界標準配色（一般的）：U白 D黄 F緑 B青 R赤 L橙
  const COLORS_STANDARD = "colors=U:w D:y F:g B:b R:r L:o";

  // startsolved: 常にsolvedから作る（setupmovesで状態を作る）
  const FLAGS = "flags=startsolved";

  // レイアウトはまず固定（必要なら後で調整）
  // ※ RoofpigのパラメータはREADMEに準拠。必要ならここで追加。
  const BASE_CFG = [
    "pov=Ufr",          // 視点
    "size=280",         // 表示サイズ
    "view=3d",          // 3d表示
    COLORS_STANDARD,
    FLAGS
  ];

  // ====== DOM refs ======
  const elTitle = document.getElementById("titleH1");
  const elCubeHost = document.getElementById("cubeHost");
  const elStatus = document.getElementById("statusBox");
  const elSpeedRange = document.getElementById("speedRange");
  const elSpeedLabel = document.getElementById("speedLabel");
  const elBtnApply = document.getElementById("btnApply");
  const elBtnClear = document.getElementById("btnClear");
  const elBtnReset = document.getElementById("btnReset");

  // ====== Safety checks ======
  function assertRoofpigAvailable() {
    if (typeof window.CubeAnimation?.create_in_dom !== "function") {
      throw new Error("Roofpig (CubeAnimation.create_in_dom) が見つかりません。roofpig_and_three.min.js の読み込みパスを確認してください。");
    }
  }

  // ====== Helpers ======
  function joinAlg(moves) {
    return moves.join(" ").trim();
  }

  function setButtonsDisabled(disabled) {
    document.querySelectorAll("button[data-m]").forEach(b => (b.disabled = disabled));
    elBtnApply.disabled = disabled;
    elBtnClear.disabled = disabled;
    elBtnReset.disabled = disabled;
    document.querySelectorAll("input[name='mode']").forEach(r => (r.disabled = disabled));
    elSpeedRange.disabled = disabled;
  }

  function renderStatus() {
    const historyStr = joinAlg(cubeState.history);
    const pendingStr = joinAlg(cubeState.pending);
    elStatus.textContent =
`version : ${V6_VERSION}
time    : ${JSTStamp()}
mode    : ${cubeState.mode}
speed   : ${cubeState.speedMs} ms
playing : ${cubeState.isPlaying}
nowMove : ${cubeState.nowMove || "(none)"}

history : ${historyStr || "(empty)"}
pending : ${pendingStr || "(empty)"}
`;
  }

  // ====== Core: DOM再生成 + create_in_dom ======
  function buildRoofpigConfig({ setupMoves, algMoves, speedMs }) {
    const parts = [...BASE_CFG];

    // speed は ms 指定（README準拠）
    parts.push(`speed=${Math.max(0, speedMs | 0)}`);

    if (setupMoves && setupMoves.trim()) parts.push(`setupmoves=${setupMoves.trim()}`);
    if (algMoves && algMoves.trim()) parts.push(`alg=${algMoves.trim()}`);

    // showalg はUIを正にするためオフでも良いが、デバッグ用にオンにするならここ
    // parts.push("showalg=1");

    return parts.join(" | ");
  }

  function recreateRoofpig({ setupMoves, algMoves, speedMs }) {
    assertRoofpigAvailable();

    // DOM再生成（scriptは触らない）
    elCubeHost.innerHTML = "";
    const div = document.createElement("div");
    div.className = "roofpig";
    elCubeHost.appendChild(div);

    const cfg = buildRoofpigConfig({ setupMoves, algMoves, speedMs });

    // Roofpig公式のDynamic生成入口
    window.CubeAnimation.create_in_dom(div, cfg, "");
  }

  // ====== Render policies ======
  // 1手アニメ：setupmoves=prefix / alg=singleMove
  function animateSingleMove(singleMove) {
    const prefix = cubeState.history.slice(0, -1);
    const setupMoves = joinAlg(prefix);
    const algMoves = singleMove;

    cubeState.nowMove = singleMove;
    renderStatus();

    recreateRoofpig({ setupMoves, algMoves, speedMs: cubeState.speedMs });
  }

  // 状態だけ表示：setupmoves=history / algなし
  function showStateInstant() {
    cubeState.nowMove = "";
    renderStatus();
    recreateRoofpig({ setupMoves: joinAlg(cubeState.history), algMoves: "", speedMs: 0 });
  }

  // ====== Mode behaviors ======
  function enqueueOrExecute(move) {
    if (cubeState.isPlaying) return;

    if (cubeState.mode === "immediate") {
      cubeState.history.push(move);
      animateSingleMove(move);
      // 連打時に次の操作へすぐ移れるよう、再生ロックは最小に
      //（Roofpigの完了イベントに依存しない）
      const lockMs = Math.min(Math.max(cubeState.speedMs, 0) + 60, 2100);
      cubeState.isPlaying = true;
      setButtonsDisabled(true);
      renderStatus();
      setTimeout(() => {
        cubeState.isPlaying = false;
        setButtonsDisabled(false);
        cubeState.nowMove = "";
        renderStatus();
      }, lockMs);
    } else {
      cubeState.pending.push(move);
      renderStatus();
    }
  }

  function startApply() {
    if (cubeState.isPlaying) return;
    if (cubeState.pending.length === 0) return;

    cubeState.isPlaying = true;
    setButtonsDisabled(true);
    renderStatus();

    const step = () => {
      if (cubeState.pending.length === 0) {
        cubeState.isPlaying = false;
        cubeState.nowMove = "";
        setButtonsDisabled(false);
        renderStatus();
        // 最終状態を“静止表示”にしておきたいならここで
        // showStateInstant();
        return;
      }

      const mv = cubeState.pending.shift();
      cubeState.history.push(mv);
      animateSingleMove(mv);

      const waitMs = Math.min(Math.max(cubeState.speedMs, 0) + 80, 2200);
      setTimeout(step, waitMs);
    };

    step();
  }

  function clearPending() {
    if (cubeState.isPlaying) return;
    cubeState.pending = [];
    renderStatus();
  }

  function resetSolved() {
    if (cubeState.isPlaying) return;
    cubeState.history = [];
    cubeState.pending = [];
    cubeState.nowMove = "";
    renderStatus();
    showStateInstant();
  }

  // ====== UI wiring ======
  function initUI() {
    // タイトルにJSTタイムスタンプ付与
    const title = `CF Method Cube Viewer ${V6_VERSION} (${JSTStamp()})`;
    document.title = title;
    elTitle.textContent = title;

    // Consoleにも出す（あなたの運用ルール）
    console.log(`[CFV] ${title}`);

    // move buttons
    document.querySelectorAll("button[data-m]").forEach(btn => {
      btn.addEventListener("click", () => {
        const move = btn.getAttribute("data-m");
        enqueueOrExecute(move);
      });
    });

    // mode radios
    document.querySelectorAll("input[name='mode']").forEach(radio => {
      radio.addEventListener("change", () => {
        if (!radio.checked) return;
        cubeState.mode = radio.value;
        renderStatus();
      });
    });

    // speed slider
    elSpeedRange.addEventListener("input", () => {
      cubeState.speedMs = parseInt(elSpeedRange.value, 10);
      elSpeedLabel.textContent = `${cubeState.speedMs} ms`;
      renderStatus();
    });
    elSpeedLabel.textContent = `${cubeState.speedMs} ms`;

    // apply / clear / reset
    elBtnApply.addEventListener("click", startApply);
    elBtnClear.addEventListener("click", clearPending);
    elBtnReset.addEventListener("click", resetSolved);
  }

  // ====== Boot ======
  function boot() {
    initUI();
    renderStatus();
    showStateInstant(); // solved表示（標準配色）
  }

  // DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();