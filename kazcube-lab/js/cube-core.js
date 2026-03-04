export const JS_VERSION = "v1.8.8";

export let setupMoves = [];
export let activeMoves = [];
export let stickerStates = Array(54).fill(1); 

export function updateStickerState(idx, state) {
    stickerStates[idx] = state;
}

export function setAllStickers(state) {
    stickerStates.fill(state);
}

function generateOrbitMask() {
    const getMask = (indices) => indices.map(i => stickerStates[i] ? '-' : 'I').join('');
    // 標準的な3x3x3 Orbit配列 (0-11 edges, 0-7 corners, 0-5 centers)
    const e = Array.from({length:12}, (_,i)=>i);
    const c = Array.from({length:8}, (_,i)=>i);
    const ct = Array.from({length:6}, (_,i)=>i);
    return `EDGES:${getMask(e)},CORNERS:${getMask(c)},CENTERS:${getMask(ct)}`;
}

export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    const slider = document.getElementById('move-slider');
    const step = parseInt(slider?.value || 0);
    player.alg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");

    if (document.getElementById('step-counter')) 
        document.getElementById('step-counter').textContent = step;
    if (document.getElementById('move-indicator'))
        document.getElementById('move-indicator').textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
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