/**
 * KAZCUBE Lab Core Module
 * v2.0.47: Fixed stickering logic to avoid "undefined reading 0" error.
 */

export const JS_VERSION = "v2.0.47";
export let setupMoves = [];
export let activeMoves = [];
export let stickerMask = Array(54).fill(1); // 1: Visible, 0: Hidden
export let isPlaying = false;

let lastRenderedMask = "";

export function resetAll() {
    setupMoves = []; activeMoves = []; stickerMask.fill(1);
    stopPlay();
    const cb = document.getElementById('command-box');
    if (cb) cb.value = "";
    render(true);
}

export function updateStickerState(idx, state) { 
    if (idx >= 0 && idx < 54) stickerMask[idx] = state; 
}

export function setAllStickers(state) { 
    stickerMask.fill(state); 
}

export function loadFromHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash || !hash.startsWith("v5:")) return;
    try {
        const decoded = atob(hash.substring(3));
        const [mask, setup, active] = decoded.split("|");
        if (mask && mask.length === 54) {
            stickerMask = mask.split("").map(v => parseInt(v));
        }
        setupMoves = (setup && setup !== "") ? setup.split(",") : [];
        activeMoves = (active && active !== "") ? active.split(",") : [];
        const slider = document.getElementById('move-slider');
        if (slider) slider.max = activeMoves.length;
        render(true);
    } catch (e) { console.error("Hash Load Error", e); }
}

export function render(force = false) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    // Apply Masking Logic (Reliable Property)
    const currentMaskStr = stickerMask.join("");
    if (force || lastRenderedMask !== currentMaskStr) {
        // 'static' sticker orbits use 0-54 indexing
        const orbits = stickerMask.map(v => v === 1 ? "I" : "-").join("");
        player.experimentalStickeringMaskOrbits = `3x3x3:${orbits}`;
        lastRenderedMask = currentMaskStr;
    }

    const slider = document.getElementById('move-slider');
    const step = parseInt(slider.value) || 0;
    
    if (player.alg !== activeMoves.join(" ")) {
        player.alg = activeMoves.join(" ");
    }
    
    if (!isPlaying) {
        player.experimentalCurrentMoveIndex = step;
    }

    // Update UI Counters
    document.getElementById('step-counter').textContent = step;
    const indicator = document.getElementById('move-indicator');
    indicator.textContent = isPlaying ? "Playing..." : (step > 0 ? activeMoves[step-1] : "---");

    // Update Hash
    if (!isPlaying) {
        const rawData = `${stickerMask.join("")}|${setupMoves.join(",")}|${activeMoves.join(",")}`;
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
    
    if (isPlaying) {
        stopPlay();
    } else {
        isPlaying = true;
        if (parseInt(slider.value) >= activeMoves.length) {
            slider.value = 0;
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
    const slider = document.getElementById('move-slider');
    slider.max = activeMoves.length;
    slider.value = 0;
    render(true);
}

export function addMove(move) {
    stopPlay();
    activeMoves.push(move);
    const slider = document.getElementById('move-slider');
    slider.max = activeMoves.length;
    slider.value = activeMoves.length;
    render(true);
}

export function applySetup() {
    stopPlay();
    const val = document.getElementById('command-box').value.trim();
    activeMoves = val ? val.split(/\s+/) : [];
    const slider = document.getElementById('move-slider');
    slider.max = activeMoves.length;
    slider.value = 0;
    render(true);
}