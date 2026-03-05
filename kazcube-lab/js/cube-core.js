/**
 * KAZCUBE Lab Core Module
 * [Final Restructured Version]
 * v2.0.34: Refined sync logic for setup vs play.
 * Uses native player properties for position control to ensure stability.
 */

console.log("LOG: cube-core.js loaded. Version: v2.0.34");

export const JS_VERSION = "v2.0.34";
export let setupMoves = [];
export let activeMoves = [];
export let stickerStates = Array(54).fill(1);
export let isPlaying = false;

// DOMの属性値を追跡するためのキャッシュ（不必要なリセットを防ぐ）
let currentDomAlg = "";
let currentDomSetup = "";

/* [LOCKED: NO-REMOVE] */
export function resetAll() {
    console.log("DEBUG: resetAll");
    setupMoves = []; activeMoves = []; stickerStates.fill(1);
    currentDomAlg = null; currentDomSetup = null;
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

/**
 * 描画関数: プレイヤーのプロパティを物理的な状態に同期させる
 */
export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    const slider = document.getElementById('move-slider');
    const hashDisp = document.getElementById('hash-display');
    
    if (slider) {
        const step = parseInt(slider.value) || 0;
        const setupStr = setupMoves.join(" ");
        const activeStr = activeMoves.join(" ");

        // セットアップ手順の同期
        if (currentDomSetup !== setupStr) {
            console.log("DEBUG RENDER: Setting setupAlg:", setupStr);
            player.experimentalSetupAlg = setupStr;
            currentDomSetup = setupStr;
        }

        // 実行手順の同期（常に全手順をセット）
        if (currentDomAlg !== activeStr) {
            console.log("DEBUG RENDER: Setting alg:", activeStr);
            player.alg = activeStr;
            currentDomAlg = activeStr;
        }

        // 位置の同期（再生中でないときのみ物理的にジャンプ）
        if (!isPlaying) {
            player.experimentalCurrentMoveIndex = step;
        }

        document.getElementById('step-counter').textContent = step;
        const indicator = document.getElementById('move-indicator');
        if (indicator) {
            const currentMove = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
            indicator.textContent = isPlaying ? `Playing...` : `Step: ${step}`;
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

/**
 * 再生制御: プレイヤー自身の内部アニメーションを使用
 */
export async function togglePlay() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    if (!player || !slider) return;

    if (isPlaying) {
        stopPlay();
    } else {
        console.log("DEBUG: togglePlay - Start");
        isPlaying = true;
        
        // 既に最後まで行っている場合は0に戻す
        if (parseInt(slider.value) >= activeMoves.length) {
            slider.value = 0;
            player.experimentalCurrentMoveIndex = 0;
        }

        player.tempoScale = 1.0;
        render(); // UI表示更新
        
        player.play();

        // プレイヤーの内部進捗を監視してスライダーに反映
        const syncLoop = () => {
            if (!isPlaying) return;
            
            const pIndex = player.experimentalCurrentMoveIndex;
            if (pIndex !== undefined && slider.value != pIndex) {
                slider.value = pIndex;
                document.getElementById('step-counter').textContent = pIndex;
                // 注意: ここで render() を呼ぶと alg の再代入が走る可能性があるため、
                // 必要最小限のUI更新に留めるか、render内の if ガードに任せる。
            }
            
            if (pIndex >= activeMoves.length) {
                console.log("DEBUG: togglePlay - Finished");
                stopPlay();
            } else {
                requestAnimationFrame(syncLoop);
            }
        };
        requestAnimationFrame(syncLoop);
    }
}

export function stopPlay() {
    const player = document.getElementById('main-cube');
    if (player) {
        player.pause();
        console.log("DEBUG: stopPlay - Paused at", player.experimentalCurrentMoveIndex);
    }
    isPlaying = false;
    render();
}

/* [LOCKED: NO-REMOVE] */
export function handleScramble() {
    stopPlay();
    setupMoves = [];
    currentDomAlg = "__RESET__"; currentDomSetup = "__RESET__";
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

/**
 * セットアップ適用
 */
export function applySetup() {
    console.log("DEBUG: applySetup START");
    stopPlay();
    const cb = document.getElementById('command-box');
    if (!cb) return;
    const val = cb.value.trim();
    if (!val) return;

    const rawMoves = val.split(/\s+/).filter(m => m.length > 0);
    activeMoves = [...rawMoves];
    
    setupMoves = [...rawMoves].reverse().map(m => {
        if (m.endsWith("2")) return m;
        return m.endsWith("'") ? m.slice(0, -1) : m + "'";
    });

    // 内部キャッシュをリセットして render で強制反映させる
    currentDomAlg = "__FORCE__";
    currentDomSetup = "__FORCE__";

    const slider = document.getElementById('move-slider');
    if (slider) { 
        slider.max = activeMoves.length; 
        slider.value = 0; 
    }
    
    render();
}