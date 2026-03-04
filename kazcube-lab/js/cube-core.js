// js/cube-core.js
export let setupMoves = [];
export let activeMoves = [];

export function getCurrentAlgString() {
    const slider = document.getElementById('move-slider');
    const step = slider ? parseInt(slider.value) : 0;
    return [...setupMoves, ...activeMoves.slice(0, step)].join(" ");
}

export function render() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    if (!player || !slider) return;

    const step = parseInt(slider.value) || 0;
    player.alg = getCurrentAlgString();
    
    document.getElementById('step-counter').textContent = step;
    document.getElementById('move-indicator').textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
}

export function applySetup() {
    const val = document.getElementById('command-box').value.trim();
    if (!val) return;
    
    const movesArr = val.split(/\s+/).filter(m => m.length > 0);
    // 逆手順を作成してセットアップに格納
    setupMoves = [...movesArr].reverse().map(m => 
        m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0, -1) : m + "'")
    );
    activeMoves = movesArr;
    
    const slider = document.getElementById('move-slider');
    slider.max = activeMoves.length;
    slider.value = activeMoves.length;
    render();
}

export function handleScramble() {
    setupMoves = [];
    const faces = ['U','D','L','R','F','B'], mods = ['', "'", '2'];
    activeMoves = Array.from({length:20}, () => faces[Math.floor(Math.random()*6)] + mods[Math.floor(Math.random()*3)]);
    
    document.getElementById('command-box').value = activeMoves.join(" ");
    const slider = document.getElementById('move-slider');
    slider.max = activeMoves.length;
    slider.value = activeMoves.length;
    render();
}