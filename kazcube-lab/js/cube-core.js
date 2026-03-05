/**
 * KAZCUBE Lab Core Module
 * v2.0.43: Enhanced stickering with custom colors via stickerFill.
 */

console.log("LOG: cube-core.js loaded. Version: v2.0.43");

export const JS_VERSION = "v2.0.43";
export let setupMoves = [];
export let activeMoves = [];

// スティッカーの色状態 (0: グレー, 1-6: 各色)
// 初期状態はnull（標準配色を使用）
export let stickerColors = Array(54).fill(null);
export let isPlaying = false;

let currentDomAlg = "";
let currentDomSetup = "";

const colorMap = {
    0: "#4b5563", // Gray
    1: "#ffffff", // White
    2: "#ffff00", // Yellow
    3: "#00ff00", // Green
    4: "#0000ff", // Blue
    5: "#ff0000", // Red
    6: "#ffa500"  // Orange
};

export function resetAll() {
    setupMoves = []; activeMoves = []; stickerColors.fill(null);
    currentDomAlg = null; currentDomSetup = null;
    stopPlay();
    const cb = document.getElementById('command-box');
    if (cb) cb.value = "";
    render();
}

export function updateStickerColor(idx, colorId) { 
    stickerColors[idx] = colorId; 
}

export function setAllStickers(colorId) { 
    stickerColors.fill(colorId); 
}

export function loadFromHash(targetHash = null) {
    const hash = targetHash || window.location.hash.replace(/^#/, "");
    if (!hash || !hash.startsWith("v5:")) return;
    try {
        const decoded = atob(hash.substring(3));
        const [mask, setup, active] = decoded.split("|");
        // 下位互換性のため、maskの長さをチェック
        if (mask && mask.length === 54) {
            stickerColors = mask.split("").map(v => v === "1" ? null : 0);
        }
        setupMoves = (setup && setup !== "") ? setup.split(",") : [];
        activeMoves = (active && active !== "") ? active.split(",") : [];
        const cb = document.getElementById('command-box');
        if (cb) cb.value = activeMoves.join(" ");
        const slider = document.getElementById('move-slider');
        if (slider) { slider.max = activeMoves.length; slider.value = 0; }
        render();
    } catch (e) { console.error("Import Error", e); }
}

export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;
    
    // カスタムカラーの適用 (stickerFillプロパティを使用)
    const fills = {};
    stickerColors.forEach((cId, idx) => {
        if (cId !== null) {
            fills[idx] = colorMap[cId];
        }
    });
    player.stickerFill = Object.keys(fills).length > 0 ? (idx) => fills[idx] || null : null;
    
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
        
        document.getElementById('step-counter').textContent = step;
        const indicator = document.getElementById('move-indicator');
        if (indicator) {
            const currentMove = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
            indicator.textContent = isPlaying ? `Playing...` : currentMove;
        }
    }
    
    // Hash保存（色の状態を簡易的に保存）
    const maskStr = stickerColors.map(v => v === null ? "1" : v).join("");
    const rawData = `${maskStr}|${setupMoves.join(",")}|${activeMoves.join(",")}`;
    const hashValue = `v5:${btoa(rawData)}`;
    if (!isPlaying) {
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
        if (parseInt(slider.value) >= activeMoves.length) {
            slider.value = 0;
            player.experimentalCurrentMoveIndex = 0;
        }
        player.play();
        const syncLoop = () => {
            if (!isPlaying) return;
            const pIndex = player.experimentalCurrentMoveIndex;
            if (slider.value != pIndex) {
                slider.value = pIndex;
                document.getElementById('step-counter').textContent = pIndex;
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
        if (m.endsWith("2")) return m;
        return m.endsWith("'") ? m.slice(0, -1) : m + "'";
    });
}

export function addMove(move) {
    stopPlay();
    activeMoves.push(move);
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.max = activeMoves.length;
        slider.value = activeMoves.length - 1; 
    }
    render();
}

export function applySetup() {
    stopPlay();
    const cb = document.getElementById('command-box');
    if (!cb) return;
    const val = cb.value.trim();
    if (!val) return;
    activeMoves = val.split(/\s+/).filter(m => m.length > 0);
    updateSetupFromActive();
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = 0; }
    currentDomAlg = "__FORCE__";
    render();
}