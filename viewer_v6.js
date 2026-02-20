/* CF Method Cube Viewer v6.0.0
   - Roofpig: DOM再生成 + CubeAnimation.create_in_dom() のみ
   - next_move / Alg内部操作 / script再挿入は禁止
   - 既知のRoofpig valid propertiesに合わせる（size/view は使わない）
   - flags=canvas で表示安定化
*/

(() => {
  const V6_VERSION = "v6.0.0";
  let V6_UPDATED = "Unknown";

  const cubeState = {
    history: [],
    pending: [],
    mode: "immediate",
    speedMs: 600,
    isPlaying: false,
    nowMove: ""
  };

  // 世界標準配色：U白 D黄 F緑 B青 R赤 L橙
  const COLORS_STANDARD = "colors=U:w D:y F:g B:b R:r L:o";

  // Roofpig flags（README準拠）：canvas / startsolved
  const FLAGS = "flags=canvas startsolved";

  // 有効なパラメータだけ使う（READMEの valid properties にあるもの）
  const BASE_CFG = [
    "pov=Ufr",
    COLORS_STANDARD,
    FLAGS,
    "hover=near"
  ];

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
      throw new Error("Roofpig (CubeAnimation.create_in_dom) が見つかりません。jQuery→roofpig の順とパスを確認してください。");
    }
  }

  function joinAlg(moves) { return moves.join(" ").trim(); }

  function setButtonsDisabled(disabled) {
    document.querySelectorAll("button[data-m]").forEach(b => (b.disabled = disabled));
    elBtnApply.disabled = disabled;
    elBtnClear.disabled = disabled;
    elBtnReset.disabled = disabled;
    document.querySelectorAll("input[name='mode']").forEach(r => (r.disabled = disabled));
    elSpeedRange.disabled = disabled;
  }

  // ---- 更新日時：HTMLの Last-Modified をHEADで取得（GitHub Pages想定） ----
  function formatJSTFromDate(d) {
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
    // 要望：知りたいのは「バージョンと更新日時」
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

    // speed（README準拠）
    parts.push(`speed=${Math.max(0, speedMs | 0)}`);

    // setupmoves / alg（README準拠）
    if (setupMoves && setupMoves.trim()) parts.push(`setupmoves=${setupMoves.trim()}`);
    if (algMoves && algMoves.trim()) parts.push(`alg=${algMoves.trim()}`);

    return parts.join(" | ");
  }

  // ---- RoofpigをDOM再生成 ----
  function recreateRoofpig({ setupMoves, algMoves, speedMs }) {
    assertRoofpigAvailable();
    elCubeHost.innerHTML = "";

    const cfg = buildRoofpigConfig({ setupMoves, algMoves, speedMs });

    // 生成されるdivに class='roofpig'（必要）
    // サイズはCSSでcubeHostに与えている
    window.CubeAnimation.create_in_dom(elCubeHost, cfg, "class='roofpig'");
  }

  // ---- 再生の自動化：playボタンをDOMから探してclick ----
  function autoPressPlayIfExists(rootEl) {
    // Roofpigはalgがあると再生UIが出る。自動再生フラグはREADMEに無いのでDOMクリックで対応。
    // 生成直後はまだボタンが無いことがある → 数フレーム待つ
    let tries = 0;
    const maxTries = 30;

    const tick = () => {
      tries++;
      // roofpig div 内の最初の button を “▶” と仮定（実装依存を最小化）
      const btns = rootEl.querySelectorAll("button");
      if (btns && btns.length) {
        // 最初のボタンが再生であることが多い
        btns[0].click();
        return;
      }
      if (tries < maxTries) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // 1手アニメ：setupmoves=prefix / alg=singleMove
  function animateSingleMove(singleMove) {
    const prefix = cubeState.history.slice(0, -1);

    recreateRoofpig({
      setupMoves: joinAlg(prefix),
      algMoves: singleMove,
      speedMs: cubeState.speedMs
    });

    // 自動で▶を押す（これで「次の操作で前の手が反映」を解消）
    autoPressPlayIfExists(elCubeHost);
  }

  // solved表示（最初の見た目を“同じ系統”に揃える）
  // ※ alg無しだと再生UIが出ないが、見た目（描画方式）は flags=canvas で統一される
  function showSolved() {
    recreateRoofpig({
      setupMoves: "",
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

      const lockMs = Math.min(Math.max(cubeState.speedMs, 0) + 120, 2600);
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

      const waitMs = Math.min(Math.max(cubeState.speedMs, 0) + 160, 2800);
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
    showSolved();
  }

  function initUI() {
    document.querySelectorAll("button[data-m]").forEach(btn => {
      btn.addEventListener("click", () => enqueueOrExecute(btn.getAttribute("data-m")));
    });

    document.querySelectorAll("input[name='mode']").forEach(radio => {
      radio.addEventListener("change", () => {
        if (!radio.checked) return;
        cubeState.mode = radio.value;
        renderStatus();
      });
    });

    elSpeedRange.addEventListener("input", () => {
      cubeState.speedMs = parseInt(elSpeedRange.value, 10);
      elSpeedLabel.textContent = `${cubeState.speedMs} ms`;
      renderStatus();
    });
    elSpeedLabel.textContent = `${cubeState.speedMs} ms`;

    elBtnApply.addEventListener("click", startApply);
    elBtnClear.addEventListener("click", clearPending);
    elBtnReset.addEventListener("click", resetSolved);
  }

  async function boot() {
    V6_UPDATED = await fetchLastModifiedOfThisPage();
    renderHeader();

    initUI();
    renderStatus();
    showSolved(); // 初期表示（canvasで安定）
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { boot(); });
  } else {
    boot();
  }
})();