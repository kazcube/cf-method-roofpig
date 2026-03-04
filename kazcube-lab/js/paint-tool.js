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

    // Coreから最新のアルゴリズム文字列を取得して再適用
    const currentAlg = Core.getCurrentAlgString();
    player.alg = "";
    setTimeout(() => {
        player.alg = currentAlg;
    }, 10);
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    document.getElementById('rotate-panel').classList.toggle('hidden', isPaint);
    document.getElementById('paint-panel').classList.toggle('hidden', !isPaint);
    applyOrbit(isPaint ? 'gray' : 'full');
}