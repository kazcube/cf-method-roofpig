/**
 * KAZCUBE Lab Core Module
 * [History]
 * v2.0.0: Initial release with basic 3D cube.
 * v2.0.1: Added URL hash sync.
 * v2.0.2: Implemented sticker masking (Paint mode).
 * v2.0.4: Navigation buttons added.
 * v2.0.5: Added Hash Import logic and bug fixes.
 * v2.0.6: Added Auto-play (togglePlay) and fixed Setup sync bug.
 * v2.0.7: Fixed applySetup to correctly set setupMoves.
 * v2.0.8: Use setupAlg for reliable setup moves reflection.
 * v2.0.9: Fixed property name to 'setup-alg' and updated hash to include setupMoves.
 */

export const JS_VERSION = "v2.0.9";
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

/* [FIXED: v2.0.9] */
export function loadFromHash(targetHash = null) {
    const hash = targetHash || window.location.hash.replace(/^#/, "");
    if (!hash || !hash.startsWith("v5:")) return;
    try {
        const decoded = atob(hash.substring(3));
        // 形式: mask|setupMoves|activeMoves
        const [mask, setup, active] = decoded.split("|");
        
        if (mask && mask.length === 54) stickerStates = mask.split("").map(Number);
        
        // セットアップ手順の復元
        setupMoves = (setup && setup !== "") ? setup.split(",") : [];
        
        // メイン手順の復元
        activeMoves = (active && active !== "") ? active.split(",") : [];
        
        const cb = document.getElementById('command-box');
        if (cb) cb.value = activeMoves.join(" ");
        
        const slider = document.getElementById('move-slider');
        if (slider) { 
            slider.max = activeMoves.length; 
            slider.value = activeMoves.length; 
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

/* [FIXED: v2.0.9] */
export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;
    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    // セットアップ手順を属性として設定 (プロパティ経由ではなくsetAttributeが確実)
    player.setAttribute('setup-alg', setupMoves.join(" "));
    
    const slider = document.getElementById('move-slider');
    const hashDisp = document.getElementById('hash-display');
    if (slider) {
        slider.max = activeMoves.length;
        const step = parseInt(slider.value) || 0;
        
        // メイン手順のアニメーション設定
        player.alg = activeMoves.slice(0, step).join(" ");
        
        document.getElementById('step-counter').textContent = step;
        const indicator = document.getElementById('move-indicator');
        if (indicator) indicator.textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
    }
    
    // URLハッシュにsetupMovesも含めるように変更
    const rawData = `${stickerStates.join("")}|${setupMoves.join(",")}|${activeMoves.join(",")}`;
    const hashValue = `v5:${btoa(rawData)}`;
    
    // 再生中でない場合のみハッシュと表示を更新
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
        playTimer = setInterval(() => {
            const current = parseInt(slider.value);
            if (current < activeMoves.length) {
                slider.value = current + 1;
                render();
            } else { stopPlay(); }
        }, 500);
        render();
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
    if (slider) { slider.max = activeMoves.length; slider.value = activeMoves.length; }
    render();
}

/* [FIXED: v2.0.9] */
export function applySetup() {
    stopPlay();
    const cb = document.getElementById('command-box');
    if (!cb) return;
    const val = cb.value.trim();
    
    // セットアップとして保存
    setupMoves = val ? val.split(/\s+/).filter(m => m.length > 0) : [];
    
    // セットアップ適用時はメイン手順をクリア
    activeMoves = [];
    const slider = document.getElementById('move-slider');
    if (slider) { 
        slider.max = 0; 
        slider.value = 0; 
    }
    // テキストエリアをクリア
    cb.value = ""; 
    render();
}