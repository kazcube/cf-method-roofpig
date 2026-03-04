import * as Core from './cube-core.js?v=2.0.1';

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;
    player.addEventListener('pointerdown', (e) => {
        const pb = document.getElementById('mode-paint');
        if (!pb || !pb.classList.contains('bg-emerald-500')) return;
        const idx = e.stickerIndex;
        if (idx !== undefined) {
            Core.updateStickerState(idx, Core.stickerStates[idx] ? 0 : 1);
            Core.render();
        }
    });
}

export function applyOrbit(type) {
    if (type === 'full') Core.setAllStickers(1);
    else if (type === 'gray') Core.setAllStickers(0);
    else if (type === 'cc') {
        Core.setAllStickers(0);
        [0,2,4,6,8, 9,11,13,15,17, 18,20,22,24,26, 27,29,31,33,35, 36,38,40,42,44, 45,47,49,51,53].forEach(i => Core.updateStickerState(i, 1));
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const grid = document.getElementById('move-grid-container');
    if (grid) grid.style.display = isPaint ? 'none' : 'block';

    const pb = document.getElementById('mode-paint');
    const rb = document.getElementById('mode-rotate');
    if (pb) pb.className = isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg";
    if (rb) rb.className = !isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg";
    
    let panel = document.getElementById('paint-panel');
    if (!panel && pb) {
        panel = document.createElement('div');
        panel.id = 'paint-panel';
        panel.className = "flex gap-2 ml-4 px-3 border-l border-slate-700 items-center";
        ['gray','cc','full'].forEach(k => {
            const btn = document.createElement('button');
            btn.textContent = k.toUpperCase();
            btn.className = "px-2 py-1.5 rounded text-[9px] font-black text-white bg-slate-700";
            btn.onclick = (e) => { e.stopPropagation(); applyOrbit(k); };
            panel.appendChild(btn);
        });
        pb.parentNode.appendChild(panel);
    }
    if (panel) panel.style.display = isPaint ? 'flex' : 'none';
    Core.render();
}