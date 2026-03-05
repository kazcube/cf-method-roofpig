/**
 * KAZCUBE Lab Core Module
 * v2.0.44: Fixed 'includes' error and improved stability for paint/orbit buttons.
 * 修正点: loadFromHashの堅牢性向上と、初期化時のundefinedエラー回避。
 */

console.log("LOG: cube-core.js loaded. Version: v2.0.44");

export const JS_VERSION = "v2.0.44";
export let setupMoves = [];
export let activeMoves = [];

// スティッカーの色状態 (0: グレー, 1-6: 各色, null: 標準配色)
export let stickerColors = Array(54).fill(null);
export let isPlaying = false;

let currentDomAlg = "";
let currentDomSetup = "";

const colorMap = {
    0: "#4b5563", // Gray (Hidden/Eraser)
    1: "#ffffff", // White
    2: "#ffff00", // Yellow
    3: "#00ff00", // Green
    4: "#0000ff", // Blue
    5: "#ff0000", // Red
    6: "#ffa500"  // Orange
};

export function resetAll() {
    setupMoves = []; 
    activeMoves = []; 
    stickerColors.fill(null);
    currentDomAlg = null; 
    currentDomSetup = null;
    stopPlay();
    const cb = document.getElementById('command-box');
    if (cb) cb.value = "";
    render();
}

export function updateStickerColor(idx, colorId) { 
    if (idx >= 0 && idx < 54) {
        stickerColors[idx] = colorId; 
    }
}

export function setAllStickers(colorId) { 
    stickerColors.fill(colorId); 
}

/**
 * ハッシュからのデータ読み込み
 */
export function loadFromHash(targetHash = null) {
    const hash = targetHash || window.location.hash.replace(/^#/, "");
    if (!hash) return;

    try {
        if (hash.startsWith("v5:")) {
            const decoded = atob(hash.substring(3));
            const parts = decoded.split("|");
            if (parts.length < 3) return;

            const [mask, setup, active] = parts;
            
            // マスクデータの解析 (0-6の色指定、または1(null))
            if (mask && mask.length === 54) {
                stickerColors = mask.split("").map(v => {
                    const n = parseInt(v);
                    return n === 1 && v === "1" ? null : n;
                });
            }
            setupMoves = (setup && setup !== "") ? setup.split(",") : [];
            activeMoves = (active && active !== "") ? active.split(",") : [];
        } else {
            // 旧バージョン対応（必要に応じて）
            setupMoves = [];
            activeMoves = [];
            stickerColors.fill(null);
        }

        const cb = document.getElementById('command-box');
        if (cb) cb.value = activeMoves.join(" ");
        
        const slider = document.getElementById('move-slider');
        if (slider) { 
            slider.max = activeMoves.length; 
            slider.value = 0; 
        }
        render();
    } catch (e) { 
        console.error("DEBUG: loadFromHash Error", e); 
    }
}

/**
 * 描画更新
 */
export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;
    
    // stickerFillの設定
    const fills = {};
    let hasCustom = false;
    stickerColors.forEach((cId, idx) => {
        if (cId !== null) {
            fills[idx] = colorMap[cId] || colorMap[0];
            hasCustom = true;
        }
    });

    // カスタムカラーがある場合のみ関数をセット、なければ解除
    player.stickerFill = hasCustom ? (idx) => fills[idx] || null : null;
    
    const slider = document.getElementById('move-slider');
    const hashDisp = document.getElementById('hash-display');
    
    if (slider) {
        const step = parseInt(slider.value) || 0;
        const activeStr = activeMoves.join(" ");
        const setupStr = setupMoves.join(" ");
        
        if (currentDomSetup !== setupStr) {
            player.experimentalSetupAlg = setupStr;
            currentDomSetup = setupStr;
        }
        if (currentDomAlg !== activeStr) {
            player.alg = activeStr;
            currentDomAlg = activeStr;
        }
        
        if (!isPlaying) {
            player.experimentalCurrentMoveIndex = step;
        }
        
        const counter = document.getElementById('step-counter');
        if (counter) counter.textContent = step;

        const indicator = document.getElementById('move-indicator');
        if (indicator) {
            const currentMove = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
            indicator.textContent = isPlaying ? `Playing...` : currentMove;
        }
    }
    
    // Hashの保存
    if (!isPlaying) {
        const maskStr = stickerColors.map(v => v === null ? "1" : v).join("");
        const rawData = `${maskStr}|${setupMoves.join(",")}|${activeMoves.join(",")}`;
        const hashValue = `v5:${btoa(rawData)}`;
        window.history.replaceState(null, "", "#" + hashValue);
        if (hashDisp) hashDisp.value = hashValue;
    }
}

export async function togglePlay() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    if (!player || !slider) return;
    
    if (isPlaying) {
        stopPlay();
    } else {
        isPlaying = true;
        const currentVal = parseInt(slider.value) || 0;
        if (currentVal >= activeMoves.length) {
            slider.value = 0;
            player.experimentalCurrentMoveIndex = 0;
        }
        player.play();
        const syncLoop = () => {
            if (!isPlaying) return;
            const pIndex = player.experimentalCurrentMoveIndex;
            if (slider.value != pIndex) {
                slider.value = pIndex;
                const counter = document.getElementById('step-counter');
                if (counter) counter.textContent = pIndex;
            }
            if (pIndex >= activeMoves.length) {
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
    if (player) { player.pause(); }
    isPlaying = false;
    render();
}

export function handleScramble() {
    stopPlay();
    const faces=['U','D','L','R','F','B'], mods=['',"'",'2'];
    activeMoves = Array.from({length:20},()=>faces[Math.floor(Math.random()*6)]+mods[Math.floor(Math.random()*3)]);
    updateSetupFromActive();
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = 0; }
    currentDomAlg = "__RESET__";
    render();
}

function updateSetupFromActive() {
    setupMoves = [...activeMoves].reverse().map(m => {
        if (!m) return "";
        if (m.endsWith("2")) return m;
        return m.endsWith("'") ? m.slice(0, -1) : m + "'";
    }).filter(m => m !== "");
}

export function addMove(move) {
    if (!move) return;
    stopPlay();
    activeMoves.push(move);
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.max = activeMoves.length;
        slider.value = activeMoves.length; // 最後のステップへ
    }
    render();
}

export function applySetup() {
    stopPlay();
    const cb = document.getElementById('command-box');
    if (!cb) return;
    const val = cb.value.trim();
    if (!val) {
        activeMoves = [];
    } else {
        activeMoves = val.split(/\s+/).filter(m => m.length > 0);
    }
    updateSetupFromActive();
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = 0; }
    currentDomAlg = "__FORCE__";
    render();
}