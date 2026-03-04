import * as Core from './cube-core.js';

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.addEventListener('pointerdown', (e) => {
        if (!document.getElementById('mode-paint').classList.contains('bg-emerald-500')) return;
        const idx = e.stickerIndex;
        if (idx === undefined) return;

        Core.updateStickerState(idx, Core.stickerStates[idx] ? 0 : 1);
        Core.render();
    });

    // Orbitボタン群のイベント接続
    const binds = { 'orbit-full': 'full', 'orbit-gray': 'gray', 'orbit-cc': 'cc' };
    Object.entries(binds).forEach(([id, type]) => {
        const el = document.getElementById(id);
        if (el) el.onclick = () => applyOrbit(type);
    });
}

export function applyOrbit(type) {
    if (type === 'full') Core.setAllStickers(1);
    else if (type === 'gray') Core.setAllStickers(0);
    else if (type === 'cc') {
        Core.setAllStickers(0);
        // エッジとセンターを表示
        [1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43,46,48,50,52,4,13,22,31,40,49]
            .forEach(i => Core.updateStickerState(i, 1));
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const paintPanel = document.getElementById('paint-panel');
    const moveGrid = document.getElementById('move-grid');
    const tabWrapper = document.querySelector('.flex.gap-1.mb-2'); // タブボタンの親

    // UIの切り替え
    if (paintPanel) paintPanel.style.display = isPaint ? 'flex' : 'none';
    if (moveGrid) moveGrid.style.display = isPaint ? 'none' : 'grid';
    if (tabWrapper) tabWrapper.style.display = isPaint ? 'none' : 'flex';

    // ボタンの色
    document.getElementById('mode-paint').className = isPaint 
        ? "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white"
        : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
    
    document.getElementById('mode-rotate').className = !isPaint 
        ? "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white"
        : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
    
    applyOrbit(isPaint ? 'gray' : 'full');
}