import * as Core from './cube-core.js';

export const orbitMasks = {
    gray: "EDGES:IIIIIIIIIIII,CORNERS:IIIIIIII,CENTERS:IIIIII",
    cc: "EDGES:IIIIIIIIIIII,CORNERS:--------,CENTERS:------",
    full: "EDGES:------------,CORNERS:--------,CENTERS:------"
};

export function applyOrbit(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.experimentalStickeringMaskOrbits = orbitMasks[type] || orbitMasks.full;

    const currentAlg = Core.getCurrentAlgString();
    player.alg = ""; 
    setTimeout(() => { player.alg = currentAlg; }, 15);
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const paintPanel = document.getElementById('paint-panel');
    if (paintPanel) paintPanel.classList.toggle('hidden', !isPaint);
    applyOrbit(isPaint ? 'gray' : 'full');
}