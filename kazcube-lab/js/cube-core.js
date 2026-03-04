/**
 * KAZCUBE Lab Core Module
 * [History]
 * v2.0.21: Finalized setup logic (sequence reversal) and ensured array isolation.
 */

console.log("LOG: cube-core.js loaded. Version: v2.0.21");

export const JS_VERSION = "v2.0.21";
export let setupMoves = [];
export let activeMoves = [];
export let stickerStates = Array(54).fill(1);
export let isPlaying = false;
let playTimer = null;

/* [LOCKED: NO-REMOVE] */
export function resetAll() {
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

/* [FIXED: v2.0.21] */
export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    const slider = document.getElementById('move-slider');
    const hashDisp = document.getElementById('hash-display');
    
    if (slider) {
        const step = parseInt(slider.value) || 0;
        
        // [崩し用の逆順手順] + [実行手順の0からstepまで] を結合
        const fullMoves = [...setupMoves, ...activeMoves.slice(0, step)];
        const algStr = fullMoves.join(" ");

        player.tempoScale = isPlaying ? 1 : 0;
        player.alg = algStr;
        
        document.getElementById('step-counter').textContent = step;
        const indicator = document.getElementById('move-indicator');
        if (indicator) {
            const currentMove = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
            indicator.textContent = `Next: ${activeMoves[step] || "Solved"} (Step: ${step}/${activeMoves.length})`;
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

/* [FIXED: v2.0.21] Setup logic without prime inversion */
export function applySetup() {
    stopPlay();
    const cb = document.getElementById('command-box');
    if (!cb) return;
    const val = cb.value.trim();
    if (!val) return;

    const rawMoves = val.split(/\s+/).filter(m => m.length > 0);
    
    // 正順の手順を保存
    activeMoves = [...rawMoves];
    
    // セットアップ: 手順の並び順だけを逆転させる（回転方向は変えない）
    // これにより、スライダー0の時に「手順を巻き戻した崩し状態」が再現される
    setupMoves = [...rawMoves].reverse();

    const slider = document.getElementById('move-slider');
    if (slider) { 
        slider.max = activeMoves.length; 
        slider.value = 0; 
    }
    
    console.log("DEBUG: Applied Setup v2.0.21");
    console.log("setupMoves (Scramble):", setupMoves);
    console.log("activeMoves (Solve):", activeMoves);
    
    render();
}