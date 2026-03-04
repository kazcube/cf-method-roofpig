import * as Core from './cube-core.js';

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.addEventListener('pointerdown', (e) => {
        if (!document.getElementById('mode-paint').classList.contains('bg-emerald-500')) return;
        const idx = e.stickerIndex;
        if (idx === undefined) return;

        // 状態反転 (1 <-> 0)
        const currentState = Core.stickerStates[idx];
        Core.updateStickerState(idx, currentState ? 0 : 1);
        Core.render();
    });

    // ボタンにイベント再接続
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
        // エッジ(12本)とセンター(6個)を表示
        [1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43,46,48,50,52,4,13,22,31,40,49]
            .forEach(i => Core.updateStickerState(i, 1));
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const panel = document.getElementById('paint-panel');
    if (panel) panel.style.display = isPaint ? 'flex' : 'none';

    document.getElementById('mode-paint').classList.toggle('bg-emerald-500', isPaint);
    document.getElementById('mode-rotate').classList.toggle('bg-emerald-500', !isPaint);
    
    applyOrbit(isPaint ? 'gray' : 'full');
}