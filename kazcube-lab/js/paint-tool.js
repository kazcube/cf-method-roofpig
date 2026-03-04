import * as Core from './cube-core.js';

const ORBIT_INDICES = {
    CENTERS: [4, 13, 22, 31, 40, 49],
    CORNERS: [0, 2, 6, 8, 9, 11, 15, 17, 18, 20, 24, 26, 27, 29, 33, 35, 36, 38, 42, 44, 45, 47, 51, 53],
    EDGES: [1, 3, 5, 7, 10, 12, 14, 16, 19, 21, 23, 25, 28, 30, 32, 34, 37, 39, 41, 43, 46, 48, 50, 52]
};

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.addEventListener('pointerdown', (e) => {
        const paintBtn = document.getElementById('mode-paint');
        if (!paintBtn || !paintBtn.classList.contains('bg-emerald-500')) return;

        const idx = e.stickerIndex;
        if (idx === undefined) return;

        // 現在の状態をコピーしてトグル
        const nextSet = new Set(Core.visibleStickers);
        if (nextSet.has(idx)) {
            nextSet.delete(idx);
        } else {
            nextSet.add(idx);
        }
        
        Core.updateVisibleStickers(nextSet);
        Core.render();
    });
}

export function applyOrbit(type) {
    let nextSet;
    if (type === 'full') {
        nextSet = new Set(Array.from({length: 54}, (_, i) => i));
    } else if (type === 'gray') {
        nextSet = new Set();
    } else if (type === 'cc') {
        nextSet = new Set([...ORBIT_INDICES.EDGES, ...ORBIT_INDICES.CENTERS]);
    }
    
    if (nextSet) {
        Core.updateVisibleStickers(nextSet);
        Core.render();
    }
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const paintBtn = document.getElementById('mode-paint');
    const rotateBtn = document.getElementById('mode-rotate');

    if (isPaint) {
        if (paintBtn) paintBtn.className = "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white";
        if (rotateBtn) rotateBtn.className = "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
        applyOrbit('gray');
    } else {
        if (rotateBtn) rotateBtn.className = "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white";
        if (paintBtn) paintBtn.className = "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
        applyOrbit('full');
    }
}