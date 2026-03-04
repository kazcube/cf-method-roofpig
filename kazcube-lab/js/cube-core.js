export const JS_VERSION = "v1.8.7";

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
    
    // v0.5.44 仕様に準拠したパーツ分割
    const edgeIdx = [1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43,46,48,50,52].slice(0, 12);
    const cornerIdx = [0,2,6,8,9,11,15,17,18,20,24,26,27,29,33,35,36,38,42,44,45,47,51,53].slice(0, 8);
    const centerIdx = [4,13,22,31,40,49];

    return `EDGES:${getMask(edgeIdx)},CORNERS:${getMask(cornerIdx)},CENTERS:${getMask(centerIdx)}`;
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

// applySetup, handleScramble 等は v1.8.6 と同様
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