/* CF Method Cube Viewer v6.0.0
   - Roofpigは「DOM再生成 + CubeAnimation.create_in_dom()」のみ使用
   - next_move / Alg内部直接操作 / script再挿入は禁止
   - 更新日時は「HTMLの Last-Modified」をHEADで取得（GitHub Pages想定）
*/

(() => {
  const V6_VERSION = "v6.0.0";
  let V6_UPDATED = "Unknown";

  // ====== Single Source of Truth ======
  const cubeState = {
    history: [],
    pending: [],
    mode: "immediate",
    speedMs: 600,
    isPlaying: false,
    nowMove: ""
  };

  // 世界標準配色（一般的）：U白 D黄 F緑 B青 R赤 L橙
  const COLORS_STANDARD = "colors=U:w D:y F:g B:b R:r L:o";
  const FLAGS = "flags=startsolved";

  const BASE_CFG = [
    "pov=Ufr",
    "size=260",
    "view=3d",
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

  function assertRoofpigAvailable() {
    if (typeof window.CubeAnimation?.create_in_dom !== "function") {
      throw new Error("Roofpig (CubeAnimation.create_in_dom) が見つかりません。roofpig_and_three.min.js と jQuery の読み込み順・パスを確認してください。");
    }
  }

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

  // ====== 更新日時：Last-Modified(HTTP) をJSTで表示 ======
  function formatJSTFromDate(d) {
    // dはUTC基準のDateとして扱い、JST(+9)に変換して文字列化
    const j = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const yyyy = j.getFullYear();
    const mm = String(j.getMonth() + 1).padStart(2, "0");
    const dd = String(j.getDate()).padStart(2, "0");
    const hh = String(j.getHours()).padStart(2, "0");
    const mi = String(j.getMinutes()).padStart(2, "0");
    const ss = String(j.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} JST`;
  }

  async function fetchLastModifiedOfThisPage() {
    try {
      // GitHub Pages想定：HTML自身のLast-Modifiedが「更新日時」に相当
      const res = await fetch(window.location.href, { method: "HEAD", cache: "no-store" });
      const lm = res.headers.get("Last-Modified");
      if (!lm) return "Unknown";
      const d = new Date(lm);
      if (Number.isNaN(d.getTime())) return "Unknown";
      return formatJSTFromDate(d);
    } catch {
      return "Unavailable";
    }
  }

  function renderHeader() {
    const title = `CF Method Cube Viewer ${V6_VERSION} (${V6_UPDATED})`;
    document.title = title;
    elTitle.textContent = title;
    console.log(`[CFV] ${title}`);
  }

  function renderStatus() {
    // ユーザー要望：知りたいのは「バージョンと更新日時」
    // 下はデバッグ用に残しているが、必要なら削ってOK
    elStatus.textContent =
`version : ${V6_VERSION}
updated : ${V6_UPDATED}

mode    : ${cubeState.mode}
speed   : ${cubeState.speedMs} ms
playing : ${cubeState.isPlaying}
nowMove : ${cubeState.nowMove || "(none)"}

history : ${joinAlg(cubeState.history) || "(empty)"}
pending : ${joinAlg(cubeState.pending) || "(empty)"}
`;
  }

  function buildRoofpigConfig({ setupMoves, algMoves, speedMs }) {
    const parts = [...BASE_CFG];
    parts.push(`speed=${Math.max(0, speedMs | 0)}`);
    if (setupMoves && setupMoves.trim()) parts.push(`setupmoves=${setupMoves.trim()}`);
    if (algMoves && algMoves.trim()) parts.push(`alg=${algMoves.trim()}`);
    return parts.join(" | ");
  }

  // ★核心：DOM再生成 + create_in_dom（生成divに roofpig class を確実に付ける）
  function recreateRoofpig({ setupMoves, algMoves, speedMs }) {
    assertRoofpigAvailable();
    elCubeHost.innerHTML = "";
    const cfg = buildRoofpigConfig({ setupMoves, algMoves, speedMs });
    window.CubeAnimation.create_in_dom(elCubeHost, cfg, "class='roofpig'");
  }

  // 1手アニメ：setupmoves=prefix / alg=singleMove
  function animateSingleMove(singleMove) {
    const prefix = cubeState.history.slice(0, -1);
    recreateRoofpig({
      setupMoves: joinAlg(prefix),
      algMoves: singleMove,
      speedMs: cubeState.speedMs
    });
  }

  // 状態だけ表示：setupmoves=history / algなし
  function showStateInstant() {
    recreateRoofpig({
      setupMoves: joinAlg(cubeState.history),
      algMoves: "",
      speedMs: 0
    });
  }

  function enqueueOrExecute(move) {
    if (cubeState.isPlaying) return;

    if (cubeState.mode === "immediate") {
      cubeState.history.push(move);
      cubeState.nowMove = move;
      cubeState.isPlaying = true;
      setButtonsDisabled(true);
      renderStatus();

      animateSingleMove(move);

      const lockMs = Math.min(Math.max(cubeState.speedMs, 0) + 70, 2300);
      setTimeout(() => {
        cubeState.isPlaying = false;
        cubeState.nowMove = "";
        setButtonsDisabled(false);
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
        return;
      }

      const mv = cubeState.pending.shift();
      cubeState.history.push(mv);
      cubeState.nowMove = mv;
      renderStatus();

      animateSingleMove(mv);

      const waitMs = Math.min(Math.max(cubeState.speedMs, 0) + 90, 2400);
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

  function initUI() {
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

  async function boot() {
    // 更新日時を取得してからヘッダ表示
    V6_UPDATED = await fetchLastModifiedOfThisPage();
    renderHeader();

    initUI();
    renderStatus();
    showStateInstant(); // solved表示
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { boot(); });
  } else {
    boot();
  }
})();