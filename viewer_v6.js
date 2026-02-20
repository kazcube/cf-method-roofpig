/* CF Method Cube Viewer v6.0.0
   - Roofpig: DOM再生成 + CubeAnimation.create_in_dom() のみ
   - next_move / Alg内部操作 / script再挿入は禁止
   - 初期画面でも▶を出すため、algダミーを常に持つ（showalgは付けない）
*/

(() => {
  const V6_VERSION = "v6.0.0";
  let V6_UPDATED = "Unknown";

  // ★初期画面で▶を出すためのダミーalg（見た目用）
  // showalgフラグを付けないので、テキスト表示はされません
  // （ユーザーが▶を押しても結果は元に戻る手順）
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

  function joinAlg(moves) { return moves.join(" ").trim(); }

  function setButtonsDisabled(disabled) {
    document.querySelectorAll("button[data-m]").forEach(b => (b.disabled = disabled));
    elBtnApply.disabled = disabled;
    elBtnClear.disabled = disabled;
    elBtnReset.disabled = disabled;
    document.querySelectorAll("input[name='mode']").forEach(r => (r.disabled = disabled));
    elSpeedRange.disabled = disabled;
  }

  // ---- 更新日時：HTMLの Last-Modified ----
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

    // setupmoves / alg はValid propertiesにある :contentReference[oaicite:2]{index=2}
    if (setupMoves && setupMoves.trim()) parts.push(`setupmoves=${setupMoves.trim()}`);
    if (algMoves && algMoves.trim()) parts.push(`alg=${algMoves.trim()}`);

    return parts.join(" | ");
  }

  function recreateRoofpig({ setupMoves, algMoves, speedMs }) {
    assertRoofpigAvailable();
    elCubeHost.innerHTML = "";

    const cfg = buildRoofpigConfig({ setupMoves, algMoves, speedMs });
    window.CubeAnimation.create_in_dom(elCubeHost, cfg, "class='roofpig'");
  }

  // ▶自動クリック（Immediateで「押した瞬間に回転」を実現）
  function autoPressPlayIfExists(rootEl) {
    let tries = 0;
    const maxTries = 40;

    const tick = () => {
      tries++;

      // roofpig内のbuttonを探す（最初のボタンが▶であることが多い）
      const btns = rootEl.querySelectorAll("button");
      if (btns && btns.length) {
        btns[0].click();
        return;
      }
      if (tries < maxTries) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // 1手アニメ：prefixはsetupmoves、今回の1手はalg
  function animateSingleMove(singleMove) {
    const prefix = cubeState.history.slice(0, -1);

    recreateRoofpig({
      setupMoves: joinAlg(prefix),
      algMoves: singleMove,
      speedMs: cubeState.speedMs
    });

    // ★Immediateは自動で▶
    autoPressPlayIfExists(elCubeHost);
  }

  // 初期表示：solved + ▶を出す（ダミーalgを入れる）
  function showSolvedWithControls() {
    recreateRoofpig({
      setupMoves: "",
      algMoves: DUMMY_ALG_FOR_CONTROLS, // ★これで▶が出る :contentReference[oaicite:3]{index=3}
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
    showSolvedWithControls(); // ★Reset後も▶表示を維持
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
    showSolvedWithControls(); // ★初期から▶を出す
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { boot(); });
  } else {
    boot();
  }
})();