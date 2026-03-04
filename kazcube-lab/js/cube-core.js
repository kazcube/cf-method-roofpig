export const JS_VERSION = "v1.9.7";

export let setupMoves = [];
export let activeMoves = [];
export let stickerStates = Array(54).fill(1); 

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
    const display = document.getElementById('hash-display');
    if (display) display.value = `v5:${hashValue.substring(0, 16)}...`;
    window.history.replaceState(null, "", "#" + `v5:${hashValue}`);
}

export function applySetup() {
    let val = document.getElementById('command-box').value.trim().replace(/^#\s*/, "");
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
    document.getElementById('command-box').value = activeMoves.join(" ");
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = activeMoves.length; }
    render();
}