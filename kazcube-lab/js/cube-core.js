export let setupMoves = [];
export let activeMoves = [];

export const setSetupMoves = (m) => setupMoves = m;
export const setActiveMoves = (m) => activeMoves = m;

export function updateView() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    const step = parseInt(slider.value) || 0;
    
    const fullAlg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");
    if (player) player.alg = fullAlg;
    
    // イベントを発火させて他モジュール（Analyzer等）に通知
    window.dispatchEvent(new CustomEvent('cubeUpdate', { detail: { step } }));
}

export function handleScramble() {
    setSetupMoves([]);
    const faces = ['U','D','L','R','F','B'], mods = ['', "'", '2'];
    const newMoves = Array.from({length:20}, () => faces[Math.floor(Math.random()*6)] + mods[Math.floor(Math.random()*3)]);
    setActiveMoves(newMoves);
    
    const slider = document.getElementById('move-slider');
    slider.max = activeMoves.length;
    slider.value = activeMoves.length;
    document.getElementById('command-box').value = activeMoves.join(" ");
    updateView();
}