/**
 * KAZCUBE Lab Core Module
 * v2.0.45: Fixed stickerFill logic for Gray/Full buttons.
 */

console.log("LOG: cube-core.js loaded. Version: v2.0.45");

export const JS_VERSION = "v2.0.45";
export let setupMoves = [];
export let activeMoves = [];
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
    if (idx >= 0 && idx < 54) stickerColors[idx] = colorId; 
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
        if (mask && mask.length === 54) {
            stickerColors = mask.split("").map(v => v === "1" ? null : parseInt(v));
        }
        setupMoves = (setup && setup !== "") ? setup.split(",") : [];
        activeMoves = (active && active !== "") ? active.split(",") : [];
        const cb = document.getElementById('command-box');
        if (cb) cb.value = activeMoves.join(" ");
        render();
    } catch (e) { console.error("Hash Load Error", e); }
}

export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    // Apply custom colors
    const fills = {};
    let hasCustom = false;
    stickerColors.forEach((cId, idx) => {
        if (cId !== null) {
            fills[idx] = colorMap[cId];
            hasCustom = true;
        }
    });
    // stickerFillが関数の場合、個別に色を上書きできる
    player.stickerFill = hasCustom ? (idx) => fills[idx] || null : null;

    const slider = document.getElementById('move-slider');
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
        if (!isPlaying) player.experimentalCurrentMoveIndex = step;
        
        document.getElementById('step-counter').textContent = step;
        const indicator = document.getElementById('move-indicator');
        if (indicator) {
            indicator.textContent = isPlaying ? "Playing..." : (step > 0 ? activeMoves[step-1] : "---");
        }
    }

    // Save Hash
    if (!isPlaying) {
        const maskStr = stickerColors.map(v => v === null ? "1" : v).join("");
        const rawData = `${maskStr}|${setupMoves.join(",")}|${activeMoves.join(",")}`;
        const hashValue = `v5:${btoa(rawData)}`;
        window.history.replaceState(null, "", "#" + hashValue);
        const hd = document.getElementById('hash-display');
        if (hd) hd.value = hashValue;
    }
}

export async function togglePlay() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    if (!player || !slider) return;
    if (isPlaying) { stopPlay(); } 
    else {
        isPlaying = true;
        if (parseInt(slider.value) >= activeMoves.length) {
            slider.value = 0;
            player.experimentalCurrentMoveIndex = 0;
        }
        player.play();
        const sync = () => {
            if (!isPlaying) return;
            slider.value = player.experimentalCurrentMoveIndex;
            document.getElementById('step-counter').textContent = slider.value;
            if (parseInt(slider.value) >= activeMoves.length) stopPlay();
            else requestAnimationFrame(sync);
        };
        requestAnimationFrame(sync);
    }
}

export function stopPlay() {
    const player = document.getElementById('main-cube');
    if (player) player.pause();
    isPlaying = false;
    render();
}

export function handleScramble() {
    stopPlay();
    const faces=['U','D','L','R','F','B'], mods=['',"'",'2'];
    activeMoves = Array.from({length:20},()=>faces[Math.floor(Math.random()*6)]+mods[Math.floor(Math.random()*3)]);
    setupMoves = [...activeMoves].reverse().map(m => m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0,-1) : m+"'"));
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = 0; }
    currentDomAlg = "__RESET__";
    render();
}

export function addMove(move) {
    stopPlay();
    activeMoves.push(move);
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = activeMoves.length; }
    render();
}

export function applySetup() {
    stopPlay();
    const val = document.getElementById('command-box').value.trim();
    activeMoves = val ? val.split(/\s+/) : [];
    setupMoves = [...activeMoves].reverse().map(m => m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0,-1) : m+"'"));
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = 0; }
    currentDomAlg = "__FORCE__";
    render();
}