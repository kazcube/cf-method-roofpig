// js/paint-tool.js
import * as Core from './cube-core.js';

export const orbitMasks = {
    gray: "EDGES:IIIIIIIIIIII,CORNERS:IIIIIIII,CENTERS:IIIIII",
    cc: "EDGES:IIIIIIIIIIII,CORNERS:--------,CENTERS:------",
    full: "EDGES:------------,CORNERS:--------,CENTERS:------"
};

export function applyOrbit(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    const mask = orbitMasks[type] || orbitMasks.full;
    player.experimentalStickeringMaskOrbits = mask;

    // 再描画を強制
    const currentAlg = Core.getCurrentAlgString();
    player.alg = ""; 
    setTimeout(() => {
        player.alg = currentAlg;
    }, 15);
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const rotatePanel = document.getElementById('rotate-panel');
    const paintPanel = document.getElementById('paint-panel');
    
    if (rotatePanel) rotatePanel.classList.toggle('hidden', isPaint);
    if (paintPanel) paintPanel.classList.toggle('hidden', !isPaint);
    
    applyOrbit(isPaint ? 'gray' : 'full');
}