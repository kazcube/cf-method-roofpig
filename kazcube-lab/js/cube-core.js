/**
 * KAZCUBE Lab Core Module
 * [History]
 * v2.0.17: Force-logged initialization and fixed twisty-player attribute handling.
 */

// 読み込み時に即座にログを出す（これがコンソールに出なければ、ファイル自体が読み込まれていません）
console.log("LOG: cube-core.js loaded. Version: v2.0.17");

export const JS_VERSION = "v2.0.17";
export let setupMoves = [];
export let activeMoves = [];
export let stickerStates = Array(54).fill(1);
export let isPlaying = false;
let playTimer = null;

/* [LOCKED: NO-REMOVE] */
export function resetAll() {
    console.log("DEBUG: resetAll called");
    setupMoves = []; activeMoves = []; stickerStates.fill(1);
    stopPlay();
    const cb = document.getElementById('command-box');
    if (cb) cb.value = "";
    render();
}

/* [LOCKED: NO-REMOVE] */
export function updateStickerState(idx, state) { stickerStates[idx] = state; }
/* [LOCKED: NO-REMOVE] */
export function setAllStickers(state) { stickerStates.fill(state); }

/* [LOCKED: NO-REMOVE] */
export function loadFromHash(targetHash = null) {
    const hash = targetHash || window.location.hash.replace(/^#/, "");
    if (!hash || !hash.startsWith("v5:")) return;
    try {
        const decoded = atob(hash.substring(3));
        const [mask, setup, active] = decoded.split("|");
        if (mask && mask.length === 54) stickerStates = mask.split("").map(Number);
        setupMoves = (setup && setup !== "") ? setup.split(",") : [];
        activeMoves = (active && active !== "") ? active.split(",") : [];
        const cb = document.getElementById('command-box');
        if (cb) cb.value = activeMoves.join(" ");
        const slider = document.getElementById('move-slider');
        if (slider) { 
            slider.max = activeMoves.length; 
            slider.value = 0; 
        }
        render();
    } catch (e) { console.error("Import Error", e); }
}

/* [LOCKED: NO-REMOVE] */
function generateOrbitMask() {
    const getMask = (indices) => indices.map(i => stickerStates[i] ? '-' : 'I').join('');
    const e = [1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43,46,48,50,52].slice(0, 12);
    const c = [0,2,6,8,9,11,15,17,18,20,24,26,27,29,33,35,36,38,42,44,45,47,51,53].slice(0, 8);
    const ct = [4,13,22,31,40,49];
    return `EDGES:${getMask(e)},CORNERS:${getMask(c)},CENTERS:${getMask(ct)}`;
}

/* [FIXED: v2.0.17] 属性の同期をより確実に実行 */
export function render() {
    const player = document.getElementById('main-cube');
    if (!player) {
        console.error("ERROR: main-cube element not found!");
        return;
    }

    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    const slider = document.getElementById('move-slider');
    const hashDisp = document.getElementById('hash-display');
    
    if (slider) {
        const step = parseInt(slider.value) || 0;
        const setupStr = setupMoves.join(" ");
        const activeStr = activeMoves.slice(0, step).join(" ");

        console.log(`DEBUG render: step=${step}, setupAlg="${setupStr}", currentAlg="${activeStr}"`);

        // twisty-player の挙動を安定させるため、属性値を直接書き換える
        if (player.getAttribute('setup-alg') !== setupStr) {
            player.setAttribute('setup-alg', setupStr);
        }

        player.tempoScale = isPlaying ? 1 : 0;
        player.alg = activeStr;
        
        document.getElementById('step-counter').textContent = step;
        const indicator = document.getElementById('move-indicator');
        if (indicator) {
            const currentMove = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
            indicator.textContent = `Move: ${currentMove} (${step}/${activeMoves.length})`;
        }
    }
    
    const rawData = `${stickerStates.join("")}|${setupMoves.join(",")}|${activeMoves.join(",")}`;
    const hashValue = `v5:${btoa(rawData)}`;
    
    if (!isPlaying) {
        window.history.replaceState(null, "", "#" + hashValue);
        if (hashDisp) hashDisp.value = hashValue;
    }

    const playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.textContent = isPlaying ? "||" : "▶";
}

/* [LOCKED: NO-REMOVE] */
export function togglePlay() {
    if (isPlaying) { stopPlay(); } 
    else {
        const slider = document.getElementById('move-slider');
        if (parseInt(slider.value) >= activeMoves.length) slider.value = 0;
        isPlaying = true;
        render(); 
        
        playTimer = setInterval(() => {
            const current = parseInt(slider.value);
            if (current < activeMoves.length) {
                slider.value = current + 1;
                render();
            } else { stopPlay(); }
        }, 500);
    }
}

/* [LOCKED: NO-REMOVE] */
export function stopPlay() {
    isPlaying = false;
    clearInterval(playTimer);
    render();
}

/* [LOCKED: NO-REMOVE] */
export function handleScramble() {
    console.log("DEBUG: handleScramble START");
    stopPlay();
    setupMoves = [];
    const faces=['U','D','L','R','F','B'], mods=['',"'",'2'];
    activeMoves = Array.from({length:20},()=>faces[Math.floor(Math.random()*6)]+mods[Math.floor(Math.random()*3)]);
    
    const cb = document.getElementById('command-box');
    if (cb) cb.value = activeMoves.join(" ");
    
    const slider = document.getElementById('move-slider');
    if (slider) { 
        slider.max = activeMoves.length; 
        slider.value = activeMoves.length; 
    }
    render();
}

/* [FIXED: v2.0.17] セットアップロジックの最優先デバッグ */
export function applySetup() {
    console.log("DEBUG: applySetup button clicked");
    stopPlay();
    const cb = document.getElementById('command-box');
    if (!cb) {
        console.error("ERROR: command-box not found");
        return;
    }
    const val = cb.value.trim();
    if (!val) {
        console.warn("DEBUG: No moves in command-box");
        return;
    }

    const moves = val.split(/\s+/).filter(m => m.length > 0);
    
    // 入力手順を逆転させて「初期状態を崩すための手順」を作成
    setupMoves = [...moves].reverse().map(m => {
        if (m.endsWith("2")) return m;
        return m.endsWith("'") ? m.slice(0, -1) : m + "'";
    });

    // 入力手順そのものを「これから回す手順」としてセット
    activeMoves = moves;

    const slider = document.getElementById('move-slider');
    if (slider) { 
        slider.max = activeMoves.length; 
        slider.value = 0; 
    }
    
    console.log("DEBUG: setupMoves (Reverse):", setupMoves);
    console.log("DEBUG: activeMoves (Normal):", activeMoves);
    
    render();
}