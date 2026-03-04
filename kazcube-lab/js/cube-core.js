export const JS_VERSION = "v1.9.8";

export let setupMoves = [];
export let activeMoves = [];
export let stickerStates = Array(54).fill(1); 

// データリセット用
export function resetAll() {
    setupMoves = [];
    activeMoves = [];
    stickerStates.fill(1);
    const cmdBox = document.getElementById('command-box');
    if (cmdBox) cmdBox.value = "";
}

export function updateStickerState(idx, state) {
    stickerStates[idx] = state;
}

export function setAllStickers(state) {
    stickerStates.fill(state);
}

export function loadFromHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.startsWith("v5:")) return;
    try {
        const decoded = atob(hash.substring(3));
        const [mask, moves] = decoded.split("|");
        if (mask && mask.length === 54) stickerStates = mask.split("").map(Number);
        if (moves) activeMoves = moves.split(",").filter(m => m !== "");
        
        // テキストボックスへの手順の書き戻し
        const cmdBox = document.getElementById('command-box');
        if (cmdBox && activeMoves.length > 0) {
            cmdBox.value = activeMoves.join(" ");
        }
    } catch (e) {
        console.error("Hash recovery failed", e);
    }
}

// ... generateOrbitMask, render, applySetup, handleScramble は v1.9.7 と同じ ...
// render内のハッシュ更新部分が正確に動くことを再確認してください
export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.max = activeMoves.length;
        const step = parseInt(slider.value);
        player.alg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");
        
        const counter = document.getElementById('step-counter');
        if (counter) counter.textContent = step;
        
        const indicator = document.getElementById('move-indicator');
        if (indicator) indicator.textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
    }

    const rawData = `${stickerStates.join("")}|${activeMoves.join(",")}`;
    const hashValue = btoa(rawData);
    window.history.replaceState(null, "", "#" + `v5:${hashValue}`);
}