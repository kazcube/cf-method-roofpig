/**
 * KAZCUBE Lab Core Module
 * [Standardized Logic Version]
 * v2.0.35: Fixed Setup-to-Solved flow using backwards playback logic.
 */

console.log("LOG: cube-core.js loaded. Version: v2.0.35");

export const JS_VERSION = "v2.0.35";
export let setupMoves = [];
export let activeMoves = [];
export let stickerStates = Array(54).fill(1);
export let isPlaying = false;

// キャッシュ変数
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
 * 描画関数
 */
export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    const slider = document.getElementById('move-slider');
    const hashDisp = document.getElementById('hash-display');
    
    if (slider) {
        const step = parseInt(slider.value) || 0;
        const setupStr = setupMoves.join(" "); // これが「逆手順」
        
        // twisty-playerの仕様に合わせる: 
        // セットアップ状態（バラバラ）を表示するには、逆手順(setupMoves)をalgにセットし、
        // そのインデックスを操作する。
        if (currentDomAlg !== setupStr) {
            console.log("DEBUG RENDER: Updating alg to setup-sequence:", setupStr);
            player.alg = setupStr;
            currentDomAlg = setupStr;
        }

        // 再生中でない時のみ、スライダーの位置をプレイヤーに強制反映
        // バラバラの状態は「setupMoves.length - step」の位置
        if (!isPlaying) {
            player.experimentalCurrentMoveIndex = setupMoves.length - step;
        }

        document.getElementById('step-counter').textContent = step;
        const indicator = document.getElementById('move-indicator');
        if (indicator) {
            // 表示上の手順は activeMoves (順手順) から取得
            const currentMove = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
            indicator.textContent = isPlaying ? `Playing...` : currentMove;
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
 * 再生制御: 逆手順を後ろから前に向かって再生（＝元の状態に戻る）
 */
export async function togglePlay() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    if (!player || !slider) return;

    if (isPlaying) {
        stopPlay();
    } else {
        console.log("DEBUG: togglePlay START");
        isPlaying = true;
        
        // すでに0面（完成）なら、最大（バラバラ）に戻してリプレイ
        if (parseInt(slider.value) >= activeMoves.length) {
            slider.value = 0;
            player.experimentalCurrentMoveIndex = setupMoves.length;
        }

        // プレイヤーを逆再生モードに設定
        player.tempoScale = -1.0; 
        player.play();

        const syncLoop = () => {
            if (!isPlaying) return;
            
            // プレイヤーの内部インデックス (setupMovesの残り)
            const pIndex = player.experimentalCurrentMoveIndex;
            // スライダーの値（進捗）に変換
            const virtualStep = setupMoves.length - pIndex;

            if (slider.value != virtualStep) {
                slider.value = virtualStep;
                document.getElementById('step-counter').textContent = virtualStep;
            }
            
            if (pIndex <= 0) {
                console.log("DEBUG: togglePlay FINISHED");
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
    }
    isPlaying = false;
    render();
}

/* [LOCKED: NO-REMOVE] */
export function handleScramble() {
    stopPlay();
    const faces=['U','D','L','R','F','B'], mods=['',"'",'2'];
    activeMoves = Array.from({length:20},()=>faces[Math.floor(Math.random()*6)]+mods[Math.floor(Math.random()*3)]);
    
    // ScrambleもSetupと同じ論理で扱う
    setupMoves = [...activeMoves].reverse().map(m => {
        if (m.endsWith("2")) return m;
        return m.endsWith("'") ? m.slice(0, -1) : m + "'";
    });

    const cb = document.getElementById('command-box');
    if (cb) cb.value = activeMoves.join(" ");
    
    const slider = document.getElementById('move-slider');
    if (slider) { 
        slider.max = activeMoves.length; 
        slider.value = activeMoves.length; // スクランブル時は最初からバラバラの状態にする
    }
    
    currentDomAlg = "__RESET__";
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

    // 入力された手順
    activeMoves = val.split(/\s+/).filter(m => m.length > 0);
    
    // その逆手順（これがキューブをバラバラにする手順）
    setupMoves = [...activeMoves].reverse().map(m => {
        if (m.endsWith("2")) return m;
        return m.endsWith("'") ? m.slice(0, -1) : m + "'";
    });

    console.log("DEBUG: setupMoves generated:", setupMoves);

    const slider = document.getElementById('move-slider');
    if (slider) { 
        slider.max = activeMoves.length; 
        slider.value = activeMoves.length; // セットアップ直後は「全ステップ完了＝バラバラ」の状態にする
    }
    
    currentDomAlg = "__FORCE__";
    render();
}