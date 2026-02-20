/* CF Method Cube Viewer v6.0.0
   - Roofpig: DOM再生成 + CubeAnimation.create_in_dom() のみ
   - next_move / Alg内部操作 / script再挿入は禁止
   - Roofpig 1.4.2 に合わせ、有効パラメータのみ使用（size/view なし）
   - 初期から▶を表示（algダミー）
   - Immediate：ボタン押下で即回転（▶を自動クリック）
   - 更新日時：HTMLのLast-ModifiedをHEADで取得し、Asia/Tokyoで確実にJST表示
   - 初期の 0/2（ダミー手数カウンタ）は表示だけ非表示（動作には触れない）
*/

(() => {
  const V6_VERSION = "v6.0.0";
  let V6_UPDATED = "Unknown";

  // 初期から▶を出すためのダミー（showalgは付けないので文字は出ない）
  // ※ユーザーが▶を押すと一瞬動く可能性はありますが、表示目的です
  const DUMMY_ALG_FOR_CONTROLS = "U U'";

  const cubeState = {
    history: [],
    pending: [],
    mode: "immediate",
    speedMs: 600,
    isPlaying: false,
    nowMove: ""
  };

  const COLORS_STANDARD = "colors=U:w D:y F:g B:b R:r L:o";
  const FLAGS = "flags=canvas startsolved";

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

  // ---- 更新日時：Last-Modified を Asia/Tokyo で確実にJST化 ----
  function formatJSTFromDate(d) {
    const fmt = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    // 例: 2026/02/20 15:18:06 → 2026-02-20 15:18:06 JST
    return `${fmt.format(d).replaceAll("/", "-")} JST`;
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
    // “知りたいのはバージョンと更新日時”なので先頭に固定表示
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

  function recreateRoofpig({ setupMoves, algMoves, speedMs }) {
    assertRoofpigAvailable();
    elCubeHost.innerHTML = "";
    const cfg = buildRoofpigConfig({ setupMoves, algMoves, speedMs });
    // 生成されるdivに roofpig class を付与
    window.CubeAnimation.create_in_dom(elCubeHost, cfg, "class='roofpig'");
  }

  // ---- ダミーの「0/2」カウンタ表示だけ消す（DOM構造依存を最小化） ----
  function hideMoveCounterIfShown() {
    const walker = document.createTreeWalker(elCubeHost, NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
      const t = (node.textContent || "").trim();
      if (/^\d+\s*\/\s*\d+$/.test(t)) {
        node.style.display = "none";
        break;
      }
    }
  }

  // ---- ▶自動クリック（Immediate即回転のため） ----
  function autoPressPlayIfExists(rootEl) {
    let tries = 0;
    const maxTries = 80;

    const isPlayButton = (el) => {
      const tag = (el.tagName || "").toLowerCase();
      if (tag !== "button" && tag !== "a" && tag !== "div" && tag !== "span") return false;

      const t = (el.textContent || "").trim();
      const title = (el.getAttribute("title") || "").toLowerCase();
      const aria = (el.getAttribute("aria-label") || "").toLowerCase();

      // 典型パターン
      if (t === "▶" || t === "►" || t.toLowerCase() === "play") return true;
      if (title.includes("play") || aria.includes("play")) return true;

      return false;
    };

    const tick = () => {
      tries++;

      // button優先で探し、なければaなども探す
      const candidates = Array.from(rootEl.querySelectorAll("button, a, div, span"));
      const playEl = candidates.find(isPlayButton);

      if (playEl) {
        playEl.click();
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

    // ★Immediateで即回転させる（▶自動クリック）
    autoPressPlayIfExists(elCubeHost);
  }

  // 初期表示：solved + ▶を出す（ダミーalg）
  function showSolvedWithControls() {
    recreateRoofpig({
      setupMoves: "",
      algMoves: DUMMY_ALG_FOR_CONTROLS,
      speedMs: 0
    });

    // ダミー由来の 0/2 表示だけ消す（影響最小）
    requestAnimationFrame(() => {
      hideMoveCounterIfShown();
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

      const lockMs = Math.min(Math.max(cubeState.speedMs, 0) + 150, 3000);
      setTimeout(() => {
        cubeState.isPlaying = false;
        cubeState.nowMove = "";
        setButtonsDisabled(false);
        renderStatus();

        // 次の入力前にUIだけ整える（必要なら）
        // showSolvedWithControls();  // ← これは「状態が戻る」ので入れない
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

      const waitMs = Math.min(Math.max(cubeState.speedMs, 0) + 200, 3200);
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
    showSolvedWithControls(); // Reset後も▶を表示
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
    showSolvedWithControls();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { boot(); });
  } else {
    boot();
  }
})();