// js/paint-tool.js

export const orbitMasks = {
    gray: "EDGES:IIIIIIIIIIII,CORNERS:IIIIIIII,CENTERS:IIIIII",
    cc: "EDGES:IIIIIIIIIIII,CORNERS:--------,CENTERS:------",
    full: "EDGES:------------,CORNERS:--------,CENTERS:------"
};

export let currentMask = 'full';

export function applyOrbit(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    currentMask = type;
    const mask = orbitMasks[type] || orbitMasks.full;
    
    // 成功した「属性+プロパティ+再描画」の3段構え
    player.setAttribute('experimental-stickering-mask-orbits', mask);
    player.experimentalStickeringMaskOrbits = mask;

    const tmp = player.alg;
    player.alg = "";
    setTimeout(() => {
        player.alg = tmp;
    }, 10);
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    document.getElementById('rotate-panel').classList.toggle('hidden', isPaint);
    document.getElementById('paint-panel').classList.toggle('hidden', !isPaint);
    
    applyOrbit(isPaint ? 'gray' : 'full');
}