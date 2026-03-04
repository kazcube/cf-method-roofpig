/**
 * KAZCUBE Lab Core Module
 * [History]
 * v2.0.15: Fixed setup logic using 'setup-alg' attribute to properly separate scrambling from playback.
 */

export const JS_VERSION = "v2.0.15";
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
            slider.value = 0; // Hash読込時はリセット状態
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

/* [FIXED: v2.0.15] セットアップと実行手順を分離して描画 */
export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    const slider = document.getElementById('move-slider');
    const hashDisp = document.getElementById('hash-display');
    
    if (slider) {
        const step = parseInt(slider.value) || 0;
        
        // 1. 逆手順（崩す用）を初期状態として設定
        const setupStr = setupMoves.join(" ");
        if (player.getAttribute('setup-alg') !== setupStr) {
            player.setAttribute('setup-alg', setupStr);
        }

        // 2. 正手順（再生用）をセット
        const activeStr = activeMoves.slice(0, step).join(" ");
        
        // アニメーション速度の設定（スライダー操作時は即時反映）
        player.tempoScale = isPlaying ? 1 : 0;
        
        // セットアップ状態からの相対的な手順として適用
        player.alg = activeStr;
        
        document.getElementById('step-counter').textContent = step;
        const indicator = document.getElementById('move-indicator');
        if (indicator) {
            indicator.textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
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
    setupMoves = []; // スクランブル時は純粋なランダムなのでセットアップは空
    const faces=['U','D','L','R','F','B'], mods=['',"'",'2'];
    activeMoves = Array.from({length:20},()=>faces[Math.floor(Math.random()*6)]+mods[Math.floor(Math.random()*3)]);
    
    const cb = document.getElementById('command-box');
    if (cb) cb.value = activeMoves.join(" ");
    
    const slider = document.getElementById('move-slider');
    if (slider) { 
        slider.max = activeMoves.length; 
        slider.value = activeMoves.length; // スクランブルは完了状態で表示
    }
    render();
}

/* [FIXED: v2.0.15] 逆手順で崩し、スライダーを0にする */
export function applySetup() {
    stopPlay();
    const cb = document.getElementById('command-box');
    if (!cb) return;
    const val = cb.value.trim();
    if (!val) return;

    const moves = val.split(/\s+/).filter(m => m.length > 0);
    
    // 逆手順を生成（コピーを使用）
    // これを setup-alg に入れることで、キューブが最初から「崩れた状態」になる
    setupMoves = [...moves].reverse().map(m => {
        if (m.endsWith("2")) return m;
        return m.endsWith("'") ? m.slice(0, -1) : m + "'";
    });

    // 正の手順を保持
    // スライダーを動かすと、この手順が実行されて完成に向かう
    activeMoves = moves;

    const slider = document.getElementById('move-slider');
    if (slider) { 
        slider.max = activeMoves.length; 
        slider.value = 0; // 崩れた直後の状態を表示
    }
    
    render();
}