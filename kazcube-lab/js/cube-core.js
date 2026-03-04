export const JS_VERSION = "v1.9.9";

export let setupMoves = [];
export let activeMoves = [];
export let stickerStates = Array(54).fill(1); 

export function resetAll() {
    setupMoves = [];
    activeMoves = [];
    stickerStates.fill(1);
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
        
        const cmdBox = document.getElementById('command-box');
        if (cmdBox && activeMoves.length > 0) cmdBox.value = activeMoves.join(" ");
    } catch (e) {
        console.error("Hash recovery failed", e);
    }
}

function generateOrbitMask() {
    const getMask = (indices) => indices.map(i => stickerStates[i] ? '-' : 'I').join('');
    const e = [1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43,46,48,50,52].slice(0, 12);
    const c = [0,2,6,8,9,11,15,17,18,20,24,26,27,29,33,35,36,38,42,44,45,47,51,53].slice(0, 8);
    const ct = [4,13,22,31,40,49];
    return `EDGES:${getMask(e)},CORNERS:${getMask(c)},CENTERS:${getMask(ct)}`;
}

export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    // --- 1. マスク処理（最優先） ---
    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    // --- 2. 手順・スライダー処理 ---
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.max = activeMoves.length;
        // 手順がない場合は0として扱う
        const step = (activeMoves.length > 0) ? parseInt(slider.value) : 0;
        player.alg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");
        
        const counter = document.getElementById('step-counter');
        if (counter) counter.textContent = step;
        
        const indicator = document.getElementById('move-indicator');
        if (indicator) indicator.textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
    }

    // --- 3. ハッシュ更新 ---
    const rawData = `${stickerStates.join("")}|${activeMoves.join(",")}`;
    window.history.replaceState(null, "", "#" + `v5:${btoa(rawData)}`);
}

export function applySetup() {
    let val = document.getElementById('command-box').value.trim();
    if (!val) return;
    const movesArr = val.split(/\s+/).filter(m => m.length > 0);
    setupMoves = [...movesArr].reverse().map(m => m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0, -1) : m + "'"));
    activeMoves = movesArr;
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = activeMoves.length; }
    render();
}

export function handleScramble() {
    setupMoves = [];
    const faces=['U','D','L','R','F','B'], mods=['',"'",'2'];
    activeMoves = Array.from({length:20},()=>faces[Math.floor(Math.random()*6)]+mods[Math.floor(Math.random()*3)]);
    const cmdBox = document.getElementById('command-box');
    if (cmdBox) cmdBox.value = activeMoves.join(" ");
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = activeMoves.length; }
    render();
}